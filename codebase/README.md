# Bạch Mai Care - Mã nguồn Prototype Trợ lý Đổi lịch Khám (Day 06)

Thư mục này được tổ chức độc lập cho các cấu phần của dự án, bao gồm Cơ sở dữ liệu Mock, AI Backend, và Frontend.

---

## 📂 Cấu trúc thư mục codebase/

```text
codebase/
├── README.md                  ← Hướng dẫn chạy và sơ đồ cấu trúc (File này)
├── database/                  ← Thư mục Cơ sở dữ liệu Mock
│   └── doctors.json           ← Dữ liệu lịch khám chính thức (được PUSH lên Git)
├── backend/                   ← Thư mục Backend AI (Trần Minh Hoàng phụ trách)
│   ├── .env.example           ← File env mẫu
│   ├── .gitignore             ← Bỏ qua .env, __pycache__, và .venv của backend
│   ├── requirements.txt       ← Thư viện phụ thuộc Python
│   ├── cli_chat.py            ← CLI Chatbot (giao diện chạy thử console)
│   ├── database.py            ← Module Mock Database Service
│   └── agent/                 ← Module AI Agent (Gemini API logic)
│       ├── agent.py
│       └── prompts/
│           └── system_instruction.txt
└── frontend/                  ← Thư mục Frontend (chờ thành viên khác cập nhật)
    └── README.md              ← Hướng dẫn tích hợp cho nhóm Frontend
```

---

## 🚀 Hướng dẫn cài đặt và chạy thử AI Backend

### Bước 1: Chuẩn bị môi trường Python
Yêu cầu hệ thống đã cài đặt **Python 3.10+** (hoặc trình quản lý `uv`).

1. Mở Terminal/Powershell tại thư mục `codebase/backend/`:
   ```bash
   cd codebase/backend
   python -m venv .venv
   ```
2. Kích hoạt môi trường ảo:
   - **Windows (Powershell):**
     ```powershell
     .venv\Scripts\Activate.ps1
     ```
   - **macOS/Linux (Bash):**
     ```bash
     source .venv/bin/activate
     ```

### Bước 2: Cài đặt các thư viện phụ thuộc
Cài đặt thư viện:
```bash
pip install -r requirements.txt
```
*(Nếu sử dụng `uv`, bạn có thể chạy cực nhanh bằng lệnh: `uv pip install -r requirements.txt`)*

### Bước 3: Cấu hình API Key
1. Copy file `.env.example` thành `.env`:
   ```bash
   copy .env.example .env
   ```
2. Mở file `.env` vừa tạo trong `codebase/backend/` và thay thế `YOUR_GEMINI_API_KEY_HERE` bằng API Key Gemini thực tế của bạn.

### Bước 4: Chạy thử Chatbot trên CLI
Khởi động giao diện dòng lệnh:
```bash
python cli_chat.py
```
*(Hoặc dùng `uv run cli_chat.py`)*

---

## 🛠️ Tài liệu chi tiết các Hàm (API Documentation)
Chi tiết thiết kế các hàm đọc ghi cơ sở dữ liệu và gọi API AI được lưu và tài liệu hóa tại [backend/README.md](backend/README.md) (nếu cần xem chi tiết cấu hình code).
Dữ liệu lịch khám chính thức được lưu và đẩy trực tiếp lên Git tại [database/doctors.json](database/doctors.json).
