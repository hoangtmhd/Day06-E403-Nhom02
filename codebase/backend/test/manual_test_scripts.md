# KỊCH BẢN HỘI THOẠI CHI TIẾT - BẠCH MAI CARE
> **Mục đích:** Dùng để test thủ công bằng `python cli_chat.py`. Mỗi kịch bản là một cuộc hội thoại mô phỏng thực tế bệnh nhân, bao gồm các tình huống bệnh nhân không cung cấp đủ thông tin và AI phải hỏi lại.

---

## 📌 HƯỚNG DẪN SỬ DỤNG
1. Mở terminal tại thư mục `codebase/backend`
2. Chạy: `python cli_chat.py`
3. Chọn một kịch bản bên dưới và nhập **từng dòng** của bệnh nhân theo thứ tự
4. Quan sát phản hồi của AI và ghi nhận vào log

---

## 🎭 TC-HP-01: ĐƯỜNG THUẬN — Đổi ngày cùng bác sĩ đích danh

> **Mục tiêu:** Bệnh nhân không cung cấp đủ thông tin ngay từ đầu. AI hỏi lại để hiểu rõ nhu cầu trước khi đề xuất.

```
👤 [1] Alo, tôi vừa nhận được thông báo là lịch khám của tôi bị hủy rồi.

👤 [2] Tôi đăng ký khám với bác sĩ Hùng ấy, bác sĩ Lê Sỹ Hùng.

👤 [3] Ngày mai, 5/6.

👤 [4] Thế thì bác sĩ Hùng có lịch khám ngày nào gần nhất không?

👤 [5] Ngày 6/6 thì bác sĩ khám lúc mấy giờ?

👤 [6] Thôi cho tôi đổi sang 9 giờ ngày 6/6 đi.
```

**✅ Kỳ vọng tại bước [1]:** AI hỏi lại bệnh nhân đăng ký khám với bác sĩ nào / ngày nào.  
**✅ Kỳ vọng tại bước [3]:** AI xác nhận bác sĩ Lê Sỹ Hùng bận ngày 5/6 và gợi ý ngày 6/6.  
**✅ Kỳ vọng tại bước [6]:** AI chốt lịch thành công, trả về `booking_intent` với slot `09:00` ngày `2026-06-06`, doctor `doc_nhi_003`.

---

## 🎭 TC-HP-02: ĐƯỜNG THUẬN — Đổi sang bác sĩ tương đương

> **Mục tiêu:** Bệnh nhân muốn đổi sang bác sĩ khác nhưng không biết tên cụ thể. AI đề xuất và bệnh nhân thử chọn giờ sai rồi sửa lại.

```
👤 [1] Bác sĩ Hùng ngày mai không khám được rồi à? Vậy có ai thay không?

👤 [2] Thay thế cùng loại ấy, mấy ông tiến sĩ, phó giám đốc gì đó.

👤 [3] Ừ thì bác sĩ Khắc đó. Cho tôi đặt lúc 2 giờ chiều ngày 6/6.

👤 [4] Ừ thì 3 giờ rưỡi vậy.

👤 [5] OK, chốt đi.
```

**✅ Kỳ vọng tại bước [1]:** AI hỏi lại bệnh nhân muốn đổi sang ngày nào / muốn loại bác sĩ nào.  
**✅ Kỳ vọng tại bước [3]:** AI báo giờ `14:00` không có trong lịch trống của bác sĩ Khắc, nhắc lại các giờ hợp lệ (`08:30`, `10:00`, `15:30`).  
**✅ Kỳ vọng tại bước [5]:** Đặt thành công slot `15:30` ngày `2026-06-06`, doctor `doc_nhi_002`.

---

## 🎭 TC-LC-01: LOW-CONFIDENCE — Hạ bậc đề xuất khi hết bác sĩ cùng cấp

> **Mục tiêu:** Bệnh nhân muốn giám đốc khám nhưng không ai cùng cấp trống lịch. AI phải khéo léo đề xuất bác sĩ cấp thấp hơn.

