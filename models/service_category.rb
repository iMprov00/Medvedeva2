# models/service_category.rb
class ServiceCategory < ActiveRecord::Base
  has_many :services, dependent: :destroy
  
  validates :name, presence: true, uniqueness: true
  validates :position, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  
  # Автоматически назначаем позицию перед созданием
  before_validation :assign_position, on: :create
  before_save :ensure_position_is_integer
  
  # Упорядочиваем по позиции
  default_scope { order(position: :asc, name: :asc) }
  
  private
  
  def assign_position
    if self.position.nil? || self.position.zero?
      # Находим максимальную позицию и добавляем 1
      max_position = ServiceCategory.maximum(:position) || 0
      self.position = max_position + 1
    end
  end
  
  def ensure_position_is_integer
    self.position = position.to_i if position.present?
  end
end