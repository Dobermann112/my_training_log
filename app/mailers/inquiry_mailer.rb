class InquiryMailer < ApplicationMailer
  def notify
    @inquiry = params[:inquiry]
    @category_label = category_label(@inquiry[:category])

    mail(
      to: ENV.fetch("INQUIRY_RECEIVER"),
      reply_to: @inquiry[:email],
      subject: "[トレログ] お問い合わせ（#{@category_label}）"
    )
  end

  private

  def category_label(value)
    case value
    when "bug"     then "不具合"
    when "request" then "要望"
    else                "その他"
    end
  end
end
