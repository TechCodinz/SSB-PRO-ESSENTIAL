"""
Unified Revolutionary AI API
=============================
A comprehensive API layer that exposes all revolutionary AI engines
through a unified interface.

This module integrates:
- Neural Swarm Intelligence
- Temporal Precognition
- Autonomous Self-Healing
- Adversarial Immune System
- Cognitive Reasoning Engine

Author: EchoForge AI Team
License: Proprietary
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends
from pydantic import BaseModel, Field
from typing import Dict, List, Any, Optional
import numpy as np
import time
from enum import Enum

# Import all revolutionary engines
from core.neural_swarm_engine import get_swarm_engine, NeuralSwarmEngine
from core.temporal_precognition import get_precognition_system, TemporalPrecognitionSystem, PredictionHorizon
from core.self_healing_system import get_self_healing_system, SelfHealingSystem
from core.adversarial_immune import get_immune_system, AdversarialImmuneSystem
from core.cognitive_reasoning import get_reasoning_engine, CognitiveReasoningEngine, EntityType


# =============================================================================
# API Models
# =============================================================================

class SwarmDetectionRequest(BaseModel):
    """Request for swarm-based detection"""
    data: List[List[float]] = Field(..., description="2D array of data points")
    context: Optional[Dict[str, Any]] = None
    return_details: bool = False


class SwarmDetectionResponse(BaseModel):
    """Response from swarm detection"""
    anomaly_scores: List[float]
    is_anomaly: List[bool]
    consensus_levels: List[float]
    processing_time_ms: float
    swarm_statistics: Dict[str, Any]
    specialization_scores: Optional[Dict[str, List[float]]] = None


class PredictionRequest(BaseModel):
    """Request for temporal prediction"""
    horizon: Optional[str] = Field(None, description="1h, 6h, 24h, or 7d")
    data: Optional[Dict[str, float]] = Field(None, description="Current data point to ingest")


class PredictionResponse(BaseModel):
    """Response with predictions"""
    predictions: List[Dict[str, Any]]
    system_status: Dict[str, Any]


class HealthCheckRequest(BaseModel):
    """Request for health check with optional healing"""
    component_id: Optional[str] = None
    metrics: Optional[Dict[str, float]] = None
    trigger_healing: bool = True


class HealthCheckResponse(BaseModel):
    """Health check response"""
    overall_status: str
    components: Dict[str, Any]
    drift_status: Dict[str, Any]
    recent_events: List[Dict]


class AdversarialCheckRequest(BaseModel):
    """Request for adversarial input check"""
    data: List[float] = Field(..., description="Input data to check")
    source_ip: Optional[str] = None
    validate_only: bool = False


class AdversarialCheckResponse(BaseModel):
    """Adversarial check response"""
    is_safe: bool
    threat_level: str
    defense_actions: List[str]
    sanitized_data: Optional[List[float]] = None
    processing_time_ms: float


class ReasoningRequest(BaseModel):
    """Request for cognitive reasoning"""
    observation: Dict[str, Any] = Field(..., description="Observation to reason about")
    context: Optional[Dict[str, Any]] = None


class ReasoningResponse(BaseModel):
    """Reasoning response"""
    chain_id: str
    conclusion: str
    confidence: float
    explanation: str
    steps: List[Dict[str, Any]]
    uncertainty: float


class KnowledgeAddRequest(BaseModel):
    """Request to add knowledge"""
    entity_type: str = Field(..., description="data_point, feature, anomaly, pattern, rule, hypothesis, cause, effect")
    name: str
    properties: Dict[str, Any] = {}
    relations: Optional[List[Dict[str, str]]] = None


class UnifiedAnalysisRequest(BaseModel):
    """Request for unified analysis using all engines"""
    data: List[List[float]] = Field(..., description="Data to analyze")
    use_swarm: bool = True
    use_prediction: bool = True
    use_reasoning: bool = True
    use_immune: bool = True
    source_ip: Optional[str] = None


class UnifiedAnalysisResponse(BaseModel):
    """Response from unified analysis"""
    overall_verdict: str
    overall_confidence: float
    swarm_results: Optional[Dict[str, Any]] = None
    predictions: Optional[List[Dict[str, Any]]] = None
    reasoning: Optional[Dict[str, Any]] = None
    immune_status: Optional[Dict[str, Any]] = None
    processing_time_ms: float
    recommendation: str


# =============================================================================
# Router
# =============================================================================

router = APIRouter(prefix="/api/v2/ai", tags=["Revolutionary AI"])


# =============================================================================
# Swarm Intelligence Endpoints
# =============================================================================

@router.post("/swarm/detect", response_model=SwarmDetectionResponse)
async def swarm_detect(request: SwarmDetectionRequest):
    """
    Perform anomaly detection using Neural Swarm Intelligence.
    
    This uses 1000+ neural agents with stigmergic learning and
    emergent collective intelligence.
    """
    try:
        engine = get_swarm_engine()
        data = np.array(request.data)
        
        result = engine.detect(
            data,
            context=request.context,
            return_details=request.return_details
        )
        
        return SwarmDetectionResponse(
            anomaly_scores=result["anomaly_scores"].tolist(),
            is_anomaly=result["is_anomaly"].tolist(),
            consensus_levels=result["consensus_levels"].tolist(),
            processing_time_ms=result["processing_time_ms"],
            swarm_statistics=result["swarm_statistics"],
            specialization_scores={
                k: list(v) for k, v in result["specialization_scores"].items()
            } if request.return_details else None
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/swarm/evolve")
async def swarm_evolve(background_tasks: BackgroundTasks):
    """
    Trigger swarm evolution to improve performance.
    
    Uses genetic algorithms to cull weak agents and
    clone/mutate top performers.
    """
    engine = get_swarm_engine()
    background_tasks.add_task(engine.evolve)
    
    return {
        "status": "evolution_triggered",
        "current_generation": engine.generation
    }


@router.get("/swarm/status")
async def swarm_status():
    """Get comprehensive swarm status."""
    engine = get_swarm_engine()
    return engine.get_swarm_status()


# =============================================================================
# Temporal Precognition Endpoints  
# =============================================================================

@router.post("/precognition/predict", response_model=PredictionResponse)
async def predict_anomalies(request: PredictionRequest):
    """
    Predict future anomalies before they happen.
    
    Uses causal chain analysis, counterfactual reasoning,
    and multi-horizon prediction.
    """
    try:
        system = get_precognition_system()
        
        # Ingest data if provided
        if request.data:
            system.ingest_data(request.data)
        
        # Get predictions
        horizon_enum = None
        if request.horizon:
            horizon_map = {
                "1h": PredictionHorizon.HOUR_1,
                "6h": PredictionHorizon.HOUR_6,
                "24h": PredictionHorizon.HOUR_24,
                "7d": PredictionHorizon.DAY_7
            }
            horizon_enum = horizon_map.get(request.horizon)
        
        predictions = system.predict(horizon_enum)
        
        return PredictionResponse(
            predictions=[
                {
                    "id": p.prediction_id,
                    "horizon": p.horizon.value,
                    "probability": p.probability,
                    "severity": p.severity,
                    "predicted_time": p.predicted_time,
                    "confidence_interval": p.confidence_interval,
                    "causal_factors": p.causal_factors,
                    "prevention_actions": p.prevention_actions,
                    "counterfactuals": p.counterfactuals
                }
                for p in predictions
            ],
            system_status=system.get_status()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/precognition/ingest")
async def ingest_data(data: Dict[str, float]):
    """Ingest real-time data for prediction."""
    system = get_precognition_system()
    system.ingest_data(data)
    return {"status": "ingested", "variables": list(data.keys())}


@router.post("/precognition/update-causal-model")
async def update_causal_model(background_tasks: BackgroundTasks):
    """Update the causal graph from accumulated data."""
    system = get_precognition_system()
    background_tasks.add_task(system.update_causal_model)
    return {"status": "causal_model_update_triggered"}


# =============================================================================
# Self-Healing Endpoints
# =============================================================================

@router.post("/healing/check", response_model=HealthCheckResponse)
async def health_check(request: HealthCheckRequest):
    """
    Check system health and optionally trigger healing.
    
    The system can automatically diagnose and fix issues
    including model drift, performance degradation, and more.
    """
    system = get_self_healing_system()
    
    # Update metrics if provided
    if request.component_id and request.metrics:
        system.update_metrics(request.component_id, request.metrics)
    
    status = system.get_system_health()
    
    return HealthCheckResponse(
        overall_status=status["overall_status"],
        components=status["components"],
        drift_status=status["drift_status"],
        recent_events=status["recent_events"]
    )


@router.post("/healing/register-component")
async def register_component(
    component_id: str,
    name: str,
    metrics: Optional[Dict[str, float]] = None
):
    """Register a component for health monitoring."""
    system = get_self_healing_system()
    system.register_component(component_id, name)
    
    if metrics:
        system.update_metrics(component_id, metrics)
    
    return {"status": "registered", "component_id": component_id}


@router.post("/healing/reset")
async def reset_healing(component_id: Optional[str] = None):
    """Reset healing attempt counters."""
    system = get_self_healing_system()
    system.reset_healing_attempts(component_id)
    return {"status": "reset", "component_id": component_id or "all"}


# =============================================================================
# Adversarial Immune System Endpoints
# =============================================================================

@router.post("/immune/check", response_model=AdversarialCheckResponse)
async def adversarial_check(request: AdversarialCheckRequest):
    """
    Check input for adversarial attacks.
    
    Uses biological immune system principles with antibodies,
    memory cells, and adaptive defense.
    """
    try:
        system = get_immune_system()
        data = np.array(request.data)
        
        result = system.process_input(
            data,
            source_ip=request.source_ip,
            validate_only=request.validate_only
        )
        
        return AdversarialCheckResponse(
            is_safe=result["is_safe"],
            threat_level=result["threat_level"],
            defense_actions=result["defense_actions"],
            sanitized_data=result["sanitized_data"].tolist() if not request.validate_only else None,
            processing_time_ms=result["processing_time_ms"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/immune/mask-gradients")
async def mask_gradients(gradients: List[float]):
    """
    Mask gradients to prevent gradient-based attacks.
    
    Used during model training to prevent FGSM, PGD, etc.
    """
    system = get_immune_system()
    masked = system.mask_gradients(np.array(gradients))
    return {"masked_gradients": masked.tolist()}


@router.get("/immune/status")
async def immune_status():
    """Get immune system status including antibody inventory."""
    system = get_immune_system()
    return system.get_status()


# =============================================================================
# Cognitive Reasoning Endpoints
# =============================================================================

@router.post("/reasoning/analyze", response_model=ReasoningResponse)
async def cognitive_reasoning(request: ReasoningRequest):
    """
    Perform cognitive reasoning on an observation.
    
    Uses neuro-symbolic AI with knowledge graphs,
    abductive reasoning, and natural language explanations.
    """
    try:
        engine = get_reasoning_engine()
        chain = engine.reason(request.observation, request.context)
        
        return ReasoningResponse(
            chain_id=chain.chain_id,
            conclusion=chain.conclusion,
            confidence=chain.overall_confidence,
            explanation=chain.natural_language,
            steps=chain.steps,
            uncertainty=engine.uncertainty_zones.get(chain.chain_id, 0)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/reasoning/add-knowledge")
async def add_knowledge(request: KnowledgeAddRequest):
    """Add knowledge to the reasoning engine's knowledge graph."""
    engine = get_reasoning_engine()
    
    # Map string to enum
    type_map = {
        "data_point": EntityType.DATA_POINT,
        "feature": EntityType.FEATURE,
        "anomaly": EntityType.ANOMALY,
        "pattern": EntityType.PATTERN,
        "rule": EntityType.RULE,
        "hypothesis": EntityType.HYPOTHESIS,
        "cause": EntityType.CAUSE,
        "effect": EntityType.EFFECT
    }
    
    entity_type = type_map.get(request.entity_type, EntityType.PATTERN)
    
    relations = None
    if request.relations:
        relations = [
            (r["target_id"], r["relation_type"], r.get("evidence", "user provided"))
            for r in request.relations
        ]
    
    entity_id = engine.add_knowledge(
        entity_type=entity_type,
        name=request.name,
        properties=request.properties,
        relations=relations
    )
    
    return {"entity_id": entity_id, "status": "added"}


