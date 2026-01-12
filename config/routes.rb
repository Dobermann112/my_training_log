Rails.application.routes.draw do
  get 'three_poc/humanoid'
  devise_for :users, controllers: {
    omniauth_callbacks: "users/omniauth_callbacks"
  }

  devise_scope :user do
    authenticated :user do
      root "dashboard/calendars#index", as: :authenticated_root
    end

    unauthenticated do
      root "devise/sessions#new", as: :unauthenticated_root
    end
  end

  get "/terms",   to: "static_pages#terms"
  get "/privacy", to: "static_pages#privacy"
  get "/help",    to: "static_pages#help"

  resource :user, only: [:show, :edit, :update]

  get "account_edit", to: "users#account_edit", as: :account_edit_user
  patch "users/update_email", to: "users#update_email", as: :users_update_email
  patch "users/update_password", to: "users#update_password", as: :users_update_password

  resources :workouts do
    collection do
      get :select_exercise
      get :by_date
    end

    resources :workout_sets, only: [:update, :destroy] do
      get :edit_group, on: :collection
      patch :update_group, on: :collection
    end
  end

  resources :workout_sets, only: [:create]

  resources :cardio_workouts, only: [:new, :create]

  resources :body_parts, only: [:index] do
    resources :exercises
  end

  resources :calendars, only: :index

  resources :profiles, only: :index

  namespace :stats do
    get "graphs", to: "graphs#index"
  end

  namespace :api do
    get :sample, to: "samples#index"
    resource :avatar, only: :show
    resources :events, only: :index
  end

  namespace :dashboard do
    get "calendar", to: "calendars#index"
    get "report",   to: "reports#index"
    get "profile",  to: "profiles#index"
    get "setting",  to: "settings#index"
  end

  get "dashboard/stats", to: "dashboard#stats"

  get "three_poc/humanoid", to: "three_poc#humanoid"

  get "up" => "rails/health#show", as: :rails_health_check
end
