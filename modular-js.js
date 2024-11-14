// config/constants.js
export const CONFIG = {
    STORAGE_KEY: 'anticonceptivos_history_progress',
    ANIMATION_DURATION: 300,
    SCROLL_OFFSET: 80,
    AUTO_SAVE_DELAY: 500,
    MIN_PASS_SCORE: 70
};

export const CORRECT_ANSWERS = {
    question1: {
        answers: ['antigua', 'egipto', 'grecia', 'roma'],
        points: 1
    },
    question2: {
        answers: ['prohibía', 'desaprobaba', 'contra'],
        points: 1
    }
};

// utils/storage.js
export class StorageManager {
    static async saveData(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            throw new Error('Error al guardar datos');
        }
    }

    static getData(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error al cargar datos:', error);
            return null;
        }
    }
}

// utils/helpers.js
export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// components/QuizManager.js
export class QuizManager {
    constructor(form, progressBar, resultElement) {
        this.form = form;
        this.progressBar = progressBar;
        this.resultElement = resultElement;
        this.attachEventListeners();
    }

    attachEventListeners() {
        this.form.addEventListener('input', 
            debounce(this.handleInput.bind(this), CONFIG.AUTO_SAVE_DELAY)
        );
        this.form.addEventListener('submit', this.handleSubmit.bind(this));
    }

    async handleInput(e) {
        const formData = new FormData(this.form);
        const responses = Object.fromEntries(formData.entries());
        
        try {
            await StorageManager.saveData(CONFIG.STORAGE_KEY, responses);
            this.updateProgress();
        } catch (error) {
            this.showError('Error al guardar el progreso');
        }
    }

    validateForm() {
        const requiredInputs = this.form.querySelectorAll('[required]');
        return Array.from(requiredInputs).every(input => input.value.trim());
    }

    showResults(score) {
        const isPassing = score >= CONFIG.MIN_PASS_SCORE;
        const message = isPassing
            ? `¡Excelente! Has obtenido ${score.toFixed(1)}% de respuestas correctas.`
            : `Has obtenido ${score.toFixed(1)}%. ¿Te gustaría intentarlo de nuevo?`;

        this.resultElement.textContent = message;
        this.resultElement.className = isPassing ? 'success' : 'warning';
    }

    updateProgress(percentage) {
        if (this.progressBar) {
            this.progressBar.style.width = `${percentage}%`;
            this.progressBar.setAttribute('aria-valuenow', percentage);
        }
    }
}

// components/NavigationManager.js
export class NavigationManager {
    constructor(navLinks, backToTopButton) {
        this.navLinks = navLinks;
        this.backToTopButton = backToTopButton;
        this.attachEventListeners();
    }

    attachEventListeners() {
        this.navLinks.forEach(link => {
            link.addEventListener('click', this.handleNavigation.bind(this));
        });

        window.addEventListener('scroll', 
            debounce(this.handleScroll.bind(this), 100)
        );
    }

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

    handleScroll() {
        if (this.backToTopButton) {
            this.backToTopButton.style.display = 
                window.scrollY > 300 ? 'block' : 'none';
        }
    }
}

// app.js
import { CONFIG } from './config/constants.js';
import { StorageManager } from './utils/storage.js';
import { QuizManager } from './components/QuizManager.js';
import { NavigationManager } from './components/NavigationManager.js';

class HistoryApp {
    constructor() {
        this.initializeElements();
        this.initializeManagers();
        this.loadSavedProgress();
    }

    initializeElements() {
        this.welcomeScreen = document.getElementById('welcome-screen');
        this.mainContent = document.getElementById('main-content');
        this.enterButton = document.getElementById('enter-button');
        this.quizForm = document.getElementById('quiz-form');
        this.progressBar = document.querySelector('.progress-bar .progress');
        this.quizResult = document.getElementById('quiz-result');

        if (!this.welcomeScreen || !this.mainContent || !this.enterButton) {
            throw new Error('Elementos esenciales no encontrados');
        }
    }

    initializeManagers() {
        this.quizManager = new QuizManager(
            this.quizForm,
            this.progressBar,
            this.quizResult
        );

        this.navigationManager = new NavigationManager(
            document.querySelectorAll('nav a[href^="#"]'),
            document.getElementById('back-to-top')
        );

        this.enterButton.addEventListener('click', () => this.startMainContent());
    }

    startMainContent() {
        this.welcomeScreen.style.display = 'none';
        this.mainContent.style.display = 'block';
        this.mainContent.classList.add('fade-in');
    }

    loadSavedProgress() {
        const savedData = StorageManager.getData(CONFIG.STORAGE_KEY);
        if (savedData && this.quizForm) {
            Object.entries(savedData).forEach(([name, value]) => {
                const input = this.quizForm.elements[name];
                if (input) input.value = value;
            });
            this.quizManager.updateProgress();
        }
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.historyApp = new HistoryApp();
    } catch (error) {
        console.error('Error al inicializar la aplicación:', error);
    }
});
