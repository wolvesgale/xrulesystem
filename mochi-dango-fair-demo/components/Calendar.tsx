"use client";

import { useEffect, useMemo, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { DateSelectArg, EventClickArg } from "@fullcalendar/core";
import type { Schedule } from "../lib/demoStore";

export type ScheduleCalendarProps = {
  schedules: Schedule[];
  agencyId?: string | null;
  onSelectRange?: (start: Date, end: Date) => void;
  onEventClick?: (id: string) => void;
};

export default function ScheduleCalendar({
  schedules,
  agencyId,
  onEventClick,
  onSelectRange
}: ScheduleCalendarProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const calendarEvents = useMemo(
    () =>
      schedules.map((schedule) => ({
        id: schedule.id,
        title: schedule.title,
        start: schedule.date,
        extendedProps: {
          agencyId: schedule.agencyId,
          location: schedule.location,
          memo: schedule.memo
        }
      })),
    [schedules]
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
      key={agencyId ?? "all"}
    />
  );
}
