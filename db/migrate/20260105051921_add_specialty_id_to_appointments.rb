class AddSpecialtyIdToAppointments < ActiveRecord::Migration[6.1]
  def change
    add_column :appointments, :specialty_id, :integer
    add_foreign_key :appointments, :specialties
    add_index :appointments, :specialty_id
  end
end