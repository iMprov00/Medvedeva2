# models/review.rb
class Review < ActiveRecord::Base
  validates :author_name, presence: true
  validates :content, presence: true
  validates :rating, presence: true, 
                     numericality: { 
                       only_integer: true, 
                       greater_than_or_equal_to: 1, 
                       less_than_or_equal_to: 5 
                     }
  
  scope :approved, -> { where(approved: true) }
  scope :featured, -> { where(featured: true) }
  scope :recent, -> { order(created_at: :desc) }
  
  # Метод для отображения звезд
  def star_rating
    stars = ''
    rating.times { stars += '★' }
    (5 - rating).times { stars += '☆' }
    stars
  end
  
  # Форматированная дата
  def formatted_date
    created_at.strftime('%d.%m.%Y')
  end
end