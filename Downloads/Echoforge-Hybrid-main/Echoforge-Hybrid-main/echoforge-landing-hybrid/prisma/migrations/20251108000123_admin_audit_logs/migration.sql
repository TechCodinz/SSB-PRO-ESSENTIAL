-- CreateTable
CREATE TABLE "admin_audit_logs" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "actorEmail" TEXT,
    "actorRole" "UserRole",
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SUCCESS',
    "route" TEXT,
    "httpMethod" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "description" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "admin_audit_logs_actorId_idx" ON "admin_audit_logs"("actorId");

-- CreateIndex
CREATE INDEX "admin_audit_logs_route_idx" ON "admin_audit_logs"("route");

-- CreateIndex
CREATE INDEX "admin_audit_logs_createdAt_idx" ON "admin_audit_logs"("createdAt");

-- AddForeignKey
ALTER TABLE "admin_audit_logs" ADD CONSTRAINT "admin_audit_logs_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
