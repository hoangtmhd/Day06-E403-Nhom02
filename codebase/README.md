# Bạch Mai Care - Mã nguồn Prototype Trợ lý Đổi lịch Khám (Day 06)

Thư mục này được tổ chức độc lập cho các cấu phần của dự án, bao gồm Cơ sở dữ liệu Mock, AI Backend, và Frontend.

---

## 📂 Cấu trúc thư mục codebase/

```text
codebase/
├── README.md                  ← Hướng dẫn chạy và sơ đồ cấu trúc (File này)
├── api_server.py              ← Máy chủ Python tích hợp để serve Frontend & chạy Backend API
├── database/                  ← Thư mục Cơ sở dữ liệu Mock
│   ├── README.md              ← Hướng dẫn quản lý và cấu trúc cơ sở dữ liệu
│   ├── doctors.json           ← Dữ liệu lịch khám chính thức (được PUSH lên Git)
│   ├── doctors_backup.json    ← Dữ liệu sao lưu sạch dùng để khôi phục (Restore DB)
│   └── feedback_logs.json     ← Log tín hiệu học phản hồi (tự sinh khi chạy)
├── backend/                   ← Thư mục Backend AI (Trần Minh Hoàng phụ trách)
│   ├── README.md              ← Tài liệu chi tiết các hàm API backend & kịch bản kiểm thử
│   ├── .env.example           ← File env mẫu
│   ├── .gitignore             ← Bỏ qua .env, __pycache__, và .venv của backend
│   ├── requirements.txt       ← Thư viện phụ thuộc Python
│   ├── server.py              ← Máy chủ API FastAPI chính
│   ├── cli_chat.py            ← CLI Chatbot (giao diện chạy thử console)
│   ├── database.py            ← Module Mock Database Service
│   ├── agent/                 ← Module AI Agent (Gemini API logic)
│   │   ├── agent.py           ← Logic xử lý API với Gemini 2.5 Flash
│   │   └── prompts/
│   │       └── system_instruction.txt ← Prompt hệ thống quy định luật chơi và ngữ cảnh AI
│   └── test/                  ← Thư mục kiểm thử & kịch bản (Nguyễn Hữu Thái Minh phụ trách)
│       └── manual_test_scripts.md  ← File kịch bản hội thoại mẫu chi tiết để test thủ công
└── frontend/                  ← Thư mục Giao diện Web (Nguyễn Quang Minh phụ trách)
    ├── README.md              ← Hướng dẫn tích hợp cho nhóm Frontend
    ├── index.html             ← Giao diện chat & đổi lịch chính
    ├── appointments.html      ← Giao diện xem và hủy lịch (Undo)
    ├── css/                   ← Thư mục định dạng styles UI
    └── js/                    ← File xử lý sự kiện frontend & gọi API
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

---

## 📋 Feedback Log (Learning Signals)

File `database/feedback_logs.json` được tự động tạo và cập nhật mỗi khi có giao dịch đổi lịch.

### Cấu trúc mỗi entry log

```json
{
  "timestamp": "2026-06-04T10:55:00Z",
  "original_request": {
    "doctor_id": "doc_nhi_003",
    "date": "2026-06-05"
  },
  "ai_recommendation": {
    "suggested_doctor_id": "doc_nhi_002",
    "suggested_date": "2026-06-05",
    "suggested_slot": "08:00"
  },
  "user_action": "confirmed",
  "actual_selected_doctor_id": "doc_nhi_002"
}
```

### Các giá trị `user_action`

| Giá trị | Ý nghĩa |
|---|---|
| `confirmed` | Người dùng xác nhận đổi lịch thành công |
| `failed_sync` | Booking thất bại do xung đột lịch thời gian thực (Failure Path) |
| `undo` | Người dùng gõ `/undo` để hoàn tác lịch đã đặt |

### Lệnh xem log nhanh

```powershell
# Xem toàn bộ log
cat ..\..\database\feedback_logs.json

# Đếm số lần booking thành công
(Get-Content ..\..\database\feedback_logs.json | ConvertFrom-Json) | Where-Object { $_.user_action -eq "confirmed" } | Measure-Object | Select-Object Count
```

---

## 🎨 Hướng dẫn chạy Giao diện (Frontend)
Dự án đã tích hợp sẵn một Web Server bằng Python để chạy đồng thời cả API và giao diện tĩnh (HTML/CSS/JS).

1. Mở Terminal / Command Prompt tại thư mục gốc `codebase/`:
   ```bash
   cd codebase
   python api_server.py
   ```
2. Mở trình duyệt web và truy cập vào: [http://localhost:8080/frontend/index.html](http://localhost:8080/frontend/index.html)
   *(Lưu ý: API server mặc định chạy ở cổng `8080`)*

**Hoặc nếu chỉ muốn chạy riêng file tĩnh (không dùng API):**
1. Mở Terminal tại thư mục `codebase/`:
   ```bash
   cd codebase
   python -m http.server 8000
   ```
2. Truy cập trình duyệt: [http://localhost:8000/frontend/index.html](http://localhost:8000/frontend/index.html)