```
👤 [1] Tôi có hẹn khám với ông Nguyễn Thành Nam, giám đốc trung tâm Nhi đó. Ngày mai 6/6.

👤 [2] Thế thì có ông giám đốc nào khác không?

👤 [3] Phó giám đốc cũng được, cùng khoa thôi.

👤 [4] Vậy có ai trống buổi sáng không?

👤 [5] Thôi thì bác sĩ nào trống sáng cũng được, không cần phải cùng cấp nữa.

👤 [6] Bác sĩ Mai Thành Công đó, lúc mấy giờ còn trống?

👤 [7] Sáng không có à? Chiều thì mấy giờ?

👤 [8] Thôi 2 giờ chiều vậy, đặt cho tôi đi.
```

**✅ Kỳ vọng tại bước [2]:** AI giải thích không có Giám đốc nào khác trống, đề xuất Phó Giám đốc.  
**✅ Kỳ vọng tại bước [6]:** AI tra cứu bác sĩ Mai Thành Công và báo buổi sáng 5/6 bận (trực Hồi sức Nhi), chỉ còn giờ chiều ngày 6/6.  
**✅ Kỳ vọng tại bước [8]:** Đặt thành công slot `14:00` ngày `2026-06-06`, doctor `doc_nhi_010`.

---

## 🎭 TC-LC-02: GUARDRAILS — Từ chối tư vấn ngoài chuyên khoa

> **Mục tiêu:** Bệnh nhân bối rối, hỏi sai hướng. AI từ chối an toàn và kéo về đúng luồng.

```
👤 [1] Con tôi bị ho với sốt cao từ tối qua, giờ này mà bác sĩ Hùng bận thì biết làm sao?

👤 [2] Thế có bác sĩ nào khám Tim mạch không, tôi nghe nói ông PGS gì đó giỏi lắm.

👤 [3] Thôi thì bác sĩ Nhi cũng được nhưng mà có ai không, con tôi sốt cao lắm rồi đó.

👤 [4] Các bác sĩ kia lịch ngày mai thế nào?

👤 [5] Bác sĩ Khắc còn giờ nào buổi sáng không?

👤 [6] 8 rưỡi thì còn không?

👤 [7] Đặt cho tôi đi.
```

**✅ Kỳ vọng tại bước [2]:** AI từ chối khéo, giải thích Tim mạch không phù hợp để khám cho bé, hướng về Nhi khoa.  
**✅ Kỳ vọng tại bước [3]:** AI thể hiện sự đồng cảm với tình trạng khẩn của bé, ngay lập tức tra cứu lịch Nhi khoa ngày mai.  
**✅ Kỳ vọng tại bước [7]:** Đặt thành công slot `08:30` ngày `2026-06-06`, doctor `doc_nhi_002`.

---

## 🎭 TC-CR-01: CORRECTION — Người dùng thay đổi ý định liên tục

> **Mục tiêu:** Bệnh nhân không chắc muốn gặp bác sĩ nào, đổi ý nhiều lần. AI phải theo kịp mà không bị nhầm.

```
👤 [1] Cho tôi đổi lịch sang bác sĩ Khắc ngày mai đi, lúc 8 rưỡi sáng.

👤 [2] Khoan đã, thôi bác sĩ Hùng cũng được, có giờ nào không?

👤 [3] 10 rưỡi thì còn chứ?

👤 [4] Ừ thì bác sĩ Hùng 10:30 ngày 6/6 đi.

👤 [5] Ừ đúng rồi, chốt đó đi.
```

**✅ Kỳ vọng tại bước [1]:** AI ghi nhận bác sĩ Khắc lúc 8:30 nhưng chưa chốt (chưa có "xác nhận").  
**✅ Kỳ vọng tại bước [2]:** AI cập nhật ngữ cảnh, chuyển sang tra cứu lịch bác sĩ Hùng.  
**✅ Kỳ vọng tại bước [5]:** Chốt đúng `booking_intent` cuối cùng: slot `10:30`, ngày `2026-06-06`, doctor `doc_nhi_003`.

