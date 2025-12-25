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
      @params = params.to_h.symbolize_keys
    end

    def call
      return Result.new(false, nil, nil, ["date is missing"]) if @date.blank?
      return Result.new(true, nil, nil, nil) if empty_params?

      workout = @user.workouts.find_or_create_by!(workout_date: @date)

      workout_set = workout.workout_sets.create!(
        exercise_id: @exercise_id,
        weight: @params[:weight],
        reps: @params[:reps],
        memo: @params[:memo],
        status: :draft
      )

      Result.new(true, workout, workout_set, nil)
    rescue ActiveRecord::RecordInvalid => e
      Result.new(false, nil, nil, e.record.errors.full_messages)
    end

    private

    def empty_params?
      @params[:weight].blank? && @params[:reps].blank?
    end
  end
end
