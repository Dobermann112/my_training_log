module Stats
  class Base
    attr_reader :user, :period, :limit

    def initialize(user:, period:, limit: nil)
      @user = user
      @period = period
      @limit = limit
    end

    private

    def sets_scope
      WorkoutSet.joins(:workout)
                .where(workouts: { user: user, workout_date: period })
    end

    def workouts_scope
      Workout.where(user: user, workout_date: period)
    end

    def self.call(**args)
      new(**args).call
    end
  end
end
