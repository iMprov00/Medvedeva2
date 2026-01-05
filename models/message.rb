class Message < ActiveRecord::Base
  validates :name, :phone, :email, :subject, :message, presence: true
  validates :email, format: { with: URI::MailTo::EMAIL_REGEXP }
  
  # Статусы сообщений
  STATUSES = {
    new: 'Новый',
    read: 'Прочитано',
    replied: 'Ответ отправлен'
  }.freeze
  
  validates :status, inclusion: { in: STATUSES.keys.map(&:to_s) }
  
  # Сортировка по дате создания (новые сверху)
  default_scope { order(created_at: :desc) }
  
  # Метод для отображения статуса
  def status_text
    STATUSES[status.to_sym] || status
  end
  
  # Метод для проверки нового статуса
  def new?
    status == 'new'
  end
end