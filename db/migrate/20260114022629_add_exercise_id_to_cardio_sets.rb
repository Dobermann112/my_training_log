class AddExerciseIdToCardioSets < ActiveRecord::Migration[7.1]
  def change
    add_reference :cardio_sets, :exercise, foreign_key: true
  end
end
