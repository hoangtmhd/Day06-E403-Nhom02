import os
import json
import sys
from dotenv import load_dotenv

# Thêm thư mục backend vào sys.path để import các module tương đối
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(BACKEND_DIR)

from database import load_data, book_appointment_slot, cancel_appointment_slot, log_feedback
from agent.agent import get_chat_response

# Load file .env
load_dotenv()


def print_database_status():
    """
    In trạng thái hiện tại của cơ sở dữ liệu bác sĩ để kiểm tra trực quan.
    """
    print("\n" + "="*50)
    print("📊 TRẠNG THÁI LỊCH KHÁM HIỆN TẠI (DATABASE):")
    print("="*50)
    doctors = load_data()
    for doc in doctors:
        print(f"\n👨‍⚕️ {doc['name']} - Chức danh: {doc['title']} ({doc['department']})")
        for sched in doc.get("schedule", []):
            status_icon = "🟢" if sched["status"] == "available" else "🔴"
            slots_str = ", ".join(sched.get("slots", [])) if sched.get("slots") else "Không có slot"
            reason_str = f" ({sched['reason']})" if "reason" in sched else ""
            print(f"  {status_icon} Ngày {sched['date']}: {sched['status'].upper()}{reason_str} | Khung giờ trống: [{slots_str}]")
    print("="*50 + "\n")


