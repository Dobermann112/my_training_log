class User < ApplicationRecord
  has_many :workouts, dependent: :destroy

  enum :gender, { unspecified: 0, male: 1, female: 2 }

  validates :name, presence: true, uniqueness: { case_sensitive: false }, length: { minimum: 2 }

  after_initialize :set_default_gendr, if: :new_record?
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable

  private

  def set_default_gendr
    self.gender ||= :unspecified
  end
end
