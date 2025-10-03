class CreateWorkoutSets < ActiveRecord::Migration[7.1]
  def change
    create_table :workout_sets do |t|
      t.references :workout, null: false, foreign_key: true
      t.references :exercise, null: false, foreign_key: true
      t.integer :set_number, null: false
      t.decimal :weight, precision: 5, scale: 2, null: true
      t.integer :reps, null: true
      t.text :memo, null: true

      t.timestamps
    end

    add_index :workout_sets, [:workout_id, :exercise_id, :set_number], unique: true
  end
end
