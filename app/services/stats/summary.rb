module Stats
  class Summary < Base
    def call
      {
        total_sets: total_sets,
        total_reps: total_reps,
        streak_days: streak_days
      }
    end

    private

    def total_sets
      sets_scope.count
    end

    def total_reps
      sets_scope.sum(:reps)
    end

    # 連続記録日数（対象期間内での最大連続稼働日数）
    def streak_days
      days = fetch_days
      return 0 if days.empty?

      calculate_streak(days)
    end

    def fetch_days
      workouts_scope.distinct.order(:workout_date).pluck(:workout_date).uniq
    end

    def calculate_streak(days)
      max_streak = 1
      cur = 1
      (1...days.length).each do |i|
        if days[i] == days[i - 1] + 1
          cur += 1
          max_streak = [max_streak, cur].max
        else
          cur = 1
        end
      end
      max_streak
    end
  end
end
