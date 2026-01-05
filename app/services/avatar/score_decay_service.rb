module Avatar
  class ScoreDecayService
    def initialize(avatar_part_stat)
      @avatar_part_stat = avatar_part_stat
    end

    def call
      apply_decay!
    end

    private

    attr_reader :avatar_part_stat

    def elapsed_days
      return 0 if avatar_part_stat.last_trained_at.nil?

      ((Time.current - avatar_part_stat.last_trained_at) / 1.day).floor
    end

    def decay_amount
      elapsed_days
    end

    def apply_decay!
      return if decay_amount <= 0

      new_point = [avatar_part_stat.point - decay_amount, 0].max

      avatar_part_stat.update!(
        point: new_point,
        last_trained_at: Time.current
      )
    end
  end
end
