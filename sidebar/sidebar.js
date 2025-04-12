// Load sidebar HTML dynamically
document.addEventListener('DOMContentLoaded', () => {
    fetch('sidebar/sidebar.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('sidebar-container').innerHTML = data;
            initializeSidebar();
        });
});

// Sidebar functionality
function initializeSidebar() {
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');

    // Toggle sidebar
    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('active');
        menuToggle.textContent = sidebar.classList.contains('active') ? '✖' : '☰';
        menuToggle.setAttribute('aria-expanded', sidebar.classList.contains('active'));
    });

    // Close sidebar when clicking a link on mobile
    const sidebarLinks = document.querySelectorAll('.sidebar a');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('active');
                menuToggle.textContent = '☰';
                menuToggle.setAttribute('aria-expanded', 'false');
            }
        });
    });

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 && !sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
            sidebar.classList.remove('active');
            menuToggle.textContent = '☰';
            menuToggle.setAttribute('aria-expanded', 'false');
        }
    });

    // Initialize ARIA attribute
    menuToggle.setAttribute('aria-expanded', 'false');
}