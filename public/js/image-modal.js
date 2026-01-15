document.addEventListener('DOMContentLoaded', function() {
    // Находим все элементы с классом gallery-item
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    // Находим элементы модального окна и картинки внутри него
    const imageModal = new bootstrap.Modal(document.getElementById('imageModal'));
    const modalImage = document.getElementById('modalImage');

    // Добавляем обработчик клика на каждую картинку
    galleryItems.forEach(item => {
        item.addEventListener('click', function(event) {
            // Предотвращаем стандартное действие ссылки (переход по URL)
            event.preventDefault(); 
            
            // Берем URL изображения из атрибута href ссылки
            const imageUrl = this.getAttribute('href');
            
            // Устанавливаем этот URL в src картинки внутри модального окна
            modalImage.setAttribute('src', imageUrl);
            
            // Показываем модальное окно
            imageModal.show();
        });
    });

    // (Опционально) Очищаем src при закрытии модального окна, 
    // чтобы избежать показа старой картинки во время открытия новой
    const imageModalElement = document.getElementById('imageModal');
    imageModalElement.addEventListener('hidden.bs.modal', function () {
        modalImage.setAttribute('src', '');
    });
});