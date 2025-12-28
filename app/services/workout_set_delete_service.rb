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

      if @workout.workout_sets.exists?
        Result.new(false)
      else
        @workout.destroy!
        Result.new(true)
      end
    end
  end
end
