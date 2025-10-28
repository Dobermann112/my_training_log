require 'rails_helper'

RSpec.describe "Workouts", type: :request do
  let!(:user) { create(:user) }
  let(:valid_attributes) { { workout_date: Date.current } }
  let(:update_params) { { notes: "updated" } }

  before { sign_in user }

  describe "GET /index" do
    it "returns http success" do
      get workouts_path
      expect(response).to have_http_status(:success)
    end
  end

  describe "GET /new" do
    it "returns http success" do
      get new_workout_path
      expect(response).to have_http_status(:success)
    end
  end

  describe "POST /create" do
    it "creates a workout and redirects" do
      expect {
        post workouts_path, params: { workout: valid_attributes }
      }.to change(Workout, :count).by(1)
      expect(response).to redirect_to(workout_path(Workout.last))
    end
  end

  describe "GET /show" do
    it "returns http success" do
      workout = create(:workout, user: user)
      get workout_path(workout)
      expect(response).to have_http_status(:success)
    end
  end

  describe "GET /edit" do
    it "returns http success" do
      workout = create(:workout, user: user)
      get edit_workout_path(workout)
      expect(response).to have_http_status(:success)
    end
  end

  describe "PATCH /update" do
    it "updates a workout and redirects" do
      workout = create(:workout, user: user)
      patch workout_path(workout), params: { workout: update_params }
      expect(response).to redirect_to(workout_path(workout))
    end
  end

  describe "DELETE /destroy" do
    it "destroys a workout and redirects" do
      workout = create(:workout, user: user)
      expect {
        delete workout_path(workout)
      }.to change(Workout, :count).by(-1)
      expect(response).to redirect_to(workouts_path)
    end
  end
end
