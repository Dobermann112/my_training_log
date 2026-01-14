class AddUniqueIndexToCardioWorkouts < ActiveRecord::Migration[7.1]
  def change
    add_index :cardio_workouts,
              [:user_id, :performed_on],
              unique: true,
              name: "index_cardio_workouts_on_user_and_date"
  end
end
