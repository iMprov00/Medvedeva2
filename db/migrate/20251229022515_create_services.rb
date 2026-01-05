class CreateServices < ActiveRecord::Migration[6.1]
  def change
    create_table :services do |t|
      t.references :service_category, null: false, foreign_key: true
      t.string :name, null: false
      t.text :description
      t.decimal :price, precision: 10, scale: 2, null: false
      t.integer :duration_minutes # Продолжительность услуги в минутах
      
      t.timestamps
    end
    
    add_index :services, :name
    add_index :services, :price
  end
end