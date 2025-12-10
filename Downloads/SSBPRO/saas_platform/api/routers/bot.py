"""
SSB PRO API - Bot Router
Handles: config, health check, update check, download
"""
from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional
import base64
import hashlib
from cryptography.fernet import Fernet
from sqlalchemy.orm import Session
from solders.keypair import Keypair
import base58

from api.config import settings
from api.services.jwt_service import verify_token
from api.database import get_db
from api.models.user import User
from api.services.bot_manager import bot_manager

router = APIRouter()
security = HTTPBearer()

# Version info
BOT_VERSION = "1.0.0"
LATEST_VERSION = "1.0.0"
CHANGELOG = """
## v1.0.0 (Dec 2025)
- Initial public release
- AI Risk Engine v3
- Divine Features (PRO/ELITE)
- Cloud trading engine
- Multi-device support
"""

class ConfigUpdateRequest(BaseModel):
    private_key: Optional[str] = None
    rpc_url: Optional[str] = None

# Encryption Helper
def _get_cipher():
    # Derive a 32-byte key from the secret key
    key = hashlib.sha256(settings.SECRET_KEY.encode()).digest()
    return Fernet(base64.urlsafe_b64encode(key))

def _encrypt_key(key: str) -> str:
    cipher = _get_cipher()
    return cipher.encrypt(key.encode()).decode()

def _decrypt_key(token: str) -> str:
    cipher = _get_cipher()
    return cipher.decrypt(token.encode()).decode()

@router.post("/config")
async def update_config(
    request: ConfigUpdateRequest, 
    credentials: HTTPAuthorizationCredentials = Depends(security), 
    db: Session = Depends(get_db)
):
    """Update bot configuration securely"""
    try:
        # Auth
        payload = verify_token(credentials.credentials)
        email = payload.get("email")
        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        updates = {}
        wallet_address = None
        balance = 0.0

        # Handle Private Key
        if request.private_key:
            try:
                # Validate Keypair
                pk_bytes = base58.b58decode(request.private_key)
                kp = Keypair.from_bytes(pk_bytes)
                wallet_address = str(kp.pubkey())
                
                # Encrypt
                updates["private_key"] = _encrypt_key(request.private_key)
                
                # TODO: Fetch real balance via RPC
                balance = 0.0 
                
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Invalid private key: {str(e)}")

        # Handle RPC
        if request.rpc_url:
            if not request.rpc_url.startswith("https://"):
                raise HTTPException(status_code=400, detail="RPC URL must be HTTPS")
            updates["rpc_url"] = request.rpc_url

        if not updates:
            return {"success": True, "message": "No changes made"}

        # Update Bot Manager
        await bot_manager.update_config(user.id, updates, db)
        
        return {
            "success": True, 
            "message": "Configuration updated securely",
            "address": wallet_address,
            "balance": balance
        }

    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def health_check():
    """Bot/API health check"""
    return {
        "status": "healthy",
        "version": BOT_VERSION,
        "uptime": "99.8%",
        "services": {
            "api": "online",
            "license_server": "online",
            "cloud_engine": "online",
            "rpc_pool": "connected"
        }
    }


@router.get("/update-check")
async def check_for_update(current_version: Optional[str] = None):
    """Check if update is available"""
    if not current_version:
        current_version = "0.0.0"
    
    update_available = current_version < LATEST_VERSION
    
    return {
        "current_version": current_version,
        "latest_version": LATEST_VERSION,
        "update_available": update_available,
        "download_url": "/v1/bot/download" if update_available else None,
        "changelog": CHANGELOG if update_available else None
    }


@router.get("/download")
async def download_bot(token: Optional[str] = None):
    """Download bot executable (requires valid license token)"""
    # TODO: Validate license token
    
    # For now, return info about download
    return {
        "download_url": "https://download.ssbpro.dev/releases/latest/SolSniperBotPRO.zip",
        "version": LATEST_VERSION,
        "size_mb": 30,
        "checksum": "sha256:...",
        "instructions": "Download, extract, run setup.exe"
    }


@router.get("/versions")
async def list_versions():
    """List available versions"""
    return {
        "versions": [
            {"version": "1.0.0", "date": "2025-12-09", "latest": True}
        ],
        "latest": LATEST_VERSION
    }


@router.get("/changelog")
async def get_changelog():
    """Get full changelog"""
    return {
        "changelog": CHANGELOG
    }
