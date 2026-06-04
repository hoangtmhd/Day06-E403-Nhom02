import os
import sys
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

# Thêm đường dẫn thư mục hiện tại để có thể import database và agent.agent
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from database import load_data, get_doctors_by_dept, book_appointment_slot, undo_appointment_slot
from agent.agent import get_chat_response

app = FastAPI(
    title="Bach Mai Care API Server",
    description="Máy chủ API hỗ trợ đặt lịch và dời lịch khám chuyên khoa Bệnh viện Bạch Mai",
    version="1.0.0"
)

# Cấu hình CORS: Cho phép truy cập từ mọi nguồn gốc (kể cả file:// của trình duyệt)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- CÁC PYDANTIC MODEL CHO REQUEST BODY ---

class ChatRequest(BaseModel):
    message: str
    history: List[Dict[str, Any]]


class BookingRequest(BaseModel):
    doctor_id: str
    date: str
    slot: str


# --- CÁC ENDPOINT API ---

@app.get("/api/doctors")
def api_get_doctors(department: Optional[str] = Query(None, description="Tên chuyên khoa cần lọc (ví dụ: 'Trung tâm Nhi khoa')")):
    """
    Tên hàm: api_get_doctors
    Mô tả: Endpoint API (GET) trả về danh sách bác sĩ cùng lịch trực thời gian thực.
           Nếu có tham số department, lọc danh sách bác sĩ theo chuyên khoa đó.
    Biến đầu vào:
        - department (Optional[str], Query Parameter): Tên chuyên khoa cần lọc.
    Cấu trúc đầu ra: list - Mảng JSON chứa danh sách các bác sĩ (dict) tương tự như doctors.json.
    Yêu cầu sử dụng: Gọi khi giao diện frontend được tải lần đầu hoặc khi người dùng thay đổi chuyên khoa được chọn.
    """
    try:
        if department:
            # Lọc theo chuyên khoa
            doctors = get_doctors_by_dept(department)
            return doctors
        else:
            # Lấy toàn bộ dữ liệu bác sĩ
            return load_data()
    except Exception as e:
        print(f"Lỗi khi lấy danh sách bác sĩ: {e}")
        raise HTTPException(status_code=500, detail="Lỗi hệ thống khi tải danh sách bác sĩ.")


@app.post("/api/chat")
def api_chat(payload: ChatRequest):
    """
    Tên hàm: api_chat
    Mô tả: Endpoint API (POST) tiếp nhận tin nhắn mới và lịch sử trò chuyện từ người dùng,
           chuyển ngữ cảnh này sang AI Agent (Gemini 2.5 Flash) để phân tích và trả về câu trả lời.
    Biến đầu vào:
        - payload (ChatRequest): Đối tượng chứa "message" (tin nhắn hiện tại) và "history" (lịch sử trò chuyện).
    Cấu trúc đầu ra: dict - Đối tượng JSON chứa:
                     - "reply" (str): Phản hồi tự nhiên của trợ lý ảo Bạch Mai Care.
                     - "booking_intent" (dict/None): Ý định đặt lịch được trích xuất (nếu có).
    Yêu cầu sử dụng: Gọi khi người dùng nhấn nút gửi tin nhắn hoặc ấn Enter trên khung chat AI.
    """
    try:
        response = get_chat_response(payload.history, payload.message)
        return response
    except Exception as e:
        print(f"Lỗi khi tương tác với AI Agent: {e}")
        raise HTTPException(status_code=500, detail="Không thể kết nối đến trợ lý AI vào lúc này.")


@app.post("/api/confirm-booking")
def api_confirm_booking(payload: BookingRequest):
    """
    Tên hàm: api_confirm_booking
    Mô tả: Endpoint API (POST) thực hiện xác nhận đặt hoặc dời lịch khám thời gian thực.
           Tiến hành kiểm tra slot và đánh dấu slot đó thành bận trong cơ sở dữ liệu.
    Biến đầu vào:
        - payload (BookingRequest): Đối tượng chứa "doctor_id" (ID bác sĩ), "date" (Ngày khám YYYY-MM-DD), và "slot" (Giờ khám HH:MM).
    Cấu trúc đầu ra: dict - Trạng thái xử lý đặt lịch dưới dạng:
                     - "success" (bool): True nếu đặt lịch thành công, ngược lại là False.
                     - "message" (str): Thông báo trạng thái đặt lịch chi tiết.
    Yêu cầu sử dụng: Gọi khi người dùng nhấn nút "Xác nhận đặt lịch" thủ công trên thẻ đề xuất trong khung chat.
    """
    try:
        result = book_appointment_slot(payload.doctor_id, payload.date, payload.slot)
        return result
    except Exception as e:
        print(f"Lỗi khi thực hiện đặt lịch: {e}")
        raise HTTPException(status_code=500, detail="Lỗi hệ thống khi lưu lịch hẹn.")


@app.post("/api/undo-booking")
def api_undo_booking(payload: BookingRequest):
    """
    Tên hàm: api_undo_booking
    Mô tả: Endpoint API (POST) thực hiện hoàn tác (hủy dời) lịch khám vừa đặt.
           Thêm lại slot giờ khám đã chọn vào danh sách trống và khôi phục trạng thái khả dụng.
    Biến đầu vào:
        - payload (BookingRequest): Đối tượng chứa "doctor_id" (ID bác sĩ), "date" (Ngày khám YYYY-MM-DD), và "slot" (Giờ khám HH:MM).
    Cấu trúc đầu ra: dict - Trạng thái xử lý hoàn tác dưới dạng:
                     - "success" (bool): True nếu khôi phục thành công, ngược lại là False.
                     - "message" (str): Thông báo chi tiết.
    Yêu cầu sử dụng: Gọi khi người dùng nhấn nút "Hoàn tác dời lịch" trên thẻ thành công màu xanh lá trong khung chat.
    """
    try:
        result = undo_appointment_slot(payload.doctor_id, payload.date, payload.slot)
        return result
    except Exception as e:
        print(f"Lỗi khi thực hiện hoàn tác lịch hẹn: {e}")
        raise HTTPException(status_code=500, detail="Lỗi hệ thống khi hoàn tác lịch hẹn.")
