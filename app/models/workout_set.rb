class WorkoutSet < ApplicationRecord
  belongs_to :workout
  belongs_to :exercise

  validates :set_number, presence: true, numericality: { greater_than: 0 }

  validate :at_least_one_value_present

  private

  def at_least_one_value_present
    errors.add(:base, "重量、回数、メモのいずれかを入力してください") if weight.blank? && reps.blank? && memo.blank?
  end
end
