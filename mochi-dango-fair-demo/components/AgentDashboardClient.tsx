"use client";

import { useMemo, useState } from "react";
import Calendar from "./Calendar";
import ScheduleList from "./ScheduleList";
import { VenueManager } from "./venues/VenueManager";
import { demoStore, type Schedule } from "@/lib/demoStore";

type AgentDashboardClientProps = {
  agencyId: string | null;
};

// Client-side portal for agent users with fixed agency scope.
export function AgentDashboardClient({ agencyId }: AgentDashboardClientProps) {
  const [highlightSeriesId, setHighlightSeriesId] = useState<string | null>(null);
  const [visibleAgencyIds, setVisibleAgencyIds] = useState<string[]>(agencyId ? [agencyId] : []);

  const filteredSchedules = useMemo<Schedule[]>(() => {
    if (!agencyId) {
      return [];
    }
    return demoStore.getSchedulesForAgent(agencyId);
  }, [agencyId]);

  const nextSchedule = useMemo(() => {
    if (filteredSchedules.length === 0) return null;
    const sorted = [...filteredSchedules].sort((a, b) => a.date.localeCompare(b.date));
    return sorted[0] ?? null;
  }, [filteredSchedules]);

  const selectedAgency = useMemo(
    () => demoStore.agencies.find((agency) => agency.id === agencyId) ?? null,
    [agencyId]
  );

  const handleSeriesSelect = (seriesId: string) => {
    const seriesSchedules = demoStore.getSchedulesBySeries(seriesId);
    if (seriesSchedules.length === 0) {
      return;
    }
    setHighlightSeriesId(seriesId);
  };

  const handleToggleAgencyVisible = (targetAgencyId: string) => {
    setVisibleAgencyIds((prev) =>
      prev.includes(targetAgencyId)
        ? prev.filter((id) => id !== targetAgencyId)
        : [...prev, targetAgencyId]
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">代理店ポータル</h1>
          <p className="text-sm text-slate-400">
            自社の催事スケジュールと催事場情報を確認できます。編集が必要な場合は管理者にご相談ください。
          </p>
        </div>
        <div className="text-sm text-slate-300">
          {selectedAgency ? `${selectedAgency.name} 担当者さま` : "代理店情報がありません"}
        </div>
      </div>

      {!agencyId ? (
        <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/40 p-6 text-sm text-slate-300">
          代理店 ID が未設定です。管理者にお問い合わせください。
        </div>
      ) : (
        <>
          <div className="grid gap-8 lg:grid-cols-[1fr_2fr]">
            <aside className="space-y-6 rounded-xl border border-slate-800 bg-slate-900/60 p-6 shadow">
              <div>
                <h2 className="text-lg font-semibold">{selectedAgency?.name ?? "代理店"} の皆さまへ</h2>
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
                    ? `${nextSchedule.date.replace(/-/g, "/")} ${nextSchedule.place}`
                    : "スケジュールが登録されていません"}
                </p>
              </div>
            </aside>
            <section className="flex flex-col gap-6">
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow">
                <h2 className="mb-4 text-lg font-semibold">催事スケジュール</h2>
                <Calendar
                  schedules={filteredSchedules}
                  agencies={demoStore.agencies.filter((agency) => agency.id === agencyId)}
                  visibleAgencyIds={visibleAgencyIds}
                  onToggleAgencyVisible={handleToggleAgencyVisible}
                  onSeriesSelect={handleSeriesSelect}
                  isAdmin={false}
                />
              </div>
              <div>
                <h2 className="mb-3 text-lg font-semibold">スケジュール一覧</h2>
                <ScheduleList
                  schedules={filteredSchedules}
                  agencyId={agencyId}
                  highlightSeriesId={highlightSeriesId}
                  onSeriesSelect={handleSeriesSelect}
                  agencies={demoStore.agencies.filter((agency) => agency.id === agencyId)}
                  visibleAgencyIds={visibleAgencyIds}
                  isAdmin={false}
                />
              </div>
              <VenueManager canEditAgencyId={false} fixedAgencyId={agencyId} title="催事場情報" />
            </section>
          </div>
        </>
      )}
    </div>
  );
}
