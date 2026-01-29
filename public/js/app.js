/**
 * =============================================
 * APP.JS - ОПТИМИЗИРОВАННЫЙ ДЛЯ МОБИЛЬНЫХ УСТРОЙСТВ
 * =============================================
 */

// Конфигурация для мобильных устройств
const MOBILE_CONFIG = {
    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
    isTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    breakpoints: {
        mobile: 768,
        tablet: 992
    }
};

/**
 * Инициализация при загрузке страницы
 */
document.addEventListener('DOMContentLoaded', function() {

    
    // Определяем тип устройства
    detectDeviceType();
    
    // Инициализируем все функции
    initMobileMenu();
    initSmoothScroll();
    initHeaderScroll();
    initTooltips();
    initFormsValidation();
    initAnimations();
    initPhoneMask();
    initTouchOptimizations();
    initImageLoading();
    initModalOptimizations();
    
    // iOS специфичные фиксы
    if (MOBILE_CONFIG.isIOS) {
        initIOSFixes();
    }
});

/**
 * Определение типа устройства
 */
function detectDeviceType() {
    const width = window.innerWidth;
    let deviceType = 'desktop';
    
    if (width <= MOBILE_CONFIG.breakpoints.mobile) {
        deviceType = 'mobile';
    } else if (width <= MOBILE_CONFIG.breakpoints.tablet) {
        deviceType = 'tablet';
    }
    
    document.body.setAttribute('data-device', deviceType);
    document.body.classList.add(`device-${deviceType}`);
    
    return deviceType;
}

/**
 * Инициализация мобильного меню с улучшениями
 */
/**
 * Инициализация мобильного меню с улучшениями
 */
function initMobileMenu() {
    const navbarToggler = document.querySelector('.navbar-toggler');
    const body = document.body;
    
    if (!navbarToggler) return;
    
    navbarToggler.addEventListener('click', function() {
        // Просто переключаем класс для body
        body.classList.toggle('mobile-menu-open');
        
        // Если закрываем меню - убираем backdrop
        if (!body.classList.contains('mobile-menu-open')) {
            const backdrop = document.querySelector('.mobile-menu-backdrop');
            if (backdrop) {
                backdrop.remove();
            }
        }
    });
    
    // Закрытие меню
    function closeMobileMenu() {
        body.style.overflow = '';
        body.classList.remove('mobile-menu-open');
        const backdrop = document.querySelector('.mobile-menu-backdrop');
        if (backdrop) {
            backdrop.remove();
        }
    }
    
    // Закрытие по клику на ссылку (только на мобильных)
    // НЕ закрываем при клике на dropdown-toggle и элементы внутри dropdown
    if (window.innerWidth <= MOBILE_CONFIG.breakpoints.tablet) {
        document.querySelectorAll('.nav-link:not(.dropdown-toggle), .dropdown-item').forEach(link => {
            link.addEventListener('click', function(e) {
                // Не закрываем если это элемент внутри открытого dropdown
                const parentDropdown = this.closest('.dropdown-menu');
                if (parentDropdown && parentDropdown.classList.contains('show')) {
                    // Это элемент внутри открытого dropdown - закрываем только dropdown
                    return;
                }
                
                if (navbarCollapse.classList.contains('show')) {
                    closeMobileMenu();
                    navbarToggler.click(); // Закрывает Bootstrap меню
                }
            });
        });
    }
    
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('mobile-menu-backdrop')) {
            body.classList.remove('mobile-menu-open');
            e.target.remove();
            
            // Закрываем Bootstrap меню
            const navbarCollapse = document.querySelector('.navbar-collapse');
            if (navbarCollapse && navbarCollapse.classList.contains('show')) {
                navbarToggler.click();
            }
        }
    });
    
    // Обработка изменения ориентации
    window.addEventListener('orientationchange', function() {
        if (body.classList.contains('mobile-menu-open')) {
            closeMobileMenu();
            navbarToggler.click();
        }
    });
    
    // Специальная обработка для dropdown-toggle на мобильных
    document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            if (window.innerWidth <= MOBILE_CONFIG.breakpoints.tablet) {
                // На мобильных даем Bootstrap обработать клик
                e.stopPropagation();
                
                // Если меню открыто, не закрываем его полностью
                if (navbarCollapse.classList.contains('show')) {
                    // Только переключаем dropdown
                    return;
                }
            }
        });
    });
}


