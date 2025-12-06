import type { CalendarEvent } from "../types/calendar";

export async function fetchCalendarEvents(start: string,end: string): Promise<CalendarEvent[]> {
  const url = `/api/events?start=${start}&end=${end}`;

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`API Error: ${res.status}`);
  }

  return res.json();
}