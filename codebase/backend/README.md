# Bạch Mai Care - Backend AI API Documentation

Thư mục này chứa mã nguồn Backend và mô phỏng tương tác (CLI Chatbot) của hệ thống Trợ lý AI.

---

## 🛠️ Tài liệu chi tiết các Hàm (API Documentation)

### 1. Dịch vụ Cơ sở dữ liệu (`database.py`)

*   **`load_data() -> list`**
    - **Mô tả:** Đọc và tải danh sách bác sĩ từ file `doctors.json` tại thư mục database của codebase.
    - **Đầu vào:** Không có.
    - **Đầu ra:** `list` chứa thông tin danh sách các bác sĩ (dict).

*   **`get_doctors_by_dept(department: str) -> list`**
    - **Mô tả:** Lọc danh sách bác sĩ theo tên chuyên khoa (không phân biệt hoa thường).
    - **Đầu vào:** `department` (str) - Tên khoa cần lọc (ví dụ: `"Tim mạch"`).
    - **Đầu ra:** `list` chứa danh sách bác sĩ cùng khoa.

*   **`find_alternative_slots(doctor_name: str) -> list`**
    - **Mô tả:** Tìm kiếm các ngày và khung giờ còn trống (`available`) của một bác sĩ.
    - **Đầu vào:** `doctor_name` (str) - Tên bác sĩ (ví dụ: `"PGS.TS. Nguyễn Văn A"`).
    - **Đầu ra:** `list` chứa các ngày và khung giờ khám trống.

*   **`find_equivalent_doctors(doctor_name: str, date: str) -> list`**
    - **Mô tả:** Tìm kiếm bác sĩ cùng khoa, cùng chức danh (PGS, TS) đang có lịch khám trống vào ngày mong muốn.
    - **Đầu vào:** `doctor_name` (str) - Tên bác sĩ gốc bận, `date` (str) - Ngày đổi (YYYY-MM-DD).
    - **Đầu ra:** `list` danh sách bác sĩ tương đương kèm slot trống.

*   **`book_appointment_slot(doctor_id: str, date: str, slot: str) -> dict`**
    - **Mô tả:** Đổi lịch khám bằng cách cập nhật slot trống thành bận (`busy`) trong cơ sở dữ liệu thời gian thực.
    - **Đầu vào:** `doctor_id` (str), `date` (str), `slot` (str).
    - **Đầu ra:** `dict` báo trạng thái giao dịch: `{"success": True/False, "message": "..."}`.

---

### 2. Dịch vụ AI Agent (`agent/agent.py`)

*   **`get_chat_response(history: list, user_message: str) -> dict`**
    - **Mô tả:** Gửi tin nhắn và lịch sử trò chuyện kèm Context lịch khám thực tế lên Gemini 1.5 Flash. Yêu cầu đầu ra bắt buộc dạng JSON để phân tích cú pháp.
    - **Đầu vào:** 
      - `history` (list): Lịch sử chat trước đó.
      - `user_message` (str): Tin nhắn hiện tại của người dùng.
    - **Đầu ra:** `dict` có cấu trúc:
      ```json
      {
        "reply": "Câu trả lời gửi bệnh nhân",
        "booking_intent": { "doctor_id": "...", "date": "...", "slot": "..." } // hoặc null
      }
      ```
