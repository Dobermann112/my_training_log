class UsersController < ApplicationController
  before_action :authenticate_user!

  def show
    @user = current_user
  end

  def edit
    @user = current_user
  end

  def update
    @user = current_user
    if @user.update(user_params)
      redirect_to dashboard_profile_path, notice: "プロフィールを更新しました"
    else
      flash.now[:alert] = "入力内容に誤りがあります"
      render "users/edit", status: :unprocessable_entity
    end
  end

  def update_email
    if current_user.update_with_password(email_params)
      redirect_to dashboard_profile_path, notice: "メールアドレスを変更しました。"
    else
      flash.now[:alert] = "入力内容に誤りがあります"
      render "users/account_edit", status: :unprocessable_entity
    end
  end

  def update_password
    if current_user.update_with_password(password_params)
      sign_in(current_user, bypass: true)
      redirect_to dashboard_profile_path, notice: "パスワードを変更しました。"
    else
      flash.now[:alert] = "入力内容に誤りがあります"
      render "users/account_edit", status: :unprocessable_entity
    end
  end

  private

  def user_params
    params.require(:user).permit(:name, :gender, :goal)
  end

  def email_params
    params.require(:user).permit(:email, :current_password)
  end

  def password_params
    params.require(:user).permit(:password, :password_confirmation, :current_password)
  end
end
