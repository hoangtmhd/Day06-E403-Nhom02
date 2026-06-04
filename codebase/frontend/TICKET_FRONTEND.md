# TICKET YÊU CẦU TÍCH HỢP FRONTEND - NGƯỜI THỰC HIỆN: MINH

**Mục tiêu:** Tích hợp giao diện tĩnh (HTML/CSS/JS) hiện tại của chuyên khoa và chatbot trợ lý với server API Backend (FastAPI chạy tại cổng 8000), cập nhật dữ liệu bác sĩ thời gian thực và xử lý luồng đổi lịch y tế AI.

---

## 📋 Nhiệm vụ 1: Cập nhật Dropdown chuyên khoa trong HTML
**Tệp cần sửa:** [codebase/frontend/index.html](file:///d:/Work/Study/ai-in-action/Lab6/Day06-E403-Nhom02/codebase/frontend/index.html)
Thêm chuyên khoa **Trung tâm Nhi khoa** vào danh sách các dropdown item để đồng bộ với dữ liệu bác sĩ đã crawl trong database:

```html
<!-- Chèn dòng này vào đầu khối <div class="dropdown-list"> ở dòng 92 -->
<div class="dropdown-item" data-value="Trung tâm Nhi khoa">
    <div class="item-title">Trung tâm Nhi khoa</div>
    <div class="item-desc"><span class="highlight">Triệu chứng:</span> KHÁM BỆNH CHO TRẺ EM, CÁC TRIỆU CHỨNG SỐT, HO, KHÒ KHÈ, SUY DINH DƯỠNG...</div>
</div>
```

---

## 📋 Nhiệm vụ 2: Viết mã CSS cho Thẻ Xác nhận và Nhãn Bận
**Tệp cần sửa:** [codebase/frontend/css/styles.css](file:///d:/Work/Study/ai-in-action/Lab6/Day06-E403-Nhom02/codebase/frontend/css/styles.css)
Thêm các định dạng kiểu hiển thị cho nhãn bận của bác sĩ ngoài màn hình chính và các trạng thái thẻ xác nhận đặt lịch (màu cam), đặt thành công (màu xanh lá - có nút hoàn tác), lỗi trùng lịch (màu đỏ - có hotline cứu hộ) trong chat:

```css
/* Chèn các styles này vào cuối tệp styles.css */

.busy-badge {
    display: inline-block;
    background-color: #ffebee;
    color: #c62828;
    padding: 6px 10px;
    border-radius: 4px;
    font-size: 13px;
    font-weight: 500;
    margin-top: 5px;
    border: 1px solid #ffcdd2;
}

.booking-confirm-card {
    background-color: #fff3e0;
    border: 1px solid #ffe0b2;
    border-radius: 8px;
    padding: 12px;
    margin-top: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    width: 100%;
}

.booking-confirm-card h4 {
    color: #e65100;
    font-size: 13px;
    margin-bottom: 6px;
    text-transform: uppercase;
    font-weight: bold;
    margin-top: 0;
}

.booking-confirm-card p {
    font-size: 13px;
    margin-bottom: 4px;
    color: #5d4037;
    line-height: 1.4;
}

.booking-confirm-card .card-actions {
    margin-top: 10px;
    display: flex;
    gap: 8px;
}

.booking-confirm-card button, 
.booking-confirm-card a.btn-link {
    padding: 8px 12px;
    font-size: 12px;
    font-weight: bold;
    border-radius: 4px;
    cursor: pointer;
    border: none;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    transition: all 0.2s;
}

.booking-confirm-card .confirm-btn {
    background-color: #ef6c00;
    color: white;
}

.booking-confirm-card .confirm-btn:hover {
    background-color: #e65100;
}

/* Trạng thái thành công */
.booking-confirm-card.success {
    background-color: #e8f5e9;
    border-color: #c8e6c9;
}

.booking-confirm-card.success h4 {
    color: #2e7d32;
}

.booking-confirm-card.success p {
    color: #1b5e20;
}

.booking-confirm-card.success .undo-btn {
    background-color: #2e7d32;
    color: white;
}

.booking-confirm-card.success .undo-btn:hover {
    background-color: #1b5e20;
}

/* Trạng thái lỗi trùng lịch / UX Cứu Hộ */
.booking-confirm-card.failure {
    background-color: #ffebee;
    border-color: #ffcdd2;
}

.booking-confirm-card.failure h4 {
    color: #c62828;
}

.booking-confirm-card.failure p {
    color: #b71c1c;
}

.booking-confirm-card.failure .hotline-btn {
    background-color: #e53935;
    color: white;
}

.booking-confirm-card.failure .hotline-btn:hover {
    background-color: #c62828;
}

/* Trạng thái thông tin hoàn tác */
.booking-confirm-card.info {
    background-color: #eceff1;
    border-color: #cfd8dc;
}

.booking-confirm-card.info h4 {
    color: #37474f;
}

.booking-confirm-card.info p {
    color: #263238;
}
```

---

## 📋 Nhiệm vụ 3: Tích hợp gọi API động trong JavaScript
**Tệp cần sửa:** [codebase/frontend/js/app.js](file:///d:/Work/Study/ai-in-action/Lab6/Day06-E403-Nhom02/codebase/frontend/js/app.js)
Thay đổi toàn bộ logic tĩnh cũ sang gọi fetch API thật đến máy chủ backend chạy tại địa chỉ `http://localhost:8000`.

### Chi tiết các khối mã tích hợp cần thực hiện:

#### 1. Quản lý trạng thái và ánh xạ ngày
Định nghĩa biến trạng thái và ánh xạ định dạng ngày hiển thị (VD: `5/6`) sang ngày chuẩn DB `2026-06-05`:

```javascript
// Thêm vào trong khối DOMContentLoaded ở đầu file:
let selectedDepartment = "";
let currentDoctorsData = []; // Lưu trữ dữ liệu bác sĩ khoa được chọn
let chatHistory = []; // Lưu lịch sử chat theo phiên (session-scoped) phục vụ gửi AI

function getSelectedDateString() {
    const activeBtn = document.querySelector('.date-btn.active');
    if (!activeBtn) return "2026-06-04";
    const dayText = activeBtn.querySelector('.date-day').textContent.trim(); // "5/6"
    const parts = dayText.split('/');
    const day = parts[0].padStart(2, '0');
    const month = parts[1].padStart(2, '0');
    return `2026-${month}-${day}`;
}
```

#### 2. Kết hợp lắng nghe sự kiện chuyển ngày khám
```javascript
// Cập nhật lại sự kiện click nút ngày khám:
const dateBtns = document.querySelectorAll('.date-btn');
dateBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        dateBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Gọi render lại bác sĩ theo ngày mới
        if (selectedDepartment) {
            renderDoctors();
        }
    });
});
```

#### 3. Thay đổi sự kiện chọn dropdown chuyên khoa
```javascript
// Tìm khối dropdownItems.forEach và thay bằng:
dropdownItems.forEach(item => {
    item.addEventListener('click', () => {
        const title = item.querySelector('.item-title').textContent;
        selectedText.textContent = title;
        selectedText.style.color = '#333';
        dropdown.classList.remove('open');

        selectedDepartment = item.getAttribute('data-value');
        
        btnContinue.disabled = false;
        btnContinue.classList.remove('btn-disabled');
        btnContinue.classList.add('btn-active');

        loadDoctors(); // Gọi hàm fetch bác sĩ thật
    });
});
```

#### 4. Khai báo các hàm fetch và hiển thị bác sĩ thời gian thực
Viết các hàm `loadDoctors` và `renderDoctors` kết nối API:

```javascript
async function loadDoctors() {
    if (!selectedDepartment) return;

    doctorsList.innerHTML = `<p style="padding: 10px; color: #666;"><i class="fa-solid fa-spinner fa-spin"></i> Đang tải danh sách Bác sĩ...</p>`;
    infoMessageContainer.style.display = 'none';
    doctorsContainer.style.display = 'block';

    try {
        const response = await fetch(`http://localhost:8000/api/doctors?department=${encodeURIComponent(selectedDepartment)}`);
        if (!response.ok) throw new Error("Không thể tải dữ liệu.");
        currentDoctorsData = await response.json();
        renderDoctors();
    } catch (error) {
        console.error(error);
        doctorsList.innerHTML = `<p style="padding: 10px; color: #ff4d4f;"><i class="fa-solid fa-circle-exclamation"></i> Lỗi: Không thể kết nối với server backend (cổng 8000).</p>`;
    }
}

function renderDoctors() {
    if (!currentDoctorsData || currentDoctorsData.length === 0) {
        doctorsList.innerHTML = `<p style="padding: 15px; color: #666;">Không có dữ liệu lịch khám cho chuyên khoa này.</p>`;
        return;
    }

    const selectedDate = getSelectedDateString();
    let html = "";

    currentDoctorsData.forEach(doc => {
        const sched = doc.schedule.find(s => s.date === selectedDate);
        let scheduleHTML = "";

        if (sched) {
            if (sched.status === "busy") {
                // Hiển thị trực quan nhãn bận đỏ kèm lý do
                scheduleHTML = `
                    <div class="busy-badge">
                        <i class="fa-solid fa-calendar-minus"></i> Bận đột xuất: ${sched.reason || "Lịch hội chẩn đột xuất"}
                    </div>
                `;
            } else if (sched.status === "available" && sched.slots && sched.slots.length > 0) {
                const slotBtns = sched.slots.map(slot => 
                    `<button class="slot-btn" data-doc-id="${doc.id}" data-date="${selectedDate}" data-slot="${slot}">${slot}</button>`
                ).join("");
                scheduleHTML = `
                    <div class="schedule-day">Lịch khám trống:</div>
                    ${slotBtns}
                `;
            } else {
                scheduleHTML = `<p style="color: #999; font-size: 13px; font-style: italic; margin-top: 5px;">Hết lịch khám trống.</p>`;
            }
        } else {
            scheduleHTML = `<p style="color: #999; font-size: 13px; font-style: italic; margin-top: 5px;">Không có lịch trực vào ngày này.</p>`;
        }

        html += `
            <div class="doctor-card" id="doc-card-${doc.id}">
                <div class="doctor-info">
                    <div class="doctor-name">${doc.title && doc.title !== 'Không có' ? doc.title + '. ' : ''}${doc.name}</div>
                    <div class="doctor-role">${doc.role} - Bệnh viện Bạch Mai</div>
                    <div class="doctor-schedule">
                        ${scheduleHTML}
                    </div>
                </div>
            </div>
        `;
    });

    doctorsList.innerHTML = html;

    // Lắng nghe sự kiện bấm vào các slot khám trống
    const slotBtns = doctorsList.querySelectorAll('.slot-btn');
    slotBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const docId = btn.getAttribute('data-doc-id');
            const date = btn.getAttribute('data-date');
            const slot = btn.getAttribute('data-slot');
            const doc = currentDoctorsData.find(d => d.id === docId);
            
            // Mở khung chat và chèn thẻ xác nhận thủ công
            chatbotWindow.classList.add('open');
            chatbotBubble.style.display = 'none';
            appendAIMessage(`Bạn đã chọn khung giờ **${slot}** ngày **${date}** của bác sĩ **${doc.name}**. Bạn vui lòng xác nhận đổi lịch khám dưới đây:`);
            appendConfirmationCard(docId, doc.name, date, slot);
        });
    });
}
```

#### 5. Thay đổi hàm gửi tin nhắn của Chatbot tới API và ghi log
```javascript
// Cập nhật lại hàm sendMessage() gốc:
async function sendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    // 1. Thêm tin nhắn user vào UI và lưu log localStorage
    appendUserMessage(text);
    chatInput.value = '';
    saveToLocalStorageLogs("user", text);

    showTypingIndicator();

    // 2. Gọi API chat
    try {
        const response = await fetch('http://localhost:8000/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text, history: chatHistory })
        });

        removeTypingIndicator();
        if (!response.ok) throw new Error("Lỗi kết nối AI.");
        const result = await response.json();

        // Hiển thị câu trả lời tự nhiên
        appendAIMessage(result.reply);
        saveToLocalStorageLogs("model", result.reply);

        // Lưu lịch sử theo phiên hiện tại
        chatHistory.push({ "role": "user", "parts": [text] });
        chatHistory.push({ "role": "model", "parts": [result.reply] });

        // 3. Nếu AI phát hiện ý định đặt lịch khám (booking_intent)
        if (result.booking_intent) {
            const intent = result.booking_intent;
            let doctorName = intent.doctor_id;
            
            // Tìm tên bác sĩ bằng cách lấy từ master data
            try {
                const docResp = await fetch('http://localhost:8000/api/doctors');
                if (docResp.ok) {
                    const allDocs = await docResp.json();
                    const foundDoc = allDocs.find(d => d.id === intent.doctor_id);
                    if (foundDoc) doctorName = foundDoc.name;
                }
            } catch (e) {}

            appendConfirmationCard(intent.doctor_id, doctorName, intent.date, intent.slot);
        }
    } catch (error) {
        console.error(error);
        removeTypingIndicator();
        appendAIMessage("Dạ, dịch vụ chatbot đang gặp sự cố. Xin vui lòng thử lại sau.");
    }
}

