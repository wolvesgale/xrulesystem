export type Schedule = {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  location: string;
  memo?: string;
};

const schedules: Schedule[] = [
  {
    id: "sch-1",
    title: "9時 MU本店",
    date: "2025-11-19",
    startTime: "09:00",
    endTime: "17:00",
    location: "MU百貨店 1F 催事場",
    memo: "初日準備は8:30集合"
  },
  {
    id: "sch-2",
    title: "10時 もちもちマーケット",
    date: "2025-11-20",
    startTime: "10:00",
    endTime: "18:00",
    location: "駅前広場",
    memo: "サンプリング用きな粉追加"
  },
  {
    id: "sch-3",
    title: "11時 冬の味覚フェア",
    date: "2025-11-25",
    startTime: "11:00",
    endTime: "19:00",
    location: "ショッピングモール2F",
    memo: "午後にTV取材予定"
  }
];

export function getAllSchedules(): Schedule[] {
  return [...schedules];
}

export function getSchedulesForAgent(_agentName: string): Schedule[] {
  return [...schedules];
}