/**
 * Делегирование событий для корректной работы dropdown на мобильных
 */
function initMobileDropdowns() {
    // Отслеживаем клики на dropdown-toggle
    document.addEventListener('click', function(e) {
        const target = e.target;
        const dropdownToggle = target.closest('.dropdown-toggle');
        
        if (dropdownToggle && window.innerWidth <= MOBILE_CONFIG.breakpoints.tablet) {
            // На мобильных устройствах
            const dropdownMenu = dropdownToggle.nextElementSibling;
            
            // Если dropdown уже открыт, не даем закрыть навбар
            if (dropdownMenu && dropdownMenu.classList.contains('show')) {
                e.stopPropagation();
                e.preventDefault();
                
                // Даем Bootstrap обработать toggle
                setTimeout(() => {
                    const dropdownInstance = bootstrap.Dropdown.getInstance(dropdownToggle);
                    if (dropdownInstance) {
                        dropdownInstance.toggle();
                    }
                }, 10);
            }
        }
    });
    
    // Предотвращаем закрытие навбара при клике внутри dropdown
    document.addEventListener('click', function(e) {
        if (window.innerWidth <= MOBILE_CONFIG.breakpoints.tablet) {
            const isInsideDropdown = e.target.closest('.dropdown-menu');
            if (isInsideDropdown) {
                e.stopPropagation();
            }
        }
    });
}

/**
 * Инициализация плавной прокрутки с оптимизацией для мобильных
 */
function initSmoothScroll() {
    // Отключаем плавную прокрутку на очень старых устройствах
    if ('scrollBehavior' in document.documentElement.style === false) {
        return;
    }
    
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href !== '#' && href.startsWith('#')) {
                e.preventDefault();
                const targetElement = document.querySelector(href);
                
                if (targetElement) {
                    // Учитываем высоту фиксированной шапки
                    const headerHeight = document.querySelector('.header')?.offsetHeight || 80;
                    const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                    
                    // На мобильных делаем небольшой дополнительный отступ
                    const mobileOffset = window.innerWidth <= MOBILE_CONFIG.breakpoints.mobile ? 20 : 0;
                    
                    window.scrollTo({
                        top: targetPosition - mobileOffset,
                        behavior: 'smooth'
                    });
                    
                    // Обновляем URL без перезагрузки
                    if (history.pushState) {
                        history.pushState(null, null, href);
                    } else {
                        location.hash = href;
                    }
                }
            }
        });
    });
}

/**
 * Оптимизация анимаций для мобильных
 */
function initAnimations() {
    // Отключаем сложные анимации на слабых устройствах
    const isLowEndDevice = /(Android|iPhone).*(OS 9_|OS 10_|OS 11_|OS 12_)/.test(navigator.userAgent);
    
    if (isLowEndDevice || !('IntersectionObserver' in window)) {
        document.querySelectorAll('.fade-in-up').forEach(el => {
            el.style.animation = 'none';
            el.style.opacity = '1';
            el.style.transform = 'none';
        });
        return;
    }
    
    // Ленивая загрузка анимаций
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('.fade-in-up, .animate-on-scroll').forEach(el => {
        observer.observe(el);
    });
}

/**
 * Оптимизация заголовка при скролле
 */
function initHeaderScroll() {
    const header = document.querySelector('.header');
    if (!header) return;
    
    let lastScroll = 0;
    let ticking = false;
    
    function updateHeader(scrollPos) {
        if (scrollPos <= 50) {
            header.classList.remove('scrolled');
        } else {
            header.classList.add('scrolled');
        }
        
        // На мобильных скрываем шапку при скролле вниз
        if (window.innerWidth <= MOBILE_CONFIG.breakpoints.mobile) {
            if (scrollPos > lastScroll && scrollPos > 100) {
                header.classList.add('header-hidden');
            } else {
                header.classList.remove('header-hidden');
            }
        }
        
        lastScroll = scrollPos;
    }
    
    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                updateHeader(window.pageYOffset);
                ticking = false;
            });
            ticking = true;
        }
    });
}

/**
 * Оптимизация форм для мобильных
 */
