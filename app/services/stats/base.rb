module Stats
  class Base
    attr_reader :user, :period, :limit, :body_part_id, :mode

    def initialize(user:, period:, limit: nil, body_part_id: nil, mode: :volume)
      @user = user
      @period = period
      @limit = limit
      @body_part_id = body_part_id
      @mode = mode
    end

    private

    def sets_scope
      scope = WorkoutSet.joins(:workout, exercise: :body_part)
                        .where(workouts: { user: user, workout_date: period })
      scope = scope.where(exercise: { body_part_id: body_part_id }) if body_part_id.present?
      scope
    end

    def workouts_scope
      Workout.where(user: user, workout_date: period)
    end
  end
end
