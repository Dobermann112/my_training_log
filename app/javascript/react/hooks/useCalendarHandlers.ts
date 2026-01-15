import { useCallback } from "react";
import { fetchCalendarEvents } from "react/services/calendarApi";
import type {
  EventSourceFuncArg,
  EventInput,
  EventClickArg,
  EventMountArg,
} from "@fullcalendar/core";
import type { DateClickArg } from "@fullcalendar/interaction";
import type { CalendarSummary } from "react/types/calendarSummary";

export function useCalendarHandlers(
  setLoading: (v: boolean) => void,
  summaries: Record<string, CalendarSummary>
) {

  const handleEvents = useCallback(async (
    info: EventSourceFuncArg,
    successCallBack: (events: EventInput[]) => void
  ) => {
    setLoading(true);
    try {
      const events = await fetchCalendarEvents(info.startStr, info.endStr);
      successCallBack(events);
    } finally {
      setLoading(false);
    }
  }, [setLoading]);

  const handleDateClick = useCallback((info: DateClickArg) => {
    const date = info.dateStr.slice(0, 10);
    const summary = summaries[date];

    if (summary?.has_workout && summary.workout_id) {
      window.location.href = `/workouts/${summary.workout_id}`;
    } else if (summary?.has_cardio) {
      window.location.href = `/workouts/by_date?date=${date}`;
    } else {
      window.location.href = `/workouts/select_exercise?date=${date}`;
    }
  }, [summaries]);

  const handleEventClick = useCallback((info: EventClickArg) => {
    window.location.href = `/workouts/${info.event.id}`;
  }, []);

  return {
    handleEvents,
    handleDateClick,
    handleEventClick,
  };
}
