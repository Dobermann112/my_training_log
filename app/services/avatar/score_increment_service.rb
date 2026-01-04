module Avatar
  class ScoreIncrementService
    BODY_PART_TO_AVATAR_PART = {
      '胸' => :upper_body,
      '背中' => :upper_body,
      '肩' => :upper_body,
      '腕' => :upper_body,
      '腹' => :core,
      '脚' => :lower_body
    }.freeze

    def initialize(workout_set)
      @workout_set = workout_set
    end

    def call
      return unless should_increment?

      increment_point!
    end

    private

    attr_reader :workout_set

    def should_increment?
      workout_set.created_at == workout_set.updated_at
    end

    def increment_point!
      avatar_part_stat.increment!(:point, 1)
      avatar_part_stat.update!(last_trained_at: Time.current)
    end

    def avatar_part
      BODY_PART_TO_AVATAR_PART.fetch(body_part_name)
    end

    def body_part_name
      workout_set.exercise.body_part.name
    end

    def user
      workout_set.workout.user
    end

    def avatar_part_stat
      user.avatar_part_stats.find_or_create_by!(avatar_part: avatar_part)
    end
  end
end
