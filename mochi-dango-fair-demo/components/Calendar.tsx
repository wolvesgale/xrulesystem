"use client";

import { useEffect, useMemo, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { DateSelectArg, EventClickArg } from "@fullcalendar/core";
import "@fullcalendar/daygrid/index.css";

type CalendarEvent = {
  id: string;
  title: string;
  date: string;
};

export type ScheduleCalendarProps = {
  events: CalendarEvent[];
  onSelectRange?: (start: Date, end: Date) => void;
  onEventClick?: (id: string) => void;
};

export default function ScheduleCalendar({
  events,
  onEventClick,
  onSelectRange
}: ScheduleCalendarProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const calendarEvents = useMemo(
    () =>
      events.map((event) => ({
        id: event.id,
        title: event.title,
        start: event.date
      })),
    [events]
  );

  if (!mounted) {
    return <div className="h-96 rounded-lg border border-slate-800 bg-slate-900/40" />;
  }

  return (
    <FullCalendar
      plugins={[dayGridPlugin, interactionPlugin]}
      initialView="dayGridMonth"
      height="auto"
      events={calendarEvents}
      selectable={Boolean(onSelectRange)}
      selectMirror
      select={(selection: DateSelectArg) => {
        if (onSelectRange) {
          onSelectRange(selection.start, selection.end);
        }
      }}
      eventClick={(arg: EventClickArg) => {
        if (onEventClick) {
          onEventClick(arg.event.id);
        }
      }}
      headerToolbar={{
        left: "prev,next today",
        center: "title",
        right: "dayGridMonth"
      }}
      displayEventEnd={false}
      weekends
      locale="ja"
    />
  );
}
