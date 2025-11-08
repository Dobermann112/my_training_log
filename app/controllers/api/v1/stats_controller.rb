class Api::V1::StatsController < ApplicationController
  before_action :authenticate_user!

  def summary
    render_cached(:summary) { Stats::Summary.new(**ctx).call }
  end

  def exercises
    render_cached(:exercises) { Stats::Exercises.new(**ctx).call }
  end

  def body_parts
    render_cached(:body_parts) { Stats::BodyParts.new(**ctx).call }
  end

  private

  def ctx
    { user: current_user, from: params[:from], to: params[:to] }
  end

  # 軽いキャッシュ（同一ユーザー+条件10分）
  def render_cached(key)
    cache_key = ["stats", key, current_user.id, params.slice(:from, :to).to_h]
    payload = Rails.cache.fetch(cache_key, expires_in: 10.minutes) { yield }
    render json: payload
  end
end