class InquiryMailer < ApplicationMailer
  def notify
    @inquiry = params[:inquiry]

    mail(
      to: ENV["MAILER_SENDER"],
      subject: "[My Training Log] お問い合わせ（#{category_label}）"
    )
  end

  private

  def category_label
    case @inquiry[:category]
    when "bug"
      "不具合"
    when "request"
      "要望"
    else
      "その他"
    end
  end
end
