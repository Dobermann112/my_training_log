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
end
