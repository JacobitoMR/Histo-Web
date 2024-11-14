// Configuración y constantes
const CONFIG = {
    STORAGE_KEY: 'anticonceptivos_history_progress',
    ANIMATION_DURATION: 300,
    SCROLL_OFFSET: 80,
    AUTO_SAVE_DELAY: 500,
    MIN_PASS_SCORE: 70
};

// Base de datos de respuestas correctas
const CORRECT_ANSWERS = {
    question1: {
        answers: ['antigua', 'egipto', 'grecia', 'roma'],
        points: 1
    },
    question2: {
        answers: ['prohibía', 'desaprobaba', 'contra'],
        points: 1
    },
    // Agregar más respuestas según sea necesario
};

// Clase principal de la aplicación
class HistoryApp {
    constructor() {
        this.initializeElements();
        this.attachEventListeners();
        this.loadSavedProgress();
    }

    initializeElements() {
        // Elementos de la pantalla de bienvenida
        this.welcomeScreen = document.getElementById('welcome-screen');
        this.mainContent = document.getElementById('main-content');
        this.enterButton = document.getElementById('enter-button');

        // Elementos de navegación
        this.navLinks = document.querySelectorAll('nav a[href^="#"]');
        this.backToTopButton = document.getElementById('back-to-top');

        // Elementos del cuestionario
        this.quizForm = document.getElementById('quiz-form');
        this.progressBar = document.querySelector('.progress-bar .progress');
        this.quizResult = document.getElementById('quiz-result');

        // Validar elementos requeridos
        if (!this.welcomeScreen || !this.mainContent || !this.enterButton) {
            throw new Error('Elementos esenciales de la página no encontrados');
        }
    }

    attachEventListeners() {
        // Eventos de la pantalla de bienvenida
        this.enterButton.addEventListener('click', () => this.startMainContent());

        // Eventos de navegación
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handleNavigation(e));
        });

        // Eventos del cuestionario
        if (this.quizForm) {
            this.quizForm.addEventListener('input', 
                this.debounce(this.handleQuizInput.bind(this), CONFIG.AUTO_SAVE_DELAY)
            );
            this.quizForm.addEventListener('submit', 
                this.handleQuizSubmit.bind(this)
            );
        }

        // Evento de scroll
        window.addEventListener('scroll', 
            this.debounce(this.handleScroll.bind(this), 100)
        );
    }

    // Métodos de la pantalla de bienvenida
    startMainContent() {
        this.welcomeScreen.style.display = 'none';
        this.mainContent.style.display = 'block';
        this.mainContent.classList.add('fade-in');
        this.updateProgress();
    }

    // Métodos de navegación
    handleNavigation(e) {
        e.preventDefault();
        const targetId = e.currentTarget.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
            this.scrollToSection(targetSection);
            this.updateActiveNavLink(targetId);
        }
    }

    scrollToSection(section) {
        const offsetPosition = section.offsetTop - CONFIG.SCROLL_OFFSET;
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }

    updateActiveNavLink(targetId) {
        this.navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === targetId);
            link.setAttribute('aria-current', link.getAttribute('href') === targetId ? 'page' : 'false');
        });
    }

    // Métodos del cuestionario
    async handleQuizInput(e) {
        const formData = new FormData(this.quizForm);
        const responses = Object.fromEntries(formData.entries());
        
        try {
            await this.saveProgress(responses);
            this.updateProgress();
        } catch (error) {
            this.showError('Error al guardar el progreso');
            console.error('Error saving progress:', error);
        }
    }

    async handleQuizSubmit(e) {
        e.preventDefault();

        if (!this.validateForm()) {
            this.showError('Por favor completa todas las preguntas requeridas');
            return;
        }

        try {
            const score = await this.evaluateAnswers();
            this.showResults(score);
            this.updateProgressBar(score);
        } catch (error) {
            this.showError('Error al evaluar las respuestas');
            console.error('Error evaluating answers:', error);
        }
    }

    validateForm() {
        const requiredInputs = this.quizForm.querySelectorAll('[required]');
        let isValid = true;
        
        requiredInputs.forEach(input => {
            if (!input.value.trim()) {
                isValid = false;
                this.showInputError(input);
            } else {
                this.clearInputError(input);
            }
        });

        return isValid;
    }

    async evaluateAnswers() {
        const formData = new FormData(this.quizForm);
        let totalPoints = 0;
        let maxPoints = 0;

        for (const [question, answer] of formData.entries()) {
            const questionData = CORRECT_ANSWERS[question];
            if (questionData) {
                maxPoints += questionData.points;
                if (this.checkAnswer(answer, questionData.answers)) {
                    totalPoints += questionData.points;
                }
            }
        }

        return (totalPoints / maxPoints) * 100;
    }

    checkAnswer(userAnswer, correctAnswers) {
        const normalizedUserAnswer = userAnswer.toLowerCase().trim();
        return correctAnswers.some(correct => 
            normalizedUserAnswer.includes(correct.toLowerCase())
        );
    }

    // Métodos de UI
    showResults(score) {
        const isPassing = score >= CONFIG.MIN_PASS_SCORE;
        const message = isPassing
            ? `¡Excelente! Has obtenido ${score.toFixed(1)}% de respuestas correctas.`
            : `Has obtenido ${score.toFixed(1)}%. ¿Te gustaría intentarlo de nuevo?`;

        this.quizResult.textContent = message;
        this.quizResult.className = isPassing ? 'success' : 'warning';
        this.quizResult.setAttribute('aria-label', message);
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        errorDiv.setAttribute('role', 'alert');
        
        this.quizForm.insertBefore(errorDiv, this.quizForm.firstChild);
        setTimeout(() => errorDiv.remove(), 5000);
    }

    showInputError(input) {
        input.classList.add('error');
        const errorMessage = document.createElement('span');
        errorMessage.className = 'error-message';
        errorMessage.textContent = 'Este campo es requerido';
        input.parentNode.appendChild(errorMessage);
    }

    clearInputError(input) {
        input.classList.remove('error');
        const errorMessage = input.parentNode.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    }

    updateProgressBar(percentage) {
        if (this.progressBar) {
            this.progressBar.style.width = `${percentage}%`;
            this.progressBar.setAttribute('aria-valuenow', percentage);
        }
    }

    // Métodos de persistencia
    async saveProgress(data) {
        try {
            localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(data));
        } catch (error) {
            throw new Error('Error al guardar el progreso');
        }
    }

    loadSavedProgress() {
        try {
            const savedData = localStorage.getItem(CONFIG.STORAGE_KEY);
            if (savedData && this.quizForm) {
                const responses = JSON.parse(savedData);
                Object.entries(responses).forEach(([name, value]) => {
                    const input = this.quizForm.elements[name];
                    if (input) {
                        input.value = value;
                    }
                });
                this.updateProgress();
            }
        } catch (error) {
            console.error('Error loading saved progress:', error);
        }
    }

    // Utilidades
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    handleScroll() {
        if (this.backToTopButton) {
            this.backToTopButton.style.display = 
                window.scrollY > 300 ? 'block' : 'none';
        }
    }

    updateProgress() {
        if (!this.quizForm) return;
        
        const totalFields = this.quizForm.querySelectorAll('[required]').length;
        const completedFields = Array.from(this.quizForm.elements)
            .filter(element => element.required && element.value.trim() !== '').length;
        
        const progressPercentage = (completedFields / totalFields) * 100;
        this.updateProgressBar(progressPercentage);
    }
}

// Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.historyApp = new HistoryApp();
    } catch (error) {
        console.error('Error initializing application:', error);
    }
});
