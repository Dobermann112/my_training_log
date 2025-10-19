class ExercisesController < ApplicationController
    before_action :set_body_part
    before_action :set_exercise, only: [:show, :edit, :update, :destroy]
  
    def index
      @exercises = @body_part.exercises
    end
  
    def new
      @exercise = @body_part.exercises.build
    end
  
    def create
      @exercise = @body_part.exercises.build(exercise_params)
      if @exercise.save
        redirect_to body_part_exercises_path(@body_part), notice: "種目を登録しました。"
      else
        render :new, status: :unprocessable_entity
      end
    end
  
    def edit; end
  
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
      @exercise = @body_part.exercises.find(params[:id])
    end
  
    def exercise_params
      params.require(:exercise).permit(:name, :description)
    end
  end