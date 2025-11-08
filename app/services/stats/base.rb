module Stats
  class Base
    attr_reader :user, :from, :to

    def initialize(user:, from: nil, to: nil)
      @user = user
      @from = from.presence && Date.parse(from.to_s)
      @to   = to.presence   && Date.parse(to.to_s)
    end

    private

    def sets_scope
      WorkoutSet.for_user(user).between(from, to)
    end

    def workouts_scope
      Workout.for_user(user).between(from, to)
    end
  end
end
