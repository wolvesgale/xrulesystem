"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { DateSelectArg, EventClickArg } from "@fullcalendar/core";
import type { Agency, Schedule } from "../lib/demoStore";

export type ScheduleCalendarProps = {
  schedules: Schedule[];
  agencies: Agency[];
  visibleAgencyIds: string[];
  onToggleAgencyVisible?: (agencyId: string) => void;
  onSelectRange?: (start: Date, end: Date) => void;
  onSeriesSelect?: (seriesId: string) => void;
  isAdmin?: boolean;
};

export default function ScheduleCalendar({
  schedules,
  agencies,
  visibleAgencyIds,
  onToggleAgencyVisible,
  onSelectRange,
  onSeriesSelect,
  isAdmin = false
}: ScheduleCalendarProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const colorMap = useMemo(
    () =>
      agencies.reduce<Record<string, string>>((map, agency, index) => {
        if (agency.color) {
          map[agency.id] = agency.color;
          return map;
        }
        const fallbackPalette = ["#38bdf8", "#f97316", "#22c55e", "#a855f7", "#facc15"];
        map[agency.id] = fallbackPalette[index % fallbackPalette.length];
        return map;
      }, {}),
    [agencies]
  );

  const addDays = useCallback((date: string, amount: number) => {
    const reference = new Date(`${date}T00:00:00`);
    reference.setDate(reference.getDate() + amount);
    return reference.toISOString().slice(0, 10);
  }, []);

  const filteredSchedules = useMemo(() => {
    if (visibleAgencyIds.length === 0) {
      return [];
    }
    const visibleSet = new Set(visibleAgencyIds);
    return schedules.filter((schedule) => visibleSet.has(schedule.agencyId));
  }, [schedules, visibleAgencyIds]);

  const calendarEvents = useMemo(
    () =>
      Array.from(
        filteredSchedules.reduce((map, schedule) => {
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
        const agencyColor = colorMap[first.agencyId] ?? "#64748b";
        return {
          id: seriesId,
          title: first.title,
          start: first.date,
          end: addDays(last.date, 1),
          backgroundColor: agencyColor,
          borderColor: agencyColor,
          extendedProps: {
            seriesId,
            agencyId: first.agencyId,
            place: first.place,
            memo: first.memo
          }
        };
      }),
    [addDays, colorMap, filteredSchedules]
  );

  const handleEventClick = useCallback(
    (arg: EventClickArg) => {
      const seriesId = (arg.event.extendedProps.seriesId as string | undefined) ?? arg.event.id;
      if (!isAdmin || !seriesId) {
        return;
      }
      if (seriesId) {
        onSeriesSelect?.(seriesId);
      }
    },
    [isAdmin, onSeriesSelect]
  );

  if (!mounted) {
    return <div className="h-96 rounded-lg border border-slate-800 bg-slate-900/40" />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 text-xs text-slate-100">
        {agencies.map((agency) => {
          const checked = visibleAgencyIds.includes(agency.id);
          const color = colorMap[agency.id] ?? "#64748b";
          return (
            <label
              key={agency.id}
              className="inline-flex items-center gap-2 rounded-md bg-slate-900/50 px-3 py-1"
            >
              <input
                type="checkbox"
                className="h-3 w-3 accent-slate-100"
                checked={checked}
                disabled={!onToggleAgencyVisible}
                onChange={() => onToggleAgencyVisible?.(agency.id)}
              />
              <span
                className="inline-block h-3 w-3 rounded"
                style={{ backgroundColor: color }}
                aria-hidden
              />
              <span>{agency.name}</span>
            </label>
          );
        })}
      </div>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        height="auto"
        events={calendarEvents}
        selectable={Boolean(onSelectRange) && isAdmin}
        selectMirror
        select={(selection: DateSelectArg) => {
          if (onSelectRange && isAdmin) {
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
      />
    </div>
  );
}
