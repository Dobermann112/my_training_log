require 'rails_helper'

RSpec.describe CardioSetUpdateService do
  let(:user) { create(:user) }
  let(:cardio_workout) { create(:cardio_workout, user: user) }

  describe '#call' do
    context 'when 全セット削除された場合' do
      let!(:set) do
        create(:cardio_set, cardio_workout: cardio_workout)
      end

      let(:params) do
        {
          set.id.to_s => { _destroy: "1" }
        }
      end

      it 'cardio_workout が削除される' do
        result =
          described_class.new(
            cardio_workout: cardio_workout,
            sets_params: params
          ).call

        expect(result.cardio_workout_deleted?).to be(true)
        expect(CardioWorkout.exists?(cardio_workout.id)).to be(false)
      end
    end
  end
end
