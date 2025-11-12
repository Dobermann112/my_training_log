FactoryBot.define do
  factory :exercise do
    sequence(:name) { |n| "Exercise#{n}" }
    is_default { false }
    association :body_part
  end
end
