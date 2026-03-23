-- 1. Add 'suspended' to ContractStatus enum
-- Note: In PostgreSQL, adding to an enum cannot be done in a transaction in some versions.
-- But usually it works.
ALTER TYPE "ContractStatus" ADD VALUE IF NOT EXISTS 'suspended';

-- 2. Add missing columns to Dealer table
-- Check if they exist first (safe to run)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Dealer' AND column_name='statusChangedByEmail') THEN
        ALTER TABLE "Dealer" ADD COLUMN "statusChangedByEmail" TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Dealer' AND column_name='statusChangedAt') THEN
        ALTER TABLE "Dealer" ADD COLUMN "statusChangedAt" TIMESTAMP(3);
    END IF;
END $$;

-- 3. Create 'contracts' table if it doesn't exist
CREATE TABLE IF NOT EXISTS "contracts" (
    "id" SERIAL NOT NULL,
    "dealerId" INTEGER NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "status" "ContractStatus" NOT NULL DEFAULT 'pending',
    "type" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contracts_pkey" PRIMARY KEY ("id")
);

-- Add foreign key for contracts if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='contracts_dealerId_fkey') THEN
        ALTER TABLE "contracts" ADD CONSTRAINT "contracts_dealerId_fkey" FOREIGN KEY ("dealerId") REFERENCES "Dealer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

-- 4. Update 'products' table for JSONB support and missing columns
DO $$
BEGIN
    -- Change type to JSONB (requires casting)
    ALTER TABLE "products" ALTER COLUMN "title" TYPE JSONB USING "title"::JSONB;
    ALTER TABLE "products" ALTER COLUMN "description" TYPE JSONB USING "description"::JSONB;
    
    -- Add options column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='options') THEN
        ALTER TABLE "products" ADD COLUMN "options" JSONB;
    END IF;
END $$;

-- 5. Fix any other JSONB mismatches
-- Already did product_variants.title in last migration, but let's be sure
ALTER TABLE "product_variants" ALTER COLUMN "title" TYPE JSONB USING "title"::JSONB;
