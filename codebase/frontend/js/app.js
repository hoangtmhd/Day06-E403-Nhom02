document.addEventListener('DOMContentLoaded', () => {
    const infoMessage = document.querySelector('.info-message');
    const btnContinue = document.getElementById('btn-continue');

    // Custom Dropdown Logic
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

    // DOM Elements
    const infoMessageContainer = document.getElementById('info-message-container');
    const doctorsContainer = document.getElementById('doctors-container');
    const doctorsList = document.getElementById('doctors-list');

    // Render function
    const renderDoctors = (data) => {
        if (data.length === 0) {
            doctorsList.innerHTML = `<p style="padding: 10px; color: #666;">Không tìm thấy bác sĩ nào.</p>`;
            return;
        }

        let html = '';
        data.forEach(doctor => {
            let slotsHtml = '';
            if (doctor.schedule && doctor.schedule.length > 0) {
                doctor.schedule.forEach(day => {
                    if (day.status === 'available' && day.slots && day.slots.length > 0) {
                        slotsHtml += `<div class="schedule-day">Ngày ${day.date}:</div>`;
                        day.slots.forEach(slot => {
                            const slotDataStr = encodeURIComponent(JSON.stringify({
                                doctor_id: doctor.id,
                                doctor_name: doctor.name,
                                department: doctor.department || 'Bệnh viện Bạch Mai',
                                date: day.date,
                                slot: slot
                            }));
                            slotsHtml += `<button class="slot-btn" onclick="window.selectSlot(this, '${slotDataStr}')">${slot}</button>`;
                        });
                    }
                });
            }
            if (!slotsHtml) {
                slotsHtml = `<div class="schedule-day">Hiện tại bác sĩ đã kín lịch.</div>`;
            }

            html += `
                <div class="doctor-card">
                    <div class="doctor-info">
                        <div class="doctor-name">${doctor.name}</div>
                        <div class="doctor-role">${doctor.title} - ${doctor.role}</div>
                        <div class="doctor-schedule">
                            ${slotsHtml}
                        </div>
                    </div>
                </div>
            `;
        });
        doctorsList.innerHTML = html;
    };

    // Handle item selection
    dropdownItems.forEach(item => {
        item.addEventListener('click', () => {
            const title = item.querySelector('.item-title').textContent;
            selectedText.textContent = title;
            selectedText.style.color = '#333';
            dropdown.classList.remove('open');

            infoMessageContainer.style.display = 'none';
            doctorsContainer.style.display = 'block';
            doctorsList.innerHTML = `<p style="padding: 10px; color: #666;">Đang tải danh sách Bác sĩ từ file \`doctors.json\`...</p>`;

            btnContinue.disabled = false;
            btnContinue.classList.remove('btn-disabled');
            btnContinue.classList.add('btn-active');

            fetch('/api/doctors?department=' + encodeURIComponent(title))
                .then(response => response.json())
                .then(data => renderDoctors(data))
                .catch(err => {
                    doctorsList.innerHTML = `<p style="padding: 10px; color: red;">Lỗi khi tải danh sách Bác sĩ: ${err.message}</p>`;
                });
        });
    });

    // Handle Doctor Search
    const searchDoctorBtn = document.getElementById('btn-search-doctor');
    const doctorSearchBox = document.getElementById('doctor-search-box');
    if (searchDoctorBtn && doctorSearchBox) {
        searchDoctorBtn.addEventListener('click', () => {
            const query = doctorSearchBox.value.trim();
            if (!query) {
                alert('Vui lòng nhập tên bác sĩ cần tìm!');
                return;
            }

            // Clear dropdown selection
            selectedText.textContent = '- Chọn chuyên khoa -';
            selectedText.style.color = '';

            infoMessageContainer.style.display = 'none';
            doctorsContainer.style.display = 'block';
            doctorsList.innerHTML = `<p style="padding: 10px; color: #666;">Đang tìm kiếm bác sĩ...</p>`;

            btnContinue.disabled = false;
            btnContinue.classList.remove('btn-disabled');
            btnContinue.classList.add('btn-active');

            fetch('/api/search?q=' + encodeURIComponent(query))
                .then(response => response.json())
                .then(data => renderDoctors(data))
                .catch(err => {
                    doctorsList.innerHTML = `<p style="padding: 10px; color: red;">Lỗi khi tải danh sách Bác sĩ: ${err.message}</p>`;
                });
        });

        doctorSearchBox.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchDoctorBtn.click();
            }
        });
    }

    // Handle Equivalent Doctor Search
    const searchEquivBtn = document.getElementById('btn-search-equiv');
    const equivDoctorName = document.getElementById('equiv-doctor-name');
    const equivDoctorDate = document.getElementById('equiv-doctor-date');
    if (searchEquivBtn && equivDoctorName && equivDoctorDate) {
        searchEquivBtn.addEventListener('click', () => {
            const docName = equivDoctorName.value.trim();
            const docDate = equivDoctorDate.value;
            if (!docName || !docDate) {
                alert('Vui lòng nhập tên bác sĩ gốc và chọn ngày khám!');
                return;
            }

            // Clear dropdown selection
            selectedText.textContent = '- Chọn chuyên khoa -';
            selectedText.style.color = '';

            infoMessageContainer.style.display = 'none';
            doctorsContainer.style.display = 'block';
            doctorsList.innerHTML = `<p style="padding: 10px; color: #666;">Đang tìm kiếm bác sĩ tương đương...</p>`;

            btnContinue.disabled = false;
            btnContinue.classList.remove('btn-disabled');
            btnContinue.classList.add('btn-active');

            fetch(`/api/equivalent?doctor=${encodeURIComponent(docName)}&date=${encodeURIComponent(docDate)}`)
                .then(response => response.json())
                .then(data => {
                    // The API returns doctors with ONLY the schedule for that specific date.
                    // But our renderDoctors expects an array of doctors, which is fine since the API returns
                    // [{id, name, title, role, date, slots: []}]. Wait, the format is slightly different!
                    // find_equivalent_doctors returns: 
                    // [{"id": doc.get("id"), "name": doc.get("name"), "title": doc.get("title"), "role": doc.get("role"), "date": date, "slots": sched.get("slots", [])}]
                    // So we need to map it to match our renderDoctors expected format:
                    // [{id, name, title, role, schedule: [{date, status: 'available', slots: []}]}]
                    const mappedData = data.map(d => ({
                        id: d.id,
                        name: d.name,
                        title: d.title,
                        role: d.role,
                        schedule: [{
                            date: d.date,
                            status: 'available',
                            slots: d.slots
                        }]
                    }));
                    renderDoctors(mappedData);
                })
                .catch(err => {
                    doctorsList.innerHTML = `<p style="padding: 10px; color: red;">Lỗi khi tải danh sách Bác sĩ: ${err.message}</p>`;
                });
        });
    }

    // Handle continue button
    btnContinue.addEventListener('click', async () => {
        if (!window.selectedAppointment) {
            alert("Vui lòng chọn khung giờ trước khi tiếp tục!");
            return;
        }
        try {
            const response = await fetch('/api/book', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    doctor_id: window.selectedAppointment.doctor_id,
                    date: window.selectedAppointment.date,
                    slot: window.selectedAppointment.slot
                })
            });
            const data = await response.json();
            if (data.success) {
                // Save to localStorage
                const appointments = JSON.parse(localStorage.getItem('myAppointments') || '[]');
                const newAppt = {
                    id: 'A' + new Date().getFullYear() + Math.random().toString().slice(2, 8),
                    doctor_name: window.selectedAppointment.doctor_name,
                    department: window.selectedAppointment.department,
                    date: window.selectedAppointment.date,
                    slot: window.selectedAppointment.slot,
                    status: 'Đã xác nhận',
                    timestamp: new Date().toLocaleString('vi-VN')
                };
                appointments.push(newAppt);
                localStorage.setItem('myAppointments', JSON.stringify(appointments));

                alert("Thành công: " + data.message);
                location.reload();
            } else {
                alert("Lỗi: " + data.message + "\n\nXin hãy mở Chatbot (góc phải dưới) để hỏi lịch hoặc bác sĩ khác!");
                const chatbotBubble = document.getElementById('chatbot-bubble');
                if (chatbotBubble) chatbotBubble.click();
            }
        } catch (err) {
            alert("Lỗi mạng khi đặt lịch.");
        }
    });

    // Global slot selection function
    window.selectedAppointment = null;
    window.selectSlot = function (btnElem, dataStr) {
        document.querySelectorAll('.slot-btn').forEach(btn => btn.style.background = '');
        document.querySelectorAll('.slot-btn').forEach(btn => btn.style.color = '');
        btnElem.style.background = '#d4af37';
        btnElem.style.color = '#fff';
        window.selectedAppointment = JSON.parse(decodeURIComponent(dataStr));
    };

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

    // Date selection logic
    const dateBtns = document.querySelectorAll('.date-btn');
    dateBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            dateBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

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
        chatbotBubble.style.display = 'none'; // hide bubble when open
        chatInput.focus();
    });

    closeChatBtn.addEventListener('click', () => {
        chatbotWindow.classList.remove('open');
        chatbotBubble.style.display = 'flex'; // show bubble again
    });

    // Add global history
    let chatHistory = [];

    // Send message function
    async function sendMessage() {
        const text = chatInput.value.trim();
        if (!text) return;

        // 1. Add user message
        const userMsgHTML = `
            <div class="message user-message">
                <div class="msg-avatar"><i class="fa-solid fa-user"></i></div>
                <div class="msg-bubble">${text}</div>
            </div>
        `;
        chatMessages.insertAdjacentHTML('beforeend', userMsgHTML);
        chatInput.value = '';
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // 2. Add typing indicator
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

        // 3. Real fetch API to Backend
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    history: chatHistory,
                    user_message: text
                })
            });

            const data = await response.json();

            // Remove typing indicator
            const indicator = document.getElementById('typing-indicator');
            if (indicator) indicator.remove();

            if (response.ok) {
                // Update history
                chatHistory.push({ role: "user", parts: [text] });
                chatHistory.push({
                    role: "model",
                    parts: [JSON.stringify({ reply: data.reply, booking_intent: data.booking_intent })]
                });

                const cleanReply = data.reply.replace(/\*\*/g, '').replace(/\n/g, '<br>');;
                const aiMsgHTML = `
                    <div class="message ai-message">
                        <div class="msg-avatar"><i class="fa-solid fa-robot"></i></div>
                        <div class="msg-bubble">${cleanReply}</div>
                    </div>
                `;
                chatMessages.insertAdjacentHTML('beforeend', aiMsgHTML);
            } else {
                const errMsgHTML = `
                    <div class="message ai-message">
                        <div class="msg-avatar"><i class="fa-solid fa-robot"></i></div>
                        <div class="msg-bubble" style="color:red;">Lỗi kết nối tới Server AI: ${data.error || 'Unknown Error'}</div>
                    </div>
                `;
                chatMessages.insertAdjacentHTML('beforeend', errMsgHTML);
            }
        } catch (error) {
            const indicator = document.getElementById('typing-indicator');
            if (indicator) indicator.remove();

            const errMsgHTML = `
                <div class="message ai-message">
                    <div class="msg-avatar"><i class="fa-solid fa-robot"></i></div>
                    <div class="msg-bubble" style="color:red;">Lỗi mạng: Không thể gọi AI Server. Vui lòng kiểm tra lại.</div>
                </div>
            `;
            chatMessages.insertAdjacentHTML('beforeend', errMsgHTML);
        }

        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Send on button click
    sendChatBtn.addEventListener('click', sendMessage);

    // Send on Enter key
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

});
