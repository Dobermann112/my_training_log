class Workout < ApplicationRecord
  belongs_to :user
  has_many :workout_sets, dependent: :destroy

  validates :workout_date, presence: true
  validates :notes, length: { maximum: 500 }, allow_blank: true

  scope :for_user, ->(user) { where(user_id: user.id) }
  scope :between, ->(from, to) {
    return all if form.blank? && to.blank?
    rel = all
    rel = rel.where("workout_date >= ?", from) if from.present?
    rel = rel.where("workout_date <= ?", to) if to.present?
    rel
  }
end
