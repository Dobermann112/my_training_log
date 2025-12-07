import CalendarHeader from "react/components/calendar/CalendarHeader";
import CalendarGrid from "react/components/calendar/CalendarGrid";
import CalendarEventModal from "react/components/calendar/CalendarEventModal";

export default function CalendarPage() {
  return (
    <div style={{ padding: "1.5rem 1rem" }}>
      <CalendarHeader />
      <CalendarGrid />
      <CalendarEventModal />
    </div>
  );
}
