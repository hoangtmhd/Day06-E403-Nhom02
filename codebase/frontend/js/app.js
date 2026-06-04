const app = {
    init: function() {
        this.bindEvents();
    },

    bindEvents: function() {
        const navItems = document.querySelectorAll('.nav-item');
        
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Get target screen id
                const targetId = item.getAttribute('data-target');
                if(!targetId) return;

                this.switchTab(targetId);

                // Update active state on nav
                navItems.forEach(nav => nav.classList.remove('active'));
                
                // Only activate nav items that match this target, except if multiple match, just activate the clicked one
                item.classList.add('active');
            });
        });

        // Toggle Password visibility
        const togglePw = document.querySelector('.toggle-pw');
        if(togglePw) {
            togglePw.addEventListener('click', function() {
                const input = this.previousElementSibling.previousElementSibling;
                if(input.type === 'password') {
                    input.type = 'text';
                    this.classList.remove('fa-eye-slash');
                    this.classList.add('fa-eye');
                } else {
                    input.type = 'password';
                    this.classList.remove('fa-eye');
                    this.classList.add('fa-eye-slash');
                }
            });
        }
    },

    switchTab: function(targetId) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });

        // Show target screen
        const targetScreen = document.getElementById(targetId);
        if(targetScreen) {
            targetScreen.classList.add('active');
        }

        // Also sync the nav bar if switched from elsewhere (like home grid buttons)
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(nav => {
            if(nav.getAttribute('data-target') === targetId) {
                navItems.forEach(n => n.classList.remove('active'));
                nav.classList.add('active');
            }
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
