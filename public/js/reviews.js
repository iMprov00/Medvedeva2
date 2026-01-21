/**
 * =============================================
 * REVIEWS.JS - РАБОТА С ОТЗЫВАМИ
 * =============================================
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Reviews.js инициализирован');
    
    // Проверяем наличие элементов для отзывов на странице
    const reviewsList = document.getElementById('reviewsList');
    const newReviewForm = document.getElementById('newReviewForm');
    
    if (reviewsList) {
        loadReviews();
    }
    
    if (newReviewForm) {
        initReviewForm();
        initReviewFormValidation();
    }
    
    if (document.querySelector('.rating-input')) {
        initRatingStars();
    }
});

/**
 * Инициализация валидации формы отзыва
 */
function initReviewFormValidation() {
    const reviewForm = document.getElementById('newReviewForm');
    if (!reviewForm) return;
    
    // Добавляем обработчики для валидации в реальном времени
    const inputs = reviewForm.querySelectorAll('input[required], textarea[required]');
    
    inputs.forEach(input => {
        // Сброс ошибки при вводе
        input.addEventListener('input', function() {
            if (this.value.trim()) {
                clearFieldError(this);
            }
        });
        
        // Валидация при потере фокуса
        input.addEventListener('blur', function() {
            validateReviewField(this);
        });
    });
    
    // Валидация чекбокса
    const privacyCheckbox = document.getElementById('privacyReview');
    if (privacyCheckbox) {
        privacyCheckbox.addEventListener('change', function() {
            validateReviewField(this);
        });
    }
    
    // Валидация рейтинга
    const ratingInput = document.getElementById('rating');
    if (ratingInput) {
        // Скрытое поле рейтинга, валидация через клик на звезды
        document.querySelectorAll('.rating-input .stars i').forEach(star => {
            star.addEventListener('click', function() {
                clearFieldError(ratingInput);
            });
        });
    }
}

/**
 * Загрузка отзывов с сервера
 */
async function loadReviews() {
    const reviewsList = document.getElementById('reviewsList');
    if (!reviewsList) return;
    
    // Показываем индикатор загрузки
    reviewsList.innerHTML = `
        <div class="col-12 text-center py-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Загрузка отзывов...</span>
            </div>
        </div>
    `;
    
    try {
        const response = await fetch('/reviews');
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        
        const reviews = await response.json();
        renderReviews(reviews);
    } catch (error) {
        console.error('Ошибка при загрузке отзывов:', error);
        showReviewsError();
    }
}

/**
 * Отрисовка списка отзывов
 */
function renderReviews(reviews) {
    const reviewsList = document.getElementById('reviewsList');
    if (!reviewsList) return;
    
    if (!Array.isArray(reviews) || reviews.length === 0) {
        reviewsList.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="bi bi-chat-square-text display-4 text-muted mb-3"></i>
                <p class="text-muted">Отзывов пока нет. Будьте первым!</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    
    reviews.forEach(review => {
        // Создаем звезды для рейтинга
        const starsHtml = createStarsHtml(review.rating);
        
        html += `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="card h-100 border-0 shadow-sm fade-in-up">
                    <div class="card-body d-flex flex-column">
                        <div class="mb-3">
                            <div class="d-flex justify-content-between align-items-start mb-2">
                                <h5 class="fw-bold mb-0">${escapeHtml(review.author_name)}</h5>
                                <small class="text-muted">${review.formatted_date || formatDate(review.created_at)}</small>
                            </div>
                            <div class="mb-2">
                                ${starsHtml}
                            </div>
                        </div>
                        <p class="text-muted flex-grow-1">${escapeHtml(review.content)}</p>
                    </div>
                </div>
            </div>
        `;
    });
    
    reviewsList.innerHTML = html;
    initReviewsAnimations();
}

/**
 * Создание HTML для звезд рейтинга
 */
function createStarsHtml(rating) {
    let starsHtml = '';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
        if (i <= fullStars) {
            starsHtml += '<i class="bi bi-star-fill text-warning"></i>';
        } else if (i === fullStars + 1 && hasHalfStar) {
            starsHtml += '<i class="bi bi-star-half text-warning"></i>';
        } else {
            starsHtml += '<i class="bi bi-star text-warning"></i>';
        }
        
        // Добавляем пробел между звездами (кроме последней)
        if (i < 5) {
            starsHtml += ' ';
        }
    }
    
    return starsHtml;
}

