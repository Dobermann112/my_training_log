class WorkoutSetsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_workout
  before_action :authorize_user!
  before_action :set_exercise, only: [:edit_group, :update_group]

  def edit_group
    @exercise = Exercise.find(params[:exercise_id])
    @sets = @workout.workout_sets.where(exercise_id: @exercise.id).order(:created_at)
  end

  def update
    workout_set = @workout.workout_sets.find(params[:id])
  
    result = WorkoutSets::UpdateOneService.call(
      workout_set: workout_set,
      params: workout_set_params
    )
  
    respond_to do |format|
      format.html do
        if result.success?
          redirect_to workout_path(@workout), notice: "セットを更新しました"
        else
          flash.now[:alert] = result.errors.join(", ")
          render workout_path(@workout), status: :unprocessable_entity
        end
      end
  
      format.turbo_stream do
        if result.success?
          render turbo_stream: turbo_stream.replace(
            dom_id(workout_set),
            partial: "workout_sets/set",
            locals: { set: workout_set }
          )
        else
          render turbo_stream: turbo_stream.replace(
            "set_form_errors",
            partial: "shared/form_errors",
            locals: { message: result.errors.join(", ") }
          ), status: :unprocessable_entity
        end
      end

      format.json do
        if result.success?
          render json: { status: "ok" }, status: :ok
        else
          render json: { errors: result.errors }, status: :unprocessable_entity
        end
      end
    end
  end  

  def update_group
    WorkoutSetUpdateService.new(
      workout: @workout,
      exercise: @exercise,
      sets_params: params[:sets]
    ).call
  
    respond_to do |format|
      format.html do
        redirect_to @workout, notice: "セット内容を更新しました。"
      end
  
      format.turbo_stream do
        redirect_to @workout
      end
    end
  rescue StandardError => e
    respond_to do |format|
      format.html do
        flash.now[:alert] = "更新に失敗しました: #{e.message}"
        edit_group
        render :edit_group, status: :unprocessable_entity
      end
  
      format.turbo_stream do
        render turbo_stream: turbo_stream.replace(
          "set_form_errors",
          partial: "shared/form_errors",
          locals: { message: e.message }
        ), status: :unprocessable_entity
      end
    end
  end  

  def destroy
    @workout_set = @workout.workout_sets.find(params[:id])
  
    if @workout_set.destroy
      respond_to do |format|
        format.html do
          redirect_to workout_path(@workout), notice: "セットを削除しました"
        end
  
        format.turbo_stream do
          @exercise_sets = @workout.workout_sets
                                  .includes(:exercise)
                                  .order(:exercise_id, :created_at)
                                  .group_by(&:exercise)
  
          render turbo_stream: [
            turbo_stream.replace(
              "workout_sets",
              partial: "workouts/exercise_sets",
              locals: { exercise_sets: @exercise_sets, workout: @workout }
            ),
            turbo_stream.update("set_form_errors", "")
          ]
        end
      end
    else
      respond_to do |format|
        format.html do
          redirect_to workout_path(@workout), alert: "セット削除に失敗しました"
        end
  
        format.turbo_stream do
          render turbo_stream: turbo_stream.replace(
            "set_form_errors",
            partial: "shared/form_errors",
            locals: { message: "セット削除に失敗しました" }
          ), status: :unprocessable_entity
        end
      end
    end
  end  

  private

  def workout_set_params
    params.require(:workout_set).permit(:weight, :reps, :memo)
  end

  def set_workout
    @workout = current_user.workouts.find(params[:workout_id])
  end

  def set_exercise
    @exercise = Exercise.find(params[:exercise_id])
  end

  def authorize_user!
    redirect_to root_path, alert: "権限がありません" unless current_user == @workout.user
  end
end
