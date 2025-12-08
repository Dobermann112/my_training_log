import type { CalendarEvent } from "../types/calendar";

export async function fetchCalendarEvents(start: string,end: string): Promise<CalendarEvent[]> {
  const url = `/api/events?start=${start}&end=${end}`;

  try {
    const res = await fetch(url);

    if (!res.ok) {
      console.error("API Error", res.status);
      return [];
    }

    return res.json();
  } catch (err) {
    console.error("Network Error:", err);
    return [];
  }
}