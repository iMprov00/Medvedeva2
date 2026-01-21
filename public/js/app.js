/**
 * =============================================
 * APP.JS - ОСНОВНОЙ ФАЙЛ ПРИЛОЖЕНИЯ
 * Содержит общие функции, используемые на всех страницах
 * =============================================
 */

/**
 * Инициализация при загрузке страницы
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('App.js инициализирован');
    
    // Инициализируем все общие функции
    initMobileMenu();
    initSmoothScroll();
    initHeaderScroll();
    initTooltips();
    initFormsValidation();
    initAnimations();
    initPhoneMask();
});

/**
 * =============================================
 * НАВИГАЦИЯ И МЕНЮ
 * =============================================
 */

/**
 * Инициализация мобильного меню
 */
function initMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('.nav');
    const body = document.body;
    
    if (!mobileMenuBtn || !nav) return;
    
    mobileMenuBtn.addEventListener('click', function() {
        const isActive = nav.classList.toggle('active');
        mobileMenuBtn.classList.toggle('active');
        body.style.overflow = isActive ? 'hidden' : '';
    });
    
    // Закрытие меню при клике на ссылку
    document.querySelectorAll('.nav__link').forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                nav.classList.remove('active');
                mobileMenuBtn.classList.remove('active');
                body.style.overflow = '';
            }
        });
    });
    
    // Закрытие меню по клавише Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && nav.classList.contains('active')) {
            nav.classList.remove('active');
            mobileMenuBtn.classList.remove('active');
            body.style.overflow = '';
        }
    });
}

/**
 * Инициализация плавной прокрутки для якорных ссылок
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href !== '#' && href.startsWith('#')) {
                e.preventDefault();
                const targetElement = document.querySelector(href);
                
                if (targetElement) {
                    const headerHeight = document.querySelector('.header')?.offsetHeight || 100;
                    const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
}

/**
 * =============================================
 * АНИМАЦИИ И ЭФФЕКТЫ
 * =============================================
 */

/**
 * Инициализация анимаций появления элементов
 */
function initAnimations() {
    // Наблюдатель для анимаций при скролле
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Наблюдаем за элементами с классами для анимации
    document.querySelectorAll('.fade-in-up, .animate-on-scroll, .feature-card, .service-item').forEach(el => {
        observer.observe(el);
    });
}

/**
 * Анимация изменения шапки при скролле
 */
function initHeaderScroll() {
    const header = document.querySelector('.header');
    if (!header) return;
    
    let lastScroll = 0;
    
    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll <= 0) {
            header.classList.remove('scroll-up');
            return;
        }
        
        if (currentScroll > lastScroll && !header.classList.contains('scroll-down')) {
            header.classList.remove('scroll-up');
            header.classList.add('scroll-down');
        } else if (currentScroll < lastScroll && header.classList.contains('scroll-down')) {
            header.classList.remove('scroll-down');
            header.classList.add('scroll-up');
        }
        
        // Добавляем тень при скролле
        if (currentScroll > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        lastScroll = currentScroll;
    });
}

/**
 * =============================================
 * ФОРМЫ И ВАЛИДАЦИЯ
 * =============================================
 */

/**
 * Инициализация тултипов Bootstrap
 */
function initTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

/**
 * Инициализация базовой валидации форм
 */
function initFormsValidation() {
    // Отключаем стандартную валидацию браузера
    document.querySelectorAll('form').forEach(form => {
        form.setAttribute('novalidate', '');
        
        // Добавляем валидацию для обязательных полей
        const requiredFields = form.querySelectorAll('[required]');
        requiredFields.forEach(field => {
            field.addEventListener('blur', function() {
                validateField(this);
            });
            
            // Очищаем ошибку при вводе
            field.addEventListener('input', function() {
                if (this.value.trim()) {
                    this.classList.remove('is-invalid');
                    const errorDiv = this.nextElementSibling;
                    if (errorDiv && errorDiv.classList.contains('invalid-feedback')) {
                        errorDiv.remove();
                    }
                }
            });
        });
    });
}

