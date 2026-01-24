module Avatar
  class LevelThresholds
    LEVELS = [
      { min_point: 0,   level: "base" },
      { min_point: 300, level: "level_3" },
      { min_point: 700, level: "level_7" }
    ].freeze

    def self.level_for(point)
      LEVELS
        .reverse.find { |l| point >= l[:min_point] }[:level]
    end
  end
end
