// app/javascript/controllers/flash_controller.js
import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static values = { timeout: Number }

  connect() {
    this.timer = setTimeout(() => this.dismiss(), this.timeoutValue || 3000)
  }

  disconnect() {
    if (this.timer) clearTimeout(this.timer)
  }

  dismiss() {
    if (this.timer) clearTimeout(this.timer)
    this.element.classList.add("fade-out")
    setTimeout(() => this.element.remove(), 500)
  }

  esc(event) {
    if (event.key === "Escape") this.dismiss()
  }
}
