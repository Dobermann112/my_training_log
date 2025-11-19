module SystemLoginHelper
  def system_login(user)
    visit new_user_session_path
    fill_in "名前", with: user
    fill_in "パスワード", with: user.password
    click_button "ログイン"
  end
end
