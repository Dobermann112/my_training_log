FactoryBot.define do
  factory :body_part do
    sequence(:name) { |n| "BodyPart#{n}" }
    sequence(:display_order) { |n| n }
  end
end
