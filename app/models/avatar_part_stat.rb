class AvatarPartStat < ApplicationRecord
  belongs_to :user

  enum avatar_part: {
    upper_body: 0,
    lower_body: 1,
    core: 2
  }

  validates :avatar_part, presence: true
  validates :point, numericality { greater_than_or_equal_to: 0 }
end