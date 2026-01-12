"use client";

import clsx from "clsx";
import { useMemo } from "react";
import type { Agency, Schedule } from "../lib/demoStore";

type ScheduleListProps = {
  schedules: Schedule[];
  highlightSeriesId?: string | null;
  agencyId?: string | null;
  onSeriesSelect?: (seriesId: string) => void;
  onVenueSelect?: (place: string) => void;
  agencies: Agency[];
  visibleAgencyIds: string[];
  isAdmin?: boolean;
};

function formatDate(date: string): string {
  return date.replace(/-/g, "/");
}

function formatTimeRange(start: string, end: string): string {
  return `${start}〜${end}`;
}

type SeriesRow = {
  seriesId: string;
  startDate: string;
  endDate: string;
  title: string;
  place: string;
  memo: string;
  startTime: string;
  endTime: string;
  agencyId: string;
};

function formatDateRange(row: SeriesRow): string {
  const start = formatDate(row.startDate);
  const end = formatDate(row.endDate);
  if (start === end) {
    return start;
  }
  return `${start}〜${end}`;
}

export default function ScheduleList({
  schedules,
  highlightSeriesId,
  agencyId,
  onSeriesSelect,
  onVenueSelect,
  agencies,
  visibleAgencyIds,
  isAdmin = false
}: ScheduleListProps) {
  const rows = useMemo<SeriesRow[]>(() => {
    if (visibleAgencyIds.length === 0) {
      return [];
    }
    const visibleSet = new Set(visibleAgencyIds);
    const grouped = schedules.reduce((map, schedule) => {
      if (!visibleSet.has(schedule.agencyId)) {
        return map;
      }
      const key = schedule.seriesId ?? schedule.id;
      const list = map.get(key) ?? [];
      list.push(schedule);
      map.set(key, list);
      return map;
    }, new Map<string, Schedule[]>());

    return Array.from(grouped.entries()).map(([seriesId, group]) => {
      const sorted = [...group].sort((a, b) => a.date.localeCompare(b.date));
      const first = sorted[0];
      const last = sorted[sorted.length - 1];
      return {
        seriesId,
        startDate: first.date,
        endDate: last.date,
        title: first.title,
        place: first.place,
        memo: first.memo ?? "",
        startTime: first.startTime,
        endTime: first.endTime,
        agencyId: first.agencyId
      };
    })
      .sort((a, b) => a.startDate.localeCompare(b.startDate));
  }, [schedules, visibleAgencyIds]);

  const agencyColorMap = useMemo(
    () =>
      agencies.reduce<Record<string, string>>((map, agency, index) => {
        if (agency.color) {
          map[agency.id] = agency.color;
        } else {
          const fallbackPalette = ["#38bdf8", "#f97316", "#22c55e", "#a855f7", "#facc15"];
          map[agency.id] = fallbackPalette[index % fallbackPalette.length];
        }
        return map;
      }, {}),
    [agencies]
  );

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/40 p-6 text-sm text-slate-300">
        {agencyId
          ? "選択中の代理店にはスケジュールが登録されていません。"
          : "表示するスケジュールがありません。"}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 shadow">
      <table className="min-w-full divide-y divide-slate-800 text-sm">
        <thead className="bg-slate-900/80 text-left text-xs uppercase tracking-wider text-slate-400">
          <tr>
            <th className="px-4 py-3">日付</th>
            <th className="px-4 py-3">時間帯</th>
            <th className="px-4 py-3">催事場所</th>
            <th className="px-4 py-3">メモ</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {rows.map((row) => {
            const isHighlight = highlightSeriesId === row.seriesId;
            const seriesColor = agencyColorMap[row.agencyId] ?? "#64748b";
            const handleRowClick = () => {
              if (isAdmin && onSeriesSelect) {
                onSeriesSelect(row.seriesId);
                return;
              }
              if (onVenueSelect) {
                onVenueSelect(row.place);
              }
            };

            return (
              <tr
                key={row.seriesId}
                className={clsx(
                  "transition",
                  isHighlight ? "bg-slate-800/80" : "hover:bg-slate-800/40",
                  isAdmin && onSeriesSelect ? "cursor-pointer" : onVenueSelect ? "cursor-pointer" : "cursor-default"
                )}
                onClick={handleRowClick}
              >
                <td className="px-4 py-3 font-medium text-slate-100">
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block h-3 w-3 rounded"
                      style={{ backgroundColor: seriesColor }}
                      aria-hidden
                    />
                    {formatDateRange(row)}
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-200">
                  {formatTimeRange(row.startTime, row.endTime)}
                </td>
                <td className="px-4 py-3 text-slate-200">{row.place}</td>
                <td className="px-4 py-3 text-slate-300">{row.memo || "-"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
