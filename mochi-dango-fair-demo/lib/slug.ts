// Helpers for generating unique venue slugs.
import type { PrismaClient } from "@prisma/client";

export function slugify(input: string): string {
  const normalized = input
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
  return normalized || "venue";
}

export async function ensureUniqueVenueSlug(
  prisma: PrismaClient,
  tenantId: string,
  baseSlug: string,
  excludeId?: string
): Promise<string> {
  let candidate = baseSlug;
  let suffix = 2;

  while (true) {
    const existing = await prisma.venue.findFirst({
      where: {
        tenantId,
        slug: candidate,
        ...(excludeId ? { id: { not: excludeId } } : {})
      },
      select: { id: true }
    });

    if (!existing) {
      return candidate;
    }

    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}
