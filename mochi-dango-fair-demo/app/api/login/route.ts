// Handles session-issuing login requests.
import { NextResponse } from "next/server";
import { setSessionUser } from "@/lib/auth";

export async function POST(request: Request) {
  const { id, password } = (await request.json().catch(() => ({}))) as {
    id?: string;
    password?: string;
  };

  const adminMatch =
    id === process.env.ADMIN_USER && password === process.env.ADMIN_PASSWORD;
  if (adminMatch) {
    setSessionUser({ role: "admin", agencyId: null });
    return NextResponse.json({ role: "admin", agencyId: null });
  }

  const agentMatch =
    id === process.env.AGENT_USER && password === process.env.AGENT_PASSWORD;
  if (agentMatch) {
    const agencyId = process.env.AGENT_AGENCY_ID ?? null;
    setSessionUser({ role: "agent", agencyId });
    return NextResponse.json({ role: "agent", agencyId });
  }

  return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
}
