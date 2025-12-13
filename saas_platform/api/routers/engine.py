"""
SSB PRO API - Engine Router
Handles: start/stop live trading engine via Redis commands
"""
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional
import redis
import json

from api.services.jwt_service import verify_token
from api.database import get_db
from api.models.user import User
from sqlalchemy.orm import Session

router = APIRouter()
security = HTTPBearer()

# Redis connection for engine commands
try:
    redis_client = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)
except:
    redis_client = None


class EngineCommand(BaseModel):
    action: str
    user_id: Optional[str] = None
    settings: Optional[dict] = None


class EngineSettings(BaseModel):
    """Settings for starting the engine"""
    mode: Optional[str] = "DRY_RUN"  # "DRY_RUN" or "LIVE"
    private_key: Optional[str] = None  # Encrypted wallet key for LIVE mode
    rpc_url: Optional[str] = None  # Premium RPC endpoint
    position_size: Optional[float] = None
    take_profit: Optional[float] = None
    stop_loss: Optional[float] = None
    min_confidence: Optional[int] = None
    max_positions: Optional[int] = None


@router.post("/engine/start")
async def start_engine(
    settings: Optional[EngineSettings] = None,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Start the live trading engine for the authenticated user"""
    try:
        payload = verify_token(credentials.credentials)
        email = payload.get("email")
        
        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Check if user has a cloud plan
        cloud_plans = ['cloud_sniper', 'cloud_sniper_pro', 'cloud_sniper_elite', 'pro', 'elite', 'standard', 'admin', 'whale']
        if user.plan and user.plan.lower() not in [p.lower() for p in cloud_plans]:
            raise HTTPException(status_code=403, detail="Your plan does not support live trading")
        
        # Build config from settings
        config = {}
        mode = "DRY_RUN"  # Default safe mode
        
        if settings:
            mode = settings.mode or "DRY_RUN"
            
            # Apply user's tuning settings
            if settings.position_size:
                config["position_size"] = settings.position_size
            if settings.take_profit:
                config["take_profit"] = settings.take_profit
            if settings.stop_loss:
                config["stop_loss"] = settings.stop_loss
            if settings.min_confidence:
                config["min_confidence"] = settings.min_confidence
            if settings.max_positions:
                config["max_positions"] = settings.max_positions
        
        # For LIVE mode, fetch wallet from Redis (saved earlier via /wallet/config)
        if mode == "LIVE":
            wallet_data = redis_client.get(f"ssb:wallet:{user.id}") if redis_client else None
            if wallet_data:
                wallet_config = json.loads(wallet_data)
                config["encrypted_key"] = wallet_config.get("encrypted_key")
                config["rpc_url"] = wallet_config.get("rpc_url", "https://api.mainnet-beta.solana.com")
            else:
                raise HTTPException(status_code=400, detail="Wallet not configured. Please save your wallet first in Wallet & RPC section.")
        
        # Send start command to worker via Redis
        if redis_client:
            command = {
                "action": "start",
                "user_id": str(user.id),
                "email": user.email,
                "plan": user.plan,
                "mode": mode,
                "config": config
            }
            redis_client.publish("ssb:engine:commands", json.dumps(command))
            redis_client.set(f"ssb:engine:status:{user.id}", "running")
        
        return {
            "success": True,
            "message": f"Engine started in {mode} mode",
            "user_id": str(user.id),
            "plan": user.plan,
            "mode": mode
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/engine/stop")
async def stop_engine(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Stop the live trading engine for the authenticated user"""
    try:
        payload = verify_token(credentials.credentials)
        email = payload.get("email")
        
        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Send stop command to worker via Redis
        if redis_client:
            command = {
                "action": "stop",
                "user_id": str(user.id)
            }
            redis_client.publish("ssb:engine:commands", json.dumps(command))
            redis_client.set(f"ssb:engine:status:{user.id}", "stopped")
        
        return {
            "success": True,
            "message": "Live engine stopped"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class WalletConfigRequest(BaseModel):
    """Request body for wallet configuration"""
    private_key: str
    rpc_url: Optional[str] = None


@router.post("/wallet/config")
async def save_wallet_config(
    request: WalletConfigRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Save encrypted wallet configuration for live trading"""
    try:
        payload = verify_token(credentials.credentials)
        email = payload.get("email")
        
        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Encrypt the private key
        from cryptography.fernet import Fernet
        from api.config import settings
        
        try:
            # Use JWT_SECRET to derive encryption key
            import hashlib
            import base64
            key = base64.urlsafe_b64encode(hashlib.sha256(settings.JWT_SECRET.encode()).digest())
            fernet = Fernet(key)
            encrypted_key = fernet.encrypt(request.private_key.encode()).decode()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Encryption error: {str(e)}")
        
        # Store encrypted key in Redis
        if redis_client:
            wallet_config = {
                "encrypted_key": encrypted_key,
                "rpc_url": request.rpc_url or "https://api.mainnet-beta.solana.com"
            }
            redis_client.set(f"ssb:wallet:{user.id}", json.dumps(wallet_config))
        
        # Get wallet address from private key
        wallet_address = ""
        wallet_balance = "--"
        try:
            from solders.keypair import Keypair
            import base58
            import httpx
            
            # Decode the key
            key_bytes = base58.b58decode(request.private_key)
            keypair = Keypair.from_bytes(key_bytes)
            wallet_address = str(keypair.pubkey())
            
            # Fetch balance from RPC
            rpc_url = request.rpc_url or "https://api.mainnet-beta.solana.com"
            try:
                payload = {
                    "jsonrpc": "2.0",
                    "id": 1,
                    "method": "getBalance",
                    "params": [wallet_address]
                }
                response = httpx.post(rpc_url, json=payload, timeout=10)
                data = response.json()
                if "result" in data and "value" in data["result"]:
                    lamports = data["result"]["value"]
                    wallet_balance = f"{lamports / 1_000_000_000:.4f}"  # Convert lamports to SOL
            except Exception as rpc_error:
                wallet_balance = "--"  # RPC failed, show placeholder
        except:
            wallet_address = f"{request.private_key[:4]}...{request.private_key[-4:]}"
        
        return {
            "success": True,
            "message": "Wallet configured securely",
            "address": wallet_address,
            "balance": wallet_balance
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/wallet/status")
async def get_wallet_status(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Get the current wallet configuration status"""
    try:
        payload = verify_token(credentials.credentials)
        email = payload.get("email")
        
        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Check if wallet is configured in Redis
        if redis_client:
            wallet_data = redis_client.get(f"ssb:wallet:{user.id}")
            if wallet_data:
                config = json.loads(wallet_data)
                
                # Decrypt and get public address
                try:
                    from cryptography.fernet import Fernet
                    from api.config import settings
                    import hashlib
                    import base64
                    
                    key = base64.urlsafe_b64encode(hashlib.sha256(settings.JWT_SECRET.encode()).digest())
                    fernet = Fernet(key)
                    decrypted_key = fernet.decrypt(config["encrypted_key"].encode()).decode()
                    
                    # Get wallet address
                    from solders.keypair import Keypair
                    import base58 as b58
                    
                    key_bytes = b58.b58decode(decrypted_key)
                    keypair = Keypair.from_bytes(key_bytes)
                    wallet_address = str(keypair.pubkey())
                    
                    # Fetch balance
                    import httpx
                    rpc_url = config.get("rpc_url", "https://api.mainnet-beta.solana.com")
                    try:
                        payload = {
                            "jsonrpc": "2.0",
                            "id": 1,
                            "method": "getBalance",
                            "params": [wallet_address]
                        }
                        response = httpx.post(rpc_url, json=payload, timeout=10)
                        data = response.json()
                        if "result" in data and "value" in data["result"]:
                            lamports = data["result"]["value"]
                            balance = f"{lamports / 1_000_000_000:.4f}"
                        else:
                            balance = "--"
                    except:
                        balance = "--"
                    
                    return {
                        "configured": True,
                        "address": wallet_address,
                        "balance": balance,
                        "rpc_url": rpc_url
                    }
                except Exception as e:
                    return {
                        "configured": True,
                        "address": "Encrypted (error decoding)",
                        "balance": "--",
                        "error": str(e)
                    }
        
        return {
            "configured": False,
            "address": "Not Configured",
            "balance": "--"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/engine/status")
async def engine_status(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Get the current engine status for the authenticated user"""
    try:
        payload = verify_token(credentials.credentials)
        email = payload.get("email")
        
        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        status = "unknown"
        if redis_client:
            status = redis_client.get(f"ssb:engine:status:{user.id}") or "stopped"
        
        return {
            "success": True,
            "status": status,
            "plan": user.plan
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/engine/logs")
async def engine_logs(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Get recent engine logs for the authenticated user"""
    try:
        payload = verify_token(credentials.credentials)
        email = payload.get("email")
        
        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        logs = []
        if redis_client:
            # Get last 50 logs from Redis list
            log_key = f"ssb:engine:logs:{user.id}"
            raw_logs = redis_client.lrange(log_key, -50, -1)
            logs = [json.loads(log) if isinstance(log, str) else log for log in raw_logs]
        
        return {
            "success": True,
            "logs": logs
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/engine/state")
async def engine_state(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Get combined engine state: status, stats, and recent logs"""
    try:
        payload = verify_token(credentials.credentials)
        email = payload.get("email")
        
        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        status = "stopped"
        logs = []
        stats = {}
        
        if redis_client:
            # Get status
            status = redis_client.get(f"ssb:engine:status:{user.id}") or "stopped"
            
            # Get last 20 logs 
            log_key = f"ssb:engine:logs:{user.id}"
            raw_logs = redis_client.lrange(log_key, -20, -1)
            logs = []
            for log in raw_logs:
                try:
                    logs.append(json.loads(log) if isinstance(log, str) else log)
                except:
                    logs.append({"message": str(log), "level": "info"})
            
            # Get stats
            stats_key = f"ssb:engine:stats:{user.id}"
            raw_stats = redis_client.get(stats_key)
            if raw_stats:
                try:
                    stats = json.loads(raw_stats)
                except:
                    pass
        
        return {
            "success": True,
            "status": status,
            "is_running": status == "running",
            "logs": logs,
            "stats": stats,
            "tokens_scanned": stats.get("tokens_seen", 0),
            "total_pnl": stats.get("total_pnl", 0)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/leaderboard")
async def get_leaderboard():
    """Get the global trading leaderboard - top performers ranked by P&L"""
    try:
        if not redis_client:
            return {"success": False, "message": "Redis not available", "traders": []}
        
        # Get top 50 traders from sorted set (highest P&L first)
        leaderboard_key = "ssb:leaderboard"
        top_traders = redis_client.zrevrange(leaderboard_key, 0, 49, withscores=True)
        
        traders = []
        for rank, (user_id, pnl) in enumerate(top_traders, 1):
            # Get user's full stats
            stats_key = f"ssb:engine:stats:{user_id}"
            raw_stats = redis_client.get(stats_key)
            
            stats = {}
            if raw_stats:
                try:
                    stats = json.loads(raw_stats)
                except:
                    pass
            
            traders.append({
                "rank": rank,
                "user_id": user_id[:8] + "...",  # Anonymize
                "total_pnl": round(pnl, 4),
                "win_rate": stats.get("win_rate", 0),
                "win_count": stats.get("win_count", 0),
                "loss_count": stats.get("loss_count", 0),
                "plan": stats.get("plan", "Unknown"),
                "settings": stats.get("settings", {}),
                "copy_available": stats.get("settings") is not None
            })
        
        return {
            "success": True,
            "traders": traders,
            "total_traders": len(traders)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/copy-settings/{user_id}")
async def get_copy_settings(
    user_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Get a trader's settings to copy their strategy"""
    try:
        # Verify requesting user is authenticated
        payload = verify_token(credentials.credentials)
        
        if not redis_client:
            raise HTTPException(status_code=503, detail="Redis not available")
        
        # Get target user's stats (includes their settings)
        stats_key = f"ssb:engine:stats:{user_id}"
        raw_stats = redis_client.get(stats_key)
        
        if not raw_stats:
            raise HTTPException(status_code=404, detail="Trader not found or hasn't traded yet")
        
        try:
            stats = json.loads(raw_stats)
        except:
            raise HTTPException(status_code=500, detail="Invalid stats data")
        
        settings = stats.get("settings", {})
        
        if not settings:
            raise HTTPException(status_code=404, detail="No settings available for this trader")
        
        return {
            "success": True,
            "trader_pnl": stats.get("total_pnl", 0),
            "trader_win_rate": stats.get("win_rate", 0),
            "settings": settings,
            "message": "Apply these settings in 'Tune Your Bot' to copy this trader"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
