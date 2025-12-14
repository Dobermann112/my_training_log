class Users::OmniauthCallbacksController < ApplicationController

  def google_oauth2
    Rails.logger.info request.env["omniauth.auth"]
    head :ok
  end
end
