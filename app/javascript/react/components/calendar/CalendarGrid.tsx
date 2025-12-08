import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { fetchCalendarEvents } from "react/services/calendarApi";

export default function CalendarGrid() {
  return (
    <div style={{ marginTop: "1rem" }}>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        initialDate={new Date()}
        headerToolbar={{
          left: "",
          center: "title",
          right: "prev,next today"
        }}
        height={700}
        dayCellClassNames="fc-daycell"
        events = {async (info, successCallback) => {
          const events = await fetchCalendarEvents(info.startStr, info.endStr);
          successCallback(events);          
        }}
      />
    </div>
  );
}