# db/migrate/[timestamp]_add_columns_to_services.rb
class AddColumnsToServices < ActiveRecord::Migration[6.1]
  def change
    add_column :services, :active, :boolean, default: true, null: false
  end
end