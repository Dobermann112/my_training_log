class CalendarsController < ApplicationController
  def index
    @workouts = current_user.workouts.select(:id, :workout_date)

    respond_to do |format|
      format.html
      format.json do
        render json: @workouts.map { |w|
          {
            title: "Workout",
            start: w.workout_date,
            url: workout_path(w)
          }
        }
      end
    end
  end
end
