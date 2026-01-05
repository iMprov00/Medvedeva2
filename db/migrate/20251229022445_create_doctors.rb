# db/migrate/[timestamp]_create_doctors.rb
class CreateDoctors < ActiveRecord::Migration[6.1]
  def change
    create_table :doctors do |t|
      t.string :last_name, null: false
      t.string :first_name, null: false
      t.string :middle_name
      t.text :specialties, null: false # Специальности через запятую
      t.integer :experience_years
      t.text :bio, null: false
      t.string :photo_path # Путь к фото на сервере
      
      t.timestamps
    end
    
    # Добавим индексы для быстрого поиска
    add_index :doctors, [:last_name, :first_name, :middle_name]
  end
end