class WorkoutsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_workout, only: [:show, :destroy]

  def show
    @exercise_sets = @workout.workout_sets.includes(:exercise).order(:exercise_id, :created_at).group_by(&:exercise)
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

  def create
    workout = WorkoutCreationService.new(
      user: current_user,
      date: params[:workout][:workout_date],
      exercise_id: params[:exercise_id],
      sets_params: params[:workout][:sets]
    ).call

    redirect_to workout_path(workout)
  rescue WorkoutCreationService::CreationError => e
    flash.now[:alert] = e.message
    @exercise = Exercise.find(params[:exercise_id])
    render :sets_form, status: :unprocessable_entity
  end

  def destroy
    @workout.destroy
    redirect_to calendars_path, notice: "トレーニング記録を削除しました。"
  end

  def select_exercise
    @date = params[:date]
    @body_parts = BodyPart.order(:display_order)
    exercises = Exercise.includes(:body_part)
    @exercises_by_part = exercises.group_by(&:body_part)
  end

  private

  def set_workout
    @workout = current_user.workouts.find(params[:id])
  end
end
