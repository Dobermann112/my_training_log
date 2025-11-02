import { Controller } from "@hotwired/stimulus"
import { Calendar } from "@fullcalendar/core"
import dayGridPlugin from "@fullcalendar/daygrid"

// Connects to data-controller="calendar"
export default class extends Controller {
  connect() {
    const el = document.getElementById("calendar")

    const calendar = new Calendar(el, {
      plugins: [dayGridPlugin],
      initialView: "dayGridMonth",
      locale: "ja",
      firstDay: 1,
      height: "auto"
    })

    calendar.render()
  }
}
