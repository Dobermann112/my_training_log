class CalendarsController < ApplicationController
  def index
    @workouts = Workout.where(user: current_user)

    respond_to do |format|
      format.html # index.html.erb
      format.json do
        render json: @workouts.map { |w|
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
