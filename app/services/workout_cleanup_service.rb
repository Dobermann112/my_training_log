class WorkoutCleanupService
  def self.call(user:, date:)
    new(user, date).call
  end

  def initialize(user, date)
    @user = user
    @date = date
  end

  def call
    return if any_training_exists?

    cleanup_workout
  end

  private

  def any_training_exists?
    strength_exists? || cardio_exists?
  end

  def strength_exists?
    workout = @user.workouts.find_by(workout_date: @date)
    workout&.workout_sets&.exists?
  end

  def cardio_exists?
    @user.cardio_workouts
         .where(performed_on: @date)
         .joins(:cardio_sets)
         .exists?
  end

  def cleanup_workout
    workout = @user.workouts.find_by(workout_date: @date)
    workout&.destroy!
  end
end
