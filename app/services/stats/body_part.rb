module Stats
  class BodyPart < Base
    def self.call(**args) = new(**args).call

    def call
      rel = sets_scope.joins(exercise: :body_part)

      sessions = fetch_sessions(rel)
      sets     = fetch_sets(rel)
      reps     = fetch_reps(rel)
      names    = fetch_names(sessions, sets, reps)

      aggregate_stats(sessions, sets, reps, names)
    end

    private

    # 部位別のセッション数を集計
    def fetch_sessions(rel)
      rel.joins(:workout, exercise: :body_part)
        .select('body_parts.id AS body_part_id, COUNT(DISTINCT workouts.id) AS cnt')
        .group('body_parts.id')
        .to_h { |r| [r.body_part_id, r.cnt] }
    end

    # 部位別のセット数を集計
    def fetch_sets(rel)
      rel.group('body_parts.id').count
    end

    # 部位別の総レップ数を集計
    def fetch_reps(rel)
      rel.group('body_parts.id').sum(:reps)
    end

    # 対象部位IDに対応する部位名を取得
    def fetch_names(sessions, sets, reps)
      ids = sessions.keys | sets.keys | reps.keys
      ::BodyPart.where(id: ids).pluck(:id, :name).to_h
    end

    # まとめて整形
    def aggregate_stats(sessions, sets, reps, names)
      ids = sessions.keys | sets.keys | reps.keys
      ids.map do |bid|
        {
          body_part_id: bid,
          body_part_name: names[bid],
          sessions: sessions[bid] || 0,
          sets: sets[bid] || 0,
          reps: reps[bid] || 0
        }
      end.sort_by { |h| -h[:sessions] }
    end
  end
end
