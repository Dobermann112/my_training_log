FactoryBot.define do
  factory :workout do
    user { nil }
    workout_date { "2025-10-02" }
    notes { "MyText" }
  end
end
