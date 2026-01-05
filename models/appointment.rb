class Appointment < ActiveRecord::Base
  belongs_to :doctor, optional: true
  belongs_to :specialty, optional: true
  
  validates :patient_name, :birth_date, :phone, :email, :specialty, presence: true
  validates :privacy_accepted, acceptance: { message: 'Необходимо принять условия' }
  validates :email, format: { with: URI::MailTo::EMAIL_REGEXP }
  
  # Сортировка по дате создания (новые сверху)
  default_scope { order(created_at: :desc) }
  
  # Статусы записи
  STATUSES = {
    new: 'Новый',
    confirmed: 'Подтвержден',
    cancelled: 'Отменен'
  }.freeze
  
  validates :status, inclusion: { in: STATUSES.keys.map(&:to_s) }
  
  # Метод для отображения статуса
  def status_text
    STATUSES[status.to_sym] || status
  end
  
  # Метод для отображения выбранной специальности
  def specialty_name
    specialty&.name || 'Не указана'
  end
  
  # Метод для проверки нового статуса
  def new?
    status == 'new'
  end
end