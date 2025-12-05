import { useEffect, useState } from "react";
import CalendarHeader from "react/components/calendar/CalendarHeader";
import CalendarGrid from "react/components/calendar/CalendarGrid";
import CalendarEventModal from "react/components/calendar/CalendarEventModal";

import { CalendarEvent } from "react/types/calendar";
import { fetchCalendarEvents } from "react/services/calendarApi";

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const data = await fetchCalendarEvents("2025-12");
      setEvents(data);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div style={{ color: "white" }}>Loading Calendar...</div>;

  return (
    <div style={{ padding: "1rem" }}>
      <CalendarHeader />
      <CalendarGrid />
      <CalendarEventModal />

      {/* 開発中のデバッグ用 */}
      <pre style={{ color: "white" }}>{JSON.stringify(events, null, 2)}</pre>
    </div>
  );
}
