class CalendarController < ApplicationController
  def index
    @workouts = Workout.where(user: current_user)

    respond_to |format|
      format.html # index.html.erb
      format.json do
        render json: @workout.map { |w|
          {
            title: "Workout",
            start: w.workout_date,
            url: Rails.application.routes.url_helpers.workout_path(w)
          }
        }
      end
    end
  end
end
