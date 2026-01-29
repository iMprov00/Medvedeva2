# app.rb
require 'dotenv/load'
require 'sinatra'
require 'sinatra/activerecord'
require 'sqlite3'
require 'sinatra/json'
require 'json'

# =============================================
# НАСТРОЙКИ ПРИЛОЖЕНИЯ
# =============================================

configure do
  # Общие настройки
  enable :sessions if development?
  
  # Настройки базы данных
  set :database_file, 'config/database.yml'
  
  # Пути к статическим файлам
  set :public_folder, File.dirname(__FILE__) + '/public'
  set :views, File.dirname(__FILE__) + '/views'
  
  # Настройки защиты
  set :protection, except: [:remote_token, :frame_options, :json_csrf]
end

configure :production do
  set :port, 4567
  set :bind, '0.0.0.0'
  set :environment, :production
end

configure :development do
  set :port, 4567
  set :bind, '0.0.0.0'
  set :environment, :development
  set :show_exceptions, true
end

# Загрузка моделей
Dir[File.join(__dir__, 'models', '*.rb')].each { |file| require file }

# =============================================
# ПОМОЩНИКИ (HELPERS)
# =============================================

helpers do
  # Форматирование денег в рубли
  def number_to_currency(number, options = {})
    defaults = { unit: '₽', format: '%n %u' }
    opts = defaults.merge(options)
    
    formatted_number = sprintf('%.2f', number.to_f)
    formatted_number = formatted_number.gsub('.', ',')
    formatted_number = formatted_number.gsub(/(\d)(?=(\d\d\d)+(?!\d))/, "\\1 ")
    
    opts[:format].gsub('%n', formatted_number).gsub('%u', opts[:unit])
  end
  
  # Склонение русских слов
  def russian_plural(number, one, few, many)
    abs_number = number.to_i.abs
    mod10 = abs_number % 10
    mod100 = abs_number % 100
    
    if mod100.between?(11, 14)
      return many
    elsif mod10 == 1
      return one
    elsif mod10.between?(2, 4)
      return few
    else
      return many
    end

  end
  
  # Проверка, является ли запрос админским
  def admin_request?
    request.path.start_with?('/admin')
  end
  
  # Определение лейаута в зависимости от пути
  def layout_for_request
    @layout || :layout
  end



 # Проверка валидности URL
  def valid_url?(url)
    uri = URI.parse(url)
    uri.is_a?(URI::HTTP) || uri.is_a?(URI::HTTPS)
  rescue URI::InvalidURIError
    false
  end
  
  # Отображение иконки для типа ссылки
  def booking_link_icon(url)
    if url.include?('workplace') || url.include?('yclients')
      'bi bi-briefcase'
    elsif url.include?('google.') || url.include?('calendar')
      'bi bi-google'
    else
      'bi bi-link-45deg'
    end
  end
  
  # Отображение названия сервиса
  def booking_service_name(url)
    if url.include?('workplace') 
      'WorkPlace'
    elsif url.include?('yclients')
      'YCLIENTS'
    elsif url.include?('google.')
      'Google Calendar'
    else
      'Онлайн запись'
    end
  end

  

  # Методы для работы с content_for (добавьте после других helpers)
  def content_for(key, content = nil, &block)
    @content_for ||= {}
    if block_given?
      @content_for[key] = capture(&block)
    else
      @content_for[key] = content
    end
    nil
  end
  
  def yield_content(key)
    @content_for[key] if @content_for && @content_for[key]
  end
  
  def content_for?(key)
    @content_for && @content_for.key?(key)
  end
  
  def capture(&block)
    old_buffer = @_out_buf
    @_out_buf = ""
    yield
    result = @_out_buf
    @_out_buf = old_buffer
    result
  end

  # Определение title страницы
  def page_title
    @page_title || default_title
  end
  
  def default_title
    "Клиника доказательной медицины доктора Медведевой в Барнауле"
  end
  
  # Установка title
  def set_title(title)
    @page_title = title
  end
  
  # Метод для формирования полного title (с суффиксом)
  def full_page_title
    if @page_title && @page_title != default_title
      "#{@page_title} | Клиника доктора Медведевой в Барнауле"
    else
      default_title
    end
  end
  
  # Метод для SEO описания
  def page_description
    @page_description || default_description
  end
  
  def default_description
    "Клиника доказательной медицины доктора Медведевой в Барнауле. Современный подход к лечению детей от 0 до 18 лет, основанный на международных протоколах и научных данных."
  end
  
  def set_description(description)
    @page_description = description
  end
  
  # Метод для канонических URL
  def canonical_url
    @canonical_url || request.url
  end
  
  def set_canonical_url(url)
    @canonical_url = url
  end


