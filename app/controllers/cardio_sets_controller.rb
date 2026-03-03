class CardioSetsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_cardio_workout
  before_action :set_exercise, only: [:edit_group, :update_group]

  def edit_group
    @sets = @cardio_workout.cardio_sets
                           .where(exercise_id: @exercise.id)
                           .order(:set_number)
  end

  def update_group
    result = CardioSetUpdateService.new(
      cardio_workout: @cardio_workout,
      exercise: @exercise,
      sets_params: params[:sets]
    ).call

    if result.cardio_workout_deleted?
      redirect_to calendars_path
    else
      redirect_to redirect_path_for(@cardio_workout.performed_on),
                  notice: "有酸素トレーニングを更新しました。"
    end
  rescue CardioSetUpdateService::UpdateError => e
    flash.now[:alert] = e.message
    edit_group
    render :edit_group, status: :unprocessable_entity
  end

  def destroy
    set  = @cardio_workout.cardio_sets.find(params[:id])
    date = @cardio_workout.performed_on
    user = @cardio_workout.user

    CardioSetDeleteService.call(
      cardio_workout: @cardio_workout,
      set: set
    )

    workout = user.workouts.find_by(workout_date: date)

    cardio_exists =
      user.cardio_workouts
          .where(performed_on: date)
          .joins(:cardio_sets)
          .exists?

    if workout.present?
      redirect_to workout_path(workout), notice: "有酸素トレーニングセットを削除しました。"
    elsif cardio_exists
      redirect_to redirect_path_for(date), notice: "有酸素トレーニングセットを削除しました。"
    else
      redirect_to calendars_path, notice: "トレーニングを削除しました。"
    end
  end

  private

  def set_exercise
    @exercise = current_user.exercises.find(params[:exercise_id])
  end

  def set_cardio_workout
    @cardio_workout = current_user.cardio_workouts.find(params[:cardio_workout_id])
  end

  def redirect_path_for(date)
    workout = current_user.workouts.find_by(workout_date: date)
    workout ? workout_path(workout) : by_date_workouts_path(date: date)
  end
end
