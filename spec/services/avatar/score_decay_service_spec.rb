require 'rails_helper'

RSpec.describe Avatar::ScoreDecayService do
  subject(:service) { described_class.new(stat) }

  let(:stat) do
    create(
      :avatar_part_stat,
      point: 100,
      last_trained_at: 5.days.ago
    )
  end

  it '経過日数 × DECAY_PER_DAY 分だけ減衰する' do
    expect(service.call).to eq(75)
  end

  it '0 未満にはならない' do
    stat.update!(point: 10)
    expect(service.call).to eq(0)
  end

  it 'last_trained_at が nil の場合は減衰しない' do
    stat.update!(last_trained_at: nil)
    expect(service.call).to eq(100)
  end
end
