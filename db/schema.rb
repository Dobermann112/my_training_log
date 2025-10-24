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

ActiveRecord::Schema[7.1].define(version: 2025_10_24_103326) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "body_parts", force: :cascade do |t|
    t.string "name", null: false
    t.integer "display_order", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["display_order"], name: "index_body_parts_on_display_order", unique: true
    t.index ["name"], name: "index_body_parts_on_name", unique: true
  end

  create_table "exercises", force: :cascade do |t|
    t.string "name", limit: 50, null: false
    t.boolean "is_default", default: false, null: false
    t.bigint "user_id"
    t.bigint "body_part_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["body_part_id"], name: "index_exercises_on_body_part_id"
    t.index ["name"], name: "index_exercises_on_name", unique: true, where: "(user_id IS NULL)"
    t.index ["user_id", "body_part_id", "name"], name: "index_exercises_on_user_id_body_part_id_name", unique: true
    t.index ["user_id"], name: "index_exercises_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "name"
    t.integer "gender", default: 0, null: false
    t.text "goal"
    t.index "lower((name)::text)", name: "index_users_on_lower_name", unique: true
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

  create_table "workout_sets", force: :cascade do |t|
    t.bigint "workout_id", null: false
    t.bigint "exercise_id", null: false
    t.integer "set_number", null: false
    t.decimal "weight", precision: 5, scale: 2
    t.integer "reps"
    t.text "memo"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["exercise_id"], name: "index_workout_sets_on_exercise_id"
    t.index ["workout_id", "exercise_id", "set_number"], name: "idx_on_workout_id_exercise_id_set_number_db8390fc60", unique: true
    t.index ["workout_id"], name: "index_workout_sets_on_workout_id"
  end

  create_table "workouts", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.date "workout_date", null: false
    t.text "notes"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id", "workout_date"], name: "index_workouts_on_user_id_and_workout_date"
    t.index ["user_id"], name: "index_workouts_on_user_id"
  end

  add_foreign_key "exercises", "body_parts"
  add_foreign_key "exercises", "users"
  add_foreign_key "workout_sets", "exercises"
  add_foreign_key "workout_sets", "workouts"
  add_foreign_key "workouts", "users"
end
