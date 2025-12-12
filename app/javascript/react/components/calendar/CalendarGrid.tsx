import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useCalendarHandlers } from "react/hooks/useCalendarHandlers";
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

  const {
    handleEvents,
    handleDateClick,
    handleEventClick,
    handleEventDidMount,
  } = useCalendarHandlers(setLoading);

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
