require 'rails_helper'

RSpec.describe Workout, type: :model do
  let(:user) { create(:user) }

  describe "associations" do
    it { should belong_to(:user) }
    it { should have_many(:workout_sets).dependent(:destroy) }
  end

  describe "validations" do
    it { should validate_presence_of(:workout_date) }

    it "notes は500文字以内であれば有効" do
      workout = build(:workout, user: user, notes: "a" * 500)
      expect(workout).to be_valid
    end

    it "notes が501文字の場合は無効" do
      workout = build(:workout, user: user, notes: "a" * 501)
      expect(workout).to be_invalid
    end
  end
end
