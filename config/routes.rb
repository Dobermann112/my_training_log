Rails.application.routes.draw do
  devise_for :users

  devise_scope :user do
    get "account_edit", to: "devise/registrations#edit", as: :account_edit_user
    
    authenticated :user do
      root "calendars#index", as: :authenticated_root
    end

    unauthenticated do
      root "devise/sessions#new", as: :unauthenticated_root
    end
  end

  resource :user, only: [:show, :edit, :update]

  resources :workouts do
    resources :workout_sets, only: [:new, :create, :edit, :update, :destroy]
  end
  resources :body_parts, only: [:index] do
    resources :exercises
  end

  resources :calendars, only: :index

  namespace :stats do
    get "graphs", to: "graphs#index"
  end

  namespace :dashboard do
    get "report", to: "reports#index"
  end

  get "dashboard/stats", to: "dashboard#stats"

  get "up" => "rails/health#show", as: :rails_health_check
end
