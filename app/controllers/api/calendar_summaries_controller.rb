class Api::CalendarSummariesController < ApplicationController
  before_action :authenticate_user!

  def index
    start_date = parse_date(params[:start])
    end_date   = parse_date(params[:end])

    return head :bad_request if invalid_range?(start_date, end_date)

    render json: { summaries: build_summaries(start_date, end_date) }
  end

  private

  def invalid_range?(start_date, end_date)
    start_date.nil? || end_date.nil? || start_date > end_date
  end

  def build_summaries(start_date, end_date)
    workout_map  = workout_map_for(start_date, end_date)
    cardio_dates = cardio_dates_for(start_date, end_date)

    summaries = []
    d = start_date

    while d <= end_date
      key = d.to_s
      workout_id = workout_map[key]

      summaries << {
        date: key,
        has_workout: workout_id.present?,
        workout_id: workout_id,
        has_cardio: cardio_dates.include?(key)
      }

      d += 1.day
    end

    summaries
  end

  def workout_map_for(start_date, end_date)
    current_user.workouts
      .where(workout_date: start_date..end_date)
      .select(:id, :workout_date)
      .each_with_object({}) do |w, h|
        h[w.workout_date.to_s] = w.id
      end
  end

  def cardio_dates_for(start_date, end_date)
    current_user.cardio_workouts
      .where(performed_on: start_date..end_date)
      .pluck(:performed_on)
      .to_set(&:to_s)
  end

  def parse_date(value)
    return nil if value.blank?

    Date.parse(value)
  rescue ArgumentError
    nil
  end
end
