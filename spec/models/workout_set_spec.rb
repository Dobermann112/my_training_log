require 'rails_helper'

RSpec.describe WorkoutSet, type: :model do
  let(:user)      { create(:user) }
  let(:workout)   { create(:workout, user: user) }
  let(:body_part) { create(:body_part) }
  let(:exercise)  { create(:exercise, body_part: body_part) }

  describe "associations" do
    it { should belong_to(:workout) }
    it { should belong_to(:exercise) }
  end

  describe "validations" do
    it { should validate_numericality_of(:set_number).is_greater_than(0) }

    it { should validate_numericality_of(:weight).is_greater_than(0).allow_nil }
    it { should validate_numericality_of(:reps).is_greater_than_or_equal_to(1).allow_nil }

    it "memo は100文字以内なら有効" do
      set = build(:workout_set, memo: "a" * 100)
      expect(set).to be_valid
    end

    it "memo が101文字の場合は無効" do
      set = build(:workout_set, memo: "a" * 101)
      expect(set).to be_invalid
    end

    it "weight・reps・memo がすべて空の場合は無効（カスタムバリデーション）" do
      set = build(:workout_set,
        workout: workout,
        exercise: exercise,
        weight: nil, reps: nil, memo: nil
      )
      expect(set).to be_invalid
      expect(set.errors[:base]).to include("重量、回数、メモのいずれかを入力してください")
    end
  end

  describe "callbacks" do
    it "set_number が未指定の場合、自動的に連番が付与される" do
      set1 = create(:workout_set, workout: workout, exercise: exercise, set_number: nil)
      set2 = create(:workout_set, workout: workout, exercise: exercise, set_number: nil)

      expect(set1.set_number).to eq(1)
      expect(set2.set_number).to eq(2)
    end
  end
end
