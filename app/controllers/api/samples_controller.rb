class Api::SamplesController < ApplicationController
  def index
    render json: { message: "Hello Api" }
  end
end
