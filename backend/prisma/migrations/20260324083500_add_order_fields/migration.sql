-- AlterTable (Idempotent)
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "status_changed_by_email" TEXT;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "status_changed_at" TIMESTAMP(3);
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "inventory_synced" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "inventory_synced_at" TIMESTAMP(3);
