class CardioWorkoutsController < ApplicationController
  before_action :authenticate_user!

  def new
    @exercise = Exercise.find(params[:exercise_id])
    @date = params[:date]
    @cardio_workout = CardioWorkout.new(performed_on: @date, exercise: @exercise)
    @cardio_set = @cardio_workout.cardio_sets.build
  end

  def create
    exercise = Exercise.find(cardio_workout_params[:exercise_id])
    date     = cardio_workout_params[:performed_on]

    ActiveRecord::Base.transaction do
      cardio_workout =
        CardioWorkout.find_or_create_by!(
          user: current_user,
          exercise: exercise,
          performed_on: date
        )

      cardio_workout.cardio_sets.create!(
        cardio_set_params.merge(set_number: 1)
      )
    end

    redirect_to redirect_path_for(date),
                notice: "有酸素トレーニングを記録しました"
  rescue ActiveRecord::RecordInvalid => e
    @exercise = exercise
    @date = date
    @cardio_workout = CardioWorkout.new(
      user: current_user,
      exercise: @exercise,
      performed_on: @date
    )
    @cardio_set = @cardio_workout.cardio_sets.build(set_number: 1)

    flash.now[:alert] = e.message
    render :new, status: :unprocessable_entity
  end

  private

  def cardio_workout_params
    params.require(:cardio_workout).permit(
      :exercise_id,
      :performed_on
    )
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
