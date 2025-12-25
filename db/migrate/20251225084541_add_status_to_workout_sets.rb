class AddStatusToWorkoutSets < ActiveRecord::Migration[7.1]
  def change
    add_column :workout_sets, :status, :integer, null: false, default: 0
    add_index :workout_sets, :status
  end
end
