require 'rails_helper'

RSpec.describe CardioSetDeleteService do
  let(:user) { create(:user) }
  let(:cardio_workout) { create(:cardio_workout, user: user) }

  it '最後のセット削除で cardio_workout が削除される' do
    set = create(:cardio_set, cardio_workout: cardio_workout)

    result = described_class.call(cardio_workout: cardio_workout, set: set)

    expect(result.cardio_workout_deleted?).to eq(true)
  end
end
