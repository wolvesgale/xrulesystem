// Handles session-issuing login requests.
import { NextResponse } from "next/server";
import { setSessionUser } from "@/lib/auth";
import { findUserByCredentials } from "@/lib/googleSheets";

export async function POST(request: Request) {
  const { id, password } = (await request.json().catch(() => ({}))) as {
    id?: string;
    password?: string;
  };

  if (!id || !password) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const user = await findUserByCredentials(id, password);
  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const sessionUser = {
    loginId: user.loginId,
    displayName: user.displayName || user.loginId,
    role: user.role,
    agencyId: user.role === "agent" ? user.agencyId : null
  } as const;

  setSessionUser(sessionUser);
  return NextResponse.json({
    role: sessionUser.role,
    agencyId: sessionUser.agencyId,
    displayName: sessionUser.displayName
  });
}
