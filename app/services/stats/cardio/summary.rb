module Stats
  module Cardio
    class Summary
      def self.call(user:, period:)
        days = user.cardio_workouts
                   .where(performed_on: period)
                   .distinct
                   .order(:performed_on)
                   .pluck(:performed_on)
                   .uniq

        {
          total_duration: total_duration(user, period),
          total_distance: total_distance(user, period),
          streak_days: calculate_streak(days)
        }
      end

      private

      def self.total_duration(user, period)
        user.cardio_workouts
            .where(performed_on: period)
            .joins(:cardio_sets)
            .sum(:duration)
      end

      def self.total_distance(user, period)
        user.cardio_workouts
            .where(performed_on: period)
            .joins(:cardio_sets)
            .sum(:distance)
      end

      # ← 筋トレと同一ロジック
      def self.calculate_streak(days)
        return 0 if days.empty?

        max_streak = 1
        cur = 1

        (1...days.length).each do |i|
          if days[i] == days[i - 1] + 1.day
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
end
