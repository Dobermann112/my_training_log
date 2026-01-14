class RemoveExerciseIdFromCardioWorkouts < ActiveRecord::Migration[7.1]
  def change
    remove_reference :cardio_workouts, :exercise, foreign_key: true
  end
end
