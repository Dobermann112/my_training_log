import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["list", "template", "number", "weight", "reps", "memo"]
  static values = { editMode: Boolean, date: String }

  connect() {
    this.activeSetUuids = new Set()

    // 既存行（編集画面）の uuid を登録
    this.listTarget.querySelectorAll(".set-input-row").forEach((row) => {
      const uuid = row.dataset.setUuid
      if (uuid) this.activeSetUuids.add(uuid)
    })

    // 新規作成画面のみ初期行を作る
    if (!this.editModeValue) {
      if (this.listTarget.children.length === 0) {
        this.initializeRows()
      }
    }

    const form = this.element.closest("form")
    if (form) {
      form.addEventListener("turbo:submit-end", this.handleSubmitEnd)
    }
  }

  initializeRows() {
    for (let i = 0; i < 4; i++) this.add()
  }

  add() {
    const fragment = this.templateTarget.content.cloneNode(true)
    const rowEl = fragment.querySelector(".set-input-row")

    const uuid = crypto.randomUUID()
    rowEl.dataset.setUuid = uuid

    this.activeSetUuids.add(uuid)

    this.listTarget.appendChild(rowEl)
    this.updateNumbers()
  }

  updateNumbers() {
    this.listTarget.querySelectorAll(".set-input-row").forEach((row, i) => {
      const numberEl = row.querySelector("[data-sets-target='number']")
      if (numberEl) numberEl.textContent = `セット${i + 1}`
    })
  }

  // ============================
  // 保存ボタン（CREATE / EDIT 共通）
  // ============================
  commit(event) {
    event.preventDefault()

    const drafts = this.collectDrafts()
    if (drafts.length === 0) return

    const form = this.element.closest("form")
    if (!form) return

    // 既存の draft 用 hidden input を削除
    form.querySelectorAll("[data-draft-input]").forEach(el => el.remove())

    if (this.editModeValue) {
      // ===== 編集（UPDATE）=====
      drafts.forEach(draft => {
        this.appendHidden(form, `sets[${draft.uuid}][weight]`, draft.weight)
        this.appendHidden(form, `sets[${draft.uuid}][reps]`, draft.reps)
        this.appendHidden(form, `sets[${draft.uuid}][memo]`, draft.memo)
      })
    } else {
      // ===== 新規作成（CREATE）=====
      drafts.forEach((draft, index) => {
        this.appendHidden(form, `workout[sets][${index}][weight]`, draft.weight)
        this.appendHidden(form, `workout[sets][${index}][reps]`, draft.reps)
        this.appendHidden(form, `workout[sets][${index}][memo]`, draft.memo)
      })
    }

    form.requestSubmit()
  }

  appendHidden(form, name, value) {
    const input = document.createElement("input")
    input.type = "hidden"
    input.name = name
    input.value = value ?? ""
    input.dataset.draftInput = "true"
    form.appendChild(input)
  }

  collectDrafts() {
    const drafts = []

    this.activeSetUuids.forEach((uuid) => {
      const key = `workout_set_draft:${uuid}`
      const raw = localStorage.getItem(key)
      if (!raw) return

      try {
        const data = JSON.parse(raw)
        if (this.validDraft(data)) {
          drafts.push({ uuid, ...data })
        }
      } catch {
        // 無視
      }
    })

    return drafts
  }

  validDraft(data) {
    const hasWeight = data.weight && data.weight !== ""
    const hasReps   = data.reps && data.reps !== ""
    return hasWeight || hasReps
  }

  handleSubmitEnd = (event) => {
    if (!event.detail.success) return

    this.activeSetUuids.forEach((uuid) => {
      localStorage.removeItem(`workout_set_draft:${uuid}`)
    })
  }

  commitOrBack() {
    const drafts = this.collectDrafts()

    if (drafts.length === 0) {
      if (this.editModeValue) {
        window.location.href = `/workout/${this.workoutId}`
      } else {
        const date = this.dateValue
        window.location.href = `/workouts/select_exercise?date=${date}`
      }
      return
    }

    console.log("draft exists -> should commit")
  }
}
