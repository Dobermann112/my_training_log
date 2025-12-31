import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["list", "template", "number", "weight", "reps", "memo"]
  static values = { editMode: Boolean, date: String, workoutId: Number }

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
  commit() {
    const drafts = this.collectDrafts()
    if (!this.editModeValue && drafts.length === 0) return

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

    const deletedIds = this.collectDeletedSetIds()
    deletedIds.forEach((id) => {
      this.appendHidden(form, `sets[${id}][_destroy]`, "1")
    })

    drafts.forEach(draft => {
      localStorage.removeItem(`workout_set_draft:${draft.uuid}`)
    })

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

  commitOrBack() {
    const drafts = this.collectDrafts()

    if (!this.editModeValue && drafts.length === 0) {
      window.location.href = `/workouts/select_exercise?date=${this.dateValue}`
      return
    }
    
    this.commit()
  }

  collectDeletedSetIds() {
    const deletedIds = []
  
    this.listTarget.querySelectorAll(".set-input-row").forEach((row) => {
      const uuid = row.dataset.setUuid
      const persisted = row.dataset.persisted === "true"
  
      if (!persisted) return
  
      const key = `workout_set_draft:${uuid}`
      const draft = localStorage.getItem(key)
  
      // persisted なのに draft が存在しない = 削除意思
      if (!draft) {
        deletedIds.push(uuid)
      }
    })
  
    return deletedIds
  }  

  copyPrevious(event) {
    const previousSets = JSON.parse(event.currentTarget.dataset.previousSets)

    this.clearDrafts()
    this.clearRows()

    previousSets.forEach(() => { this.add() })

    const rows = this.element.querySelectorAll(".set-input-row")

    rows.forEach((row, index) => {
      const data = previousSets[index]

      const weightInput = row.querySelector('input[data-workout-set-create-target="weight"]')
      const repsInput   = row.querySelector('input[data-workout-set-create-target="reps"]')

      if (weightInput) weightInput.value = data.weight
      if (repsInput)   repsInput.value   = data.reps
    })

    requestAnimationFrame(() => {
      rows.forEach(row => {
        row.querySelectorAll(
          'input[data-workout-set-create-target="weight"], ' +
          'input[data-workout-set-create-target="reps"]'
        ).forEach(el => {
          el.dispatchEvent(new Event("input", { bubbles: true }))
        })
      })

      console.log("drafts saved after stimulus connect")
    })
  }

  clearDrafts() {
    Object.keys(localStorage)
      .filter(key => key.startsWith("workout_set_draft:"))
      .forEach(key => localStorage.removeItem(key))
  }

  clearRows() {
    const rows = this.element.querySelectorAll(".set-input-row")
    console.log("before clear:", rows.length)
    
    rows.forEach(row => row.remove())

    console.log(
      "after clear:",
      this.element.querySelectorAll(".set-input-row").length
    )
  }
}
