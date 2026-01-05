class RemoveSpecialtiesFromDoctors < ActiveRecord::Migration[6.1]
  def change
    remove_column :doctors, :specialties, :text
  end
end