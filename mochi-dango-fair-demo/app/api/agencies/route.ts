export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Agencies collection API for admin management.
import { NextRequest, NextResponse } from "next/server";
import { getSessionUserFromRequest } from "@/lib/auth";
import { getPrisma, requireDatabaseUrl } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  const session = getSessionUserFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.role !== "admin" && session.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const tenantId =
    session.role === "super_admin"
      ? request.nextUrl.searchParams.get("tenantId") ?? session.tenantId
      : session.tenantId;
  if (!tenantId) {
    return NextResponse.json({ error: "tenantId is required" }, { status: 400 });
  }

  try {
    requireDatabaseUrl();
    const prisma = getPrisma();
    const agencies = await prisma.agency.findMany({
      where: { tenantId },
      include: {
        users: {
          where: { role: "agent" },
          select: {
            id: true,
            loginId: true,
            name: true,
            displayName: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(
      agencies.map((agency) => ({
        id: agency.id,
        code: agency.code,
        name: agency.name,
        color: agency.color,
        agentUser: agency.users[0] ?? null
      }))
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { ok: false, error: "Server config error (migrate not applied)" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = getSessionUserFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.role !== "admin" && session.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const tenantId = session.tenantId;
  if (!tenantId) {
    return NextResponse.json({ error: "tenantId is required" }, { status: 400 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    name?: string;
    code?: string;
    color?: string;
    agentName?: string;
    loginId?: string;
    password?: string;
  };

  if (!body.name?.trim() || !body.code?.trim() || !body.loginId?.trim() || !body.password?.trim()) {
    return NextResponse.json(
      { error: "name, code, loginId, and password are required" },
      { status: 400 }
    );
  }

  try {
    requireDatabaseUrl();
    const prisma = getPrisma();
    const passwordHash = await hashPassword(body.password.trim());

    const agency = await prisma.agency.create({
      data: {
        tenantId,
        name: body.name.trim(),
        code: body.code.trim(),
        color: body.color?.trim() || null,
        users: {
          create: {
            loginId: body.loginId.trim(),
            name: body.agentName?.trim() || body.name.trim(),
            displayName: body.agentName?.trim() || null,
            role: "agent",
            passwordHash,
            tenantId
          }
        }
      },
      include: {
        users: {
          where: { role: "agent" },
          select: {
            id: true,
            loginId: true,
            name: true,
            displayName: true
          }
        }
      }
    });

    return NextResponse.json({
      id: agency.id,
      code: agency.code,
      name: agency.name,
      color: agency.color,
      agentUser: agency.users[0] ?? null
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "Duplicate agency code" }, { status: 409 });
    }
    console.error(error);
    return NextResponse.json(
      { ok: false, error: "Server config error (migrate not applied)" },
      { status: 500 }
    );
  }
}
