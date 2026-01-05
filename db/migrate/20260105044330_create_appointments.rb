class CreateAppointments < ActiveRecord::Migration[6.1]
  def change
    create_table :appointments do |t|
      t.string :patient_name, null: false
      t.date :birth_date, null: false
      t.string :phone, null: false
      t.string :email, null: false
      t.references :doctor, foreign_key: true, null: true
      t.text :message
      t.boolean :privacy_accepted, null: false, default: false
      t.string :status, null: false, default: 'new'
      t.boolean :read, null: false, default: false
      
      t.timestamps
    end
    
    # Правильное имя для join таблицы с короткими именами индексов
    create_table :appointments_specialties, id: false do |t|
      t.belongs_to :appointment
      t.belongs_to :specialty
      
      # Укороченные имена индексов
      t.index [:appointment_id, :specialty_id], unique: true, name: 'idx_appoint_spec_on_appoint_spec'
      t.index [:specialty_id, :appointment_id], name: 'idx_appoint_spec_on_spec_appoint'
    end
    
    add_index :appointments, :status
    add_index :appointments, :read
  end
end