class Api::CalendarSummariesController < ApplicationController
  before_action :authenticate_user!

  def index
    start_date = parse_date(params[:start])
    end_date   = parse_date(params[:end])

    return head :bad_request if start_date.nil? || end_date.nil?
    return head :bad_request if start_date > end_date

    # workout_date -> workout_id のMapを作る（1日1 workout前提でないなら last を優先などにする）
    workouts = current_user.workouts
      .where(workout_date: start_date..end_date)
      .select(:id, :workout_date)

    workout_map = workouts.each_with_object({}) do |w, h|
      h[w.workout_date.to_s] = w.id
    end

    # performed_on -> true のSetを作る（1日1 cardioWorkout 前提）
    cardio_dates = current_user.cardio_workouts
      .where(performed_on: start_date..end_date)
      .pluck(:performed_on)
      .map(&:to_s)
      .to_set

    # 期間内の日付を全部埋めて返す（FullCalendarで扱いやすい）
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

    render json: { summaries: summaries }
  end

  private

  def parse_date(value)
    return nil if value.blank?
    Date.parse(value)
  rescue ArgumentError
    nil
  end
end
