class Api::EventsController < ApplicationController
  before_action :authenticate_user!

  def index
    start_date = params[:start]
    end_date = params[:end]

    return head :bad_request if start_date.blank? || end_date.blank?

    # Workout が存在する日だけをイベントとして返却する
    workouts = current_user.workouts.where(workout_date: start_date..end_date).order(:workout_date)

    events = workouts.map do |w|
      { id: w.id, title: "Training", start: w.workout_date.to_s, end: nil, body_part: nil }
    end

    render json: events
  end
end
