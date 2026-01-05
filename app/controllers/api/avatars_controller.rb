module Api
  class AvatarsController < ApplicationController
    before_action :authenticate_user!

    def show
      render json: avatar_data
    end

    private

    def avatar_stats
      current_user.avatar_part_stats.index_by(&:avatar_part)
    end

    def apply_decay!(stats)
      stats.each_value do |stat|
        Avatar::ScoreDecayService.new(stat).call
      end
    end

    def avatar_data
      stats = avatar_stats
      apply_decay!(stats)

      AvatarPartStat.avatar_parts.keys.each_with_object({}) do |part, result|
        result[part] = stats[part]&.point || 0
      end
    end
  end
end
