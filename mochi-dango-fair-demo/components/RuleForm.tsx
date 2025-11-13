"use client";

import { useState } from "react";
import clsx from "clsx";

type RuleFormState = {
  garbageRule: string;
  cashHandling: "あり" | "なし";
  commissionRate: number;
};

export default function RuleForm() {
  const [state, setState] = useState<RuleFormState>({
    garbageRule: "閉店後すぐにまとめて指定場所へ。",
    cashHandling: "あり",
    commissionRate: 8
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("ルール保存", state);
  };

  return (
    <form
      className="space-y-6 rounded-xl border border-slate-800 bg-slate-900/60 p-6 shadow"
      onSubmit={handleSubmit}
    >
      <div>
        <h2 className="text-lg font-semibold">店舗ルール</h2>
        <p className="text-sm text-slate-400">催事運営で守るべきルールを記載してください。</p>
      </div>
      <div className="space-y-2">
        <label htmlFor="garbageRule" className="text-sm font-medium">
          ゴミ出しルール
        </label>
        <textarea
          id="garbageRule"
          value={state.garbageRule}
          onChange={(event) =>
            setState((prev) => ({ ...prev, garbageRule: event.target.value }))
          }
          className="min-h-[120px] w-full rounded-md border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="cashHandling" className="text-sm font-medium">
          売上金預かり
        </label>
        <select
          id="cashHandling"
          value={state.cashHandling}
          onChange={(event) =>
            setState((prev) => ({
              ...prev,
              cashHandling: event.target.value as RuleFormState["cashHandling"]
            }))
          }
          className="w-full rounded-md border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
        >
          <option value="あり">あり</option>
          <option value="なし">なし</option>
        </select>
      </div>
      <div className="space-y-2">
        <label htmlFor="commissionRate" className="text-sm font-medium">
          歩合率 (%)
        </label>
        <input
          id="commissionRate"
          type="number"
          min={0}
          max={100}
          value={state.commissionRate}
          onChange={(event) =>
            setState((prev) => ({
              ...prev,
              commissionRate: Number(event.target.value ?? 0)
            }))
          }
          className="w-full rounded-md border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
        />
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          className={clsx(
            "inline-flex items-center rounded-md bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900",
            "transition hover:bg-slate-200"
          )}
        >
          ルール保存
        </button>
      </div>
    </form>
  );
}
