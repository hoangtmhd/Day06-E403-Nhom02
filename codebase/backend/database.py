import os
import json

BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
CODEBASE_DIR = os.path.dirname(BACKEND_DIR)
DB_FILE = os.path.join(CODEBASE_DIR, "database", "doctors.json")


def load_data() -> list:
    """
    Tên hàm: load_data
    Mô tả: Đọc cơ sở dữ liệu danh sách bác sĩ từ file doctors.json tại thư mục database của codebase.
           Nếu chưa tồn tại file dữ liệu, tự động khởi tạo mảng rỗng.
    Biến đầu vào: Không có.
    Cấu trúc đầu ra: list - Mảng chứa thông tin danh sách các bác sĩ và lịch khám (dict).
    Yêu cầu sử dụng: Gọi trước bất kỳ thao tác đọc/ghi dữ liệu nào từ DB Service.
    """
    if not os.path.exists(DB_FILE):
        try:
            os.makedirs(os.path.dirname(DB_FILE), exist_ok=True)
            with open(DB_FILE, "w", encoding="utf-8") as f:
                json.dump([], f)
        except Exception as e:
            print(f"Lỗi khi khởi tạo file DB: {e}")
            return []
    
    try:
        with open(DB_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"Lỗi khi đọc file cơ sở dữ liệu: {e}")
        return []


