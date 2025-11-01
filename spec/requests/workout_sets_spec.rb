require 'rails_helper'

RSpec.describe "WorkoutSets", type: :request do
  let(:user) { create(:user) }
  let(:workout) { create(:workout, user: user) }
  let(:exercise) { create(:exercise) }

  before { sign_in user }

  describe "POST /workouts/:workout_id/workout_sets" do
    it "新しいセットを作成できること" do
      expect {
        post workout_workout_sets_path(workout), params: {
          workout_set: { exercise_id: exercise.id, weight: 40, reps: 10 }
        }
      }.to change(WorkoutSet, :count).by(1)
      expect(response).to redirect_to(workout_path(workout))
    end
  end

  describe "PATCH /workouts/:workout_id/workout_sets/:id" do
    let!(:workout_set) { create(:workout_set, workout: workout, exercise: exercise, weight: 50, reps: 8) }

    it "セット内容を更新できること" do
      patch workout_workout_set_path(workout, workout_set), params: {
        workout_set: { weight: 60 }
      }
      expect(response).to redirect_to(workout_path(workout))
      expect(workout_set.reload.weight).to eq(60)
    end
  end

  describe "DELETE /workouts/:workout_id/workout_sets/:id" do
    let!(:workout_set) { create(:workout_set, workout: workout, exercise: exercise) }

    it "セットを削除できること" do
      expect {
        delete workout_workout_set_path(workout, workout_set)
      }.to change(WorkoutSet, :count).by(-1)
      expect(response).to redirect_to(workout_path(workout))
    end
  end
end
