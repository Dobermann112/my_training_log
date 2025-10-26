class WorkoutsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_workout, only: [:show, :edit, :update, :destroy]

  def index
    @workouts = current_user.workouts.order(workout_date: :desc)
  end

  def show
  end

  def new
    @workout = current_user.workouts.new
  end

  def create
    @workout = current_user.workouts.new(workout_params)
    if @workout.save
      redirect_to @workout, notice: "トレーニングセッションを作成しました。"
    else
      flash.now[:alert] = "作成に失敗しました。"
      render :new, status: :unprocessable_entity
    end
  end

  def edit
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

  private

  def set_workout
    @workout = current_user.workouts.find(params[:id])
  end

  def workout_params
    params.require(:workout).permit(:workout_date, :notes)
  end
end
