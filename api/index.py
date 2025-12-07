from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import license_logic
import os

app = FastAPI()

class LicenseRequest(BaseModel):
    plan: str
    email: str
    hwid: str = "*"
    custom_key: str | None = None
    password: str  # Security header

# Hardcoded admin password
ADMIN_PASS = "SSB2025" 

@app.post("/api/generate")
async def generate_endpoint(req: LicenseRequest):
    if req.password != ADMIN_PASS:
        raise HTTPException(status_code=401, detail="Unauthorized: Wrong password")

    try:
        # We don't save files on Vercel, we just get the data
        # create_license returns (data, filepath)
        # We only care about 'data', pass save_file=False
        data, _ = license_logic.create_license(
            req.plan, req.email, req.hwid, req.custom_key, save_file=False
        )
        if not data:
            raise HTTPException(status_code=400, detail="Invalid plan or generation failed")
        
        return {
            "success": True,
            "data": data,
            "note": "File generated in memory. Use browser to save."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
