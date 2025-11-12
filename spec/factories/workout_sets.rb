FactoryBot.define do
  factory :workout_set do
    set_number { 1 }
    weight { "9.99" }
    reps { 1 }
    association :workout
    association :exercise
  end
end
