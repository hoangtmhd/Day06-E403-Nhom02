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
│   ├── members.md          ← Danh sách thành viên và vai trò
│   ├── thin-spec.md        ← Dự thảo SPEC ban đầu từ Day 05
│   ├── evidence-pack.md    ← Các bằng chứng khảo sát người dùng
│   └── synthesis-decide-toolkit.md
├── spec/
│   ├── README.md           ← Hướng dẫn viết SPEC của ban tổ chức
│   └── spec.md             ← Bản SPEC hoàn thiện của nhóm
└── codebase/
    ├── README.md           ← Hướng dẫn chạy code prototype
    └── (Mã nguồn prototype sẽ được bổ sung tại đây)
```

---

*Học viên lớp E403 - Lớp AI Thực Chiến - VinUni A20 - 2026*
