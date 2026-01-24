class WorkoutsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_workout, only: [:show, :destroy]

  def show
    @date = @workout.workout_date
    load_training_sets
  end

  def by_date
    @date = params[:date]
    @workout = current_user.workouts.find_by(workout_date: @date)
    load_training_sets
    render :show
  end

  def new
    @exercise = current_user.exercises.find_by(id: params[:exercise_id])

    unless @exercise
      redirect_to select_exercise_workouts_path(date: params[:date]),
                  alert: "種目が選択されていません"
      return
    end

    @workout = current_user.workouts.new(workout_date: params[:date])

    set_previous_sets

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
    @exercise = current_user.exercises.find(params[:exercise_id])
    render :sets_form, status: :unprocessable_entity
  end

  def destroy
    @workout.destroy
    redirect_to calendars_path, notice: "トレーニング記録を削除しました。"
  end

  def destroy_by_date
    Workout.where(user: current_user, workout_date: params[:date]).destroy_all
    CardioWorkout.where(user: current_user, performed_on: params[:date]).destroy_all

    redirect_to calendars_path, notice: "トレーニングを削除しました"
  end

  def select_exercise
    @date = params[:date]
    @body_parts = BodyPart.order(:display_order)
    exercises = Exercise.for_user(current_user).includes(:body_part)
    @exercises_by_part = exercises.group_by(&:body_part)
  end

  private

  def set_workout
    @workout = current_user.workouts.find_by(id: params[:id])
  end

  def load_training_sets
    @strength_sets =
      WorkoutSet
      .joins(:workout)
      .where(workouts: { user_id: current_user.id, workout_date: @date })
      .includes(:exercise)
      .order(:exercise_id, :created_at)
      .group_by(&:exercise)

    @cardio_workout =
      CardioWorkout.find_by(user_id: current_user.id, performed_on: @date)

    @cardio_sets_by_exercise =
      CardioSet
        .joins(:cardio_workout)
        .where(cardio_workouts: { user_id: current_user.id, performed_on: @date })
        .includes(:exercise)
        .order(:exercise_id, :set_number)
        .group_by(&:exercise)
  end

  def set_previous_sets
    previous_set = WorkoutSet
      .joins(:workout)
      .where(exercise_id: @exercise.id)
      .where(workouts: { user_id: current_user.id })
      .where.not(workouts: { workout_date: params[:date] })
      .order("workouts.workout_date DESC, workouts.created_at DESC")
      .first

    return unless previous_set

    @previous_workout = previous_set.workout
    @previous_sets = @previous_workout
      .workout_sets
      .where(exercise_id: @exercise.id)
      .order(:created_at)
  end
end
