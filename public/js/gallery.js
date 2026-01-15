document.addEventListener('DOMContentLoaded', function() {
    // Находим наш контейнер с галереей по ID
    const galleryElement = document.getElementById('my-gallery');
    
    // Проверяем, что контейнер существует на странице
    if (galleryElement) {
        // Создаем экземпляр PhotoSwipe
        const lightbox = new PhotoSwipeLightbox({
            // Указываем, где искать картинки
            gallery: '#my-gallery',
            // Указываем, что картинки — это ссылки <a>
            children: 'a',
            // Указываем, какой модуль использовать
            pswpModule: PhotoSwipe
        });
        
        // Инициализируем галерею
        lightbox.init();
    }
});