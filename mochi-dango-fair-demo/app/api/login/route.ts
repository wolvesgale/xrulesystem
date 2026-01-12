export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Handles session-issuing login requests.
import { NextResponse } from "next/server";
import { setSessionUser } from "@/lib/auth";
import { getPrisma, requireDatabaseUrl } from "@/lib/db";
import { verifyPassword } from "@/lib/password";

export async function POST(request: Request) {
  const { id, password } = (await request.json().catch(() => ({}))) as {
    id?: string;
    password?: string;
  };

  if (!id || !password) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  try {
    requireDatabaseUrl();
    const prisma = getPrisma();
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
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { ok: false, error: "Server config error (migrate not applied)" },
      { status: 500 }
    );
  }
}
