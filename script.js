document.addEventListener('DOMContentLoaded', () => {
    const welcomeScreen = document.getElementById('welcome-screen');
    const mainContent = document.getElementById('main-content');
    const enterButton = document.getElementById('enter-button');
    const scrollTopButton = document.getElementById('scroll-top');
    const sections = document.querySelectorAll('.content-section');
    const navLinks = document.querySelectorAll('.main-nav a');

    const handleEnter = () => {
        welcomeScreen.style.display = 'none';
        mainContent.style.display = 'block';
    };

    enterButton?.addEventListener('click', handleEnter);

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                const offsetPosition = targetSection.offsetTop - 70;
                window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
            }
        });
    });

    const updateActiveLink = () => {
        const scrollPosition = window.scrollY;
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionBottom = sectionTop + section.offsetHeight;
            const sectionId = section.getAttribute('id');
            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    };

    window.addEventListener('scroll', updateActiveLink);
});
