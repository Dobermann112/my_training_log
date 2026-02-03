module Dashboard
  module Settings
    class ProfilesController < ApplicationController
      before_action :authenticate_user!
      before_action :set_user

      def show
      end

      def edit
      end

      def update
        if @user.update(user_params)
          redirect_to dashboard_setting_path, notice: "プロフィールを更新しました"
        else
          flash.now[:alert] = "入力内容に誤りがあります"
          render :edit, status: :unprocessable_entity
        end
      end

      private

      def set_user
        @user = current_user
      end

      def user_params
        params.require(:user).permit(:name, :gender, :goal)
      end
    end
  end
end