end

# =============================================
# МАРШРУТЫ ГЛАВНОГО САЙТА
# =============================================

# Главная страница
get '/' do

  set_title("Клиника доказательной медицины доктора Медведевой - Главная")
  set_description("Клиника доказательной медицины в Барнауле. Лечение детей от 0 до 18 лет по международным протоколам. Запись на прием онлайн.")

  erb :'pages/index'
end

# О клинике
get '/about' do


  set_title("О клинике доктора Медведевой")
  set_description("Первая клиника доказательной медицины в Барнауле. Современное оборудование, опытные врачи, индивидуальный подход к каждому пациенту.")

  gallery_path = File.join(settings.public_folder, 'images', 'about')
  
  if Dir.exist?(gallery_path)
    @gallery_images = Dir.children(gallery_path)
                         .select { |f| f.downcase.end_with?('.jpg', '.jpeg', '.png', '.gif', '.webp') }
                         .sort
  else
    @gallery_images = []
  end
  
  erb :'pages/about'
end

# Контакты
get '/contacts' do

  set_title("Контакты клиники доктора Медведевой")
  set_description("Адрес, телефоны, схема проезда и часы работы клиники доктора Медведевой в Барнауле. Запись на прием по телефону +7 (913) 365-04-64")
  set_canonical_url("https://medvedeva-clinic.ru/contacts")

  erb :'pages/contacts'
end

# Врачи
get '/doctors' do


  set_title("Врачи клиники доктора Медведевой")
  set_description("Наши врачи - специалисты по доказательной медицине для детей от 0 до 18 лет. Высокая квалификация, опыт работы, отзывы пациентов.")
  set_canonical_url("https://medvedeva-clinic.ru/doctors")

  @doctors = Doctor.all.order(:last_name, :first_name)
  @specialties = Doctor.unique_specialties
  erb :'dynamic/doctors'
end

# Услуги и цены
get '/prices' do

  set_title("Услуги и цены клиники доктора Медведевой")
  set_description("Прайс-лист на медицинские услуги для детей. Педиатрия, консультации специалистов, диагностика. Прозрачные цены, без скрытых платежей.")
  set_canonical_url("https://medvedeva-clinic.ru/prices")

  @service_categories = ServiceCategory.includes(:services).order(:position).all
  erb :'pages/prices'
end

# Документы
get '/docs' do

  set_title("Документы и лицензии клиники доктора Медведевой")
  set_description("Официальные документы, лицензии, свидетельства клиники доказательной медицины доктора Медведевой в Барнауле.")

  erb :'pages/docs'
end

# Политика конфиденциальности
get '/privacy' do

  set_title("Политика конфиденциальности")
  set_description("Политика обработки персональных данных в клинике доктора Медведевой.")

  erb :'pages/privacy'
end

# =============================================
# API ЭНДПОИНТЫ ДЛЯ АЯКС-ЗАПРОСОВ
# =============================================

# Поиск врачей
post '/doctors/search' do
  content_type :json
  
  query = params[:query] || ''
  specialty = params[:specialty] || ''
  
  @doctors = Doctor.search(query, specialty)
  
  html = if @doctors.empty?
    '<div class="empty-state"><p>Врачи не найдены. Попробуйте изменить условия поиска.</p></div>'
  else
    @doctors.map { |doctor| 
      erb :'dynamic/_doctor_card', locals: { doctor: doctor }, layout: false 
    }.join('')
  end
  
  { html: html, count: @doctors.count }.to_json
end

# Поиск услуг
post '/services/search' do
  content_type :json
  
  query = params[:query] || ''
  category_id = params[:category_id] || ''
  
  services = Service.search(query, category_id.presence)
  grouped_services = services.group_by(&:service_category)
  
  html = if grouped_services.empty?
    '<div class="empty-state"><p>Услуги не найдены. Попробуйте изменить условия поиска.</p></div>'
  else
    grouped_services.map { |category, category_services|
      erb :'dynamic/_service_category', 
          locals: { category: category, services: category_services }, 
          layout: false
    }.join('')
  end
  
  { html: html, count: services.count }.to_json
end

