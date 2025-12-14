class Users::OmniauthCallbacksController < Devise::OmniauthCallbacksController
  def google_oauth2
    Rails.logger.info request.env["omniauth.auth"]
    head :ok
  end
end
