class CreateCardioWorkouts < ActiveRecord::Migration[7.1]
  def change
    create_table :cardio_workouts do |t|
      t.references :user, null: false, foreign_key: true
      t.references :exercise, null: false, foreign_key: true
      t.date :performed_on, null: false

      t.timestamps
    end
  end
end
