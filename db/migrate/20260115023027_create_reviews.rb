class CreateReviews < ActiveRecord::Migration[8.1]
  def change
    create_table :reviews do |t|
      t.string :author_name, null: false
      t.text :content, null: false
      t.integer :rating, null: false
      t.boolean :approved, default: false
      t.boolean :featured, default: false
      t.timestamps
    end
    
    add_index :reviews, :approved
    add_index :reviews, :featured
    add_index :reviews, :rating
  end
end
