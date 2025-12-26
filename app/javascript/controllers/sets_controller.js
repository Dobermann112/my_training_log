import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["list", "template", "number", "weight", "reps", "memo"]
  static values = { editMode: Boolean }

  connect() {
    this.activeSetUuids = new Set()
    if (!this.editModeValue) {
      // 編集画面では listTarget に既存行が入っている → initializeRows を走らせない
      if (this.listTarget.children.length === 0) {
        this.initializeRows()
      }
    }
  }

  initializeRows() {
    for (let i = 0; i < 4; i++) this.add()
  }

  add() {
    // テンプレート複製
    const fragment = this.templateTarget.content.cloneNode(true)
    const rowEl = fragment.querySelector(".set-input-row")

    const uuid = crypto.randomUUID()
    rowEl.dataset.setUuid = uuid

    this.activeSetUuids.add(uuid)

    // 現在の行数
    const index = this.listTarget.children.length
    rowEl.dataset.index = index

    // 編集モードかどうか判定
    const isEditMode = this.isEditMode()

    // =====================
    // name を付ける
    // =====================
    if (isEditMode) {
      // 編集 → sets[new_x][weight]
      rowEl.querySelector("[data-sets-target='weight']").name = `sets[new_${index}][weight]`
      rowEl.querySelector("[data-sets-target='reps']").name   = `sets[new_${index}][reps]`
      rowEl.querySelector("[data-sets-target='memo']").name   = `sets[new_${index}][memo]`
    } else {
      // 新規作成 → workout[sets][x][weight]
      rowEl.querySelector("[data-sets-target='weight']").name = `workout[sets][${index}][weight]`
      rowEl.querySelector("[data-sets-target='reps']").name   = `workout[sets][${index}][reps]`
      rowEl.querySelector("[data-sets-target='memo']").name   = `workout[sets][${index}][memo]`
    }

    // list 配下に追加
    this.listTarget.appendChild(rowEl)

    // 番号振り直し
    this.updateNumbers()
  }

  // ============================
  // 編集モードかどうか判定する
  // ============================
  isEditMode() {
    // 既存 hidden_field_tag がある → 編集モード
    return this.editModeValue
  }

  // ============================
  // 行番号（セット1, セット2…）を振り直す
  // ============================
  updateNumbers() {
    this.listTarget.querySelectorAll(".set-input-row").forEach((row, i) => {
      const numberEl = row.querySelector("[data-sets-target='number']")
      if (numberEl) {
        numberEl.textContent = `セット${i + 1}`
      }
      row.dataset.index = i
    })
  }

  appendHidden(form, name, value) {
    const input = document.createElement("input")
    input.type = "hidden"
    input.name = name
    input.value = value ?? ""
    input.dataset.draftInput = "true"
    form.appendChild(input)
  }  

  commit() {
    console.log("commit clicked")
  
    const drafts = this.collectDrafts()
    console.log("drafts to commit:", drafts)
  
    if (drafts.length === 0) {
      console.warn("no valid drafts")
      return
    }
  
    const form = this.element.closest("form")
    if (!form) {
      console.error("form not found")
      return
    }
  
    // 既存の draft 用 hidden input を削除（再保存対策）
    form.querySelectorAll("[data-draft-input]").forEach(el => el.remove())
  
    drafts.forEach((draft, index) => {
      this.appendHidden(form, `workout[sets][${index}][weight]`, draft.weight)
      this.appendHidden(form, `workout[sets][${index}][reps]`, draft.reps)
      this.appendHidden(form, `workout[sets][${index}][memo]`, draft.memo)
    })
  
    // form を送信（Turbo/Rails の既存フローに乗せる）
    form.requestSubmit()
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
        console.warn("invalid draft skipped:", key)
      }
    })
    return drafts
  }  

  validDraft(data) {
    const hasWeight = data.weight && data.weight !== ""
    const hasReps   = data.reps && data.reps !== ""
    return hasWeight || hasReps
  }
}
