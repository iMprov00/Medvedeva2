# models/service_category.rb
class ServiceCategory < ActiveRecord::Base
  has_many :services, dependent: :destroy
  
  validates :name, presence: true, uniqueness: true
  
  # Упорядочиваем по позиции
  default_scope { order(position: :asc) }
end