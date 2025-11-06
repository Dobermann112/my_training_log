import { Controller } from "@hotwired/stimulus"
import { Calendar } from "@fullcalendar/core"
import dayGridPlugin from "@fullcalendar/daygrid"
import interactionPlugin from "@fullcalendar/interaction" 

// Connects to data-controller="calendar"
export default class extends Controller {
  connect() {
    const el = document.getElementById("calendar")

    const calendar = new Calendar(el, {
      plugins: [dayGridPlugin, interactionPlugin],
      initialView: "dayGridMonth",
      locale: "en",
      firstDay: 0,
      height: "auto",
      events: "/calendars.json",
      eventColor: "#3a86ff",
      headerToolbar: {
        left: "prev,next today",
        center: "title",
        right: ""
      },
      buttonText: {
        today: "Today"
      },
      dateClick: (info) => {
        const existingEvent = calendar.getEvents().find(e => e.startStr === info.dateStr)
        if (existingEvent) {
          window.location.href = existingEvent.url
        } else {
          window.location.href = `/workouts/new?date=${info.dateStr}`
        }
      }
    })

    calendar.render()
  }
}
