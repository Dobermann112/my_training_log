module Stats
  class Exercise < Base
    def call
      rel   = sets_scope.includes(:exercise)
      group = rel.group(:exercise_id)

      maxes = fetch_max_weights(group)
      sets  = fetch_sets(group)
      reps  = fetch_reps(group)
      names = fetch_names(maxes, sets, reps)

      aggregate_stats(maxes, sets, reps, names)
    end

    private

    # 最大重量
    def fetch_max_weights(group)
      group.maximum(:weight)
    end

    # 総セット数
    def fetch_sets(group)
      group.count
    end

    # 総レップ数
    def fetch_reps(group)
      group.sum(:reps)
    end

    # 対象種目名を取得
    def fetch_names(maxes, sets, reps)
      ids = maxes.keys | sets.keys | reps.keys
      ::Exercise.where(id: ids).pluck(:id, :name).to_h
    end

    # 集計結果を配列に整形
    def aggregate_stats(maxes, sets, reps, names)
      ids = maxes.keys | sets.keys | reps.keys
      ids.map do |eid|
        {
          exercise_id: eid,
          exercise_name: names[eid],
          max_weight: maxes[eid] || 0,
          total_sets: sets[eid] || 0,
          total_reps: reps[eid] || 0
        }
      end.sort_by { |h| -h[:max_weight].to_f }
    end
  end
end