/**
 * Форматирование даты
 */
function formatDate(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

/**
 * Экранирование HTML для безопасности
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Инициализация звездного рейтинга
 */
function initRatingStars() {
    const starsContainer = document.querySelector('.rating-input .stars');
    const ratingInput = document.getElementById('rating');
    const ratingText = document.getElementById('ratingText');
    
    if (!starsContainer || !ratingInput || !ratingText) return;
    
    const stars = starsContainer.querySelectorAll('i');
    const ratingTexts = {
        1: 'Ужасно',
        2: 'Плохо',
        3: 'Нормально',
        4: 'Хорошо',
        5: 'Отлично'
    };
    
    stars.forEach(star => {
        star.addEventListener('mouseover', function() {
            const rating = parseInt(this.dataset.rating);
            highlightRatingStars(rating);
            ratingText.textContent = ratingTexts[rating] || 'Выберите оценку';
        });
        
        star.addEventListener('click', function() {
            const rating = parseInt(this.dataset.rating);
            ratingInput.value = rating;
            highlightRatingStars(rating);
            ratingText.textContent = ratingTexts[rating];
            
            // Сбрасываем ошибку рейтинга если была
            clearFieldError(ratingInput);
        });
    });
    
    // Сброс при уходе мыши
    const ratingInputContainer = document.querySelector('.rating-input');
    if (ratingInputContainer) {
        ratingInputContainer.addEventListener('mouseleave', function() {
            const currentRating = ratingInput.value;
            if (currentRating) {
                highlightRatingStars(currentRating);
                ratingText.textContent = ratingTexts[currentRating];
            } else {
                highlightRatingStars(0);
                ratingText.textContent = 'Выберите оценку';
            }
        });
    }
}

/**
 * Подсветка звезд рейтинга
 */
function highlightRatingStars(rating) {
    const stars = document.querySelectorAll('.rating-input .stars i');
    stars.forEach(star => {
        const starRating = parseInt(star.dataset.rating);
        if (starRating <= rating) {
            star.classList.remove('bi-star');
            star.classList.add('bi-star-fill', 'text-warning');
        } else {
            star.classList.remove('bi-star-fill', 'text-warning');
            star.classList.add('bi-star');
        }
    });
}

/**
 * Инициализация формы отправки отзыва
 */
function initReviewForm() {
    const form = document.getElementById('newReviewForm');
    if (!form) return;
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Проверяем все обязательные поля
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;
        
        requiredFields.forEach(field => {
            if (!validateReviewField(field)) {
                isValid = false;
            }
        });
        
        // Специальная проверка рейтинга
        const ratingInput = document.getElementById('rating');
        if (ratingInput && (!ratingInput.value || ratingInput.value < 1 || ratingInput.value > 5)) {
            showFieldError(ratingInput, 'Пожалуйста, поставьте оценку от 1 до 5 звезд');
            isValid = false;
        }
        
        if (!isValid) {
            showNotification('Пожалуйста, заполните все обязательные поля корректно', 'warning');
            return;
        }
        
        // Проверяем согласие с политикой конфиденциальности
        const privacyCheckbox = document.getElementById('privacyReview');
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
            // Получаем данные формы
            const authorName = document.getElementById('authorName').value.trim();
            const content = document.getElementById('content').value.trim();
            const rating = document.getElementById('rating').value;
            
            const response = await fetch('/reviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    author_name: authorName,
                    content: content,
                    rating: parseInt(rating)
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Показываем успешное уведомление
                showNotification(result.message, 'success');
                
                // Сбрасываем форму
                form.reset();
                
                // Сбрасываем рейтинг
                if (ratingInput) {
                    ratingInput.value = '';
                    highlightRatingStars(0);
                }
                
                // Сбрасываем текст рейтинга
                const ratingText = document.getElementById('ratingText');
                if (ratingText) {
                    ratingText.textContent = 'Выберите оценку';
                }
                
                // Сбрасываем все ошибки
                clearAllErrors(form);
                
                // Перезагружаем отзывы
                loadReviews();
                
            } else {
                const errorMessage = result.errors ? result.errors.join(', ') : result.error;
                showNotification(errorMessage || 'Произошла ошибка при отправке отзыва', 'danger');
                
                // Помечаем поля с ошибками на сервере
                if (result.errors && Array.isArray(result.errors)) {
                    result.errors.forEach(error => {
                        // Попробуем найти поле по имени
                        const fieldName = extractReviewFieldNameFromError(error);
                        if (fieldName) {
                            const field = form.querySelector(`[name="${fieldName}"]`);
                            if (field) {
                                showFieldError(field, error);
                            }
                        }
                    });
                }
            }
            
        } catch (error) {
            console.error('Ошибка отправки отзыва:', error);
            showNotification('Произошла ошибка при отправке отзыва. Пожалуйста, попробуйте еще раз.', 'danger');
        } finally {
            // Восстанавливаем кнопку
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    });
}

