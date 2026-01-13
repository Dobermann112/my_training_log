import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["distance", "duration", "calories", "pace", "memo"]

  connect() {
    this.restoreDraft()
  }

  saveDraft() {
    const uuid = this.uuid()
    if (!uuid) return

    const payload = {
      distance: this.distanceTarget.value,
      duration: this.durationTarget.value,
      calories: this.caloriesTarget.value,
      pace: this.paceTarget.value,
      memo: this.memoTarget.value
    }

    if (Object.values(payload).every(v => !v)) {
      localStorage.removeItem(this.key(uuid))
      return
    }

    localStorage.setItem(this.key(uuid), JSON.stringify(payload))
  }

  restoreDraft() {
    const uuid = this.uuid()
    if (!uuid) return

    const raw = localStorage.getItem(this.key(uuid))
    if (!raw) return

    try {
      const data = JSON.parse(raw)
      this.distanceTarget.value = data.distance ?? ""
      this.durationTarget.value = data.duration ?? ""
      this.caloriesTarget.value = data.calories ?? ""
      this.paceTarget.value = data.pace ?? ""
      this.memoTarget.value = data.memo ?? ""
    } catch {
      localStorage.removeItem(this.key(uuid))
    }
  }

  uuid() {
    return this.element.closest(".set-input-row")?.dataset.setUuid
  }

  key(uuid) {
    return `cardio_set_draft:${uuid}`
  }
}
