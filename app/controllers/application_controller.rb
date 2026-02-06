class ApplicationController < ActionController::Base
  before_action :configure_permitted_parameters, if: :devise_controller?

  MAIL_DELIVERY_ERRORS = [
    Net::SMTPAuthenticationError,
    Net::SMTPFatalError,
    Net::SMTPServerBusy,
    Net::SMTPSyntaxError,
    SocketError,
    Timeout::Error
  ].freeze

  rescue_from(*MAIL_DELIVERY_ERRORS) do |e|
    Rails.logger.error("[MailDelivery] failed: #{e.class} #{e.message}")

    # Devise のパスワードリセット等、メール送信が必要な画面で 500 を避ける
    redirect_back(
      fallback_location: unauthenticated_root_path,
      alert: "現在メール送信ができません。時間をおいて再度お試しください。"
    )
  end

  protected

  def after_sign_out_path_for(_resource_or_scope)
    new_user_session_path
  end

  def configure_permitted_parameters
    added = [:name, :gender, :goal, :email, :password, :password_confirmation]
    devise_parameter_sanitizer.permit(:sign_up,        keys: added)
    devise_parameter_sanitizer.permit(:account_update, keys: added + [:current_password])
  end
end
