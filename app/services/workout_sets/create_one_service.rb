module WorkoutSets
  class CreateOneService
    Result = Struct.new(:success?, :workout, :workout_set, :errors)

    def self.call(user:, date:, exercise_id:, params:)
      new(user, date, exercise_id, params).call
    end

    def initialize(user, date, exercise_id, params)
      @user = user
      @date = date
      @exercise_id = exercise_id
      @params = params
    end

    def call
      return Result.new(true, nil, nil, nil) if empty_params?

      workout = find_or_create_workout
      Result.new(true, workout, nil, nil)
    end

    private

    def empty_params?
      @params[:weight].blank? && @params[:reps].blank?
    end

    def find_or_create_workout
      @user.workouts.find_or_create_by!(workout_date: @date)
    end
  end
end