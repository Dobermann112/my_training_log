require "rails_helper"

RSpec.describe "Workouts", type: :request do
  let!(:user) { create(:user) }

  before { sign_in user }

  describe "GET /index" do
    it "returns http success" do
      get workouts_path
      expect(response).to have_http_status(:success)
    end
  end

  describe "GET /show" do
    it "returns http success" do
      workout = create(:workout, user: user)
      get workout_path(workout)
      expect(response).to have_http_status(:success)
    end
  end

  describe "GET /new" do
    context "when params are valid" do
      it "renders sets_form template" do
        exercise = create(:exercise, user: user)
        get new_workout_path(exercise_id: exercise.id, date: Date.current)
        expect(response).to have_http_status(:success)
      end
    end

    context "when exercise_id がない場合" do
      it "select_exercise にリダイレクトされる" do
        get new_workout_path(date: Date.current)
        expect(response).to redirect_to(select_exercise_workouts_path(date: Date.current))
      end
    end
  end

  describe "PATCH /update" do
    it "updates workout and redirects" do
      workout = create(:workout, user: user)
      patch workout_path(workout), params: { workout: { notes: "updated" } }
      expect(response).to redirect_to(workout_path(workout))
      expect(workout.reload.notes).to eq("updated")
    end
  end

  describe "DELETE /destroy" do
    it "destroys workout and redirects" do
      workout = create(:workout, user: user)

      expect do
        delete workout_path(workout)
      end.to change(Workout, :count).by(-1)

      expect(response).to redirect_to(workouts_path)
    end
  end
end
