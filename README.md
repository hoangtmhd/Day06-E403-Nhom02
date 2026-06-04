# Bạch Mai Care - Trợ lý AI Tư vấn Đổi lịch Khám (Nhóm 02 - E403)

Đây là repository của **Nhóm 02 (Thanh niên áo hồng)** lớp E403 cho buổi AI Product Hackathon - Day 06.

---

## 👥 Thành viên nhóm & Phân công vai trò

| Mã học viên | Họ và tên | Vai trò trong nhóm |
|---|---|---|
| **2A202600700** | Trần Minh Hoàng | **Spec & AI Backend Developer** (Viết SPEC, thiết kế prompt, code logic kết nối LLM) |
| **2A202600912** | Nguyễn Thế Giáp | **Research, Mock Data, Support Backend Developer** (Khảo sát, thiết lập dữ liệu mẫu `doctors.json`) |
| **2A202600994** | Nguyễn Quang Minh | **Frontend Developer** (Phát triển giao diện UI khung chat, thẻ UX fallback) |
| **2A202600619** | Nguyễn Hữu Thái Minh | **QA Tester & Demo Coordinator** (Kiểm thử, viết kịch bản demo, chuẩn bị slide/video) |

---

## 🏥 Giới thiệu Sản phẩm: Trợ lý Đổi lịch Khám Bạch Mai Care

### 🔴 Vấn đề (Pain Point)
Bệnh nhân đặt khám theo yêu cầu với bác sĩ đích danh tại ứng dụng Bạch Mai Care nhưng gặp tình huống bác sĩ hết lịch khám hoặc bận đột xuất (đi công tác, mổ cấp cứu). Hệ thống hiện tại chỉ thông báo bận tĩnh, bắt buộc người bệnh phải tự quay lại tìm kiếm, so sánh và click vào từng bác sĩ khác cùng khoa một cách thủ công. Điều này làm người dùng dễ nản lòng và rời bỏ app để gọi trực tiếp lên tổng đài hỗ trợ, gây quá tải hệ thống CSKH.

### 🟢 Giải pháp (Solution)
Trợ lý AI tích hợp trong khung chat giúp:
1. Chủ động thông báo lịch bận của bác sĩ cũ.
2. Tự động đề xuất lịch khám trống gần nhất của bác sĩ đó **HOẶC** giới thiệu 2-3 bác sĩ tương đương cùng chuyên khoa/chức vụ/chức danh đang có lịch trống.
3. Người dùng có thể click xác nhận đổi lịch nhanh trực tiếp trên giao diện chat.
4. **UX Fallback (Human-in-the-loop):** Nếu xảy ra lỗi đồng bộ dữ liệu thời gian thực hoặc không tìm được bác sĩ phù hợp, hệ thống hiển thị thẻ UX chứa nút kết nối trực tiếp đến tổng đài hỗ trợ để được nhân viên gọi điện tư vấn.

---

## 📂 Cấu trúc Repository

```text
Day06-E403-Nhom02/
├── README.md               ← Tài liệu giới thiệu nhóm và sản phẩm (File này)
├── docs/
│   ├── members.md          ← Danh sách thành viên và vai trò & bằng chứng đóng góp
│   ├── thin-spec.md        ← Dự thảo SPEC ban đầu từ Day 05
│   ├── evidence-pack.md    ← Các bằng chứng khảo sát người dùng
│   └── synthesis-decide-toolkit.md
├── spec/
│   ├── README.md           ← Hướng dẫn viết SPEC của ban tổ chức
│   └── spec.md             ← Bản SPEC hoàn thiện của nhóm (Mô tả chi tiết giải pháp, 4 Paths, ...)
└── codebase/
    ├── README.md           ← Hướng dẫn chạy code prototype tổng thể
    ├── api_server.py       ← Web server tích hợp chạy đồng thời API và Frontend tĩnh
    ├── database/           ← Cơ sở dữ liệu Mock JSON
    │   ├── doctors.json    ← Dữ liệu bác sĩ & lịch trực thời gian thực
    │   └── feedback_logs.json ← Lưu trữ feedback log tín hiệu học của AI
    ├── backend/            ← Backend AI FastAPI & logic LLM (Trần Minh Hoàng phụ trách)
    │   ├── server.py       ← File khởi chạy FastAPI Server
    │   ├── cli_chat.py     ← CLI Chatbot giao diện console để chạy thử nghiệm kịch bản
    │   ├── database.py     ← Các hàm xử lý nghiệp vụ & truy vấn Database
    │   ├── agent/          ← Module AI Agent (Gemini API logic)
    │   └── test/           ← Thư mục kiểm thử của nhóm (Nguyễn Hữu Thái Minh phụ trách)
    │       └── manual_test_scripts.md ← Kịch bản hội thoại mẫu phục vụ kiểm thử và demo
    └── frontend/           ← Giao diện Web động Bạch Mai Care (Nguyễn Quang Minh phụ trách)
        ├── index.html      ← Trang chủ & màn hình Chatbot tư vấn đổi lịch
        ├── appointments.html ← Trang lịch sử cuộc hẹn cá nhân & chức năng hủy lịch (Undo)
        ├── css/            ← Thư mục chứa file style định dạng UI
        └── js/             ← Logic điều khiển giao diện & gọi API
```

