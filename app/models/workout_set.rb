class WorkoutSet < ApplicationRecord
  before_validation :set_sequential_number, on: :create
  after_create :increment_avatar_score

  enum :status, { draft: 0, confirmed: 1 }

  belongs_to :workout
  belongs_to :exercise

  validates :set_number, presence: true, numericality: { greater_than: 0 }
  validates :weight, numericality: { greater_than: 0 }, allow_nil: true
  validates :reps, numericality: { greater_than_or_equal_to: 1 }, allow_nil: true
  validates :memo, length: { maximum: 100 }

  validate :at_least_one_value_present

  delegate :user_id, :workout_date, to: :workout

  scope :by_set_number, -> { order(:set_number) }
  scope :for_user, ->(user) { joins(:workout).merge(Workout.for_user(user)) }
  scope :between, ->(from, to) { joins(:workout).merge(Workout.between(from, to)) }

  private

  def increment_avatar_score
    Avatar::ScoreIncrementService.new(self).call
  end

  def at_least_one_value_present
    errors.add(:base, "重量、回数、メモのいずれかを入力してください") if weight.blank? && reps.blank? && memo.blank?
  end

  def set_sequential_number
    return if set_number.present?

    max_number = WorkoutSet.where(workout_id:, exercise_id:).maximum(:set_number) || 0
    self.set_number = max_number + 1
  end
end
