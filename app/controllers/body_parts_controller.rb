class BodyPartsController < ApplicationController
  def index
    @body_parts = BodyPart.order(:display_order)
  end
end
