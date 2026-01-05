class CreateDoctorsSpecialtiesJoinTable < ActiveRecord::Migration[6.1]
  def change
    create_join_table :doctors, :specialties do |t|
      t.index [:doctor_id, :specialty_id], unique: true
      t.index [:specialty_id, :doctor_id]
    end
  end
end