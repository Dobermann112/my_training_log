class Stats::CardioGraphsController < ApplicationController
  before_action :authenticate_user!

  def index
    render json: build_graph_data
  end

  private

  def build_graph_data
    range  = params[:range].presence_in(%w[week month year]) || "month"
    period = build_period(range)
    limit  = params[:limit].presence&.to_i || 10

    {
      period: period_info(period, range),
      summary: summary_data(period),
      line_duration: duration_chart(period),
      line_distance: distance_chart(period),
      bar_by_exercise: exercise_chart(period, limit)
    }
  end

  def build_period(range)
    case range
    when "week"  then 6.days.ago.to_date..Date.current
    when "year"  then 11.months.ago.to_date..Date.current
    else              29.days.ago.to_date..Date.current
    end
  end

  def summary_data(period)
    Stats::Cardio::Summary.call(user: current_user, period: period)
  end

  def duration_chart(period)
    Stats::Cardio::DailyDuration.call(user: current_user, period: period)
  end

  def distance_chart(period)
    Stats::Cardio::DailyDistance.call(user: current_user, period: period)
  end

  def exercise_chart(period, limit)
    Stats::Cardio::Exercise.call(user: current_user, period: period, limit: limit)
  end

  def period_info(period, range)
    { from: period.first, to: period.last, range: range }
  end
end
