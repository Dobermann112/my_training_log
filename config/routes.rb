Rails.application.routes.draw do
  devise_for :users

  devise_scope :user do
    get "account_edit", to: "devise/registrations#edit", as: :account_edit_user
  end

  resource :user, only: [:show, :edit, :update]
  resources :workouts
  resources :body_parts, only: [:index] do
    resources :exercises
  end

  devise_scope :user do
    authenticated :user do
      root "users#show", as: :authenticated_root
    end

    unauthenticated do
      root "devise/sessions#new", as: :unauthenticated_root
    end
  end

  get "up" => "rails/health#show", as: :rails_health_check
end
