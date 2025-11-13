export type Agency = {
  id: string;
  name: string;
};

export type Schedule = {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  location: string;
  memo?: string;
  agencyId: string;
};

export type AddSchedulesForDatesInput = {
  title: string;
  dates: string[];
  startTime: string;
  endTime: string;
  agencyId: string;
  location?: string;
  memo?: string;
};

const agencies: Agency[] = [
  { id: "agency-a", name: "A代理店" },
  { id: "agency-b", name: "B代理店" },
  { id: "agency-c", name: "C代理店" }
];

const schedules: Schedule[] = [
  {
    id: "sch-a-2025-11-19",
    title: "MU百貨店ウィーク",
    date: "2025-11-19",
    startTime: "10:00",
    endTime: "19:00",
    location: "MU百貨店 1F 催事場",
    memo: "初日は搬入 9:00 集合",
    agencyId: "agency-a"
  },
  {
    id: "sch-a-2025-11-20",
    title: "MU百貨店ウィーク",
    date: "2025-11-20",
    startTime: "10:00",
    endTime: "19:00",
    location: "MU百貨店 1F 催事場",
    memo: "2日目は試食コーナー拡張",
    agencyId: "agency-a"
  },
  {
    id: "sch-a-2025-11-21",
    title: "MU百貨店ウィーク",
    date: "2025-11-21",
    startTime: "10:00",
    endTime: "20:00",
    location: "MU百貨店 1F 催事場",
    memo: "金曜は夕方に試食イベント",
    agencyId: "agency-a"
  },
  {
    id: "sch-a-2025-11-22",
    title: "MU百貨店ウィーク",
    date: "2025-11-22",
    startTime: "10:00",
    endTime: "20:00",
    location: "MU百貨店 1F 催事場",
    memo: "土日はスタッフ増員",
    agencyId: "agency-a"
  },
  {
    id: "sch-a-2025-11-23",
    title: "MU百貨店ウィーク",
    date: "2025-11-23",
    startTime: "10:00",
    endTime: "18:00",
    location: "MU百貨店 1F 催事場",
    memo: "最終日は在庫セール",
    agencyId: "agency-a"
  },
  {
    id: "sch-b-2025-12-04",
    title: "冬の味覚フェア",
    date: "2025-12-04",
    startTime: "11:00",
    endTime: "19:00",
    location: "駅前広場 テントB",
    memo: "現地集合 9:30",
    agencyId: "agency-b"
  },
  {
    id: "sch-b-2025-12-05",
    title: "冬の味覚フェア",
    date: "2025-12-05",
    startTime: "11:00",
    endTime: "19:00",
    location: "駅前広場 テントB",
    memo: "試食用みたらし多めに",
    agencyId: "agency-b"
  },
  {
    id: "sch-b-2025-12-06",
    title: "冬の味覚フェア",
    date: "2025-12-06",
    startTime: "11:00",
    endTime: "19:00",
    location: "駅前広場 テントB",
    memo: "夕方にライブ演奏あり",
    agencyId: "agency-b"
  },
  {
    id: "sch-b-2025-12-07",
    title: "冬の味覚フェア",
    date: "2025-12-07",
    startTime: "11:00",
    endTime: "18:00",
    location: "駅前広場 テントB",
    memo: "最終日：撤収は20時までに完了",
    agencyId: "agency-b"
  }
];

function generateScheduleId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `sch-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function getAllSchedules(): Schedule[] {
  return schedules.map((schedule) => ({ ...schedule }));
}

export function getSchedulesForAgent(agencyId: string): Schedule[] {
  return schedules.filter((schedule) => schedule.agencyId === agencyId).map((schedule) => ({ ...schedule }));
}

export function addSchedulesForDates({
  title,
  dates,
  startTime,
  endTime,
  agencyId,
  location,
  memo
}: AddSchedulesForDatesInput): void {
  dates.forEach((date) => {
    schedules.push({
      id: generateScheduleId(),
      title,
      date,
      startTime,
      endTime,
      location: location ?? "未設定",
      memo,
      agencyId
    });
  });
}

export const demoStore = {
  agencies,
  schedules,
  addSchedulesForDates,
  getAllSchedules,
  getSchedulesForAgent
};
