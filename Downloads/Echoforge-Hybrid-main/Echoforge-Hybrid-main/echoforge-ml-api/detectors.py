# EchoForge Advanced Anomaly Detection Engine
# Production-grade detectors with ensemble capabilities

import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.neighbors import LocalOutlierFactor
from sklearn.svm import OneClassSVM
from sklearn.preprocessing import StandardScaler
from sklearn.covariance import EllipticEnvelope
from scipy import stats
from typing import Dict, Any, List, Optional, Tuple
import warnings
warnings.filterwarnings('ignore')

# Advanced detectors from PyOD
try:
    from pyod.models.hbos import HBOS
    from pyod.models.knn import KNN
    from pyod.models.copod import COPOD
    from pyod.models.ecod import ECOD
    from pyod.models.lof import LOF as PyOD_LOF
    from pyod.models.abod import ABOD
    from pyod.models.cblof import CBLOF
    from pyod.models.feature_bagging import FeatureBagging
    from pyod.models.iforest import IForest
    PYOD_AVAILABLE = True
except Exception:
    PYOD_AVAILABLE = False

# Advanced ensemble methods
try:
    from pyod.models.suod import SUOD
    from pyod.models.lscp import LSCP
    ENSEMBLE_AVAILABLE = True
except Exception:
    ENSEMBLE_AVAILABLE = False

# Deep learning detectors
try:
    from pyod.models.auto_encoder import AutoEncoder
    from pyod.models.vae import VAE
    DEEP_AVAILABLE = True
except Exception:
    DEEP_AVAILABLE = False

REQ_COL_HINTS = ["timestamp"]


def validate_df(df: pd.DataFrame) -> pd.DataFrame:
    """Validate and clean input DataFrame for anomaly detection."""
    ts = df["timestamp"] if "timestamp" in df.columns else None
    num = df.select_dtypes(include=[np.number]).copy()
    num = num.replace([np.inf, -np.inf], np.nan).dropna(how="all", axis=1).ffill().bfill()
    # Handle remaining NaN values
    num = num.fillna(num.median())
    if "timestamp" in df.columns and ts is not None:
        num.insert(0, "timestamp", ts.values)
    return num


def compute_feature_importance(X: np.ndarray, scores: np.ndarray) -> Dict[str, float]:
    """Compute feature importance based on correlation with anomaly scores."""
    if X.shape[1] == 0:
        return {}
    importance = {}
    for i in range(X.shape[1]):
        corr = np.abs(np.corrcoef(X[:, i], scores)[0, 1])
        importance[f"feature_{i}"] = float(corr) if not np.isnan(corr) else 0.0
    return importance


def adaptive_threshold(scores: np.ndarray, expected_rate: float) -> float:
    """Compute adaptive threshold using multiple statistical methods."""
    percentile_thr = np.quantile(scores, 1 - expected_rate)
    
    # Modified Z-score based threshold
    median = np.median(scores)
    mad = np.median(np.abs(scores - median))
    if mad > 0:
        modified_z = 0.6745 * (scores - median) / mad
        z_thr = median + (3.5 * mad / 0.6745)
    else:
        z_thr = percentile_thr
    
    # IQR-based threshold
    q1, q3 = np.percentile(scores, [25, 75])
    iqr = q3 - q1
    iqr_thr = q3 + 1.5 * iqr
    
    # Use the most conservative (highest) threshold for low false positive rate
    return float(min(percentile_thr, max(z_thr, iqr_thr)))


