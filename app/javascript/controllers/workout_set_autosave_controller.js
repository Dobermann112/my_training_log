import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static values = {
    workoutId: Number,
    csrf: String
  }

  save(event) {
    const field = event.target.dataset.field
    const value = event.target.value
    const setId = event.target.dataset.setId

    const url = `/workouts/${this.workoutIdValue}/workout_sets/${setId}`

    fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "X-CSRF-Token": this.csrfValue
      },
      body: JSON.stringify({
        workout_set: { [field]: value }
      })
    })
      .then(res => {
        if (!res.ok) throw new Error("save failed")
        console.log("saved", field, value)
      })
      .catch(() => {
        console.log("save error")
      })
  }
}