# Получение всех специальностей
get '/specialties' do
  content_type :json
  Specialty.all.to_json(only: [:id, :name])
end

# Получение специальностей врача
get '/doctors/:id/specialties' do
  content_type :json
  doctor = Doctor.find(params[:id])
  doctor.specialties.to_json(only: [:id, :name])
end

# Получение одобренных отзывов
get '/reviews' do
  content_type :json
  Review.approved.recent.to_json(
    only: [:id, :author_name, :content, :rating, :created_at],
    methods: [:star_rating, :formatted_date]
  )
end

# =============================================
# ФОРМЫ ОБРАТНОЙ СВЯЗИ
# =============================================

# Обработка формы контактов
post '/contacts' do
  content_type :json
  
  begin
    message = Message.create(
      name: params[:name],
      phone: params[:phone],
      email: params[:email],
      subject: params[:subject],
      message: params[:message]
    )
    
    if message.persisted?
      { success: true, message: 'Сообщение успешно отправлено!' }.to_json
    else
      { success: false, errors: message.errors.full_messages }.to_json
    end
  rescue => e
    { success: false, error: 'Произошла ошибка при отправке сообщения' }.to_json
  end
end

# Создание записи на прием
post '/appointments' do
  content_type :json
  
  begin
    appointment = Appointment.new(
      patient_name: params[:patient_name],
      birth_date: params[:birth_date],
      phone: params[:phone],
      email: params[:email],
      doctor_id: params[:doctor_id].presence,
      specialty_id: params[:specialty_id],
      message: params[:message],
      privacy_accepted: params[:privacy_accepted] == '1'
    )

    if appointment.save
      { success: true, message: 'Запись успешно отправлена! Мы свяжемся с вами в ближайшее время.' }.to_json
    else
      { success: false, errors: appointment.errors.full_messages }.to_json
    end
  rescue => e
    puts "Ошибка при создании записи: #{e.message}"
    { success: false, error: 'Произошла ошибка при отправке записи' }.to_json
  end
end

# Создание отзыва
post '/reviews' do
  content_type :json
  
  begin
    # Определяем параметры в зависимости от типа запроса
    if request.content_type && request.content_type.include?('application/json')
      json_params = JSON.parse(request.body.read.force_encoding('UTF-8'))
      author_name = json_params['author_name'].to_s.force_encoding('UTF-8')
      content = json_params['content'].to_s.force_encoding('UTF-8')
      rating = json_params['rating'].to_i
    else
      author_name = params[:author_name].to_s.force_encoding('UTF-8')
      content = params[:content].to_s.force_encoding('UTF-8')
      rating = params[:rating].to_i
    end
    
    # Валидация
    if author_name.nil? || author_name.strip.empty?
      return { success: false, errors: ["Имя не может быть пустым"] }.to_json
    end
    
    if content.nil? || content.strip.empty?
      return { success: false, errors: ["Текст отзыва не может быть пустым"] }.to_json
    end
    
    if rating < 1 || rating > 5
      return { success: false, errors: ["Оценка должна быть от 1 до 5"] }.to_json
    end
    
    review = Review.new(
      author_name: author_name.strip,
      content: content.strip,
      rating: rating
    )

    if review.save
      { 
        success: true, 
        message: 'Спасибо за ваш отзыв! Он будет опубликован после проверки администратором.' 
      }.to_json
    else
      { 
        success: false, 
        errors: review.errors.full_messages 
      }.to_json
    end
    
  rescue => e
    puts "Ошибка сохранения отзыва: #{e.message}"
    { 
      success: false, 
      error: 'Internal server error' 
    }.to_json
  end
end

# =============================================
# СКАЧИВАНИЕ ФАЙЛОВ
# =============================================

# Скачивание лицензии
get '/download/license' do
  file_path = File.join(settings.public_folder, 'images', 'docs', 'lic.pdf')
  
  if File.exist?(file_path)
    send_file file_path, 
              filename: 'Лицензия_клиники_Медведевой.pdf',
              type: 'application/pdf',
              disposition: 'attachment'
  else
    status 404
    "Файл лицензии не найден"
  end
end

# Скачивание свидетельства
get '/download/registration' do
  file_path = File.join(settings.public_folder, 'images', 'docs', 'reg.webp')
  
  if File.exist?(file_path)
    send_file file_path, 
              filename: 'Свидетельство_клиники_Медведевой.webp',
              type: 'image/webp',
              disposition: 'attachment'
  else
    status 404
    "Файл свидетельства не найден"
  end
