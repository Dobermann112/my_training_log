FactoryBot.define do
  factory :cardio_workout do
    association :user
    performed_on { Date.today }
  end
end
