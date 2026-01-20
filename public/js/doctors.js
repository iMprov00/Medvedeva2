/**
 * =============================================
 * DOCTORS.JS - ФУНКЦИИ ДЛЯ СТРАНИЦЫ ВРАЧЕЙ
 * =============================================
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Doctors.js инициализирован');
    
    // Инициализируем функции страницы врачей
    initDoctorsSearch();
    initAppointmentModal();
    applyDoctorColors();
    initDoctorsAnimations();
});

/**
 * Инициализация поиска врачей
 */
function initDoctorsSearch() {
    const searchInput = document.getElementById('doctor-search');
    const specialtyFilter = document.getElementById('specialty-filter');
    const resetBtn = document.getElementById('reset-filters');
    
    if (!searchInput || !specialtyFilter || !resetBtn) return;
    
    // Дебаунс поиска
    const debouncedSearch = debounce(filterDoctors, 300);
    
    searchInput.addEventListener('input', debouncedSearch);
    specialtyFilter.addEventListener('change', filterDoctors);
    resetBtn.addEventListener('click', resetFilters);
}

/**
 * Фильтрация врачей
 */
async function filterDoctors() {
    const searchInput = document.getElementById('doctor-search');
    const specialtyFilter = document.getElementById('specialty-filter');
    const doctorsList = document.getElementById('doctors-list');
    
    const searchTerm = searchInput.value;
    const specialty = specialtyFilter.value;
    
    // Показываем индикатор загрузки
    doctorsList.innerHTML = `
        <div class="col-12 text-center py-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Загрузка...</span>
            </div>
            <p class="mt-3 text-muted">Поиск врачей...</p>
        </div>
    `;
    
    try {
        const response = await fetch('/doctors/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            },
            body: new URLSearchParams({
                query: searchTerm,
                specialty: specialty
            })
        });
        
        const data = await response.json();
        renderDoctorsList(data);
    } catch (error) {
        console.error('Ошибка при поиске врачей:', error);
        showError('Ошибка при загрузке данных. Пожалуйста, обновите страницу.');
    }
}

/**
 * Отрисовка списка врачей
 */
function renderDoctorsList(data) {
    const doctorsList = document.getElementById('doctors-list');
    
    if (data.count === 0) {
        doctorsList.innerHTML = `
            <div class="col-12">
                <div class="text-center py-5">
                    <i class="bi bi-people display-1 text-muted mb-3"></i>
                    <h4 class="mb-3">Врачи не найдены</h4>
                    <p class="text-muted">Попробуйте изменить условия поиска</p>
                </div>
            </div>`;
        return;
    }
    
    let html = '';
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = data.html;
    const doctorCards = tempDiv.querySelectorAll('.doctor-card');
    
    if (doctorCards.length === 0) {
        // Если нет карточек, отображаем HTML как есть
        html = data.html;
    } else {
        // Обертываем каждую карточку в колонку
        doctorCards.forEach((card, index) => {
            html += `
                <div class="col-md-6 col-lg-4 fade-in-up">
                    ${card.outerHTML}
                </div>`;
        });
    }
    
    doctorsList.innerHTML = html;
    applyDoctorColors();
    initDoctorsAnimations();
}

/**
 * Сброс фильтров
 */
function resetFilters() {
    const searchInput = document.getElementById('doctor-search');
    const specialtyFilter = document.getElementById('specialty-filter');
    
    if (searchInput) searchInput.value = '';
    if (specialtyFilter) specialtyFilter.value = '';
    
    filterDoctors();
}

/**
 * Применение цветов к карточкам врачей
 */
function applyDoctorColors() {
    const doctorCards = document.querySelectorAll('.doctor-card');
    
    doctorCards.forEach((card, index) => {
        const photoContainer = card.querySelector('.doctor-photo-container');
        if (photoContainer) {
            // Удаляем предыдущие классы
            photoContainer.classList.remove('bg-doctor-0', 'bg-doctor-1');
            // Добавляем класс на основе индекса (чередование)
            photoContainer.classList.add(`bg-doctor-${index % 2}`);
        }
    });
}

/**
 * Инициализация анимаций для карточек врачей
 */
function initDoctorsAnimations() {
    const fadeElements = document.querySelectorAll('#doctors-list .fade-in-up');
    
    fadeElements.forEach((el, idx) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        
        setTimeout(() => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, idx * 100);
    });
}

/**
 * Инициализация модального окна записи
 */
function initAppointmentModal() {
    const appointmentModal = document.getElementById('appointmentModal');
    if (!appointmentModal) return;
    
    const modal = new bootstrap.Modal(appointmentModal);
    const appointmentDoctorId = document.getElementById('appointmentDoctorId');
    const appointmentDoctorName = document.getElementById('doctorName');
    const specialtiesSelect = document.getElementById('specialtiesSelect');
    
    // Обработчик клика на кнопки записи
    document.addEventListener('click', function(e) {
        const appointmentBtn = e.target.closest('.btn-appointment');
        if (appointmentBtn) {
            e.preventDefault();
            
            const doctorId = appointmentBtn.getAttribute('data-doctor-id');
            const doctorName = appointmentBtn.getAttribute('data-doctor-name');
            
            if (doctorId && doctorName) {
                appointmentDoctorId.value = doctorId;
                appointmentDoctorName.value = doctorName;
                loadDoctorSpecialties(doctorId);
                modal.show();
            }
        }
    });
    
    // Загрузка специальностей врача
    async function loadDoctorSpecialties(doctorId) {
        try {
            const response = await fetch(`/doctors/${doctorId}/specialties`);
            const specialties = await response.json();
            
            specialtiesSelect.innerHTML = '<option value="">Выберите специальность</option>';
            specialties.forEach(specialty => {
                const option = document.createElement('option');
                option.value = specialty.id;
                option.textContent = specialty.name;
                specialtiesSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Ошибка загрузки специальностей:', error);
            loadAllSpecialties();
        }
    }
    
    // Загрузка всех специальностей (запасной вариант)
    async function loadAllSpecialties() {
        try {
            const response = await fetch('/specialties');
            const specialties = await response.json();
            
            specialtiesSelect.innerHTML = '<option value="">Выберите специальность</option>';
            specialties.forEach(specialty => {
                const option = document.createElement('option');
                option.value = specialty.id;
                option.textContent = specialty.name;
                specialtiesSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Ошибка загрузки всех специальностей:', error);
        }
    }
}

/**
 * Показ ошибки
 */
function showError(message) {
    const doctorsList = document.getElementById('doctors-list');
    if (doctorsList) {
        doctorsList.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger">
                    <i class="bi bi-exclamation-triangle me-2"></i>
                    ${message}
                </div>
            </div>`;
    }
}