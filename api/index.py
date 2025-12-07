from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import datetime
import random
import os

app = FastAPI()

# --- LICENSE LOGIC EMBEDDED ---
def generate_key(plan):
    prefix_map = {
        "STANDARD": "SSB-STD",
        "PRO": "SSB-PRO",
        "ELITE": "SSB-ELITE"
    }
    prefix = prefix_map.get(plan, "SSB-STD")
    p1 = random.randint(1000, 9999)
    p2 = random.randint(1000, 9999)
    return f"{prefix}-{p1}-{p2}"

def create_license_data(plan, email, hwid="*", custom_key=None):
    plan = plan.upper()
    if plan not in ["STANDARD", "PRO", "ELITE"]:
        return None

    if custom_key:
        key = custom_key
    else:
        key = generate_key(plan)
    
    return {
        "key": key,
        "hwid": hwid, 
        "expires": "2099-12-31",
        "plan": plan,
        "email": email,
        "status": "active",
        "activated_at": datetime.datetime.utcnow().isoformat() + "Z"
    }
# ------------------------------

class LicenseRequest(BaseModel):
    plan: str
    email: str
    hwid: str = "*"
    custom_key: str | None = None
    password: str

ADMIN_PASS = "SSB2025" 

@app.post("/api/generate")
async def generate_endpoint(req: LicenseRequest):
    if req.password != ADMIN_PASS:
        raise HTTPException(status_code=401, detail="Unauthorized: Wrong password")

    try:
        data = create_license_data(req.plan, req.email, req.hwid, req.custom_key)
        if not data:
            raise HTTPException(status_code=400, detail="Invalid plan")
        
        return {
            "success": True,
            "data": data,
            "note": "Generated in-memory (Cloud Mode)."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 


