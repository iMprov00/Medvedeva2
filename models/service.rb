# models/service.rb
class Service < ActiveRecord::Base
  belongs_to :service_category
  
  validates :name, :price, presence: true
  validates :price, numericality: { greater_than_or_equal_to: 0 }
  
  # Метод для поиска услуг
  def self.search(query, category_id = nil)
    services = includes(:service_category).all
    
    # Поиск по любому совпадению
    if query.present?
      services = services.where(
        "services.name LIKE :q OR services.description LIKE :q OR service_categories.name LIKE :q",
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
end