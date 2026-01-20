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
    }
    
    if (document.querySelector('.rating-input')) {
        initRatingStars();
    }
});

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
        
        const authorName = document.getElementById('authorName').value.trim();
        const content = document.getElementById('content').value.trim();
        const rating = document.getElementById('rating').value;
        const privacyCheckbox = document.getElementById('privacyReview');
        
        // Валидация
        if (!authorName) {
            alert('Пожалуйста, введите ваше имя');
            return;
        }
        
        if (!content) {
            alert('Пожалуйста, напишите текст отзыва');
            return;
        }
        
        const ratingNum = parseInt(rating);
        if (!ratingNum || ratingNum < 1 || ratingNum > 5) {
            alert('Пожалуйста, поставьте оценку от 1 до 5 звезд');
            return;
        }
        
        if (!privacyCheckbox || !privacyCheckbox.checked) {
            alert('Пожалуйста, подтвердите согласие с политикой конфиденциальности');
            return;
        }
        
        // Блокируем кнопку
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Отправка...';
        
        try {
            const response = await fetch('/reviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    author_name: authorName,
                    content: content,
                    rating: ratingNum
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                alert(result.message);
                form.reset();
                ratingInput.value = '';
                highlightRatingStars(0);
                document.getElementById('ratingText').textContent = 'Выберите оценку';
                loadReviews(); // Перезагружаем отзывы
            } else {
                throw new Error(result.errors ? result.errors.join(', ') : result.error);
            }
        } catch (error) {
            console.error('Ошибка отправки отзыва:', error);
            alert(`Ошибка: ${error.message}`);
        } finally {
            // Разблокируем кнопку
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
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