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
    validates :body_part_id, presence: true
    
    def default_exercise?
        is_default && user_id.nil?
    end
end
