"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import {
  addSchedulesForDates,
  updateSeries,
  type Agency
} from "../lib/demoStore";

type RuleFormState = {
  garbageRule: string;
  cashHandling: "あり" | "なし";
  commissionRate: number;
};

type ScheduleFormState = {
  title: string;
  startTime: string;
  endTime: string;
  place: string;
  memo: string;
};

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

type RuleFormProps = {
  agencies: Agency[];
  selectedAgencyId: string | null;
  editingSeriesId?: string | null;
  initialValues?: RuleFormInitialValues | null;
  onSaved?: () => void;
  isAdmin?: boolean;
};

const initialRuleState: RuleFormState = {
  garbageRule: "閉店後すぐにまとめて指定場所へ。",
  cashHandling: "あり",
  commissionRate: 8
};

const initialScheduleState: ScheduleFormState = {
  title: "",
  startTime: "10:00",
  endTime: "18:00",
  place: "",
  memo: ""
};

function formatDisplayDate(date: string): string {
  return date.replace(/-/g, "/");
}

function getWedToSunOfWeek(baseDate: Date): string[] {
  const normalized = new Date(
    baseDate.getFullYear(),
    baseDate.getMonth(),
    baseDate.getDate()
  );
  const day = normalized.getDay();
  const diffToWed = (3 - day + 7) % 7; // 3 = Wednesday
  const result: string[] = [];
  for (let i = 0; i < 5; i += 1) {
    const date = new Date(normalized);
    date.setDate(date.getDate() + diffToWed + i);
    result.push(date.toISOString().slice(0, 10));
  }
  return result;
}

function uniqueSortedDates(dates: string[]): string[] {
  return Array.from(new Set(dates)).sort();
}

