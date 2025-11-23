require 'rails_helper'

RSpec.describe Exercise, type: :model do
  let(:body_part) { create(:body_part) }
  let(:user)      { create(:user) }

  describe "バリデーション" do
    it "name があれば有効である" do
      exercise = build(:exercise, name: "ベンチプレス", body_part: body_part, user: user)
      expect(exercise).to be_valid
    end

    it "name が空なら無効" do
      exercise = build(:exercise, name: "", body_part: body_part, user: user)
      expect(exercise).not_to be_valid
    end

    it "name が50文字以内なら有効" do
      exercise = build(:exercise, name: "a" * 50, body_part: body_part)
      expect(exercise).to be_valid
    end

    it "name が51文字以上なら無効" do
      exercise = build(:exercise, name: "a" * 51, body_part: body_part)
      expect(exercise).not_to be_valid
    end

    it "同じ部位・同じユーザーでは name が重複すると無効" do
      create(:exercise, name: "ベンチプレス", body_part: body_part, user: user)
      dup = build(:exercise, name: "ベンチプレス", body_part: body_part, user: user)

      expect(dup).not_to be_valid
      expect(dup.errors[:name]).to include("は同じ部位内ですでに登録されています")
    end

    it "ユーザーが異なれば同じ name でも有効" do
      create(:exercise, name: "ベンチプレス", body_part: body_part, user: user)
      other_user = create(:user)
      dup = build(:exercise, name: "ベンチプレス", body_part: body_part, user: other_user)

      expect(dup).to be_valid
    end

    it "部位が異なれば同じ name でも有効" do
      other_body_part = create(:body_part)
      create(:exercise, name: "ベンチプレス", body_part: body_part)
      dup = build(:exercise, name: "ベンチプレス", body_part: other_body_part)

      expect(dup).to be_valid
    end
  end

  describe "アソシエーション" do
    it { is_expected.to belong_to(:body_part) }
    it { is_expected.to belong_to(:user).optional }
    it { is_expected.to have_many(:workout_sets).dependent(:destroy) }
  end

  describe "スコープ" do
    let!(:default_ex) { create(:exercise, body_part: body_part, is_default: true, user: nil) }
    let!(:custom_ex)  { create(:exercise, body_part: body_part, user: user, is_default: false) }

    describe ".defaults" do
      it "デフォルト種目のみ返す" do
        expect(described_class.defaults).to include(default_ex)
        expect(described_class.defaults).not_to include(custom_ex)
      end
    end

    describe ".custom_of" do
      it "指定ユーザーの種目のみ返す" do
        expect(described_class.custom_of(user)).to include(custom_ex)
        expect(described_class.custom_of(user)).not_to include(default_ex)
      end
    end

    describe ".for_user" do
      it "デフォルト種目 + ユーザーのカスタム種目を返す" do
        result = described_class.for_user(user)
        expect(result).to include(default_ex, custom_ex)
      end
    end
  end

  describe "#default_exercise?" do
    it "デフォルト種目なら true を返す" do
      exercise = build(:exercise, is_default: true, user_id: nil)
      expect(exercise.default_exercise?).to be(true)
    end

    it "ユーザー種目なら false を返す" do
      exercise = build(:exercise, is_default: false, user_id: user.id)
      expect(exercise.default_exercise?).to be(false)
    end
  end
end
