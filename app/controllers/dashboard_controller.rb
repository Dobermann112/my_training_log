class DashboardController < ApplicationController
  before_action :authenticate_user!

  def stats; end
end
