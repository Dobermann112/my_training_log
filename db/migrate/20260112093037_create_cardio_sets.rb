class CreateCardioSets < ActiveRecord::Migration[7.1]
  def change
    create_table :cardio_sets do |t|
      t.references :cardio_workout, null: false, foreign_key: true
      t.decimal :distance, precision: 6, scale: 2
      t.integer :duration
      t.integer :calories
      t.decimal :pace, precision: 5, scale: 2
      t.text :memo
      t.integer :set_number, null: false

      t.timestamps
    end
  end
end
