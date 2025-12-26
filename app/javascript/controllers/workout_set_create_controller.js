import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["weight", "reps", "memo"]

  connect() {
    this.restoreDraft()
  }

  saveDraft() {
    const row = this.element.closest(".set-input-row")
    if (!row) return

    const uuid = row.dataset.setUuid
    if (!uuid) return

    const payload = {
      weight: this.weightTarget.value,
      reps: this.repsTarget.value,
      memo: this.memoTarget.value
    }

    localStorage.setItem(
      this.storageKey(uuid),
      JSON.stringify(payload)
    )
  }

  restoreDraft() {
    const row = this.element.closest(".set-input-row")
    if (!row) return

    const uuid = row.dataset.setUuid
    if (!uuid) return

    const raw = localStorage.getItem(this.storageKey(uuid))
    if (!raw) return

    try {
      const data = JSON.parse(raw)
      if (data.weight != null) this.weightTarget.value = data.weight
      if (data.reps != null) this.repsTarget.value = data.reps
      if (data.memo != null) this.memoTarget.value = data.memo
    } catch {
      localStorage.removeItem(this.storageKey(uuid))
    }
  }

  clearDraft(uuid) {
    localStorage.removeItem(this.storageKey(uuid))
  }

  storageKey(uuid) {
    return `workout_set_draft:${uuid}`
  }
}
