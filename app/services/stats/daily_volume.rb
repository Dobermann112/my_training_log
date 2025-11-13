module Stats
  class DailyVolume < Base
    def self.call(**args) = new(**args).call

    def call
      # WorkoutSetとWorkoutを結合し、指定期間内のセットを日別にグループ化
      rel = sets_scope.joins(:workout)

      # 日付ごとに「weight * reps」の合計を計算
      daily_totals = rel.group("workouts.workout_date")
                        .sum("workout_sets.weight * workout_sets.reps")

      data = daily_totals.map do |date, volume|
        { x: date, y: volume.to_f }
      end.sort_by { |h| h[:x] }
      
      return data if mode == :volume
      score_data(data)
    end

    private

    def score_data(data)
      return [] if data.blank?

      avg = data.sum { |d| d[:y] } / data.size.to_f
      return [] if avg.zero?

      data.map do |d|
        volume = d[:y]
        score = (volume /avg * 100).round
        ratio = ((volume - avg) / avg * 100).round
        { x: d[:x], y: score, ratio: ratio }
      end
    end
  end
end
