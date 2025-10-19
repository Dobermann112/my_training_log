class BodyPart < ApplicationRecord
    has_many :exercises, dependent: :destroy
    
    validates :name, presence: true, uniqueness: true
    validates :display_order, presence: true, uniqueness: true

    default_scope { order(:display_order) }
end
