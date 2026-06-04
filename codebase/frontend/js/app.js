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
});
