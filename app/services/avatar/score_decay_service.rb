# app/services/avatar/score_decay_service.rb
module Avatar
  class ScoreDecayService
    DECAY_PER_DAY = 5

    def initialize(avatar_part_stat)
      @avatar_part_stat = avatar_part_stat
    end

    def call
      decayed_point
    end

    private

    attr_reader :avatar_part_stat

    def elapsed_days
      return 0 if avatar_part_stat.last_trained_at.nil?

      ((Time.current - avatar_part_stat.last_trained_at) / 1.day).floor
    end

    def decay_amount
      elapsed_days * DECAY_PER_DAY
    end

    def decayed_point
      [avatar_part_stat.point - decay_amount, 0].max
    end
  end
end
