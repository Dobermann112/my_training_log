import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["input"]

  connect() {
    this.highlightInitialSelection()
  }

  // 初期表示で選択済みの種目をハイライト＆セクション自動展開
  highlightInitialSelection() {
    const selectedId = this.inputTarget.value

    if (!selectedId) return

    // data-id="X" の種目 DOM を取得
    const selectedOption = this.element.querySelector(`[data-id="${selectedId}"]`)
    if (!selectedOption) return

    // ハイライト付与
    selectedOption.classList.add("selected-exercise")

    // 親のアコーディオンセクションを open（部位の自動展開）
    const accordionItem = selectedOption.closest(".accordion-item")
    if (!accordionItem) return

    const collapseEl = accordionItem.querySelector(".accordion-collapse")
    const buttonEl = accordionItem.querySelector(".accordion-button")

    if (collapseEl && buttonEl) {
      collapseEl.classList.add("show")       // セクション展開
      buttonEl.classList.remove("collapsed") // ボタン状態を展開に合わせる
    }
  }

  // クリック時の選択処理
  select(event) {
    const clickedEl = event.currentTarget
    const exerciseId = clickedEl.dataset.id

    // hidden_field に値をセット
    this.inputTarget.value = exerciseId

    // 他の選択状態を解除
    this.clearSelection()

    // 選択中にハイライト
    clickedEl.classList.add("selected-exercise")
  }

  clearSelection() {
    const options = this.element.querySelectorAll("[data-id]")
    options.forEach(opt => opt.classList.remove("selected-exercise"))
  }
}
