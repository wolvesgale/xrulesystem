// Venues item API for fetching, updating, and deleting single records.
import { NextRequest, NextResponse } from "next/server";
import { getSessionUserFromRequest } from "@/lib/auth";
import { deleteVenue, listVenues, updateVenue } from "@/lib/googleSheets";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const session = getSessionUserFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const venues = await listVenues({
    agencyId: session.role === "agent" ? session.agencyId ?? undefined : undefined
  });
  const venue = venues.find((item) => item.id === params.id);
  if (!venue) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (session.role === "agent" && venue.agencyId !== session.agencyId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(venue);
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const session = getSessionUserFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as Partial<{
    agencyId: string;
    storeName: string;
    floorName: string;
    placeDetail: string;
    svName: string;
    photoUrl: string;
    memo: string;
  }>;

  const existingList = await listVenues({
    agencyId: session.role === "agent" ? session.agencyId ?? undefined : undefined
  });
  const target = existingList.find((item) => item.id === params.id);
  if (!target) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (session.role === "agent" && target.agencyId !== session.agencyId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const nextInput = {
    ...body,
    agencyId: session.role === "agent" ? target.agencyId : body.agencyId ?? target.agencyId
  };

  const updated = await updateVenue(params.id, nextInput);
  return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const session = getSessionUserFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const venues = await listVenues({
    agencyId: session.role === "agent" ? session.agencyId ?? undefined : undefined
  });
  const target = venues.find((item) => item.id === params.id);
  if (!target) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (session.role === "agent" && target.agencyId !== session.agencyId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Physical deletion by clearing the row contents.
  await deleteVenue(params.id);
  return NextResponse.json({ ok: true });
}
