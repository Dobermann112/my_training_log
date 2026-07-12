module Avatar
  class LevelThresholds
    # upper_body(胸/背中/肩/腕の4カテゴリ)に対し、core(腹)/lower_body(脚)は1カテゴリしかなく
    # 均等にトレーニングしてもpointの伸びが1/4程度になるため、閾値をカテゴリ比に合わせて調整する。
    LEVELS_BY_PART = {
      upper_body: [
        { min_point: 0,   level: "base" },
        { min_point: 300, level: "level_3" },
        { min_point: 700, level: "level_7" }
      ],
      core: [
        { min_point: 0,   level: "base" },
        { min_point: 75,  level: "level_3" },
        { min_point: 175, level: "level_7" }
      ],
      lower_body: [
        { min_point: 0,   level: "base" },
        { min_point: 75,  level: "level_3" },
        { min_point: 175, level: "level_7" }
      ]
    }.freeze

    def self.level_for(point, avatar_part)
      current_level(point, avatar_part)[:level]
    end

    # 現在tierの中で次tierまでの進捗率(0.0〜1.0)と次tier名を返す。
    # 最終tier到達時は progress: 1.0, next_level: nil を返す。
    def self.progress_for(point, avatar_part)
      levels = LEVELS_BY_PART.fetch(avatar_part.to_sym)
      current = current_level(point, avatar_part)
      next_level = levels[levels.index(current) + 1]

      return { level: current[:level], progress: 1.0, next_level: nil } unless next_level

      span = next_level[:min_point] - current[:min_point]
      progress = [(point - current[:min_point]).to_f / span, 1.0].min

      { level: current[:level], progress: progress.round(2), next_level: next_level[:level] }
    end

    def self.current_level(point, avatar_part)
      LEVELS_BY_PART.fetch(avatar_part.to_sym).reverse.find { |l| point >= l[:min_point] }
    end
    private_class_method :current_level
  end
end