export default function RuleForm({
  agencies,
  selectedAgencyId,
  editingSeriesId,
  initialValues,
  onSaved,
  isAdmin = false
}: RuleFormProps) {
  const [ruleState, setRuleState] = useState<RuleFormState>(initialRuleState);
  const [scheduleState, setScheduleState] =
    useState<ScheduleFormState>(initialScheduleState);
  const [dateInput, setDateInput] = useState<string>("");
  const [selectedDates, setSelectedDates] = useState<string[]>([]);

  const activeAgencyId = initialValues?.agencyId ?? selectedAgencyId ?? null;

  useEffect(() => {
    if (initialValues) {
      setSelectedDates(uniqueSortedDates(initialValues.dates));
      setScheduleState({
        title: initialValues.title,
        startTime: initialValues.startTime,
        endTime: initialValues.endTime,
        place: initialValues.place,
        memo: initialValues.memo ?? ""
      });
    } else {
      setSelectedDates([]);
      setScheduleState(initialScheduleState);
    }
    setDateInput("");
  }, [initialValues]);

  const selectedAgency = useMemo(
    () => agencies.find((agency) => agency.id === activeAgencyId) ?? null,
    [agencies, activeAgencyId]
  );

  const isDisabled = !isAdmin || !activeAgencyId;
  const sortedDates = useMemo(
    () => uniqueSortedDates(selectedDates),
    [selectedDates]
  );

  const handleAddDate = () => {
    if (!dateInput) return;
    setSelectedDates((prev) => uniqueSortedDates([...prev, dateInput]));
    setDateInput("");
  };

  const handleAddWeekShortcut = () => {
    const base = dateInput
      ? new Date(dateInput)
      : selectedDates[0]
      ? new Date(selectedDates[0])
      : new Date();
    const newDates = getWedToSunOfWeek(base);
    setSelectedDates((prev) => uniqueSortedDates([...prev, ...newDates]));
  };

  const handleRemoveDate = (date: string) => {
    setSelectedDates((prev) => prev.filter((item) => item !== date));
  };

  const resetScheduleForm = () => {
    setScheduleState(initialScheduleState);
    setSelectedDates([]);
    setDateInput("");
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isAdmin) {
      return;
    }

    const agencyIdForSubmit = activeAgencyId;

    if (!agencyIdForSubmit) {
      alert("代理店を選択すると登録できます");
      return;
    }

    if (sortedDates.length === 0) {
      alert("日付を1件以上追加してください");
      return;
    }

    if (!scheduleState.title.trim()) {
      alert("スケジュールタイトルを入力してください");
      return;
    }

    const preparedPlace = scheduleState.place.trim() || "未設定";
    const preparedMemo = scheduleState.memo.trim();

    if (editingSeriesId) {
      updateSeries(editingSeriesId, {
        title: scheduleState.title,
        place: preparedPlace,
        memo: preparedMemo || undefined,
        dates: sortedDates,
        startTime: scheduleState.startTime || "00:00",
        endTime: scheduleState.endTime || "23:59",
        agencyId: agencyIdForSubmit
      });
      console.log("予定を更新", {
        seriesId: editingSeriesId,
        agencyId: agencyIdForSubmit,
        dates: sortedDates,
        ...scheduleState,
        place: preparedPlace,
        memo: preparedMemo
      });
    } else {
      const seriesId = addSchedulesForDates({
        title: scheduleState.title,
        place: preparedPlace,
        memo: preparedMemo || undefined,
        dates: sortedDates,
        startTime: scheduleState.startTime || "00:00",
        endTime: scheduleState.endTime || "23:59",
        agencyId: agencyIdForSubmit
      });
      console.log("ルール保存", ruleState);
      console.log("スケジュール追加", {
        seriesId,
        agencyId: agencyIdForSubmit,
        dates: sortedDates,
        ...scheduleState,
        place: preparedPlace,
        memo: preparedMemo
      });
      resetScheduleForm();
    }

    onSaved?.();
  };

  const submitLabel = editingSeriesId ? "予定を更新" : "ルール保存と催事登録";

  return (
    <form
      className="space-y-6 rounded-xl border border-slate-800 bg-slate-900/60 p-6 shadow"
      onSubmit={handleSubmit}
    >
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">店舗ルール & 催事登録</h2>
        <p className="text-sm text-slate-400">
          ゴミ出しルールなどの基本情報と、代理店ごとの催事スケジュールをまとめて管理します。
        </p>
        <p className="text-xs text-slate-500">
          選択中の代理店：{selectedAgency ? selectedAgency.name : "未選択"}
        </p>
      </div>

      {!activeAgencyId && (
        <div className="rounded-md border border-dashed border-slate-700 bg-slate-900/40 p-3 text-sm text-slate-300">
          代理店を選択すると登録できます。
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="garbageRule" className="text-sm font-medium">
            ゴミ出しルール
          </label>
          <textarea
            id="garbageRule"
            value={ruleState.garbageRule}
            disabled={isDisabled}
            onChange={(event) =>
              setRuleState((prev) => ({ ...prev, garbageRule: event.target.value }))
            }
            className={clsx(
              "min-h-[120px] w-full rounded-md border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400",
              isDisabled && "cursor-not-allowed opacity-60"
            )}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="cashHandling" className="text-sm font-medium">
            売上金預かり
          </label>
          <select
            id="cashHandling"
            value={ruleState.cashHandling}
            disabled={isDisabled}
            onChange={(event) =>
              setRuleState((prev) => ({
                ...prev,
                cashHandling: event.target.value as RuleFormState["cashHandling"]
              }))
            }
            className={clsx(
              "w-full rounded-md border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400",
              isDisabled && "cursor-not-allowed opacity-60"
            )}
          >
            <option value="あり">あり</option>
            <option value="なし">なし</option>
          </select>
          <div className="space-y-2">
            <label htmlFor="commissionRate" className="text-sm font-medium">
              歩合率 (%)
            </label>
            <input
              id="commissionRate"
              type="number"
              min={0}
              max={100}
              value={ruleState.commissionRate}
              disabled={isDisabled}
              onChange={(event) =>
                setRuleState((prev) => ({
                  ...prev,
                  commissionRate: Number(event.target.value ?? 0)
                }))
              }
              className={clsx(
                "w-full rounded-md border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400",
                isDisabled && "cursor-not-allowed opacity-60"
              )}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4 rounded-lg border border-slate-800 bg-slate-950/40 p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-base font-semibold">催事スケジュール登録</h3>
            <p className="text-xs text-slate-400">
              水〜日など複数日程をまとめて登録できます。
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddWeekShortcut}
            disabled={isDisabled}
            className={clsx(
              "inline-flex items-center gap-2 rounded-md border border-slate-700 px-3 py-1.5 text-xs text-slate-200 transition hover:border-slate-500 hover:bg-slate-800",
              isDisabled && "cursor-not-allowed opacity-60"
            )}
          >
            今週の水〜日を追加
          </button>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-2">
            <label htmlFor="dateInput" className="text-sm font-medium">
              日付を追加
            </label>
            <input
              id="dateInput"
              type="date"
              value={dateInput}
              disabled={isDisabled}
              onChange={(event) => setDateInput(event.target.value)}
              className={clsx(
                "w-full rounded-md border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400",
                isDisabled && "cursor-not-allowed opacity-60"
              )}
            />
          </div>
          <button
            type="button"
            onClick={handleAddDate}
            disabled={isDisabled || !dateInput}
            className={clsx(
              "inline-flex items-center justify-center rounded-md bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-200",
              (isDisabled || !dateInput) && "cursor-not-allowed opacity-60"
            )}
          >
            日付を追加
          </button>
        </div>

        {sortedDates.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {sortedDates.map((date) => (
              <span
                key={date}
                className="inline-flex items-center gap-2 rounded-full bg-slate-800/60 px-3 py-1 text-xs text-slate-100"
              >
                {formatDisplayDate(date)}
                <button
                  type="button"
                  onClick={() => handleRemoveDate(date)}
                  className="text-slate-400 transition hover:text-slate-200"
                  aria-label={`${formatDisplayDate(date)}を削除`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="scheduleTitle">
              催事タイトル
            </label>
            <input
              id="scheduleTitle"
              type="text"
              value={scheduleState.title}
              disabled={isDisabled}
              onChange={(event) =>
                setScheduleState((prev) => ({ ...prev, title: event.target.value }))
              }
              className={clsx(
                "w-full rounded-md border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400",
                isDisabled && "cursor-not-allowed opacity-60"
              )}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="schedulePlace">
              催事場所
            </label>
            <input
              id="schedulePlace"
              type="text"
              value={scheduleState.place}
              disabled={isDisabled}
              onChange={(event) =>
                setScheduleState((prev) => ({ ...prev, place: event.target.value }))
              }
              className={clsx(
                "w-full rounded-md border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400",
                isDisabled && "cursor-not-allowed opacity-60"
              )}
            />
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="startTime">
              開始時間
            </label>
            <input
              id="startTime"
              type="time"
              value={scheduleState.startTime}
              disabled={isDisabled}
              onChange={(event) =>
                setScheduleState((prev) => ({ ...prev, startTime: event.target.value }))
              }
              className={clsx(
                "w-full rounded-md border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400",
                isDisabled && "cursor-not-allowed opacity-60"
              )}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="endTime">
              終了時間
            </label>
            <input
              id="endTime"
              type="time"
              value={scheduleState.endTime}
              disabled={isDisabled}
              onChange={(event) =>
                setScheduleState((prev) => ({ ...prev, endTime: event.target.value }))
              }
              className={clsx(
                "w-full rounded-md border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400",
                isDisabled && "cursor-not-allowed opacity-60"
              )}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="memo">
            メモ
          </label>
          <textarea
            id="memo"
            value={scheduleState.memo}
            disabled={isDisabled}
            onChange={(event) =>
              setScheduleState((prev) => ({ ...prev, memo: event.target.value }))
            }
            className={clsx(
              "min-h-[80px] w-full rounded-md border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400",
              isDisabled && "cursor-not-allowed opacity-60"
            )}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isDisabled}
          className={clsx(
            "inline-flex items-center rounded-md bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-200",
            isDisabled && "cursor-not-allowed opacity-60"
          )}
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
