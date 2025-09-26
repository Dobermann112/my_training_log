class AddColumnsToUsers < ActiveRecord::Migration[7.1]
  def change
    add_column :users, :name, :string
    add_column :users, :gender, :integer
    add_column :users, :goal, :text
  end
end
