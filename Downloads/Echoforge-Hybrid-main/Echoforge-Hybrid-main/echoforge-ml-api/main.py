"""
EchoForge ML API - Enterprise-Grade Anomaly Detection Platform
FastAPI server with 20+ detection methods, ensemble capabilities, and real-time streaming
"""

import sys
import os

# Prefer local vendorized modules first; fallback to sibling repos during dev
vendor_core = os.path.join(os.path.dirname(__file__), 'core')
if os.path.isdir(vendor_core):
    sys.path.insert(0, os.path.dirname(__file__))
else:
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'echoforge-app-hybrid'))
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'echoforge-api-hybrid'))

from fastapi import FastAPI, File, UploadFile, HTTPException, Request, Header, Query, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any, Union
import pandas as pd
import numpy as np
import io
import json
import time
import uuid
import threading
import queue
import asyncio
from datetime import datetime
import hashlib

# Import detectors
from core.complete_anomaly_detector import CompleteAnomalyDetector
from core.simple_crypto import SimpleCryptoAnalyzer
from core.real_crypto_engine import RealCryptoAnalyzer
from detectors import run_detector, run_ensemble_detector, get_available_methods

# ============================================================================
# APP INITIALIZATION
# ============================================================================

app = FastAPI(
    title="EchoForge ML API",
    version="2.0.0",
    description="Enterprise-grade anomaly detection with 20+ methods, ensemble capabilities, and real-time streaming"
)
app.add_middleware(GZipMiddleware, minimum_size=1024)

# CORS configuration
allowed_origins = os.getenv("ALLOWED_ORIGINS", "*")
origins = [o.strip() for o in allowed_origins.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# Initialize detectors
anomaly_detector = CompleteAnomalyDetector()
crypto_analyzer = SimpleCryptoAnalyzer()
real_crypto_analyzer = RealCryptoAnalyzer()

# ============================================================================
# REQUEST MODELS
# ============================================================================

class DetectRequest(BaseModel):
    data: List[List[float]]
    method: str = "isolation_forest"
    sensitivity: float = Field(default=1.0, ge=0.1, le=10.0)
    expected_rate: float = Field(default=0.1, ge=0.01, le=0.5)
    columns: Optional[List[str]] = None

class EnsembleDetectRequest(BaseModel):
    data: List[List[float]]
    methods: List[str] = Field(default=["isolation_forest", "lof", "hbos", "copod"])
    sensitivity: float = Field(default=1.0, ge=0.1, le=10.0)
    expected_rate: float = Field(default=0.1, ge=0.01, le=0.5)
    voting: str = Field(default="soft", pattern="^(soft|hard)$")
    weights: Optional[List[float]] = None

class StreamingDetectRequest(BaseModel):
    window_size: int = Field(default=100, ge=10, le=10000)
    method: str = "isolation_forest"
    sensitivity: float = Field(default=1.0, ge=0.1, le=10.0)
    expected_rate: float = Field(default=0.1, ge=0.01, le=0.5)

class ExplainRequest(BaseModel):
    data: List[List[float]]
    method: str = "isolation_forest"
    top_k: int = Field(default=5, ge=1, le=20)

class CryptoAnalysisRequest(BaseModel):
    address: str
    currency: str = "BTC"
    deep_analysis: bool = False

class BatchDetectRequest(BaseModel):
    items: List[DetectRequest]

class BaselineSetRequest(BaseModel):
    name: str
    data: List[List[float]]

class DriftCheckRequest(BaseModel):
    name: str
    data: List[List[float]]

# ============================================================================
# SECURITY & RATE LIMITING
# ============================================================================

_rate_buckets: Dict[str, List[float]] = {}
_rate_limit_per_min = int(os.getenv("RATE_LIMIT_PER_MIN", "120"))
_idem_cache: Dict[str, Any] = {}
_cache_ttl = 300  # 5 minutes

def _require_api_key_from_request(request: Request):
    expected = os.getenv("ECHOFORGE_API_KEY")
    actual = request.headers.get("x-echo-key") or request.query_params.get("x_echo_key")
    if expected and actual != expected:
        raise HTTPException(status_code=401, detail="Unauthorized")

def _rate_limit_check(key: str):
    now = time.time()
    bucket = _rate_buckets.setdefault(key, [])
    cutoff = now - 60
    # Prune old entries
    _rate_buckets[key] = [ts for ts in bucket if ts >= cutoff]
    bucket = _rate_buckets[key]
    if len(bucket) >= _rate_limit_per_min:
        raise HTTPException(status_code=429, detail="Rate limit exceeded")
    bucket.append(now)

def _get_cache_key(data: Any, method: str, params: Dict) -> str:
    """Generate cache key for idempotency."""
    data_str = json.dumps(data, sort_keys=True) if isinstance(data, (list, dict)) else str(data)
    params_str = json.dumps(params, sort_keys=True)
    combined = f"{data_str}:{method}:{params_str}"
    return hashlib.md5(combined.encode()).hexdigest()

# ============================================================================
# CORE ENDPOINTS
# ============================================================================

@app.get("/")
def read_root():
    """API root with capabilities overview."""
    methods = get_available_methods()
    total_methods = sum(len(v) for v in methods.values())
    return {
        "service": "EchoForge ML API",
        "status": "operational",
        "version": "2.0.0",
        "capabilities": {
            "total_detection_methods": total_methods,
            "categories": list(methods.keys()),
            "ensemble_support": True,
            "streaming_support": True,
            "explainability": True,
        },
        "endpoints": {
            "detect": "/detect",
            "ensemble": "/detect/ensemble",
            "streaming": "/detect/stream",
            "explain": "/explain",
            "batch": "/detect/batch",
            "async": "/detect/async",
            "crypto": "/crypto/analyze",
            "drift": "/model/drift/check",
        }
    }

@app.get("/health")
def health_check():
    """Health check with library status."""
    from detectors import PYOD_AVAILABLE, ENSEMBLE_AVAILABLE, DEEP_AVAILABLE
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "ml_libraries": {
            "sklearn": True,
            "numpy": True,
            "pandas": True,
            "pyod": PYOD_AVAILABLE,
            "ensemble": ENSEMBLE_AVAILABLE,
            "deep_learning": DEEP_AVAILABLE,
        }
    }

