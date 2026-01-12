// Tenant theme lookup helpers for branding.
import { cache } from "react";
import { getPrisma } from "@/lib/db";

export type TenantTheme = {
  siteTitle: string;
  primaryColor: string;
  accentColor: string;
  logoUrl: string | null;
};

const DEFAULT_THEME: TenantTheme = {
  siteTitle: "Xrule | 催事販売管理",
  primaryColor: "#0f172a",
  accentColor: "#38bdf8",
  logoUrl: null
};

// Fetches the first active tenant theme as a fallback.
export const getActiveTenantTheme = cache(async (): Promise<TenantTheme> => {
  try {
    const prisma = getPrisma();
    const tenant = await prisma.tenant.findFirst({
      where: { status: "active" },
      orderBy: { createdAt: "asc" }
    });

    if (!tenant) {
      return DEFAULT_THEME;
    }

    return {
      siteTitle: tenant.siteTitle || tenant.name || DEFAULT_THEME.siteTitle,
      primaryColor: tenant.primaryColor || DEFAULT_THEME.primaryColor,
      accentColor: tenant.accentColor || DEFAULT_THEME.accentColor,
      logoUrl: tenant.logoUrl
    };
  } catch (error) {
    console.error("Failed to load tenant theme", error);
    return DEFAULT_THEME;
  }
});