---

## 🎭 TC-CR-02: UNDO — Hoàn tác sau khi đã chốt

> **Mục tiêu:** Bệnh nhân đặt xong rồi đổi ý. Hệ thống phải giải phóng lịch và báo hoàn tác thành công.

```
👤 [1] Đặt cho tôi bác sĩ Phạm Công Khắc lúc 10 giờ ngày 6/6.

👤 [2] Ừ đúng rồi chốt đi.

    → [Hệ thống đặt lịch thành công]

👤 [3] Ơ khoan tôi nhớ nhầm, con tôi có lớp học sáng đó. Hủy đi được không?

    → [Nhập lệnh hệ thống: /undo]

👤 [4] Vậy bây giờ còn ai trống chiều không?
```

**✅ Kỳ vọng tại bước [3]:** Bệnh nhân gõ `/undo`, hệ thống khôi phục slot `10:00` của bác sĩ Khắc về trạng thái trống.  
**✅ Kỳ vọng tại bước [4]:** AI hiểu người dùng muốn tìm bác sĩ Nhi khoa trống lịch buổi chiều ngày 6/6, đề xuất lại.

---

## 🎭 TC-FL-01: FAILURE PATH — Lỗi đồng bộ thời gian thực (Race Condition)

> **Mục tiêu:** Slot bác sĩ bị đặt mất bởi người khác ngay lúc bệnh nhân đang chat. Khi chốt, hệ thống báo lỗi và kích hoạt Hotline.

> ⚠️ **Chuẩn bị thêm Terminal 2** để giả lập database cập nhật giữa chừng.

```
👤 [1] Bác sĩ Hùng ngày mai bận à? Có ai thay không?

👤 [2] Bác sĩ Khắc thì sao, còn trống không?

👤 [3] 10 giờ thì còn không?

    → [Tại Terminal 2 - chạy lệnh giả lập bận slot 10:00 của bác sĩ Khắc]
    → python -c "
import json
with open('../database/doctors.json', 'r', encoding='utf-8') as f:
    data = json.load(f)
for doc in data:
    if doc['id'] == 'doc_nhi_002':
        for s in doc['schedule']:
            if s['date'] == '2026-06-06' and '10:00' in s['slots']:
                s['slots'].remove('10:00')
with open('../database/doctors.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
print('⚡ GIẢ LẬP: Slot 10:00 của bác sĩ Khắc đã bị đặt mất!')
"

👤 [4] Ừ đặt cho tôi bác sĩ Khắc lúc 10 giờ ngày 6/6 đi.
```

**✅ Kỳ vọng tại bước [4]:** Hệ thống phát hiện slot `10:00` không còn khả dụng trong database → Báo lỗi đặt thất bại → Kích hoạt UX Fallback Hotline `1900 xxxx`.

---

## 🎭 TC-FL-02: CONTEXT DRIFT — Hỏi ngoài lề rồi quay lại

> **Mục tiêu:** Bệnh nhân vừa hỏi về triệu chứng, vừa hỏi về lịch khám. AI từ chối tư vấn y tế nhưng vẫn tiếp tục hỗ trợ đổi lịch.

```
👤 [1] Bé nhà tôi 4 tuổi sốt 38 độ, ho nhiều. Cho tôi hỏi uống thuốc gì đỡ không?

👤 [2] Ừ thôi vậy. Thế bác sĩ Lê Sỹ Hùng ngày mai còn khám không?

👤 [3] Không còn thì mấy ông khác ai còn không?

👤 [4] Bác sĩ Khắc sáng còn gì không?

👤 [5] Thôi 8 rưỡi đi.
```

**✅ Kỳ vọng tại bước [1]:** AI từ chối tư vấn thuốc theo đúng Guardrails, đồng cảm với tình trạng của bé, gợi ý kiểm tra lịch bác sĩ Nhi.  
**✅ Kỳ vọng tại bước [5]:** Đặt thành công slot `08:30` ngày `2026-06-06`, doctor `doc_nhi_002`.

