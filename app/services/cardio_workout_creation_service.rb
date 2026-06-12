class CardioWorkoutCreationService
  class CreationError < StandardError; end

  def initialize(user:, date:, exercise_id:, sets_params:)
    @user = user
    @date = date
    @exercise_id = exercise_id
    @sets_params = sets_params || {}
  end

  def call
    exercise = find_exercise
    valid_rows = extract_valid_rows

    raise CreationError, "時間を入力してください" if valid_rows.empty?

    ActiveRecord::Base.transaction do
      cardio_workout = find_or_create_cardio_workout
      create_sets!(cardio_workout, exercise, valid_rows)
      cardio_workout
    end
  rescue CreationError
    raise
  rescue StandardError => e
    raise CreationError, "保存に失敗しました: #{e.message}"
  end

  private

  def find_exercise
    Exercise.where(user_id: [nil, @user.id]).find(@exercise_id)
  end

  def extract_valid_rows
    @sets_params.values.select do |row|
      row[:duration].present?
    end
  end

  def find_or_create_cardio_workout
    @user.cardio_workouts.find_or_create_by!(
      performed_on: @date
    )
  end

  def create_sets!(cardio_workout, exercise, rows)
    rows.each.with_index(1) do |row, index|
      cardio_workout.cardio_sets.create!(
        exercise: exercise,
        duration: row[:duration],
        distance: row[:distance],
        calories: row[:calories],
        pace: row[:pace],
        memo: row[:memo],
        set_number: index
      )
    end
  end
end