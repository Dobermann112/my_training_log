class Workout < ApplicationRecord
  belongs_to :user
  has_many :workout_sets, dependent: :destroy

  validates :workout_date, presence: true
  validates :notes, length: { maximum: 500 }, allow_blank: true
end