end

# =============================================
# СЛУЖЕБНЫЕ МАРШРУТЫ
# =============================================

# Тестовый маршрут
get '/test' do
  'Клиника доказательной медицины доктора Медведевой. Приложение работает!'
end

# =============================================
# АДМИНСКАЯ ПАНЕЛЬ
# =============================================

# Аутентификация для админки
before '/admin*' do
  # Аутентификация через переменные окружения
  auth = Rack::Auth::Basic::Request.new(request.env)
  
  # Читаем из .env файла
  admin_username = ENV['ADMIN_USERNAME'] || 'admin'        # если нет в .env, будет 'admin'
  admin_password = ENV['ADMIN_PASSWORD'] || '123'         # если нет в .env, будет '123'
  
  unless auth.provided? && auth.basic? && auth.credentials && 
         auth.credentials == [admin_username, admin_password]
    response['WWW-Authenticate'] = 'Basic realm="Админка"'
    halt 401, "Требуется авторизация\n"
  end
  
  # Устанавливаем переменные для лейаута
  @admin_layout = true
  @layout = :'admin/layout'
end

set :layout, :layout



# API для получения количества новых уведомлений (должен быть ДО других маршрутов)
get '/admin/notifications/count' do
  content_type :json
  
  unread_messages = Message.where(status: 'new').count
  new_appointments = Appointment.where(status: 'new').count
  unread_count = unread_messages + new_appointments
  
  {
    unread_messages: unread_messages,
    new_appointments: new_appointments,
    total: unread_count,
    updated_at: Time.now.to_i
  }.to_json
end

# -------------------------------------------------
# ГЛАВНАЯ СТРАНИЦА АДМИНКИ
# -------------------------------------------------

get '/admin' do
  redirect '/admin/messages'
end

get '/admin/logout' do
  response['WWW-Authenticate'] = 'Basic realm="Админка"'
  halt 401, "Вы вышли из админки. Обновите страницу для повторного входа.\n"
end

# -------------------------------------------------
# УПРАВЛЕНИЕ СООБЩЕНИЯМИ И ЗАПИСЯМИ
# -------------------------------------------------

get '/admin/messages' do
  @title = "Сообщения и записи"
  @messages = Message.all
  @appointments = Appointment.all
  @breadcrumbs = [{ title: "Сообщения и записи" }]
  
  erb :'admin/messages', layout: :'admin/layout'
end

# Действия с сообщениями
post '/admin/messages/:id/mark-read' do
  message = Message.find(params[:id])
  message.update(status: 'read')
  redirect '/admin/messages'
end

post '/admin/messages/:id/mark-replied' do
  message = Message.find(params[:id])
  message.update(status: 'replied')
  redirect '/admin/messages'
end

post '/admin/messages/:id/delete' do
  Message.find(params[:id]).destroy
  redirect '/admin/messages'
end

# Действия с записями
post '/admin/appointments/:id/confirm' do
  appointment = Appointment.find(params[:id])
  appointment.update(status: 'confirmed')
  redirect '/admin/messages'
end

post '/admin/appointments/:id/cancel' do
  appointment = Appointment.find(params[:id])
  appointment.update(status: 'cancelled')
  redirect '/admin/messages'
end

post '/admin/appointments/:id/delete' do
  Appointment.find(params[:id]).destroy
  redirect '/admin/messages'
end

# -------------------------------------------------
# УПРАВЛЕНИЕ ВРАЧАМИ
# -------------------------------------------------

get '/admin/doctors' do
  @title = "Управление врачами"
  @doctors = Doctor.all.order(:last_name, :first_name)
  @breadcrumbs = [{ title: "Врачи" }]
  
  erb :'admin/doctors', layout: :'admin/layout'
end

# Получение данных врача для редактирования (JSON)
get '/admin/doctors/:id/edit' do
  content_type :json
  doctor = Doctor.find(params[:id])
  
  puts "=" * 80
  puts "ЗАПРОС ДАННЫХ ВРАЧА ДЛЯ РЕДАКТИРОВАНИЯ"
  puts "ID врача: #{params[:id]}"
  puts "Имя врача: #{doctor.full_name}"
  puts "Ссылка для записи в БД: '#{doctor.booking_link}'"
  puts "=" * 80
  
  doctor.to_json(
    only: [:id, :last_name, :first_name, :middle_name, :experience_years, :bio, :photo_path, :booking_link],
    include: { specialties: { only: [:id, :name] } }
  )
