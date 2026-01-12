"use client";

import { useMemo, useState } from "react";
import Calendar from "./Calendar";
import RuleForm from "./RuleForm";
import ScheduleList from "./ScheduleList";
import { VenueManager } from "./venues/VenueManager";
import { AgencyManager } from "./AgencyManager";
import { demoStore, type Schedule } from "@/lib/demoStore";

// Client-side admin dashboard with scheduling and venue tools.
export function AdminDashboardClient() {
  const isAdmin = true;
  const [highlightSeriesId, setHighlightSeriesId] = useState<string | null>(null);
  const [selectedAgencyId, setSelectedAgencyId] = useState<string | null>(
    demoStore.agencies[0]?.id ?? null
  );
  const [visibleAgencyIds, setVisibleAgencyIds] = useState<string[]>(
    demoStore.agencies.map((agency) => agency.id)
  );
  const [refreshKey, setRefreshKey] = useState(0);
  const [editingSeriesId, setEditingSeriesId] = useState<string | null>(null);
  const [editingInitialValues, setEditingInitialValues] =
    useState<{
      seriesId: string;
      dates: string[];
      title: string;
      place: string;
      memo: string;
      startTime: string;
      endTime: string;
      agencyId: string;
    } | null>(null);

  const schedules = useMemo<Schedule[]>(() => demoStore.getAllSchedules(), [refreshKey]);

  const ensureVisibleAgency = (agencyId: string) => {
    setVisibleAgencyIds((prev) => (prev.includes(agencyId) ? prev : [...prev, agencyId]));
  };

  const clearEditingState = () => {
    setHighlightSeriesId(null);
    setEditingSeriesId(null);
    setEditingInitialValues(null);
  };

  const handleScheduleSaved = () => {
    setRefreshKey((prev) => prev + 1);
    clearEditingState();
  };

  const handleAgencyChange = (value: string) => {
    const nextValue = value || null;
    setSelectedAgencyId(nextValue);
    if (nextValue) {
      ensureVisibleAgency(nextValue);
    }
    clearEditingState();
  };

  const handleToggleAgencyVisible = (agencyId: string) => {
    setVisibleAgencyIds((prev) =>
      prev.includes(agencyId) ? prev.filter((id) => id !== agencyId) : [...prev, agencyId]
    );
  };

  const handleSeriesSelect = (seriesId: string) => {
    const seriesSchedules = demoStore.getSchedulesBySeries(seriesId);
    if (seriesSchedules.length === 0) {
      return;
    }
    const sorted = [...seriesSchedules].sort((a, b) => a.date.localeCompare(b.date));
    const first = sorted[0];

    ensureVisibleAgency(first.agencyId);
    if (selectedAgencyId !== first.agencyId) {
      setSelectedAgencyId(first.agencyId);
    }

    setHighlightSeriesId(seriesId);
    setEditingSeriesId(seriesId);
    setEditingInitialValues({
      seriesId,
      dates: sorted.map((schedule) => schedule.date),
      title: first.title,
      place: first.place,
      memo: first.memo ?? "",
      startTime: first.startTime,
      endTime: first.endTime,
      agencyId: first.agencyId
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">管理者ダッシュボード</h1>
          <p className="text-sm text-slate-400">代理店ごとのスケジュールと催事場データを一元管理します。</p>
        </div>
        <div className="text-xs text-slate-400">カレンダー上部のチェックで表示代理店を切り替えできます。</div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_2fr]">
        <aside className="space-y-6">
          <AgencyManager />
          <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/60 p-6 shadow">
            <div>
              <h2 className="text-base font-semibold">代理店を選択</h2>
              <p className="mt-1 text-xs text-slate-400">編集対象の代理店を選ぶと、フォームでの登録・更新が可能です。</p>
            </div>
            <label className="flex flex-col gap-2 text-sm text-slate-200">
              代理店
              <select
                value={selectedAgencyId ?? ""}
                onChange={(event) => handleAgencyChange(event.target.value)}
                className="rounded-md border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
              >
                <option value="" disabled>
                  選択してください
                </option>
                {demoStore.agencies.map((agency) => (
                  <option key={agency.id} value={agency.id}>
                    {agency.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <RuleForm
            agencies={demoStore.agencies}
            selectedAgencyId={selectedAgencyId}
            editingSeriesId={editingSeriesId}
            initialValues={editingInitialValues}
            onSaved={handleScheduleSaved}
            isAdmin={isAdmin}
          />
        </aside>
        <div className="flex flex-col gap-6">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow">
            <h2 className="mb-4 text-lg font-semibold">催事スケジュールカレンダー</h2>
            <Calendar
              schedules={schedules}
              agencies={demoStore.agencies}
              visibleAgencyIds={visibleAgencyIds}
              onToggleAgencyVisible={handleToggleAgencyVisible}
              onSeriesSelect={handleSeriesSelect}
              isAdmin={isAdmin}
            />
          </div>
          <div>
            <h2 className="mb-3 text-lg font-semibold">スケジュール一覧</h2>
            <ScheduleList
              schedules={schedules}
              agencyId={selectedAgencyId}
              highlightSeriesId={highlightSeriesId}
              onSeriesSelect={handleSeriesSelect}
              agencies={demoStore.agencies}
              visibleAgencyIds={visibleAgencyIds}
              isAdmin={isAdmin}
            />
          </div>
          <VenueManager canEdit title="開催場所情報" />
        </div>
      </div>
    </div>
  );
}
