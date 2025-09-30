class CreateExercises < ActiveRecord::Migration[7.1]
  def change
    create_table :exercises do |t|
      t.string :name, null: false, limit: 50
      t.boolean :is_default, null: false, default: false

      t.references :user, null: true, foreign_key: true
      t.references :body_part, null: false, foreign_key: true

      t.timestamps
    end

    add_index :exercises, [:user_id, :name], unique: true
    add_index :exercises, :name, unique: true, where: "user_id IS NULL"
  end
end