end

# Получение списка специальностей для выбора
get '/admin/specialties/list' do
  content_type :json
  Specialty.all.to_json(only: [:id, :name])
end

# Обновленный обработчик добавления врача
post '/admin/doctors' do
  begin
    puts "=" * 80
    puts "ДОБАВЛЕНИЕ ВРАЧА - НАЧАЛО"
    puts "Полученные параметры: #{params.inspect}"
    puts "Параметры врача: #{params[:doctor].inspect}"
    
    doctor = Doctor.new(
      last_name: params[:doctor][:last_name],
      first_name: params[:doctor][:first_name],
      middle_name: params[:doctor][:middle_name],
      experience_years: params[:doctor][:experience_years],
      bio: params[:doctor][:bio],
      booking_link: params[:doctor][:booking_link],  # Добавляем ссылку
      photo_path: params[:doctor][:photo_path]
    )
    
    puts "Данные врача перед сохранением:"
    puts "  Имя: #{doctor.first_name} #{doctor.last_name}"
    puts "  Ссылка для записи: '#{doctor.booking_link}'"
    puts "  Длина ссылки: #{doctor.booking_link.to_s.length}"
    
    # Добавляем специальности
    if params[:doctor][:specialty_ids]
      puts "  Специальности: #{params[:doctor][:specialty_ids]}"
      params[:doctor][:specialty_ids].each do |specialty_id|
        specialty = Specialty.find(specialty_id)
        doctor.specialties << specialty
      end
    end
    
    if doctor.save
      puts "  ✅ Врач успешно сохранен! ID: #{doctor.id}"
      puts "  Сохраненная ссылка: '#{doctor.reload.booking_link}'"
      
      # Обработка загрузки фотографии
      if params[:photo] && params[:photo][:tempfile]
        puts "  📸 Обработка загрузки фото..."
        photo = params[:photo]
        photo_path = params[:doctor][:photo_path] || "/images/doctors/doctor_#{doctor.id}.jpg"
        
        FileUtils.mkdir_p('public/images/doctors')
        
        File.open("public#{photo_path}", 'wb') do |f|
          f.write(photo[:tempfile].read)
        end
        
        doctor.update(photo_path: photo_path)
      end
      
      puts "ДОБАВЛЕНИЕ ВРАЧА - УСПЕШНО"
      puts "=" * 80
      redirect '/admin/doctors'
    else
      puts "  ❌ Ошибки при сохранении врача: #{doctor.errors.full_messages}"
      puts "ДОБАВЛЕНИЕ ВРАЧА - ОШИБКА"
      puts "=" * 80
      redirect '/admin/doctors'
    end
    
  rescue => e
    puts "  ❌ Исключение при добавлении врача: #{e.message}"
    puts "  Backtrace: #{e.backtrace.first(5).join("\n")}"
    puts "=" * 80
    redirect '/admin/doctors'
  end
end

