class WorkoutSetsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_workout
  before_action :authorize_user!
  before_action :set_exercise, only: [:edit_group, :update_group]

  def edit_group
    @sets = @workout.workout_sets
                    .where(exercise_id: @exercise.id)
                    .order(:created_at)
  end

  def update_group
    WorkoutSetUpdateService.new(
      workout: @workout,
      exercise: @exercise,
      sets_params: params[:sets]
    ).call

    redirect_to workout_path(@workout)
  rescue WorkoutSetUpdateService::UpdateError => e
    flash.now[:alert] = e.message
    edit_group
    render :edit_group, status: :unprocessable_entity
  end

  def destroy
    set = @workout.workout_sets.find(params[:id])
    set.destroy!

    redirect_to workout_path(@workout), notice: "セットを削除しました"
  end

  private

  def set_workout
    @workout = current_user.workouts.find(params[:workout_id])
  rescue ActiveRecord::RecordNotFound
    redirect_to calendars_path, alert: "このトレーニングは削除されました"
  end

  def set_exercise
    @exercise = Exercise.find(params[:exercise_id])
  end

  def authorize_user!
    redirect_to root_path, alert: "権限がありません" unless current_user == @workout.user
  end
end
