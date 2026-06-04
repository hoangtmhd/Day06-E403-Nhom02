# 👥 Danh sách Thành viên & Phân công Công việc (Nhóm 02 - E403)

Tài liệu này chi tiết hóa vai trò, nhiệm vụ và các đóng góp thực tế (dựa trên commit Git) của từng thành viên trong dự án **Bạch Mai Care - Trợ lý AI Tư vấn Đổi lịch Khám**.

---

## 1. Trần Minh Hoàng (2A202600700)
* **Vai trò:** Spec & AI Backend Developer (Nhóm trưởng)
* **Các đóng góp thực tế:**
  * **Cấu trúc & Quản trị dự án:** Khởi tạo cấu trúc thư mục repo, phân chia rõ ràng các phân vùng `backend`, `frontend`, và `database`. Quản lý và xử lý các xung đột git khi merge code.
  * **Phát triển Backend:** Xây dựng máy chủ API bằng **FastAPI** (`server.py`) gồm đầy đủ các endpoint phục vụ thời gian thực:
    * `GET /api/doctors`: Lấy danh sách bác sĩ và lịch trực theo chuyên khoa.
    * `POST /api/chat`: Xử lý hội thoại của người dùng với trợ lý AI.
    * `POST /api/confirm-booking`: Xác nhận đặt hoặc dời lịch khám.
    * `POST /api/undo-booking`: Hoàn tác lịch khám vừa đặt.
  * **Tích hợp AI Agent:** Phát triển module kết nối API Gemini 2.5 Flash (`agent.py`), thiết kế prompt hệ thống (`system_instruction.txt`) và tích hợp ngữ cảnh thời gian thực (lịch trực của bác sĩ, thông tin ca bệnh bận đột xuất) để hạn chế ảo tưởng thông tin ở LLM.
  * **Tài liệu hóa:** Viết bản SPEC sản phẩm hoàn chỉnh (`spec/spec.md`) và tài liệu vận hành máy chủ (`codebase/backend/README.md`).

---

## 2. Nguyễn Thế Giáp (2A202600912)
* **Vai trò:** Research, Mock Data, Support Backend Developer
* **Các đóng góp thực tế:**
  * **Thu thập & Chuẩn hóa dữ liệu:** Khảo sát thông tin thực tế từ Bệnh viện Bạch Mai, xây dựng cơ sở dữ liệu `doctors.json` gồm **64 bác sĩ** chia đều cho 4 chuyên khoa chính (Trung tâm Nhi khoa, Hồi sức tích cực, Phục hồi chức năng, Dị ứng - Miễn dịch).
  * **Logic Cơ sở dữ liệu:** Viết các hàm nghiệp vụ trong `database.py`:
    * Hàm tìm kiếm bác sĩ thay thế cùng chức danh, cùng chuyên khoa (`find_equivalent_doctors`).
    * Hàm tìm kiếm bác sĩ có chức danh thấp hơn theo thuật toán xếp hạng fallback (`find_lower_rank_doctors`).
    * Hàm ghi nhận lịch sử phản hồi hành vi của người dùng (`log_feedback`) vào `feedback_logs.json` để phục vụ cải tiến gợi ý AI.
  * **Tài liệu hóa:** Hoàn thiện tài liệu mô tả cơ sở dữ liệu và quy trình vận hành dữ liệu sạch (`codebase/database/README.md`).

---

## 3. Nguyễn Quang Minh (2A202600994)
* **Vai trò:** Frontend Developer
* **Các đóng góp thực tế:**
  * **Xây dựng Giao diện Web (HTML/CSS/JS):** Thiết kế giao diện prototype "Bệnh viện Thông minh" với phong cách hiện đại, responsive.
  * **Giao diện Khung chat AI:** Phát triển giao diện trò chuyện trực quan với trợ lý Bạch Mai Care, tích hợp hiển thị trạng thái đang soạn tin (typing indicator).
  * **Tích hợp API & Trạng thái Động:**
    * Kết nối frontend với máy chủ API để hiển thị danh sách bác sĩ động dựa theo chuyên khoa được chọn.
    * Hiển thị thẻ Đề xuất đổi lịch nhanh (với nút bấm xác nhận thủ công) ngay trên khung chat khi AI phát hiện ý định dời lịch.
    * Thiết kế trang Lịch sử cuộc hẹn (`appointments.html`) tích hợp lưu trữ trạng thái lịch hẹn qua `localStorage` và xử lý sự kiện Hoàn tác (Undo) trực tiếp từ giao diện.
  * **Tài liệu hóa:** Viết tài liệu hướng dẫn chạy giao diện web (`codebase/frontend/README.md`).

---

## 4. Nguyễn Hữu Thái Minh (2A202600619)
* **Vai trò:** QA Tester & Demo Coordinator
* **Các đóng góp thực tế:**
  * **Kiểm thử chất lượng (QA):** Xây dựng và tổng hợp bộ kịch bản kiểm thử & hội thoại demo chi tiết (Happy Path, Failure Path, Low-confidence Path) tại file [codebase/backend/test/manual_test_scripts.md](file:///d:/Work/Study/ai-in-action/Lab6/Day06-E403-Nhom02/codebase/backend/test/manual_test_scripts.md) để chạy test bằng `python cli_chat.py`.
  * **Phát triển kịch bản Demo & QA:** Chuẩn bị các tình huống hội thoại mô phỏng thực tế giữa bệnh nhân và trợ lý AI để làm tài liệu hướng dẫn demo và kiểm thử thủ công cho nhóm.
  * **Fix lỗi định dạng AI:** Phát hiện và sửa lỗi parse chuỗi JSON do Gemini thỉnh thoảng tự ý chèn các ký tự escape không hợp lệ trong chuỗi trả về.
  * **Tài liệu hóa & Điều phối:** Soạn thảo slide trình bày dự án, tài liệu hỗ trợ thuyết trình và chuẩn bị video demo sản phẩm trước lớp.
