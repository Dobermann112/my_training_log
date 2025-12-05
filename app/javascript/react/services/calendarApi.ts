import { CalendarEvent } from "react/types/calendar";

export async function fetchCalendarEvents(year: number, month: number): Promise<CalendarEvent[]> {
  const url = `/api/events?year=${year}&month=${month}`;

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`API Error: ${res.status}`);
  }

  return res.json();
}