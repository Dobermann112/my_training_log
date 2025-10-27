require 'rails_helper'

RSpec.describe "BodyParts", type: :request do
  describe "GET /index" do
    it "returns http success" do
      get "/body_parts/index"
      expect(response).to have_http_status(:success)
    end
  end
end
