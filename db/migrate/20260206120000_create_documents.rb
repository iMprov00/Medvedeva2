class CreateDocuments < ActiveRecord::Migration[6.1]
  def change
    create_table :documents do |t|
      t.string :title, null: false
      t.text :description
      t.string :file_path, null: false
      t.string :original_filename
      t.string :icon, default: 'bi-file-earmark-text'
      t.string :icon_color, default: 'secondary'
      t.integer :position, default: 0
      t.boolean :active, default: true
      t.timestamps
    end

    add_index :documents, :position
    add_index :documents, :active
  end
end