function initFormsValidation() {
    document.querySelectorAll('form').forEach(form => {
        form.setAttribute('novalidate', '');
        
        // Улучшенная валидация для мобильных
        const inputs = form.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            // Фокус с прокруткой на мобильных
            input.addEventListener('focus', function() {
                if (window.innerWidth <= MOBILE_CONFIG.breakpoints.mobile) {
                    setTimeout(() => {
                        this.scrollIntoView({
                            behavior: 'smooth',
                            block: 'center'
                        });
                    }, 300);
                }
            });
            
            // Валидация при потере фокуса
            input.addEventListener('blur', function() {
                validateField(this);
            });
            
            // Очистка ошибок при вводе
            input.addEventListener('input', function() {
                if (this.value.trim()) {
                    clearFieldError(this);
                }
            });
        });
        
        // Оптимизация отправки формы
        form.addEventListener('submit', function(e) {
            if (!validateForm(this)) {
                e.preventDefault();
                
                // Прокрутка к первой ошибке на мобильных
                if (window.innerWidth <= MOBILE_CONFIG.breakpoints.mobile) {
                    const firstError = this.querySelector('.is-invalid');
                    if (firstError) {
                        firstError.scrollIntoView({
                            behavior: 'smooth',
                            block: 'center'
                        });
                    }
                }
            }
        });
    });
}

/**
 * Валидация формы
 */
function validateForm(form) {
    let isValid = true;
    const requiredFields = form.querySelectorAll('[required]');
    
    requiredFields.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
        }
    });
    
    return isValid;
}

/**
 * Валидация поля
 */
function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    
    // Проверка обязательного поля
    if (field.hasAttribute('required') && !value) {
        showFieldError(field, 'Это поле обязательно для заполнения');
        isValid = false;
    }
    
    // Проверка email
    if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            showFieldError(field, 'Введите корректный email адрес');
            isValid = false;
        }
    }
    
    // Проверка телефона
    if (field.type === 'tel' && value) {
        const phoneRegex = /^\+7\s?\(?\d{3}\)?\s?\d{3}[-\s]?\d{2}[-\s]?\d{2}$/;
        if (!phoneRegex.test(value)) {
            showFieldError(field, 'Введите корректный номер телефона');
            isValid = false;
        }
    }
    
    if (isValid) {
        clearFieldError(field);
    }
    
    return isValid;
}

/**
 * Показать ошибку поля
 */
function showFieldError(field, message) {
    field.classList.add('is-invalid');
    
    let errorDiv = field.nextElementSibling;
    if (!errorDiv || !errorDiv.classList.contains('invalid-feedback')) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'invalid-feedback';
        field.parentNode.insertBefore(errorDiv, field.nextSibling);
    }
    
    errorDiv.textContent = message;
}

/**
 * Очистить ошибку поля
 */
function clearFieldError(field) {
    field.classList.remove('is-invalid');
    const errorDiv = field.nextElementSibling;
    if (errorDiv && errorDiv.classList.contains('invalid-feedback')) {
        errorDiv.remove();
    }
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
                if (!value.startsWith('7')) {
                    value = '7' + value;
                }
                
                let formattedValue = '+7';
                
                if (value.length > 1) {
                    formattedValue += ' (' + value.substring(1, 4);
                }
                if (value.length >= 4) {
                    formattedValue += ') ' + value.substring(4, 7);
                }
                if (value.length >= 7) {
                    formattedValue += '-' + value.substring(7, 9);
                }
                if (value.length >= 9) {
                    formattedValue += '-' + value.substring(9, 11);
                }
                
                e.target.value = formattedValue;
            }
        });
        
        // Улучшенная валидация для мобильных
        input.addEventListener('blur', function() {
            const value = this.value.replace(/\D/g, '');
            if (value.length === 11) {
                this.classList.add('is-valid');
            }
        });
    });
}

/**
 * Оптимизации для touch-устройств
 */
function initTouchOptimizations() {
    // Предотвращение двойного тапа на iOS
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function(event) {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, { passive: false });
    
    // Улучшение hover эффектов для touch
    if (MOBILE_CONFIG.isTouch) {
        document.querySelectorAll('.card-hover, .btn, .nav-link').forEach(element => {
            element.classList.add('touch-element');
        });
    }
    
    document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
        toggle.addEventListener('touchstart', function(e) {
            // На мобильных устройствах Bootstrap и так работает нормально
            // Удаляем preventDefault чтобы не мешать
            // e.preventDefault(); // УДАЛИТЕ ЭТУ СТРОКУ
            
            // Только для дебага
            console.log('Dropdown touched', this);
        }, { passive: true }); // Используйте passive: true
    });
}

/**
 * Ленивая загрузка изображений
 */
