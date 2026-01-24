require 'rails_helper'

RSpec.describe 'Api::Avatars', type: :request do
  let(:user) { create(:user) }

  before { sign_in user }

  describe 'GET /api/avatar' do
    it '全 avatar_part を含む JSON を返す' do
      get '/api/avatar'

      expect(response).to have_http_status(:ok)

      json = JSON.parse(response.body)

      expect(json.keys).to contain_exactly(
        'upper_body',
        'core',
        'lower_body'
      )
    end

    it 'stat が存在しない部位は base を返す' do
      get '/api/avatar'

      json = JSON.parse(response.body)
      expect(json['upper_body']).to eq('base')
      expect(json['core']).to eq('base')
      expect(json['lower_body']).to eq('base')
    end

    it 'stat が存在する場合は level を反映する' do
      user.avatar_part_stats.create!(
        avatar_part: :upper_body,
        point: 300,
        last_trained_at: Time.current
      )

      get '/api/avatar'
      json = JSON.parse(response.body)

      expect(json['upper_body']).to eq('level_3')
    end
  end
end
