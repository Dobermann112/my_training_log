FactoryBot.define do
  factory :cardio_workout do
    association :user
    performed_on { Time.zone.today }
  end
end