function initImageLoading() {
    if (!('IntersectionObserver' in window)) return;
    
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                
                // Загружаем изображение
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                
                // Загружаем background-image
                if (img.dataset.bg) {
                    img.style.backgroundImage = `url(${img.dataset.bg})`;
                    img.removeAttribute('data-bg');
                }
                
                imageObserver.unobserve(img);
            }
        });
    }, {
        rootMargin: '50px 0px',
        threshold: 0.1
    });
    
    // Наблюдаем за изображениями
    document.querySelectorAll('img[data-src], .lazy-bg[data-bg]').forEach(el => {
        imageObserver.observe(el);
    });
}

/**
 * Оптимизация модальных окон для мобильных
 */
function initModalOptimizations() {
    const modalElements = document.querySelectorAll('.modal');
    
    modalElements.forEach(modal => {
        // Фикс для iOS и скролла
        modal.addEventListener('shown.bs.modal', function() {
            document.body.classList.add('modal-open');
            
            // Фикс для скролла на iOS
            if (MOBILE_CONFIG.isIOS) {
                const scrollY = window.scrollY;
                document.body.style.position = 'fixed';
                document.body.style.top = `-${scrollY}px`;
                document.body.style.width = '100%';
            }
        });
        
        modal.addEventListener('hidden.bs.modal', function() {
            // Восстанавливаем скролл на iOS
            if (MOBILE_CONFIG.isIOS) {
                const scrollY = Math.abs(parseInt(document.body.style.top || '0'));
                document.body.style.position = '';
                document.body.style.top = '';
                document.body.style.width = '';
                window.scrollTo(0, scrollY);
            }
            
            document.body.classList.remove('modal-open');
        });
    });
}

/**
 * Фиксы для iOS
 */
function initIOSFixes() {
    // Фикс для input zoom
    document.addEventListener('focus', function(e) {
        if (e.target.matches('input, textarea, select')) {
            document.body.style.fontSize = '16px';
        }
    }, true);
    
    document.addEventListener('blur', function() {
        setTimeout(() => {
            document.body.style.fontSize = '';
        }, 100);
    }, true);
    
    // Фикс для 100vh
    function setVH() {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
    
    setVH();
    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', setVH);
}

/**
 * Инициализация тултипов
 */
function initTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function(tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl, {
            trigger: 'hover focus'
        });
    });
}

/**
 * Утилиты
 */

// Дебаунс
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

// Троттлинг
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}





/**
 * Показать уведомление
 */
