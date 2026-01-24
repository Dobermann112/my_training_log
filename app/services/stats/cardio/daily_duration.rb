module Stats
  module Cardio
    class DailyDuration
      def self.call(user:, period:)
        user.cardio_workouts
            .where(performed_on: period)
            .joins(:cardio_sets)
            .group(:performed_on)
            .sum("cardio_sets.duration")
            .sort_by { |date, _| date }
            .map do |date, total|
              { x: date, y: total }
            end
      end
    end
  end
end
