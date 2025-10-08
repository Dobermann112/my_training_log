class ApplicationController < ActionController::Base
    before_action :configure_permitted_parameters, if: :devise_controller?

    protected

    def after_sign_out_path_for(resource_or_scope)
      new_user_session_path
    end
    
  
    def configure_permitted_parameters
      added = [:name, :gender, :goal, :email, :password, :password_confirmation]
      devise_parameter_sanitizer.permit(:sign_up,        keys: added)
      devise_parameter_sanitizer.permit(:account_update, keys: added + [:current_password])
    end  
end
