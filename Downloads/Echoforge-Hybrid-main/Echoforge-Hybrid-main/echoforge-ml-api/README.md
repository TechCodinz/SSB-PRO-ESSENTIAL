# 🚀 EchoForge ML API

## This bridges Next.js with YOUR existing Python ML models!

### What it does:
- Exposes your complete_anomaly_detector.py as REST API
- Exposes your crypto analyzer
- Connects all your detectors (isolation_forest, lof, ocsvm, etc.)
- Makes them callable from Next.js

### Setup (2 minutes):

```bash
cd echoforge-ml-api

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the ML API
python main.py
```

Server runs on: http://localhost:8000

### Test it:

```bash
# Check health
curl http://localhost:8000/health

# List methods
curl http://localhost:8000/methods

# Test detection
curl -X POST http://localhost:8000/detect \
  -H "Content-Type: application/json" \
  -d '{
    "data": [[1,2],[3,4],[100,200],[5,6]],
    "method": "isolation_forest",
    "sensitivity": 0.1
  }'
```

### For Production:

Deploy to Render/Railway/Fly.io:

```bash
# Dockerfile already included
# Deploy and set ML_API_URL in Next.js to your API URL
```

### Available Endpoints:

- `GET /` - API info
- `GET /health` - Health check  
- `GET /methods` - List available detection methods
- `POST /detect` - Run anomaly detection
- `POST /detect/file` - Upload file and detect
- `POST /crypto/analyze` - Analyze crypto address

### Your ML Models Integrated:

✅ complete_anomaly_detector.py
✅ isolation_forest.py
✅ lof.py
✅ ocsvm.py
✅ z_score.py
✅ simple_crypto.py
✅ All your existing detectors!

**No ML work needed - just exposing what you already built!**
