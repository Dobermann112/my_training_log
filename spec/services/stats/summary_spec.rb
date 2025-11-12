require 'rails_helper'

RSpec.describe Stats::Summary do
  it "calculates streak" do
    user = create(:user)
    # 例: 3日連続のworkoutを作る
    3.times { |i| create(:workout, user: user, workout_date: Time.zone.today - i) }
    
    res = described_class.new(user: user, period: (Date.today - 6)..Date.today).call
    expect(res[:streak_days]).to be >= 3
  end
end
