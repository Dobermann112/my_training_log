require 'rails_helper'

RSpec.describe "ChartsController", type: :request do
  let(:user) { create(:user) }

  before { sign_in user }

  describe "GET /stats/graphs" do
    context "when workout data exists" do
      before do
        workout = create(:workout, user: user, workout_date: Time.zone.today)
        create(:workout_set, workout: workout, weight: 60, reps: 10)
        create(:workout_set, workout: workout, weight: 50, reps: 12)
      end

      it "returns a successful response" do
        get "/stats/graphs", params: { range: "month" }
        expect(response).to have_http_status(:ok)
      end

      it "returns valid JSON structure" do
        get "/stats/graphs", params: { range: "month" }
        json = response.parsed_body

        expect(json).to include("period", "summary", "line_daily_volume", "pie_by_body_part", "bar_by_exercise")

        expect(json["summary"]).to include("total_sets", "total_reps", "streak_days")
        expect(json["line_daily_volume"]).to all(include("x", "y"))
        expect(json["pie_by_body_part"].first.keys).to contain_exactly("label", "value")
        expect(json["bar_by_exercise"].first.keys).to contain_exactly("x", "y")
      end
    end

    context "when no workout data exists" do
      it "returns empty arrays in chart data" do
        get "/stats/graphs", params: { range: "month" }
        json = response.parsed_body

        expect(json["line_daily_volume"]).to eq([])
        expect(json["pie_by_body_part"]).to eq([])
        expect(json["bar_by_exercise"]).to eq([])
      end
    end

    context "when not signed in" do
      before { sign_out user }

      it "redirects to login" do
        get "/stats/graphs"
        expect(response).to redirect_to(new_user_session_path)
      end
    end
  end
end
