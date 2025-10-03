FactoryBot.define do
  factory :workout_set do
    workout { nil }
    exercise { nil }
    set_number { 1 }
    weight { "9.99" }
    reps { 1 }
  end
end
