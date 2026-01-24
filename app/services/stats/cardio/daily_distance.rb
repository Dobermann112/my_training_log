module Stats
  module Cardio
    class DailyDistance
      def self.call(user:, period:)
        user.cardio_workouts
            .where(performed_on: period)
            .joins(:cardio_sets)
            .group(:performed_on)
            .sum("cardio_sets.distance")
            .map do |date, total|
              { x: date, y: total.to_f }
            end
      end
    end
  end
end
