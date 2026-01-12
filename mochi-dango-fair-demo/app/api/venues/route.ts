export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Venues collection API for listing and creating records.
import { NextRequest, NextResponse } from "next/server";
import { getSessionUserFromRequest } from "@/lib/auth";
import { getPrisma, requireDatabaseUrl } from "@/lib/db";

export async function GET(request: NextRequest) {
  const session = getSessionUserFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tenantId = session.tenantId;
  if (!tenantId) {
    return NextResponse.json({ error: "tenantId is required" }, { status: 400 });
  }

  const name = request.nextUrl.searchParams.get("name") || undefined;
  const address = request.nextUrl.searchParams.get("address") || undefined;
  const keyword = request.nextUrl.searchParams.get("q") || undefined;

  try {
    requireDatabaseUrl();
    const prisma = getPrisma();
    const venues = await prisma.venue.findMany({
      where: {
        tenantId,
        ...(name ? { name: { contains: name, mode: "insensitive" } } : {}),
        ...(address ? { address: { contains: address, mode: "insensitive" } } : {}),
        ...(keyword
          ? {
              OR: [
                { rules: { contains: keyword, mode: "insensitive" } },
                { notes: { contains: keyword, mode: "insensitive" } },
                { referenceUrl: { contains: keyword, mode: "insensitive" } }
              ]
            }
          : {})
      },
      orderBy: { updatedAt: "desc" }
    });

    return NextResponse.json(
      venues.map((venue) => ({
        id: venue.id,
        name: venue.name,
        address: venue.address,
        rules: venue.rules,
        notes: venue.notes,
        referenceUrl: venue.referenceUrl,
        updatedAt: venue.updatedAt.toISOString()
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

  if (session.role === "agent") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const tenantId = session.tenantId;
  if (!tenantId) {
    return NextResponse.json({ error: "tenantId is required" }, { status: 400 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    name?: string;
    address?: string;
    rules?: string;
    notes?: string;
    referenceUrl?: string;
  };

  if (!body.name?.trim()) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  try {
    requireDatabaseUrl();
    const prisma = getPrisma();
    const venue = await prisma.venue.create({
      data: {
        tenantId,
        name: body.name.trim(),
        address: body.address?.trim() || null,
        rules: body.rules?.trim() || null,
        notes: body.notes?.trim() || null,
        referenceUrl: body.referenceUrl?.trim() || null
      }
    });

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
