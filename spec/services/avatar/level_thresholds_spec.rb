require 'rails_helper'

RSpec.describe Avatar::LevelThresholds do
  describe '.level_for' do
    it 'upper_body は point に応じた level を返す(閾値 300/700)' do
      expect(described_class.level_for(0, :upper_body)).to eq('base')
      expect(described_class.level_for(299, :upper_body)).to eq('base')
      expect(described_class.level_for(300, :upper_body)).to eq('level_3')
      expect(described_class.level_for(699, :upper_body)).to eq('level_3')
      expect(described_class.level_for(700, :upper_body)).to eq('level_7')
    end

    it 'core / lower_body は point に応じた level を返す(閾値 75/175)' do
      %i[core lower_body].each do |part|
        expect(described_class.level_for(0, part)).to eq('base')
        expect(described_class.level_for(74, part)).to eq('base')
        expect(described_class.level_for(75, part)).to eq('level_3')
        expect(described_class.level_for(174, part)).to eq('level_3')
        expect(described_class.level_for(175, part)).to eq('level_7')
      end
    end
  end

  describe '.progress_for' do
    it 'upper_body の現在tier内での進捗率と次tier名を返す' do
      expect(described_class.progress_for(0, :upper_body)).to eq(level: 'base', progress: 0.0, next_level: 'level_3')
      expect(described_class.progress_for(150, :upper_body)).to eq(level: 'base', progress: 0.5, next_level: 'level_3')
      expect(described_class.progress_for(299, :upper_body)).to eq(level: 'base', progress: 1.0, next_level: 'level_3')
      expect(described_class.progress_for(300, :upper_body)).to eq(level: 'level_3', progress: 0.0, next_level: 'level_7')
      expect(described_class.progress_for(500, :upper_body)).to eq(level: 'level_3', progress: 0.5, next_level: 'level_7')
    end

    it 'core の現在tier内での進捗率と次tier名を返す(閾値 75/175)' do
      expect(described_class.progress_for(0, :core)).to eq(level: 'base', progress: 0.0, next_level: 'level_3')
      expect(described_class.progress_for(37, :core)).to eq(level: 'base', progress: 0.49, next_level: 'level_3')
      expect(described_class.progress_for(75, :core)).to eq(level: 'level_3', progress: 0.0, next_level: 'level_7')
      expect(described_class.progress_for(125, :core)).to eq(level: 'level_3', progress: 0.5, next_level: 'level_7')
    end

    it '最終tier到達時は progress: 1.0, next_level: nil を返す' do
      expect(described_class.progress_for(700, :upper_body)).to eq(level: 'level_7', progress: 1.0, next_level: nil)
      expect(described_class.progress_for(10_000, :upper_body)).to eq(level: 'level_7', progress: 1.0, next_level: nil)
      expect(described_class.progress_for(175, :lower_body)).to eq(level: 'level_7', progress: 1.0, next_level: nil)
    end
  end
end
