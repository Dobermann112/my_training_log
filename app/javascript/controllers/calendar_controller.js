import { Controller } from "@hotwired/stimulus"
import { Calendar } from "@fullcalendar/core"
import dayGridPlugin from "@fullcalendar/daygrid"

// Connects to data-controller="calendar"
export default class extends Controller {
  connect() {
    const calendarEl = document.getElementById("calendar")

    const calendar = new Calendar(calendarEl, {
      plugins: [dayGridPlugin],
      initialView: "dayGridMonth",
      locale: "ja",               // 日本語化
      firstDay: 1,                // 月曜始まり
      height: "auto",
      events: "/calendars.json"   // ここでRails側からデータ取得
    })

    calendar.render()
  }
}
