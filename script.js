// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {
    // Referencias a elementos DOM
    const welcomeScreen = document.getElementById('welcome-screen');
    const mainContent = document.getElementById('main-content');
    const enterButton = document.getElementById('enter-button');
    const scrollTopButton = document.getElementById('scroll-top');
    const sections = document.querySelectorAll('.content-section');
    const navLinks = document.querySelectorAll('.main-nav a');

    // Clase para manejar las animaciones
    class AnimationManager {
        static fadeIn(element, duration = 500) {
            element.style.opacity = '0';
            element.style.display = 'block';
            
            let start = null;
            const animate = (timestamp) => {
                if (!start) start = timestamp;
                const progress = timestamp - start;
                const opacity = Math.min(progress / duration, 1);
                
                element.style.opacity = opacity;
                
                if (progress < duration) {
                    requestAnimationFrame(animate);
                }
            };
            
            requestAnimationFrame(animate);
        }

        static fadeOut(element, duration = 500) {
            let start = null;
            const initialOpacity = parseFloat(getComputedStyle(element).opacity);
            
            const animate = (timestamp) => {
                if (!start) start = timestamp;
                const progress = timestamp - start;
                const opacity = Math.max(initialOpacity - (progress / duration), 0);
                
                element.style.opacity = opacity;
                
                if (progress < duration) {
                    requestAnimationFrame(animate);
                } else {
                    element.style.display = 'none';
                }
            };
            
            requestAnimationFrame(animate);
        }
    }

    // Clase para manejar la navegación
    class NavigationManager {
        static scrollToSection(targetId) {
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }

        static updateActiveSection() {
            const scrollPosition = window.scrollY;

            sections.forEach(section => {
                const sectionTop = section.offsetTop - 100;
                const sectionBottom = sectionTop + section.offsetHeight;

                if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${section.id}`) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }
    }

    // Clase para manejar la carga de imágenes
    class ImageLoader {
        static lazyLoad() {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.classList.add('loaded');
                            observer.unobserve(img);
                        }
                    }
                });
            }, {
                rootMargin: '50px'
            });

            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    }

    // Inicialización y eventos
    const init = () => {
        // Mostrar pantalla de bienvenida
        welcomeScreen.style.opacity = '1';

        // Configurar evento del botón de entrada
        enterButton.addEventListener('click', () => {
            AnimationManager.fadeOut(welcomeScreen);
            setTimeout(() => {
                AnimationManager.fadeIn(mainContent);
            }, 500);
        });

        // Configurar navegación
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = e.currentTarget.getAttribute('href');
                NavigationManager.scrollToSection(targetId);
            });
        });

        // Configurar botón de volver arriba
        window.addEventListener('scroll', () => {
            // Actualizar visibilidad del botón de scroll
            if (window.pageYOffset > 300) {
                scrollTopButton.classList.add('visible');
            } else {
                scrollTopButton.classList.remove('visible');
            }

            // Actualizar sección activa en la navegación
            NavigationManager.updateActiveSection();
        });

        scrollTopButton.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        // Iniciar lazy loading de imágenes
        ImageLoader.lazyLoad();

        // Configurar observador para animaciones de sección
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    sectionObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1
        });

        sections.forEach(section => {
            section.classList.add('fade-in');
            sectionObserver.observe(section);
        });
    };

    // Iniciar la aplicación
    init();

    // Manejar eventos de teclado
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && welcomeScreen.style.display !== 'none') {
            AnimationManager.fadeOut(welcomeScreen);
            AnimationManager.fadeIn(mainContent);
        }
    });
});