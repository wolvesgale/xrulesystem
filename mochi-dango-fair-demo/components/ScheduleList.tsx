"use client";

import clsx from "clsx";
import type { Schedule } from "../lib/demoStore";

type ScheduleListProps = {
  schedules: Schedule[];
  highlightId?: string | null;
};

function formatDate(date: string): string {
  return date.replace(/-/g, "/");
}

function formatTimeRange(start: string, end: string): string {
  return `${start}〜${end}`;
}

export default function ScheduleList({ schedules, highlightId }: ScheduleListProps) {
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
          {schedules.map((schedule) => {
            const isHighlight = highlightId === schedule.id;
            return (
              <tr
                key={schedule.id}
                className={clsx(
                  "transition",
                  isHighlight
                    ? "bg-slate-800/80"
                    : "hover:bg-slate-800/40"
                )}
              >
                <td className="px-4 py-3 font-medium text-slate-100">
                  {formatDate(schedule.date)}
                </td>
                <td className="px-4 py-3 text-slate-200">
                  {formatTimeRange(schedule.startTime, schedule.endTime)}
                </td>
                <td className="px-4 py-3 text-slate-200">{schedule.location}</td>
                <td className="px-4 py-3 text-slate-300">{schedule.memo ?? "-"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
