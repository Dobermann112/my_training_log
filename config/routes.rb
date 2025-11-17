Rails.application.routes.draw do
  devise_for :users

  devise_scope :user do
    get "account_edit", to: "devise/registrations#edit", as: :account_edit_user

    authenticated :user do
      root "dashboard/calendars#index", as: :authenticated_root
    end

    unauthenticated do
      root "devise/sessions#new", as: :unauthenticated_root
    end
  end

  resource :user, only: [:show, :edit, :update]

  resources :workouts do
    collection do
      get :select_exercise
    end

    resources :workout_sets, only: [:edit, :update, :destroy]
  end

  resources :body_parts, only: [:index] do
    resources :exercises
  end

  resources :calendars, only: :index

  namespace :stats do
    get "graphs", to: "graphs#index"
  end

  namespace :dashboard do
    get "calendar", to: "calendars#index"
    get "report",   to: "reports#index"
    get "profile",  to: "profiles#index"
    get "setting",  to: "settings#index"
  end

  get "dashboard/stats", to: "dashboard#stats"

  get "up" => "rails/health#show", as: :rails_health_check
end
