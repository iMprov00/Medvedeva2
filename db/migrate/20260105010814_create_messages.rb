class CreateMessages < ActiveRecord::Migration[6.1]
  def change
    create_table :messages do |t|
      t.string :name, null: false
      t.string :phone, null: false
      t.string :email, null: false
      t.string :subject, null: false
      t.text :message, null: false
      t.boolean :read, default: false
      t.timestamps
    end
  end
end