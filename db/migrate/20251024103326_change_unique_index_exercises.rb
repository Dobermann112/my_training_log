class ChangeUniqueIndexExercises < ActiveRecord::Migration[7.1]
  def change
    remove_index :exercises, name: "index_exercises_on_user_id_and_name"

    add_index :exercises,
              [:user_id, :body_part_id, :name],
              unique: true,
              name: "index_exercises_on_user_id_body_part_id_name"
  end
end
