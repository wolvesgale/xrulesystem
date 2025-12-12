// Venues collection API for listing and creating records.
import { NextRequest, NextResponse } from "next/server";
import { getSessionUserFromRequest } from "@/lib/auth";
import { createVenue, listVenues } from "@/lib/googleSheets";

export async function GET(request: NextRequest) {
  const session = getSessionUserFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const storeName = request.nextUrl.searchParams.get("storeName") || undefined;
  const floorName = request.nextUrl.searchParams.get("floorName") || undefined;
  const keyword = request.nextUrl.searchParams.get("q") || undefined;

  const filters = {
    storeName,
    floorName,
    keyword,
    agencyId: session.role === "agent" ? session.agencyId ?? undefined : undefined
  };

  const venues = await listVenues(filters);
  return NextResponse.json(venues);
}

export async function POST(request: NextRequest) {
  const session = getSessionUserFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    storeName?: string;
    floorName?: string;
    placeDetail?: string;
    svName?: string;
    photoUrl?: string;
    memo?: string;
    agencyId?: string;
  };

  const baseAgencyId = session.role === "agent" ? session.agencyId : body.agencyId;
  if (!baseAgencyId) {
    return NextResponse.json({ error: "agencyId is required" }, { status: 400 });
  }

  const venue = await createVenue({
    agencyId: baseAgencyId,
    storeName: body.storeName ?? "",
    floorName: body.floorName ?? "",
    placeDetail: body.placeDetail ?? "",
    svName: body.svName ?? "",
    photoUrl: body.photoUrl ?? "",
    memo: body.memo ?? ""
  });

  return NextResponse.json(venue);
}
