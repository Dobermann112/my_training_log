import { CalendarEvent } from "react/types/calendar";

export async function fetchCalendarEvents(month: string): Promise<CalendarEvent[]> {
  console.log("fetchCalendarEvents called:", month);

  return [
    { id: 1, date: "2025-12-05", title: "Dummy Event" }
  ];
}