Rails.application.routes.draw do
  devise_for :users
  
  devise_scope :user do
    get "account_edit", to: "devise/registrations#edit", as: :account_edit_user
  end

  resource :user, only: [:show, :edit, :update]
  
  get "up" => "rails/health#show", as: :rails_health_check

  root "users#show"
end
