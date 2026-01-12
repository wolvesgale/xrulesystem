// Prisma client singleton for Neon/Postgres access.
import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

function getDatabaseUrl(): string | null {
  const url = process.env.DATABASE_URL;
  return url && url.length > 0 ? url : null;
}

export function getPrisma(): PrismaClient {
  if (!global.__prisma) {
    global.__prisma = new PrismaClient({ log: ["error"] });
  }
  return global.__prisma;
}

export function requireDatabaseUrl(): string {
  const url = getDatabaseUrl();
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }
  return url;
}
