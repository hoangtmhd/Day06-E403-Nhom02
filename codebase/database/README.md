# Database Folder - Bạch Mai Care Prototype

Thư mục `codebase/database/` lưu dữ liệu JSON phục vụ cho luồng demo chatbot đổi lịch khám.

## 👥 Người phụ trách database
- **Nguyễn Thế Giáp** 

## Mục đích

- Cung cấp dữ liệu lịch khám bác sĩ dạng mock cho backend.
- Lưu log hành vi người dùng khi xác nhận đổi lịch hoặc hoàn tác.
- Hỗ trợ backup để khôi phục nhanh dữ liệu ban đầu khi test/demo.

# Các chuyên khoa đang có
```
1. Trung tâm Nhi khoa
2. Trung tâm Hồi sức tích cực
3. Viện Phục hồi chức năng Bạch Mai
4. Viện Cơ Xương Khớp Bạch Mai
```

## Các file trong thư mục

### 1) `doctors.json`

- Vai trò: Nguồn dữ liệu chính (source of truth) cho backend đọc/ghi khi chatbot tra cứu và đặt lịch.
- Được sử dụng bởi: `codebase/backend/database.py` qua các hàm `load_data()`, `save_data()`, `find_equivalent_doctors()`, `find_lower_rank_doctors()`, `book_appointment_slot()`, `undo_appointment_slot()`.
- Nội dung: Danh sách bác sĩ và lịch khám theo ngày/slot, ví dụ các trường:
  - `id`, `name`, `title`, `role`, `department`
  - `schedule[]` gồm `date`, `slots[]`, `status`, `reason` (nếu bận)
- Lưu ý:
  - File này thay đổi trong quá trình test booking/undo.
  - Nên reset từ `doctors_backup.json` trước khi demo chính thức để dữ liệu sạch.

### 2) `doctors_backup.json`

- Vai trò: Bản sao dự phòng của dữ liệu lịch khám.
- Mục đích sử dụng:
  - Khôi phục nhanh trạng thái ban đầu sau khi test nhiều kịch bản.
  - Tránh làm hỏng dữ liệu demo trong `doctors.json`.
- Khuyến nghị:
  - Chỉ cập nhật file này khi đội dự án chốt dataset mới.
  - Không ghi đè tùy ý trong lúc đang chạy demo.

### 3) `feedback_logs.json`

- Vai trò: Lưu learning signals từ backend sau mỗi giao dịch đổi lịch.
- Được ghi bởi: Hàm `log_feedback()` trong `codebase/backend/database.py`.
- Các nhóm sự kiện chính (`user_action`):
  - `confirmed`: Người dùng xác nhận đổi lịch thành công.
  - `failed_sync`: Xác nhận đổi lịch thất bại do xung đột dữ liệu thời gian thực.
  - `undo`: Người dùng hoàn tác lịch vừa đổi.
- Cấu trúc mỗi bản ghi gồm:
  - `timestamp`
  - `original_request` (lịch ban đầu)
  - `ai_recommendation` (phương án AI gợi ý)
  - `user_action`
  - `actual_selected_doctor_id`
- Lưu ý:
  - File này tăng dần theo thời gian test.
  - Không nên commit log test nội bộ lên Git.

## Quy trình thao tác dữ liệu khuyến nghị

1. Trước khi test: đảm bảo `doctors.json` ở trạng thái sạch (khôi phục từ backup nếu cần).
2. Chạy backend và thực hiện các kịch bản booking/failure/undo.
3. Kiểm tra kết quả:
  - Trạng thái lịch trong `doctors.json`.
  - Dấu vết hành vi trong `feedback_logs.json`.
4. Sau buổi test: có thể reset lại `doctors.json` từ `doctors_backup.json`.
