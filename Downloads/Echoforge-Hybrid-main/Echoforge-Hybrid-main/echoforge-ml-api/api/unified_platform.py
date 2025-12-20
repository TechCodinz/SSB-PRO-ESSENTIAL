"""
Unified Sentient Platform API
==============================
The complete API layer that connects ALL systems together:
- Sentient Orchestrator (the master AI)
- Admin & Employee Management
- Marketplace Protection
- AI Chat Assistant
- All Revolutionary AI Engines
- Owner Dashboard & Reports

This is the single entry point for the world's first
fully autonomous AI-driven SaaS platform.

Author: EchoForge AI Team
License: Proprietary
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends, WebSocket
from pydantic import BaseModel, Field
from typing import Dict, List, Any, Optional
import time
import json
import asyncio

# Import all systems
from core.sentient_orchestrator import (
    get_sentient_orchestrator,
    SentientOrchestrator,
    SentientState
)
from core.ai_chat_assistant import (
    get_chat_assistant,
    AIChatAssistant,
    ConversationType
)
from core.marketplace_protector import (
    get_marketplace_protector,
    MarketplaceProtector
)
from core.neural_swarm_engine import get_swarm_engine
from core.temporal_precognition import get_precognition_system, PredictionHorizon
from core.self_healing_system import get_self_healing_system
from core.adversarial_immune import get_immune_system
from core.cognitive_reasoning import get_reasoning_engine


# =============================================================================
# API Models
# =============================================================================

class OwnerLoginRequest(BaseModel):
    """Owner authentication"""
    owner_id: str
    secret_key: str


class OwnerCommandRequest(BaseModel):
    """Owner command to the AI"""
    command: str
    params: Optional[Dict[str, Any]] = None


class ChatRequest(BaseModel):
    """Chat message request"""
    conversation_id: Optional[str] = None
    message: str
    context: Optional[Dict[str, Any]] = None
    user_id: str = "anonymous"


class ChatResponse(BaseModel):
    """Chat response"""
    conversation_id: str
    response: str
    processing_time_ms: float


class ExplainAnomalyRequest(BaseModel):
    """Request to explain an anomaly"""
    user_id: str
    anomaly_data: Dict[str, Any]


class EmployeeCreateRequest(BaseModel):
    """Create employee request"""
    email: str
    name: str
    role: str = "viewer"
    department_id: Optional[str] = None
    manager_id: Optional[str] = None


class TaskCreateRequest(BaseModel):
    """Create task request"""
    title: str
    description: str
    assignee_id: Optional[str] = None
    priority: str = "medium"
    ai_assign: bool = False


class ListingSubmitRequest(BaseModel):
    """Submit listing for moderation"""
    seller_id: str
    title: str
    description: str
    price: float
    category: str = ""
    images: List[str] = []


class FullAnalysisRequest(BaseModel):
    """Request for full AI analysis"""
    data: List[List[float]]
    include_swarm: bool = True
    include_prediction: bool = True
    include_reasoning: bool = True
    include_immune_check: bool = True


class PlatformStatusResponse(BaseModel):
    """Complete platform status"""
    sentient_status: Dict[str, Any]
    ai_engines_status: Dict[str, Any]
    marketplace_status: Dict[str, Any]
    system_health: Dict[str, Any]
    timestamp: float


# =============================================================================
# Router
# =============================================================================

router = APIRouter(prefix="/api/v2/platform", tags=["Sentient Platform"])


# =============================================================================
# Authentication Helper
# =============================================================================

def get_owner_id() -> str:
    """Get owner ID (simplified - in production use proper auth)"""
    return "owner"


# =============================================================================
# Sentient AI Endpoints
# =============================================================================

@router.post("/sentient/awaken")
async def awaken_sentient_ai(background_tasks: BackgroundTasks):
    """
    Awaken the Sentient AI.
    
    This initializes the master AI that will run the entire platform
    autonomously.
    """
    sentient = get_sentient_orchestrator()
    result = await sentient.awaken()
    
    # Start autonomous loop in background
    background_tasks.add_task(sentient.autonomous_loop)
    
    return {
        "status": "awakened",
        "consciousness_level": sentient.consciousness_level,
        "message": "🧠 The Sentient AI is now running autonomously",
        **result
    }


@router.post("/sentient/command")
async def owner_command(request: OwnerCommandRequest):
    """
    Issue a command to the Sentient AI.
    
    Available commands:
    - pause: Pause autonomous operations
    - resume: Resume autonomous operations
    - report: Generate immediate report
    - evolve: Trigger self-evolution
    - add_employee: Add a new employee
    - gather_intelligence: Query AI sources
    - marketplace_scan: Scan marketplace listing
    """
    sentient = get_sentient_orchestrator()
    return await sentient.owner_command(request.command, request.params)


@router.get("/sentient/status")
async def get_sentient_status():
    """Get complete Sentient AI status."""
    sentient = get_sentient_orchestrator()
    return await sentient.get_status()


@router.get("/sentient/reports")
async def get_owner_reports(limit: int = 10):
    """Get recent reports generated for the owner."""
    sentient = get_sentient_orchestrator()
    reports = sentient.owner_reports[-limit:]
    
    return {
        "reports": [
            {
                "report_id": r.report_id,
                "timestamp": r.timestamp,
                "summary": r.summary,
                "key_metrics": r.key_metrics,
                "threats_detected": r.threats_detected,
                "threats_neutralized": r.threats_neutralized,
                "recommendations": r.recommendations,
                "confidence_score": r.confidence_score
            }
            for r in reversed(reports)
        ],
        "total": len(sentient.owner_reports)
    }


# =============================================================================
# AI Chat Assistant Endpoints
# =============================================================================

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Chat with the AI assistant.
    
    The assistant can:
    - Explain anomalies in natural language
    - Answer questions about the system
    - Provide threat briefings
    - Guide users through the platform
    """
    start_time = time.time()
    assistant = get_chat_assistant()
    
    # Start or continue conversation
    if request.conversation_id:
        response = await assistant.chat(
            request.conversation_id,
            request.message,
            request.context
        )
    else:
        conv = assistant.start_conversation(
            request.user_id,
            ConversationType.GENERAL_CHAT
        )
        response = await assistant.chat(
            conv.conversation_id,
            request.message,
            request.context
        )
        request.conversation_id = conv.conversation_id
    
    return ChatResponse(
        conversation_id=request.conversation_id or "new",
        response=response,
        processing_time_ms=(time.time() - start_time) * 1000
    )


