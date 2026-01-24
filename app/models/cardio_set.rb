class CardioSet < ApplicationRecord
  belongs_to :cardio_workout
  belongs_to :exercise

  validates :set_number, presence: true

  validates :distance, numericality: { greater_than: 0 }, allow_nil: true
  validates :duration, numericality: { greater_than: 0 }, allow_nil: true
  validates :calories, numericality: { greater_than: 0 }, allow_nil: true
  validates :pace, numericality: { greater_than: 0 }, allow_nil: true
end
