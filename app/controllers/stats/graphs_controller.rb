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
    body_part_id = params[:body_part_id].presence

    {
      period: period_info(period, range),
      summary: summary_data(period, body_part_id),
      line_daily_volume: daily_volume_chart(period, body_part_id),
      pie_by_body_part: body_part_chart(period),
      bar_by_exercise: exercise_chart(period, body_part_id, limit)
    }
  end

  def build_period(range)
    case range
    when "week"  then 6.days.ago.to_date..Date.current
    when "year"  then 11.months.ago.to_date..Date.current
    else              29.days.ago.to_date..Date.current
    end
  end

  def summary_data(period, body_part_id = nil)
    Stats::Summary.call(user: current_user, period: period, body_part_id: body_part_id)
  end

  def daily_volume_chart(period, body_part_id = nil)
    Stats::DailyVolume.call(user: current_user, period: period, body_part_id: body_part_id)
  end

  def body_part_chart(period, body_part_id = nil)
    Stats::BodyPart.call(user: current_user, period: period, body_part_id: body_part_id).map do |bp|
      { label: bp[:body_part_name], value: bp[:sets] }
    end
  end

  def exercise_chart(period, limit, body_part_id = nil)
    Stats::Exercise.call(user: current_user, period: period, body_part_id: body_part_id, limit: limit).map do |ex|
      { x: ex[:exercise_name], y: ex[:total_sets] }
    end
  end

  def period_info(period, range)
    { from: period.first, to: period.last, range: range }
  end
end
