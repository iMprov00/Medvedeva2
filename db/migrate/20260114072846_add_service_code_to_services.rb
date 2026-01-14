# db/migrate/[timestamp]_add_service_code_to_services.rb
class AddServiceCodeToServices < ActiveRecord::Migration[6.1]
  def change
    add_column :services, :service_code, :string
    add_index :services, :service_code
  end
end