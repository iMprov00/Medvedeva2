class CreateServiceCategories < ActiveRecord::Migration[6.1]
  def change
    create_table :service_categories do |t|
      t.string :name, null: false
      t.integer :position # Для сортировки категорий
      
      t.timestamps
    end
    
    add_index :service_categories, :name, unique: true
  end
end