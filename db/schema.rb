# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.2].define(version: 2026_02_06_120000) do
  create_table "appointments", force: :cascade do |t|
    t.string "patient_name", null: false
    t.date "birth_date", null: false
    t.string "phone", null: false
    t.string "email", null: false
    t.integer "doctor_id"
    t.text "message"
    t.boolean "privacy_accepted", default: false, null: false
    t.string "status", default: "new", null: false
    t.boolean "read", default: false, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "specialty_id"
    t.index ["doctor_id"], name: "index_appointments_on_doctor_id"
    t.index ["read"], name: "index_appointments_on_read"
    t.index ["specialty_id"], name: "index_appointments_on_specialty_id"
    t.index ["status"], name: "index_appointments_on_status"
  end

  create_table "appointments_specialties", id: false, force: :cascade do |t|
    t.integer "appointment_id"
    t.integer "specialty_id"
    t.index ["appointment_id", "specialty_id"], name: "idx_appoint_spec_on_appoint_spec", unique: true
    t.index ["appointment_id"], name: "index_appointments_specialties_on_appointment_id"
    t.index ["specialty_id", "appointment_id"], name: "idx_appoint_spec_on_spec_appoint"
    t.index ["specialty_id"], name: "index_appointments_specialties_on_specialty_id"
  end

  create_table "doctors", force: :cascade do |t|
    t.string "last_name", null: false
    t.string "first_name", null: false
    t.string "middle_name"
    t.integer "experience_years"
    t.text "bio", null: false
    t.string "photo_path"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "booking_link"
    t.index ["last_name", "first_name", "middle_name"], name: "index_doctors_on_last_name_and_first_name_and_middle_name"
  end

  create_table "doctors_specialties", id: false, force: :cascade do |t|
    t.integer "doctor_id", null: false
    t.integer "specialty_id", null: false
    t.index ["doctor_id", "specialty_id"], name: "index_doctors_specialties_on_doctor_id_and_specialty_id", unique: true
    t.index ["specialty_id", "doctor_id"], name: "index_doctors_specialties_on_specialty_id_and_doctor_id"
  end

  create_table "documents", force: :cascade do |t|
    t.string "title", null: false
    t.text "description"
    t.string "file_path", null: false
    t.string "original_filename"
    t.string "icon", default: "bi-file-earmark-text"
    t.string "icon_color", default: "secondary"
    t.integer "position", default: 0
    t.boolean "active", default: true
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["active"], name: "index_documents_on_active"
    t.index ["position"], name: "index_documents_on_position"
  end

  create_table "messages", force: :cascade do |t|
    t.string "name", null: false
    t.string "phone", null: false
    t.string "email", null: false
    t.string "subject", null: false
    t.text "message", null: false
    t.boolean "read", default: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "status", default: "new"
    t.index ["status"], name: "index_messages_on_status"
  end

  create_table "reviews", force: :cascade do |t|
    t.string "author_name", null: false
    t.text "content", null: false
    t.integer "rating", null: false
    t.boolean "approved", default: false
    t.boolean "featured", default: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["approved"], name: "index_reviews_on_approved"
    t.index ["featured"], name: "index_reviews_on_featured"
    t.index ["rating"], name: "index_reviews_on_rating"
  end

  create_table "service_categories", force: :cascade do |t|
    t.string "name", null: false
    t.integer "position"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["name"], name: "index_service_categories_on_name", unique: true
  end

  create_table "services", force: :cascade do |t|
    t.integer "service_category_id", null: false
    t.string "name", null: false
    t.text "description"
    t.decimal "price", precision: 10, scale: 2, null: false
    t.integer "duration_minutes"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "service_code"
    t.boolean "active", default: true, null: false
    t.index ["name"], name: "index_services_on_name"
    t.index ["price"], name: "index_services_on_price"
    t.index ["service_category_id"], name: "index_services_on_service_category_id"
    t.index ["service_code"], name: "index_services_on_service_code"
  end

  create_table "specialties", force: :cascade do |t|
    t.string "name", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["name"], name: "index_specialties_on_name", unique: true
  end

  create_table "tests", force: :cascade do |t|
    t.string "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  add_foreign_key "appointments", "doctors"
  add_foreign_key "appointments", "specialties"
  add_foreign_key "services", "service_categories"
end
