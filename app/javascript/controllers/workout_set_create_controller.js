import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static values = {
    date: String,
    exerciseId: Number
  }

  static targets = ["weight", "reps", "memo"]

  connect() {
    this.restoreDraft()
  }

  // input/blur 両方から呼ぶ。まずは input を主に使う
  saveDraft() {
    const payload = {
      weight: this.weightTarget.value,
      reps: this.repsTarget.value,
      memo: this.memoTarget.value
    }
    localStorage.setItem(this.storageKey(), JSON.stringify(payload))
  }

  restoreDraft() {
    const raw = localStorage.getItem(this.storageKey())
    if (!raw) return

    try {
      const data = JSON.parse(raw)
      if (data.weight != null) this.weightTarget.value = data.weight
      if (data.reps != null) this.repsTarget.value = data.reps
      if (data.memo != null) this.memoTarget.value = data.memo
    } catch (_) {
      // 壊れたデータは消す
      localStorage.removeItem(this.storageKey())
    }
  }

  clearDraft() {
    localStorage.removeItem(this.storageKey())
  }

  storageKey() {
    // まずは「new画面の1行=1draft」前提のキー（後で複数行対応に拡張）
    return `workout_set_draft:${this.dateValue}:${this.exerciseIdValue}`
  }
}
