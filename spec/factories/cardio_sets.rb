FactoryBot.define do
  factory :cardio_set do
    association :cardio_workout
    association :exercise

    duration { 30 }
    distance { 5 }
    calories { 200 }
    pace { 6.0 }
    memo { "" }
    set_number { 1 }
  end
end
