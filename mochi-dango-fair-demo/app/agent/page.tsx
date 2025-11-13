"use client";

import { useMemo, useState } from "react";
import Calendar from "../../components/Calendar";
import ScheduleList from "../../components/ScheduleList";
import { getSchedulesForAgent } from "../../lib/demoStore";

function formatDateDisplay(date: string): string {
  return date.replace(/-/g, "/");
}

export default function AgentPage() {
  const schedules = useMemo(() => getSchedulesForAgent("demo-agent"), []);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);

  const calendarEvents = useMemo(
    () =>
      schedules.map((schedule) => ({
        id: schedule.id,
        title: schedule.title,
        date: schedule.date
      })),
    [schedules]
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_2fr]">
      <aside className="space-y-6 rounded-xl border border-slate-800 bg-slate-900/60 p-6 shadow">
        <div>
          <h2 className="text-lg font-semibold">こんにちは、代理店のみなさま</h2>
          <p className="mt-2 text-sm text-slate-300">
            最新の催事スケジュールを確認し、準備物のチェックを忘れずに行いましょう。
          </p>
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-200">本日の持ち物チェック</h3>
          <ul className="space-y-2 text-sm text-slate-300">
            <li className="flex items-center gap-2">
              <span className="inline-flex h-4 w-4 items-center justify-center rounded-sm border border-slate-600">✔</span>
              試食用トング・トレイ
            </li>
            <li className="flex items-center gap-2">
              <span className="inline-flex h-4 w-4 items-center justify-center rounded-sm border border-slate-600">✔</span>
              レジスター・釣銭セット
            </li>
            <li className="flex items-center gap-2">
              <span className="inline-flex h-4 w-4 items-center justify-center rounded-sm border border-slate-600">✔</span>
              冷蔵保存用クーラーボックス
            </li>
          </ul>
        </div>
        <div className="space-y-2 text-sm text-slate-300">
          <h3 className="text-sm font-semibold text-slate-200">次回出店日</h3>
          <p>
            {schedules.length > 0
              ? `${formatDateDisplay(schedules[0].date)} ${schedules[0].location}`
              : "スケジュールが登録されていません"}
          </p>
        </div>
      </aside>
      <section className="flex flex-col gap-6">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow">
          <h2 className="mb-4 text-lg font-semibold">催事スケジュール</h2>
          <Calendar
            events={calendarEvents}
            onEventClick={(id) => setSelectedScheduleId(id)}
          />
        </div>
        <div>
          <h2 className="mb-3 text-lg font-semibold">スケジュール一覧</h2>
          <ScheduleList schedules={schedules} highlightId={selectedScheduleId} />
        </div>
      </section>
    </div>
  );
}
