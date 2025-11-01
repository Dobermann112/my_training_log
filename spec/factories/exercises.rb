FactoryBot.define do
  factory :exercise do
    name { "MyString" }
    is_default { false }
    association :body_part
  end
end
