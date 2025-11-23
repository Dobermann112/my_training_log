require 'rails_helper'

RSpec.describe "StaticPages", type: :request do
  describe "利用規約が表示される" do
    it "returns http success" do
      get "/terms"
      expect(response).to have_http_status(:success)
    end
  end

  describe "プライバシーポリシーが表示される" do
    it "returns http success" do
      get "/privacy"
      expect(response).to have_http_status(:success)
    end
  end

  describe "ヘルプ / 使い方ページが表示される" do
    it "returns http success" do
      get "/help"
      expect(response).to have_http_status(:success)
    end
  end
end
