require 'rails_helper'

RSpec.describe CardioWorkoutCreationService do
  let(:user) { create(:user) }
  let(:exercise) { create(:exercise, user: user) }
  let(:date) { Time.zone.today }

  describe '#call' do
    context 'when 有効な duration がある場合' do
      let(:params) do
        {
          "0" => { duration: 30, distance: 5 }
        }
      end

      it 'CardioWorkout と CardioSet を作成する' do
        expect do
          described_class.new(
            user: user,
            date: date,
            exercise_id: exercise.id,
            sets_params: params
          ).call
        end.to change(CardioWorkout, :count).by(1)
         .and change(CardioSet, :count).by(1)
      end
    end

    context 'when 全て空行の場合' do
      it 'CreationError を投げる' do
        expect do
          described_class.new(
            user: user,
            date: date,
            exercise_id: exercise.id,
            sets_params: {}
          ).call
        end.to raise_error(CardioWorkoutCreationService::CreationError)
      end
    end
  end
end
