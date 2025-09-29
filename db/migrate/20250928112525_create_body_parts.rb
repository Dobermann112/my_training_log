class CreateBodyParts < ActiveRecord::Migration[7.1]
  def change
    create_table :body_parts do |t|
      t.string :name
      t.integer :display_order

      t.timestamps
    end
  end
end
