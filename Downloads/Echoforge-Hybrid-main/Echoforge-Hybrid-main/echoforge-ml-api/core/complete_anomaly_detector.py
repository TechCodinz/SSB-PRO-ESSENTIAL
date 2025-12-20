# EchoForge Complete Anomaly Detection Engine - Enterprise Grade
# 20+ detection methods across Statistical, ML, Deep Learning, and Ensemble categories

import numpy as np
import pandas as pd
from scipy import stats
from typing import List, Dict, Tuple, Any, Optional, Union
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

# Sklearn imports
try:
    from sklearn.ensemble import IsolationForest
    from sklearn.neighbors import LocalOutlierFactor
    from sklearn.svm import OneClassSVM
    from sklearn.preprocessing import StandardScaler, RobustScaler
    from sklearn.covariance import EllipticEnvelope
    from sklearn.cluster import DBSCAN
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False

# PyOD imports for advanced anomaly detection
try:
    from pyod.models.hbos import HBOS
    from pyod.models.knn import KNN
    from pyod.models.copod import COPOD
    from pyod.models.ecod import ECOD
    from pyod.models.abod import ABOD
    from pyod.models.cblof import CBLOF
    from pyod.models.feature_bagging import FeatureBagging
    from pyod.models.iforest import IForest
    from pyod.models.lof import LOF as PyOD_LOF
    PYOD_AVAILABLE = True
except ImportError:
    PYOD_AVAILABLE = False

# Advanced ensemble methods
try:
    from pyod.models.suod import SUOD
    from pyod.models.lscp import LSCP
    ENSEMBLE_AVAILABLE = True
except ImportError:
    ENSEMBLE_AVAILABLE = False

# Deep learning detectors
try:
    from pyod.models.auto_encoder import AutoEncoder
    from pyod.models.vae import VAE
    DEEP_AVAILABLE = True
except ImportError:
    DEEP_AVAILABLE = False

# PyTorch for custom LSTM
try:
    import torch
    import torch.nn as nn
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False


class LSTMAutoencoder(nn.Module):
    """LSTM-based autoencoder for time-series anomaly detection."""
    
    def __init__(self, input_dim: int, hidden_dim: int = 64, num_layers: int = 2):
        super().__init__()
        self.hidden_dim = hidden_dim
        self.num_layers = num_layers
        
        self.encoder = nn.LSTM(input_dim, hidden_dim, num_layers, batch_first=True)
        self.decoder = nn.LSTM(hidden_dim, input_dim, num_layers, batch_first=True)
    
    def forward(self, x):
        # Encode
        _, (hidden, cell) = self.encoder(x)
        # Decode
        seq_len = x.size(1)
        decoder_input = hidden[-1].unsqueeze(1).repeat(1, seq_len, 1)
        output, _ = self.decoder(decoder_input)
        return output