// Các hàm phụ trợ chat log
function appendUserMessage(text) {
    const userMsgHTML = `<div class="message user-message"><div class="msg-avatar"><i class="fa-solid fa-user"></i></div><div class="msg-bubble">${text}</div></div>`;
    chatMessages.insertAdjacentHTML('beforeend', userMsgHTML);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function appendAIMessage(text) {
    const formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    const aiMsgHTML = `<div class="message ai-message"><div class="msg-avatar"><i class="fa-solid fa-robot"></i></div><div class="msg-bubble">${formattedText}</div></div>`;
    chatMessages.insertAdjacentHTML('beforeend', aiMsgHTML);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showTypingIndicator() {
    const typingHTML = `<div class="message ai-message" id="typing-indicator"><div class="msg-avatar"><i class="fa-solid fa-robot"></i></div><div class="msg-bubble"><div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div></div></div>`;
    chatMessages.insertAdjacentHTML('beforeend', typingHTML);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) indicator.remove();
}

function saveToLocalStorageLogs(role, text) {
    try {
        const logs = JSON.parse(localStorage.getItem('bachmai_care_chat_logs') || "[]");
        logs.push({ timestamp: new Date().toISOString(), role: role, text: text });
        localStorage.setItem('bachmai_care_chat_logs', JSON.stringify(logs));
    } catch (e) {}
}
```

#### 6. Xử lý Thẻ Xác nhận, Thẻ xanh (Hoàn tác), Thẻ đỏ (Hotline cứu hộ) trong chat log
Thêm hàm xây dựng và quản lý thẻ tương tác đổi lịch:

```javascript
function appendConfirmationCard(doctorId, doctorName, date, slot) {
    const cardId = `confirm-card-${Date.now()}`;
    const cardHTML = `
        <div class="message ai-message">
            <div class="msg-avatar"><i class="fa-solid fa-robot"></i></div>
            <div class="booking-confirm-card" id="${cardId}">
                <h4>Đề xuất dời lịch khám</h4>
                <p><strong>Bác sĩ khám:</strong> ${doctorName}</p>
                <p><strong>Ngày khám:</strong> ${date}</p>
                <p><strong>Khung giờ:</strong> ${slot}</p>
                <div class="card-actions">
                    <button class="confirm-btn">Bấm để xác nhận</button>
                </div>
            </div>
        </div>
    `;
    
    chatMessages.insertAdjacentHTML('beforeend', cardHTML);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    const card = document.getElementById(cardId);
    const confirmBtn = card.querySelector('.confirm-btn');

    confirmBtn.addEventListener('click', async () => {
        confirmBtn.disabled = true;
        confirmBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Đang đặt...`;

        try {
            const response = await fetch('http://localhost:8000/api/confirm-booking', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ doctor_id: doctorId, date: date, slot: slot })
            });

            if (!response.ok) throw new Error();
            const result = await response.json();

            if (result.success) {
                // --- THÀNH CÔNG (THẺ XANH) + NÚT HOÀN TÁC ---
                card.className = "booking-confirm-card success";
                card.innerHTML = `
                    <h4>Đổi lịch thành công</h4>
                    <p><i class="fa-solid fa-circle-check"></i> Đã đổi lịch khám sang bác sĩ <strong>${doctorName}</strong> lúc <strong>${slot}</strong> ngày <strong>${date}</strong>.</p>
                    <div class="card-actions">
                        <button class="undo-btn">Hoàn tác dời lịch</button>
                    </div>
                `;

                loadDoctors(); // Cập nhật lại UI chính mất slot giờ
                chatHistory = []; // Reset phiên AI

                // Nút hoàn tác (Undo)
                const undoBtn = card.querySelector('.undo-btn');
                undoBtn.addEventListener('click', async () => {
                    undoBtn.disabled = true;
                    undoBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Đang hủy...`;

                    try {
                        const undoResp = await fetch('http://localhost:8000/api/undo-booking', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ doctor_id: doctorId, date: date, slot: slot })
                        });

                        if (undoResp.ok && (await undoResp.json()).success) {
                            card.className = "booking-confirm-card info";
                            card.innerHTML = `
                                <h4>Đã hoàn tác lịch hẹn</h4>
                                <p><i class="fa-solid fa-circle-info"></i> Lịch hẹn đã được hủy thành công và khôi phục lại trạng thái cũ.</p>
                            `;
                            loadDoctors(); // Khôi phục slot lên màn hình chính
                        } else {
                            alert("Không thể hoàn tác lịch hẹn.");
                            undoBtn.disabled = false;
                            undoBtn.innerHTML = "Hoàn tác dời lịch";
                        }
                    } catch (e) {
                        undoBtn.disabled = false;
                        undoBtn.innerHTML = "Hoàn tác dời lịch";
                    }
                });

            } else {
                // --- THẤT BẠI CỤC BỘ (XUNG ĐỘT) -> THẺ ĐỎ UX CỨU HỘ HOTLINE ---
                triggerFallbackUX(card, doctorName, date, slot);
            }
        } catch (error) {
            // --- THẤT BẠI KẾT NỐI -> THẺ ĐỎ UX CỨU HỘ HOTLINE ---
            triggerFallbackUX(card, doctorName, date, slot);
        }
    });
}

function triggerFallbackUX(card, doctorName, date, slot) {
    card.className = "booking-confirm-card failure";
    card.innerHTML = `
        <h4>Xung đột lịch khám</h4>
        <p><i class="fa-solid fa-triangle-exclamation"></i> Khung giờ <strong>${slot}</strong> ngày <strong>${date}</strong> của bác sĩ <strong>${doctorName}</strong> vừa bị đăng ký mất hoặc bận đột xuất.</p>
        <p>Vui lòng kết nối ngay với Tổng đài hỗ trợ để được nhân viên xử lý.</p>
        <div class="card-actions">
            <a href="tel:1900888866" class="btn-link hotline-btn"><i class="fa-solid fa-phone-volume"></i> Kết nối Tổng đài hỗ trợ</a>
        </div>
    `;
}
```