@app.get("/methods")
def list_methods():
    """Get all available detection methods grouped by category."""
    methods = get_available_methods()
    total = sum(len(v) for v in methods.values())
    return {
        "total_methods": total,
        "categories": methods,
        "recommended": {
            "general": "isolation_forest",
            "high_dimensional": "hbos",
            "multivariate": "mahalanobis",
            "ensemble": "suod",
            "deep_learning": "autoencoder"
        },
        "descriptions": {
            "isolation_forest": "Tree-based anomaly detection, excellent for mixed data types",
            "lof": "Local Outlier Factor - density-based, good for clustered data",
            "ocsvm": "One-Class SVM - boundary-based, robust to outliers",
            "hbos": "Histogram-Based - fast, scalable, good for high-dimensional data",
            "knn": "K-Nearest Neighbors - distance-based, intuitive interpretation",
            "copod": "Copula-Based - fast, no hyperparameters, handles multivariate",
            "ecod": "Empirical Cumulative Distribution - interpretable, parameter-free",
            "suod": "Ensemble of multiple detectors with weighted voting",
            "autoencoder": "Deep learning reconstruction-based detection",
            "vae": "Variational Autoencoder for complex pattern detection",
            "mahalanobis": "Statistical multivariate outlier detection",
        }
    }

# ============================================================================
# ANOMALY DETECTION ENDPOINTS
# ============================================================================

