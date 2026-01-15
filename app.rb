# app.rb
require 'sinatra'
require 'sinatra/activerecord'
require 'sqlite3'
require 'sinatra/json'
require 'json'


configure :production do
  set :port, 4567
  set :bind, '0.0.0.0'
  # ВАЖНО: Добавляем эту строку для разрешения запросов от Nginx
  set :protection, :except => [:remote_token, :frame_options, :json_csrf]
end

configure :development do
  set :port, 4567
  set :bind, '0.0.0.0'
  # Можно добавить и сюда для тестов
  set :protection, :except => [:remote_token, :frame_options, :json_csrf]
end

# Загружаем модели
Dir[File.join(__dir__, 'models', '*.rb')].each { |file| require file }

set :database_file, 'config/database.yml'
# Включаем поддержку статических файлов
set :public_folder, File.dirname(__FILE__) + '/public'

# Включаем поддержку шаблонов
set :views, File.dirname(__FILE__) + '/views'

# Хелпер для форматирования денег
helpers do
  def number_to_currency(number, options = {})
    defaults = { unit: '₽', format: '%n %u' }
    opts = defaults.merge(options)
    
    formatted_number = sprintf('%.2f', number.to_f)
    formatted_number = formatted_number.gsub('.', ',')
    formatted_number = formatted_number.gsub(/(\d)(?=(\d\d\d)+(?!\d))/, "\\1 ")
    
    opts[:format].gsub('%n', formatted_number).gsub('%u', opts[:unit])
  end
end

# Главная страница
get '/' do
  erb :'pages/index'
end

# О клинике
# Маршрут для страницы "О клинике"
get '/about' do
  # Путь к папке с фотографиями (относительно public)
  gallery_path = File.join(settings.public_folder, 'images', 'about')
  
  # Получаем список файлов, проверяем существование папки
  if Dir.exist?(gallery_path)
    # Фильтруем только изображения (jpg, jpeg, png, gif, webp)
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
  erb :'pages/contacts'
end

get '/doctors' do
  @doctors = Doctor.all.order(:last_name, :first_name)
  @specialties = Doctor.unique_specialties
  erb :'dynamic/doctors'
end

get '/prices' do
  @service_categories = ServiceCategory.includes(:services).order(:position).all
  erb :'pages/prices'
end

# AJAX поиск врачей
post '/doctors/search' do
  content_type :json
  
  query = params[:query] || ''
  specialty = params[:specialty] || ''
  
  @doctors = Doctor.search(query, specialty)
  
  # Генерируем HTML для списка врачей, обернутый в колонки
  html = if @doctors.empty?
    '<div class="empty-state"><p>Врачи не найдены. Попробуйте изменить условия поиска.</p></div>'
  else
    @doctors.map { |doctor| 
      erb :'dynamic/_doctor_card', locals: { doctor: doctor }, layout: false 
    }.join('')
  end
  
  { html: html, count: @doctors.count }.to_json
end

# AJAX поиск услуг
post '/services/search' do
  content_type :json
  
  query = params[:query] || ''
  category_id = params[:category_id] || ''
  
  services = Service.search(query, category_id.presence)
  grouped_services = services.group_by(&:service_category)
  
  # Генерируем HTML для списка услуг
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

# Обработка формы обратной связи
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

get '/docs' do
  erb :'pages/docs'
end

get '/privacy' do
  erb :'pages/privacy'
end

# Базовый маршрут для проверки
get '/test' do
  'Клиника доказательной медицины доктора Медведевой. Приложение работает!'
end

# ==================== АДМИНСКИЕ МАРШРУТЫ ====================

# Простая аутентификация для админки
before '/admin*' do
  auth = Rack::Auth::Basic::Request.new(request.env)
  
  unless auth.provided? && auth.basic? && auth.credentials && auth.credentials == ['admin', '123']
    response['WWW-Authenticate'] = 'Basic realm="Админка"'
    halt 401, "Требуется авторизация\n"
  end
end

get '/admin/logout' do
  response['WWW-Authenticate'] = 'Basic realm="Админка"'
  halt 401, "Вы вышли из админки. Обновите страницу для повторного входа.\n"
end

# Админская панель
get '/admin' do
  redirect '/admin/messages'
end

