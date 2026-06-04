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

    // Handle item selection
    dropdownItems.forEach(item => {
        item.addEventListener('click', () => {
            const title = item.querySelector('.item-title').textContent;
            selectedText.textContent = title;
            selectedText.style.color = '#333';
            dropdown.classList.remove('open');

            // Update UI like before
            infoMessage.innerHTML = `
                <i class="fa-solid fa-check-circle" style="color: #2e7d32;"></i>
                <p style="color: #2e7d32; font-weight: 500; font-size: 16px;">Đã chọn chuyên khoa: ${title}</p>
                <p style="color: #666; font-size: 13px; margin-top: 5px;">Hệ thống sẽ tải danh sách Bác sĩ tương ứng... (sẽ lấy từ doctors.json)</p>
            `;
            btnContinue.disabled = false;
            btnContinue.classList.remove('btn-disabled');
            btnContinue.classList.add('btn-active');
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
