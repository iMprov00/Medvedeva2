/**
 * =============================================
 * PRICES.JS - ФУНКЦИИ ДЛЯ СТРАНИЦЫ УСЛУГ И ЦЕН
 * =============================================
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Prices.js инициализирован');
    
    // Инициализируем функции страницы услуг
    initServicesSearch();
    initFAQAccordion();
    initCopyServiceCode();
    initPriceAnimations();
});

/**
 * Инициализация поиска услуг
 */
function initServicesSearch() {
    const searchInput = document.getElementById('serviceSearchInput');
    const categorySelect = document.getElementById('serviceCategorySelect');
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    
    if (!searchInput || !categorySelect) return;
    
    // Дебаунс поиска
    const debouncedSearch = debounce(filterServices, 300);
    
    searchInput.addEventListener('input', debouncedSearch);
    categorySelect.addEventListener('change', filterServices);
    
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', clearServicesSearch);
    }
}

/**
 * Фильтрация услуг
 */
async function filterServices() {
    const searchInput = document.getElementById('serviceSearchInput');
    const categorySelect = document.getElementById('serviceCategorySelect');
    const servicesCount = document.getElementById('servicesCount');
    
    const query = searchInput.value;
    const categoryId = categorySelect.value;
    
    try {
        const response = await fetch('/services/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                query: query,
                category_id: categoryId
            })
        });
        
        const data = await response.json();
        
        // Обновляем контейнер с результатами
        const searchResults = document.getElementById('searchResults');
        if (searchResults) {
            searchResults.innerHTML = data.html;
            
            // Показываем/скрываем сообщение об отсутствии результатов
            const noResultsMessage = document.getElementById('noResultsMessage');
            if (noResultsMessage) {
                noResultsMessage.classList.toggle('d-none', data.count > 0);
            }
            
            // Обновляем счетчик
            if (servicesCount) {
                servicesCount.textContent = data.count;
            }
            
            // Инициализируем тултипы в результатах поиска
            initTooltipsInResults();
            initCopyServiceCode();
            toggleCategorySections();
        }
    } catch (error) {
        console.error('Ошибка при поиске услуг:', error);
        showNotification('Ошибка при загрузке данных. Пожалуйста, попробуйте еще раз.', 'danger');
    }
}

/**
 * Сброс поиска услуг
 */
function clearServicesSearch() {
    const searchInput = document.getElementById('serviceSearchInput');
    const categorySelect = document.getElementById('serviceCategorySelect');
    
    if (searchInput) searchInput.value = '';
    if (categorySelect) categorySelect.value = '';
    
    filterServices();
}

/**
 * Инициализация тултипов в результатах поиска
 */
function initTooltipsInResults() {
    // Уничтожаем старые тултипы
    const existingTooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    existingTooltips.forEach(el => {
        const tooltip = bootstrap.Tooltip.getInstance(el);
        if (tooltip) {
            tooltip.dispose();
        }
    });
    
    // Инициализируем новые тултипы
    const newTooltips = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    newTooltips.forEach(el => {
        new bootstrap.Tooltip(el);
    });
}

/**
 * Копирование кода услуги при клике
 */
function initCopyServiceCode() {
    document.addEventListener('click', async function(e) {
        if (e.target.classList.contains('service-code')) {
            e.preventDefault();
            
            const code = e.target.textContent.trim();
            const originalText = e.target.getAttribute('data-original-text') || e.target.getAttribute('title');
            
            try {
                await navigator.clipboard.writeText(code);
                
                // Показываем обратную связь
                const tooltipInstance = bootstrap.Tooltip.getInstance(e.target);
                if (tooltipInstance) {
                    tooltipInstance.setContent({'.tooltip-inner': 'Скопировано!'});
                    tooltipInstance.show();
                }
                
                // Визуальная обратная связь
                e.target.classList.add('copied');
                
                // Восстанавливаем через 2 секунды
                setTimeout(() => {
                    if (tooltipInstance) {
                        tooltipInstance.setContent({'.tooltip-inner': originalText || `Код услуги: ${code}`});
                    }
                    e.target.classList.remove('copied');
                }, 2000);
            } catch (err) {
                console.error('Ошибка копирования:', err);
                showNotification('Не удалось скопировать код', 'danger');
            }
        }
    });
}

/**
 * Раскрытие/скрытие секций категорий
 */
function toggleCategorySections() {
    const categoryHeaders = document.querySelectorAll('.category-header');
    
    categoryHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const targetId = this.querySelector('[data-bs-target]')?.getAttribute('data-bs-target');
            if (!targetId) return;
            
            const target = document.querySelector(targetId);
            const icon = this.querySelector('.bi-chevron-down');
            
            if (!target || !icon) return;
            
            if (target.classList.contains('show')) {
                icon.classList.remove('bi-chevron-down');
                icon.classList.add('bi-chevron-up');
            } else {
                icon.classList.remove('bi-chevron-up');
                icon.classList.add('bi-chevron-down');
            }
        });
    });
}

/**
 * Инициализация FAQ аккордеона
 */
function initFAQAccordion() {
    const accordionButtons = document.querySelectorAll('#faqAccordion .accordion-button');
    
    accordionButtons.forEach(button => {
        button.addEventListener('click', function() {
            const icon = this.querySelector('i');
            if (icon) {
                icon.classList.toggle('bi-chevron-down');
                icon.classList.toggle('bi-chevron-up');
            }
        });
    });
}

/**
 * Инициализация анимаций на странице услуг
 */
function initPriceAnimations() {
    const priceSections = document.querySelectorAll('.category-section');
    
    priceSections.forEach((section, index) => {
        section.style.animationDelay = `${index * 0.1}s`;
    });
}