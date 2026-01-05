// Мобильное меню
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('.nav');
    const body = document.body;
    
    if (mobileMenuBtn && nav) {
        mobileMenuBtn.addEventListener('click', function() {
            nav.classList.toggle('active');
            mobileMenuBtn.classList.toggle('active');
            body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
        });
        
        // Закрытие меню при клике на ссылку
        const navLinks = document.querySelectorAll('.nav__link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                if (window.innerWidth <= 768) {
                    nav.classList.remove('active');
                    mobileMenuBtn.classList.remove('active');
                    body.style.overflow = '';
                }
            });
        });
        
        // Закрытие меню при клике вне его
        document.addEventListener('click', function(event) {
            if (window.innerWidth <= 768 && 
                nav.classList.contains('active') &&
                !nav.contains(event.target) &&
                !mobileMenuBtn.contains(event.target)) {
                nav.classList.remove('active');
                mobileMenuBtn.classList.remove('active');
                body.style.overflow = '';
            }
        });
    }
    
    // Плавная прокрутка для якорных ссылок
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href !== '#' && href.startsWith('#')) {
                e.preventDefault();
                const targetElement = document.querySelector(href);
                
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 100,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
    
    // Динамическое обновление шапки при скролле
    let lastScroll = 0;
    const header = document.querySelector('.header');
    
    if (header) {
        window.addEventListener('scroll', function() {
            const currentScroll = window.pageYOffset;
            
            if (currentScroll <= 0) {
                header.classList.remove('scroll-up');
                return;
            }
            
            if (currentScroll > lastScroll && !header.classList.contains('scroll-down')) {
                header.classList.remove('scroll-up');
                header.classList.add('scroll-down');
            } else if (currentScroll < lastScroll && header.classList.contains('scroll-down')) {
                header.classList.remove('scroll-down');
                header.classList.add('scroll-up');
            }
            
            lastScroll = currentScroll;
        });
    }
    
    // Добавляем анимацию появления элементов при скролле
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);
    
    // Наблюдаем за карточками и другими элементами
    document.querySelectorAll('.doctor-card, .feature-card, .service-item, .doc-item').forEach(el => {
        observer.observe(el);
    });
    
    // Обработка формы контактов
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            
            submitBtn.textContent = 'Отправка...';
            submitBtn.disabled = true;
            
            const formData = new FormData(this);
            
            fetch('/contacts', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json'
                },
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert(data.message);
                    contactForm.reset();
                } else {
                    alert('Ошибка: ' + (data.errors ? data.errors.join(', ') : data.error));
                }
            })
            .catch(error => {
                console.error('Ошибка:', error);
                alert('Произошла ошибка при отправке формы');
            })
            .finally(() => {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            });
        });
    }
    
    // ============ ЗАПИСЬ НА ПРИЕМ ============
    const appointmentModal = document.getElementById('appointmentModal');
    const appointmentForm = document.getElementById('appointmentForm');
    const specialtiesSelect = document.getElementById('specialtiesSelect');
    const submitAppointmentBtn = document.getElementById('submitAppointment');
    const doctorNameInput = document.getElementById('doctorName');
    
    // Проверяем, что все элементы существуют
    if (appointmentModal && appointmentForm && specialtiesSelect && submitAppointmentBtn && doctorNameInput) {
        
        // Обработчик нажатия на кнопку "Запись" у врача
        document.addEventListener('click', function(e) {
            // Ищем ближайшую кнопку с классом btn-appointment
            const appointmentBtn = e.target.closest('.btn-appointment');
            
            if (appointmentBtn) {
                e.preventDefault();
                e.stopPropagation();
                
                const doctorId = appointmentBtn.dataset.doctorId;
                const doctorName = appointmentBtn.dataset.doctorName || 'Любой врач';
                
                console.log('Запись нажата:', { doctorId, doctorName });
                
                // Устанавливаем данные в форму
                document.getElementById('appointmentDoctorId').value = doctorId || '';
                doctorNameInput.value = doctorName;
                
                // Загружаем специальности врача
                if (doctorId) {
                    loadDoctorSpecialties(doctorId);
                } else {
                    loadAllSpecialties();
                }
                
                // Показываем модальное окно
                const modal = new bootstrap.Modal(appointmentModal);
                modal.show();
            }
        });
        
        // Загрузка специальностей конкретного врача
        function loadDoctorSpecialties(doctorId) {
            specialtiesSelect.innerHTML = '<option value="">Загрузка специальностей...</option>';
            specialtiesSelect.disabled = true;
            
            fetch(`/doctors/${doctorId}/specialties`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Ошибка загрузки');
                    }
                    return response.json();
                })
                .then(specialties => {
                    specialtiesSelect.innerHTML = '';
                    specialtiesSelect.disabled = false;
                    
                    specialties.forEach(specialty => {
                        const option = document.createElement('option');
                        option.value = specialty.id;
                        option.textContent = specialty.name;
                        specialtiesSelect.appendChild(option);
                    });
                    
                    if (specialties.length === 0) {
                        const option = document.createElement('option');
                        option.value = '';
                        option.textContent = 'У врача нет специальностей';
                        specialtiesSelect.appendChild(option);
                        specialtiesSelect.disabled = true;
                    }
                })
                .catch(error => {
                    console.error('Ошибка при загрузке специальностей:', error);
                    specialtiesSelect.innerHTML = '<option value="">Ошибка загрузки</option>';
                    specialtiesSelect.disabled = false;
                });
        }
        
        // Загрузка всех специальностей
        function loadAllSpecialties() {
            specialtiesSelect.innerHTML = '<option value="">Загрузка специальностей...</option>';
            specialtiesSelect.disabled = true;
            
            fetch('/specialties')
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Ошибка загрузки');
                    }
                    return response.json();
                })
                .then(specialties => {
                    specialtiesSelect.innerHTML = '';
                    specialtiesSelect.disabled = false;
                    
                    specialties.forEach(specialty => {
                        const option = document.createElement('option');
                        option.value = specialty.id;
                        option.textContent = specialty.name;
                        specialtiesSelect.appendChild(option);
                    });
                    
                    if (specialties.length === 0) {
                        const option = document.createElement('option');
                        option.value = '';
                        option.textContent = 'Специальности не найдены';
                        specialtiesSelect.appendChild(option);
                        specialtiesSelect.disabled = true;
                    }
                })
                .catch(error => {
                    console.error('Ошибка при загрузке специальностей:', error);
                    specialtiesSelect.innerHTML = '<option value="">Ошибка загрузки</option>';
                    specialtiesSelect.disabled = false;
                });
        }
        
        // Отправка формы записи
        submitAppointmentBtn.addEventListener('click', function() {
            // Проверяем согласие с политикой
            const privacyAccepted = document.getElementById('privacyAccepted');
            if (!privacyAccepted.checked) {
                alert('Необходимо принять условия политики конфиденциальности');
                privacyAccepted.focus();
                return;
            }
            
            // Проверяем выбранные специальности
            const selectedSpecialties = Array.from(specialtiesSelect.selectedOptions).map(option => option.value);
            if (selectedSpecialties.length === 0 || selectedSpecialties[0] === '') {
                alert('Пожалуйста, выберите хотя бы одну специальность');
                specialtiesSelect.focus();
                return;
            }
            
            // Проверяем обязательные поля
            const requiredFields = appointmentForm.querySelectorAll('[required]');
            let isValid = true;
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.classList.add('is-invalid');
                } else {
                    field.classList.remove('is-invalid');
                }
            });
            
            if (!isValid) {
                alert('Пожалуйста, заполните все обязательные поля');
                return;
            }
            
            // Собираем данные формы
            const formData = new FormData(appointmentForm);
            
            // Добавляем выбранные специальности
            selectedSpecialties.forEach(id => {
                formData.append('specialty_ids[]', id);
            });
            
            // Отправляем данные
            submitAppointmentBtn.disabled = true;
            submitAppointmentBtn.textContent = 'Отправка...';
            
            fetch('/appointments', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert(data.message);
                    // Закрываем модальное окно
                    bootstrap.Modal.getInstance(appointmentModal).hide();
                    // Очищаем форму
                    appointmentForm.reset();
                    specialtiesSelect.innerHTML = '';
                    doctorNameInput.value = '';
                } else {
                    alert('Ошибка: ' + (data.errors ? data.errors.join(', ') : data.error));
                }
            })
            .catch(error => {
                console.error('Ошибка:', error);
                alert('Произошла ошибка при отправке формы');
            })
            .finally(() => {
                submitAppointmentBtn.disabled = false;
                submitAppointmentBtn.textContent = 'Отправить запись';
            });
        });
    }
});

// Добавляем обработку клавиши Escape для закрытия меню
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        const nav = document.querySelector('.nav');
        
        if (nav && nav.classList.contains('active')) {
            nav.classList.remove('active');
            mobileMenuBtn.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
});