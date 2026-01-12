-- Add slug to VenueNote
ALTER TABLE "VenueNote" ADD COLUMN "slug" TEXT NOT NULL DEFAULT 'venue-note-default';
CREATE UNIQUE INDEX "VenueNote_slug_key" ON "VenueNote"("slug");
