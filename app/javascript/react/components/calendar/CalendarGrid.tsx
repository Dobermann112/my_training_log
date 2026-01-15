import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useCalendarHandlers } from "react/hooks/useCalendarHandlers";
import { overlayStyle } from "./styles/overlayStyle";
import { useState } from "react";
import { fetchCalendarSummaries } from "react/services/calendarApi";
import type { CalendarSummary } from "react/types/calendarSummary";

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

  const [summaries, setSummaries] = useState<Record<string, CalendarSummary>>({});

  const {
    handleEvents,
    handleDateClick,
    handleEventClick,
  } = useCalendarHandlers(setLoading, summaries);

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
        datesSet={async (info) => {
          setCurrentDate(info.view.currentStart);
          
          const start = info.startStr;
          const end   = info.endStr;
          const data = await fetchCalendarSummaries(start, end);
          const map: Record<string, CalendarSummary> = {};
          data.forEach((d) => {
            map[d.date] = d;
          });
        
          setSummaries(map);
        }}
        dayCellClassNames={(arg) => {
          const d = arg.date;
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        
          const summary = summaries[key];
          if (!summary) return [];
        
          return summary.has_workout || summary.has_cardio
            ? ["fc-has-workout"]
            : [];
        }}
        
      />
      {loading && <div style={overlayStyle}>Loading...</div>}
    </div>
  );
}