function showNotification(message, type = 'success') {
    // Создаем контейнер если его нет
    let container = document.querySelector('.notifications-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'notifications-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            max-width: 90vw;
        `;
        document.body.appendChild(container);
    }
    
    // Создаем уведомление
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.style.cssText = `
        max-width: 400px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        margin-bottom: 10px;
    `;
    
    alertDiv.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="bi ${type === 'success' ? 'bi-check-circle' : 'bi-exclamation-circle'} me-2"></i>
            <span>${message}</span>
        </div>
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    container.appendChild(alertDiv);
    
    // Автоматическое скрытие
    setTimeout(() => {
        if (alertDiv.parentNode) {
            const bsAlert = new bootstrap.Alert(alertDiv);
            bsAlert.close();
        }
    }, 5000);
}

/**
 * API взаимодействие
 */
async function submitForm(form, endpoint, options = {}) {
    const formData = new FormData(form);
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    // Показываем индикатор загрузки
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
        <span class="spinner-border spinner-border-sm" role="status"></span>
        <span class="ms-2">Отправка...</span>
    `;
    
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                ...options.headers
            },
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification(result.message || 'Данные успешно отправлены', 'success');
            form.reset();
            form.classList.remove('was-validated');
            
            // Закрываем модальное окно если оно есть
            const modal = bootstrap.Modal.getInstance(form.closest('.modal'));
            if (modal) {
                modal.hide();
            }
        } else {
            showNotification(result.errors ? result.errors.join(', ') : result.error || 'Ошибка отправки', 'danger');
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

/**
 * Обработчик изменения размера окна
 */
window.addEventListener('resize', debounce(function() {
    detectDeviceType();
    
    // Переинициализация меню при переходе между мобильным/десктопом
    const navbarCollapse = document.querySelector('.navbar-collapse');
    if (window.innerWidth > MOBILE_CONFIG.breakpoints.tablet) {
        if (navbarCollapse && navbarCollapse.classList.contains('show')) {
            document.body.classList.remove('mobile-menu-open');
            const backdrop = document.querySelector('.mobile-menu-backdrop');
            if (backdrop) backdrop.remove();
        }
    }
}, 250));

/**
 * Обработчик загрузки всех ресурсов
 */
window.addEventListener('load', function() {
    // Помечаем что страница полностью загружена
    document.body.classList.add('page-loaded');
    
    // Удаляем прелоадер если есть
    const preloader = document.querySelector('.preloader');
    if (preloader) {
        preloader.style.opacity = '0';
        setTimeout(() => {
            preloader.style.display = 'none';
        }, 300);
    }
});


function initScrollToTop() {
    const scrollBtn = document.getElementById('scrollToTopBtn');
    if (!scrollBtn) return;
    
    // Показать/скрыть кнопку при скролле
    function toggleScrollButton() {
        if (window.pageYOffset > 300) {
            scrollBtn.classList.add('visible');
        } else {
            scrollBtn.classList.remove('visible');
        }
    }
    
    // Прокрутка наверх
    function scrollToTop() {
        // Используем плавную прокрутку если поддерживается
        if ('scrollBehavior' in document.documentElement.style) {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        } else {
            // Fallback для старых браузеров
            const scrollStep = -window.scrollY / (500 / 15);
            const scrollInterval = setInterval(function() {
                if (window.scrollY !== 0) {
                    window.scrollBy(0, scrollStep);
                } else {
                    clearInterval(scrollInterval);
                }
            }, 15);
        }
        
        // Для мобильных устройств - дополнительная анимация
        if (MOBILE_CONFIG.isMobile) {
            scrollBtn.classList.add('active');
            setTimeout(() => {
                scrollBtn.classList.remove('active');
            }, 300);
        }
    }
    
    // Обработчики событий
    window.addEventListener('scroll', toggleScrollButton);
    scrollBtn.addEventListener('click', scrollToTop);
    
    // Touch-оптимизация для мобильных
    if (MOBILE_CONFIG.isTouch) {
        scrollBtn.addEventListener('touchstart', function(e) {
            e.preventDefault();
            this.style.transform = 'scale(0.95)';
        }, { passive: false });
        
        scrollBtn.addEventListener('touchend', function(e) {
            e.preventDefault();
            this.style.transform = '';
            scrollToTop();
        }, { passive: false });
    }
    
    // Инициализация
    toggleScrollButton();
}

/**
 * Инициализация круглой кнопки MedFlex
 */
function initMedFlexRoundWidget() {
    // Ждем загрузки виджета
    setTimeout(() => {
        const roundWidget = document.querySelector('#medflexRoundWidgetData');
        
        if (roundWidget) {
            // Применяем стили к созданному виджету
            const widgetContainer = roundWidget.nextElementSibling;
            
            if (widgetContainer) {
                widgetContainer.style.cssText = `
                    position: fixed !important;
                    bottom: 90px !important;
                    right: 20px !important;
                    width: 60px !important;
                    height: 60px !important;
                    z-index: 1000 !important;
                    border-radius: 50% !important;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2) !important;
                    overflow: hidden !important;
                `;
                
                // Находим кнопку внутри
                const widgetButton = widgetContainer.querySelector('button, a');
                if (widgetButton) {
                    widgetButton.style.cssText = `
                        width: 100% !important;
                        height: 100% !important;
                        border-radius: 50% !important;
                        background: linear-gradient(135deg, #e5a7ff 0%, #d18cff 100%) !important;
                        border: none !important;
                        display: flex !important;
                        align-items: center !important;
                        justify-content: center !important;
                        color: white !important;
                    `;
                }
            }
        }
    }, 2000); // Ждем 2 секунды для загрузки виджета
}




// Вызовите эту функцию в DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('App.js инициализирован для мобильных устройств');
    
    // Определяем тип устройства
    detectDeviceType();
    
    // Инициализируем все функции
    initMobileMenu();
    initSmoothScroll();
    initHeaderScroll();
    initTooltips();
    initFormsValidation();
    initAnimations();
    initPhoneMask();
    initTouchOptimizations();
    initImageLoading();
    initModalOptimizations();
    initMedFlexRoundWidget();
    
    // Кнопка "Наверх" - добавьте эту строку!
    initScrollToTop();
    
    // iOS специфичные фиксы
    if (MOBILE_CONFIG.isIOS) {
        initIOSFixes();
    }
});