# Управление сообщениями
get '/admin/messages' do
  @messages = Message.all
  @appointments = Appointment.all
  erb :'admin/messages', layout: false
end
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
# Управление врачами
get '/admin/doctors' do
  @doctors = Doctor.all.order(:last_name, :first_name)
  erb :'admin/doctors', layout: false
end

# Добавление врача
# Добавление врача
# Добавление врача
post '/admin/doctors' do
  begin
    puts "DEBUG: Начало добавления врача"
    puts "DEBUG: Параметры: #{params.inspect}"
    
    # Создаем врача
    doctor = Doctor.new(
      last_name: params[:doctor][:last_name],
      first_name: params[:doctor][:first_name],
      middle_name: params[:doctor][:middle_name],
      experience_years: params[:doctor][:experience_years],
      bio: params[:doctor][:bio],
      photo_path: params[:doctor][:photo_path]
    )
    
    puts "DEBUG: Врач создан, но не сохранен: #{doctor.inspect}"
    
    # Добавляем специальности
    if params[:doctor][:specialty_ids]
      puts "DEBUG: Выбранные специальности: #{params[:doctor][:specialty_ids]}"
      params[:doctor][:specialty_ids].each do |specialty_id|
        specialty = Specialty.find(specialty_id)
        doctor.specialties << specialty
      end
    end
    
    # Сохраняем врача
    if doctor.save
      puts "DEBUG: Врач сохранен успешно, ID: #{doctor.id}"
      
      # Обработка загрузки фотографии
      if params[:photo] && params[:photo][:tempfile]
        photo = params[:photo]
        photo_path = params[:doctor][:photo_path] || "/images/doctors/doctor_#{doctor.id}.jpg"
        
        puts "DEBUG: Загрузка фото в: #{photo_path}"
        
        # Создаем директорию если её нет
        FileUtils.mkdir_p('public/images/doctors')
        
        # Сохраняем файл
        File.open("public#{photo_path}", 'wb') do |f|
          f.write(photo[:tempfile].read)
        end
        
        # Обновляем путь к фото
        doctor.update(photo_path: photo_path)
        puts "DEBUG: Фото сохранено"
      end
      
      redirect '/admin/doctors'
    else
      puts "DEBUG: Ошибка при сохранении врача: #{doctor.errors.full_messages}"
      redirect '/admin/doctors'
    end
    
  rescue => e
    puts "DEBUG: Исключение при добавлении врача: #{e.message}"
    puts "DEBUG: Backtrace: #{e.backtrace.first(10)}"
    redirect '/admin/doctors'
  end
end

# Удаление врача
post '/admin/doctors/:id/delete' do
  Doctor.find(params[:id]).destroy
  redirect '/admin/doctors'
end

# Управление услугами
get '/admin/prices' do
  @service_categories = ServiceCategory.includes(:services).all
  erb :'admin/prices', layout: false
end

# Добавление категории услуг
post '/admin/categories' do
  ServiceCategory.create(params[:category])
  redirect '/admin/prices'
end

# Добавление услуги
post '/admin/services' do
  Service.create(params[:service])
  redirect '/admin/prices'
end

# Удаление услуги
post '/admin/services/:id/delete' do
  Service.find(params[:id]).destroy
  redirect '/admin/prices'
end

# Удаление категории
post '/admin/categories/:id/delete' do
  ServiceCategory.find(params[:id]).destroy
  redirect '/admin/prices'
end

# Отметить сообщение как прочитанное
post '/admin/messages/:id/read' do
  message = Message.find(params[:id])
  message.update(read: true)
  redirect '/admin/messages'
end

# Удаление сообщения
post '/admin/messages/:id/delete' do
  Message.find(params[:id]).destroy
  redirect '/admin/messages'
end

get '/admin/specialties' do
  @specialties = Specialty.all
  erb :'admin/specialties', layout: false
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


# Хелпер для форматирования денег
helpers do
  def number_to_currency(number, options = {})
    defaults = { unit: '₽', format: '%n %u' }
    opts = defaults.merge(options)
    
    formatted_number = sprintf('%.2f', number.to_f)
    formatted_number = formatted_number.gsub('.', ',')
    formatted_number = formatted_number.gsub(/(\d)(?=(\d\d\d)+(?!\d))/, "\\1 ")
    
    opts[:format].gsub('%n', formatted_number).gsub('%u', opts[:unit])
  end
  
  # Функция для склонения русских слов
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
end


