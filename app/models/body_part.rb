class BodyPart < ApplicationRecord
    validates :name, presence: true, uniqueness: true
    validates :display_order, presence: true, uniqueness: true
end
