class CreateAvatarPartStats < ActiveRecord::Migration[7.1]
  def change
    create_table :avatar_part_stats do |t|
      t.references :user, null: false, foreign_key: true
      t.integer :avatar_part, null: false
      t.integer :point, null: false, default: 0
      t.datetime :last_trained_at

      t.timestamps
    end

    add_index :avatar_part_stats, [:user_id, :avatar_part], unique: true
  end
end
