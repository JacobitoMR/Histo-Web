document.addEventListener('DOMContentLoaded', () => {
    // Variables
    const welcomeScreen = document.getElementById('welcome-screen');
    const mainContent = document.getElementById('main-content');
    const enterButton = document.getElementById('enter-button');
    const scrollTopButton = document.getElementById('scroll-top');
    const sections = document.querySelectorAll('.content-section');
    const navLinks = document.querySelectorAll('.main-nav a');

    // Función para manejar la entrada al sitio
    const handleEnter = () => {
        welcomeScreen.style.display = 'none';
        mainContent.style.display = 'block';
        // Iniciar animaciones de las secciones visibles
        checkSectionsVisibility();
    };

    // Event listener para el botón de entrada
    enterButton?.addEventListener('click', handleEnter);

    // Configurar scroll suave para los enlaces de navegación
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const headerOffset = 70;
                const elementPosition = targetSection.offsetTop;
                const offsetPosition = elementPosition - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Observer para las animaciones de entrada
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                sectionObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.2
    });

    // Observar todas las secciones
    sections.forEach(section => {
        section.classList.add('fade-in');
        sectionObserver.observe(section);
    });

    // Función para actualizar el enlace activo en la navegación
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

    // Función para manejar la visibilidad del botón de scroll
    const toggleScrollButton = () => {
        if (window.scrollY > 300) {
            scrollTopButton.style.display = 'block';
        } else {
            scrollTopButton.style.display = 'none';
        }
    };

    // Event listeners para scroll
    window.addEventListener('scroll', () => {
        updateActiveLink();
        toggleScrollButton();
    });

    // Event listener para el botón de scroll hacia arriba
    scrollTopButton?.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Manejo de errores de carga de imágenes
    const images = document.querySelectorAll('.section-image');
    images.forEach(img => {
        img.addEventListener('error', function() {
            this.style.display = 'none';
            console.warn(`Error al cargar la imagen: ${this.src}`);
        });
    });
});
