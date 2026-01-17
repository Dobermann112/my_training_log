class CardioWorkoutsController < ApplicationController
  before_action :authenticate_user!

  def new
    @exercise = current_user.exercises.find(params[:exercise_id])
    @date = params[:date]
    @cardio_workout = CardioWorkout.new(performed_on: @date)
    @cardio_set = @cardio_workout.cardio_sets.build
  end

  def create
    cardio_workout = CardioWorkoutCreationService.new(
      user: current_user,
      exercise_id: params[:exercise_id],
      date: params[:performed_on],
      sets_params: params[:sets]
    ).call
      
    redirect_to redirect_path_for(cardio_workout.performed_on),
                notice: "有酸素トレーニングを記録しました"
  rescue CardioWorkoutCreationService::CreationError => e
    @exercise = Exercise.for_user(current_user).find(params[:exercise_id])
    @date     = params[:performed_on]
    flash.now[:alert] = e.message
    render :new, status: :unprocessable_entity
  end      

  private

  def cardio_workout_params
    params.permit(:exercise_id, :performed_on)
  end

  def cardio_set_params
    params.require(:cardio_set).permit(
      :distance,
      :duration,
      :calories,
      :pace,
      :memo
    )
  end

  def redirect_path_for(date)
    workout = current_user.workouts.find_by(workout_date: date)
    if workout
      workout_path(workout)
    else
      # show は date 表示が可能なので id はダミーにしない
      by_date_workouts_path(date: date) # もしくは show を date 対応にしているなら適宜
    end
  end
end
