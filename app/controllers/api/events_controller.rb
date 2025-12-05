class Api::EventsController < ApplicationController
  before_action :authenticate_user!

  def index
    year  = params[:year].to_i
    month = params[:month].to_i

    # year/month が来なかった場合の fallback
    date = Date.new(year.zero? ? Date.today.year : year,
                    month.zero? ? Date.today.month : month, 1)

    start_date = date.beginning_of_month
    end_date   = date.end_of_month

    # 今は仮データを返す（本番では Workout から引く）
    events = [
      { id: 1, start: start_date.to_s,         end: nil },
      { id: 2, start: (start_date + 5).to_s,   end: nil },
      { id: 3, start: (start_date + 12).to_s,  end: nil }
    ]

    render json: events
  end
end