def main():
    print("==================================================")
    print("🏥 BẠCH MAI CARE - TRỢ LÝ AI TƯ VẤN ĐỔI LỊCH KHÁM")
    print("==================================================")
    print("Các lệnh hỗ trợ:")
    print("  /status : Xem trạng thái cơ sở dữ liệu lịch khám")
    print("  /reset  : Làm mới lịch sử cuộc trò chuyện")
    print("  /undo   : Hoàn tác lịch đặt gần nhất")
    print("  /exit   : Thoát chương trình")
    print("==================================================")

    # Kiểm tra API Key
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("⚠️ CẢNH BÁO: Chưa tìm thấy GEMINI_API_KEY trong file .env!")
        print("Hãy tạo file .env trong thư mục codebase/backend và điền: GEMINI_API_KEY=your_key")
        user_key = input("Hoặc nhập trực tiếp GEMINI_API_KEY tại đây (ấn Enter để bỏ qua): ").strip()
        if user_key:
            os.environ["GEMINI_API_KEY"] = user_key
            api_key = user_key
        else:
            print("Chương trình có thể không hoạt động nếu không có API Key.")

    history = []
    # Lưu booking gần nhất để hỗ trợ Undo (TC-CR-02)
    last_booking = None
    # Thông tin lịch hẹn gốc bị hủy (phải khớp với appointment_context trong agent.py)
    ORIGINAL_APPOINTMENT = {"doctor_id": "doc_nhi_003", "date": "2026-06-05"}

    print_database_status()

    while True:
        try:
            user_input = input("\n👤 Bệnh nhân: ").strip()
            if not user_input:
                continue

            # Xử lý các lệnh hệ thống
            if user_input.lower() == "/exit":
                print("Tạm biệt! Hẹn gặp lại quý khách.")
                break
            elif user_input.lower() == "/status":
                print_database_status()
                continue
            elif user_input.lower() == "/reset":
                history = []
                last_booking = None
                print("🧹 Đã làm sạch lịch sử cuộc trò chuyện.")
                continue
            elif user_input.lower() == "/undo":
                if not last_booking:
                    print("⚠️ Không có lịch đặt gần nhất để hoàn tác.")
                    continue
                undo_doc_id = last_booking["doctor_id"]
                undo_date = last_booking["date"]
                undo_slot = last_booking["slot"]
                print(f"↩️ Đang hoàn tác lịch khám {undo_slot} ngày {undo_date} của bác sĩ {undo_doc_id}...")
                undo_result = cancel_appointment_slot(undo_doc_id, undo_date, undo_slot)
                if undo_result["success"]:
                    print(f"✅ HOÀN TÁC THÀNH CÔNG: {undo_result['message']}")
                    log_feedback(
                        original_doctor_id=ORIGINAL_APPOINTMENT["doctor_id"],
                        original_date=ORIGINAL_APPOINTMENT["date"],
                        suggested_doctor_id=undo_doc_id,
                        suggested_date=undo_date,
                        suggested_slot=undo_slot,
                        user_action="undo",
                        actual_selected_doctor_id=None
                    )
                    history.append({"role": "user", "parts": ["[Hệ thống: Người dùng đã hoàn tác lịch đặt vừa rồi.]"] })
                    history.append({"role": "model", "parts": [json.dumps({"reply": "Đã hoàn tác việc đổi lịch. Bạn có muốn chọn phương án khác không?", "booking_intent": None}, ensure_ascii=False)]})
                    last_booking = None
                else:
                    print(f"❌ HOÀN TÁC THẤT BẠI: {undo_result['message']}")
                print_database_status()
                continue

            # Gọi trợ lý AI xử lý phản hồi
            print("🤖 Trợ lý AI đang xử lý...")
            result = get_chat_response(history, user_input)

            reply = result["reply"]
            booking_intent = result["booking_intent"]

            print(f"\n🤖 Trợ lý AI: {reply}")

            # Lưu vào lịch sử chat theo định dạng Gemini yêu cầu
            # AI phản hồi dạng JSON nên lưu đúng định dạng để duy trì ngữ cảnh
            history.append({"role": "user", "parts": [user_input]})
            history.append({
                "role": "model", 
                "parts": [json.dumps({"reply": reply, "booking_intent": booking_intent}, ensure_ascii=False)]
            })

            # Xử lý đặt lịch tự động nếu phát hiện intent chốt lịch từ người dùng
            if booking_intent:
                doc_id = booking_intent.get("doctor_id")
                date = booking_intent.get("date")
                slot = booking_intent.get("slot")

                print(f"\n⚡ Phát hiện hành động chốt đổi lịch:")
                print(f"   Bác sĩ ID: {doc_id} | Ngày: {date} | Khung giờ: {slot}")
                print("⌛ Đang thực hiện kiểm tra thời gian thực và đặt lịch...")

                # Thực hiện đặt lịch
                booking_result = book_appointment_slot(doc_id, date, slot)

                if booking_result["success"]:
                    print(f"✅ THÀNH CÔNG: {booking_result['message']}")
                    print("💡 Gõ /undo để hoàn tác lịch đặt vừa rồi.")
                    last_booking = {"doctor_id": doc_id, "date": date, "slot": slot}
                    log_feedback(
                        original_doctor_id=ORIGINAL_APPOINTMENT["doctor_id"],
                        original_date=ORIGINAL_APPOINTMENT["date"],
                        suggested_doctor_id=doc_id,
                        suggested_date=date,
                        suggested_slot=slot,
                        user_action="confirmed",
                        actual_selected_doctor_id=doc_id
                    )
                    history.append({
                        "role": "user",
                        "parts": [f"[Hệ thống: Đổi lịch thành công cho bác sĩ {doc_id} lúc {slot} ngày {date}]"]
                    })
                    history.append({
                        "role": "model",
                        "parts": [json.dumps({
                            "reply": f"Hệ thống đã ghi nhận đổi lịch khám thành công cho bạn sang ngày {date} lúc {slot}.",
                            "booking_intent": None
                        }, ensure_ascii=False)]
                    })
                else:
                    print(f"❌ THẤT BẠI: {booking_result['message']}")
                    print("⚠️ Kích hoạt UX Fallback: Hiển thị Thẻ kết nối Tổng đài Hotline: 1900 xxxx")
                    log_feedback(
                        original_doctor_id=ORIGINAL_APPOINTMENT["doctor_id"],
                        original_date=ORIGINAL_APPOINTMENT["date"],
                        suggested_doctor_id=doc_id,
                        suggested_date=date,
                        suggested_slot=slot,
                        user_action="failed_sync",
                        actual_selected_doctor_id=None
                    )
                    history.append({
                        "role": "user",
                        "parts": [f"[Hệ thống: Lỗi đổi lịch. Lý do: {booking_result['message']}]"]
                    })
                    history.append({
                        "role": "model",
                        "parts": [json.dumps({
                            "reply": "Thành thật xin lỗi quý khách, khung giờ này vừa bị trùng lịch đột xuất. Bạch Mai Care đã kết nối bạn tới Tổng đài viên hỗ trợ trực tiếp. Xin vui lòng liên hệ hotline 1900 xxxx.",
                            "booking_intent": None
                        }, ensure_ascii=False)]
                    })

                # In lại DB để xem thay đổi
                print_database_status()

        except KeyboardInterrupt:
            print("\nTạm biệt!")
            break
        except Exception as e:
            print(f"\n❌ Đã xảy ra lỗi: {e}")


if __name__ == "__main__":
    main()
