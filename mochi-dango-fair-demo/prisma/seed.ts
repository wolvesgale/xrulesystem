// Seed initial tenant, agency, users, and venues.
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/password";

const prisma = new PrismaClient();

type SeedUser = {
  loginId: string;
  password: string;
  displayName: string;
};

function envOrDefault(key: string, fallback: string): string {
  const value = process.env[key];
  return value && value.length > 0 ? value : fallback;
}

async function main() {
  const tenantKey = envOrDefault("SEED_TENANT_KEY", "xrule-tenant");
  const tenantName = envOrDefault("SEED_TENANT_NAME", "Xrule");
  const tenant = await prisma.tenant.upsert({
    where: { tenantKey },
    update: {
      name: tenantName,
      siteTitle: envOrDefault("SEED_SITE_TITLE", "Xrule | 催事販売管理"),
      primaryColor: envOrDefault("SEED_PRIMARY_COLOR", "#0f172a"),
      accentColor: envOrDefault("SEED_ACCENT_COLOR", "#38bdf8"),
      logoUrl: process.env.SEED_LOGO_URL ?? null,
      status: "active"
    },
    create: {
      tenantKey,
      name: tenantName,
      siteTitle: envOrDefault("SEED_SITE_TITLE", "Xrule | 催事販売管理"),
      primaryColor: envOrDefault("SEED_PRIMARY_COLOR", "#0f172a"),
      accentColor: envOrDefault("SEED_ACCENT_COLOR", "#38bdf8"),
      logoUrl: process.env.SEED_LOGO_URL ?? null,
      status: "active"
    }
  });

  const agencyCode = envOrDefault("SEED_AGENCY_CODE", "xrule-agency-01");
  const agencyName = envOrDefault("SEED_AGENCY_NAME", "Xrule 代理店");
  const agency = await prisma.agency.upsert({
    where: { code: agencyCode },
    update: {
      name: agencyName,
      color: envOrDefault("SEED_AGENCY_COLOR", "#38bdf8"),
      tenantId: tenant.id
    },
    create: {
      code: agencyCode,
      name: agencyName,
      color: envOrDefault("SEED_AGENCY_COLOR", "#38bdf8"),
      tenantId: tenant.id
    }
  });

  const superAdmin: SeedUser = {
    loginId: envOrDefault("SEED_SUPER_ID", "superadmin"),
    password: envOrDefault("SEED_SUPER_PW", "superpass"),
    displayName: envOrDefault("SEED_SUPER_NAME", "全体管理者")
  };
  const admin: SeedUser = {
    loginId: envOrDefault("SEED_ADMIN_ID", "admin01"),
    password: envOrDefault("SEED_ADMIN_PW", "adminpass"),
    displayName: envOrDefault("SEED_ADMIN_NAME", "管理者")
  };
  const agent: SeedUser = {
    loginId: envOrDefault("SEED_AGENT_ID", "agent01"),
    password: envOrDefault("SEED_AGENT_PW", "agentpass"),
    displayName: envOrDefault("SEED_AGENT_NAME", "代理店担当")
  };

  await prisma.user.upsert({
    where: { loginId: superAdmin.loginId },
    update: {
      name: superAdmin.displayName,
      displayName: superAdmin.displayName,
      role: "super_admin",
      passwordHash: await hashPassword(superAdmin.password)
    },
    create: {
      loginId: superAdmin.loginId,
      name: superAdmin.displayName,
      displayName: superAdmin.displayName,
      role: "super_admin",
      passwordHash: await hashPassword(superAdmin.password)
    }
  });

  await prisma.user.upsert({
    where: { loginId: admin.loginId },
    update: {
      name: admin.displayName,
      displayName: admin.displayName,
      role: "admin",
      passwordHash: await hashPassword(admin.password),
      tenantId: tenant.id
    },
    create: {
      loginId: admin.loginId,
      name: admin.displayName,
      displayName: admin.displayName,
      role: "admin",
      passwordHash: await hashPassword(admin.password),
      tenantId: tenant.id
    }
  });

  await prisma.user.upsert({
    where: { loginId: agent.loginId },
    update: {
      name: agent.displayName,
      displayName: agent.displayName,
      role: "agent",
      passwordHash: await hashPassword(agent.password),
      tenantId: tenant.id,
      agencyId: agency.id
    },
    create: {
      loginId: agent.loginId,
      name: agent.displayName,
      displayName: agent.displayName,
      role: "agent",
      passwordHash: await hashPassword(agent.password),
      tenantId: tenant.id,
      agencyId: agency.id
    }
  });

  const venues = [
    {
      slug: "xrule-hall-a",
      name: "Xrule百貨店 催事場",
      address: "東京都千代田区1-1",
      rules: "駐車場あり / バックヤード利用可 / 入館証必須",
      notes: "ゴミは閉店後に指定場所へ。",
      referenceUrl: "https://example.com/venue-a.pdf"
    },
    {
      slug: "xrule-hall-b",
      name: "Xrule駅前イベントスペース",
      address: "神奈川県横浜市2-2",
      rules: "搬入は9:00〜10:00 / 駐車場なし",
      notes: "入館証は事前申請が必要です。",
      referenceUrl: "https://example.com/venue-b.pdf"
    },
    {
      slug: "xrule-hall-c",
      name: "Xruleモール 特設会場",
      address: "埼玉県さいたま市3-3",
      rules: "バックヤード利用不可 / ゴミは持ち帰り",
      notes: "エスカレーター利用時は台車固定必須。",
      referenceUrl: "https://example.com/venue-c.pdf"
    }
  ];

  for (const venue of venues) {
    await prisma.venue.upsert({
      where: { slug: venue.slug },
      update: {
        name: venue.name,
        address: venue.address,
        rules: venue.rules,
        notes: venue.notes,
        referenceUrl: venue.referenceUrl,
        tenantId: tenant.id
      },
      create: {
        slug: venue.slug,
        name: venue.name,
        address: venue.address,
        rules: venue.rules,
        notes: venue.notes,
        referenceUrl: venue.referenceUrl,
        tenantId: tenant.id
      }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
