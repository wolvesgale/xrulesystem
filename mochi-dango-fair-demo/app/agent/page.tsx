"use client";

import { useMemo, useState } from "react";
import Calendar from "../../components/Calendar";
import RuleForm from "../../components/RuleForm";
import ScheduleList from "../../components/ScheduleList";
import { demoStore, type Schedule } from "../../lib/demoStore";

type RuleFormInitialValues = {
  seriesId: string;
  dates: string[];
  title: string;
  place: string;
  memo: string;
  startTime: string;
  endTime: string;
  agencyId: string;
};

function formatDateDisplay(date: string): string {
  return date.replace(/-/g, "/");
}

function getNextSchedule(schedules: Schedule[]): Schedule | null {
  if (schedules.length === 0) return null;
  const sorted = [...schedules].sort((a, b) => a.date.localeCompare(b.date));
  return sorted[0] ?? null;
}

export default function AgentPage() {
  const [selectedAgencyId, setSelectedAgencyId] = useState<string | null>(
    demoStore.agencies[0]?.id ?? null
  );
  const [refreshKey, setRefreshKey] = useState(0);
  const [highlightSeriesId, setHighlightSeriesId] = useState<string | null>(null);
  const [editingSeriesId, setEditingSeriesId] = useState<string | null>(null);
  const [editingInitialValues, setEditingInitialValues] =
    useState<RuleFormInitialValues | null>(null);

  const filteredSchedules = useMemo<Schedule[]>(() => {
    if (!selectedAgencyId) {
      return [];
    }
    return demoStore.getSchedulesForAgent(selectedAgencyId);
  }, [selectedAgencyId, refreshKey]);

  const nextSchedule = useMemo(() => getNextSchedule(filteredSchedules), [filteredSchedules]);

  const selectedAgency = useMemo(
    () => demoStore.agencies.find((agency) => agency.id === selectedAgencyId) ?? null,
    [selectedAgencyId]
  );

  const clearEditingState = () => {
    setHighlightSeriesId(null);
    setEditingSeriesId(null);
    setEditingInitialValues(null);
  };

  const handleSeriesSelect = (seriesId: string) => {
    const seriesSchedules = demoStore.getSchedulesBySeries(seriesId);
    if (seriesSchedules.length === 0) {
      return;
    }
    const sorted = [...seriesSchedules].sort((a, b) => a.date.localeCompare(b.date));
    const first = sorted[0];

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

    if (selectedAgencyId !== first.agencyId) {
      setSelectedAgencyId(first.agencyId);
    }
  };

  const handleFormSaved = () => {
    setRefreshKey((prev) => prev + 1);
    clearEditingState();
  };

  const handleAgencyChange = (value: string) => {
    const nextValue = value === "" ? null : value;
    setSelectedAgencyId(nextValue);
    setRefreshKey((prev) => prev + 1);
    clearEditingState();
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">代理店ポータル</h1>
          <p className="text-sm text-slate-400">
            自分の代理店に紐づく催事スケジュールを確認し、必要に応じて日程を追加できます。
          </p>
        </div>
        <label className="flex w-full max-w-xs flex-col gap-1 text-sm text-slate-200">
          代理店を選択
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

      {!selectedAgencyId ? (
        <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/40 p-6 text-sm text-slate-300">
          代理店を選択するとカレンダーとスケジュールが表示されます。
        </div>
      ) : (
        <>
          <div className="grid gap-8 lg:grid-cols-[1fr_2fr]">
            <aside className="space-y-6 rounded-xl border border-slate-800 bg-slate-900/60 p-6 shadow">
              <div>
                <h2 className="text-lg font-semibold">
                  {selectedAgency?.name ?? "代理店"} のみなさまへ
                </h2>
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
                  {nextSchedule
                    ? `${formatDateDisplay(nextSchedule.date)} ${nextSchedule.place}`
                    : "スケジュールが登録されていません"}
                </p>
              </div>
            </aside>
            <section className="flex flex-col gap-6">
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow">
                <h2 className="mb-4 text-lg font-semibold">催事スケジュール</h2>
                <Calendar
                  schedules={filteredSchedules}
                  agencyId={selectedAgencyId}
                  onSeriesSelect={handleSeriesSelect}
                />
              </div>
              <div>
                <h2 className="mb-3 text-lg font-semibold">スケジュール一覧</h2>
                <ScheduleList
                  schedules={filteredSchedules}
                  agencyId={selectedAgencyId}
                  highlightSeriesId={highlightSeriesId}
                  onSeriesSelect={handleSeriesSelect}
                />
              </div>
            </section>
          </div>

          <RuleForm
            agencies={demoStore.agencies}
            selectedAgencyId={selectedAgencyId}
            editingSeriesId={editingSeriesId}
            initialValues={editingInitialValues}
            onSaved={handleFormSaved}
          />
        </>
      )}
    </div>
  );
}
