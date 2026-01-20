/**
 * =============================================
 * IMAGE-MODAL.JS - ПРОСТОЙ МОДАЛЬНЫЙ ПРОСМОТР ИЗОБРАЖЕНИЙ
 * Используется как легкая альтернатива PhotoSwipe
 * =============================================
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Image-modal.js инициализирован');
    
    // Инициализируем модальное окно для изображений
    initImageModal();
    initModalKeyboardControls();
});

/**
 * Инициализация модального окна для изображений
 */
function initImageModal() {
    // Находим модальное окно
    const imageModalElement = document.getElementById('imageModal');
    if (!imageModalElement) {
        console.log('Модальное окно для изображений не найдено');
        return;
    }
    
    const modal = new bootstrap.Modal(imageModalElement);
    const modalImage = document.getElementById('modalImage');
    const modalCloseBtn = imageModalElement.querySelector('.btn-close');
    
    if (!modalImage) {
        console.error('Не найден элемент для отображения изображения');
        return;
    }
    
    // Находим все изображения, которые можно открыть в модальном окне
    const galleryItems = document.querySelectorAll('.gallery-item, [data-toggle="image-modal"]');
    
    galleryItems.forEach(item => {
        item.addEventListener('click', function(e) {
            // Проверяем, не отмечен ли элемент как использующий другую галерею
            if (this.hasAttribute('data-pswp-src')) {
                return; // Пропускаем, если это для PhotoSwipe
            }
            
            e.preventDefault();
            
            const imageUrl = this.getAttribute('href') || this.getAttribute('data-image-url');
            if (!imageUrl) return;
            
            // Устанавливаем изображение
            modalImage.src = imageUrl;
            modalImage.alt = this.querySelector('img')?.alt || 'Изображение';
            
            // Показываем модальное окно
            modal.show();
        });
    });
    
    // Очищаем src при закрытии модального окна
    imageModalElement.addEventListener('hidden.bs.modal', function() {
        modalImage.src = '';
        modalImage.alt = '';
    });
    
    // Закрытие по клику на фон
    imageModalElement.addEventListener('click', function(e) {
        if (e.target === this) {
            modal.hide();
        }
    });
    
    // Закрытие по кнопке
    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', () => modal.hide());
    }
}

/**
 * Управление модальным окном с клавиатуры
 */
function initModalKeyboardControls() {
    document.addEventListener('keydown', function(e) {
        const imageModal = document.getElementById('imageModal');
        if (!imageModal || !imageModal.classList.contains('show')) return;
        
        // Закрытие по Escape
        if (e.key === 'Escape') {
            const modalInstance = bootstrap.Modal.getInstance(imageModal);
            if (modalInstance) {
                modalInstance.hide();
            }
        }
    });
}

/**
 * Функция для программного открытия изображения
 * @param {string} imageUrl - URL изображения
 * @param {string} altText - Альтернативный текст
 */
function openImageModal(imageUrl, altText = 'Изображение') {
    const imageModalElement = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    
    if (!imageModalElement || !modalImage) {
        console.error('Модальное окно для изображений не найдено');
        return;
    }
    
    modalImage.src = imageUrl;
    modalImage.alt = altText;
    
    const modal = new bootstrap.Modal(imageModalElement);
    modal.show();
}