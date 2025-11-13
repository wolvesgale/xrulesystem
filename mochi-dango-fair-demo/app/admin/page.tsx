"use client";

import { useMemo, useState } from "react";
import Calendar from "../../components/Calendar";
import RuleForm from "../../components/RuleForm";
import ScheduleList from "../../components/ScheduleList";
import { getAllSchedules, type Schedule } from "../../lib/demoStore";

type ScheduleFormState = {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  memo: string;
};

const emptyFormState: ScheduleFormState = {
  title: "",
  date: "",
  startTime: "",
  endTime: "",
  location: "",
  memo: ""
};

export default function AdminPage() {
  const [schedules, setSchedules] = useState<Schedule[]>(() => getAllSchedules());
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);
  const [formState, setFormState] = useState<ScheduleFormState>(emptyFormState);

  const calendarEvents = useMemo(
    () =>
      schedules.map((schedule) => ({
        id: schedule.id,
        title: schedule.title,
        date: schedule.date
      })),
    [schedules]
  );

  const handleAddSchedule = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formState.title || !formState.date) {
      alert("タイトルと日付を入力してください");
      return;
    }

    const newSchedule: Schedule = {
      id: `sch-${Date.now()}`,
      title: formState.title,
      date: formState.date,
      startTime: formState.startTime || "00:00",
      endTime: formState.endTime || "23:59",
      location: formState.location || "未設定",
      memo: formState.memo || undefined
    };

    setSchedules((prev) => [...prev, newSchedule]);
    setFormState(emptyFormState);
    setSelectedScheduleId(newSchedule.id);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_2fr]">
      <div className="space-y-8">
        <RuleForm />
        <form
          className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/60 p-6 shadow"
          onSubmit={handleAddSchedule}
        >
          <div>
            <h2 className="text-lg font-semibold">スケジュール追加</h2>
            <p className="text-sm text-slate-400">催事スケジュールを簡易的に追加できます。</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm">タイトル</label>
            <input
              type="text"
              value={formState.title}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, title: event.target.value }))
              }
              className="w-full rounded-md border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm">日付</label>
              <input
                type="date"
                value={formState.date}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, date: event.target.value }))
                }
                className="w-full rounded-md border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm">催事場所</label>
              <input
                type="text"
                value={formState.location}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, location: event.target.value }))
                }
                className="w-full rounded-md border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
              />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm">開始時間</label>
              <input
                type="time"
                value={formState.startTime}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, startTime: event.target.value }))
                }
                className="w-full rounded-md border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm">終了時間</label>
              <input
                type="time"
                value={formState.endTime}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, endTime: event.target.value }))
                }
                className="w-full rounded-md border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm">メモ</label>
            <textarea
              value={formState.memo}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, memo: event.target.value }))
              }
              className="min-h-[80px] w-full rounded-md border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="rounded-md bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
            >
              スケジュール追加
            </button>
          </div>
        </form>
      </div>
      <div className="flex flex-col gap-6">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow">
          <h2 className="mb-4 text-lg font-semibold">催事スケジュールカレンダー</h2>
          <Calendar
            events={calendarEvents}
            onEventClick={(id) => setSelectedScheduleId(id)}
          />
        </div>
        <div>
          <h2 className="mb-3 text-lg font-semibold">スケジュール一覧</h2>
          <ScheduleList schedules={schedules} highlightId={selectedScheduleId} />
        </div>
      </div>
    </div>
  );
}