# Обновленный обработчик обновления врача
post '/admin/doctors/:id/update' do
  begin
    puts "=" * 80
    puts "ОБНОВЛЕНИЕ ВРАЧА - НАЧАЛО"
    puts "ID врача: #{params[:id]}"
    puts "Полученные параметры: #{params.inspect}"
    puts "Параметры врача: #{params[:doctor].inspect}"
    
    doctor = Doctor.find(params[:id])
    
    puts "Текущие данные врача:"
    puts "  Имя: #{doctor.full_name}"
    puts "  Текущая ссылка: '#{doctor.booking_link}'"
    puts "  Новая ссылка из формы: '#{params[:doctor][:booking_link]}'"
    
    # Обновляем основные данные
    update_data = {
      last_name: params[:doctor][:last_name],
      first_name: params[:doctor][:first_name],
      middle_name: params[:doctor][:middle_name],
      experience_years: params[:doctor][:experience_years],
      bio: params[:doctor][:bio],
      booking_link: params[:doctor][:booking_link]  # Добавляем обновление ссылки
    }
    
    puts "Данные для обновления: #{update_data.inspect}"
    
    if doctor.update(update_data)
      puts "  ✅ Основные данные обновлены"
      puts "  Ссылка после обновления: '#{doctor.reload.booking_link}'"
    else
      puts "  ❌ Ошибки при обновлении: #{doctor.errors.full_messages}"
    end
    
    # Обновляем специальности
    if params[:doctor][:specialty_ids]
      puts "  Обновление специальностей..."
      doctor.specialties = Specialty.where(id: params[:doctor][:specialty_ids])
      puts "  Специальности обновлены: #{doctor.specialties.map(&:name)}"
    else
      doctor.specialties = []
    end
    
    # Обработка новой фотографии
    if params[:photo] && params[:photo][:tempfile]
      puts "  📸 Обработка новой фотографии..."
      photo = params[:photo]
      photo_path = params[:doctor][:photo_path] || "/images/doctors/doctor_#{doctor.id}_#{Time.now.to_i}.png"
      
      FileUtils.mkdir_p('public/images/doctors')
      
      File.open("public#{photo_path}", 'wb') do |f|
        f.write(photo[:tempfile].read)
      end
      
      doctor.photo_path = photo_path
    elsif params[:doctor][:photo_path] && params[:doctor][:photo_path].present?
      doctor.photo_path = params[:doctor][:photo_path]
    end
    
    doctor.save!
    puts "  ✅ Врач полностью обновлен!"
    puts "  Финальная ссылка: '#{doctor.booking_link}'"
    puts "ОБНОВЛЕНИЕ ВРАЧА - УСПЕШНО"
    puts "=" * 80
    
    redirect '/admin/doctors'
    
  rescue => e
    puts "  ❌ Исключение при обновлении врача: #{e.message}"
    puts "  Backtrace: #{e.backtrace.first(5).join("\n")}"
    puts "=" * 80
    redirect '/admin/doctors'
  end
end

# Удаление врача
post '/admin/doctors/:id/delete' do
  Doctor.find(params[:id]).destroy
  redirect '/admin/doctors'
end

# -------------------------------------------------
# УПРАВЛЕНИЕ УСЛУГАМИ И ЦЕНАМИ
# -------------------------------------------------

get '/admin/prices' do
  @title = "Управление услугами и ценами"
  @service_categories = ServiceCategory.includes(:services).all
  @breadcrumbs = [{ title: "Услуги и цены" }]
  
  erb :'admin/prices', layout: :'admin/layout'
end

# Добавление категории услуг
post '/admin/categories' do
  begin
    puts "Создание категории с параметрами: #{params[:category].inspect}"
    
    # Обрабатываем позицию
    category_params = params[:category].dup
    if category_params[:position].present?
      category_params[:position] = category_params[:position].to_i
    end
    
    # Если позиция 0, установим nil чтобы вызвать before_validation callback
    if category_params[:position].to_i.zero?
      category_params[:position] = nil
    end
    
    category = ServiceCategory.new(category_params)
    
    if category.save
      puts "Категория создана: #{category.inspect}"
      redirect '/admin/prices'
    else
      puts "Ошибки при создании категории: #{category.errors.full_messages}"
      redirect '/admin/prices'
    end
  rescue => e
    puts "Ошибка при создании категории: #{e.message}"
    redirect '/admin/prices'
  end
end

# Обновление категории
patch '/admin/categories/:id' do
  begin
    puts "Обновление категории #{params[:id]} с параметрами: #{params[:category].inspect}"
    
    category = ServiceCategory.find(params[:id])
    
    # Обрабатываем позицию
    category_params = params[:category].dup
    if category_params[:position].present?
      category_params[:position] = category_params[:position].to_i
    end
    
    if category.update(category_params)
      puts "Категория обновлена: #{category.inspect}"
      redirect '/admin/prices'
    else
      puts "Ошибки при обновлении категории: #{category.errors.full_messages}"
      redirect '/admin/prices'
    end
  rescue => e
    puts "Ошибка при обновлении категории: #{e.message}"
    redirect '/admin/prices'
  end
end

# Удаление категории
post '/admin/categories/:id/delete' do
  ServiceCategory.find(params[:id]).destroy
  redirect '/admin/prices'
end

# Получение данных услуги для редактирования (JSON)
get '/admin/services/:id/edit' do
  content_type :json
  service = Service.find(params[:id])
  service.to_json(
    only: [:id, :name, :description, :price, :duration_minutes, :service_code, :service_category_id, :active]
  )
end

# Добавление услуги
post '/admin/services' do
  Service.create(params[:service])
  redirect '/admin/prices'
end

