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
      return Result.new(true, nil, nil, nil) if empty_params?

      workout = nil
      workout_set = nil

      ActiveRecord::Base.transaction do
        workout = find_or_create_workout

        workout_set =
          find_draft_set(workout) ||
          create_draft_set(workout)

        workout_set.update!(@params)

        Result.new(true, workout, workout_set, nil)
      end
    rescue ActiveRecord::RecordInvalid => e
      Result.new(false, nil, nil, e.record.errors.full_messages)
    end

    private

    def empty_params?
      @params[:weight].blank? && @params[:reps].blank?
    end

    def find_or_create_workout
      @user.workouts.find_or_create_by!(workout_date: @date)
    end

    def find_draft_set(workout)
      workout.workout_sets.draft.find_by(exercise_id: @exercise_id)
    end

    def create_draft_set(workout)
      workout.workout_sets.create!(
        exercise_id: @exercise_id,
        status: :draft
      )
    end
  end
end
