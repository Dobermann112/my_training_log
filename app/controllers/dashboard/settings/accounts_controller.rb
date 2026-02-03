module Dashboard
  module Settings
    class AccountsController < ApplicationController
      before_action :authenticate_user!

      def show
      end

      def update_email
        if current_user.update_with_password(email_params)
          redirect_to dashboard_setting_path, notice: "メールアドレスを変更しました。"
        else
          flash.now[:alert] = "入力内容に誤りがあります"
          render :show, status: :unprocessable_entity
        end
      end

      def update_password
        if current_user.update_with_password(password_params)
          sign_in(current_user, bypass: true)
          redirect_to dashboard_setting_path, notice: "パスワードを変更しました。"
        else
          flash.now[:alert] = "入力内容に誤りがあります"
          render :show, status: :unprocessable_entity
        end
      end

      private

      def email_params
        params.require(:user).permit(:email, :current_password)
      end

      def password_params
        params.require(:user).permit(:password, :password_confirmation, :current_password)
      end
    end
  end
end