def save_data(data: list) -> bool:
    """
    Tên hàm: save_data
    Mô tả: Ghi dữ liệu danh sách bác sĩ xuống file doctors.json.
    Biến đầu vào: data (list) - Mảng chứa danh sách các bác sĩ cần ghi (dict).
    Cấu trúc đầu ra: bool - Trả về True nếu ghi thành công, ngược lại là False.
    Yêu cầu sử dụng: Dùng để đồng bộ dữ liệu sau khi cập nhật trạng thái đặt lịch.
    """
    try:
        with open(DB_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        return True
    except Exception as e:
        print(f"Lỗi khi ghi file cơ sở dữ liệu: {e}")
        return False


def get_doctors_by_dept(department: str) -> list:
    """
    Tên hàm: get_doctors_by_dept
    Mô tả: Lọc danh sách các bác sĩ thuộc một chuyên khoa cụ thể.
           Hỗ trợ cả tên chuyên khoa gốc (có dấu) và dạng slug (không dấu, cách nhau bằng gạch ngang).
    Biến đầu vào: department (str) - Tên chuyên khoa cần lọc (ví dụ: "Trung tâm Nhi khoa" hoặc "trung-tam-nhi-khoa").
    Cấu trúc đầu ra: list - Danh sách thông tin các bác sĩ thuộc khoa đó (dict).
    Yêu cầu sử dụng: Tên chuyên khoa truyền vào phải khớp với tên trong database hoặc định nghĩa slug.
    """
    data = load_data()
    
    # Bảng ánh xạ slug từ frontend sang tên chuyên khoa thực tế trong DB
    dept_slug_map = {
        "trung-tam-nhi-khoa": "Trung tâm Nhi khoa",
        "da-lieu": "Da Liễu",
        "ho-tro-sinh-san": "Hỗ trợ sinh sản",
        "di-ung": "Dị Ứng - Miễn dịch",
        "noi-co-xuong-khop": "Nội - Cơ Xương Khớp",
        "noi-chong-doc": "Nội - Chống Độc",
        "noi-ho-hap": "Nội - Hô Hấp",
        "noi-huyet-hoc": "Nội - Huyết Học"
    }
    
    mapped_dept = dept_slug_map.get(department.lower(), department)
    return [doc for doc in data if doc.get("department", "").lower() == mapped_dept.lower()]



def find_alternative_slots(doctor_name: str) -> list:
    """
    Tên hàm: find_alternative_slots
    Mô tả: Tìm kiếm tất cả các ngày và khung giờ khám còn trống (status == "available") của một bác sĩ.
    Biến đầu vào: doctor_name (str) - Tên đầy đủ của bác sĩ cần tìm lịch trống (ví dụ: "PGS.TS. Nguyễn Văn A").
    Cấu trúc đầu ra: list - Danh sách các ngày khám và các slot giờ trống dạng dict, ví dụ: [{"date": "2026-06-06", "slots": ["08:30", "10:00"]}].
    Yêu cầu sử dụng: Sử dụng để dời lịch khám sang ngày khác của chính bác sĩ đó khi lịch ban đầu bị bận đột xuất.
    """
    data = load_data()
    # Tìm kiếm bác sĩ khớp tên (không phân biệt hoa thường và khoảng trắng thừa)
    target_doc = None
    cleaned_name = doctor_name.replace(" ", "").lower()
    for doc in data:
        if doc.get("name", "").replace(" ", "").lower() == cleaned_name:
            target_doc = doc
            break
            
    if not target_doc:
        return []
        
    alternatives = []
    for sched in target_doc.get("schedule", []):
        if sched.get("status") == "available":
            alternatives.append({
                "date": sched.get("date"),
                "slots": sched.get("slots", [])
            })
    return alternatives


def find_equivalent_doctors(doctor_name: str, date: str) -> list:
    """
    Tên hàm: find_equivalent_doctors
    Mô tả: Tìm kiếm các bác sĩ thay thế trong cùng chuyên khoa, có cùng chức danh (PGS.TS, TS...)
           đang có lịch khám trống (status == "available") vào ngày chỉ định.
    Biến đầu vào: 
        - doctor_name (str): Tên bác sĩ bị bận để đối chiếu chuyên khoa và chức danh.
        - date (str): Ngày mong muốn khám (YYYY-MM-DD).
    Cấu trúc đầu ra: list - Danh sách các bác sĩ tương đương kèm các slot giờ khám trống trong ngày đó.
    Yêu cầu sử dụng: Dùng khi bác sĩ cũ bận vào ngày chỉ định và người dùng muốn đổi sang bác sĩ khác tương đương.
    """
    data = load_data()
    
    # Tìm thông tin bác sĩ gốc bị bận
    source_doc = None
    cleaned_name = doctor_name.replace(" ", "").lower()
    for doc in data:
        if doc.get("name", "").replace(" ", "").lower() == cleaned_name:
            source_doc = doc
            break
            
    if not source_doc:
        return []
        
    dept = source_doc.get("department")
    title = source_doc.get("title")
    
    equivalents = []
    for doc in data:
        # Cùng khoa, khác tên, cùng chức danh (title)
        if (doc.get("department") == dept and 
            doc.get("name") != source_doc.get("name") and 
            doc.get("title") == title):
            
            # Check lịch trống của bác sĩ này vào ngày date
            for sched in doc.get("schedule", []):
                if sched.get("date") == date and sched.get("status") == "available":
                    equivalents.append({
                        "id": doc.get("id"),
                        "name": doc.get("name"),
                        "title": doc.get("title"),
                        "role": doc.get("role"),
                        "date": date,
                        "slots": sched.get("slots", [])
                    })
    return equivalents


def _title_rank(title: str) -> int:
    """
    Quy đổi chức danh/học hàm thành thang điểm để so sánh mức tương đương hoặc thấp hơn.
    Điểm càng cao thì chức danh càng cao.
    """
    if not title:
        return 0

    normalized = title.lower().strip()
    if "giáo sư" in normalized or normalized.startswith("gs"):
        return 5
    if "phó giáo sư" in normalized or "pgs" in normalized:
        return 4
    if "tiến sĩ" in normalized or normalized.startswith("ts"):
        return 3
    if "thạc sĩ" in normalized or normalized.startswith("ths"):
        return 2
    if "bsck" in normalized or "bác sĩ" in normalized:
        return 1
    return 0


def find_lower_rank_doctors(doctor_name: str, date: str, max_results: int = 3) -> list:
    """
    Tên hàm: find_lower_rank_doctors
    Mô tả: Tìm bác sĩ thay thế trong cùng chuyên khoa, có chức danh thấp hơn bác sĩ gốc
           khi không còn bác sĩ cùng chức danh còn lịch trống.
    Biến đầu vào:
        - doctor_name (str): Tên bác sĩ gốc bị bận/hết lịch.
        - date (str): Ngày mong muốn khám (YYYY-MM-DD).
        - max_results (int): Số lượng gợi ý tối đa (mặc định 3).
    Cấu trúc đầu ra: list - Danh sách bác sĩ cùng khoa, thấp hơn chức danh, còn lịch trống trong ngày.
    Yêu cầu sử dụng: Dùng cho Low-Confidence Path theo spec khi fallback từ bác sĩ tương đương.
    """
    data = load_data()

    source_doc = None
    cleaned_name = doctor_name.replace(" ", "").lower()
    for doc in data:
        if doc.get("name", "").replace(" ", "").lower() == cleaned_name:
            source_doc = doc
            break

    if not source_doc:
        return []

    dept = source_doc.get("department")
    source_rank = _title_rank(source_doc.get("title", ""))

    candidates = []
    for doc in data:
        if doc.get("name") == source_doc.get("name"):
            continue
        if doc.get("department") != dept:
            continue

        doc_rank = _title_rank(doc.get("title", ""))
        if doc_rank >= source_rank:
            continue

        for sched in doc.get("schedule", []):
            if sched.get("date") == date and sched.get("status") == "available":
                candidates.append({
                    "id": doc.get("id"),
                    "name": doc.get("name"),
                    "title": doc.get("title"),
                    "role": doc.get("role"),
                    "date": date,
                    "slots": sched.get("slots", []),
                    "rank_score": doc_rank
                })

    # Ưu tiên bác sĩ có rank gần với bác sĩ gốc nhất (cao nhất trong nhóm thấp hơn)
    candidates.sort(key=lambda x: x.get("rank_score", 0), reverse=True)

    results = []
    for item in candidates[:max_results]:
        item.pop("rank_score", None)
        results.append(item)

    return results


def book_appointment_slot(doctor_id: str, date: str, slot: str) -> dict:
    """
    Tên hàm: book_appointment_slot
    Mô tả: Thực hiện đặt hoặc đổi lịch khám (Real-time Booking). Kiểm tra tính khả dụng của slot khám thời gian thực.
           Nếu khả dụng, cập nhật trạng thái slot đó thành "busy" trong doctors.json.
    Biến đầu vào:
        - doctor_id (str): ID duy nhất của bác sĩ (ví dụ: "doc_001").
        - date (str): Ngày đặt khám (YYYY-MM-DD).
        - slot (str): Giờ khám đặt (ví dụ: "08:30").
    Cấu trúc đầu ra: dict - Trả về trạng thái giao dịch dạng:
                     {"success": True, "message": "..."} nếu thành công,
                     {"success": False, "message": "..."} nếu slot đã bị bận (Failure Path).
    Yêu cầu sử dụng: Gọi tại bước xác nhận cuối cùng của quy trình đổi lịch khám để đồng bộ database.
    """
    data = load_data()
    
    target_doc = None
    for doc in data:
        if doc.get("id") == doctor_id:
            target_doc = doc
            break
            
    if not target_doc:
        return {"success": False, "message": "Không tìm thấy bác sĩ yêu cầu."}
        
    for sched in target_doc.get("schedule", []):
        if sched.get("date") == date:
            if sched.get("status") != "available":
                return {"success": False, "message": f"Bác sĩ bận đột xuất vào ngày {date}."}
                
            slots = sched.get("slots", [])
            if slot not in slots:
                return {"success": False, "message": f"Khung giờ {slot} không khả dụng hoặc đã bị đặt."}
                
            # Cập nhật trạng thái slot: xóa slot đã đặt
            slots.remove(slot)
            # Nếu hết slot trống trong ngày đó thì chuyển status sang busy
            if not slots:
                sched["status"] = "busy"
                sched["reason"] = "Hết lịch trống"
                
            # Lưu lại dữ liệu
            if save_data(data):
                return {
                    "success": True, 
                    "message": f"Đặt lịch thành công khám bác sĩ {target_doc.get('name')} lúc {slot} ngày {date}."
                }
            else:
                return {"success": False, "message": "Lỗi hệ thống khi lưu lịch hẹn."}
                
    return {"success": False, "message": f"Bác sĩ không có lịch trực vào ngày {date}."}


def undo_appointment_slot(doctor_id: str, date: str, slot: str) -> dict:
    """
    Tên hàm: undo_appointment_slot
    Mô tả: Hoàn tác (Undo) lịch khám đã đặt. Khôi phục slot giờ khám về danh sách trống
           và đặt lại trạng thái "available" cho ngày đó.
    Biến đầu vào:
        - doctor_id (str): ID bác sĩ cần hoàn tác.
        - date (str): Ngày khám cần hoàn tác (YYYY-MM-DD).
        - slot (str): Giờ khám cần khôi phục lại (ví dụ: "08:30").
    Cấu trúc đầu ra: dict - {"success": True/False, "message": "..."}.
    Yêu cầu sử dụng: Chỉ gọi ngay sau khi book_appointment_slot() thành công để đảm bảo tính nhất quán.
    """
    data = load_data()

    target_doc = None
    for doc in data:
        if doc.get("id") == doctor_id:
            target_doc = doc
            break

    if not target_doc:
        return {"success": False, "message": "Không tìm thấy bác sĩ yêu cầu."}

    for sched in target_doc.get("schedule", []):
        if sched.get("date") == date:
            slots = sched.get("slots", [])
            if slot not in slots:
                slots.append(slot)
                slots.sort()
            sched["status"] = "available"
            sched.pop("reason", None)

            if save_data(data):
                return {
                    "success": True,
                    "message": f"Đã hoàn tác lịch khám {slot} ngày {date} của bác sĩ {target_doc.get('name')}."
                }
            else:
                return {"success": False, "message": "Lỗi hệ thống khi hoàn tác lịch hẹn."}

    return {"success": False, "message": f"Không tìm thấy ngày {date} trong lịch của bác sĩ."}


def log_feedback(
    original_doctor_id: str,
    original_date: str,
    suggested_doctor_id: str,
    suggested_date: str,
    suggested_slot: str,
    user_action: str,
    actual_selected_doctor_id: str = None
) -> bool:
    """
    Tên hàm: log_feedback
    Mô tả: Ghi nhận tín hiệu học (Learning Signals) vào file feedback_logs.json.
           Lưu cặp dữ liệu [Lịch_AI_gợi_ý, Lịch_User_chọn_thực_tế] để tối ưu gợi ý sau này.
    Biến đầu vào:
        - original_doctor_id (str): ID bác sĩ ban đầu bị bận.
        - original_date (str): Ngày khám ban đầu bị hủy.
        - suggested_doctor_id (str): ID bác sĩ AI gợi ý.
        - suggested_date (str): Ngày AI gợi ý.
        - suggested_slot (str): Giờ AI gợi ý.
        - user_action (str): Hành động của user: "confirmed" | "failed_sync" | "undo".
        - actual_selected_doctor_id (str): ID bác sĩ user thực sự chốt (None nếu không thành công).
    Cấu trúc đầu ra: bool - True nếu ghi thành công.
    """
    import datetime

    FEEDBACK_FILE = os.path.join(CODEBASE_DIR, "database", "feedback_logs.json")

    existing_logs = []
    if os.path.exists(FEEDBACK_FILE):
        try:
            with open(FEEDBACK_FILE, "r", encoding="utf-8") as f:
                existing_logs = json.load(f)
        except Exception:
            existing_logs = []

    entry = {
        "timestamp": datetime.datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"),
        "original_request": {
            "doctor_id": original_doctor_id,
            "date": original_date
        },
        "ai_recommendation": {
            "suggested_doctor_id": suggested_doctor_id,
            "suggested_date": suggested_date,
            "suggested_slot": suggested_slot
        },
        "user_action": user_action,
        "actual_selected_doctor_id": actual_selected_doctor_id
    }

    existing_logs.append(entry)

    try:
        with open(FEEDBACK_FILE, "w", encoding="utf-8") as f:
            json.dump(existing_logs, f, ensure_ascii=False, indent=2)
        return True
    except Exception as e:
        print(f"Lỗi khi ghi feedback log: {e}")
        return False


