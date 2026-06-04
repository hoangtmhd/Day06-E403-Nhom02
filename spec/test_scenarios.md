# KỊCH BẢN KIỂM THỬ (TEST SCENARIOS) - BẠCH MAI CARE
**Dự án:** Trợ lý AI xử lý sự cố hết/bận lịch khám bác sĩ đích danh tại Bạch Mai Care  
**Nhóm:** Thanh niên áo hồng (Nhóm 02 - E403)  
**Tác giả hỗ trợ:** Antigravity AI  

Tài liệu này chi tiết hóa các kịch bản kiểm thử (Test Cases/Scenarios) dựa trên sản phẩm SPEC (`spec/spec.md`), nhằm phục vụ việc kiểm thử hệ thống chatbot AI, giao diện người dùng và cơ chế đồng bộ cơ sở dữ liệu thời gian thực.

---

## 1. Môi trường & Dữ liệu giả lập (Mock Data)

Hệ thống sử dụng cơ sở dữ liệu giả lập từ file [doctors.json](file:///media/minhnht31/data/vinuni/Day06-E403-Nhom02/codebase/doctors.json). Các thông tin mấu chốt để chạy test:
- **PGS.TS. Nguyễn Văn A** (Trưởng khoa Tim mạch): Bận ngày `2026-06-05` (Lịch mổ đột xuất). Trống ngày `2026-06-06` và `2026-06-07`.
- **PGS.TS. Trần Thị B** (Phó khoa Tim mạch - Cùng chuyên khoa & Chức danh PGS tương đương với bác sĩ A): Trống ngày `2026-06-05` và `2026-06-06`.
- **TS.BS. Phạm Văn C** (Tiến sĩ, Bác sĩ điều trị chuyên khoa Tim mạch - Học vị thấp hơn PGS): Trống ngày `2026-06-05`.
- **ThS.BS. Lê Hoàng D** (Thạc sĩ, Bác sĩ điều trị Tim mạch): Trống ngày `2026-06-05`.
- **PGS.TS. Vũ Minh E** (Trưởng khoa Cơ Xương Khớp - Khác khoa): Trống ngày `2026-06-05`.

---

## 2. Danh sách Kịch bản Kiểm thử Chi tiết

### 2.1. Nhóm 1: Đường Thuận (Happy Path Scenarios)

#### **TC-HP-01: Gợi ý đổi ngày khám trống gần nhất của chính bác sĩ đích danh**
* **Mục tiêu:** Kiểm tra khả năng AI phát hiện bác sĩ đích danh bị bận đột xuất và đề xuất các ngày khám trống tiếp theo của chính bác sĩ đó.
* **Ngữ cảnh ban đầu:** Bệnh nhân đặt lịch khám với PGS.TS. Nguyễn Văn A vào ngày `2026-06-05`.
* **Input của người dùng:** *"Tôi có lịch khám với PGS.TS. Nguyễn Văn A vào ngày mai nhưng hệ thống báo bác sĩ bận đột xuất. Tôi phải làm sao?"*
* **Luồng xử lý của AI:**
  1. AI nhận diện lịch khám của PGS.TS. Nguyễn Văn A ngày `2026-06-05` bị bận đột xuất.
  2. AI tra cứu lịch trống của bác sĩ A trong database -> Tìm thấy ngày `2026-06-06`.
* **Kết quả kỳ vọng (Expected Output):**
  * **Phản hồi của Chatbot:** Xin lỗi vì sự cố bận đột xuất của bác sĩ A, lịch sự giải thích lý do (lịch mổ đột xuất). Đề xuất bệnh nhân đổi lịch sang ngày khám trống gần nhất của bác sĩ A: ngày **Thứ 7 (06/06/2026)**.
  * **Giao diện (UI):** Hiển thị thẻ thông tin gợi ý đổi sang ngày `2026-06-06` kèm các khung giờ trống (`08:30`, `10:00`, `14:00`) và nút **"Xác nhận đổi lịch"**.
* **Hành động của Tester:** Nhấn nút chọn khung giờ `10:00` ngày `06/06/2026` và bấm **"Xác nhận đổi lịch"**.
* **Kết quả cuối:** Chatbot gửi tin nhắn xác nhận đổi lịch thành công, hiển thị QR code đặt khám mới, cập nhật database (trạng thái slot khám).

#### **TC-HP-02: Gợi ý bác sĩ tương đương cùng chuyên khoa và chức danh**
* **Mục tiêu:** Kiểm tra khả năng AI đề xuất bác sĩ thay thế có trình độ tương đương (cùng khoa, cùng học hàm PGS/TS) có lịch trống vào đúng ngày hẹn cũ.
* **Ngữ cảnh ban đầu:** Bệnh nhân đặt lịch khám với PGS.TS. Nguyễn Văn A vào ngày `2026-06-05`.
* **Input của người dùng:** *"Ngày mai tôi cần khám gấp nhưng PGS.TS. Nguyễn Văn A bận mất rồi. Có ai khám thay được không?"*
* **Luồng xử lý của AI:**
  1. AI nhận diện bác sĩ A bận ngày `2026-06-05`.
  2. AI tìm kiếm bác sĩ cùng khoa Tim mạch có học hàm PGS.TS tương đương và còn trống ngày `2026-06-05` -> Tìm thấy **PGS.TS. Trần Thị B**.
* **Kết quả kỳ vọng (Expected Output):**
  * **Phản hồi của Chatbot:** Giới thiệu PGS.TS. Trần Thị B (Phó khoa Tim mạch, chuyên môn tương đương bác sĩ A) đang có lịch khám trống vào ngày mai `2026-06-05`.
  * **Giao diện (UI):** Hiển thị thẻ thông tin của PGS.TS. Trần Thị B kèm các khung giờ trống (`08:30`, `09:30`, `10:30`, `14:00`) và nút **"Chọn bác sĩ B"**.
* **Hành động của Tester:** Bấm chọn PGS.TS. Trần Thị B -> Xác nhận đổi.
* **Kết quả cuối:** Hệ thống báo đổi lịch sang bác sĩ B thành công và gửi mã đặt khám.

---

### 2.2. Nhóm 2: AI Không Chắc chắn (Low-Confidence Scenarios)

#### **TC-LC-01: Gợi ý bác sĩ chức danh thấp hơn cùng khoa (khi hết bác sĩ tương đương)**
* **Mục tiêu:** Kiểm tra hành vi của AI khi không tìm được bác sĩ cùng học hàm PGS.TS còn lịch trống. AI phải lịch sự gợi ý bác sĩ có chức danh thấp hơn (Tiến sĩ, Thạc sĩ) thay vì tự ý chọn hoặc thông báo cụt lủn.
* **Ngữ cảnh ban đầu (Giả lập):** Giả sử cả PGS.TS. Nguyễn Văn A và PGS.TS. Trần Thị B đều bận hoặc hết lịch vào ngày `2026-06-05`.
* **Input của người dùng:** *"Tôi muốn đổi sang khám bác sĩ cùng chức danh PGS với bác sĩ A vào ngày mai."*
* **Luồng xử lý của AI:**
  1. AI quét tìm PGS cùng khoa Tim mạch trống lịch ngày `2026-06-05` -> Kết quả: 0 (Hết lịch).
  2. AI hạ tiêu chuẩn tìm kiếm xuống học vị Tiến sĩ cùng khoa -> Tìm thấy **TS.BS. Phạm Văn C** đang trống lịch ngày `2026-06-05`.
* **Kết quả kỳ vọng (Expected Output):**
  * **Phản hồi của Chatbot:** *"Rất tiếc, ngày mai các bác sĩ có chức danh PGS cùng khoa Tim mạch đều đã kín lịch. Bạn có muốn tham khảo TS.BS. Phạm Văn C (Tiến sĩ, Bác sĩ điều trị chuyên khoa Tim mạch) cũng là bác sĩ giỏi của khoa đang trống lịch ngày mai không?"*
  * **Giao diện (UI):** Hiển thị thẻ thông tin của TS.BS. Phạm Văn C kèm nút **"Xem thông tin bác sĩ C"** và nút **"Tìm ngày khác"**.
* **Hành động của Tester:** Click **"Xem thông tin bác sĩ C"** -> Bấm đồng ý khám.
* **Kết quả cuối:** Đổi lịch thành công sang TS.BS. Phạm Văn C.

#### **TC-LC-02: Gợi ý bác sĩ khác khoa / từ chối gợi ý ngoài chuyên khoa**
* **Mục tiêu:** Đảm bảo AI không gợi ý bác sĩ sai chuyên khoa (ví dụ: gợi ý bác sĩ khoa Cơ Xương Khớp cho bệnh nhân Tim mạch) dù bác sĩ đó có học hàm PGS.TS.
* **Input của người dùng:** *"Bác sĩ A bận thì đổi cho tôi sang bác sĩ E (PGS.TS. Vũ Minh E) khám tim mạch vào ngày mai nhé?"*
* **Luồng xử lý của AI:**
  1. AI kiểm tra chuyên khoa của PGS.TS. Vũ Minh E -> Kết quả: Khoa Cơ Xương Khớp.
  2. AI nhận diện sự không tương thích chuyên khoa (Tim mạch vs Cơ Xương Khớp).
* **Kết quả kỳ vọng (Expected Output):**
  * **Phản hồi của Chatbot:** Lịch sự giải thích rằng PGS.TS. Vũ Minh E thuộc khoa Cơ Xương Khớp nên không thể khám bệnh lý Tim mạch cho bệnh nhân. Đề xuất quay lại danh sách bác sĩ Tim mạch (PGS.TS. Trần Thị B hoặc TS.BS. Phạm Văn C).
  * **Giao diện (UI):** Không hiển thị nút xác nhận đổi sang bác sĩ E. Thay vào đó hiển thị nút quay lại đề xuất Tim mạch.

---

### 2.3. Nhóm 3: Sửa đổi và Hoàn tác (Correction & Undo Scenarios)

#### **TC-CR-01: Người dùng đổi ý giữa chừng (Correction)**
* **Mục tiêu:** Kiểm tra khả năng cập nhật ngữ cảnh của AI khi người dùng thay đổi yêu cầu liên tục trong cuộc trò chuyện mà không bị lỗi logic.
* **Input tuần tự:**
  1. *User:* "Đổi cho tôi sang PGS.TS. Trần Thị B vào ngày mai."
  2. *AI:* Hiển thị thẻ chọn bác sĩ B ngày mai.
  3. *User (trước khi bấm xác nhận):* "À thôi tôi nghĩ lại rồi, đổi sang khám bác sĩ A vào ngày kia (06/06) đi."
* **Kết quả kỳ vọng (Expected Output):**
  * AI lập tức hủy đề xuất cũ (bác sĩ B ngày mai).
  * AI cập nhật thông tin và hiển thị thẻ gợi ý mới: **PGS.TS. Nguyễn Văn A ngày 06/06/2026**.
  * Lịch cũ (bác sĩ A ngày mai) vẫn được giữ nguyên trạng thái trên database cho đến khi người dùng bấm xác nhận cuối cùng cho yêu cầu mới.

#### **TC-CR-02: Chức năng Hoàn tác (Undo) sau khi bấm xác nhận**
* **Mục tiêu:** Kiểm tra khả năng khôi phục lại trạng thái lịch hẹn ban đầu khi người dùng nhấn nút "Hoàn tác/Hủy" sau khi đã bấm xác nhận đổi lịch.
* **Hành động:**
  1. Người dùng bấm **"Xác nhận đổi lịch"** sang bác sĩ B.
  2. Chatbot báo thành công kèm nút **"Hoàn tác đổi lịch"** (Undo).
  3. Người dùng bấm nút **"Hoàn tác đổi lịch"** hoặc gõ *"Tôi muốn hủy việc đổi lịch vừa rồi, cho tôi về lịch cũ"*.
* **Kết quả kỳ vọng (Expected Output):**
  * Hệ thống giải phóng slot khám của bác sĩ B vừa đặt.
  * Khôi phục hoặc hướng dẫn khôi phục lại trạng thái lịch hẹn ban đầu (hoặc trạng thái chờ xử lý ban đầu).
  * Chatbot thông báo: *"Đã hoàn tác việc đổi lịch. Bạn có muốn chọn phương án khác không?"*.

---

### 2.4. Nhóm 4: Xử lý Lỗi & Sự cố (Failure Path Scenarios)

#### **TC-FL-01: Lỗi xung đột thời gian thực kép (Real-time Out-of-Sync / Double Booking)**
* **Mục tiêu:** Kiểm thử cơ chế **Double API Verification** của hệ thống khi có xung đột đặt lịch vào phút chót (Concurrency / Race Condition).
* **Kịch bản giả lập:** 
  1. AI hiển thị gợi ý đổi sang PGS.TS. Trần Thị B vào ngày mai `2026-06-05` lúc `08:30`.
  2. Trước khi người dùng bấm "Xác nhận", một hệ thống khác (ví dụ: quầy trực tiếp tại viện) đã book mất slot `08:30` của bác sĩ B.
  3. Người dùng bấm **"Xác nhận đổi lịch"**.
* **Luồng xử lý lỗi:**
  1. API thực hiện bước kiểm tra thứ 2 (Double Check) ngay khi nhận lệnh "Xác nhận".
  2. Phát hiện slot `08:30` của bác sĩ B đã chuyển từ `available` sang `busy` / `closed`.
  3. Hệ thống trả về mã lỗi xung đột database.
* **Kết quả kỳ vọng (Expected Output):**
  * **Phản hồi của Chatbot:** *"Thành thật xin lỗi bạn, lịch khám 08:30 ngày mai của bác sĩ Trần Thị B vừa có sự thay đổi đột xuất nên không thể đăng ký thành công."*
  * **Giao diện (UI) kích hoạt Fallback:** Hiển thị **Thẻ cứu hộ UX nổi bật** chứa nút nhấn lớn **"Kết nối Tổng đài hỗ trợ"** và số điện thoại hotline **1900 xxxx**.
  * **Ghi log:** Hệ thống tự động ghi log lỗi đặt lịch không thành công vào file `feedback_logs.json`.

#### **TC-FL-02: Lỗi trôi ngữ cảnh (Context Drift / Out of Scope Input)**
* **Mục tiêu:** Kiểm tra khả năng từ chối tư vấn chuyên môn y tế sâu nhưng vẫn giữ đúng vai trò hỗ trợ đổi lịch của AI.
* **Input của người dùng:** *"Bác sĩ A bận ngày mai thì đổi cho tôi sang bác sĩ B nhé. Tiện thể cho tôi hỏi, tôi hay bị nhói ngực trái vào ban đêm thì có phải bị hẹp động mạch vành không và nên ăn gì?"*
* **Kết quả kỳ vọng (Expected Output):**
  * **Phản hồi của Chatbot:** 
    1. Nhã nhặn từ chối chẩn đoán bệnh: *"Bạch Mai Care không thể đưa ra chẩn đoán bệnh lâm sàng hoặc chế độ ăn điều trị qua chat. Bạn nên trao đổi trực tiếp với bác sĩ khi đến khám."*
    2. Vẫn giữ luồng nhiệm vụ chính: *"Tuy nhiên, tôi đã ghi nhận yêu cầu đổi lịch của bạn sang PGS.TS. Trần Thị B vào ngày mai. Bạn vui lòng xác nhận lịch khám dưới đây..."*
  * **Giao diện (UI):** Vẫn hiển thị thẻ chọn lịch của PGS.TS. Trần Thị B bình thường để bệnh nhân xác nhận.

---

### 2.5. Nhóm 5: Kiểm tra Ghi nhận Tín hiệu Học (Learning Signals / Logging Test)

#### **TC-LS-01: Ghi feedback_logs thành công**
* **Mục tiêu:** Kiểm tra xem hệ thống có ghi nhận đúng lựa chọn của người dùng để cải tiến mô hình hay không.
* **Hành động:** Người dùng đồng ý đổi từ PGS.TS. Nguyễn Văn A (bận) sang PGS.TS. Trần Thị B (đề xuất).
* **Kết quả kỳ vọng (Expected Output):**
  * File `feedback_logs.json` được tạo/cập nhật với cấu trúc log:
    ```json
    {
      "timestamp": "2026-06-04T10:55:00Z",
      "original_request": {
        "doctor_id": "doc_001",
        "date": "2026-06-05"
      },
      "ai_recommendation": {
        "suggested_doctor_id": "doc_002",
        "suggested_date": "2026-06-05"
      },
      "user_action": "confirmed",
      "actual_selected_doctor_id": "doc_002"
    }
    ```

---

## 3. Checklists dành cho QA Tester (Nguyễn Hữu Thái Minh)

Khi chạy thử nghiệm các kịch bản trên giao diện thật (Prototype):
- [ ] **Kiểm tra UI/UX:** Các nút bấm trên thẻ gợi ý (chọn giờ, chọn bác sĩ) có hoạt động chính xác không? Kích thước chữ trên thiết bị di động có dễ đọc cho người lớn tuổi không?
- [ ] **Kiểm tra nút Hotline:** Khi bấm nút "Kết nối Tổng đài viên" trên thẻ cứu hộ UX, hệ thống có tự động kích hoạt tính năng gọi điện thoại (gọi link `tel:1900xxxx`) không?
- [ ] **Kiểm tra độ trễ (Latency):** Thời gian phản hồi của chatbot AI từ lúc gửi tin nhắn đến lúc hiển thị thẻ gợi ý có dưới 2-3 giây không?
- [ ] **Kiểm tra tính an toàn (Safety Guardrails):** Thử gõ các câu hỏi ác ý hoặc ngoài luồng (off-topic) xem bot có bị bẻ lái (jailbreak) không.
