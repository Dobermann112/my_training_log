import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = [
    "distance", "duration", "calories", "paceMin", "paceSec", "paceWrapper", "paceError", "memo"]

  connect() {
    this.restoreDraft()
  }

  // -----------------------
  // Pace: input / blur
  // -----------------------
  onPaceInput() {
    // 入力中は即時バリデーションだけ行い、draft保存は最後にまとめて
    this.validatePace()
    this.saveDraft()
  }

  onPaceBlur() {
    // 秒だけゼロ埋め（1桁→2桁）
    const sec = this.paceSecTarget.value
    if (sec !== "" && /^\d{1,2}$/.test(sec)) {
      const n = Number(sec)
      if (!Number.isNaN(n) && n >= 0 && n <= 59) {
        this.paceSecTarget.value = String(n).padStart(2, "0")
      }
    }

    // 分は先頭ゼロを落とす（05→5）
    const min = this.paceMinTarget.value
    if (min !== "" && /^\d{1,2}$/.test(min)) {
      const n = Number(min)
      if (!Number.isNaN(n) && n >= 0 && n <= 99) {
        this.paceMinTarget.value = String(n)
      }
    }

    this.validatePace()
    this.saveDraft()
  }

  validatePace() {
    const min = this.paceMinTarget.value
    const sec = this.paceSecTarget.value

    // どっちも空ならOK（ペース任意）
    if (min === "" && sec === "") {
      this.clearPaceError()
      return true
    }

    // 分：0-99
    if (min === "" || !/^\d{1,2}$/.test(min)) {
      this.showPaceError("分は0〜99で入力してください")
      return false
    }
    const minN = Number(min)
    if (Number.isNaN(minN) || minN < 0 || minN > 99) {
      this.showPaceError("分は0〜99で入力してください")
      return false
    }

    // 秒：00-59（1桁も許容、blurでpad）
    if (sec === "" || !/^\d{1,2}$/.test(sec)) {
      this.showPaceError("秒は00〜59で入力してください")
      return false
    }
    const secN = Number(sec)
    if (Number.isNaN(secN) || secN < 0 || secN > 59) {
      this.showPaceError("秒は00〜59で入力してください")
      return false
    }

    this.clearPaceError()
    return true
  }

  showPaceError(message) {
    if (this.hasPaceErrorTarget) {
      this.paceErrorTarget.textContent = message
      this.paceErrorTarget.style.display = "block"
    }
    if (this.hasPaceWrapperTarget) {
      this.paceWrapperTarget.classList.add("is-invalid")
    }
  }

  clearPaceError() {
    if (this.hasPaceErrorTarget) {
      this.paceErrorTarget.textContent = ""
      this.paceErrorTarget.style.display = "none"
    }
    if (this.hasPaceWrapperTarget) {
      this.paceWrapperTarget.classList.remove("is-invalid")
    }
  }

  // m:ss -> decimal(min/km) に変換して返す（commit側で使う）
  paceDecimalValue() {
    if (!this.validatePace()) return ""

    const min = Number(this.paceMinTarget.value)
    const sec = Number(this.paceSecTarget.value)
    const val = min + sec / 60.0

    // 小数2桁で十分（DB pace scale:2）
    return val.toFixed(2)
  }

  // -----------------------
  // Draft save/restore
  // -----------------------
  saveDraft() {
    const uuid = this.uuid()
    if (!uuid) return

    const payload = {
      distance: this.distanceTarget.value,
      duration: this.durationTarget.value,
      calories: this.caloriesTarget.value,
      // ★ pace は min/sec で保存
      paceMin: this.paceMinTarget.value,
      paceSec: this.paceSecTarget.value,
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
        this.paceMinTarget.value = data.paceMin ?? ""
        this.paceSecTarget.value = data.paceSec ?? ""
        this.memoTarget.value = data.memo ?? ""
        this.validatePace()
        return
      } catch {
        localStorage.removeItem(key)
        return
      }
    }

    // ② 編集画面なら初期値から draft を生成
    // 既存の set.pace（decimal）を m:ss に展開して初期表示したいので、
    // 初期値がinputに入っている前提で draft 作成する（ビュー側で初期値を入れない設計の場合は別途対応）
    if (this.isEdit()) {
      // まず「現在のinput初期値」が入っている場合のみ保存
      const payload = {
        distance: this.distanceTarget.value,
        duration: this.durationTarget.value,
        calories: this.caloriesTarget.value,
        paceMin: this.paceMinTarget.value,
        paceSec: this.paceSecTarget.value,
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
