// Toggle sidebar
const menuToggle = document.querySelector('.menu-toggle');
const sidebar = document.querySelector('.sidebar');

menuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('active');
    menuToggle.textContent = sidebar.classList.contains('active') ? '✖' : '☰';
});

// Close sidebar when clicking a link (optional for mobile)
const sidebarLinks = document.querySelectorAll('.sidebar a');
sidebarLinks.forEach(link => {
    link.addEventListener('click', () => {
        sidebar.classList.remove('active');
        menuToggle.textContent = '☰';
    });
});