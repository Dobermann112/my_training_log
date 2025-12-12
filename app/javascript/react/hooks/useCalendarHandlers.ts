import { useCallback } from "react";
import { fetchCalendarEvents } from "react/services/calendarApi";
import type {
  EventSourceFuncArg,
  EventInput,
  EventClickArg,
  EventMountArg,
} from "@fullcalendar/core";
import type { DateClickArg } from "@fullcalendar/interaction";

export function useCalendarHandlers(setLoading: (v: boolean) => void) {

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

  const handleDateClick = useCallback(async (info: DateClickArg) => {
    const date = info.dateStr;
    const events = await fetchCalendarEvents(date, date);

    if (events.length > 0) {
      window.location.href = `/workouts/${events[0].id}`;
    } else {
      window.location.href = `/workouts/select_exercise?date=${date}`;
    }
  }, []);

  const handleEventClick = useCallback((info: EventClickArg) => {
    window.location.href = `/workouts/${info.event.id}`;
  }, []);

  const handleEventDidMount = useCallback((info: EventMountArg) => {
    const frame = info.el.closest(".fc-daygrid-day-frame") as HTMLElement | null;
    if (frame) frame.classList.add("fc-has-workout");
  }, []);

  return {
    handleEvents,
    handleDateClick,
    handleEventClick,
    handleEventDidMount,
  };
}
