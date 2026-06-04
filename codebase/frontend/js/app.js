document.addEventListener('DOMContentLoaded', () => {
    // --- STATE MANAGEMENT ---
    let selectedDepartment = "";
    let currentDoctorsData = []; // Mảng chứa danh sách bác sĩ của chuyên khoa đang chọn
    let chatHistory = []; // Lưu lịch sử chat của phiên hiện tại gửi lên AI (session-scoped)

    // DOM Elements
    const infoMessageContainer = document.getElementById('info-message-container');
    const doctorsContainer = document.getElementById('doctors-container');
    const doctorsList = document.getElementById('doctors-list');
    const btnContinue = document.getElementById('btn-continue');
    
    // Custom Dropdown Elements
    const dropdown = document.getElementById('department-dropdown');
    const dropdownHeader = dropdown.querySelector('.dropdown-header');
    const selectedText = dropdown.querySelector('.selected-text');
    const searchInput = document.getElementById('department-search');
    const dropdownItems = dropdown.querySelectorAll('.dropdown-item');

    // Toggle dropdown
    dropdownHeader.addEventListener('click', () => {
        dropdown.classList.toggle('open');
        if (dropdown.classList.contains('open')) {
            searchInput.focus();
        }
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target)) {
            dropdown.classList.remove('open');
        }
    });

    // Search filter
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        dropdownItems.forEach(item => {
            const text = item.textContent.toLowerCase();
            if (text.includes(query)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    });

    // --- DATE SELECT LOGIC ---
    const dateBtns = document.querySelectorAll('.date-btn');
    dateBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            dateBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Render lại danh sách bác sĩ theo ngày mới chọn
            if (selectedDepartment) {
                renderDoctors();
            }
        });
    });

    /**
     * Chuyển đổi ngày hiển thị trên giao diện (ví dụ: "5/6") thành định dạng chuẩn "YYYY-MM-DD"
     */
    function getSelectedDateString() {
        const activeBtn = document.querySelector('.date-btn.active');
        if (!activeBtn) return "2026-06-04";
        const dayText = activeBtn.querySelector('.date-day').textContent.trim(); // ví dụ: "5/6"
        const parts = dayText.split('/');
        const day = parts[0].padStart(2, '0');
        const month = parts[1].padStart(2, '0');
        return `2026-${month}-${day}`; // Mặc định năm học 2026 theo dự án
    }

    // Handle department item selection
    dropdownItems.forEach(item => {
        item.addEventListener('click', () => {
            const title = item.querySelector('.item-title').textContent;
            selectedText.textContent = title;
            selectedText.style.color = '#333';
            dropdown.classList.remove('open');

            selectedDepartment = item.getAttribute('data-value');
            
            // Kích hoạt nút Tiếp tục
            btnContinue.disabled = false;
            btnContinue.classList.remove('btn-disabled');
            btnContinue.classList.add('btn-active');

            // Gọi API tải danh sách bác sĩ
            loadDoctors();
        });
    });

    /**
     * Tải danh sách bác sĩ của chuyên khoa được chọn từ Backend
     */
    async function loadDoctors() {
        if (!selectedDepartment) return;

        doctorsList.innerHTML = `<p style="padding: 10px; color: #666;"><i class="fa-solid fa-spinner fa-spin"></i> Đang tải danh sách Bác sĩ...</p>`;
        infoMessageContainer.style.display = 'none';
        doctorsContainer.style.display = 'block';

        try {
            const response = await fetch(`http://localhost:8000/api/doctors?department=${encodeURIComponent(selectedDepartment)}`);
            if (!response.ok) throw new Error("Không thể tải dữ liệu bác sĩ.");
            currentDoctorsData = await response.json();
            renderDoctors();
        } catch (error) {
            console.error("Lỗi kết nối API:", error);
            doctorsList.innerHTML = `
                <p style="padding: 10px; color: #ff4d4f;">
                    <i class="fa-solid fa-circle-exclamation"></i> Lỗi: Không thể kết nối với máy chủ API. 
                    Vui lòng đảm bảo server backend đang chạy tại cổng 8000.
                </p>
            `;
        }
    }

    /**
     * Vẽ danh sách bác sĩ và lịch khám lên màn hình
     */
    function renderDoctors() {
        if (!currentDoctorsData || currentDoctorsData.length === 0) {
            doctorsList.innerHTML = `<p style="padding: 15px; color: #666; font-style: italic;">Không có dữ liệu lịch khám cho chuyên khoa này.</p>`;
            return;
        }

        const selectedDate = getSelectedDateString();
        let html = "";

        currentDoctorsData.forEach(doc => {
            // Tìm lịch khám của ngày đang chọn
            const sched = doc.schedule.find(s => s.date === selectedDate);
            let scheduleHTML = "";

            if (sched) {
                if (sched.status === "busy") {
                    // Hiển thị trực quan trạng thái bận đột xuất kèm lý do
                    scheduleHTML = `
                        <div class="busy-badge">
                            <i class="fa-solid fa-calendar-minus"></i> Bận đột xuất: ${sched.reason || "Lịch họp/Hội chẩn đột xuất"}
                        </div>
                    `;
                } else if (sched.status === "available" && sched.slots && sched.slots.length > 0) {
                    // Hiển thị các nút khung giờ khám trống
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

        // Gắn sự kiện click vào các slot-btn để hiển thị cảnh báo/hướng dẫn
        const slotBtns = doctorsList.querySelectorAll('.slot-btn');
        slotBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const docId = btn.getAttribute('data-doc-id');
                const date = btn.getAttribute('data-date');
                const slot = btn.getAttribute('data-slot');
                const doc = currentDoctorsData.find(d => d.id === docId);
                
                // Mở khung chat và gợi ý đổi lịch
                chatbotWindow.classList.add('open');
                chatbotBubble.style.display = 'none';
                
                appendAIMessage(`Bạn đã chọn khung giờ **${slot}** ngày **${date}** của bác sĩ **${doc.name}**. Bạn có muốn tiến hành xác nhận đặt lịch khám không?`);
                
                // Đưa thẻ xác nhận thủ công vào chat
                appendConfirmationCard(docId, doc.name, date, slot);
            });
        });
    }


    // --- AI CHATBOT LOGIC ---
    const chatbotBubble = document.getElementById('chatbot-bubble');
    const chatbotWindow = document.getElementById('chatbot-window');
    const closeChatBtn = document.getElementById('close-chat');
    const chatInput = document.getElementById('chat-input');
    const sendChatBtn = document.getElementById('send-chat');
    const chatMessages = document.getElementById('chat-messages');

    // Toggle chat window
    chatbotBubble.addEventListener('click', () => {
        chatbotWindow.classList.add('open');
        chatbotBubble.style.display = 'none';
        chatInput.focus();
    });

    closeChatBtn.addEventListener('click', () => {
        chatbotWindow.classList.remove('open');
        chatbotBubble.style.display = 'flex';
    });

    // Send on button click
    sendChatBtn.addEventListener('click', handleUserSendMessage);

    // Send on Enter key
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleUserSendMessage();
        }
    });

    /**
     * Xử lý gửi tin nhắn của người dùng
     */
    async function handleUserSendMessage() {
        const text = chatInput.value.trim();
        if (!text) return;

        // 1. Thêm tin nhắn user vào giao diện
        appendUserMessage(text);
        chatInput.value = '';

        // Lưu log lịch sử tổng hợp vào localStorage
        saveToLocalStorageLogs("user", text);

        // 2. Thêm hiệu ứng gõ chữ (typing indicator)
        showTypingIndicator();

        // 3. Gọi API Chat tới backend
        try {
            const response = await fetch('http://localhost:8000/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: text,
                    history: chatHistory
                })
            });

            removeTypingIndicator();

            if (!response.ok) throw new Error("Lỗi phản hồi từ AI server.");
            const result = await response.json();

            // Hiển thị phản hồi của AI
            appendAIMessage(result.reply);
            saveToLocalStorageLogs("model", result.reply);

            // Cập nhật lịch sử chat gửi AI
            chatHistory.push({ "role": "user", "parts": [text] });
            chatHistory.push({ "role": "model", "parts": [result.reply] });

            // 4. Nếu phát hiện ý định đặt lịch khám (booking_intent)
            if (result.booking_intent) {
                const intent = result.booking_intent;
                // Tìm tên bác sĩ từ cơ sở dữ liệu nếu có
                let doctorName = intent.doctor_id;
                
                // Fetch danh sách toàn bộ bác sĩ để đảm bảo tìm thấy thông tin khớp ID
                try {
                    const docResp = await fetch('http://localhost:8000/api/doctors');
                    if (docResp.ok) {
                        const allDocs = await docResp.json();
                        const foundDoc = allDocs.find(d => d.id === intent.doctor_id);
                        if (foundDoc) doctorName = foundDoc.name;
                    }
                } catch (e) {
                    console.warn("Không thể tìm tên bác sĩ bằng ID, dùng ID tạm:", e);
                }

                // Hiển thị thẻ xác nhận đổi lịch khám thủ công
                appendConfirmationCard(intent.doctor_id, doctorName, intent.date, intent.slot);
            }

        } catch (error) {
            console.error("Lỗi chat AI:", error);
            removeTypingIndicator();
            appendAIMessage("Dạ, hiện tại tôi không thể kết nối đến máy chủ AI. Xin vui lòng kiểm tra xem server backend đã chạy chưa hoặc thử lại sau ít phút.");
        }
    }

    // --- CÁC HÀM PHỤ TRỢ CHAT LOG ---

    function appendUserMessage(text) {
        const userMsgHTML = `
            <div class="message user-message">
                <div class="msg-avatar"><i class="fa-solid fa-user"></i></div>
                <div class="msg-bubble">${text}</div>
            </div>
        `;
        chatMessages.insertAdjacentHTML('beforeend', userMsgHTML);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function appendAIMessage(text) {
        // Hỗ trợ hiển thị in đậm markdown đơn giản
        const formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        const aiMsgHTML = `
            <div class="message ai-message">
                <div class="msg-avatar"><i class="fa-solid fa-robot"></i></div>
                <div class="msg-bubble">${formattedText}</div>
            </div>
        `;
        chatMessages.insertAdjacentHTML('beforeend', aiMsgHTML);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function showTypingIndicator() {
        const typingHTML = `
            <div class="message ai-message" id="typing-indicator">
                <div class="msg-avatar"><i class="fa-solid fa-robot"></i></div>
                <div class="msg-bubble">
                    <div class="typing-indicator">
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                    </div>
                </div>
            </div>
        `;
        chatMessages.insertAdjacentHTML('beforeend', typingHTML);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function removeTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) indicator.remove();
    }

    /**
     * Ghi log cuộc gọi vào localStorage để phân tích sau này
     */
    function saveToLocalStorageLogs(role, text) {
        try {
            const logs = JSON.parse(localStorage.getItem('bachmai_care_chat_logs') || "[]");
            logs.push({
                timestamp: new Date().toISOString(),
                role: role,
                text: text
            });
            localStorage.setItem('bachmai_care_chat_logs', JSON.stringify(logs));
        } catch (e) {
            console.error("Lỗi lưu localStorage:", e);
        }
    }

    /**
     * Chèn thẻ Xác nhận Đặt lịch vào trong Chat Log
     */
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
            confirmBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Đang xử lý...`;

            try {
                // Gọi API đặt lịch khám
                const response = await fetch('http://localhost:8000/api/confirm-booking', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        doctor_id: doctorId,
                        date: date,
                        slot: slot
                    })
                });

                if (!response.ok) throw new Error("Đặt lịch thất bại.");
                const result = await response.json();

                if (result.success) {
                    // --- THÀNH CÔNG (THẺ XANH) ---
                    card.className = "booking-confirm-card success";
                    card.innerHTML = `
                        <h4>Đổi lịch thành công</h4>
                        <p><i class="fa-solid fa-circle-check"></i> Đã đổi lịch khám sang bác sĩ <strong>${doctorName}</strong> lúc <strong>${slot}</strong> ngày <strong>${date}</strong>.</p>
                        <div class="card-actions">
                            <button class="undo-btn">Hoàn tác dời lịch</button>
                        </div>
                    `;

                    // Tải lại danh sách bác sĩ ngoài màn hình để cập nhật slot trống thời gian thực
                    loadDoctors();

                    // Reset nội dung chatHistory gửi AI để tránh nhầm lẫn sang phiên mới
                    chatHistory = [];

                    // Xử lý nút hoàn tác (Undo)
                    const undoBtn = card.querySelector('.undo-btn');
                    undoBtn.addEventListener('click', async () => {
                        undoBtn.disabled = true;
                        undoBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Đang hủy...`;

                        try {
                            const undoResponse = await fetch('http://localhost:8000/api/undo-booking', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    doctor_id: doctorId,
                                    date: date,
                                    slot: slot
                                })
                            });

                            if (!undoResponse.ok) throw new Error("Hoàn tác thất bại.");
                            const undoResult = await undoResponse.json();

                            if (undoResult.success) {
                                card.className = "booking-confirm-card info";
                                card.innerHTML = `
                                    <h4>Đã hoàn tác lịch hẹn</h4>
                                    <p><i class="fa-solid fa-circle-info"></i> Lịch hẹn đã được hủy thành công và khôi phục lại trạng thái cũ.</p>
                                `;
                                loadDoctors();
                            } else {
                                alert("Hoàn tác thất bại: " + undoResult.message);
                                undoBtn.disabled = false;
                                undoBtn.innerHTML = "Hoàn tác dời lịch";
                            }
                        } catch (err) {
                            console.error("Lỗi khi hoàn tác:", err);
                            alert("Không thể kết nối đến máy chủ để hoàn tác lịch khám.");
                            undoBtn.disabled = false;
                            undoBtn.innerHTML = "Hoàn tác dời lịch";
                        }
                    });

                } else {
                    // --- THẤT BẠI CỤC BỘ (Xung đột database) -> UX CỨU HỘ (THẺ ĐỎ) ---
                    triggerFallbackUX(card, doctorName, date, slot);
                }
            } catch (error) {
                console.error("Lỗi đặt lịch:", error);
                // --- THẤT BẠI KẾT NỐI -> UX CỨU HỘ (THẺ ĐỎ) ---
                triggerFallbackUX(card, doctorName, date, slot);
            }
        });
    }

    /**
     * Kích hoạt Thẻ cứu hộ màu đỏ (UX Fallback) kết nối hotline khi lỗi
     */
    function triggerFallbackUX(card, doctorName, date, slot) {
        card.className = "booking-confirm-card failure";
        card.innerHTML = `
            <h4>Xung đột lịch khám</h4>
            <p><i class="fa-solid fa-triangle-exclamation"></i> Xin lỗi bạn, khung giờ <strong>${slot}</strong> ngày <strong>${date}</strong> của bác sĩ <strong>${doctorName}</strong> vừa được đăng ký mất hoặc bận đột xuất.</p>
            <p>Để được xử lý nhanh chóng nhất, bạn vui lòng kết nối ngay với Tổng đài hỗ trợ của chúng tôi.</p>
            <div class="card-actions">
                <a href="tel:1900888866" class="btn-link hotline-btn">
                    <i class="fa-solid fa-phone-volume"></i> Kết nối Tổng đài hỗ trợ
                </a>
            </div>
        `;
    }

});
