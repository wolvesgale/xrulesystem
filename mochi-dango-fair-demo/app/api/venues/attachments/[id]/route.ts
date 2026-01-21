export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Delete venue attachment and blob.
import { NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { getSessionUserFromRequest } from "@/lib/auth";
import { getPrisma, requireDatabaseUrl } from "@/lib/db";

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = getSessionUserFromRequest(request as never);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.role !== "admin" && session.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    requireDatabaseUrl();
    const prisma = getPrisma();
    const attachment = await prisma.venueAttachment.findFirst({
      where: {
        id: params.id,
        tenantId: session.tenantId ?? undefined
      }
    });

    if (!attachment) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await del(attachment.url);
    await prisma.venueAttachment.delete({ where: { id: attachment.id } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { ok: false, error: "Server config error (migrate not applied)" },
      { status: 500 }
    );
  }
}
