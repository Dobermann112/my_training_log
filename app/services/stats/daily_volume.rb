module Stats
  class DailyVolume < Base
    def call
      # WorkoutSetとWorkoutを結合し、指定期間内のセットを日別にグループ化
      rel = sets_scope.joins(:workout)

      # 日付ごとに「weight * reps」の合計を計算
      daily_totals = rel.group("workouts.workout_date")
                        .sum("workout_sets.weight * workout_sets.reps")

      # 折れ線グラフで扱いやすいように整形
      daily_totals.map do |date, volume|
        {
          x: date,       # 日付（X軸）
          y: volume.to_i # 総ボリューム
        }
      end.sort_by { |h| h[:x] } # 日付順にソート
    end
  end
end