@app.post("/detect")
async def detect_anomalies(
    request: DetectRequest,
    http_request: Request,
    idempotency_key: Optional[str] = Header(default=None, alias="x-idempotency-key")
):
    """
    Detect anomalies using a single method.
    
    Supports 20+ methods: z_score, modified_zscore, iqr, grubbs, mahalanobis,
    isolation_forest, lof, ocsvm, hbos, knn, copod, ecod, abod, cblof,
    feature_bagging, suod, lscp, autoencoder, vae
    """
    _require_api_key_from_request(http_request)
    client_key = http_request.headers.get("x-echo-key", "public")
    _rate_limit_check(client_key)
    
    # Check idempotency cache
    if idempotency_key and idempotency_key in _idem_cache:
        return _idem_cache[idempotency_key]
    
    try:
        start_time = time.time()
        df = pd.DataFrame(request.data)
        
        result = run_detector(
            df=df,
            method=request.method,
            sensitivity=request.sensitivity,
            expected_rate=request.expected_rate
        )
        
        anomaly_df = result['anomaly_df']
        anomalies = anomaly_df[anomaly_df['is_anomaly'] == True]
        
        processing_time = time.time() - start_time
        
        resp = {
            "success": True,
            "method": request.method,
            "total_points": len(df),
            "anomalies_found": len(anomalies),
            "anomaly_rate": float(len(anomalies) / len(df)) if len(df) > 0 else 0,
            "processing_time_ms": round(processing_time * 1000, 2),
            "anomalies": anomalies.head(100).to_dict('records') if len(anomalies) > 0 else [],
            "all_scores": anomaly_df['anomaly_score'].tolist(),
            "confidence": anomaly_df.get('confidence', pd.Series()).tolist(),
            "metadata": result['model_meta'],
            "statistics": result.get('statistics', {}),
            "feature_importance": result.get('feature_importance', {}),
        }
        
        if idempotency_key:
            _idem_cache[idempotency_key] = resp
        
        return resp
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/detect/ensemble")
async def detect_ensemble(
    request: EnsembleDetectRequest,
    http_request: Request,
):
    """
    Ensemble detection using multiple methods with voting.
    
    Combines results from multiple detectors using soft (score averaging) 
    or hard (majority voting) ensemble strategies.
    """
    _require_api_key_from_request(http_request)
    client_key = http_request.headers.get("x-echo-key", "public")
    _rate_limit_check(client_key)
    
    try:
        start_time = time.time()
        df = pd.DataFrame(request.data)
        
        result = run_ensemble_detector(
            df=df,
            methods=request.methods,
            sensitivity=request.sensitivity,
            expected_rate=request.expected_rate,
            voting=request.voting,
            weights=request.weights
        )
        
        anomaly_df = result['anomaly_df']
        anomalies = anomaly_df[anomaly_df['is_anomaly'] == True]
        
        processing_time = time.time() - start_time
        
        return {
            "success": True,
            "ensemble_type": request.voting,
            "methods_used": request.methods,
            "total_points": len(df),
            "anomalies_found": len(anomalies),
            "anomaly_rate": float(len(anomalies) / len(df)) if len(df) > 0 else 0,
            "processing_time_ms": round(processing_time * 1000, 2),
            "anomalies": anomalies.head(100).to_dict('records'),
            "all_scores": anomaly_df['anomaly_score'].tolist(),
            "vote_agreement": anomaly_df.get('vote_agreement', pd.Series()).tolist(),
            "method_results": result.get('method_results', {}),
            "statistics": result.get('statistics', {}),
            "metadata": result['model_meta'],
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/explain")
async def explain_anomalies(
    request: ExplainRequest,
    http_request: Request,
):
    """
    Explain why specific points are flagged as anomalies.
    
    Returns feature contributions and interpretable explanations.
    """
    _require_api_key_from_request(http_request)
    
    try:
        df = pd.DataFrame(request.data)
        
        result = run_detector(
            df=df,
            method=request.method,
            sensitivity=1.0,
            expected_rate=0.1,
            return_confidence=True
        )
        
        anomaly_df = result['anomaly_df']
        feature_importance = result.get('feature_importance', {})
        
        # Get top anomalies for explanation
        top_anomalies = anomaly_df.nlargest(request.top_k, 'anomaly_score')
        
        explanations = []
        for idx, row in top_anomalies.iterrows():
            # Calculate feature-level contributions for this point
            point_data = df.iloc[idx].to_dict() if idx < len(df) else {}
            
            # Identify which features contributed most to anomaly score
            contributing_features = []
            for feat, importance in sorted(feature_importance.items(), key=lambda x: -x[1])[:5]:
                col_idx = int(feat.split('_')[1]) if '_' in feat else 0
                if col_idx < len(df.columns):
                    col_name = df.columns[col_idx]
                    contributing_features.append({
                        "feature": col_name,
                        "importance": round(importance, 4),
                        "value": float(point_data.get(col_name, 0))
                    })
            
            explanations.append({
                "index": int(idx),
                "anomaly_score": float(row['anomaly_score']),
                "confidence": float(row.get('confidence', 0)),
                "contributing_features": contributing_features,
                "interpretation": _generate_interpretation(row['anomaly_score'], contributing_features)
            })
        
        return {
            "success": True,
            "method": request.method,
            "explanations": explanations,
            "global_feature_importance": feature_importance,
            "interpretation_guide": {
                "high_score": "Higher scores indicate more anomalous behavior",
                "confidence": "Confidence ranges from 0 (uncertain) to 1 (highly confident)",
                "feature_importance": "Shows which features contributed most to the anomaly"
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def _generate_interpretation(score: float, features: List[Dict]) -> str:
    """Generate human-readable interpretation."""
    if score > 0.9:
        severity = "critical"
    elif score > 0.7:
        severity = "high"
    elif score > 0.5:
        severity = "moderate"
    else:
        severity = "low"
    
    if features:
        top_feature = features[0]['feature']
        return f"{severity.capitalize()} anomaly primarily driven by unusual {top_feature} values"
    return f"{severity.capitalize()} anomaly detected"


# ============================================================================
# STREAMING & REAL-TIME ENDPOINTS
# ============================================================================

class StreamingBuffer:
    """Buffer for streaming anomaly detection."""
    def __init__(self, window_size: int = 100):
        self.window_size = window_size
        self.buffer: List[List[float]] = []
        self.results: List[Dict] = []
    
    def add_point(self, point: List[float]) -> Optional[Dict]:
        self.buffer.append(point)
        if len(self.buffer) > self.window_size:
            self.buffer.pop(0)
        return None
    
    def get_buffer(self) -> List[List[float]]:
        return self.buffer.copy()

_streaming_buffers: Dict[str, StreamingBuffer] = {}

@app.websocket("/ws/stream")
async def websocket_stream(websocket: WebSocket):
    """
    WebSocket endpoint for real-time streaming anomaly detection.
    
    Send data points as JSON: {"point": [1.0, 2.0, 3.0]}
    Receive anomaly results in real-time.
    """
    await websocket.accept()
    
    session_id = str(uuid.uuid4())
    buffer = StreamingBuffer(window_size=100)
    _streaming_buffers[session_id] = buffer
    
    try:
        # Send session info
        await websocket.send_json({
            "type": "session_started",
            "session_id": session_id,
            "window_size": buffer.window_size
        })
        
        while True:
            data = await websocket.receive_json()
            
            if data.get("type") == "config":
                buffer.window_size = data.get("window_size", 100)
                await websocket.send_json({"type": "config_updated", "window_size": buffer.window_size})
                continue
            
            point = data.get("point", [])
            if not point:
                continue
            
            buffer.add_point(point)
            
            # Run detection when buffer has enough points
            if len(buffer.buffer) >= 10:
                df = pd.DataFrame(buffer.buffer)
                result = run_detector(
                    df=df,
                    method=data.get("method", "isolation_forest"),
                    sensitivity=data.get("sensitivity", 1.0),
                    expected_rate=data.get("expected_rate", 0.1)
                )
                
                # Get score for latest point
                latest_score = result['anomaly_df']['anomaly_score'].iloc[-1]
                is_anomaly = result['anomaly_df']['is_anomaly'].iloc[-1]
                
                await websocket.send_json({
                    "type": "detection_result",
                    "point_index": len(buffer.buffer) - 1,
                    "score": float(latest_score),
                    "is_anomaly": bool(is_anomaly),
                    "buffer_size": len(buffer.buffer),
                    "timestamp": datetime.utcnow().isoformat()
                })
                
    except WebSocketDisconnect:
        del _streaming_buffers[session_id]


@app.post("/detect/stream/start")
async def start_stream_session(
    request: StreamingDetectRequest,
    http_request: Request,
):
    """Start a streaming detection session."""
    _require_api_key_from_request(http_request)
    
    session_id = str(uuid.uuid4())
    buffer = StreamingBuffer(window_size=request.window_size)
    _streaming_buffers[session_id] = buffer
    
    return {
        "success": True,
        "session_id": session_id,
        "config": {
            "window_size": request.window_size,
            "method": request.method,
            "sensitivity": request.sensitivity,
            "expected_rate": request.expected_rate
        }
    }


@app.post("/detect/stream/{session_id}/point")
async def add_stream_point(
    session_id: str,
    point: List[float],
    http_request: Request,
):
    """Add a point to a streaming session and get detection result."""
    _require_api_key_from_request(http_request)
    
    if session_id not in _streaming_buffers:
        raise HTTPException(status_code=404, detail="Session not found")
    
    buffer = _streaming_buffers[session_id]
    buffer.add_point(point)
    
    if len(buffer.buffer) < 10:
        return {
            "success": True,
            "buffering": True,
            "buffer_size": len(buffer.buffer),
            "min_required": 10
        }
    
    df = pd.DataFrame(buffer.buffer)
    result = run_detector(df=df, method="isolation_forest", sensitivity=1.0, expected_rate=0.1)
    
    latest_score = result['anomaly_df']['anomaly_score'].iloc[-1]
    is_anomaly = result['anomaly_df']['is_anomaly'].iloc[-1]
    
    return {
        "success": True,
        "buffering": False,
        "score": float(latest_score),
        "is_anomaly": bool(is_anomaly),
        "buffer_size": len(buffer.buffer)
    }


# ============================================================================
# CRYPTO ANALYSIS ENDPOINTS
# ============================================================================

@app.post("/crypto/analyze")
async def analyze_crypto(request: CryptoAnalysisRequest, http_request: Request):
    """
    Analyze cryptocurrency address for fraud indicators.
    Uses real blockchain APIs when available.
    """
    _require_api_key_from_request(http_request)
    
    try:
        # Validate address
        validation = crypto_analyzer.validate_address(request.address, request.currency)
        
        if not validation.get('valid', False):
            return {
                "success": False,
                "error": validation.get('error', 'Invalid address')
            }
        
        # Try real blockchain analysis first
        try:
            analysis = real_crypto_analyzer.analyze_crypto_fraud_real(
                request.address, 
                request.currency
            )
            analysis['data_source'] = 'blockchain_api'
        except Exception:
            # Fall back to deterministic analyzer
            analysis = crypto_analyzer.analyze_crypto_fraud(
                address=request.address, 
                currency=request.currency
            )
            analysis['data_source'] = 'heuristic'
        
        return {
            "success": True,
            **analysis
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# BATCH & ASYNC ENDPOINTS
# ============================================================================

@app.post("/detect/batch")
async def detect_batch(body: BatchDetectRequest, http_request: Request):
    """Process multiple detection requests in batch."""
    _require_api_key_from_request(http_request)
    client_key = http_request.headers.get("x-echo-key", "public")
    _rate_limit_check(client_key)
    
    results: List[Dict[str, Any]] = []
    total_start = time.time()
    
    for item in body.items:
        try:
            df = pd.DataFrame(item.data)
            result = run_detector(
                df=df, 
                method=item.method, 
                sensitivity=item.sensitivity, 
                expected_rate=item.expected_rate
            )
            anomaly_df = result['anomaly_df']
            anomalies = anomaly_df[anomaly_df['is_anomaly'] == True]
            
            results.append({
                "success": True,
                "method": item.method,
                "total_points": len(df),
                "anomalies_found": len(anomalies),
                "anomaly_rate": float(len(anomalies) / len(df)) if len(df) > 0 else 0,
                "all_scores": anomaly_df['anomaly_score'].tolist(),
                "metadata": result['model_meta']
            })
        except Exception as e:
            results.append({
                "success": False,
                "error": str(e)
            })
    
    total_time = time.time() - total_start
    
    return {
        "success": True,
        "total_requests": len(body.items),
        "successful": sum(1 for r in results if r.get('success')),
        "processing_time_ms": round(total_time * 1000, 2),
        "results": results
    }


# Async job queue
_job_queue: "queue.Queue[tuple[str, DetectRequest]]" = queue.Queue()
_job_results: Dict[str, Any] = {}
_worker_started = False

def _worker_loop():
    while True:
        job_id, req = _job_queue.get()
        try:
            df = pd.DataFrame(req.data)
            result = run_detector(
                df=df, 
                method=req.method, 
                sensitivity=req.sensitivity, 
                expected_rate=req.expected_rate
            )
            anomaly_df = result['anomaly_df']
            anomalies = anomaly_df[anomaly_df['is_anomaly'] == True]
            _job_results[job_id] = {
                "success": True,
                "status": "completed",
                "method": req.method,
                "total_points": len(df),
                "anomalies_found": len(anomalies),
                "all_scores": anomaly_df['anomaly_score'].tolist(),
                "metadata": result['model_meta']
            }
        except Exception as e:
            _job_results[job_id] = {"success": False, "status": "failed", "error": str(e)}
        finally:
            _job_queue.task_done()

def _ensure_worker():
    global _worker_started
    if not _worker_started:
        t = threading.Thread(target=_worker_loop, daemon=True)
        t.start()
        _worker_started = True

@app.post("/detect/async")
async def detect_async(body: DetectRequest, http_request: Request):
    """Submit async detection job and get job ID."""
    _require_api_key_from_request(http_request)
    client_key = http_request.headers.get("x-echo-key", "public")
    _rate_limit_check(client_key)
    _ensure_worker()
    
    job_id = str(uuid.uuid4())
    _job_results[job_id] = {"success": False, "status": "pending"}
    _job_queue.put((job_id, body))
    
    return {"job_id": job_id, "status": "pending"}

@app.get("/detect/result")
def detect_result(job_id: str = Query(...)):
    """Get result of async detection job."""
    if job_id not in _job_results:
        return {"status": "not_found"}
    res = _job_results[job_id]
    return {"status": res.get("status", "unknown"), "result": res}


# ============================================================================
# DRIFT DETECTION & MODEL MANAGEMENT
# ============================================================================

_baseline_dir = os.path.join(os.path.dirname(__file__), "models", "baselines")
os.makedirs(_baseline_dir, exist_ok=True)

def _save_baseline(name: str, data: List[List[float]]):
    path = os.path.join(_baseline_dir, f"{name}.json")
    with open(path, "w") as f:
        json.dump({"data": data, "created_at": datetime.utcnow().isoformat()}, f)

def _load_baseline(name: str) -> Optional[Dict]:
    path = os.path.join(_baseline_dir, f"{name}.json")
    if not os.path.exists(path):
        return None
    with open(path, "r") as f:
        return json.load(f)

def _psi(expected: np.ndarray, actual: np.ndarray, bins: int = 10) -> float:
    """Population Stability Index for drift detection."""
    eps = 1e-8
    e_hist, bin_edges = np.histogram(expected, bins=bins)
    a_hist, _ = np.histogram(actual, bins=bin_edges)
    e_perc = e_hist / (e_hist.sum() + eps)
    a_perc = a_hist / (a_hist.sum() + eps)
    psi = np.sum((a_perc - e_perc) * np.log((a_perc + eps) / (e_perc + eps)))
    return float(psi)

def _ks_test(expected: np.ndarray, actual: np.ndarray) -> Dict:
    """Kolmogorov-Smirnov test for distribution comparison."""
    from scipy import stats
    statistic, p_value = stats.ks_2samp(expected, actual)
    return {"statistic": float(statistic), "p_value": float(p_value)}

@app.post("/model/baseline/set")
def set_baseline(body: BaselineSetRequest, http_request: Request):
    """Save baseline data for drift detection."""
    _require_api_key_from_request(http_request)
    _save_baseline(body.name, body.data)
    return {"success": True, "name": body.name}

@app.get("/model/baseline/get")
def get_baseline(name: str):
    """Retrieve saved baseline."""
    data = _load_baseline(name)
    if data is None:
        return {"found": False}
    return {"found": True, **data}

@app.post("/model/drift/check")
def drift_check(body: DriftCheckRequest, http_request: Request):
    """
    Check for data drift using PSI and KS tests.
    
    PSI interpretation:
    - < 0.1: No significant drift
    - 0.1 - 0.2: Moderate drift
    - > 0.2: Significant drift
    """
    _require_api_key_from_request(http_request)
    
    baseline = _load_baseline(body.name)
    if baseline is None:
        raise HTTPException(status_code=404, detail="Baseline not found")
    
    base_arr = pd.DataFrame(baseline["data"]).select_dtypes(include=[np.number]).to_numpy()
    cur_arr = pd.DataFrame(body.data).select_dtypes(include=[np.number]).to_numpy()
    
    # Compute PSI and KS per column
    cols = min(base_arr.shape[1], cur_arr.shape[1]) if len(base_arr.shape) > 1 else 1
    
    psi_scores = []
    ks_results = []
    
    if cols == 1:
        psi_scores.append(_psi(base_arr.reshape(-1), cur_arr.reshape(-1)))
        ks_results.append(_ks_test(base_arr.reshape(-1), cur_arr.reshape(-1)))
    else:
        for i in range(cols):
            psi_scores.append(_psi(base_arr[:, i], cur_arr[:, i]))
            ks_results.append(_ks_test(base_arr[:, i], cur_arr[:, i]))
    
    overall_psi = float(np.mean(psi_scores))
    
    # Determine drift severity
    if overall_psi < 0.1:
        drift_status = "no_drift"
    elif overall_psi < 0.2:
        drift_status = "moderate_drift"
    else:
        drift_status = "significant_drift"
    
    return {
        "success": True,
        "baseline_name": body.name,
        "drift_status": drift_status,
        "psi_overall": overall_psi,
        "psi_per_feature": psi_scores,
        "ks_results": ks_results,
        "recommendation": "Retrain model" if drift_status == "significant_drift" else "Monitor" if drift_status == "moderate_drift" else "No action needed"
    }


# ============================================================================
# FILE UPLOAD ENDPOINTS
# ============================================================================

@app.post("/detect/file")
async def detect_from_file(
    file: UploadFile = File(...),
    method: str = "isolation_forest",
    sensitivity: float = 0.1,
    expected_rate: float = 0.1,
    http_request: Request = None,
):
    """Upload file (CSV, Excel, JSON) and detect anomalies."""
    _require_api_key_from_request(http_request)
    
    try:
        contents = await file.read()
        
        # Parse file
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(contents))
        elif file.filename.endswith(('.xls', '.xlsx')):
            df = pd.read_excel(io.BytesIO(contents))
        elif file.filename.endswith('.json'):
            df = pd.read_json(io.BytesIO(contents))
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format. Use CSV, Excel, or JSON.")
        
        # Run detection
        result = run_detector(
            df=df,
            method=method,
            sensitivity=sensitivity,
            expected_rate=expected_rate
        )
        
        anomaly_df = result['anomaly_df']
        anomalies = anomaly_df[anomaly_df['is_anomaly'] == True]
        
        return {
            "success": True,
            "filename": file.filename,
            "rows": len(df),
            "columns": list(df.columns),
            "method": method,
            "anomalies_found": len(anomalies),
            "anomaly_rate": float(len(anomalies) / len(df)) if len(df) > 0 else 0,
            "statistics": result.get('statistics', {}),
            "metadata": result['model_meta']
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# MAIN ENTRY POINT
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
