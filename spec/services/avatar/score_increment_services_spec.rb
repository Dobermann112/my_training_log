require 'rails_helper'

RSpec.describe Avatar::ScoreIncrementService do
  subject(:service) { described_class.new(workout_set) }

  let(:user) { create(:user) }
  let(:body_part) { create(:body_part, name: '胸') }
  let(:exercise) { create(:exercise, body_part: body_part, user: user) }
  let(:workout) { create(:workout, user: user) }
  let(:workout_set) { create(:workout_set, workout: workout, exercise: exercise) }

  before do
    allow_any_instance_of(WorkoutSet)
      .to receive(:increment_avatar_score)
  end

  describe '#call' do
    it 'upper_body の AvatarPartStat を作成し point を +1 する' do
      expect do
        service.call
      end.to change {
        user.avatar_part_stats.find_by(avatar_part: :upper_body)&.point
      }.from(nil).to(1)
    end

    it 'last_trained_at が更新される' do
      service.call
      stat = user.avatar_part_stats.find_by(avatar_part: :upper_body)

      expect(stat.last_trained_at).to be_within(1.second).of(Time.current)
    end
  end

  describe '#level' do
    it '現在の point に応じた level を返す' do
      stat = user.avatar_part_stats.create!(avatar_part: :upper_body, point: 0)

      expect(service.level).to eq('base')

      stat.update!(point: 300)
      expect(service.level).to eq('level_3')
    end
  end
end
