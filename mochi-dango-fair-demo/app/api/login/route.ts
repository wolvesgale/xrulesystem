// Handles session-issuing login requests.
import { NextResponse } from "next/server";
import { setSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/password";

export async function POST(request: Request) {
  const { id, password } = (await request.json().catch(() => ({}))) as {
    id?: string;
    password?: string;
  };

  if (!id || !password) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { loginId: id }
  });

  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const sessionUser = {
    loginId: user.loginId,
    displayName: user.displayName || user.name || user.loginId,
    role: user.role,
    agencyId: user.role === "agent" ? user.agencyId : null,
    tenantId: user.tenantId ?? null
  } as const;

  setSessionUser(sessionUser);
  return NextResponse.json({
    role: sessionUser.role,
    agencyId: sessionUser.agencyId,
    displayName: sessionUser.displayName
  });
}
