module Stats
  module Cardio
    class Exercise
      def self.call(user:, period:, limit:)
        user.cardio_workouts
            .where(performed_on: period)
            .joins(cardio_sets: :exercise)
            .group("exercises.name")
            .sum("cardio_sets.duration")
            .sort_by { |_k, v| -v }
            .first(limit)
            .map { |name, total|
              { x: name, y: total }
            }
      end
    end
  end
end