---

## 🎭 TC-CX-01: COMPLEX — Ràng buộc đa điều kiện (Buổi + Ngày + Chuyên khoa)

> **Mục tiêu:** Bệnh nhân đặt ra nhiều điều kiện cùng lúc nhưng diễn đạt không rõ ràng. AI phải hỏi lại và lọc đúng kết quả.

```
👤 [1] Tôi muốn đổi lịch nhưng tôi chỉ rảnh buổi sáng thôi.

👤 [2] Bác sĩ Hùng ấy, nhưng ngày mai bận rồi thì ngày kia có không?

👤 [3] 7/6 đó, sáng còn không?

👤 [4] Có bác sĩ nào cùng khoa sáng ngày 7/6 không, không nhất thiết phải là bác sĩ Hùng.

👤 [5] Bác sĩ Trần Thị Trang Anh thì sao, có sáng 7/6 không?

👤 [6] 9 rưỡi được đó, đặt đi.
```

**✅ Kỳ vọng tại bước [1]:** AI hỏi lại bệnh nhân muốn gặp bác sĩ nào và ngày nào.  
**✅ Kỳ vọng tại bước [5]:** AI tra cứu đúng bác sĩ Trần Thị Trang Anh, tìm slot buổi sáng ngày `2026-06-07` (`09:30`).  
**✅ Kỳ vọng tại bước [6]:** Đặt thành công slot `09:30` ngày `2026-06-07`, doctor `doc_nhi_012`.

---

## 🎭 TC-CX-02: FUZZY MATCHING — Sai chính tả, viết tắt thời gian

> **Mục tiêu:** Bệnh nhân gõ sai chính tả và dùng cách nói dân gian. AI phải tự nhận diện đúng ý định.

```
👤 [1] bắt sỉ Lê sỉ Hùng bận thì đổi xang bác sỉ khác cùng khoa giúp tui nha, khám lúc 2h chìu mai

👤 [2] ừ bất kỳ bắt sỉ nào cùng khoa cũng được, miễn có giờ 2h chiều

👤 [3] bắt sỉ Khắc đó thì sao

👤 [4] ok đặt đi
```

**✅ Kỳ vọng tại bước [1]:** AI nhận diện đúng `Lê sỉ Hùng` = Lê Sỹ Hùng, `2h chìu mai` = `14:00 ngày 2026-06-06`, đề xuất các bác sĩ cùng khoa có slot 14:00.  
**✅ Kỳ vọng tại bước [4]:** Đặt thành công slot `14:00` ngày `2026-06-06`, doctor `doc_nhi_002` (bác sĩ Phạm Công Khắc).

---

## 🎭 TC-CX-03: CONTEXT INTERRUPTION — Hỏi ngang rồi phục hồi

> **Mục tiêu:** Bệnh nhân đang trong luồng chốt lịch nhưng bất ngờ hỏi câu ngoài lề. AI trả lời rồi chủ động kéo về luồng chính.

```
👤 [1] Đổi sang bác sĩ Phạm Công Khắc ngày 6/6 cho tôi.

👤 [2] Mấy giờ trống hả?

👤 [3] À khoan, phòng khám đó nằm ở tòa nhà nào vậy? Có chỗ đậu xe không?

👤 [4] Ừ thôi 8 rưỡi đi, chốt vậy.
```

**✅ Kỳ vọng tại bước [3]:** AI giải thích không có dữ liệu về vị trí phòng khám trong hệ thống, đồng thời chủ động hỏi lại: *"Quay lại việc đổi lịch, bác sĩ Khắc có các giờ trống là 08:30, 10:00, 15:30 ngày 6/6. Bạn muốn chọn giờ nào?"*  
**✅ Kỳ vọng tại bước [4]:** Đặt thành công slot `08:30` ngày `2026-06-06`, doctor `doc_nhi_002`.

---
*📝 Lưu log mỗi phiên thủ công vào thư mục `test/logs/` theo định dạng `test_session_N_YYYYMMDD.md`*
