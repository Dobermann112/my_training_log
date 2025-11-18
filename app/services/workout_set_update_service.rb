# 種目に紐づく既存セットの一括更新および
# 新規セットの追加（new_◯）をまとめて処理するサービス
class WorkoutSetUpdateService
    class UpdateError < StandardError; end
  
    def initialize(workout:, exercise:, sets_params:)
      @workout = workout
      @exercise = exercise
      @sets_params = sets_params || {}
    end
  
    def call
      ActiveRecord::Base.transaction do
        @sets_params.each do |key, attrs|
          next if skip?(attrs)
  
          if new_record_key?(key)
            create_set(attrs)
          else
            update_set(key, attrs)
          end
        end
      end
    rescue => e
      raise UpdateError, e.message
    end
  
    private
  
    def new_record_key?(key)
      key.to_s.start_with?("new_")
    end
  
    def skip?(attrs)
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
      set.update!(
        weight: attrs[:weight],
        reps: attrs[:reps],
        memo: attrs[:memo]
      )
    end
  end
  