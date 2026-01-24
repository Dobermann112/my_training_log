FactoryBot.define do
  factory :avatar_part_stat do
    association :user
    avatar_part { :upper_body }
    point { 0 }
    last_trained_at { Time.current }
  end
end