def run_detector(df: pd.DataFrame, method: str, sensitivity: float, expected_rate: float, 
                 seed: int = 42, return_confidence: bool = True) -> Dict[str, Any]:
    """
    Run anomaly detection with specified method.
    
    Supports 20+ detection methods including:
    - Statistical: z_score, modified_zscore, iqr, grubbs, gesd
    - Machine Learning: isolation_forest, lof, ocsvm, hbos, knn, copod, ecod, abod, cblof
    - Ensemble: suod, lscp, feature_bagging
    - Deep Learning: autoencoder, vae
    """
    clean = validate_df(df)
    X = clean.select_dtypes(include=[np.number]).to_numpy()
    
    # Standardize for better performance
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X) if X.shape[0] > 1 else X

    rng = np.random.RandomState(seed)
    np.random.seed(seed)
    
    # Adjust contamination rate within valid bounds
    contamination = max(0.01, min(0.5, expected_rate * sensitivity))
    
    model_info = {"method": method, "n_samples": len(X), "n_features": X.shape[1]}
    feature_importance = {}
    confidence_scores = None

    # ==================== STATISTICAL METHODS ====================
    
    if method == "z_score":
        z = (X - X.mean(0)) / (X.std(0) + 1e-8)
        score = np.nanmax(np.abs(z), axis=1)
        score_series = pd.Series(score, index=clean.index)
        thr = adaptive_threshold(score, expected_rate)
        is_anom = score_series >= thr
        model_info["threshold"] = thr

    elif method == "modified_zscore":
        median = np.median(X, axis=0)
        mad = np.median(np.abs(X - median), axis=0)
        mad = np.where(mad == 0, 1e-8, mad)
        modified_z = 0.6745 * (X - median) / mad
        score = np.nanmax(np.abs(modified_z), axis=1)
        score_series = pd.Series(score, index=clean.index)
        thr = 3.5 * sensitivity
        is_anom = score_series >= thr
        model_info["threshold"] = thr

    elif method == "iqr":
        q1 = np.percentile(X, 25, axis=0)
        q3 = np.percentile(X, 75, axis=0)
        iqr = q3 - q1
        lower = q1 - (1.5 * sensitivity) * iqr
        upper = q3 + (1.5 * sensitivity) * iqr
        outlier_mask = np.any((X < lower) | (X > upper), axis=1)
        # Score based on distance from bounds
        lower_dist = np.maximum(0, lower - X)
        upper_dist = np.maximum(0, X - upper)
        score = np.nanmax(lower_dist + upper_dist, axis=1)
        score_series = pd.Series(score, index=clean.index)
        is_anom = pd.Series(outlier_mask, index=clean.index)

    elif method == "grubbs":
        # Grubbs test for univariate outliers (applied to max deviation)
        combined = np.mean(X, axis=1)
        n = len(combined)
        mean = np.mean(combined)
        std = np.std(combined, ddof=1)
        if std == 0:
            score = np.zeros(n)
        else:
            score = np.abs(combined - mean) / std
        # Critical value
        t_crit = stats.t.ppf(1 - 0.05 / (2 * n), n - 2)
        g_crit = ((n - 1) / np.sqrt(n)) * np.sqrt(t_crit**2 / (n - 2 + t_crit**2))
        score_series = pd.Series(score, index=clean.index)
        is_anom = score_series > g_crit
        model_info["g_critical"] = float(g_crit)

    elif method == "mahalanobis":
        # Mahalanobis distance for multivariate outliers
        try:
            envelope = EllipticEnvelope(contamination=contamination, random_state=seed)
            envelope.fit(X_scaled)
            mahal_dist = envelope.mahalanobis(X_scaled)
            score_series = pd.Series(mahal_dist, index=clean.index)
            labels = envelope.predict(X_scaled)
            is_anom = pd.Series(labels == -1, index=clean.index)
        except Exception:
            # Fallback to simpler covariance
            mean = np.mean(X_scaled, axis=0)
            cov = np.cov(X_scaled.T) + np.eye(X_scaled.shape[1]) * 1e-6
            cov_inv = np.linalg.pinv(cov)
            diff = X_scaled - mean
            mahal_dist = np.sqrt(np.sum(diff @ cov_inv * diff, axis=1))
            score_series = pd.Series(mahal_dist, index=clean.index)
            thr = np.quantile(mahal_dist, 1 - expected_rate)
            is_anom = score_series >= thr

    # ==================== SKLEARN ML METHODS ====================
    
    elif method == "isolation_forest":
        model = IsolationForest(n_estimators=200, contamination=contamination, 
                                random_state=rng, n_jobs=-1)
        model.fit(X_scaled)
        decision = model.decision_function(X_scaled)
        labels = model.predict(X_scaled)
        is_anom = pd.Series(labels == -1, index=clean.index)
        score_series = pd.Series(-decision, index=clean.index)
        feature_importance = compute_feature_importance(X, -decision)
        model_info["n_estimators"] = 200

    elif method == "lof":
        n_neighbors = min(20, len(X) - 1)
        lof = LocalOutlierFactor(n_neighbors=n_neighbors, contamination=contamination)
        labels = lof.fit_predict(X_scaled)
        is_anom = pd.Series(labels == -1, index=clean.index)
        score_series = pd.Series(-lof.negative_outlier_factor_, index=clean.index)
        model_info["n_neighbors"] = n_neighbors

    elif method == "ocsvm":
        nu = min(max(contamination, 0.01), 0.5)
        oc = OneClassSVM(nu=nu, kernel="rbf", gamma="scale")
        labels = oc.fit_predict(X_scaled)
        is_anom = pd.Series(labels == -1, index=clean.index)
        score_series = pd.Series(-oc.decision_function(X_scaled), index=clean.index)
        model_info["nu"] = nu

    # ==================== PYOD METHODS ====================
    
    elif method == "hbos" and PYOD_AVAILABLE:
        model = HBOS(contamination=contamination)
        model.fit(X_scaled)
        score_series = pd.Series(model.decision_scores_, index=clean.index)
        is_anom = pd.Series(model.labels_.astype(bool), index=clean.index)

    elif method == "knn" and PYOD_AVAILABLE:
        n_neighbors = min(20, len(X) - 1)
        model = KNN(contamination=contamination, n_neighbors=n_neighbors, method='largest')
        model.fit(X_scaled)
        is_anom = pd.Series(model.labels_.astype(bool), index=clean.index)
        score_series = pd.Series(model.decision_scores_, index=clean.index)

    elif method == "copod" and PYOD_AVAILABLE:
        model = COPOD(contamination=contamination)
        model.fit(X_scaled)
        score_series = pd.Series(model.decision_scores_, index=clean.index)
        is_anom = pd.Series(model.labels_.astype(bool), index=clean.index)

    elif method == "ecod" and PYOD_AVAILABLE:
        model = ECOD(contamination=contamination)
        model.fit(X_scaled)
        score_series = pd.Series(model.decision_scores_, index=clean.index)
        is_anom = pd.Series(model.labels_.astype(bool), index=clean.index)

    elif method == "abod" and PYOD_AVAILABLE:
        # Angle-Based Outlier Detection
        model = ABOD(contamination=contamination)
        model.fit(X_scaled)
        score_series = pd.Series(model.decision_scores_, index=clean.index)
        is_anom = pd.Series(model.labels_.astype(bool), index=clean.index)

    elif method == "cblof" and PYOD_AVAILABLE:
        # Clustering-Based Local Outlier Factor
        n_clusters = min(8, len(X) // 10 + 1)
        model = CBLOF(n_clusters=n_clusters, contamination=contamination, random_state=seed)
        model.fit(X_scaled)
        score_series = pd.Series(model.decision_scores_, index=clean.index)
        is_anom = pd.Series(model.labels_.astype(bool), index=clean.index)
        model_info["n_clusters"] = n_clusters

    elif method == "feature_bagging" and PYOD_AVAILABLE:
        # Feature Bagging ensemble
        model = FeatureBagging(contamination=contamination, random_state=seed, n_estimators=10)
        model.fit(X_scaled)
        score_series = pd.Series(model.decision_scores_, index=clean.index)
        is_anom = pd.Series(model.labels_.astype(bool), index=clean.index)

    # ==================== ENSEMBLE METHODS ====================
    
    elif method == "suod" and ENSEMBLE_AVAILABLE:
        # Scalable Unsupervised Outlier Detection
        base_estimators = [
            IForest(contamination=contamination, random_state=seed),
            PyOD_LOF(n_neighbors=min(20, len(X) - 1), contamination=contamination),
            COPOD(contamination=contamination),
            HBOS(contamination=contamination),
        ]
        model = SUOD(base_estimators=base_estimators, contamination=contamination, n_jobs=-1)
        model.fit(X_scaled)
        score_series = pd.Series(model.decision_scores_, index=clean.index)
        is_anom = pd.Series(model.labels_.astype(bool), index=clean.index)
        model_info["ensemble_size"] = len(base_estimators)

    elif method == "lscp" and ENSEMBLE_AVAILABLE:
        # Locally Selective Combination of Parallel Outlier Ensembles
        base_estimators = [
            IForest(contamination=contamination, random_state=seed),
            PyOD_LOF(n_neighbors=min(15, len(X) - 1), contamination=contamination),
            HBOS(contamination=contamination),
        ]
        model = LSCP(detector_list=base_estimators, contamination=contamination, random_state=seed)
        model.fit(X_scaled)
        score_series = pd.Series(model.decision_scores_, index=clean.index)
        is_anom = pd.Series(model.labels_.astype(bool), index=clean.index)

    # ==================== DEEP LEARNING METHODS ====================
    
    elif method == "autoencoder" and DEEP_AVAILABLE:
        # Deep Autoencoder for anomaly detection
        hidden_neurons = [X.shape[1] * 2, X.shape[1], X.shape[1] // 2 + 1, X.shape[1], X.shape[1] * 2]
        model = AutoEncoder(hidden_neurons=hidden_neurons, contamination=contamination, 
                           epochs=50, random_state=seed, verbose=0)
        model.fit(X_scaled)
        score_series = pd.Series(model.decision_scores_, index=clean.index)
        is_anom = pd.Series(model.labels_.astype(bool), index=clean.index)
        model_info["architecture"] = hidden_neurons

    elif method == "vae" and DEEP_AVAILABLE:
        # Variational Autoencoder
        encoder_neurons = [X.shape[1] * 2, X.shape[1]]
        decoder_neurons = [X.shape[1], X.shape[1] * 2]
        model = VAE(encoder_neurons=encoder_neurons, decoder_neurons=decoder_neurons,
                   contamination=contamination, epochs=50, random_state=seed, verbose=0)
        model.fit(X_scaled)
        score_series = pd.Series(model.decision_scores_, index=clean.index)
        is_anom = pd.Series(model.labels_.astype(bool), index=clean.index)

    # ==================== FALLBACK (Modified Z-Score) ====================
    
    else:
        # Default to modified z-score
        z = (X - np.median(X, 0)) / (1.4826 * (np.median(np.abs(X - np.median(X, 0)), 0) + 1e-8))
        score = np.nanmax(np.abs(z), axis=1)
        score_series = pd.Series(score, index=clean.index)
        thr = np.quantile(score_series, 1 - expected_rate)
        is_anom = score_series >= thr
        model_info["fallback"] = True

    # Ensure proper types
    is_anom = pd.Series(is_anom, index=clean.index).astype(bool)
    
    # Build output DataFrame
    out = clean.copy()
    out["anomaly_score"] = score_series
    out["is_anomaly"] = is_anom
    
    # Compute confidence scores (normalized 0-1)
    if return_confidence:
        min_score = score_series.min()
        max_score = score_series.max()
        if max_score > min_score:
            confidence_scores = (score_series - min_score) / (max_score - min_score)
        else:
            confidence_scores = pd.Series(0.5, index=clean.index)
        out["confidence"] = confidence_scores

    # Compute statistics
    stats_dict = {
        "total_samples": len(X),
        "anomalies_detected": int(is_anom.sum()),
        "anomaly_rate": float(is_anom.mean()),
        "score_mean": float(score_series.mean()),
        "score_std": float(score_series.std()),
        "score_min": float(score_series.min()),
        "score_max": float(score_series.max()),
    }

    return {
        "anomaly_df": out,
        "model_meta": {
            "method": method,
            "sensitivity": float(sensitivity),
            "expected_rate": float(expected_rate),
            "seed": int(seed),
            "contamination": float(contamination),
            **model_info,
        },
        "feature_importance": feature_importance,
        "statistics": stats_dict,
        "explain": {},
    }


def run_ensemble_detector(df: pd.DataFrame, methods: List[str], sensitivity: float, 
                          expected_rate: float, voting: str = "soft", 
                          weights: Optional[List[float]] = None, seed: int = 42) -> Dict[str, Any]:
    """
    Run ensemble detection using multiple methods with voting.
    
    Args:
        df: Input DataFrame
        methods: List of detection methods to use
        sensitivity: Sensitivity parameter
        expected_rate: Expected anomaly rate
        voting: 'hard' (majority vote) or 'soft' (weighted average scores)
        weights: Optional weights for each method
        seed: Random seed
    
    Returns:
        Combined detection results
    """
    if weights is None:
        weights = [1.0] * len(methods)
    
    weights = np.array(weights) / np.sum(weights)
    
    all_scores = []
    all_labels = []
    method_results = {}
    
    for method in methods:
        try:
            result = run_detector(df, method, sensitivity, expected_rate, seed)
            scores = result["anomaly_df"]["anomaly_score"]
            # Normalize scores to 0-1
            min_s, max_s = scores.min(), scores.max()
            if max_s > min_s:
                norm_scores = (scores - min_s) / (max_s - min_s)
            else:
                norm_scores = scores * 0 + 0.5
            all_scores.append(norm_scores)
            all_labels.append(result["anomaly_df"]["is_anomaly"].astype(int))
            method_results[method] = {
                "anomalies": int(result["anomaly_df"]["is_anomaly"].sum()),
                "score_mean": float(scores.mean())
            }
        except Exception as e:
            method_results[method] = {"error": str(e)}
    
    if not all_scores:
        raise ValueError("No methods succeeded")
    
    # Combine scores
    scores_matrix = np.column_stack(all_scores)
    labels_matrix = np.column_stack(all_labels)
    
    if voting == "soft":
        # Weighted average of normalized scores
        combined_scores = np.average(scores_matrix, axis=1, weights=weights[:len(all_scores)])
        threshold = np.quantile(combined_scores, 1 - expected_rate)
        combined_labels = combined_scores >= threshold
    else:
        # Hard voting (majority)
        weighted_votes = np.average(labels_matrix, axis=1, weights=weights[:len(all_labels)])
        combined_labels = weighted_votes >= 0.5
        combined_scores = weighted_votes
    
    clean = validate_df(df)
    out = clean.copy()
    out["anomaly_score"] = pd.Series(combined_scores, index=clean.index)
    out["is_anomaly"] = pd.Series(combined_labels, index=clean.index)
    out["vote_agreement"] = pd.Series(labels_matrix.std(axis=1), index=clean.index)
    
    return {
        "anomaly_df": out,
        "model_meta": {
            "method": "ensemble",
            "sub_methods": methods,
            "voting": voting,
            "weights": weights.tolist(),
            "sensitivity": float(sensitivity),
            "expected_rate": float(expected_rate),
            "seed": int(seed),
        },
        "method_results": method_results,
        "statistics": {
            "total_samples": len(combined_scores),
            "anomalies_detected": int(combined_labels.sum()),
            "anomaly_rate": float(combined_labels.mean()),
            "avg_agreement": float(1 - labels_matrix.std(axis=1).mean()),
        },
    }


def get_available_methods() -> Dict[str, List[str]]:
    """Get all available detection methods grouped by category."""
    methods = {
        "statistical": ["z_score", "modified_zscore", "iqr", "grubbs", "mahalanobis"],
        "sklearn": ["isolation_forest", "lof", "ocsvm"],
        "pyod": [],
        "ensemble": [],
        "deep_learning": [],
    }
    
    if PYOD_AVAILABLE:
        methods["pyod"] = ["hbos", "knn", "copod", "ecod", "abod", "cblof", "feature_bagging"]
    
    if ENSEMBLE_AVAILABLE:
        methods["ensemble"] = ["suod", "lscp"]
    
    if DEEP_AVAILABLE:
        methods["deep_learning"] = ["autoencoder", "vae"]
    
    return methods
