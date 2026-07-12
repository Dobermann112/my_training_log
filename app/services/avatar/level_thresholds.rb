module Avatar
  class LevelThresholds
    LEVELS = [
      { min_point: 0,   level: "base" },
      { min_point: 300, level: "level_3" },
      { min_point: 700, level: "level_7" }
    ].freeze

    def self.level_for(point)
      current_level(point)[:level]
    end

    # 現在tierの中で次tierまでの進捗率(0.0〜1.0)と次tier名を返す。
    # 最終tier到達時は progress: 1.0, next_level: nil を返す。
    def self.progress_for(point)
      current = current_level(point)
      next_level = LEVELS[LEVELS.index(current) + 1]

      return { level: current[:level], progress: 1.0, next_level: nil } unless next_level

      span = next_level[:min_point] - current[:min_point]
      progress = [(point - current[:min_point]).to_f / span, 1.0].min

      { level: current[:level], progress: progress.round(2), next_level: next_level[:level] }
    end

    def self.current_level(point)
      LEVELS.reverse.find { |l| point >= l[:min_point] }
    end
    private_class_method :current_level
  end
end
