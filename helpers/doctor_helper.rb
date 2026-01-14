# helpers/doctor_helper.rb
module DoctorHelper
  # Массив цветов для чередования
  DOCTOR_PHOTO_BG_COLORS = ['#77e0b2', '#e5a7ff'].freeze
  
  # Метод определяет цвет фона на основе индекса врача
  def doctor_bg_color(index)
    DOCTOR_PHOTO_BG_COLORS[index % DOCTOR_PHOTO_BG_COLORS.size]
  end
  
  # Метод для получения класса фона
  def doctor_bg_class(index)
    "bg-doctor-#{index % 2}"
  end
end

# В app.rb добавьте:
require_relative 'helpers/doctor_helper'
helpers DoctorHelper