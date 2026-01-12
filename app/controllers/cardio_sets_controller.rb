class CardioSetsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_cardio_workout

  def edit_group
    @sets = @cardio_workout.cardio_sets.order(:set_number)
  end

  def update_group
    result = CardioSetUpdateService.new(
      cardio_workout: @cardio_workout,
      sets_params: params[:sets]
    ).call

    if result.cardio_workout_deleted?
      redirect_to calendars_path
    else
      redirect_to redirect_path_for(@cardio_workout.performed_on)
    end
  rescue CardioSetUpdateService::UpdateError => e
    flash.now[:alert] = e.message
    edit_group
    render :edit_group, status: :unprocessable_entity
  end

  def destroy
    set = @cardio_workout.cardio_sets.find(params[:id])

    result = CardioSetDeleteService.call(
      cardio_workout: @cardio_workout,
      set: set
    )

    if result.cardio_workout_deleted?
      redirect_to calendars_path
    else
      redirect_to redirect_path_for(@cardio_workout.performed_on)
    end
  end

  private

  def set_cardio_workout
    @cardio_workout = current_user.cardio_workouts.find(params[:cardio_workout_id])
  end

  def redirect_path_for(date)
    workout = current_user.workouts.find_by(workout_date: date)
    workout ? workout_path(workout) : by_date_workouts_path(date: date)
  end
end
