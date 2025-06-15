
// Tambah efek aktif saat klik menu
const links = document.querySelectorAll('.admin-sidebar a');
links.forEach(link => {
    link.addEventListener('click', function () {
        links.forEach(l => l.classList.remove('active'));
        this.classList.add('active');
    });
});