@router.post("/chat/explain-anomaly")
async def explain_anomaly(request: ExplainAnomalyRequest):
    """
    Get a detailed explanation of an anomaly from the AI.
    """
    assistant = get_chat_assistant()
    explanation = await assistant.explain_anomaly(
        request.user_id,
        request.anomaly_data
    )
    
    return {
        "explanation": explanation,
        "anomaly_data": request.anomaly_data
    }


@router.post("/chat/threat-briefing")
async def threat_briefing(user_id: str, threat_data: Dict[str, Any]):
    """Get a security threat briefing from the AI."""
    assistant = get_chat_assistant()
    briefing = await assistant.threat_briefing(user_id, threat_data)
    
    return {
        "briefing": briefing,
        "threat_data": threat_data
    }


@router.get("/chat/conversations/{user_id}")
async def get_user_conversations(user_id: str):
    """Get all conversations for a user."""
    assistant = get_chat_assistant()
    convs = assistant.get_user_conversations(user_id)
    
    return {
        "conversations": [
            {
                "conversation_id": c.conversation_id,
                "type": c.conversation_type.value,
                "message_count": len(c.messages),
                "created_at": c.created_at,
                "last_activity": c.last_activity
            }
            for c in convs
        ]
    }


# =============================================================================
# Employee Management Endpoints
# =============================================================================

