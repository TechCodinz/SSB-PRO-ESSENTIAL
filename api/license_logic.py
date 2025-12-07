import json
import datetime
import random
import os

# Configuration
LICENSES_DIR = "generated_licenses"

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

def create_license(plan, email, hwid="*", custom_key=None, save_file=True):
    plan = plan.upper()
    if plan not in ["STANDARD", "PRO", "ELITE"]:
        return None, None

    if custom_key:
        key = custom_key
    else:
        key = generate_key(plan)
    
    # Create the license data structure expected by gui_main.py
    license_data = {
        "key": key,
        "hwid": hwid, 
        "expires": "2099-12-31", # Lifetime
        "plan": plan,
        "email": email,
        "status": "active",
        "activated_at": datetime.datetime.utcnow().isoformat() + "Z"
    }

    filename = None
    if save_file:
        # Ensure output directory exists
        if not os.path.exists(LICENSES_DIR):
            os.makedirs(LICENSES_DIR)

        filename = f"{LICENSES_DIR}/license_{plan}_{key}.json"
        
        with open(filename, "w", encoding="utf-8") as f:
            json.dump(license_data, f, indent=2)

    return license_data, filename
