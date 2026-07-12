require 'rails_helper'

RSpec.describe 'Api::Avatars', type: :request do
  let(:user) { create(:user) }

  before { sign_in user }

  describe 'GET /api/avatar' do
    it '全 avatar_part を含む JSON を返す' do
      get '/api/avatar'

      expect(response).to have_http_status(:ok)

      json = response.parsed_body

      expect(json.keys).to contain_exactly(
        'upper_body',
        'core',
        'lower_body'
      )
    end

    it 'stat が存在しない部位は base を返す' do
      get '/api/avatar'

      json = response.parsed_body
      expect(json['upper_body']).to eq('level' => 'base', 'progress' => 0.0, 'next_level' => 'level_3')
      expect(json['core']).to eq('level' => 'base', 'progress' => 0.0, 'next_level' => 'level_3')
      expect(json['lower_body']).to eq('level' => 'base', 'progress' => 0.0, 'next_level' => 'level_3')
    end

    it 'stat が存在する場合は level と進捗率を反映する' do
      user.avatar_part_stats.create!(
        avatar_part: :upper_body,
        point: 300,
        last_trained_at: Time.current
      )

      get '/api/avatar'
      json = response.parsed_body

      expect(json['upper_body']).to eq('level' => 'level_3', 'progress' => 0.0, 'next_level' => 'level_7')
    end

    it 'core は upper_body より低い point(75)で level_3 に到達する' do
      user.avatar_part_stats.create!(
        avatar_part: :core,
        point: 75,
        last_trained_at: Time.current
      )

      get '/api/avatar'
      json = response.parsed_body

      expect(json['core']).to eq('level' => 'level_3', 'progress' => 0.0, 'next_level' => 'level_7')
    end
  end
end
