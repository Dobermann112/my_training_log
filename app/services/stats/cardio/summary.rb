module Stats
  module Cardio
    class Summary
      def self.call(user:, period:)
        workouts = user.cardio_workouts
                        .where(performed_on: period)
                        .includes(:cardio_sets)

        total_duration = workouts.sum do |w|
          w.cardio_sets.sum(:duration)
        end

        total_distance = workouts.sum do |w|
          w.cardio_sets.sum(:distance)
        end

        streak_days = workouts.select(:performed_on).distinct.count

        {
          total_duration: total_duration,
          total_distance: total_distance,
          streak_days: streak_days
        }
      end
    end
  end
end
