class Exercise < ApplicationRecord
  belongs_to :body_part
  belongs_to :user, optional: true
  has_many :workout_sets, dependent: :destroy

  validates :name, length: { maximum: 50 }
  validates :name, presence: true
  validates :name, uniqueness: {
    scope: [:user_id, :body_part_id],
    case_sensitive: false,
    message: "は同じ部位内ですでに登録されています"
  }

  scope :templates, -> { where(user_id: nil) }
  scope :for_user, ->(user) { where(user_id: user.id) }

  def template?
    user_id.nil?
  end
end
