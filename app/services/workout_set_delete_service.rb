class WorkoutSetDeleteService
  Result = Struct.new(:workout_deleted?)

  def self.call(workout:, set:)
    new(workout).call(set)
  end

  def initialize(workout)
    @workout = workout
  end

  def call(set)
    ActiveRecord::Base.transaction do
      set.destroy!

      date = @workout.workout_date
      user = @workout.user

      WorkoutCleanupService.call(user: user, date: date)
      deleted = !user.workouts.exists?(id: @workout.id)
      Result.new(deleted)
    end
  end
end
