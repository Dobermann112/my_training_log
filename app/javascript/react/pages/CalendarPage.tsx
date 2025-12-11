import { useState, useRef } from "react";
import FullCalendar from "@fullcalendar/react/";
import CalendarHeader from "react/components/calendar/CalendarHeader";
import CalendarGrid from "react/components/calendar/CalendarGrid";
import CalendarEventModal from "react/components/calendar/CalendarEventModal";

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const calendarRef = useRef<FullCalendar | null>(null);

  const handlePrev = () => calendarRef.current?.getApi().prev();
  const handleNext = () => calendarRef.current?.getApi().next();
  const handleToday = () => calendarRef.current?.getApi().today();

  return (
    <div style={{ padding: "1.5rem 1rem" }}>

      <CalendarHeader 
        currentDate={currentDate}
        onPrev={handlePrev}
        onNext={handleNext}
        onToday={handleToday}
      />
      
      <CalendarGrid 
        currentDate={currentDate}
        setCurrentDate={setCurrentDate}
        loading={loading}
        setLoading={setLoading}
        calendarRef={calendarRef}
      />
      
      <CalendarEventModal />
    </div>
  );
}
