# models/service.rb
class Service < ActiveRecord::Base
  belongs_to :service_category
  
  validates :name, :price, presence: true
  validates :price, numericality: { greater_than_or_equal_to: 0 }
  validates :service_code, format: { 
    with: /\A[A-Z][A-Z0-9]*\.[A-Z0-9]{3}\.[A-Z0-9]{3}\z/, 
    message: "должен быть в формате А00.000.000 (буква, две цифры, точка, три цифры, точка, три цифры)",
    allow_blank: true 
  }, uniqueness: { allow_blank: true }
  
  # Метод для поиска услуг
  def self.search(query, category_id = nil)
    services = includes(:service_category).all
    
    # Поиск по любому совпадению
    if query.present?
      services = services.where(
        "services.name LIKE :q OR services.description LIKE :q OR service_categories.name LIKE :q OR services.service_code LIKE :q",
        q: "%#{query}%"
      ).references(:service_category)
    end
    
    # Фильтр по категории
    if category_id.present?
      services = services.where(service_category_id: category_id)
    end
    
    services.order(:service_category_id, :name)
  end
  
  # Упорядочиваем по названию внутри категории
  default_scope { order(name: :asc) }
  
  # Валидация для формата кода услуги (необязательный)
  def validate_service_code_format
    return if service_code.blank?
    
    unless service_code.match?(/\A[A-Z][A-Z0-9]*\.[A-Z0-9]{3}\.[A-Z0-9]{3}\z/)
      errors.add(:service_code, "должен быть в формате А00.000.000")
    end
  end
  
  # Генерация кода услуги если не указан
  before_validation :generate_service_code_if_needed
  
  private
  
  def generate_service_code_if_needed
    return if service_code.present? || service_category.blank?
    
    # Генерируем код на основе категории и имени
    category_prefix = service_category.name[0..2].upcase.gsub(/[^A-Z]/, 'A')
    name_prefix = name[0..2].upcase.gsub(/[^A-Z]/, 'X')
    random_num = rand(100..999).to_s.rjust(3, '0')
    
    self.service_code = "#{category_prefix}#{name_prefix}.#{random_num}.#{SecureRandom.random_number(1000).to_s.rjust(3, '0')}"
  end
end