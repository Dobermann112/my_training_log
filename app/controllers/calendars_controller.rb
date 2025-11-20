class CalendarsController < ApplicationController
  before_action :authenticate_user!

  def index
    @today = Date.current

    @today_workout = current_user.workouts
      .includes(workout_sets: :exercise)
      .find_by(workout_date: @today)

    load_events
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
