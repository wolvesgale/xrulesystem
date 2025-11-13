"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { DateSelectArg, EventClickArg } from "@fullcalendar/core";
import type { Schedule } from "../lib/demoStore";

export type ScheduleCalendarProps = {
  schedules: Schedule[];
  agencyId?: string | null;
  onSelectRange?: (start: Date, end: Date) => void;
  onSeriesSelect?: (seriesId: string) => void;
};

export default function ScheduleCalendar({
  schedules,
  agencyId,
  onSelectRange,
  onSeriesSelect
}: ScheduleCalendarProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const addDays = useCallback((date: string, amount: number) => {
    const reference = new Date(`${date}T00:00:00`);
    reference.setDate(reference.getDate() + amount);
    return reference.toISOString().slice(0, 10);
  }, []);

  const calendarEvents = useMemo(
    () =>
      Array.from(
        schedules.reduce((map, schedule) => {
          const key = schedule.seriesId ?? schedule.id;
          const list = map.get(key) ?? [];
          list.push(schedule);
          map.set(key, list);
          return map;
        }, new Map<string, Schedule[]>())
      ).map(([seriesId, seriesSchedules]) => {
        const sorted = [...seriesSchedules].sort((a, b) => a.date.localeCompare(b.date));
        const first = sorted[0];
        const last = sorted[sorted.length - 1];
        return {
          id: seriesId,
          title: first.title,
          start: first.date,
          end: addDays(last.date, 1),
          extendedProps: {
            seriesId,
            agencyId: first.agencyId,
            place: first.place,
            memo: first.memo
          }
        };
      }),
    [addDays, schedules]
  );

  const handleEventClick = useCallback(
    (arg: EventClickArg) => {
      const seriesId = (arg.event.extendedProps.seriesId as string | undefined) ?? arg.event.id;
      if (seriesId) {
        onSeriesSelect?.(seriesId);
      }
    },
    [onSeriesSelect]
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
      eventClick={handleEventClick}
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
