class CardioWorkoutsController < ApplicationController
  def new
    @exercise = Exercise.find(params[:exercise_id])
    @cardio_workout = CardioWorkout.new(
      exercise: @exercise,
      performed_on: params[:date]
    )
    @cardio_set = @cardio_workout.cardio_sets.build(set_number: 1)
  end

  def create
    @exercise = Exercise.find(cardio_workout_params[:exercise_id])

    @cardio_workout = CardioWorkout.new(
      user: current_user,
      exercise: @exercise,
      performed_on: cardio_workout_params[:performed_on]
    )

    @cardio_workout.cardio_sets.build(cardio_set_params.merge(set_number: 1))

    if @cardio_workout.save
      redirect_to workout_path(@workout), notice: "有酸素トレーニングを記録しました"
    else
      render :new, status: :unprocessable_entity
    end
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
end
