export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Venues item API for fetching, updating, and deleting single records.
import { NextRequest, NextResponse } from "next/server";
import { getSessionUserFromRequest } from "@/lib/auth";
import { getPrisma, requireDatabaseUrl } from "@/lib/db";
import { ensureUniqueVenueSlug, slugify } from "@/lib/slug";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const session = getSessionUserFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tenantId = session.tenantId;
  if (!tenantId) {
    return NextResponse.json({ error: "tenantId is required" }, { status: 400 });
  }

  try {
    requireDatabaseUrl();
    const prisma = getPrisma();
    const venue = await prisma.venue.findFirst({
      where: {
        id: params.id,
        tenantId
      }
    });
    if (!venue) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: venue.id,
      name: venue.name,
      address: venue.address,
      rules: venue.rules,
      notes: venue.notes,
      referenceUrl: venue.referenceUrl,
      updatedAt: venue.updatedAt.toISOString()
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { ok: false, error: "Server config error (migrate not applied)" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const session = getSessionUserFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.role === "agent") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const tenantId = session.tenantId;
  if (!tenantId) {
    return NextResponse.json({ error: "tenantId is required" }, { status: 400 });
  }

  const body = (await request.json().catch(() => ({}))) as Partial<{
    name: string;
    address: string;
    rules: string;
    notes: string;
    referenceUrl: string;
  }>;

  try {
    requireDatabaseUrl();
    const prisma = getPrisma();
    const target = await prisma.venue.findFirst({
      where: {
        id: params.id,
        tenantId
      }
    });
    if (!target) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const nextSlug = body.name?.trim()
      ? await ensureUniqueVenueSlug(prisma, tenantId, slugify(body.name.trim()), target.id)
      : undefined;

    const updated = await prisma.venue.update({
      where: { id: target.id },
      data: {
        slug: nextSlug,
        name: body.name?.trim() || undefined,
        address: body.address?.trim() || undefined,
        rules: body.rules?.trim() || undefined,
        notes: body.notes?.trim() || undefined,
        referenceUrl: body.referenceUrl?.trim() || undefined
      }
    });

    return NextResponse.json({
      id: updated.id,
      name: updated.name,
      address: updated.address,
      rules: updated.rules,
      notes: updated.notes,
      referenceUrl: updated.referenceUrl,
      updatedAt: updated.updatedAt.toISOString()
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { ok: false, error: "Server config error (migrate not applied)" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const session = getSessionUserFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.role === "agent") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const tenantId = session.tenantId;
  if (!tenantId) {
    return NextResponse.json({ error: "tenantId is required" }, { status: 400 });
  }

  try {
    requireDatabaseUrl();
    const prisma = getPrisma();
    const target = await prisma.venue.findFirst({
      where: {
        id: params.id,
        tenantId
      }
    });
    if (!target) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Physical deletion of the venue row in the database.
    await prisma.venue.delete({ where: { id: target.id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { ok: false, error: "Server config error (migrate not applied)" },
      { status: 500 }
    );
  }
}