---

## 🛠️ Công cụ & API đã sử dụng (Tech Stack)

Để phát triển prototype này, nhóm đã sử dụng các công nghệ và API sau:
- **AI Model & API:** Google Gemini API (sử dụng mô hình **Gemini 2.5 Flash** để xử lý hội thoại thông minh và trích xuất dữ liệu có cấu trúc JSON qua tham số `"response_mime_type": "application/json"`).
- **Backend Framework:** **Python 3.10+** kết hợp **FastAPI** và **Uvicorn** để xây dựng các API Endpoint thời gian thực (`GET /api/doctors`, `POST /api/chat`, `POST /api/confirm-booking`, `POST /api/undo-booking`).
- **Frontend:** Giao diện Web tĩnh được dựng bằng **HTML5**, **CSS3 (Vanilla CSS)**, và **Javascript (Vanilla JS)** cho trải nghiệm mượt mà, phản hồi thời gian thực và tương tác động.
- **Database Mock:** Dữ liệu lịch khám được lưu trữ dạng file JSON (`doctors.json`) làm cơ sở dữ liệu giả lập thời gian thực.
- **Thư viện khác:** `google-generativeai` (SDK chính thức của Google), `python-dotenv` (quản lý biến môi trường an toàn).

---

## 🚀 Hướng dẫn khởi chạy nhanh (Quick Start)

Bản prototype hiện được cấu hình chạy offline trên local (localhost) để thuận tiện cho việc trình bày demo thời gian thực và bảo mật API key.

1. **Cấu hình môi trường:**
   - Mở Terminal/Powershell tại thư mục `codebase/backend/` và chạy:
     ```bash
     cd codebase/backend
     python -m venv .venv
     # Kích hoạt môi trường ảo:
     # - Windows (Powershell): .venv\Scripts\Activate.ps1
     # - macOS/Linux (Bash): source .venv/bin/activate
     pip install -r requirements.txt
     ```
   - Tạo file `.env` từ `.env.example` trong thư mục `codebase/backend/` và điền `GEMINI_API_KEY` của bạn.

2. **Khởi chạy máy chủ tích hợp (cả API và Frontend):**
   - Mở Terminal tại thư mục gốc của dự án (`Day06-E403-Nhom02/`) và chạy:
     ```bash
     python codebase/api_server.py
     ```
   - Máy chủ tích hợp sẽ chạy trên cổng mặc định `8080`.

3. **Truy cập Giao diện & Test kịch bản:**
   - **Giao diện Web:** Mở trình duyệt và truy cập [http://localhost:8080/frontend/index.html](http://localhost:8080/frontend/index.html) để bắt đầu trải nghiệm và demo sản phẩm.
   - **Chạy thử Chatbot console:** Mở một Terminal khác tại `codebase/backend/` và chạy `python cli_chat.py` để test nhanh các kịch bản hội thoại mẫu trong file `manual_test_scripts.md`.

---

*Học viên lớp E403 - Lớp AI Thực Chiến - VinUni A20 - 2026*
