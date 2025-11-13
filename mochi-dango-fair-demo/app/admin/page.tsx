"use client";

import { useMemo, useState } from "react";
import Calendar from "../../components/Calendar";
import RuleForm from "../../components/RuleForm";
import ScheduleList from "../../components/ScheduleList";
import { demoStore, type Schedule } from "../../lib/demoStore";

export default function AdminPage() {
  const [highlightSeriesId, setHighlightSeriesId] = useState<string | null>(null);
  const [selectedAgencyId, setSelectedAgencyId] = useState<string | null>(
    demoStore.agencies[0]?.id ?? null
  );
  const [refreshKey, setRefreshKey] = useState(0);

  const schedules = useMemo<Schedule[]>(() => {
    const base = demoStore.getAllSchedules();
    if (!selectedAgencyId) {
      return base;
    }
    return base.filter((schedule) => schedule.agencyId === selectedAgencyId);
  }, [selectedAgencyId, refreshKey]);

  const handleScheduleAdded = () => {
    setRefreshKey((prev) => prev + 1);
    setHighlightSeriesId(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">管理者ダッシュボード</h1>
          <p className="text-sm text-slate-400">
            代理店ごとのスケジュールとルールを一元管理します。
          </p>
        </div>
        <label className="flex w-full max-w-xs flex-col gap-1 text-sm text-slate-200">
          表示する代理店
          <select
            value={selectedAgencyId ?? "all"}
            onChange={(event) => {
              const value = event.target.value;
              setHighlightSeriesId(null);
              setSelectedAgencyId(value === "all" ? null : value);
              setRefreshKey((prev) => prev + 1);
            }}
            className="rounded-md border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
          >
            <option value="all">全代理店</option>
            {demoStore.agencies.map((agency) => (
              <option key={agency.id} value={agency.id}>
                {agency.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_2fr]">
        <RuleForm
          agencies={demoStore.agencies}
          selectedAgencyId={selectedAgencyId}
          editingSeriesId={null}
          initialValues={null}
          onSaved={handleScheduleAdded}
        />
        <div className="flex flex-col gap-6">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow">
            <h2 className="mb-4 text-lg font-semibold">催事スケジュールカレンダー</h2>
            <Calendar
              schedules={schedules}
              agencyId={selectedAgencyId}
              onSeriesSelect={(seriesId) => setHighlightSeriesId(seriesId)}
            />
          </div>
          <div>
            <h2 className="mb-3 text-lg font-semibold">スケジュール一覧</h2>
            <ScheduleList
              schedules={schedules}
              agencyId={selectedAgencyId}
              highlightSeriesId={highlightSeriesId}
              onSeriesSelect={(seriesId) => setHighlightSeriesId(seriesId)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