# Обновление услуги
patch '/admin/services/:id' do
  service = Service.find(params[:id])
  service.update(params[:service])
  redirect '/admin/prices'
end

# Удаление услуги
post '/admin/services/:id/delete' do
  Service.find(params[:id]).destroy
  redirect '/admin/prices'
end

# -------------------------------------------------
# УПРАВЛЕНИЕ СПЕЦИАЛЬНОСТЯМИ
# -------------------------------------------------

get '/admin/specialties' do
  @title = "Управление специальностями"
  @specialties = Specialty.all
  @breadcrumbs = [{ title: "Специальности" }]
  
  erb :'admin/specialties', layout: :'admin/layout'
end

# Добавление специальности
post '/admin/specialties' do
  Specialty.create(name: params[:name])
  redirect '/admin/specialties'
end

# Удаление специальности
post '/admin/specialties/:id/delete' do
  specialty = Specialty.find(params[:id])
  
  # Проверяем, используется ли специальность врачами
  if specialty.doctors.empty?
    specialty.destroy
  else
    # Можно добавить flash сообщение об ошибке
  end
  
  redirect '/admin/specialties'
end

# -------------------------------------------------
# УПРАВЛЕНИЕ ОТЗЫВАМИ
# -------------------------------------------------

get '/admin/reviews' do
  @title = "Управление отзывами"
  @reviews = Review.order(created_at: :desc)
  @breadcrumbs = [{ title: "Отзывы" }]
  
  erb :'admin/reviews', layout: :'admin/layout'
end

# Одобрить отзыв
post '/admin/reviews/:id/approve' do
  review = Review.find(params[:id])
  review.update(approved: true)
  redirect '/admin/reviews'
end

# Сделать отзыв рекомендованным
post '/admin/reviews/:id/feature' do
  review = Review.find(params[:id])
  review.update(featured: true)
  redirect '/admin/reviews'
end

# Убрать из рекомендованных
post '/admin/reviews/:id/unfeature' do
  review = Review.find(params[:id])
  review.update(featured: false)
  redirect '/admin/reviews'
end

# Отказать в публикации
post '/admin/reviews/:id/reject' do
  review = Review.find(params[:id])
  review.update(approved: false)
  redirect '/admin/reviews'
end

# Удалить отзыв
post '/admin/reviews/:id/delete' do
  Review.find(params[:id]).destroy
  redirect '/admin/reviews'
end

# =============================================
# ОБРАБОТЧИК ОШИБОК
# =============================================

# =============================================
# ОБРАБОТЧИКИ ОШИБОК
# =============================================

not_found do
  @title = "Страница не найдена"
  status 404
  erb :'errors/404'
end

error 500 do
  @title = "Ошибка сервера"
  @error_message = env['sinatra.error'].message if settings.development?
  @error_backtrace = env['sinatra.error'].backtrace if settings.development?
  status 500
  erb :'errors/500'
end

# Обработка других ошибок
error do
  @title = "Произошла ошибка"
  @error_message = env['sinatra.error'].message if settings.development?
  @error_backtrace = env['sinatra.error'].backtrace if settings.development?
  status 500
  erb :'errors/500'
end

# Обработка ошибок ActiveRecord
error ActiveRecord::RecordNotFound do
  if admin_request?
    redirect '/admin'
  else
    redirect '/'
  end
end

# Генерация sitemap.xml для поисковиков
get '/sitemap.xml' do
  content_type 'application/xml'
  
  @base_url = "https://medvedeva-clinic.ru"
  @pages = [
    { url: "/", changefreq: "daily", priority: "1.0" },
    { url: "/about", changefreq: "weekly", priority: "0.8" },
    { url: "/doctors", changefreq: "weekly", priority: "0.9" },
    { url: "/prices", changefreq: "monthly", priority: "0.7" },
    { url: "/contacts", changefreq: "monthly", priority: "0.8" },
    { url: "/docs", changefreq: "monthly", priority: "0.5" },
    { url: "/privacy", changefreq: "yearly", priority: "0.3" }
  ]
  
  # Добавляем динамические страницы врачей
  @doctors = Doctor.all
  @doctors.each do |doctor|
    page_data = {
      url: "/doctors/#{doctor.id}",
      changefreq: "monthly",
      priority: "0.6"
    }
    page_data[:lastmod] = doctor.updated_at.strftime("%Y-%m-%d") if doctor.updated_at
    @pages << page_data
  end
  
  erb :'seo/sitemap', layout: false
end