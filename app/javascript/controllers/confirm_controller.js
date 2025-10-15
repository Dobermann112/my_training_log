import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static values = { message: String }

  confirm(event) {
    event.preventDefault()

    const message = this.messageValue || "本当に削除しますか？"
    if (window.confirm(message)) {
      const token = document.querySelector("meta[name='csrf-token']").content
      fetch(this.element.href, {
        method: "DELETE",
        headers: { "X-CSRF-Token": token, "Accept": "text/vnd.turbo-stream.html" },
      }).then(() => Turbo.visit("/users/sign_in", { action: "replace" }))
    }
  }
}
