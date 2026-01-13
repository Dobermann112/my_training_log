class CardioWorkoutCreationService
  class CreationError < StandardError; end

  def initialize(user:, exercise_id:, date:, sets_params:)
    @user        = user
    @exercise    = Exercise.find(exercise_id)
    @date        = date
    @sets_params = sets_params || {}
  end

  def call
    valid_rows = extract_valid_rows
    raise CreationError, "距離・時間・メモのいずれかを入力してください" if valid_rows.empty?

    ActiveRecord::Base.transaction do
      cardio_workout = find_or_create_cardio_workout
      create_sets!(cardio_workout, valid_rows)
      cardio_workout
    end
  rescue ActiveRecord::RecordInvalid => e
    raise CreationError, e.message
  end

  private

  def extract_valid_rows
    @sets_params.values.select do |row|
      row[:distance].present? ||
        row[:duration].present? ||
        row[:calories].present? ||
        row[:memo].present?
    end
  end

  def find_or_create_cardio_workout
    CardioWorkout.find_or_create_by!(
      user: @user,
      exercise: @exercise,
      performed_on: @date
    )
  end

  def create_sets!(cardio_workout, rows)
    next_number =
      cardio_workout.cardio_sets.maximum(:set_number).to_i

    rows.each_with_index do |row, i|
      cardio_workout.cardio_sets.create!(
        distance:  row[:distance],
        duration:  row[:duration],
        calories:  row[:calories],
        pace:      row[:pace],
        memo:      row[:memo],
        set_number: next_number + i + 1
      )
    end
  end
end
