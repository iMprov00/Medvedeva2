/**
 * =============================================
 * CONTACTS.JS - ФОРМЫ ОБРАТНОЙ СВЯЗИ И КОНТАКТОВ
 * =============================================
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Contacts.js инициализирован');
    
    // Инициализируем формы на странице контактов
    initContactForm();
    initMap();
    initContactAnimations();
    initFormValidation();
});

/**
 * Инициализация валидации формы
 */
function initFormValidation() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;
    
    // Добавляем обработчики для валидации в реальном времени
    const inputs = contactForm.querySelectorAll('input[required], textarea[required], select[required]');
    
    inputs.forEach(input => {
        // Сброс ошибки при вводе
        input.addEventListener('input', function() {
            if (this.value.trim()) {
                clearFieldError(this);
            }
        });
        
        // Валидация при потере фокуса
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        // Для select добавляем валидацию при изменении
        if (input.tagName === 'SELECT') {
            input.addEventListener('change', function() {
                validateField(this);
            });
        }
    });
    
    // Специальная валидация для email
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.addEventListener('blur', function() {
            if (this.value.trim() && !isValidEmail(this.value)) {
                showFieldError(this, 'Введите корректный email адрес');
            }
        });
    }
    
    // Специальная валидация для телефона
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('blur', function() {
            const phoneDigits = this.value.replace(/\D/g, '');
            if (this.value.trim() && phoneDigits.length < 10) {
                showFieldError(this, 'Введите корректный номер телефона (минимум 10 цифр)');
            }
        });
    }
    
    // Валидация чекбокса
    const privacyCheckbox = document.getElementById('privacyContact');
    if (privacyCheckbox) {
        privacyCheckbox.addEventListener('change', function() {
            validateField(this);
        });
    }
}

/**
 * Инициализация формы обратной связи
 */
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Проверяем все обязательные поля
        const requiredFields = contactForm.querySelectorAll('[required]');
        let isValid = true;
        
        requiredFields.forEach(field => {
            if (!validateField(field)) {
                isValid = false;
            }
        });
        
        // Специальная проверка email
        const emailInput = document.getElementById('email');
        if (emailInput && emailInput.value.trim() && !isValidEmail(emailInput.value)) {
            showFieldError(emailInput, 'Введите корректный email адрес');
            isValid = false;
        }
        
        // Специальная проверка телефона
        const phoneInput = document.getElementById('phone');
        if (phoneInput) {
            const phoneDigits = phoneInput.value.replace(/\D/g, '');
            if (phoneInput.value.trim() && phoneDigits.length < 10) {
                showFieldError(phoneInput, 'Введите корректный номер телефона (минимум 10 цифр)');
                isValid = false;
            }
        }
        
        if (!isValid) {
            showNotification('Пожалуйста, заполните все обязательные поля корректно', 'warning');
            return;
        }
        
        // Проверяем согласие с политикой конфиденциальности
        const privacyCheckbox = document.getElementById('privacyContact');
        if (!privacyCheckbox || !privacyCheckbox.checked) {
            showFieldError(privacyCheckbox, 'Необходимо согласиться с политикой конфиденциальности');
            showNotification('Пожалуйста, подтвердите согласие с политикой конфиденциальности', 'warning');
            return;
        }
        
        // Блокируем кнопку
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Отправка...';
        
        try {
            // Отправляем форму
            const formData = new FormData(contactForm);
            const response = await fetch('/contacts', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json'
                },
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                showNotification(result.message, 'success');
                contactForm.reset();
                
                // Сбрасываем все ошибки
                clearAllErrors(contactForm);
                
                // Дополнительные действия при успешной отправке
                if (phoneInput) {
                    localStorage.setItem('last_contact_phone', phoneInput.value);
                }
            } else {
                const errorMessage = result.errors ? result.errors.join(', ') : result.error;
                showNotification(errorMessage || 'Произошла ошибка при отправке', 'danger');
                
                // Помечаем поля с ошибками на сервере
                if (result.errors && Array.isArray(result.errors)) {
                    result.errors.forEach(error => {
                        // Попробуем найти поле по имени
                        const fieldName = extractFieldNameFromError(error);
                        if (fieldName) {
                            const field = contactForm.querySelector(`[name="${fieldName}"]`);
                            if (field) {
                                showFieldError(field, error);
                            }
                        }
                    });
                }
            }
        } catch (error) {
            console.error('Ошибка при отправке формы:', error);
            showNotification('Произошла ошибка при отправке. Пожалуйста, попробуйте еще раз.', 'danger');
        } finally {
            // Восстанавливаем кнопку
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    });
}

