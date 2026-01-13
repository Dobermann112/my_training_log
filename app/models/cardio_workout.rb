class CardioWorkout < ApplicationRecord
  belongs_to :user
  belongs_to :exercise

  has_many :cardio_sets, dependent: :destroy

  validates :performed_on, presence: true
end
