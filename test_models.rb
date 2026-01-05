require 'active_record'
require 'sqlite3'

# Загружаем модели
Dir[File.join(__dir__, 'models', '*.rb')].each { |file| require file }

# Настройка подключения к базе данных
ActiveRecord::Base.establish_connection(
  adapter: 'sqlite3',
  database: 'db/development.sqlite3'
)

puts "Тестирование моделей..."
puts "=" * 50

# Создаем тестовую категорию
category = ServiceCategory.create(name: "Тестовая категория", position: 1)
puts "Создана категория: #{category.name}"

# Создаем тестовую услугу
service = category.services.create(
  name: "Тестовая услуга",
  description: "Описание тестовой услуги",
  price: 1000.50
)
puts "Создана услуга: #{service.name}, цена: #{service.price}"

# Создаем тестового врача
doctor = Doctor.create(
  last_name: "Иванов",
  first_name: "Иван",
  middle_name: "Иванович",
  specialties: "терапевт, кардиолог",
  experience_years: 10,
  bio: "Тестовый врач"
)
puts "Создан врач: #{doctor.full_name}"
puts "Опыт работы: #{doctor.experience_text}"

puts "=" * 50
puts "Тестирование завершено!"