/**
 * Валидация отдельного поля
 */
function validateField(field) {
    if (!field) return false;
    
    // Для чекбоксов проверяем checked
    if (field.type === 'checkbox') {
        if (!field.checked) {
            showFieldError(field, 'Это поле обязательно для заполнения');
            return false;
        } else {
            clearFieldError(field);
            return true;
        }
    }
    
    // Для остальных полей проверяем значение
    if (!field.value.trim()) {
        showFieldError(field, 'Это поле обязательно для заполнения');
        return false;
    }
    
    // Специальная валидация для email
    if (field.type === 'email' && field.value.trim() && !isValidEmail(field.value)) {
        showFieldError(field, 'Введите корректный email адрес');
        return false;
    }
    
    // Специальная валидация для телефона
    if (field.name === 'phone' && field.value.trim()) {
        const phoneDigits = field.value.replace(/\D/g, '');
        if (phoneDigits.length < 10) {
            showFieldError(field, 'Введите корректный номер телефона (минимум 10 цифр)');
            return false;
        }
    }
    
    clearFieldError(field);
    return true;
}

/**
 * Показать ошибку для поля
 */
function showFieldError(field, message) {
    if (!field) return;
    
    // Добавляем класс ошибки
    field.classList.add('is-invalid');
    
    // Удаляем старую ошибку если есть
    const existingError = field.parentNode.querySelector('.invalid-feedback');
    if (existingError) {
        existingError.remove();
    }
    
    // Добавляем сообщение об ошибке
    const errorDiv = document.createElement('div');
    errorDiv.className = 'invalid-feedback';
    errorDiv.textContent = message;
    
    // Для чекбоксов добавляем после label
    if (field.type === 'checkbox') {
        const label = field.parentNode.querySelector('label');
        if (label) {
            label.parentNode.insertBefore(errorDiv, label.nextSibling);
        } else {
            field.parentNode.appendChild(errorDiv);
        }
    } else {
        field.parentNode.appendChild(errorDiv);
    }
}

/**
 * Очистить ошибку поля
 */
function clearFieldError(field) {
    if (!field) return;
    
    field.classList.remove('is-invalid');
    
    const errorDiv = field.parentNode.querySelector('.invalid-feedback');
    if (errorDiv) {
        errorDiv.remove();
    }
}

/**
 * Очистить все ошибки в форме
 */
function clearAllErrors(form) {
    const errorFields = form.querySelectorAll('.is-invalid');
    errorFields.forEach(field => {
        clearFieldError(field);
    });
}

/**
 * Проверка валидности email
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Извлечение имени поля из сообщения об ошибке
 */
function extractFieldNameFromError(error) {
    const fieldMap = {
        'имя': 'name',
        'телефон': 'phone',
        'email': 'email',
        'тема': 'subject',
        'сообщение': 'message',
        'согласие': 'privacy_accepted'
    };
    
    for (const [rusName, engName] of Object.entries(fieldMap)) {
        if (error.toLowerCase().includes(rusName)) {
            return engName;
        }
    }
    
    return null;
}

/**
 * Инициализация карты
 */
function initMap() {
    const mapElement = document.getElementById('map');
    if (!mapElement) return;
    
    // Карта уже встроена через iframe, оставляем как есть
    console.log('Карта инициализирована через iframe');
}

/**
 * Анимации для страницы контактов
 */
function initContactAnimations() {
    const contactCards = document.querySelectorAll('.card');
    
    contactCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
}