import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static values = {
    date: String,
    exerciseId: Number,
    csrf: String
  }

  static targets = ["weight", "reps", "memo"]

  save(event) {
    const row = event.target.closest(".set-input-row")
    if (!row) return

    // すでに draft が存在する場合は CREATE しない
    if (row.dataset.setId) return

    const weight = this.weightTarget.value
    const reps   = this.repsTarget.value
    const memo   = this.memoTarget.value

    // weight / reps 両方空なら保存しない
    if (!weight && !reps) return

    fetch("/workout_sets", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "X-CSRF-Token": this.csrfValue
      },
      body: JSON.stringify({
        date: this.dateValue,
        exercise_id: this.exerciseIdValue,
        workout_set: {
          weight,
          reps,
          memo
        }
      })
    })
      .then(res => {
        if (!res.ok) throw new Error("create failed")
        return res.json()
      })
      .then(data => {
        // draft が確定したことを示す
        row.dataset.setId = data.workout_set_id
      })
      .catch(() => {
        // この issue では UI 表示まではやらない
        console.error("workout_set create failed")
      })
  }
}
