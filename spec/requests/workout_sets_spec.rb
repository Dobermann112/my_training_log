require 'rails_helper'

RSpec.describe "WorkoutSets", type: :request do
  describe "GET /new" do
    it "returns http success" do
      get "/workout_sets/new"
      expect(response).to have_http_status(:success)
    end
  end

  describe "GET /create" do
    it "returns http success" do
      get "/workout_sets/create"
      expect(response).to have_http_status(:success)
    end
  end

  describe "GET /edit" do
    it "returns http success" do
      get "/workout_sets/edit"
      expect(response).to have_http_status(:success)
    end
  end

  describe "GET /update" do
    it "returns http success" do
      get "/workout_sets/update"
      expect(response).to have_http_status(:success)
    end
  end

  describe "GET /destroy" do
    it "returns http success" do
      get "/workout_sets/destroy"
      expect(response).to have_http_status(:success)
    end
  end

end
