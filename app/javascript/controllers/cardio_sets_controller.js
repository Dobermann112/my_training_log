import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["list", "template", "number"]
  static values = { date: String, editMode: Boolean }

  connect() {
    this.activeSetUuids = new Set()

    this.listTarget.querySelectorAll(".set-input-row").forEach(row => {
      const uuid = row.dataset.setUuid
      if (uuid) this.activeSetUuids.add(uuid)
    })

    if (!this.editModeValue && this.listTarget.children.length === 0) {
      this.add()
    }
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
      const el = row.querySelector("[data-cardio-sets-target='number']")
      if (el) el.textContent = `セット${i + 1}`
    })
  }

  commit(event) {
    const drafts = this.collectDrafts()
    if (!this.editModeValue && drafts.length === 0) return

    const form = this.element.closest("form")
    if (!form) return

    // 既存の draft 用 hidden input を削除
    form.querySelectorAll("[data-draft-input]").forEach(el => el.remove())
  
    if (this.editModeValue) {
      drafts.forEach(draft => {
        this.appendHidden(form, `sets[${draft.uuid}][distance]`, draft.distance)
        this.appendHidden(form, `sets[${draft.uuid}][duration]`, draft.duration)
        this.appendHidden(form, `sets[${draft.uuid}][calories]`, draft.calories)
        this.appendHidden(form, `sets[${draft.uuid}][pace]`, draft.pace)
        this.appendHidden(form, `sets[${draft.uuid}][memo]`, draft.memo)
      })
    } else {
      drafts.forEach((draft, index) => {
        this.appendHidden(form, `sets[${index}][distance]`, draft.distance)
        this.appendHidden(form, `sets[${index}][duration]`, draft.duration)
        this.appendHidden(form, `sets[${index}][calories]`, draft.calories)
        this.appendHidden(form, `sets[${index}][pace]`, draft.pace)
        this.appendHidden(form, `sets[${index}][memo]`, draft.memo)
      })
    }

    const deletedIds = this.collectDeletedSetIds()
    deletedIds.forEach((id) => {
      this.appendHidden(form, `sets[${id}][_destroy]`, "1")
    })

    drafts.forEach(draft => {
      localStorage.removeItem(`cardio_set_draft:${draft.uuid}`)
    })
  
    form.requestSubmit()
  }

  commitOrBack() {
    const drafts = this.collectDrafts()

    if (!this.editModeValue && drafts.length === 0) {
      window.location.href = `/workouts/select_exercise?date=${this.dateValue}`
      return
    }
    
    this.commit()
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
  
    this.listTarget.querySelectorAll(".set-input-row").forEach(row => {
      const uuid = row.dataset.setUuid
      if (!uuid) return
  
      const raw = localStorage.getItem(`cardio_set_draft:${uuid}`)
      if (!raw) return
  
      try {
        const data = JSON.parse(raw)
        if (this.validDraft(data)) {
          drafts.push({ uuid, ...data })
        }
      } catch {}
    })
  
    return drafts
  }

  collectDeletedSetIds() {
    const deletedIds = []
  
    this.listTarget.querySelectorAll(".set-input-row").forEach((row) => {
      const uuid = row.dataset.setUuid
      const persisted = row.dataset.persisted === "true"
  
      if (!persisted) return
  
      const key = `cardio_set_draft:${uuid}`
      const draft = localStorage.getItem(key)
  
      if (!draft) {
        deletedIds.push(uuid)
      }
    })
  
    return deletedIds
  }  
  
  validDraft(data) {
    return data.duration && data.duration !== ""
  }  
}
