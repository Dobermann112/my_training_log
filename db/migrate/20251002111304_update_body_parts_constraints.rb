class UpdateBodyPartsConstraints < ActiveRecord::Migration[7.1]
  def change
    change_column_null :body_parts, :name, false
    change_column_null :body_parts, :display_order, false

    add_index :body_parts, :name, unique: true
    add_index :body_parts, :display_order, unique: true
  end
end
