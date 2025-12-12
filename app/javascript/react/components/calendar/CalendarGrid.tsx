import { useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { EventSourceFuncArg, EventInput, EventClickArg, EventMountArg } from "@fullcalendar/core";
import type { DateClickArg } from "@fullcalendar/interaction";
import { fetchCalendarEvents } from "react/services/calendarApi";
import { overlayStyle } from "./styles/overlayStyle";

type CalendarGridProps = {
  loading: boolean;
  setLoading: (v: boolean) => void;
  setCurrentDate: (date: Date) => void;
  calendarRef: React.RefObject<FullCalendar | null>;
};

export default function CalendarGrid({
  loading,
  setLoading,
  setCurrentDate,
  calendarRef,
}: CalendarGridProps) {

  const handleEvents = useCallback(
    async (
      info: EventSourceFuncArg,
      successCallBack: (events: EventInput[]) => void
    ) => {
      setLoading(true);
      try {
        const events = await fetchCalendarEvents(info.startStr, info.endStr);
        successCallBack(events);
      } finally {
        setLoading(false);
      }
    },
    [setLoading]
  );

  const handleDateClick = async (info: DateClickArg) => {
    const date = info.dateStr;
    const events = await fetchCalendarEvents(date, date);

    if (events.length > 0) {
      window.location.href = `/workouts/${events[0].id}`;
    } else {
      window.location.href = `/workouts/select_exercise?date=${date}`;
    }
  };

  const handleEventClick = (info: EventClickArg) => {
    window.location.href = `/workouts/${info.event.id}`;
  };

  const handleEventDidMount = (info: EventMountArg) => {
    const frame = info.el.closest(".fc-daygrid-day-frame") as HTMLElement | null;
    if (frame) frame.classList.add("fc-has-workout");
  };

  return (
    <div style={{ marginTop: "1rem", position: "relative" }}>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        ref={calendarRef}
        headerToolbar={false}
        height="auto"
        events={handleEvents}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        eventDidMount={handleEventDidMount}
        datesSet={(info) => setCurrentDate(info.view.currentStart)}
      />
      {loading && <div style={overlayStyle}>Loading...</div>}
    </div>
  );
}
