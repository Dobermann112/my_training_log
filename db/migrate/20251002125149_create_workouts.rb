class CreateWorkouts < ActiveRecord::Migration[7.1]
  def change
    create_table :workouts do |t|
      t.references :user, null: false, foreign_key: true
      t.date :workout_date, null: false
      t.text :notes

      t.timestamps
    end

    add_index :workouts, [:user_id, :workout_date]
  end
end
