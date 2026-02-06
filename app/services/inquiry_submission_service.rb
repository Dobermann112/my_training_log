class InquirySubmissionService
  def self.call(inquiry_form:, user:)
    new(inquiry_form, user).call
  end

  def initialize(inquiry_form, user)
    @inquiry_form = inquiry_form
    @user = user
  end

  def call
    InquiryMailer.with(
      inquiry: inquiry_payload
    ).notify.deliver_now
  end

  private

  def inquiry_payload
    {
      user_id: @user.id,
      name: @inquiry_form.name,
      email: @inquiry_form.email,
      category: @inquiry_form.category,
      message: @inquiry_form.message,
      submitted_at: Time.current
    }
  end
end
