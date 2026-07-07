// app/javascript/controllers/theme_controller.js
import { Controller } from "@hotwired/stimulus"

const STORAGE_KEY = "theme"

export default class extends Controller {
  static targets = ["lightIcon", "darkIcon"]

  connect() {
    this.applyIconVisibility(this.currentTheme())
  }

  toggle() {
    const next = this.currentTheme() === "dark" ? "light" : "dark"
    document.documentElement.setAttribute("data-theme", next)
    localStorage.setItem(STORAGE_KEY, next)
    this.applyIconVisibility(next)
  }

  currentTheme() {
    return document.documentElement.getAttribute("data-theme") || "dark"
  }

  applyIconVisibility(theme) {
    if (this.hasLightIconTarget) this.lightIconTarget.classList.toggle("d-none", theme !== "dark")
    if (this.hasDarkIconTarget) this.darkIconTarget.classList.toggle("d-none", theme !== "light")
  }
}
