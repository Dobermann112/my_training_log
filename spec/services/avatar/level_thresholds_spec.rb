require 'rails_helper'

RSpec.describe Avatar::LevelThresholds do
  describe '.level_for' do
    it 'point に応じた level を返す' do
      expect(described_class.level_for(0)).to eq('base')
      expect(described_class.level_for(299)).to eq('base')
      expect(described_class.level_for(300)).to eq('level_3')
      expect(described_class.level_for(699)).to eq('level_3')
      expect(described_class.level_for(700)).to eq('level_7')
    end
  end

  describe '.progress_for' do
    it '現在tier内での進捗率と次tier名を返す' do
      expect(described_class.progress_for(0)).to eq(level: 'base', progress: 0.0, next_level: 'level_3')
      expect(described_class.progress_for(150)).to eq(level: 'base', progress: 0.5, next_level: 'level_3')
      expect(described_class.progress_for(299)).to eq(level: 'base', progress: 1.0, next_level: 'level_3')
      expect(described_class.progress_for(300)).to eq(level: 'level_3', progress: 0.0, next_level: 'level_7')
      expect(described_class.progress_for(500)).to eq(level: 'level_3', progress: 0.5, next_level: 'level_7')
    end

    it '最終tier到達時は progress: 1.0, next_level: nil を返す' do
      expect(described_class.progress_for(700)).to eq(level: 'level_7', progress: 1.0, next_level: nil)
      expect(described_class.progress_for(10_000)).to eq(level: 'level_7', progress: 1.0, next_level: nil)
    end
  end
end
