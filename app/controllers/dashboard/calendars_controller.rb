module Dashboard
  class CalendarsController < ApplicationController
    before_action :authenticate_user!

    def index
      @today = Date.current

      @today_workout = current_user.workouts
        .includes(workout_sets: :exercise)
        .find_by(workout_date: @today)

      render "calendars/index"
    end
  end
end
