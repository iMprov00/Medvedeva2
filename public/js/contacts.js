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
});

/**
 * Инициализация формы обратной связи
 */
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Проверяем согласие с политикой конфиденциальности
        const privacyCheckbox = document.getElementById('privacyContact');
        if (!privacyCheckbox || !privacyCheckbox.checked) {
            alert('Пожалуйста, подтвердите согласие с политикой конфиденциальности');
            privacyCheckbox?.focus();
            return;
        }
        
        // Валидация телефона
        const phoneInput = document.getElementById('phone');
        if (phoneInput) {
            const phoneValue = phoneInput.value;
            const phoneDigits = phoneValue.replace(/\D/g, '');
            
            if (phoneDigits.length < 10 && phoneDigits.length > 0) {
                alert('Пожалуйста, введите корректный номер телефона (минимум 10 цифр)');
                phoneInput.focus();
                return;
            }
        }
        
        // Отправляем форму
        const result = await submitForm(contactForm, '/contacts');
        
        if (result && result.success) {
            // Дополнительные действия при успешной отправке
            const phoneInput = document.getElementById('phone');
            if (phoneInput) {
                // Можно записать телефон в localStorage для автозаполнения
                localStorage.setItem('last_contact_phone', phoneInput.value);
            }
        }
    });
}

/**
 * Инициализация карты
 */
function initMap() {
    const mapElement = document.getElementById('map');
    if (!mapElement) return;
    
    // Проверяем, загружена ли карта Яндекса
    if (typeof ymaps !== 'undefined') {
        // Координаты клиники
        const clinicCoords = [53.346785, 83.776856]; // Примерные координаты Барнаула
        
        // Инициализируем карту
        ymaps.ready(function() {
            const map = new ymaps.Map(mapElement, {
                center: clinicCoords,
                zoom: 16,
                controls: ['zoomControl', 'fullscreenControl']
            });
            
            // Добавляем метку
            const placemark = new ymaps.Placemark(clinicCoords, {
                balloonContent: `
                    <strong>Клиника доктора Медведевой</strong><br>
                    г. Барнаул, ул. 280-летия Барнаула, д. 22<br>
                    +7 (913) 365-04-64
                `
            }, {
                preset: 'islands#icon',
                iconColor: '#e5a7ff'
            });
            
            map.geoObjects.add(placemark);
            
            // Открываем балун при клике на метку
            placemark.balloon.open();
        });
    } else {
        console.log('Карта Яндекс не загружена');
    }
}

/**
 * Анимации для страницы контактов
 */
function initContactAnimations() {
    const contactCards = document.querySelectorAll('.contact-card');
    
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

/**
 * Функция для открытия навигации в Яндекс.Картах
 * @param {string} address - Адрес для навигации
 */
function openYandexNavigation(address = 'г. Барнаул, ул. 280-летия Барнаула, д. 22') {
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://yandex.ru/maps/?text=${encodedAddress}`, '_blank');
}

/**
 * Функция для открытия навигации в Яндекс.Навигаторе
 */
function openYandexNavigator() {
    const coords = '53.346785,83.776856';
    window.open(`yandexnavi://build_route_on_map?lat_to=53.346785&lon_to=83.776856`, '_blank');
}