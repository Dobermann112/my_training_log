import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["input"]

  select(event) {
    const clickedEl = event.target.closest(".exercise-option")
    
    if(!clickedEl) return
    
    const exerciseId = clickedEl.dataset.id

    this.inputTarget.value = exerciseId

    this.clearSelection()

    clickedEl.classList.add("selected-exercise")

    console.log("selected exercise_id:", exerciseId)
  }

  clearSelection() {
    const options = this.element.querySelectorAll(".exercise-option")
    options.forEach(opt => opt.classList.remove("selected-exercise"))
  }
}
