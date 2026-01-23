# models/doctor.rb
class Doctor < ActiveRecord::Base
  has_and_belongs_to_many :specialties
  has_many :appointments, dependent: :destroy  # Добавьте это!
  
  validates :last_name, :first_name, :bio, presence: true
  validates :experience_years, numericality: { only_integer: true, greater_than_or_equal_to: 0 }, allow_nil: true
  
  # Метод для поиска врачей
  def self.search(query, specialty_filter = nil)
    doctors = includes(:specialties).all
    
    # Поиск по любому совпадению
    if query.present?
      doctors = doctors.where(
        "last_name LIKE :q OR first_name LIKE :q OR middle_name LIKE :q OR bio LIKE :q",
        q: "%#{query}%"
      )
    end
    
    # Фильтр по специальности
    if specialty_filter.present? && !specialty_filter.empty?
      doctors = doctors.joins(:specialties).where('specialties.name = ?', specialty_filter)
    end
    
    doctors.order(:last_name, :first_name)
  end
  
  # Получаем уникальные специальности для фильтра
  def self.unique_specialties
    Specialty.pluck(:name).uniq.sort
  end
  
  # Метод для полного имени
  def full_name
    [last_name, first_name, middle_name].compact.join(' ')
  end
  
  # Метод для отображения опыта
  def experience_text
    return "Опыт не указан" unless experience_years
    
    case experience_years
    when 0
      "менее года"
    when 1
      "1 год"
    when 2..4
      "#{experience_years} года"
    else
      "#{experience_years} лет"
    end
  end
  
  # Метод для получения названий специальностей через запятую
  def specialties_text
    specialties.pluck(:name).join(', ')
  end

  def photo_present?
    photo_path.present? && File.exist?("public#{photo_path}")
  end
  
  def photo_url
    if photo_present?
      photo_path
    else
      # Заглушка или дефолтное фото
      "/images/doctors/default.png"
    end
  end
  
  def photo_extension
    return unless photo_path
    File.extname(photo_path).downcase
  end
  
  def png_photo?
    photo_extension == '.png'
  end
  
  def specialties_text
    specialties.map(&:name).join(', ')
  end
  
  def full_name
    [last_name, first_name, middle_name].compact.join(' ')
  end
  
  def experience_text
    if experience_years && experience_years > 0
      "#{experience_years} #{russian_plural(experience_years, 'год', 'года', 'лет')}"
    else
      "Опыт не указан"
    end
  end
  
  private
  
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