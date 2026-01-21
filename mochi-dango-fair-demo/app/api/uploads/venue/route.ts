export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Upload handler for venue attachments stored in Vercel Blob.
import { handleUpload } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { getSessionUserFromRequest } from "@/lib/auth";
import { getPrisma, requireDatabaseUrl } from "@/lib/db";

const ALLOWED_CONTENT_TYPES = ["application/pdf", "image/png", "image/jpeg", "image/webp"];

export async function POST(request: Request) {
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

    return await handleUpload({
      request,
      onBeforeGenerateToken: async ({ clientPayload }) => {
        const payload = (clientPayload ?? {}) as { venueId?: string; filename?: string };
        if (!payload.venueId) {
          throw new Error("venueId is required");
        }
        if (!session.tenantId) {
          throw new Error("tenantId is required");
        }

        const tenant = await prisma.tenant.findUnique({
          where: { id: session.tenantId },
          select: { tenantKey: true }
        });
        if (!tenant) {
          throw new Error("tenant not found");
        }

        const user = await prisma.user.findUnique({
          where: { loginId: session.loginId },
          select: { id: true }
        });

        const safeName = (payload.filename ?? "upload")
          .replace(/\s+/g, "_")
          .replace(/[^a-zA-Z0-9._-]/g, "");
        const pathname = `tenants/${tenant.tenantKey}/venues/${payload.venueId}/${Date.now()}_${safeName}`;

        return {
          allowedContentTypes: ALLOWED_CONTENT_TYPES,
          tokenPayload: {
            venueId: payload.venueId,
            tenantId: session.tenantId,
            userId: user?.id ?? null,
            filename: payload.filename ?? safeName
          },
          pathname
        };
      },
      onUploadComplete: async ({ blob, tokenPayload }) => {
        const payload = tokenPayload as {
          venueId: string;
          tenantId: string;
          userId: string | null;
          filename: string;
        };

        await prisma.venueAttachment.create({
          data: {
            tenantId: payload.tenantId,
            venueId: payload.venueId,
            url: blob.url,
            pathname: blob.pathname,
            filename: payload.filename,
            contentType: blob.contentType ?? "application/octet-stream",
            size: blob.size,
            createdByUserId: payload.userId
          }
        });
      }
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { ok: false, error: "Server config error (migrate not applied)" },
      { status: 500 }
    );
  }
}