# Получение специальностей врача
get '/doctors/:id/specialties' do
  content_type :json
  doctor = Doctor.find(params[:id])
  doctor.specialties.to_json(only: [:id, :name])
end

post '/appointments' do
  content_type :json
  
  begin
    appointment = Appointment.new(
      patient_name: params[:patient_name],
      birth_date: params[:birth_date],
      phone: params[:phone],
      email: params[:email],
      doctor_id: params[:doctor_id].presence,
      specialty_id: params[:specialty_id],  # Здесь важно!
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

# Получение всех специальностей
get '/specialties' do
  content_type :json
  Specialty.all.to_json(only: [:id, :name])
end


# Маршрут для получения данных врача для редактирования
get '/admin/doctors/:id/edit' do
  content_type :json
  doctor = Doctor.find(params[:id])
  
  doctor.to_json(
    only: [:id, :last_name, :first_name, :middle_name, :experience_years, :bio, :photo_path],
    include: { specialties: { only: [:id, :name] } }
  )
end

# Маршрут для обновления врача
post '/admin/doctors/:id/update' do
  begin
    doctor = Doctor.find(params[:id])
    
    # Обновляем основные данные
    doctor.update(
      last_name: params[:doctor][:last_name],
      first_name: params[:doctor][:first_name],
      middle_name: params[:doctor][:middle_name],
      experience_years: params[:doctor][:experience_years],
      bio: params[:doctor][:bio]
    )
    
    # Обновляем специальности
    if params[:doctor][:specialty_ids]
      doctor.specialties = Specialty.where(id: params[:doctor][:specialty_ids])
    else
      doctor.specialties = []
    end
    
    # Обработка новой фотографии
    if params[:photo] && params[:photo][:tempfile]
      photo = params[:photo]
      
      # Используем предоставленный путь или генерируем новый
      photo_path = params[:doctor][:photo_path] || "/images/doctors/doctor_#{doctor.id}_#{Time.now.to_i}.png"
      
      FileUtils.mkdir_p('public/images/doctors')
      
      # Сохраняем файл
      File.open("public#{photo_path}", 'wb') do |f|
        f.write(photo[:tempfile].read)
      end
      
      doctor.photo_path = photo_path
    elsif params[:doctor][:photo_path] && params[:doctor][:photo_path].present?
      # Если путь указан вручную
      doctor.photo_path = params[:doctor][:photo_path]
    end
    
    doctor.save!
    
    redirect '/admin/doctors'
    
  rescue => e
    puts "Ошибка при обновлении врача: #{e.message}"
    redirect '/admin/doctors'
  end
end

# Маршрут для получения списка специальностей (JSON)
get '/admin/specialties/list' do
  content_type :json
  Specialty.all.to_json(only: [:id, :name])
end

post '/admin/categories' do
  begin
    puts "DEBUG: Создание категории с параметрами: #{params[:category].inspect}"
    
    # Обрабатываем позицию - преобразуем в целое число
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
      puts "DEBUG: Категория создана: #{category.inspect}"
      redirect '/admin/prices'
    else
      puts "DEBUG: Ошибки при создании категории: #{category.errors.full_messages}"
      redirect '/admin/prices'
    end
  rescue => e
    puts "DEBUG: Ошибка при создании категории: #{e.message}"
    redirect '/admin/prices'
  end
end

patch '/admin/categories/:id' do
  begin
    puts "DEBUG: Обновление категории #{params[:id]} с параметрами: #{params[:category].inspect}"
    
    category = ServiceCategory.find(params[:id])
    
    # Обрабатываем позицию - преобразуем в целое число
    category_params = params[:category].dup
    if category_params[:position].present?
      category_params[:position] = category_params[:position].to_i
    end
    
    if category.update(category_params)
      puts "DEBUG: Категория обновлена: #{category.inspect}"
      redirect '/admin/prices'
    else
      puts "DEBUG: Ошибки при обновлении категории: #{category.errors.full_messages}"
      redirect '/admin/prices'
    end
  rescue => e
    puts "DEBUG: Ошибка при обновлении категории: #{e.message}"
    redirect '/admin/prices'
  end
end

post '/admin/categories/:id/delete' do
  ServiceCategory.find(params[:id]).destroy
  redirect '/admin/prices'
end

# Маршруты для услуг
post '/admin/services' do
  Service.create(params[:service])
  redirect '/admin/prices'
end

# Получение данных услуги для редактирования
get '/admin/services/:id/edit' do
  content_type :json
  service = Service.find(params[:id])
  service.to_json(
    only: [:id, :name, :description, :price, :duration_minutes, :service_code, :service_category_id, :active]
  )
end

# Обновление услуги
patch '/admin/services/:id' do
  service = Service.find(params[:id])
  service.update(params[:service])
  redirect '/admin/prices'
end

post '/admin/services/:id/delete' do
  Service.find(params[:id]).destroy
  redirect '/admin/prices'
end


# Маршруты для отзывов

# Получение одобренных отзывов (для страницы)
get '/reviews' do
  content_type :json
  Review.approved.recent.to_json(
    only: [:id, :author_name, :content, :rating, :created_at],
    methods: [:star_rating, :formatted_date]
  )
end

# Создание нового отзыва (исправленная версия)
# Создание нового отзыва (исправленная версия с обработкой кодировки)
post '/reviews' do
  content_type :json
  
  puts "DEBUG: Получен запрос на /reviews"
  
  begin
    # Читаем тело запроса как бинарные данные
    request_body = request.body.read.force_encoding('UTF-8')
    puts "DEBUG: Тело запроса (UTF-8): #{request_body}"
    
    # Парсим JSON если это JSON запрос
    if request.content_type && request.content_type.include?('application/json')
      begin
        json_params = JSON.parse(request_body)
        puts "DEBUG: JSON параметры: #{json_params.inspect}"
        
        author_name = json_params['author_name'].to_s.force_encoding('UTF-8') if json_params['author_name']
        content = json_params['content'].to_s.force_encoding('UTF-8') if json_params['content']
        rating = json_params['rating'].to_i
      rescue JSON::ParserError => e
        puts "DEBUG: Ошибка парсинга JSON: #{e.message}"
        return { success: false, error: 'Неверный формат данных' }.to_json
      end
    else
      # Используем обычные параметры формы
      puts "DEBUG: Используем params: #{params.inspect}"
      author_name = params[:author_name].to_s.force_encoding('UTF-8') if params[:author_name]
      content = params[:content].to_s.force_encoding('UTF-8') if params[:content]
      rating = params[:rating].to_i
    end
    
    puts "DEBUG: Данные отзыва - имя: #{author_name.inspect}, контент: #{content.inspect}, рейтинг: #{rating.inspect}"
    
    # Проверяем обязательные поля
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

    puts "DEBUG: Создан отзыв: #{review.inspect}"
    puts "DEBUG: Валидность: #{review.valid?}"
    
    unless review.valid?
      puts "DEBUG: Ошибки: #{review.errors.full_messages}"
    end

    if review.save
      puts "DEBUG: Отзыв успешно сохранен, ID: #{review.id}"
      { 
        success: true, 
        message: 'Спасибо за ваш отзыв! Он будет опубликован после проверки администратором.' 
      }.to_json
    else
      puts "DEBUG: Ошибки валидации: #{review.errors.full_messages}"
      { 
        success: false, 
        errors: review.errors.full_messages 
      }.to_json
    end
    
  rescue => e
    puts "DEBUG: Исключение при сохранении отзыва: #{e.message}"
    puts "DEBUG: Класс исключения: #{e.class}"
    puts "DEBUG: Backtrace: #{e.backtrace.first(10)}"
    
    # Возвращаем простой JSON без русских символов в сообщении об ошибке
    { 
      success: false, 
      error: 'Internal server error' 
    }.to_json
  end
end

# Админские маршруты для отзывов
get '/admin/reviews' do
  @reviews = Review.order(created_at: :desc)
  erb :'admin/reviews', layout: false
end

# Одобрить отзыв
post '/admin/reviews/:id/approve' do
  review = Review.find(params[:id])
  review.update(approved: true)
  redirect '/admin/reviews'
end

# Сделать отзыв рекомендованным (featured)
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


# Маршрут для скачивания лицензии
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

# Маршрут для скачивания свидетельства
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