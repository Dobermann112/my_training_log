Rails.application.routes.draw do
  devise_for :users
  
  resource :user, only: [:show, :edit, :update]

  get "up" => "rails/health#show", as: :rails_health_check

  root "users#show"
end