class CompleteAnomalyDetector:
    """
    Enterprise-grade anomaly detection with 20+ methods:
    
    Statistical Methods (6):
    - zscore, modified_zscore, iqr, moving_average, grubbs, gesd
    
    Machine Learning Methods (8):
    - isolation_forest, lof, ocsvm, dbscan, elliptic_envelope
    - hbos, knn, copod, ecod, abod, cblof
    
    Ensemble Methods (3):
    - feature_bagging, suod, lscp
    
    Deep Learning Methods (3):
    - autoencoder, vae, lstm_autoencoder
    """
    
    def __init__(self):
        # Statistical methods
        self.statistical_methods = {
            'zscore': self.zscore_method,
            'modified_zscore': self.modified_zscore_method,
            'iqr': self.iqr_method,
            'moving_average': self.moving_average_method,
            'grubbs': self.grubbs_test,
            'gesd': self.gesd_test,
            'mahalanobis': self.mahalanobis_method,
            'tukey': self.tukey_method,
        }
        
        # Sklearn ML methods
        self.ml_methods = {}
        if SKLEARN_AVAILABLE:
            self.ml_methods.update({
                'isolation_forest': self.isolation_forest_method,
                'lof': self.lof_method,
                'ocsvm': self.ocsvm_method,
                'dbscan': self.dbscan_method,
                'elliptic_envelope': self.elliptic_envelope_method,
            })
        
        # PyOD methods
        if PYOD_AVAILABLE:
            self.ml_methods.update({
                'hbos': self.hbos_method,
                'knn': self.knn_method,
                'copod': self.copod_method,
                'ecod': self.ecod_method,
                'abod': self.abod_method,
                'cblof': self.cblof_method,
            })
        
        # Ensemble methods
        self.ensemble_methods = {}
        if PYOD_AVAILABLE:
            self.ensemble_methods['feature_bagging'] = self.feature_bagging_method
        if ENSEMBLE_AVAILABLE:
            self.ensemble_methods.update({
                'suod': self.suod_method,
                'lscp': self.lscp_method,
            })
        
        # Deep learning methods
        self.dl_methods = {}
        if DEEP_AVAILABLE:
            self.dl_methods.update({
                'autoencoder': self.autoencoder_method,
                'vae': self.vae_method,
            })
        if TORCH_AVAILABLE:
            self.dl_methods['lstm_autoencoder'] = self.lstm_autoencoder_method
        
        # Combine all methods
        self.all_methods = {
            **self.statistical_methods,
            **self.ml_methods,
            **self.ensemble_methods,
            **self.dl_methods
        }
    
    def get_available_methods(self) -> List[str]:
        """Return list of all available detection methods."""
        return list(self.all_methods.keys())
    
    def get_methods_by_category(self) -> Dict[str, List[str]]:
        """Return methods grouped by category."""
        return {
            'statistical': list(self.statistical_methods.keys()),
            'machine_learning': list(self.ml_methods.keys()),
            'ensemble': list(self.ensemble_methods.keys()),
            'deep_learning': list(self.dl_methods.keys()),
        }
    
    def detect(self, data: Any, method: str = 'isolation_forest', 
               sensitivity: float = 0.1, **kwargs) -> Dict[str, Any]:
        """
        Detect anomalies using specified method.
        
        Args:
            data: Input data (list, array, Series, or DataFrame)
            method: Detection method name
            sensitivity: Sensitivity/contamination parameter (0.01-0.5)
            **kwargs: Additional method-specific parameters
        
        Returns:
            Dictionary with detection results and metadata
        """
        start_time = datetime.now()
        
        # Convert data to numpy array
        if isinstance(data, pd.DataFrame):
            data_array = data.select_dtypes(include=[np.number]).values
            is_multivariate = data_array.shape[1] > 1
        elif isinstance(data, pd.Series):
            data_array = data.values.reshape(-1, 1)
            is_multivariate = False
        elif isinstance(data, list):
            data_array = np.array(data, dtype=float)
            if data_array.ndim == 1:
                data_array = data_array.reshape(-1, 1)
            is_multivariate = data_array.shape[1] > 1
        else:
            data_array = np.array(data, dtype=float)
            if data_array.ndim == 1:
                data_array = data_array.reshape(-1, 1)
            is_multivariate = data_array.shape[1] > 1
        
        # Handle missing values
        valid_mask = ~np.any(np.isnan(data_array), axis=1)
        valid_data = data_array[valid_mask]
        valid_indices = np.where(valid_mask)[0]
        
        if len(valid_data) < 3:
            return {'success': False, 'error': 'Insufficient data (need at least 3 points)'}
        
        # Fallback to available method
        if method not in self.all_methods:
            method = 'isolation_forest' if SKLEARN_AVAILABLE else 'zscore'
        
        try:
            detection_func = self.all_methods[method]
            
            # Handle parameters
            sensitivity = max(0.01, min(0.5, sensitivity))
            
            # Call detection method
            if method == 'moving_average':
                window_size = kwargs.get('window_size', 10)
                anomaly_mask, scores = detection_func(valid_data.flatten(), sensitivity, window_size)
            elif method in self.statistical_methods:
                # Statistical methods work on flattened data
                flat_data = valid_data.flatten() if valid_data.shape[1] == 1 else np.mean(valid_data, axis=1)
                anomaly_mask, scores = detection_func(flat_data, sensitivity)
            else:
                # ML/DL methods work on multivariate data
                anomaly_mask, scores = detection_func(valid_data, sensitivity)
            
            # Map back to original indices
            anomaly_indices = valid_indices[anomaly_mask].tolist()
            all_scores = np.full(len(data_array), np.nan)
            all_scores[valid_indices] = scores
            
            # Calculate statistics
            total_points = len(data_array)
            anomalies_found = len(anomaly_indices)
            anomaly_percentage = (anomalies_found / total_points) * 100
            
            processing_time = (datetime.now() - start_time).total_seconds() * 1000
            
            return {
                'success': True,
                'method': method,
                'method_type': self._get_method_type(method),
                'total_points': total_points,
                'anomalies_found': anomalies_found,
                'anomaly_percentage': round(anomaly_percentage, 2),
                'anomaly_indices': anomaly_indices,
                'anomaly_scores': all_scores.tolist(),
                'anomaly_values': [data_array[i].tolist() for i in anomaly_indices],
                'sensitivity': sensitivity,
                'is_multivariate': is_multivariate,
                'statistics': {
                    'mean': float(np.nanmean(data_array)),
                    'median': float(np.nanmedian(data_array)),
                    'std': float(np.nanstd(data_array)),
                    'min': float(np.nanmin(data_array)),
                    'max': float(np.nanmax(data_array)),
                    'q25': float(np.nanpercentile(data_array, 25)),
                    'q75': float(np.nanpercentile(data_array, 75)),
                    'skewness': float(stats.skew(data_array.flatten())),
                    'kurtosis': float(stats.kurtosis(data_array.flatten())),
                },
                'processing_time_ms': round(processing_time, 2),
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            return {'success': False, 'error': f'Detection failed: {str(e)}'}
    
    def _get_method_type(self, method: str) -> str:
        if method in self.statistical_methods:
            return 'Statistical'
        elif method in self.ml_methods:
            return 'Machine Learning'
        elif method in self.ensemble_methods:
            return 'Ensemble'
        elif method in self.dl_methods:
            return 'Deep Learning'
        return 'Unknown'
    
    # ================== STATISTICAL METHODS ==================
    
    def zscore_method(self, data: np.ndarray, threshold: float = 3.0) -> Tuple[np.ndarray, np.ndarray]:
        """Standard Z-score method."""
        mean = np.mean(data)
        std = np.std(data)
        if std == 0:
            return np.zeros(len(data), dtype=bool), np.zeros(len(data))
        z_scores = np.abs((data - mean) / std)
        return z_scores > threshold, z_scores
    
    def modified_zscore_method(self, data: np.ndarray, threshold: float = 3.5) -> Tuple[np.ndarray, np.ndarray]:
        """Modified Z-score using Median Absolute Deviation (MAD)."""
        median = np.median(data)
        mad = np.median(np.abs(data - median))
        if mad == 0:
            mad = np.std(data)
        if mad == 0:
            return np.zeros(len(data), dtype=bool), np.zeros(len(data))
        modified_z = 0.6745 * (data - median) / mad
        return np.abs(modified_z) > threshold, np.abs(modified_z)
    
    def iqr_method(self, data: np.ndarray, multiplier: float = 1.5) -> Tuple[np.ndarray, np.ndarray]:
        """Interquartile Range method."""
        q25 = np.percentile(data, 25)
        q75 = np.percentile(data, 75)
        iqr = q75 - q25
        if iqr == 0:
            return np.zeros(len(data), dtype=bool), np.zeros(len(data))
        lower = q25 - multiplier * iqr
        upper = q75 + multiplier * iqr
        anomalies = (data < lower) | (data > upper)
        scores = np.maximum(np.abs(lower - data) / iqr, np.abs(data - upper) / iqr)
        return anomalies, np.maximum(scores, 0)
    
    def tukey_method(self, data: np.ndarray, k: float = 1.5) -> Tuple[np.ndarray, np.ndarray]:
        """Tukey's Fences method (similar to IQR but with configurable k)."""
        q25, q75 = np.percentile(data, [25, 75])
        iqr = q75 - q25
        if iqr == 0:
            return np.zeros(len(data), dtype=bool), np.zeros(len(data))
        lower = q25 - k * iqr
        upper = q75 + k * iqr
        anomalies = (data < lower) | (data > upper)
        # Calculate distance from fences
        dist_lower = np.maximum(0, lower - data)
        dist_upper = np.maximum(0, data - upper)
        scores = (dist_lower + dist_upper) / iqr
        return anomalies, scores
    
    def moving_average_method(self, data: np.ndarray, threshold: float = 3.0, 
                              window: int = 10) -> Tuple[np.ndarray, np.ndarray]:
        """Moving average with dynamic threshold."""
        if len(data) < window:
            window = max(3, len(data) // 2)
        moving_avg = np.convolve(data, np.ones(window)/window, mode='same')
        
        # Calculate moving std
        moving_std = np.array([
            np.std(data[max(0, i-window//2):min(len(data), i+window//2+1)]) 
            for i in range(len(data))
        ])
        moving_std = np.where(moving_std == 0, np.mean(moving_std) + 1e-8, moving_std)
        
        scores = np.abs(data - moving_avg) / moving_std
        return scores > threshold, scores
    
    def grubbs_test(self, data: np.ndarray, alpha: float = 0.05) -> Tuple[np.ndarray, np.ndarray]:
        """Grubbs test for outliers."""
        n = len(data)
        if n < 3:
            return np.zeros(n, dtype=bool), np.zeros(n)
        t_crit = stats.t.ppf(1 - alpha / (2 * n), n - 2)
        g_crit = ((n - 1) / np.sqrt(n)) * np.sqrt(t_crit**2 / (n - 2 + t_crit**2))
        mean = np.mean(data)
        std = np.std(data, ddof=1)
        if std == 0:
            return np.zeros(n, dtype=bool), np.zeros(n)
        g_scores = np.abs(data - mean) / std
        return g_scores > g_crit, g_scores
    
    def gesd_test(self, data: np.ndarray, alpha: float = 0.05, 
                  max_outliers: Optional[int] = None) -> Tuple[np.ndarray, np.ndarray]:
        """Generalized ESD test for multiple outliers."""
        if max_outliers is None:
            max_outliers = max(1, len(data) // 10)
        anomalies = np.zeros(len(data), dtype=bool)
        scores = np.zeros(len(data))
        test_data = data.copy()
        original_indices = np.arange(len(data))
        
        for i in range(max_outliers):
            n = len(test_data)
            if n < 3:
                break
            mean = np.mean(test_data)
            std = np.std(test_data, ddof=1)
            if std == 0:
                break
            test_stats = np.abs(test_data - mean) / std
            max_idx = np.argmax(test_stats)
            max_stat = test_stats[max_idx]
            t_crit = stats.t.ppf(1 - alpha / (2 * (n - i)), n - i - 2)
            lambda_crit = ((n - i - 1) * t_crit) / np.sqrt((n - i - 2 + t_crit**2) * (n - i))
            if max_stat > lambda_crit:
                original_idx = original_indices[max_idx]
                anomalies[original_idx] = True
                scores[original_idx] = max_stat
                test_data = np.delete(test_data, max_idx)
                original_indices = np.delete(original_indices, max_idx)
            else:
                break
        return anomalies, scores
    
    def mahalanobis_method(self, data: np.ndarray, contamination: float = 0.1) -> Tuple[np.ndarray, np.ndarray]:
        """Mahalanobis distance for multivariate outliers."""
        if data.ndim == 1:
            data = data.reshape(-1, 1)
        
        try:
            envelope = EllipticEnvelope(contamination=contamination, random_state=42)
            labels = envelope.fit_predict(data)
            scores = envelope.mahalanobis(data)
            anomalies = labels == -1
            return anomalies, scores
        except Exception:
            # Fallback to simple covariance
            mean = np.mean(data, axis=0)
            cov = np.cov(data.T) + np.eye(data.shape[1]) * 1e-6
            cov_inv = np.linalg.pinv(cov)
            diff = data - mean
            mahal_dist = np.sqrt(np.sum(diff @ cov_inv * diff, axis=1))
            threshold = np.percentile(mahal_dist, (1 - contamination) * 100)
            return mahal_dist > threshold, mahal_dist
    
    # ================== MACHINE LEARNING METHODS ==================
    
    def isolation_forest_method(self, data: np.ndarray, contamination: float = 0.1) -> Tuple[np.ndarray, np.ndarray]:
        """Isolation Forest anomaly detection."""
        if data.ndim == 1:
            data = data.reshape(-1, 1)
        clf = IsolationForest(contamination=contamination, random_state=42, n_jobs=-1, n_estimators=200)
        predictions = clf.fit_predict(data)
        scores = -clf.decision_function(data)
        return predictions == -1, scores
    
    def lof_method(self, data: np.ndarray, contamination: float = 0.1) -> Tuple[np.ndarray, np.ndarray]:
        """Local Outlier Factor."""
        if data.ndim == 1:
            data = data.reshape(-1, 1)
        n_neighbors = min(20, len(data) - 1)
        clf = LocalOutlierFactor(contamination=contamination, n_neighbors=n_neighbors)
        predictions = clf.fit_predict(data)
        scores = -clf.negative_outlier_factor_
        return predictions == -1, scores
    
    def ocsvm_method(self, data: np.ndarray, nu: float = 0.1) -> Tuple[np.ndarray, np.ndarray]:
        """One-Class SVM."""
        if data.ndim == 1:
            data = data.reshape(-1, 1)
        scaler = StandardScaler()
        data_scaled = scaler.fit_transform(data)
        nu = max(0.01, min(0.5, nu))
        clf = OneClassSVM(nu=nu, kernel='rbf', gamma='scale')
        predictions = clf.fit_predict(data_scaled)
        scores = -clf.decision_function(data_scaled)
        return predictions == -1, scores
    
    def dbscan_method(self, data: np.ndarray, contamination: float = 0.1) -> Tuple[np.ndarray, np.ndarray]:
        """DBSCAN clustering-based anomaly detection."""
        if data.ndim == 1:
            data = data.reshape(-1, 1)
        scaler = RobustScaler()
        data_scaled = scaler.fit_transform(data)
        
        # Auto-estimate eps using k-distance
        from sklearn.neighbors import NearestNeighbors
        k = min(5, len(data) - 1)
        nbrs = NearestNeighbors(n_neighbors=k).fit(data_scaled)
        distances, _ = nbrs.kneighbors(data_scaled)
        eps = np.percentile(distances[:, -1], 90)
        
        clf = DBSCAN(eps=eps, min_samples=max(2, int(len(data) * 0.05)))
        labels = clf.fit_predict(data_scaled)
        
        # Points labeled -1 are noise/anomalies
        anomalies = labels == -1
        
        # Calculate distance to nearest cluster center as score
        scores = np.zeros(len(data))
        for i, label in enumerate(labels):
            if label == -1:
                # Distance to nearest non-noise point
                non_noise = data_scaled[labels != -1]
                if len(non_noise) > 0:
                    dists = np.linalg.norm(data_scaled[i] - non_noise, axis=1)
                    scores[i] = np.min(dists)
                else:
                    scores[i] = np.linalg.norm(data_scaled[i] - np.mean(data_scaled, axis=0))
        
        return anomalies, scores
    
    def elliptic_envelope_method(self, data: np.ndarray, contamination: float = 0.1) -> Tuple[np.ndarray, np.ndarray]:
        """Elliptic Envelope (robust covariance)."""
        if data.ndim == 1:
            data = data.reshape(-1, 1)
        clf = EllipticEnvelope(contamination=contamination, random_state=42)
        predictions = clf.fit_predict(data)
        scores = clf.mahalanobis(data)
        return predictions == -1, scores
    
    # ================== PYOD METHODS ==================
    
    def hbos_method(self, data: np.ndarray, contamination: float = 0.1) -> Tuple[np.ndarray, np.ndarray]:
        """Histogram-Based Outlier Score."""
        if data.ndim == 1:
            data = data.reshape(-1, 1)
        clf = HBOS(contamination=contamination)
        clf.fit(data)
        return clf.labels_.astype(bool), clf.decision_scores_
    
    def knn_method(self, data: np.ndarray, contamination: float = 0.1) -> Tuple[np.ndarray, np.ndarray]:
        """K-Nearest Neighbors anomaly detection."""
        if data.ndim == 1:
            data = data.reshape(-1, 1)
        n_neighbors = min(20, len(data) - 1)
        clf = KNN(contamination=contamination, n_neighbors=n_neighbors, method='largest')
        clf.fit(data)
        return clf.labels_.astype(bool), clf.decision_scores_
    
    def copod_method(self, data: np.ndarray, contamination: float = 0.1) -> Tuple[np.ndarray, np.ndarray]:
        """Copula-Based Outlier Detection."""
        if data.ndim == 1:
            data = data.reshape(-1, 1)
        clf = COPOD(contamination=contamination)
        clf.fit(data)
        return clf.labels_.astype(bool), clf.decision_scores_
    
    def ecod_method(self, data: np.ndarray, contamination: float = 0.1) -> Tuple[np.ndarray, np.ndarray]:
        """Empirical Cumulative Distribution Outlier Detection."""
        if data.ndim == 1:
            data = data.reshape(-1, 1)
        clf = ECOD(contamination=contamination)
        clf.fit(data)
        return clf.labels_.astype(bool), clf.decision_scores_
    
    def abod_method(self, data: np.ndarray, contamination: float = 0.1) -> Tuple[np.ndarray, np.ndarray]:
        """Angle-Based Outlier Detection."""
        if data.ndim == 1:
            data = data.reshape(-1, 1)
        clf = ABOD(contamination=contamination)
        clf.fit(data)
        return clf.labels_.astype(bool), clf.decision_scores_
    
    def cblof_method(self, data: np.ndarray, contamination: float = 0.1) -> Tuple[np.ndarray, np.ndarray]:
        """Clustering-Based Local Outlier Factor."""
        if data.ndim == 1:
            data = data.reshape(-1, 1)
        n_clusters = min(8, max(2, len(data) // 20))
        clf = CBLOF(n_clusters=n_clusters, contamination=contamination, random_state=42)
        clf.fit(data)
        return clf.labels_.astype(bool), clf.decision_scores_
    
    # ================== ENSEMBLE METHODS ==================
    
    def feature_bagging_method(self, data: np.ndarray, contamination: float = 0.1) -> Tuple[np.ndarray, np.ndarray]:
        """Feature Bagging ensemble."""
        if data.ndim == 1:
            data = data.reshape(-1, 1)
        clf = FeatureBagging(contamination=contamination, random_state=42, n_estimators=10)
        clf.fit(data)
        return clf.labels_.astype(bool), clf.decision_scores_
    
    def suod_method(self, data: np.ndarray, contamination: float = 0.1) -> Tuple[np.ndarray, np.ndarray]:
        """Scalable Unsupervised Outlier Detection (ensemble)."""
        if data.ndim == 1:
            data = data.reshape(-1, 1)
        base_estimators = [
            IForest(contamination=contamination, random_state=42),
            PyOD_LOF(n_neighbors=min(20, len(data) - 1), contamination=contamination),
            COPOD(contamination=contamination),
            HBOS(contamination=contamination),
        ]
        clf = SUOD(base_estimators=base_estimators, contamination=contamination, n_jobs=-1)
        clf.fit(data)
        return clf.labels_.astype(bool), clf.decision_scores_
    
    def lscp_method(self, data: np.ndarray, contamination: float = 0.1) -> Tuple[np.ndarray, np.ndarray]:
        """Locally Selective Combination of Parallel Outlier Ensembles."""
        if data.ndim == 1:
            data = data.reshape(-1, 1)
        base_estimators = [
            IForest(contamination=contamination, random_state=42),
            PyOD_LOF(n_neighbors=min(15, len(data) - 1), contamination=contamination),
            HBOS(contamination=contamination),
        ]
        clf = LSCP(detector_list=base_estimators, contamination=contamination, random_state=42)
        clf.fit(data)
        return clf.labels_.astype(bool), clf.decision_scores_
    
    # ================== DEEP LEARNING METHODS ==================
    
    def autoencoder_method(self, data: np.ndarray, contamination: float = 0.1) -> Tuple[np.ndarray, np.ndarray]:
        """Deep Autoencoder anomaly detection."""
        if data.ndim == 1:
            data = data.reshape(-1, 1)
        hidden_neurons = [data.shape[1] * 4, data.shape[1] * 2, data.shape[1], 
                          data.shape[1] * 2, data.shape[1] * 4]
        clf = AutoEncoder(hidden_neurons=hidden_neurons, contamination=contamination,
                         epochs=100, random_state=42, verbose=0)
        clf.fit(data)
        return clf.labels_.astype(bool), clf.decision_scores_
    
    def vae_method(self, data: np.ndarray, contamination: float = 0.1) -> Tuple[np.ndarray, np.ndarray]:
        """Variational Autoencoder anomaly detection."""
        if data.ndim == 1:
            data = data.reshape(-1, 1)
        encoder_neurons = [data.shape[1] * 4, data.shape[1] * 2]
        decoder_neurons = [data.shape[1] * 2, data.shape[1] * 4]
        clf = VAE(encoder_neurons=encoder_neurons, decoder_neurons=decoder_neurons,
                 contamination=contamination, epochs=100, random_state=42, verbose=0)
        clf.fit(data)
        return clf.labels_.astype(bool), clf.decision_scores_
    
    def lstm_autoencoder_method(self, data: np.ndarray, contamination: float = 0.1) -> Tuple[np.ndarray, np.ndarray]:
        """LSTM Autoencoder for time-series anomaly detection."""
        if data.ndim == 1:
            data = data.reshape(-1, 1)
        
        # Prepare sequences
        seq_len = min(10, len(data) // 5)
        if seq_len < 3:
            seq_len = len(data)
        
        # Create sliding window sequences
        sequences = []
        for i in range(len(data) - seq_len + 1):
            sequences.append(data[i:i+seq_len])
        
        if len(sequences) == 0:
            return np.zeros(len(data), dtype=bool), np.zeros(len(data))
        
        X = np.array(sequences)
        X_tensor = torch.FloatTensor(X)
        
        # Create and train model
        model = LSTMAutoencoder(input_dim=data.shape[1], hidden_dim=32, num_layers=1)
        optimizer = torch.optim.Adam(model.parameters(), lr=0.01)
        criterion = nn.MSELoss()
        
        # Training
        model.train()
        for epoch in range(50):
            optimizer.zero_grad()
            output = model(X_tensor)
            loss = criterion(output, X_tensor)
            loss.backward()
            optimizer.step()
        
        # Calculate reconstruction errors
        model.eval()
        with torch.no_grad():
            reconstructed = model(X_tensor)
            errors = torch.mean((X_tensor - reconstructed) ** 2, dim=(1, 2)).numpy()
        
        # Map errors back to original points
        scores = np.zeros(len(data))
        counts = np.zeros(len(data))
        for i, err in enumerate(errors):
            for j in range(seq_len):
                if i + j < len(data):
                    scores[i + j] += err
                    counts[i + j] += 1
        
        scores = np.where(counts > 0, scores / counts, 0)
        threshold = np.percentile(scores, (1 - contamination) * 100)
        
        return scores > threshold, scores


# Global instance for quick access
complete_detector = CompleteAnomalyDetector()


def quick_detect(data: Any, method: str = 'isolation_forest', sensitivity: float = 0.1) -> Dict[str, Any]:
    """Quick detection using global detector instance."""
    return complete_detector.detect(data, method, sensitivity)


def get_all_methods() -> Dict[str, List[str]]:
    """Get all available methods categorized."""
    return complete_detector.get_methods_by_category()
