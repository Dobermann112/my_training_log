import type { CalendarEvent } from "../types/calendar";

export async function fetchCalendarEvents(start: string,end: string): Promise<CalendarEvent[]> {
  const url = `/api/events?start=${start}&end=${end}`;

  try {
    const res = await fetch(url);

    if (!res.ok) {
      console.error("API Error", res.status);
      return [];
    }

    const data = await res.json();

    return data.map((e: any) => ({
      id: String(e.id),
      start: e.start,
      end: e.end ?? undefined
    }));
  } catch (err) {
    console.error("Network Error:", err);
    return [];
  }
}

export async function fetchCalendarSummaries(start: string, end: string) {
  const res = await fetch(`/api/calendar_summaries?start=${start}&end=${end}`);
  if (!res.ok) return [];

  const data = await res.json();
  return data.summaries as {
    date: string;
    has_workout: boolean;
    workout_id: number | null;
    has_cardio: boolean;
  }[];
}