@router.post("/reasoning/add-rule")
async def add_rule(
    antecedent: str,
    consequent: str,
    confidence: float = 0.8
):
    """Add a reasoning rule to the engine."""
    engine = get_reasoning_engine()
    rule_id = engine.add_rule(antecedent, consequent, confidence=confidence)
    return {"rule_id": rule_id, "status": "added"}


@router.post("/reasoning/feedback")
async def reasoning_feedback(
    chain_id: str,
    correct: bool,
    new_pattern: Optional[str] = None
):
    """Provide feedback on reasoning to improve accuracy."""
    engine = get_reasoning_engine()
    engine.learn_from_feedback(
        chain_id,
        {"correct": correct, "new_pattern": new_pattern} if new_pattern else {"correct": correct}
    )
    return {"status": "feedback_recorded", "chain_id": chain_id}


@router.get("/reasoning/status")
async def reasoning_status():
    """Get cognitive reasoning engine status."""
    engine = get_reasoning_engine()
    return engine.get_status()


# =============================================================================
# Unified Analysis Endpoint
# =============================================================================

@router.post("/unified/analyze", response_model=UnifiedAnalysisResponse)
async def unified_analysis(request: UnifiedAnalysisRequest):
    """
    Perform unified analysis using ALL revolutionary AI engines.
    
    This is the ultimate endpoint that combines:
    - Neural Swarm Intelligence for detection
    - Temporal Precognition for predictions
    - Cognitive Reasoning for explanations
    - Adversarial Immune System for protection
    """
    start_time = time.time()
    
    results = {
        "swarm_results": None,
        "predictions": None,
        "reasoning": None,
        "immune_status": None
    }
    
    data = np.array(request.data)
    
    # Step 1: Adversarial check (always runs first)
    if request.use_immune:
        immune_system = get_immune_system()
        for point in data:
            immune_result = immune_system.process_input(point, source_ip=request.source_ip)
            if not immune_result["is_safe"]:
                return UnifiedAnalysisResponse(
                    overall_verdict="BLOCKED",
                    overall_confidence=0.95,
                    immune_status={
                        "threat_level": immune_result["threat_level"],
                        "actions": immune_result["defense_actions"]
                    },
                    processing_time_ms=(time.time() - start_time) * 1000,
                    recommendation="Input blocked by adversarial immune system. Potential attack detected."
                )
        results["immune_status"] = {"status": "all_safe", "inputs_checked": len(data)}
    
    # Step 2: Swarm detection
    if request.use_swarm:
        swarm = get_swarm_engine()
        swarm_result = swarm.detect(data, return_details=True)
        results["swarm_results"] = {
            "anomalies_detected": int(np.sum(swarm_result["is_anomaly"])),
            "total_points": len(data),
            "avg_consensus": float(np.mean(swarm_result["consensus_levels"])),
            "avg_score": float(np.mean(swarm_result["anomaly_scores"])),
            "swarm_statistics": swarm_result["swarm_statistics"]
        }
    
    # Step 3: Predictions
    if request.use_prediction:
        precog = get_precognition_system()
        # Ingest current data
        for i, point in enumerate(data):
            precog.ingest_data({f"feature_{j}": float(v) for j, v in enumerate(point)})
        
        predictions = precog.predict()
        results["predictions"] = [
            {
                "horizon": p.horizon.value,
                "probability": p.probability,
                "severity": p.severity
            }
            for p in predictions
        ]
    
    # Step 4: Cognitive reasoning
    if request.use_reasoning:
        reasoning = get_reasoning_engine()
        
        # Build observation from data
        observation = {
            "data_points": len(data),
            "mean": float(np.mean(data)),
            "std": float(np.std(data)),
            "z_score": float((np.mean(data) - np.median(data)) / (np.std(data) + 1e-10))
        }
        
        if results["swarm_results"]:
            observation["swarm_consensus"] = results["swarm_results"]["avg_consensus"]
            observation["anomaly_rate"] = results["swarm_results"]["anomalies_detected"] / len(data)
        
        chain = reasoning.reason(observation)
        results["reasoning"] = {
            "conclusion": chain.conclusion,
            "confidence": chain.overall_confidence,
            "explanation": chain.natural_language
        }
    
    # Generate overall verdict
    anomaly_detected = False
    overall_confidence = 0.5
    
    if results["swarm_results"]:
        anomaly_rate = results["swarm_results"]["anomalies_detected"] / len(data)
        if anomaly_rate > 0.1:
            anomaly_detected = True
            overall_confidence = max(overall_confidence, results["swarm_results"]["avg_consensus"])
    
    if results["predictions"]:
        high_risk_predictions = [p for p in results["predictions"] if p["probability"] > 0.7]
        if high_risk_predictions:
            anomaly_detected = True
            overall_confidence = max(overall_confidence, high_risk_predictions[0]["probability"])
    
    if results["reasoning"]:
        overall_confidence = max(overall_confidence, results["reasoning"]["confidence"])
    
    verdict = "ANOMALY_DETECTED" if anomaly_detected else "NORMAL"
    
    # Generate recommendation
    if anomaly_detected:
        recommendation = "Anomalies detected. Review flagged data points and consider the reasoning explanation for root cause analysis."
    else:
        recommendation = "No significant anomalies detected. Continue monitoring."
    
    return UnifiedAnalysisResponse(
        overall_verdict=verdict,
        overall_confidence=overall_confidence,
        swarm_results=results["swarm_results"],
        predictions=results["predictions"],
        reasoning=results["reasoning"],
        immune_status=results["immune_status"],
        processing_time_ms=(time.time() - start_time) * 1000,
        recommendation=recommendation
    )


# =============================================================================
# Export
# =============================================================================

def get_router():
    """Get the router for FastAPI app"""
    return router


__all__ = ["router", "get_router"]
