module Api
  class AvatarsController < ApplicationController
    before_action :authenticate_user!

    def show
      render json: avatar_data
    end

    private

    def avatar_data
      # 次ステップで実装
    end
  end
end
