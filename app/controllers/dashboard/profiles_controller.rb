module Dashboard
  class ProfilesController < ApplicationController
    def index
      @user = current_user
      render "users/show"
    end
  end
end
