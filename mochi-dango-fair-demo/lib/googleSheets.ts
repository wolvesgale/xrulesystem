// Google Sheets helpers for venue CRUD operations.
import { google } from "googleapis";

export type Venue = {
  id: string;
  agencyId: string;
  storeName: string;
  floorName: string;
  placeDetail: string;
  svName: string;
  photoUrl: string;
  memo: string;
  createdAt: string;
  updatedAt: string;
};

export type UserRow = {
  loginId: string;
  password: string;
  role: "admin" | "agent";
  agencyId: string | null;
  displayName: string;
};

const SHEET_NAME = "venues";
const VALUE_RANGE = `${SHEET_NAME}!A2:J`;
const HEADER_LENGTH = 10;
const USERS_SHEET_NAME = "users";
const USERS_VALUE_RANGE = `${USERS_SHEET_NAME}!A2:E`;
const USERS_HEADER_LENGTH = 5;

function getSpreadsheetId(): string {
  const id = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  if (!id) {
    throw new Error("GOOGLE_SHEETS_SPREADSHEET_ID is not set");
  }
  return id;
}

function getSheetsClient() {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!clientEmail || !privateKey) {
    throw new Error("Google service account credentials are not configured");
  }

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"]
  });

  return google.sheets({ auth, spreadsheetId: getSpreadsheetId() });
}

function mapRowToVenue(row: string[]): Venue {
  return {
    id: row[0] ?? "",
    agencyId: row[1] ?? "",
    storeName: row[2] ?? "",
    floorName: row[3] ?? "",
    placeDetail: row[4] ?? "",
    svName: row[5] ?? "",
    photoUrl: row[6] ?? "",
    memo: row[7] ?? "",
    createdAt: row[8] ?? "",
    updatedAt: row[9] ?? ""
  };
}

function matchesFilter(value: string, keyword?: string): boolean {
  if (!keyword) return true;
  return value.toLowerCase().includes(keyword.toLowerCase());
}

function mapRowToUser(row: string[]): UserRow {
  const loginId = row[0] ?? "";
  const displayName = (row[4] ?? "").trim() || loginId;
  return {
    loginId,
    password: row[1] ?? "",
    role: row[2] === "admin" ? "admin" : "agent",
    agencyId: (row[3] ?? "").trim() || null,
    displayName
  };
}

// users シート全件を読み込む
export async function listUsers(): Promise<UserRow[]> {
  const sheets = getSheetsClient();
  const response = await sheets.spreadsheets.values.get({ range: USERS_VALUE_RANGE });
  const rows = response.data.values ?? [];

  return rows
    .filter((row) => row.length >= 1)
    .map((row) => mapRowToUser([...row, ...Array(Math.max(0, USERS_HEADER_LENGTH - row.length)).fill("")]));
}

// ログイン ID とパスワードで 1 ユーザーを探す
export async function findUserByCredentials(
  loginId: string,
  password: string
): Promise<UserRow | null> {
  const users = await listUsers();
  return users.find((user) => user.loginId === loginId && user.password === password) ?? null;
}

// loginId だけからユーザーを取得
export async function getUserByLoginId(loginId: string): Promise<UserRow | null> {
  const users = await listUsers();
  return users.find((user) => user.loginId === loginId) ?? null;
}

// venues シートを読み込み、ヘッダ行をスキップして配列に変換。
// filters に応じて絞り込みを行う。
export async function listVenues(filters: {
  agencyId?: string;
  storeName?: string;
  floorName?: string;
  keyword?: string; // placeDetail / memo / svName に対する部分一致
}): Promise<Venue[]> {
  const sheets = getSheetsClient();
  const response = await sheets.spreadsheets.values.get({ range: VALUE_RANGE });
  const rows = response.data.values ?? [];
  const venues = rows
    .filter((row) => row.length >= 1)
    .map((row) => mapRowToVenue([...row, ...Array(Math.max(0, HEADER_LENGTH - row.length)).fill("")]));

  return venues.filter((venue) => {
    if (filters.agencyId && venue.agencyId !== filters.agencyId) return false;
    if (!matchesFilter(venue.storeName, filters.storeName)) return false;
    if (!matchesFilter(venue.floorName, filters.floorName)) return false;
    const keyword = filters.keyword;
    if (
      keyword &&
      !(
        matchesFilter(venue.placeDetail, keyword) ||
        matchesFilter(venue.memo, keyword) ||
        matchesFilter(venue.svName, keyword)
      )
    ) {
      return false;
    }
    return true;
  });
}

