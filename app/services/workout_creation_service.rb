class WorkoutCreationService
  class CreationError < StandardError; end

  def initialize(user:, date:, exercise_id:, sets_params:)
    @user = user
    @date = date
    @exercise = user.exercises.find(exercise_id)
    @sets_params = sets_params || {}
  rescue ActiveRecord::RecordNotFound
    raise CreationError, "不正な種目です"
  end

  def call
    valid_rows = extract_valid_rows

    if valid_rows.empty?
      raise CreationError, "重量・回数・メモのいずれかを入力してください"
    end

    ActiveRecord::Base.transaction do
      workout = create_workout
      create_sets!(workout, valid_rows)
      workout
    end
  rescue CreationError
    raise
  rescue StandardError => e
    raise CreationError, "保存に失敗しました: #{e.message}"
  end

  private

  def extract_valid_rows
    @sets_params.values.select do |row|
      row[:weight].present? || row[:reps].present? || row[:memo].present?
    end
  end

  def create_workout
    workout = @user.workouts.find_by(workout_date: @date)
    return workout if workout

    @user.workouts.create!(
      workout_date: @date,
      notes: ""
    )
  end

  def create_sets!(workout, rows)
    rows.each do |row|
      workout.workout_sets.create!(
        exercise: @exercise,
        weight: row[:weight],
        reps: row[:reps],
        memo: row[:memo]
      )
    end
  end
end
