-- Add tenantKey to Tenant
ALTER TABLE "Tenant" ADD COLUMN "tenantKey" TEXT NOT NULL DEFAULT 'tenant-default';
CREATE UNIQUE INDEX "Tenant_tenantKey_key" ON "Tenant"("tenantKey");

-- Add code to Agency
ALTER TABLE "Agency" ADD COLUMN "code" TEXT NOT NULL DEFAULT 'agency-default';
CREATE UNIQUE INDEX "Agency_code_key" ON "Agency"("code");

-- Add slug to Venue
ALTER TABLE "Venue" ADD COLUMN "slug" TEXT NOT NULL DEFAULT 'venue-default';
CREATE UNIQUE INDEX "Venue_slug_key" ON "Venue"("slug");
