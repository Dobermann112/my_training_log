class Exercise < ApplicationRecord
    belongs_to :body_part
    belongs_to :user, optional: true

    validates :name, length: { maximum: 50 }
    validates :name, presence: true
    validates :name, uniqueness: { scope: :user_id }

    def default_exercise?
        is_default && user_id.nil?
    end
end
