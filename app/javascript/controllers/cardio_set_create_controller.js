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

    const key = this.key(uuid)
    const raw = localStorage.getItem(key)

    // ① draft があれば復元
    if (raw) {
      try {
        const data = JSON.parse(raw)
        this.distanceTarget.value = data.distance ?? ""
        this.durationTarget.value = data.duration ?? ""
        this.caloriesTarget.value = data.calories ?? ""
        this.paceTarget.value = data.pace ?? ""
        this.memoTarget.value = data.memo ?? ""
        return
      } catch {
        localStorage.removeItem(key)
        return
      }
    }

    // ② 編集画面なら初期値から draft を生成
    if (this.isEdit()) {
      const payload = {
        distance: this.distanceTarget.value,
        duration: this.durationTarget.value,
        calories: this.caloriesTarget.value,
        pace: this.paceTarget.value,
        memo: this.memoTarget.value
      }

      if (Object.values(payload).some(v => v && v !== "")) {
        localStorage.setItem(key, JSON.stringify(payload))
      }
    }
  }

  uuid() {
    return this.element.closest(".set-input-row")?.dataset.setUuid
  }

  key(uuid) {
    return `cardio_set_draft:${uuid}`
  }

  isEdit() {
    const row = this.element.closest(".set-input-row")
    return row?.dataset.persisted === "true"
  }
}
