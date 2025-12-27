import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  remove(event) {
    const uuid = event.currentTarget.dataset.setUuid
    if (!uuid) return

    localStorage.removeItem(`workout_set_draft:${uuid}`)
  }
}
