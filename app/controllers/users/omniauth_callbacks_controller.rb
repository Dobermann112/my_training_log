class Users::OmniauthCallbacksController < Devise::OmniauthCallbacksController
  def google_oauth2
    auth = request.env["omniauth.auth"]
    user = User.from_omniauth(auth)

    sign_in_and_redirect user, event: :authentication
  end
end
