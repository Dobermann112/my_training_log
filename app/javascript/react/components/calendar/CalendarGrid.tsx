import { useCallback, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { fetchCalendarEvents } from "react/services/calendarApi";
import type { EventSourceFuncArg, EventInput, EventClickArg, EventMountArg } from "@fullcalendar/core";
import type { DateClickArg } from "@fullcalendar/interaction";

export default function CalendarGrid() {
  const [loading, setLoading] = useState(false);

  const overlayStyle = {
    position : "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.25)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontSize: "1.2rem",
    zIndex: 10,
    pointerEvents: "none" as const,
  };

  const handleEvents = useCallback(
    async (info: EventSourceFuncArg, successCallBack: (events: EventInput[]) => void) => {
      setLoading(true);

      try {
        const events = await fetchCalendarEvents(info.startStr, info.endStr);
        successCallBack(events);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const handleDateClick = async (info: DateClickArg) => {
    const date = info.dateStr;
    const events = await fetchCalendarEvents(date, date);
    if (events.length > 0) {
      const workoutId = events[0].id;
      window.location.href = `/workouts/${workoutId}`;
    } else {
      window.location.href = `/workouts/select_exercise?date=${date}`;
    }
  };

  const handleEventClick = (info: EventClickArg ) => {
    const workoutId = info.event.id;
    window.location.href = `/workouts/${workoutId}`;
  };

  const handleEventDidMount = (info: EventMountArg) => {
    const frame = info.el.closest(".fc-daygrid-day-frame") as HTMLElement | null;
    if (frame) {
      frame.classList.add("fc-has-workout");
    }
  };

  return (
    <div style={{ marginTop: "1rem", position: "relative" }}>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        initialDate={new Date()}
        headerToolbar={{
          left: "",
          center: "title",
          right: "prev,next today"
        }}
        height="auto"
        events={handleEvents}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        eventDidMount={handleEventDidMount}
      />
      {loading && <div style={overlayStyle}>Loading...</div>}
    </div>
  );
}