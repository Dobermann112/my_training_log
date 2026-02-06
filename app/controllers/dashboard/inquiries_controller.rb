class Dashboard::InquiriesController < ApplicationController
  before_action :authenticate_user!

  def new
    @inquiry_form = InquiryForm.new(
      name: current_user.name,
      email: current_user.email
    )
  end

  def create
    @inquiry_form = InquiryForm.new(inquiry_params)
    @inquiry_form.name ||= current_user.name

    if @inquiry_form.valid?
      InquirySubmissionService.call(
        inquiry_form: @inquiry_form,
        user: current_user
      )
      
      redirect_to dashboard_setting_path, notice: "フォームを送信しました"
    else
      render :new, status: :unprocessable_entity
    end
  end

  private

  def inquiry_params
    params.require(:inquiry_form).permit(:name, :email, :category, :message)
  end
end
