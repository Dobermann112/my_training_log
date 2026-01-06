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

    def avatar_data
      AvatarPartStat.avatar_parts.keys.each_with_object({}) do |part, result|
        stat = avatar_stats[part]

        result[part] =
          if stat
            Avatar::ScoreDecayService.new(stat).call
          else
            0
          end
      end
    end
  end
end
