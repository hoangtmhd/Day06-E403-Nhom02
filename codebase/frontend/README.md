# Bạch Mai Care - Frontend Prototype

Thư mục này dành cho việc phát triển giao diện người dùng (UI) cho Trợ lý tư vấn đổi lịch Bạch Mai Care.

## 👥 Người phụ trách Frontend
- **Nguyễn Quang Minh** (Frontend Developer)

---

## 🚀 Hướng dẫn khởi chạy giao diện (Cập nhật)

Vì dự án có chứa mã Javascript gọi tới file API nội bộ, bạn **không nên** mở trực tiếp các file `.html` (bằng giao thức `file://`). Thay vào đó, hãy chạy thông qua một Web Server cục bộ.

### Cách 1: Chạy chung với API Server của Backend (Khuyên dùng)
Dự án đã tích hợp sẵn một máy chủ Python phục vụ cả API (`/api/...`) và giao diện tĩnh (serve file trong thư mục).
1. Mở Terminal / Command Prompt tại thư mục gốc của dự án (`Day06-E403-Nhom02-main`).
2. Khởi chạy server bằng lệnh:
   ```bash
   python codebase/api_server.py
   ```
3. Mở trình duyệt web và truy cập: [http://localhost:8080/frontend/index.html](http://localhost:8080/frontend/index.html)
   *(Lưu ý: cổng mặc định của API Server là `8080`)*

### Cách 2: Chạy độc lập bằng Python HTTP Server
Nếu bạn chỉ muốn mở xem giao diện tĩnh mà không cần chạy backend API:
1. Mở Terminal / Command Prompt tại thư mục gốc của dự án.
2. Khởi chạy HTTP Server:
   ```bash
   python -m http.server 8000
   ```
3. Mở trình duyệt web và truy cập: [http://localhost:8000/codebase/frontend/index.html](http://localhost:8000/codebase/frontend/index.html)

---

## 📂 Các trang tính năng chính

- **`index.html`**: Trang chủ & Đặt lịch khám. Người dùng có thể tìm chuyên khoa, tìm kiếm bác sĩ hoặc chức năng **tìm bác sĩ thay thế tương đương**.
- **`appointments.html`**: Trang Lịch sử cá nhân. Cho phép xem và **Hủy lịch khám** đã đặt trước đó.

---

## ⚡ Hướng dẫn tích hợp với AI Backend API (Lịch sử)
Backend được thiết kế chạy độc lập tại thư mục `codebase/backend/`.
Để kết nối phần giao diện với AI Backend:
1. Giao diện (HTML/JS) gọi API Endpoint: `POST http://localhost:8000/api/chat` (hoặc cổng mà server đang chạy)
2. Dữ liệu Request gửi lên:
   ```json
   {
     "message": "Tin nhắn của bệnh nhân",
     "history": []
   }
   ```
3. Dữ liệu Response nhận về từ Backend:
   ```json
   {
     "reply": "Câu trả lời của AI gửi lại bệnh nhân",
     "booking_intent": {
       "doctor_id": "doc_002",
       "date": "2026-06-05",
       "slot": "09:30"
     } // Hoặc null nếu chưa chốt đổi lịch
   }
   ```
