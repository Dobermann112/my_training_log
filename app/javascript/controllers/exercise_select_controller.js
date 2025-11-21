import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = []

  // 種目クリック
  select(event) {
    const clicked = event.currentTarget
    const exerciseId = clicked.dataset.id

    const params = new URLSearchParams(window.location.search)
    const date = params.get("date")

    window.location.href = `/workouts/new?date=${date}&exercise_id=${exerciseId}`
  }

  // もっと見る/閉じる
  toggle(event) {
    const button = event.currentTarget
    const card = button.closest(".exercise-select-card")
    const extraArea = card.querySelector(".extra-exercise")

    if (!extraArea) return

    const isHidden = extraArea.classList.contains("d-none")

    if (isHidden) {
      extraArea.classList.remove("d-none")
      button.textContent = "▲ 閉じる"
    } else {
      extraArea.classList.add("d-none")
      button.textContent = "▼ もっと見る"
    }
  }
}