/**
 * Валидация поля формы отзыва
 */
function validateReviewField(field) {
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
    
    // Для рейтинга (скрытое поле)
    if (field.name === 'rating') {
        if (!field.value || field.value < 1 || field.value > 5) {
            showFieldError(field, 'Пожалуйста, поставьте оценку от 1 до 5 звезд');
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
    
    // Специальная проверка для имени (мин. 2 символа)
    if (field.name === 'author_name' && field.value.trim().length < 2) {
        showFieldError(field, 'Имя должно содержать минимум 2 символа');
        return false;
    }
    
    // Специальная проверка для текста отзыва (мин. 10 символов)
    if (field.name === 'content' && field.value.trim().length < 10) {
        showFieldError(field, 'Текст отзыва должен содержать минимум 10 символов');
        return false;
    }
    
    clearFieldError(field);
    return true;
}

/**
 * Извлечение имени поля из сообщения об ошибке для отзывов
 */
function extractReviewFieldNameFromError(error) {
    const fieldMap = {
        'имя': 'author_name',
        'текст': 'content',
        'отзыв': 'content',
        'оценка': 'rating',
        'рейтинг': 'rating',
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
 * Показать ошибку для поля (общая функция)
 */
function showFieldError(field, message) {
    if (!field) return;
    
    // Добавляем класс ошибки
    field.classList.add('is-invalid');
    
    // Для скрытого поля рейтинга - показываем ошибку у контейнера звезд
    if (field.type === 'hidden' && field.name === 'rating') {
        const ratingContainer = document.querySelector('.rating-input');
        if (ratingContainer) {
            // Удаляем старую ошибку если есть
            const existingError = ratingContainer.querySelector('.invalid-feedback');
            if (existingError) {
                existingError.remove();
            }
            
            // Добавляем сообщение об ошибке
            const errorDiv = document.createElement('div');
            errorDiv.className = 'invalid-feedback d-block';
            errorDiv.textContent = message;
            
            // Добавляем после контейнера звезд
            const stars = ratingContainer.querySelector('.stars');
            if (stars) {
                stars.parentNode.insertBefore(errorDiv, stars.nextSibling);
            }
        }
        return;
    }
    
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
 * Очистить ошибку поля (общая функция)
 */
function clearFieldError(field) {
    if (!field) return;
    
    field.classList.remove('is-invalid');
    
    // Для скрытого поля рейтинга - очищаем ошибку у контейнера звезд
    if (field.type === 'hidden' && field.name === 'rating') {
        const ratingContainer = document.querySelector('.rating-input');
        if (ratingContainer) {
            const errorDiv = ratingContainer.querySelector('.invalid-feedback');
            if (errorDiv) {
                errorDiv.remove();
            }
        }
        return;
    }
    
    const errorDiv = field.parentNode.querySelector('.invalid-feedback');
    if (errorDiv) {
        errorDiv.remove();
    }
}

/**
 * Очистить все ошибки в форме (общая функция)
 */
function clearAllErrors(form) {
    const errorFields = form.querySelectorAll('.is-invalid');
    errorFields.forEach(field => {
        clearFieldError(field);
    });
}

/**
 * Анимации для отзывов
 */
function initReviewsAnimations() {
    const reviewCards = document.querySelectorAll('#reviewsList .fade-in-up');
    
    reviewCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

/**
 * Показ ошибки при загрузке отзывов
 */
function showReviewsError() {
    const reviewsList = document.getElementById('reviewsList');
    if (reviewsList) {
        reviewsList.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger">
                    <i class="bi bi-exclamation-triangle me-2"></i>
                    Не удалось загрузить отзывы. Пожалуйста, попробуйте позже.
                </div>
            </div>`;
    }
}