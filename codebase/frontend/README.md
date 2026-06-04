# Bạch Mai Care - Frontend Prototype

Thư mục này dành cho việc phát triển giao diện người dùng (UI) cho Trợ lý tư vấn đổi lịch Bạch Mai Care.

## 👥 Người phụ trách Frontend
- **Nguyễn Quang Minh** (Frontend Developer)

## ⚡ Hướng dẫn tích hợp với AI Backend API
Backend được thiết kế chạy độc lập tại thư mục `codebase/backend/`.
Để kết nối phần giao diện với AI Backend:
1. Giao diện (HTML/JS) gọi API Endpoint: `POST http://localhost:8000/api/chat`
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