@router.post("/employees")
async def create_employee(request: EmployeeCreateRequest):
    """Create a new employee."""
    # Import here to avoid circular
    from services.employee_management import get_admin_hub, Role
    
    hub = get_admin_hub()
    
    try:
        employee = hub.create_employee(
            actor_id=hub.owner_id,
            email=request.email,
            name=request.name,
            role=Role(request.role),
            department_id=request.department_id,
            manager_id=request.manager_id
        )
        
        return {
            "status": "created",
            "employee": employee.to_dict()
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/employees")
async def list_employees(
    page: int = 1,
    page_size: int = 50,
    status: Optional[str] = None,
    role: Optional[str] = None,
    search: Optional[str] = None
):
    """List all employees with filtering."""
    from services.employee_management import get_admin_hub
    
    hub = get_admin_hub()
    
    filters = {}
    if status:
        filters["status"] = status
    if role:
        filters["role"] = role
    if search:
        filters["search"] = search
    
    return hub.list_employees(hub.owner_id, filters, page, page_size)


@router.get("/employees/{employee_id}")
async def get_employee(employee_id: str):
    """Get employee details."""
    from services.employee_management import get_admin_hub
    
    hub = get_admin_hub()
    employee = hub.get_employee(employee_id)
    
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    return employee.to_dict()


@router.put("/employees/{employee_id}")
async def update_employee(employee_id: str, updates: Dict[str, Any]):
    """Update an employee."""
    from services.employee_management import get_admin_hub
    
    hub = get_admin_hub()
    
    try:
        employee = hub.update_employee(hub.owner_id, employee_id, updates)
        return {"status": "updated", "employee": employee.to_dict()}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/employees/{employee_id}/permissions")
async def manage_permission(
    employee_id: str,
    permission: str,
    action: str
):
    """Grant or revoke a permission."""
    from services.employee_management import get_admin_hub, Permission
    
    hub = get_admin_hub()
    
    try:
        perm = Permission(permission)
        
        if action == "grant":
            result = hub.grant_permission(hub.owner_id, employee_id, perm)
        elif action == "revoke":
            result = hub.revoke_permission(hub.owner_id, employee_id, perm)
        else:
            raise HTTPException(status_code=400, detail="Action must be 'grant' or 'revoke'")
        
        return {"status": "success", "action": action, "permission": permission}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/employees/{employee_id}/performance-review")
async def get_performance_review(employee_id: str):
    """Get AI-generated performance review."""
    from services.employee_management import get_admin_hub
    
    hub = get_admin_hub()
    return hub.ai_performance_review(employee_id)


# =============================================================================
# Task Management Endpoints
# =============================================================================

@router.post("/tasks")
async def create_task(request: TaskCreateRequest):
    """Create a task (optionally AI-assigned)."""
    from services.employee_management import get_admin_hub
    
    hub = get_admin_hub()
    
    if request.ai_assign:
        task = hub.ai_assign_task(
            title=request.title,
            description=request.description,
            priority=request.priority
        )
    else:
        task = hub.create_task(
            actor_id=hub.owner_id,
            title=request.title,
            description=request.description,
            assignee_id=request.assignee_id,
            priority=request.priority
        )
    
    return {
        "status": "created",
        "task_id": task.task_id,
        "assignee_id": task.assignee_id,
        "ai_assigned": task.ai_assigned
    }


@router.post("/tasks/{task_id}/complete")
async def complete_task(task_id: str):
    """Mark a task as completed."""
    from services.employee_management import get_admin_hub
    
    hub = get_admin_hub()
    result = hub.complete_task(hub.owner_id, task_id)
    
    return {"status": "completed" if result else "not_found"}


# =============================================================================
# Marketplace Protection Endpoints
# =============================================================================

@router.post("/marketplace/listings")
async def submit_listing(request: ListingSubmitRequest):
    """Submit a listing for AI moderation."""
    protector = get_marketplace_protector()
    
    listing, result = protector.submit_listing(
        seller_id=request.seller_id,
        title=request.title,
        description=request.description,
        price=request.price,
        category=request.category,
        images=request.images
    )
    
    return {
        "listing_id": listing.listing_id,
        "status": listing.status.value,
        "moderation": {
            "risk_level": result.risk_level.value,
            "risk_score": result.risk_score,
            "threats": [t.value for t in result.threats_detected],
            "recommendation": result.recommendation,
            "auto_action_taken": result.auto_action_taken,
            "requires_human_review": result.requires_human_review
        }
    }


@router.get("/marketplace/pending-reviews")
async def get_pending_reviews():
    """Get listings pending human review."""
    protector = get_marketplace_protector()
    listings = protector.get_pending_reviews()
    
    return {
        "pending_count": len(listings),
        "listings": [
            {
                "listing_id": l.listing_id,
                "seller_id": l.seller_id,
                "title": l.title,
                "price": l.price,
                "risk_score": l.risk_score,
                "risk_factors": l.risk_factors,
                "created_at": l.created_at
            }
            for l in listings
        ]
    }


@router.post("/marketplace/listings/{listing_id}/review")
async def review_listing(
    listing_id: str,
    decision: str,
    reviewer_id: str,
    notes: str = ""
):
    """Submit human review decision for a listing."""
    protector = get_marketplace_protector()
    
    if decision not in ["approve", "reject", "flag"]:
        raise HTTPException(status_code=400, detail="Decision must be approve, reject, or flag")
    
    result = protector.human_review(listing_id, decision, reviewer_id, notes)
    
    if not result:
        raise HTTPException(status_code=404, detail="Listing not found")
    
    return {"status": decision, "listing_id": listing_id}


@router.get("/marketplace/statistics")
async def get_marketplace_stats():
    """Get marketplace protection statistics."""
    protector = get_marketplace_protector()
    return protector.get_statistics()


# =============================================================================
# Audit Trail Endpoints
# =============================================================================

@router.get("/audit-trail")
async def get_audit_trail(
    limit: int = 100,
    actor_id: Optional[str] = None,
    action: Optional[str] = None,
    resource_type: Optional[str] = None
):
    """Get audit trail entries."""
    from services.employee_management import get_admin_hub
    
    hub = get_admin_hub()
    
    filters = {}
    if actor_id:
        filters["actor_id"] = actor_id
    if action:
        filters["action"] = action
    if resource_type:
        filters["resource_type"] = resource_type
    
    return {
        "entries": hub.get_audit_trail(hub.owner_id, filters, limit)
    }


# =============================================================================
# Full Platform Analysis
# =============================================================================

@router.post("/analyze/full")
async def full_platform_analysis(request: FullAnalysisRequest):
    """
    Run full AI analysis using ALL engines:
    - Neural Swarm Intelligence
    - Temporal Precognition
    - Cognitive Reasoning
    - Adversarial Immune System
    
    This is the ultimate analysis endpoint.
    """
    import numpy as np
    
    start_time = time.time()
    data = np.array(request.data)
    results = {}
    
    # Swarm Detection
    if request.include_swarm:
        swarm = get_swarm_engine()
        swarm_result = swarm.detect(data, return_details=True)
        results["swarm"] = {
            "anomalies_detected": int(np.sum(swarm_result["is_anomaly"])),
            "avg_score": float(np.mean(swarm_result["anomaly_scores"])),
            "consensus": float(np.mean(swarm_result["consensus_levels"])),
            "statistics": swarm_result["swarm_statistics"]
        }
    
    # Predictions
    if request.include_prediction:
        precog = get_precognition_system()
        # Ingest data
        for point in data:
            precog.ingest_data({f"f{i}": float(v) for i, v in enumerate(point)})
        
        predictions = precog.predict()
        results["predictions"] = [
            {
                "horizon": p.horizon.value,
                "probability": p.probability,
                "severity": p.severity
            }
            for p in predictions
        ]
    
    # Reasoning
    if request.include_reasoning:
        reasoning = get_reasoning_engine()
        observation = {
            "data_points": len(data),
            "mean": float(np.mean(data)),
            "std": float(np.std(data)),
            "anomaly_count": results.get("swarm", {}).get("anomalies_detected", 0)
        }
        
        chain = reasoning.reason(observation)
        results["reasoning"] = {
            "conclusion": chain.conclusion,
            "confidence": chain.overall_confidence,
            "explanation": chain.natural_language
        }
    
    # Immune Check
    if request.include_immune_check:
        immune = get_immune_system()
        safe_count = 0
        threats = []
        
        for point in data:
            result = immune.process_input(np.array(point), validate_only=True)
            if result["is_safe"]:
                safe_count += 1
            else:
                threats.append(result["threat_level"])
        
        results["immune"] = {
            "safe_inputs": safe_count,
            "total_inputs": len(data),
            "safety_rate": safe_count / len(data),
            "threats_detected": len(threats)
        }
    
    return {
        "analysis": results,
        "processing_time_ms": (time.time() - start_time) * 1000,
        "engines_used": [k for k in results.keys()]
    }


# =============================================================================
# Platform Status Dashboard
# =============================================================================

@router.get("/status", response_model=PlatformStatusResponse)
async def get_platform_status():
    """
    Get complete platform status for the owner dashboard.
    
    This is the unified status endpoint that shows everything.
    """
    sentient = get_sentient_orchestrator()
    protector = get_marketplace_protector()
    assistant = get_chat_assistant()
    healing = get_self_healing_system()
    
    return PlatformStatusResponse(
        sentient_status=await sentient.get_status(),
        ai_engines_status={
            "swarm": get_swarm_engine().get_swarm_status(),
            "precognition": get_precognition_system().get_status(),
            "healing": healing.get_system_health(),
            "immune": get_immune_system().get_status(),
            "reasoning": get_reasoning_engine().get_status(),
            "chat_assistant": assistant.get_stats()
        },
        marketplace_status=protector.get_statistics(),
        system_health={
            "status": "healthy",
            "uptime": sentient.stats["uptime_seconds"],
            "autonomous_mode": sentient._running
        },
        timestamp=time.time()
    )


# =============================================================================
# WebSocket for Real-Time Updates
# =============================================================================

@router.websocket("/ws/updates")
async def websocket_updates(websocket: WebSocket):
    """
    WebSocket for real-time platform updates.
    
    Streams:
    - Sentient AI decisions and actions
    - Anomaly detections
    - Threat alerts
    - System status changes
    """
    await websocket.accept()
    
    sentient = get_sentient_orchestrator()
    
    try:
        while True:
            # Send periodic status updates
            status = await sentient.get_status()
            
            await websocket.send_json({
                "type": "status_update",
                "timestamp": time.time(),
                "data": {
                    "state": status["state"],
                    "consciousness": status["consciousness_level"],
                    "decisions_made": status["statistics"]["decisions_made"],
                    "actions_taken": status["statistics"]["actions_taken"]
                }
            })
            
            await asyncio.sleep(5)
            
    except Exception as e:
        await websocket.close()


# =============================================================================
# Export
# =============================================================================

def get_router():
    """Get the router for FastAPI app"""
    return router


__all__ = ["router", "get_router"]
