module Stats
  class DailyVolume < Base
    def self.call(**args) = new(**args).call

    def call
      return build_volume_with_main_part if mode == :volume && body_part_id.blank?

      rel = sets_scope.joins(:workout)
      daily_totals = rel.group("workouts.workout_date")
                        .sum("workout_sets.weight * workout_sets.reps")

      data = daily_totals.map do |date, volume|
        { x: date, y: volume.to_f }
      end.sort_by { |h| h[:x] }

      return data if mode == :volume

      score_data(data)
    end

    private

    def build_volume_with_main_part
      rel = sets_scope
      by_date_and_part = rel.group("workouts.workout_date", "body_parts.name")
                            .sum("workout_sets.weight * workout_sets.reps")

      grouped = by_date_and_part.group_by { |(date, _part), _v| date }

      data = grouped.map do |date, rows|
        total = rows.sum { |(_, _), v| v.to_f }
        top_part, _v = rows.max_by { |(_, _), v| v.to_f }
        main_part = top_part[1]
        { x: date, y: total, main_part: main_part }
      end

      data.sort_by { |h| h[:x] }
    end

    def score_data(data)
      return [] if data.blank?

      avg = data.sum { |d| d[:y] } / data.size.to_f
      return [] if avg.zero?

      data.map do |d|
        volume = d[:y]
        score = (volume / avg * 100).round
        ratio = ((volume - avg) / avg * 100).round
        { x: d[:x], y: score, ratio: ratio }
      end
    end
  end
end
