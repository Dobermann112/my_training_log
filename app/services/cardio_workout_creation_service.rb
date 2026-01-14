# app/services/cardio_workout_creation_service.rb
class CardioWorkoutCreationService
  class CreationError < StandardError; end

  def initialize(user:, date:, exercise_id:, sets_params:)
    @user = user
    @date = date
    @exercise_id = exercise_id
    @sets_params = sets_params || {}
  end

  def call
    valid_rows = extract_valid_rows

    if valid_rows.empty?
      raise CreationError, "時間を入力してください"
    end

    ActiveRecord::Base.transaction do
      cardio_workout = find_or_create_cardio_workout
      create_sets!(cardio_workout, valid_rows)
      cardio_workout
    end
  rescue CreationError
    raise
  rescue StandardError => e
    raise CreationError, "保存に失敗しました: #{e.message}"
  end

  private

  # -------------------------
  # 有効なセット行の抽出
  # -------------------------
  # duration が入っていれば有効
  def extract_valid_rows
    @sets_params.values.select do |row|
      row[:duration].present?
    end
  end

  # -------------------------
  # CardioWorkout 作成
  # -------------------------
  # user × date で一意
  def find_or_create_cardio_workout
    @user.cardio_workouts.find_or_create_by!(
      performed_on: @date
    )
  end

  # -------------------------
  # CardioSet 作成
  # -------------------------
  def create_sets!(cardio_workout, rows)
    rows.each.with_index(1) do |row, index|
      cardio_workout.cardio_sets.create!(
        exercise_id: @exercise_id,
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
