"""
Simulation Router - Stub Version for VPS Deployment
Returns mock data until full app/services is deployed
"""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List

router = APIRouter(
    prefix="/simulation",
    tags=["simulation"]
)

class SimulationStateResponse(BaseModel):
    is_running: bool
    session_time: int
    total_pnl: float
    tokens_scanned: int
    active_trades: int
    recent_logs: List[str]

# Mock state for demo
_mock_state = {
    "is_running": False,
    "session_time": 0,
    "total_pnl": 0.0,
    "tokens_scanned": 0,
    "active_trades": 0,
    "recent_logs": ["Simulation engine ready (stub mode)"]
}

@router.post("/start")
async def start_simulation():
    """Start the synthetic simulation engine"""
    _mock_state["is_running"] = True
    return {"status": "started", "message": "Simulation engine initialized (stub)"}

@router.post("/stop")
async def stop_simulation():
    """Stop the simulation engine"""
    _mock_state["is_running"] = False
    return {"status": "stopped", "message": "Simulation engine halted (stub)"}

@router.get("/state", response_model=SimulationStateResponse)
async def get_simulation_state():
    """Get real-time state of the simulation (polled by frontend)"""
    return _mock_state
