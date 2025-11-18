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
    @exercise = Exercise.find_by(id: params[:exercise_id])

    unless @exercise
      redirect_to select_exercise_workouts_path(date: params[:date]),
      alert: "種目が選択されていません"
      return
    end

    @workout = current_user.workouts.new(workout_date: params[:date])

    render :sets_form
  end

  def edit; end

  def create
    @workout = WorkoutCreationService.new(
      user: current_user,
      date: params[:workout][:workout_date],
      exercise_id: params[:exercise_id],
      sets_params: params[:workout][:sets]
    ).call
  
    redirect_to @workout, notice: "トレーニングを記録しました。"
  rescue WorkoutCreationService::CreationError => e
    flash.now[:alert] = e.message
    @exercise = Exercise.find_by(id: params[:exercise_id])
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
