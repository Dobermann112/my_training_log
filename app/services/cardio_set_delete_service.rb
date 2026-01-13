class CardioSetDeleteService
  Result = Struct.new(:cardio_workout_deleted?)

  def self.call(cardio_workout:, set:)
    new(cardio_workout).call(set)
  end

  def initialize(cardio_workout)
    @cardio_workout = cardio_workout
  end

  def call(set)
    ActiveRecord::Base.transaction do
      set.destroy!

      if @cardio_workout.cardio_sets.exists?
        Result.new(false)
      else
        date = @cardio_workout.performed_on
        user = @cardio_workout.user
        @cardio_workout.destroy!
        WorkoutCleanupService.call(user: user, date: date)
        Result.new(true)
      end
    end
  end
end
