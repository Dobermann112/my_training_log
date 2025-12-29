# 種目に紐づく既存セットの一括更新および
# 新規セットの追加（new_◯）をまとめて処理するサービス
class WorkoutSetUpdateService
  class UpdateError < StandardError; end
  Result = Struct.new(:workout_deleted?)

  def initialize(workout:, exercise:, sets_params:)
    @workout = workout
    @exercise = exercise
    @sets_params = sets_params || {}
  end

  def call
    ActiveRecord::Base.transaction do
      @sets_params.each do |key, attrs|
        next if skip?(attrs)

        if persisted_set?(key)
          update_set(key, attrs)
        else
          create_set(attrs)
        end
      end
      cleanup_workout_if_empty
    end
  rescue StandardError => e
    raise UpdateError, e.message
  end

  private

  def persisted_set?(key)
    @workout.workout_sets.exists?(id: key)
  end  

  def skip?(attrs)
    return false if destroy_requested?(attrs)
    attrs[:weight].blank? && attrs[:reps].blank?
  end

  def create_set(attrs)
    @workout.workout_sets.create!(
      exercise_id: @exercise.id,
      weight: attrs[:weight],
      reps: attrs[:reps],
      memo: attrs[:memo]
    )
  end

  def update_set(id, attrs)
    set = @workout.workout_sets.find(id)

    if destroy_requested?(attrs)
      set.destroy!
    else
      set.update!(
        weight: attrs[:weight],
        reps: attrs[:reps],
        memo: attrs[:memo]
      )
    end
  end

  def cleanup_workout_if_empty
    return Result.new(false) if @workout.workout_sets.exists?
  
    @workout.destroy!
    Result.new(true)
  end  

  def destroy_requested?(attrs)
    attrs[:_destroy] == "1"
  end
end
