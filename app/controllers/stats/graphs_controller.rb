class Stats::GraphsController < ApplicationController
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
      line_daily_volume: daily_volume_chart(period),
      pie_by_body_part: body_part_chart(period),
      bar_by_exercise:  exercise_chart(period, limit)
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
    Stats::Summary.call(user: current_user, period: period)
  end

  def daily_volume_chart(period)
    Stats::DailyVolume.call(user: current_user, period: period)
  end

  def body_part_chart(period)
    Stats::BodyPart.call(user: current_user, period: period).map do |bp|
      { label: bp[:body_part_name], value: bp[:sets] }
    end
  end

  def exercise_chart(period, limit)
    Stats::Exercise.call(user: current_user, period: period, limit: limit).map do |ex|
      { x: ex[:exercise_name], y: ex[:total_sets] }
    end
  end

  def period_info(period, range)
    { from: period.first, to: period.last, range: range }
  end
end
