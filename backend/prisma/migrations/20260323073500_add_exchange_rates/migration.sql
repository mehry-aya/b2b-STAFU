-- Add missing columns to orders
ALTER TABLE "orders" ADD COLUMN "status_changed_by_email" TEXT;
ALTER TABLE "orders" ADD COLUMN "status_changed_at" TIMESTAMP(3);

-- Change title type in product_variants to JSONB
-- Note: This requires a cast. If you have existing data, make sure it's valid JSON.
ALTER TABLE "product_variants" ALTER COLUMN "title" TYPE JSONB USING "title"::JSONB;

-- CreateTable
CREATE TABLE "exchange_rates" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "rate" DECIMAL(18,6) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exchange_rates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "exchange_rates_code_key" ON "exchange_rates"("code");

