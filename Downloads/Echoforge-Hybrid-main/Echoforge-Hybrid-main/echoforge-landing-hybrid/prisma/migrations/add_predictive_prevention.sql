-- Predictive Anomaly Prevention System Schema
-- This enables EchoForge to predict and prevent anomalies before they occur

-- Anomaly Predictions: Predictions of future anomalies
CREATE TABLE IF NOT EXISTS "anomaly_predictions" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "analysis_id" TEXT,
  "user_id" TEXT NOT NULL,
  "predicted_anomaly_type" TEXT NOT NULL,
  "predicted_severity" TEXT NOT NULL,
  "confidence_score" DOUBLE PRECISION NOT NULL,
  "predicted_timestamp" TIMESTAMP(3) NOT NULL,
  "prevention_actions" JSONB,
  "causal_chain" JSONB,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "actual_occurred" BOOLEAN,
  "prevented" BOOLEAN DEFAULT false,
  "prevention_effectiveness" DOUBLE PRECISION,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  
  CONSTRAINT "anomaly_predictions_analysis_id_fkey" FOREIGN KEY ("analysis_id") REFERENCES "analyses"("id") ON DELETE SET NULL,
  CONSTRAINT "anomaly_predictions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);

-- Anomaly Knowledge Graph: Relationships between anomalies
CREATE TABLE IF NOT EXISTS "anomaly_relationships" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "source_anomaly_id" TEXT NOT NULL,
  "target_anomaly_id" TEXT NOT NULL,
  "relationship_type" TEXT NOT NULL,
  "strength" DOUBLE PRECISION NOT NULL,
  "temporal_delay" INTEGER,
  "causal_confidence" DOUBLE PRECISION NOT NULL,
  "evidence_count" INTEGER DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  
  CONSTRAINT "anomaly_relationships_source_fkey" FOREIGN KEY ("source_anomaly_id") REFERENCES "analyses"("id") ON DELETE CASCADE,
  CONSTRAINT "anomaly_relationships_target_fkey" FOREIGN KEY ("target_anomaly_id") REFERENCES "analyses"("id") ON DELETE CASCADE
);

-- Prevention Actions: Actions taken to prevent predicted anomalies
CREATE TABLE IF NOT EXISTS "prevention_actions" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "prediction_id" TEXT NOT NULL,
  "action_type" TEXT NOT NULL,
  "action_config" JSONB NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "executed_at" TIMESTAMP(3),
  "effectiveness_score" DOUBLE PRECISION,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  
  CONSTRAINT "prevention_actions_prediction_id_fkey" FOREIGN KEY ("prediction_id") REFERENCES "anomaly_predictions"("id") ON DELETE CASCADE
);

-- Multi-Modal Correlation: Cross-domain anomaly patterns
CREATE TABLE IF NOT EXISTS "anomaly_correlations" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "primary_analysis_id" TEXT NOT NULL,
  "correlated_analysis_ids" TEXT[] NOT NULL,
  "correlation_type" TEXT NOT NULL,
  "correlation_strength" DOUBLE PRECISION NOT NULL,
  "temporal_window" INTEGER NOT NULL,
  "pattern_signature" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "anomaly_correlations_primary_fkey" FOREIGN KEY ("primary_analysis_id") REFERENCES "analyses"("id") ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS "anomaly_predictions_user_id_idx" ON "anomaly_predictions"("user_id");
CREATE INDEX IF NOT EXISTS "anomaly_predictions_status_idx" ON "anomaly_predictions"("status");
CREATE INDEX IF NOT EXISTS "anomaly_predictions_predicted_timestamp_idx" ON "anomaly_predictions"("predicted_timestamp");
CREATE INDEX IF NOT EXISTS "anomaly_relationships_source_idx" ON "anomaly_relationships"("source_anomaly_id");
CREATE INDEX IF NOT EXISTS "anomaly_relationships_target_idx" ON "anomaly_relationships"("target_anomaly_id");
CREATE INDEX IF NOT EXISTS "prevention_actions_prediction_id_idx" ON "prevention_actions"("prediction_id");
CREATE INDEX IF NOT EXISTS "prevention_actions_status_idx" ON "prevention_actions"("status");
CREATE INDEX IF NOT EXISTS "anomaly_correlations_primary_idx" ON "anomaly_correlations"("primary_analysis_id");
