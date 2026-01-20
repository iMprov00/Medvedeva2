/**
 * =============================================
 * GALLERY.JS - ГАЛЕРЕЯ ИЗОБРАЖЕНИЙ С PHOTOSWIPE
 * =============================================
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Gallery.js инициализирован');
    
    // Проверяем наличие галереи на странице
    const galleryElement = document.getElementById('my-gallery');
    if (!galleryElement) {
        console.log('Галерея не найдена на этой странице');
        return;
    }
    
    // Инициализируем галерею только если есть изображения
    const galleryItems = galleryElement.querySelectorAll('a');
    if (galleryItems.length === 0) {
        console.log('Нет изображений для галереи');
        return;
    }
    
    // Инициализируем галерею
    initPhotoSwipeGallery();
    initGalleryHoverEffects();
});

/**
 * Инициализация галереи PhotoSwipe
 */
function initPhotoSwipeGallery() {
    const lightbox = new PhotoSwipeLightbox({
        gallery: '#my-gallery',
        children: 'a',
        pswpModule: PhotoSwipe
    });
    
    // Дополнительная настройка PhotoSwipe
    lightbox.on('uiRegister', function() {
        // Можно добавить кастомные кнопки или элементы интерфейса
    });
    
    // Обработка ошибок загрузки изображений
    lightbox.on('loadError', function(e) {
        console.error('Ошибка загрузки изображения:', e);
        showNotification('Не удалось загрузить изображение', 'warning');
    });
    
    // Инициализация
    lightbox.init();
}

/**
 * Эффекты при наведении на миниатюры галереи
 */
function initGalleryHoverEffects() {
    const galleryThumbnails = document.querySelectorAll('.gallery-thumbnail');
    
    galleryThumbnails.forEach(thumbnail => {
        thumbnail.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05)';
            this.style.transition = 'transform 0.3s ease';
        });
        
        thumbnail.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });
}

/**
 * Функция для программного открытия галереи
 * @param {number} index - Индекс изображения для открытия
 */
function openGalleryAtIndex(index) {
    const galleryElement = document.getElementById('my-gallery');
    if (!galleryElement) return;
    
    const lightbox = new PhotoSwipeLightbox({
        gallery: '#my-gallery',
        children: 'a',
        pswpModule: PhotoSwipe,
        index: index
    });
    
    lightbox.init();
    lightbox.loadAndOpen(index);
}