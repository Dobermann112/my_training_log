// app/javascript/controllers/flash_controller.js
import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static values = { timeout: Number }

  connect() {
    setTimeout(() => {
      this.element.classList.add("fade-out")
      setTimeout(() => this.element.remove(), 500)
    }, this.timeoutValue || 3000)
  }
}
