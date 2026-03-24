-- AlterTable
ALTER TABLE "orders" ADD COLUMN "status_changed_by_email" TEXT,
ADD COLUMN "status_changed_at" TIMESTAMP(3),
ADD COLUMN "inventory_synced" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "inventory_synced_at" TIMESTAMP(3);
