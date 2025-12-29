import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["weight", "reps", "memo"]

  connect() {
    this.restoreDraft()
  }

  saveDraft() {
    const uuid = this.uuid()
    if (!uuid) return

    const payload = {
      weight: this.weightTarget.value,
      reps: this.repsTarget.value,
      memo: this.memoTarget.value
    }

    const hasWeight = payload.weight && payload.weight !== ""
    const hasReps = payload.reps && payload.reps !== ""

    if (!hasWeight && !hasReps) {
      localStorage.removeItem(this.storageKey(uuid))
      return
    }

    localStorage.setItem(this.storageKey(uuid), JSON.stringify(payload))
  }

  restoreDraft() {
    const uuid = this.uuid()
    if (!uuid) return

    const key = this.storageKey(uuid)
    const raw = localStorage.getItem(key)

    // ① draft があればそれを復元
    if (raw) {
      try {
        const data = JSON.parse(raw)
        if (data.weight != null) this.weightTarget.value = data.weight
        if (data.reps != null) this.repsTarget.value = data.reps
        if (data.memo != null) this.memoTarget.value = data.memo
        return
      } catch {
        localStorage.removeItem(key)
        return
      }
    }

    if (this.isEdit()) {
      const payload = {
        weight: this.weightTarget.value,
        reps: this.repsTarget.value,
        memo: this.memoTarget.value
      }

      const hasWeight = payload.weight && payload.weight !== ""
      const hasReps = payload.reps && payload.reps !== ""
      if (hasWeight || hasReps) {
        localStorage.setItem(key, JSON.stringify(payload))
      }
    }
  }

  uuid() {
    const row = this.element.closest(".set-input-row")
    return row?.dataset.setUuid
  }

  storageKey(uuid) {
    return `workout_set_draft:${uuid}`
  }

  isEdit() {
    const row = this.element.closest(".set-input-row")
    return row?.dataset.persisted === "true"
  }
}
