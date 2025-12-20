-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'PENDING');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE';

-- CreateTable
CREATE TABLE "plan_definitions" (
    "id" TEXT NOT NULL,
    "plan" "Plan",
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "priceCents" INTEGER NOT NULL,
    "description" TEXT,
    "features" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "analysesLimit" INTEGER,
    "rowsLimit" INTEGER,
    "apiCallsLimit" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plan_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "plan_definitions_plan_key" ON "plan_definitions"("plan");

-- CreateIndex
CREATE UNIQUE INDEX "plan_definitions_slug_key" ON "plan_definitions"("slug");

-- CreateIndex
CREATE INDEX "plan_definitions_isActive_idx" ON "plan_definitions"("isActive");

-- Seed default plan definitions
INSERT INTO "plan_definitions" ("id", "plan", "slug", "name", "priceCents", "description", "features", "analysesLimit", "rowsLimit", "apiCallsLimit", "isActive")
VALUES
  ('plan_free', 'FREE', 'free', 'Free', 0, 'Perfect for getting started', ARRAY['10 analyses per month','Basic support','Standard detection'], 10, 1000, 1000, true),
  ('plan_starter', 'STARTER', 'starter', 'Starter Pro', 3900, 'Ideal for growing teams expanding fraud prevention', ARRAY['250 analyses per month','Priority support','Advanced detection','Custom limit overrides'], 250, 10000, 10000, true),
  ('plan_pro', 'PRO', 'pro', 'Professional', 12900, 'Enterprise-grade analytics for professional teams', ARRAY['1,000 analyses per month','24/7 support','Premium detection','API access','Custom integrations'], 1000, 50000, 50000, true),
  ('plan_enterprise', 'ENTERPRISE', 'enterprise', 'Enterprise', 149900, 'Scalable solution for large organisations', ARRAY['Unlimited analyses','Dedicated support','Custom ML models','White-label','SLA guarantee'], NULL, NULL, 1000000, true);