/**
 * Валидация отдельного поля
 */
function validateField(field) {
    if (!field.value.trim()) {
        field.classList.add('is-invalid');
        if (!field.nextElementSibling || !field.nextElementSibling.classList.contains('invalid-feedback')) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'invalid-feedback';
            errorDiv.textContent = 'Это поле обязательно для заполнения';
            field.parentNode.insertBefore(errorDiv, field.nextSibling);
        }
        return false;
    }
    
    field.classList.remove('is-invalid');
    const errorDiv = field.nextElementSibling;
    if (errorDiv && errorDiv.classList.contains('invalid-feedback')) {
        errorDiv.remove();
    }
    
    // Специальная валидация для email
    if (field.type === 'email' && field.value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(field.value)) {
            field.classList.add('is-invalid');
            const errorDiv = field.nextElementSibling || document.createElement('div');
            if (!errorDiv.classList.contains('invalid-feedback')) {
                errorDiv.className = 'invalid-feedback';
                errorDiv.textContent = 'Введите корректный email адрес';
                field.parentNode.insertBefore(errorDiv, field.nextSibling);
            }
            return false;
        }
    }
    
    return true;
}

/**
 * Инициализация маски для телефона
 */
function initPhoneMask() {
    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    
    phoneInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            
            // Форматируем как +7 (XXX) XXX-XX-XX
            if (value.length > 0) {
                value = '+7' + value.substring(1);
                
                if (value.length > 2) {
                    value = value.substring(0, 2) + ' (' + value.substring(2);
                }
                if (value.length > 7) {
                    value = value.substring(0, 7) + ') ' + value.substring(7);
                }
                if (value.length > 12) {
                    value = value.substring(0, 12) + '-' + value.substring(12);
                }
                if (value.length > 15) {
                    value = value.substring(0, 15) + '-' + value.substring(15);
                }
            }
            
            e.target.value = value;
        });
    });
}

/**
 * =============================================
 * УТИЛИТЫ И ХЕЛПЕРЫ
 * =============================================
 */

/**
 * Форматирование номера телефона
 */
function formatPhoneNumber(phone) {
    if (!phone) return '';
    return phone.replace(/(\d{1})(\d{3})(\d{3})(\d{2})(\d{2})/, '+$1 ($2) $3-$4-$5');
}

/**
 * Форматирование суммы в рубли
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(amount);
}

/**
 * Дебаунс функция для ограничения частоты вызовов
 */
function debounce(func, wait) {
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

/**
 * Установка активного пункта меню в зависимости от URL
 */
function setActiveMenuItem() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav__link');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath || (href !== '/' && currentPath.startsWith(href))) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

/**
 * Показ/скрытие уведомлений
 */
function showNotification(message, type = 'success') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    alertDiv.style.cssText = `
        top: 20px;
        right: 20px;
        z-index: 9999;
        max-width: 400px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    `;
    
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    // Автоматическое скрытие через 5 секунд
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

/**
 * =============================================
 * API ВЗАИМОДЕЙСТВИЕ
 * =============================================
 */

/**
 * Универсальная функция для отправки форм
 */
async function submitForm(form, endpoint, options = {}) {
    const formData = new FormData(form);
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    // Блокируем кнопку
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span> Отправка...';
    
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                ...options.headers
            },
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification(result.message, 'success');
            form.reset();
            form.classList.remove('was-validated');
        } else {
            showNotification(result.errors ? result.errors.join(', ') : result.error, 'danger');
        }
        
        return result;
    } catch (error) {
        console.error('Ошибка:', error);
        showNotification('Произошла ошибка при отправке. Пожалуйста, попробуйте еще раз.', 'danger');
        return { success: false, error: error.message };
    } finally {
        // Восстанавливаем кнопку
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}