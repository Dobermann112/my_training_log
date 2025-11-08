module Stats
  class BodyParts < Base
    # 戻り値: [{body_part_id:, body_part_name:, sessions:, sets:, reps:}, ...]
    def call
      rel = sets_scope.joins(exercise: :body_part)

      sessions = rel.joins(:workout, exercise: :body_part)
                    .select("body_parts.id AS body_part_id, COUNT(DISTINCT workouts.id) AS cnt")
                    .group("body_parts.id")
                    .map { |r| [r.body_part_id, r.cnt] }
                    .to_h

      sets = rel.group("body_parts.id").count
      reps = rel.group("body_parts.id").sum(:reps)

      names = BodyPart.where(id: sessions.keys | sets.keys | reps.keys)
                      .pluck(:id, :name).to_h

      (sessions.keys | sets.keys | reps.keys).map do |bid|
        {
          body_part_id:   bid,
          body_part_name: names[bid],
          sessions:       sessions[bid] || 0,
          sets:           sets[bid]     || 0,
          reps:           reps[bid]     || 0
        }
      end.sort_by { |h| -h[:sessions] }
    end
  end
end