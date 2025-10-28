class ExercisesController < ApplicationController
  before_action :set_body_part
  before_action :set_exercise, only: [:edit, :update, :destroy]
  before_action :authorize_exercise!, only: [:edit, :update, :destroy]

  def index
    @exercises = Exercise.for_user(current_user).where(body_part: @body_part).includes(:body_part)
  end

  def new
    @exercise = @body_part.exercises.build
  end

  def edit; end

  def create
    @exercise = @body_part.exercises.build(exercise_params)
    # current_user がいればカスタム種目扱いに
    @exercise.user = current_user if user_signed_in?
    @exercise.is_default = false if @exercise.user.present?

    if @exercise.save
      redirect_to body_part_exercises_path(@body_part), notice: "種目を登録しました。"
    else
      render :new, status: :unprocessable_entity
    end
  end

  def update
    if @exercise.update(exercise_params)
      redirect_to body_part_exercises_path(@body_part), notice: "種目を更新しました。"
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    @exercise.destroy
    redirect_to body_part_exercises_path(@body_part), notice: "種目を削除しました。"
  end

  private

  def set_body_part
    @body_part = BodyPart.find(params[:body_part_id])
  end

  def set_exercise
    @exercise = Exercise.for_user(current_user).where(body_part: @body_part).find(params[:id])
  end

  def authorize_exercise!
    # 他人のカスタム・既定は編集・削除できないようにする
    redirect_to body_part_exercise_path(@body_part), alert: "権限がありません。" unless @exercise.user.nil? || @exercise.user == current_user
  end

  def exercise_params
    params.require(:exercise).permit(:name)
  end
end
