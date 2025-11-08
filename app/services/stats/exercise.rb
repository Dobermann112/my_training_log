module Stats
  class Exercise < Base
    # 戻り値: [{exercise_id:, exercise_name:, max_weight:, total_sets:, total_reps:}, ...]
    def call
      rel = sets_scope.includes(:exercise)
      grouped = rel.group(:exercise_id)
      maxes   = grouped.maximum(:weight)
      sets    = grouped.count
      reps    = grouped.sum(:reps)

      exercise_names = Exercise.where(id: maxes.keys | sets.keys | reps.keys)
                               .pluck(:id, :name).to_h

      (maxes.keys | sets.keys | reps.keys).map do |eid|
        {
          exercise_id:   eid,
          exercise_name: exercise_names[eid],
          max_weight:    maxes[eid] || 0,
          total_sets:    sets[eid]  || 0,
          total_reps:    reps[eid]  || 0
        }
      end.sort_by { |h| -h[:max_weight].to_f }
    end
  end
end
