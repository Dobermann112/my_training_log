import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["list", "template", "number", "weight", "reps", "memo"]
  static values = { editMode: Boolean }

  connect() {
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
}
