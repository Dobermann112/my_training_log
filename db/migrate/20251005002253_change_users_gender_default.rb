class ChangeUsersGenderDefault < ActiveRecord::Migration[7.1]
  def change
    change_column_default :users, :gender, from: nil, to: 0
    change_column_null :users, :gender, false, 0
  end
end
