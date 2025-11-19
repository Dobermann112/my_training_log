class WorkoutCreationService
  class CreationError < StandardError; end

  def initialize(user:, date:, exercise_id:, sets_params:)
    @user = user
    @date = date
    @exercise_id = exercise_id
    @sets_params = sets_params || {}
  end

  def call
    ActiveRecord::Base.transaction do
      workout = create_workout
      create_sets!(workout)
      workout
    end
  rescue StandardError => e
    raise CreationError, "保存に失敗しました: #{e.message}"
  end

  private

  def create_workout
    workout = @user.workouts.find_by(workout_date: @date)
    return workout if workout

    @user.workouts.create!(
      workout_date: @date,
      notes: ""
    )
  end

  def create_sets!(workout)
    @sets_params.each_value do |row|
      next if skip_row?(row)

      workout.workout_sets.create!(
        exercise_id: @exercise_id,
        weight: row[:weight],
        reps: row[:reps],
        memo: row[:memo]
      )
    end
  end

  def skip_row?(row)
    row[:weight].blank? && row[:reps].blank?
  end
end
