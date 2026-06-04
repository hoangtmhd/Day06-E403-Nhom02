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

    // Handle item selection
    dropdownItems.forEach(item => {
        item.addEventListener('click', () => {
            const title = item.querySelector('.item-title').textContent;
            selectedText.textContent = title;
            selectedText.style.color = '#333';
            dropdown.classList.remove('open');

            // Hide info message and show doctors container
            infoMessageContainer.style.display = 'none';
            doctorsContainer.style.display = 'block';
            doctorsList.innerHTML = `<p style="padding: 10px; color: #666;">Đang tải danh sách Bác sĩ từ file \`doctors.json\`...</p>`;

            // Enable button
            btnContinue.disabled = false;
            btnContinue.classList.remove('btn-disabled');
            btnContinue.classList.add('btn-active');

            // Fake fetch data for demonstration (because actual fetch('doctors.json') fails in file:// protocol without a local server)
            setTimeout(() => {
                doctorsList.innerHTML = `
                    <div class="doctor-card">
                        <div class="doctor-info">
                            <div class="doctor-name">PGS.TS. Trần Thị B</div>
                            <div class="doctor-role">Phó khoa ${title} - Bệnh viện Bạch Mai</div>
                            <div class="doctor-schedule">
                                <div class="schedule-day">Lịch khám gần nhất:</div>
                                <button class="slot-btn">08:30</button>
                                <button class="slot-btn">09:30</button>
                                <button class="slot-btn">10:30</button>
                                <button class="slot-btn">14:00</button>
                            </div>
                        </div>
                    </div>
                `;
            }, 600);
        });
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
                    parts: [JSON.stringify({reply: data.reply, booking_intent: data.booking_intent})]
                });

                const aiMsgHTML = `
                    <div class="message ai-message">
                        <div class="msg-avatar"><i class="fa-solid fa-robot"></i></div>
                        <div class="msg-bubble">${data.reply}</div>
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
