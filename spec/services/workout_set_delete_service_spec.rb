require 'rails_helper'

RSpec.describe WorkoutSetDeleteService do
  let(:user) { create(:user) }
  let(:workout) { create(:workout, user: user) }

  before do
    allow_any_instance_of(Avatar::ScoreIncrementService).to receive(:call)
  end

  it '最後のセット削除時に workout も削除される' do
    set = create(:workout_set, workout: workout)

    result = described_class.call(workout: workout, set: set)

    expect(result.workout_deleted?).to be(true)
    expect(Workout.exists?(workout.id)).to be(false)
  end
end
