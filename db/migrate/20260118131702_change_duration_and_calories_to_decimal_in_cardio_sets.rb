class ChangeDurationAndCaloriesToDecimalInCardioSets < ActiveRecord::Migration[7.1]
  def change
    change_column :cardio_sets, :duration, :decimal, precision: 5, scale:1
    change_column :cardio_sets, :calories, :decimal, precision: 6, scale:1
  end
end
