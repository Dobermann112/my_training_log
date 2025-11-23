require 'rails_helper'

RSpec.describe "Calendars", type: :request do
  describe "カレンダーが表示される" do
    let(:user) { create(:user) }

    before do
      sign_in user
    end

    it "returns http success" do
      get "/dashboard/calendar"
      expect(response).to have_http_status(:success)
    end
  end
end
