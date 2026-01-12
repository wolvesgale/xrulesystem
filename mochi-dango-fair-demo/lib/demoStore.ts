export type Agency = {
  id: string;
  name: string;
  color: string;
};

export type Schedule = {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  place: string;
  memo?: string;
  agencyId: string;
  seriesId?: string;
};

export type AddSchedulesForDatesInput = {
  title: string;
  place: string;
  memo?: string;
  dates: string[];
  startTime: string;
  endTime: string;
  agencyId: string;
  seriesId?: string;
};

const agencies: Agency[] = [
  { id: "agency-a", name: "A代理店", color: "#38bdf8" },
  { id: "agency-b", name: "B代理店", color: "#f97316" },
  { id: "agency-c", name: "C代理店", color: "#22c55e" }
];

const schedules: Schedule[] = [
  {
    id: "sch-a-2025-11-19",
    title: "Xrule百貨店ウィーク",
    date: "2025-11-19",
    startTime: "10:00",
    endTime: "19:00",
    place: "Xrule百貨店 1F 催事場",
    memo: "初日は搬入 9:00 集合",
    agencyId: "agency-a",
    seriesId: "series-a-2025-11"
  },
  {
    id: "sch-a-2025-11-20",
    title: "Xrule百貨店ウィーク",
    date: "2025-11-20",
    startTime: "10:00",
    endTime: "19:00",
    place: "Xrule百貨店 1F 催事場",
    memo: "2日目は試食コーナー拡張",
    agencyId: "agency-a",
    seriesId: "series-a-2025-11"
  },
  {
    id: "sch-a-2025-11-21",
    title: "Xrule百貨店ウィーク",
    date: "2025-11-21",
    startTime: "10:00",
    endTime: "20:00",
    place: "Xrule百貨店 1F 催事場",
    memo: "金曜は夕方に試食イベント",
    agencyId: "agency-a",
    seriesId: "series-a-2025-11"
  },
  {
    id: "sch-a-2025-11-22",
    title: "Xrule百貨店ウィーク",
    date: "2025-11-22",
    startTime: "10:00",
    endTime: "20:00",
    place: "Xrule百貨店 1F 催事場",
    memo: "土日はスタッフ増員",
    agencyId: "agency-a",
    seriesId: "series-a-2025-11"
  },
  {
    id: "sch-a-2025-11-23",
    title: "Xrule百貨店ウィーク",
    date: "2025-11-23",
    startTime: "10:00",
    endTime: "18:00",
    place: "Xrule百貨店 1F 催事場",
    memo: "最終日は在庫セール",
    agencyId: "agency-a",
    seriesId: "series-a-2025-11"
  },
  {
    id: "sch-b-2025-12-04",
    title: "冬の味覚フェア",
    date: "2025-12-04",
    startTime: "11:00",
    endTime: "19:00",
    place: "駅前広場 テントB",
    memo: "現地集合 9:30",
    agencyId: "agency-b",
    seriesId: "series-b-2025-12"
  },
  {
    id: "sch-b-2025-12-05",
    title: "冬の味覚フェア",
    date: "2025-12-05",
    startTime: "11:00",
    endTime: "19:00",
    place: "駅前広場 テントB",
    memo: "試食用みたらし多めに",
    agencyId: "agency-b",
    seriesId: "series-b-2025-12"
  },
  {
    id: "sch-b-2025-12-06",
    title: "冬の味覚フェア",
    date: "2025-12-06",
    startTime: "11:00",
    endTime: "19:00",
    place: "駅前広場 テントB",
    memo: "夕方にライブ演奏あり",
    agencyId: "agency-b",
    seriesId: "series-b-2025-12"
  },
  {
    id: "sch-b-2025-12-07",
    title: "冬の味覚フェア",
    date: "2025-12-07",
    startTime: "11:00",
    endTime: "18:00",
    place: "駅前広場 テントB",
    memo: "最終日：撤収は20時までに完了",
    agencyId: "agency-b",
    seriesId: "series-b-2025-12"
  }
];

function generateScheduleId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `sch-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function generateSeriesId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `series-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function getAllSchedules(): Schedule[] {
  return schedules.map((schedule) => ({ ...schedule }));
}

export function getSchedulesForAgent(agencyId: string): Schedule[] {
  return schedules.filter((schedule) => schedule.agencyId === agencyId).map((schedule) => ({ ...schedule }));
}

export function addSchedulesForDates({
  title,
  place,
  memo,
  dates,
  startTime,
  endTime,
  agencyId,
  seriesId
}: AddSchedulesForDatesInput): string {
  const resolvedSeriesId = seriesId ?? generateSeriesId();
  dates.forEach((date) => {
    schedules.push({
      id: generateScheduleId(),
      title,
      date,
      startTime,
      endTime,
      place,
      memo,
      agencyId,
      seriesId: resolvedSeriesId
    });
  });
  return resolvedSeriesId;
}

export function updateSeries(
  targetSeriesId: string,
  { title, place, memo, dates, startTime, endTime, agencyId }: Omit<AddSchedulesForDatesInput, "seriesId">
): void {
  for (let index = schedules.length - 1; index >= 0; index -= 1) {
    if ((schedules[index]?.seriesId ?? schedules[index]?.id) === targetSeriesId) {
      schedules.splice(index, 1);
    }
  }

  addSchedulesForDates({
    title,
    place,
    memo,
    dates,
    startTime,
    endTime,
    agencyId,
    seriesId: targetSeriesId
  });
}

export function getSchedulesBySeries(seriesId: string): Schedule[] {
  return schedules
    .filter((schedule) => (schedule.seriesId ?? schedule.id) === seriesId)
    .map((schedule) => ({ ...schedule }));
}

export const demoStore = {
  agencies,
  schedules,
  addSchedulesForDates,
  updateSeries,
  getSchedulesBySeries,
  getAllSchedules,
  getSchedulesForAgent
};
