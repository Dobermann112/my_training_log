class WorkoutSetsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_workout
  before_action :authorize_user!
  before_action :set_exercise_by_part, only: [:new, :edit]

  def new
    @workout_set = @workout.workout_sets.new
  end

  def edit
    @workout_set = @workout.workout_sets.find(params[:id])
  end

  def create
    @workout_set = @workout.workout_sets.new(workout_set_params)
    if @workout_set.save
      redirect_to workout_path(@workout), notice: "セットを追加しました"
    else
      render :new, status: :unprocessable_entity
    end
  end

  def update
    @workout_set = @workout.workout_sets.find(params[:id])
    if @workout_set.update(workout_set_params)
      redirect_to workout_path(@workout), notice: "セットを更新しました"
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    @workout_set = @workout.workout_sets.find(params[:id])
    @workout_set.destroy
    redirect_to workout_path(@workout), notice: "セットを削除しました"
  end

  private

  def set_workout
    @workout = Workout.find(params[:workout_id])
  end

  def authorize_user!
    redirect_to root_path, alert: "権限がありません" unless current_user == @workout.user
  end

  def set_exercise_by_part
    @exercise_by_part = Exercise.includes(:body_part)
                                .group_by(&:body_part)
  end

  def workout_set_params
    params.require(:workout_set).permit(:exercise_id, :weight, :reps, :memo)
  end
end
