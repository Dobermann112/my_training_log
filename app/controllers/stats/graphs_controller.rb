class Stats::GraphsController < ApplicationController
  before_action :authenticate_user!

  def index
    range = params[:range].presence_in(%w[week month year]) || "month"
    period = case range
             when "week"  then 6.days.ago.to_date..Date.current
             when "year"  then 11.months.ago.to_date..Date.current
             else               29.days.ago.to_date..Date.current
             end

    # まずは形だけ（後で #33 のサービスに接続）
    render json: {
      period: { from: period.first, to: period.last, range: range },
      line_daily_volume: [],         # [{x: "2025-11-01", y: 1234}, ...]
      pie_by_body_part: [],          # [{label: "胸", value: 1234}, ...]
      bar_recent_workouts: []        # [{x: "2025-11-01", y: 1234}, ...]
    }
  end
end
