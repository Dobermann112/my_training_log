import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["list", "template"]

  connect() {
    // 初回ロード時に4行作る
    this.initializeRows()
  }

  initializeRows() {
    // 既に行がある場合は何もしない（戻る → 入力保持用）
    if (this.listTarget.children.length > 0) return

    for (let i = 0; i < 4; i++) {
      this.add()
    }
  }

  add() {
    // テンプレートから行を複製
    const fragment = this.templateTarget.content.cloneNode(true)
    const rowEl = fragment.querySelector(".set-input-row")

    // セット行に data-index を付与（番号を管理しやすくする）
    const index = this.listTarget.children.length
    rowEl.dataset.index = index

    // 番号の書き換え
    const numberEl = rowEl.querySelector("[data-sets-target='number']")
    numberEl.textContent = `セット${index + 1}`

    // 各 input に name 属性を付与
    const weightInput = rowEl.querySelector("[data-sets-target='weight']")
    const repsInput = rowEl.querySelector("[data-sets-target='reps']")
    const memoInput = rowEl.querySelector("[data-sets-target='memo']")

    weightInput.name = `workout[sets][${index}][weight]`
    repsInput.name   = `workout[sets][${index}][reps]`
    memoInput.name   = `workout[sets][${index}][memo]`

    // list 内に追加
    this.listTarget.appendChild(rowEl)
  }
}
