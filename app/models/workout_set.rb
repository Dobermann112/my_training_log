class WorkoutSet < ApplicationRecord
  belongs_to :workout
  belongs_to :exercise

  validates :set_number, presence: true, numericality: { greater_than: 0 }
  validates :weight, numericality: { greater_than: 0 }, allow_nil: true
  validates :reps, numericality: { greater_than_or_equal_to: 1 }, allow_nil: true
  validates :memo, length: { maximum: 100 }

  validate :at_least_one_value_present

  before_validation :set_sequential_number, on: :create

  scope :by_set_number, -> { order(:set_number) }

  private

  def at_least_one_value_present
    errors.add(:base, "重量、回数、メモのいずれかを入力してください") if weight.blank? && reps.blank? && memo.blank?
  end

  def set_sequential_number
    return if set_number.present?
    max_number = WorkoutSet.where(workout_id:, execise_id:).maximum(:set_number) || 0
    self.set_number = max_number + 1
  end
end
