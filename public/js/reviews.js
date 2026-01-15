// public/js/reviews.js

// Загрузка отзывов
function loadReviews() {
    fetch('/reviews')
        .then(response => {
            if (!response.ok) {
                throw new Error('Ошибка сети');
            }
            return response.json();
        })
        .then(reviews => {
            const container = document.getElementById('reviewsList');
            if (!container) return;
            
            container.innerHTML = '';
            
            // Проверяем что reviews - массив
            if (!Array.isArray(reviews) || reviews.length === 0) {
                container.innerHTML = `
                    <div class="col-12 text-center">
                        <i class="bi bi-chat-square-text display-4 text-muted mb-3"></i>
                        <p class="text-muted">Отзывов пока нет. Будьте первым!</p>
                    </div>
                `;
                return;
            }
            
            reviews.forEach(review => {
                const reviewElement = document.createElement('div');
                reviewElement.className = 'col-md-6 col-lg-4';
                
                // Создаем звезды
                let starsHtml = '';
                for (let i = 1; i <= 5; i++) {
                    if (i <= review.rating) {
                        starsHtml += '<i class="bi bi-star-fill text-warning"></i>';
                    } else {
                        starsHtml += '<i class="bi bi-star text-warning"></i>';
                    }
                }
                
                reviewElement.innerHTML = `
                    <div class="card h-100 border-0 shadow-sm">
                        <div class="card-body d-flex flex-column">
                            <div class="mb-3">
                                <div class="d-flex justify-content-between align-items-start">
                                    <h5 class="fw-bold mb-1">${review.author_name}</h5>
                                    <div class="text-muted small">${review.formatted_date}</div>
                                </div>
                                <div class="mb-2">
                                    ${starsHtml}
                                </div>
                            </div>
                            <p class="text-muted flex-grow-1">${review.content}</p>
                        </div>
                    </div>
                `;
                
                container.appendChild(reviewElement);
            });
        })
        .catch(error => {
            console.error('Ошибка при загрузке отзывов:', error);
            const container = document.getElementById('reviewsList');
            if (container) {
                container.innerHTML = `
                    <div class="col-12 text-center">
                        <p class="text-danger">Не удалось загрузить отзывы. Пожалуйста, попробуйте позже.</p>
                    </div>
                `;
            }
        });
}

// Инициализация звездного рейтинга
function initRatingStars() {
    const stars = document.querySelectorAll('.rating-input .stars i');
    const ratingInput = document.getElementById('rating');
    const ratingText = document.getElementById('ratingText');
    
    if (!stars.length || !ratingInput || !ratingText) {
        console.log('Элементы рейтинга не найдены');
        return;
    }
    
    console.log('Инициализация звездного рейтинга');
    
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
            highlightStars(rating);
            ratingText.textContent = ratingTexts[rating] || 'Выберите оценку';
        });
        
        star.addEventListener('click', function() {
            const rating = parseInt(this.dataset.rating);
            console.log('Выбрана оценка:', rating);
            ratingInput.value = rating;
            highlightStars(rating);
            ratingText.textContent = ratingTexts[rating] || 'Выберите оценку';
        });
    });
    
    // Сброс при уходе мыши
    const ratingInputElement = document.querySelector('.rating-input');
    if (ratingInputElement) {
        ratingInputElement.addEventListener('mouseleave', function() {
            const currentRating = ratingInput.value;
            if (currentRating) {
                highlightStars(currentRating);
                ratingText.textContent = ratingTexts[currentRating];
            } else {
                highlightStars(0);
                ratingText.textContent = 'Выберите оценку';
            }
        });
    }
}

function highlightStars(rating) {
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

// Обработка формы
function initReviewForm() {
    const form = document.getElementById('newReviewForm');
    if (!form) {
        console.log('Форма отзывов не найдена');
        return;
    }
    
    console.log('Форма отзывов найдена');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Собираем данные
        const authorName = document.getElementById('authorName').value.trim();
        const content = document.getElementById('content').value.trim();
        const rating = document.getElementById('rating').value;
        
        console.log('Отправляемые данные:', { authorName, content, rating });
        
        // Валидация на клиенте
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
        
        // Блокируем кнопку
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Отправка...';
        
        // Отправляем запрос
        fetch('/reviews', {
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
        })
        .then(response => {
            console.log('Статус ответа:', response.status);
            if (!response.ok) {
                throw new Error(`HTTP ошибка: ${response.status}`);
            }
            return response.json();
        })
        .then(result => {
            console.log('Ответ сервера:', result);
            if (result.success) {
                alert(result.message);
                form.reset();
                document.getElementById('rating').value = '';
                highlightStars(0);
                document.getElementById('ratingText').textContent = 'Выберите оценку';
                loadReviews(); // Перезагружаем отзывы
            } else {
                alert('Ошибка: ' + (result.errors ? result.errors.join(', ') : result.error));
            }
        })
        .catch(error => {
            console.error('Ошибка сети:', error);
            alert('Произошла ошибка при отправке отзыва. Проверьте подключение к интернету.');
        })
        .finally(() => {
            // Разблокируем кнопку
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        });
    });
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    console.log('Reviews.js загружен');
    
    loadReviews();
    initRatingStars();
    initReviewForm();
});