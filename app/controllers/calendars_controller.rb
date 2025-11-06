class CalendarsController < ApplicationController
  before_action :authenticate_user!

  def index
  end

  def events
    workouts = current_user.workouts.select(:id, :workout_date)
    events = workouts.map do |w|
      {
        title: "Training",
        start: w.workout_date
      }
    end
    render json: events
  end
end
