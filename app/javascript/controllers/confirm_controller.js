// app/javascript/controllers/confirm_controller.js
import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static values = { message: String }

  confirm(event) {
    event.preventDefault()
    const message = this.messageValue || "本当に削除しますか？"
    if (!window.confirm(message)) return

    const token = document.querySelector("meta[name='csrf-token']").content
    const url = this.element.href

    fetch(url, {
      method: "DELETE",
      headers: {
        "X-CSRF-Token": token,
        "Accept": "text/html"
      }
    }).then((response) => {
      if (response.ok) {
        // Devise 専用のリダイレクト
        if (url.includes("/users")) {
          Turbo.visit("/users/sign_in", { action: "replace" })
        } else {
          // 想定外のURLはリロード
          Turbo.visit(window.location.href)
        }
      } else {
        console.error("Delete failed:", response.statusText)
      }
    })
  }
}
