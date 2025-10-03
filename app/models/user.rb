class User < ApplicationRecord
  has_many :workouts, dependent: :destroy

  enum gender: { male: 1, female: 2 }
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable
end
