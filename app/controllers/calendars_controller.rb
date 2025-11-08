class CalendarsController < ApplicationController
  before_action :authenticate_user!

  def index
    @events = load_events
  end

  private

  def load_events
    @workouts = current_user.workouts.select(:id, :workout_date)

    respond_to do |format|
      format.html
      format.json do
        render json: @workouts.map { |w|
          {
            id: w.id,
            title: "Training",
            start: w.workout_date,
            url: workout_path(w),
            color: "#3a86ff"
          }
        }
      end
    end
  end
end
