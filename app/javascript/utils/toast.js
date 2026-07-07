// app/javascript/utils/toast.js
// サーバーサイドのflashメッセージ(shared/_flash_messages.html.erb)と同じ見た目・挙動で、
// JS側(fetch失敗時など)からもトースト通知を出すためのユーティリティ。
// data-controller="flash" を付与するため、flash_controller.jsがそのまま自動fade/dismissを担う。

const TYPE_TO_CLASS = {
  notice: "flash-notice",
  info: "flash-notice",
  success: "flash-success",
  alert: "flash-error",
  error: "flash-error",
}

export function showToast(message, type = "error") {
  const area = document.getElementById("flash-area")
  if (!area) return

  const cssClass = TYPE_TO_CLASS[type] || "flash-notice"

  const el = document.createElement("div")
  el.className = `flash-message ${cssClass}`
  el.setAttribute("role", "status")
  el.setAttribute("data-controller", "flash")
  el.setAttribute("data-flash-timeout-value", "3500")
  el.setAttribute("data-action", "click->flash#dismiss keydown@window->flash#esc")

  el.innerHTML = `
    <div class="flash-message__content"></div>
    <button type="button" class="flash-message__close" aria-label="閉じる" data-action="flash#dismiss">&times;</button>
  `
  el.querySelector(".flash-message__content").textContent = message

  area.appendChild(el)
}
