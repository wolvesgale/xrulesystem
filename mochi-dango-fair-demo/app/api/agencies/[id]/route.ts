export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Single agency API for updating or deleting agency accounts.
import { NextRequest, NextResponse } from "next/server";
import { getSessionUserFromRequest } from "@/lib/auth";
import { getPrisma, requireDatabaseUrl } from "@/lib/db";
import { hashPassword } from "@/lib/password";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
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
    color?: string;
    agentName?: string;
    loginId?: string;
    password?: string;
    agentUserId?: string;
  };

  try {
    requireDatabaseUrl();
    const prisma = getPrisma();
    const agency = await prisma.agency.findFirst({
      where: { id: params.id, tenantId },
      include: {
        users: {
          where: { role: "agent" },
          select: { id: true }
        }
      }
    });

    if (!agency) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const agentUserId = body.agentUserId ?? agency.users[0]?.id;

    const updateData: {
      name?: string;
      color?: string | null;
    } = {};

    if (body.name?.trim()) {
      updateData.name = body.name.trim();
    }
    if (body.color !== undefined) {
      updateData.color = body.color?.trim() || null;
    }

    const updated = await prisma.agency.update({
      where: { id: agency.id },
      data: updateData
    });

    if (agentUserId) {
      await prisma.user.update({
        where: { id: agentUserId },
        data: {
          loginId: body.loginId?.trim() || undefined,
          name: body.agentName?.trim() || undefined,
          displayName: body.agentName?.trim() || undefined,
          passwordHash: body.password?.trim() ? await hashPassword(body.password.trim()) : undefined
        }
      });
    }

    const agentUser = await prisma.user.findFirst({
      where: { agencyId: updated.id, role: "agent" },
      select: { id: true, loginId: true, name: true, displayName: true }
    });

    return NextResponse.json({
      id: updated.id,
      name: updated.name,
      color: updated.color,
      agentUser: agentUser ?? null
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ ok: false, error: "Server config error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

  try {
    requireDatabaseUrl();
    const prisma = getPrisma();
    const agency = await prisma.agency.findFirst({
      where: { id: params.id, tenantId }
    });

    if (!agency) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Physical deletion of agency and dependent records via cascading constraints.
    await prisma.agency.delete({ where: { id: agency.id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ ok: false, error: "Server config error" }, { status: 500 });
  }
}
