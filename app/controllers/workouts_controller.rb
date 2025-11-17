class WorkoutsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_workout, only: [:show, :edit, :update, :destroy]

  def index
    @workouts = current_user.workouts.order(workout_date: :desc)
  end

  def show
    @exercise_sets = @workout.workout_sets.includes(:exercise).order(:exercise_id, :created_at).group_by { |ws| ws.exercise }
  end

  def new
    @workout = current_user.workouts.new
    @workout.workout_date = params[:date]
    @exercise = Exercise.find_by(id: params[:exercise_id])

    render :sets_form
    
    unless @exercise
      redirect_to select_exercise_workouts_path(date: params[:date]),
                  alert: "種目が選択されていません"
      return
    end
  end
  

  def edit; end

  def create
    ActiveRecord::Base.transaction do
      @workout = current_user.workouts.create!( workout_date: params[:date], notes: "" )
      
      sets_params = params[:sets] || {}
      sets_params.each do |_idx, set_row|
        next if set_row[:weight].blank? && set_row[:reps].blank?

        @workout.workout_sets.create!(
          exercise_id: params[:exercise_id],
          weight: set_row[:weight],
          reps: set_row[:reps],
          memo: set_row[:memo]
        )
      end
    end

    redirect_to @workout, notice: "トレーニングを記録しました。"

  rescue => e
    flash.now[:alert] = "保存に失敗しました: #{e.message}"
    render :sets_form, status: :unprocessable_entity
  end

  def update
    if @workout.update(workout_params)
      redirect_to @workout, notice: "トレーニングセッションを更新しました。"
    else
      flash.now[:alert] = "更新に失敗しました。"
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    @workout.destroy
    redirect_to workouts_path, notice: "トレーニングセッションを削除しました。"
  end

  def select_exercise
    @date = params[:date]
    @exercises_by_part = Exercise.includes(:body_part).group_by(&:body_part)
  end

  private

  def set_workout
    @workout = current_user.workouts.find(params[:id])
  end

  def workout_params
    params.require(:workout).permit(:workout_date, :notes)
  end
end
