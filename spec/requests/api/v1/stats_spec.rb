require 'rails_helper'

RSpec.describe "Api::V1::Stats", type: :request do
  let(:user) { create(:user) }

  before { sign_in user }

  describe "GET /summary" do
    it "returns 200 with keys" do
      get "/api/v1/stats/summary"
      expect(response).to have_http_status(:ok)
      json = response.parsed_body
      expect(json.keys).to include("total_sets", "total_reps", "streak_days")
    end
  end

  describe "GET /exercises" do
    it "returns array" do
      get "/api/v1/stats/exercises"
      expect(response).to have_http_status(:ok)
      expect(response.parsed_body).to be_a(Array)
    end
  end

  describe "GET /body_parts" do
    it "returns array" do
      get "/api/v1/stats/body_parts"
      expect(response).to have_http_status(:ok)
      expect(response.parsed_body).to be_a(Array)
    end
  end
end
