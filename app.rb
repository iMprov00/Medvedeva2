# app.rb
require 'sinatra'
require 'sinatra/activerecord'
require 'sqlite3'

configure do
  set :port, ENV['PORT'] || 9292 # Использует порт от Amvera или 9292 для локальной разработки
  set :bind, '0.0.0.0'
end

# Загружаем модели
Dir[File.join(__dir__, 'models', '*.rb')].each { |file| require file }

# Настройка подключения к базе данных
configure :development do
  ActiveRecord::Base.establish_connection(
    adapter: 'sqlite3',
    database: 'db/development.sqlite3'
  )
end

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
get '/about' do
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