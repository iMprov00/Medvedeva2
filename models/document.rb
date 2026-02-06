class Document < ActiveRecord::Base
  validates :title, presence: true
  validates :file_path, presence: true

  scope :active, -> { where(active: true) }
  scope :ordered, -> { order(position: :asc, created_at: :desc) }

  # Определение типа файла по расширению
  def file_extension
    File.extname(file_path).delete('.').downcase
  end

  # Человекочитаемый тип файла
  def file_type_label
    case file_extension
    when 'pdf' then 'PDF'
    when 'doc', 'docx' then 'Word'
    when 'xls', 'xlsx' then 'Excel'
    when 'jpg', 'jpeg', 'png', 'webp', 'gif' then 'Изображение'
    else file_extension.upcase
    end
  end

  # MIME-тип для скачивания
  def content_type
    case file_extension
    when 'pdf' then 'application/pdf'
    when 'doc' then 'application/msword'
    when 'docx' then 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    when 'xls' then 'application/vnd.ms-excel'
    when 'xlsx' then 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    when 'jpg', 'jpeg' then 'image/jpeg'
    when 'png' then 'image/png'
    when 'webp' then 'image/webp'
    when 'gif' then 'image/gif'
    else 'application/octet-stream'
    end
  end

  # Название для скачиваемого файла
  def download_filename
    original_filename.presence || "#{title}.#{file_extension}"
  end

  # Полный путь к файлу на диске
  def full_file_path
    File.join('public', file_path)
  end

  # Проверка существования файла
  def file_exists?
    File.exist?(full_file_path)
  end
end