// id: "venue_" + timestamp ベースのユニーク文字列
// createdAt / updatedAt: ISO8601 文字列
// venues シートの末尾に append。
export async function createVenue(input: {
  agencyId: string;
  storeName: string;
  floorName: string;
  placeDetail: string;
  svName: string;
  photoUrl: string;
  memo: string;
}): Promise<Venue> {
  const now = new Date().toISOString();
  const id = `venue_${Date.now()}`;
  const venue: Venue = {
    id,
    agencyId: input.agencyId,
    storeName: input.storeName,
    floorName: input.floorName,
    placeDetail: input.placeDetail,
    svName: input.svName,
    photoUrl: input.photoUrl,
    memo: input.memo,
    createdAt: now,
    updatedAt: now
  };

  const sheets = getSheetsClient();
  await sheets.spreadsheets.values.append({
    range: VALUE_RANGE,
    valueInputOption: "RAW",
    requestBody: {
      values: [
        [
          venue.id,
          venue.agencyId,
          venue.storeName,
          venue.floorName,
          venue.placeDetail,
          venue.svName,
          venue.photoUrl,
          venue.memo,
          venue.createdAt,
          venue.updatedAt
        ]
      ]
    }
  });

  return venue;
}

// id で該当行を探し、その行の各列を更新して書き戻す。
// updatedAt を現在時刻で更新。
export async function updateVenue(
  id: string,
  input: Partial<Omit<Venue, "id" | "createdAt">>
): Promise<Venue> {
  const sheets = getSheetsClient();
  const response = await sheets.spreadsheets.values.get({ range: VALUE_RANGE });
  const rows = response.data.values ?? [];

  let targetIndex = -1;
  for (let index = 0; index < rows.length; index += 1) {
    if (rows[index]?.[0] === id) {
      targetIndex = index;
      break;
    }
  }

  if (targetIndex === -1) {
    throw new Error("Venue not found");
  }

  const row = rows[targetIndex] ?? [];
  const existing = mapRowToVenue([...row, ...Array(Math.max(0, HEADER_LENGTH - row.length)).fill("")]);

  const updatedAt = new Date().toISOString();
  const updated: Venue = {
    ...existing,
    ...input,
    updatedAt
  };

  const rowNumber = targetIndex + 2; // account for header row
  await sheets.spreadsheets.values.update({
    range: `${SHEET_NAME}!A${rowNumber}:J${rowNumber}`,
    valueInputOption: "RAW",
    requestBody: {
      values: [
        [
          updated.id,
          updated.agencyId,
          updated.storeName,
          updated.floorName,
          updated.placeDetail,
          updated.svName,
          updated.photoUrl,
          updated.memo,
          updated.createdAt,
          updated.updatedAt
        ]
      ]
    }
  });

  return updated;
}

// 行削除（物理削除）をサポートする簡易ヘルパー。
export async function deleteVenue(id: string): Promise<void> {
  const sheets = getSheetsClient();
  const response = await sheets.spreadsheets.values.get({ range: VALUE_RANGE });
  const rows = response.data.values ?? [];
  const targetIndex = rows.findIndex((row) => row?.[0] === id);
  if (targetIndex === -1) {
    return;
  }
  const rowNumber = targetIndex + 2;
  await sheets.spreadsheets.values.clear({ range: `${SHEET_NAME}!A${rowNumber}:J${rowNumber}` });
}
