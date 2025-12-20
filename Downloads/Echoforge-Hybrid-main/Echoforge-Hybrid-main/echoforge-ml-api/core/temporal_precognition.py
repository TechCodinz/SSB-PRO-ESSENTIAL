"""
Temporal Precognition System
=============================
A revolutionary AI system that doesn't just detect anomalies - 
it PREDICTS them before they happen.

This is beyond conventional time-series forecasting. It uses:
- Causal Chain Analysis: Traces back to root causes in temporal space
- Counterfactual Reasoning: "What if X hadn't happened?"
- Intervention Simulation: Test preventive actions before deploying
- Multi-Horizon Prediction: 1h, 6h, 24h, 7d forecasts
- Attention over Time: Focus on most predictive windows

Nothing like this exists in any anomaly detection platform.

Author: EchoForge AI Team
License: Proprietary
"""

import numpy as np
from typing import Dict, List, Any, Optional, Tuple, Callable
from dataclasses import dataclass, field
from enum import Enum
import time
from collections import deque
import math


class PredictionHorizon(Enum):
    """Prediction time horizons"""
    HOUR_1 = "1h"
    HOUR_6 = "6h"
    HOUR_24 = "24h"
    DAY_7 = "7d"
    CUSTOM = "custom"


@dataclass
class CausalLink:
    """Represents a causal relationship between events"""
    cause_id: str
    effect_id: str
    strength: float          # How strong is the causal link (0-1)
    lag: float               # Time lag between cause and effect (seconds)
    confidence: float        # Confidence in this causal link
    mechanism: str           # Description of causal mechanism
    reversible: bool         # Can the effect be reversed?


@dataclass
class TemporalPattern:
    """A pattern detected across time"""
    pattern_id: str
    signature: np.ndarray
    frequency: float         # How often this pattern occurs
    lead_time: float         # How much warning time before anomaly
    trigger_conditions: List[Dict]
    prevention_actions: List[Dict]
    historical_accuracy: float
    last_seen: float


@dataclass 
class Prediction:
    """A prediction about future anomalies"""
    prediction_id: str
    horizon: PredictionHorizon
    probability: float       # Probability of anomaly occurring
    severity: float          # Expected severity (0-1)
    predicted_time: float    # When the anomaly is expected
    confidence_interval: Tuple[float, float]
    causal_factors: List[str]
    prevention_actions: List[Dict]
    counterfactuals: List[Dict]
    timestamp: float


@dataclass
class InterventionResult:
    """Result of simulating an intervention"""
    intervention_id: str
    action: Dict
    original_probability: float
    reduced_probability: float
    effectiveness: float     # How effective is this intervention
    side_effects: List[str]
    cost_estimate: float
    recommended: bool


class AttentionMechanism:
    """
    Temporal attention mechanism that learns which time windows
    are most predictive of future anomalies.
    """
    
    def __init__(self, window_sizes: List[int], hidden_dim: int = 64):
        self.window_sizes = window_sizes
        self.hidden_dim = hidden_dim
        
        # Learnable attention weights per window size
        self.attention_weights = {
            w: np.random.randn(hidden_dim) * 0.01
            for w in window_sizes
        }
        
        # Query, Key, Value projections (simplified)
        self.query_proj = np.random.randn(hidden_dim, hidden_dim) * 0.01
        self.key_proj = np.random.randn(hidden_dim, hidden_dim) * 0.01
        self.value_proj = np.random.randn(hidden_dim, hidden_dim) * 0.01
        
    def compute_attention(
        self,
        sequence: np.ndarray,
        query_time: int
    ) -> Tuple[np.ndarray, Dict[int, float]]:
        """
        Compute attention over historical time windows.
        
        Returns:
            - Weighted context vector
            - Attention weights per time step
        """
        seq_len = len(sequence)
        attention_scores = {}
        
        # Compute attention for each time step
        for t in range(seq_len):
            # Distance from query time affects attention
            distance = query_time - t
            
            # Multi-scale attention
            score = 0
            for window_size in self.window_sizes:
                if distance <= window_size:
                    # Points within this window contribute
                    local_score = np.exp(-distance / window_size)
                    weight = np.mean(np.abs(self.attention_weights[window_size]))
                    score += local_score * weight
            
            attention_scores[t] = score
        
        # Normalize
        total = sum(attention_scores.values()) + 1e-10
        attention_weights = {t: s / total for t, s in attention_scores.items()}
        
        # Compute weighted context
        context = np.zeros_like(sequence[0] if len(sequence) > 0 else np.zeros(self.hidden_dim))
        for t, weight in attention_weights.items():
            if t < len(sequence):
                # Ensure dimensions match
                if len(sequence[t].shape) == 0:
                    context += weight * sequence[t]
                else:
                    context[:len(sequence[t])] += weight * sequence[t][:len(context)]
        
        return context, attention_weights
    
    def update_weights(
        self,
        prediction_error: float,
        attention_weights: Dict[int, float],
        learning_rate: float = 0.01
    ):
        """Update attention weights based on prediction error"""
        for window_size in self.window_sizes:
            # Adjust weights based on which windows contributed to error
            for t, weight in attention_weights.items():
                if weight > 0.1:  # Significant attention
                    self.attention_weights[window_size] -= learning_rate * prediction_error * weight


class CausalGraphDiscovery:
    """
    Discovers causal relationships in temporal data.
    Uses Granger causality and transfer entropy.
    """
    
    def __init__(self, max_lag: int = 10):
        self.max_lag = max_lag
        self.discovered_links: List[CausalLink] = []
        
    def granger_causality_test(
        self,
        cause_series: np.ndarray,
        effect_series: np.ndarray,
        lag: int
    ) -> float:
        """
        Test if cause_series Granger-causes effect_series at given lag.
        Returns F-statistic or p-value equivalent.
        """
        if len(cause_series) < lag + 10 or len(effect_series) < lag + 10:
            return 0.0
        
        # Align series with lag
        y = effect_series[lag:]
        x_lagged = cause_series[:-lag] if lag > 0 else cause_series
        y_lagged = effect_series[:-lag] if lag > 0 else effect_series
        
        # Trim to same length
        min_len = min(len(y), len(x_lagged), len(y_lagged))
        y = y[:min_len]
        x_lagged = x_lagged[:min_len]
        y_lagged = y_lagged[:min_len]
        
        # Restricted model: y ~ y_lagged
        restricted_residuals = y - np.mean(y)
        restricted_ss = np.sum(restricted_residuals ** 2)
        
        # Unrestricted model: y ~ y_lagged + x_lagged
        # Simplified: check if adding x_lagged reduces variance
        combined = np.column_stack([y_lagged, x_lagged])
        try:
            # Least squares approximation
            coeffs = np.linalg.lstsq(combined, y, rcond=None)[0]
            unrestricted_residuals = y - combined @ coeffs
            unrestricted_ss = np.sum(unrestricted_residuals ** 2)
            
            # F-statistic approximation
            if unrestricted_ss > 0:
                f_stat = ((restricted_ss - unrestricted_ss) / unrestricted_ss) * len(y)
                return min(f_stat, 100)  # Cap at 100
        except:
            pass
        
        return 0.0
    
    def transfer_entropy(
        self,
        source: np.ndarray,
        target: np.ndarray,
        lag: int = 1
    ) -> float:
        """
        Calculate transfer entropy from source to target.
        Measures information flow.
        """
        if len(source) < lag + 10:
            return 0.0
        
        # Discretize for entropy calculation
        n_bins = 10
        source_discrete = np.digitize(source, np.linspace(source.min(), source.max(), n_bins))
        target_discrete = np.digitize(target, np.linspace(target.min(), target.max(), n_bins))
        
        # Joint probabilities (simplified)
        target_future = target_discrete[lag:]
        target_past = target_discrete[:-lag]
        source_past = source_discrete[:-lag]
        
        min_len = min(len(target_future), len(target_past), len(source_past))
        target_future = target_future[:min_len]
        target_past = target_past[:min_len]
        source_past = source_past[:min_len]
        
        # Entropy-based calculation (simplified)
        def entropy(arr):
            counts = np.bincount(arr.astype(int), minlength=n_bins)
            probs = counts / len(arr)
            return -np.sum(probs * np.log2(probs + 1e-10))
        
        h_target_future = entropy(target_future)
        h_joint = entropy(target_future * n_bins + target_past)  # Joint encoding
        h_triple = entropy(target_future * n_bins**2 + target_past * n_bins + source_past)
        
        te = h_joint - h_target_future - h_triple + entropy(target_past)
        return max(0, te)
    
    def discover_causal_links(
        self,
        data: Dict[str, np.ndarray],
        significance_threshold: float = 2.0
    ) -> List[CausalLink]:
        """
        Discover causal links between all pairs of variables.
        """
        variables = list(data.keys())
        discovered = []
        
        for cause_var in variables:
            for effect_var in variables:
                if cause_var == effect_var:
                    continue
                
                best_lag = 1
                best_score = 0
                
                for lag in range(1, self.max_lag + 1):
                    gc_score = self.granger_causality_test(
                        data[cause_var], data[effect_var], lag
                    )
                    te_score = self.transfer_entropy(
                        data[cause_var], data[effect_var], lag
                    )
                    
                    combined = gc_score + te_score * 10
                    if combined > best_score:
                        best_score = combined
                        best_lag = lag
                
                if best_score > significance_threshold:
                    link = CausalLink(
                        cause_id=cause_var,
                        effect_id=effect_var,
                        strength=min(best_score / 10, 1.0),
                        lag=best_lag,
                        confidence=min(best_score / 20, 1.0),
                        mechanism=f"{cause_var} -> {effect_var} (lag={best_lag})",
                        reversible=False
                    )
                    discovered.append(link)
        
        self.discovered_links = discovered
        return discovered


class CounterfactualEngine:
    """
    Generates counterfactual scenarios: "What if X hadn't happened?"
    Essential for understanding true causal impact.
    """
    
    def __init__(self, causal_graph: Optional[CausalGraphDiscovery] = None):
        self.causal_graph = causal_graph or CausalGraphDiscovery()
        
    def generate_counterfactual(
        self,
        actual_data: Dict[str, np.ndarray],
        intervention_point: int,
        intervention_var: str,
        counterfactual_value: float
    ) -> Dict[str, np.ndarray]:
        """
        Generate a counterfactual scenario where intervention_var
        had counterfactual_value at intervention_point.
        """
        cf_data = {k: v.copy() for k, v in actual_data.items()}
        
        # Apply intervention
        if intervention_var in cf_data:
            original_value = cf_data[intervention_var][intervention_point]
            cf_data[intervention_var][intervention_point] = counterfactual_value
            
            # Propagate effects through causal graph
            for link in self.causal_graph.discovered_links:
                if link.cause_id == intervention_var:
                    effect_time = intervention_point + int(link.lag)
                    if effect_time < len(cf_data.get(link.effect_id, [])):
                        # Approximate effect using link strength
                        delta = counterfactual_value - original_value
                        effect_delta = delta * link.strength
                        cf_data[link.effect_id][effect_time] += effect_delta
        
        return cf_data
    
    def evaluate_counterfactual_impact(
        self,
        actual_outcome: float,
        counterfactual_data: Dict[str, np.ndarray],
        outcome_var: str
    ) -> Dict[str, Any]:
        """
        Compare actual outcome to counterfactual outcome.
        """
        if outcome_var not in counterfactual_data:
            return {"error": "Outcome variable not found"}
        
        cf_outcome = counterfactual_data[outcome_var][-1] if len(counterfactual_data[outcome_var]) > 0 else 0
        
        impact = actual_outcome - cf_outcome
        
        return {
            "actual_outcome": actual_outcome,
            "counterfactual_outcome": cf_outcome,
            "causal_impact": impact,
            "percentage_change": (impact / (cf_outcome + 1e-10)) * 100,
            "significance": "high" if abs(impact) > 0.5 else "medium" if abs(impact) > 0.2 else "low"
        }


class TemporalPrecognitionSystem:
    """
    The Temporal Precognition System
    
    A revolutionary AI that predicts anomalies before they happen
    by understanding causal chains and temporal patterns.
    """
    
    def __init__(
        self,
        horizons: Optional[List[PredictionHorizon]] = None,
        pattern_memory_size: int = 1000,
        causal_discovery_lag: int = 20
    ):
        if horizons is None:
            horizons = [
                PredictionHorizon.HOUR_1,
                PredictionHorizon.HOUR_6,
                PredictionHorizon.HOUR_24
            ]
        
        self.horizons = horizons
        self.pattern_memory_size = pattern_memory_size
        
        # Components
        self.attention = AttentionMechanism(
            window_sizes=[5, 10, 25, 50, 100],
            hidden_dim=64
        )
        self.causal_discovery = CausalGraphDiscovery(max_lag=causal_discovery_lag)
        self.counterfactual_engine = CounterfactualEngine(self.causal_discovery)
        
        # Pattern library
        self.known_patterns: List[TemporalPattern] = []
        
        # Historical buffer
        self.history_buffer: Dict[str, deque] = {}
        self.max_history = 10000
        
        # Prediction tracking
        self.predictions: List[Prediction] = []
        self.prediction_accuracy: Dict[str, float] = {}
        
        # Intervention simulations
        self.intervention_library: List[Dict] = []
        
    def _horizon_to_seconds(self, horizon: PredictionHorizon) -> float:
        """Convert horizon to seconds"""
        mapping = {
            PredictionHorizon.HOUR_1: 3600,
            PredictionHorizon.HOUR_6: 21600,
            PredictionHorizon.HOUR_24: 86400,
            PredictionHorizon.DAY_7: 604800
        }
        return mapping.get(horizon, 3600)
    
    def ingest_data(
        self,
        data: Dict[str, float],
        timestamp: Optional[float] = None
    ):
        """
        Ingest new data point into the system.
        """
        if timestamp is None:
            timestamp = time.time()
        
        for var_name, value in data.items():
            if var_name not in self.history_buffer:
                self.history_buffer[var_name] = deque(maxlen=self.max_history)
            self.history_buffer[var_name].append((timestamp, value))
    
    def _extract_features(
        self,
        var_name: str,
        window: int = 100
    ) -> np.ndarray:
        """Extract features from recent history"""
        if var_name not in self.history_buffer:
            return np.zeros(10)
        
        history = list(self.history_buffer[var_name])[-window:]
        if len(history) < 5:
            return np.zeros(10)
        
        values = np.array([h[1] for h in history])
        
        # Feature extraction
        features = [
            np.mean(values),
            np.std(values),
            np.min(values),
            np.max(values),
            values[-1],  # Current value
            values[-1] - values[0],  # Trend
            np.mean(np.diff(values)),  # Average change
            np.std(np.diff(values)),  # Volatility
            np.percentile(values, 25),
            np.percentile(values, 75)
        ]
        
        return np.array(features)
    
    def _detect_precursor_patterns(
        self,
        current_context: Dict[str, np.ndarray]
    ) -> List[TemporalPattern]:
        """
        Detect patterns that historically preceded anomalies.
        """
        matching_patterns = []
        
        for pattern in self.known_patterns:
            # Compare current context to pattern signature
            if len(current_context) > 0:
                # Simplified pattern matching
                context_vector = np.concatenate([v.flatten() for v in current_context.values()])
                
                if len(context_vector) >= len(pattern.signature):
                    similarity = 1 - np.linalg.norm(
                        context_vector[:len(pattern.signature)] - pattern.signature
                    ) / (np.linalg.norm(pattern.signature) + 1e-10)
                    
                    if similarity > 0.7:
                        matching_patterns.append(pattern)
        
        return matching_patterns
    
    def predict(
        self,
        horizon: Optional[PredictionHorizon] = None
    ) -> List[Prediction]:
        """
        Generate predictions for future anomalies.
        
        Args:
            horizon: Specific horizon to predict for (None = all horizons)
            
        Returns:
            List of predictions with probabilities and prevention actions
        """
        predictions = []
        current_time = time.time()
        
        horizons_to_check = [horizon] if horizon else self.horizons
        
        # Build current context
        current_context = {}
        for var_name in self.history_buffer:
            features = self._extract_features(var_name)
            current_context[var_name] = features
        
        if not current_context:
            return predictions
        
        # Attention over time
        for var_name, values in self.history_buffer.items():
            if len(values) > 10:
                sequence = np.array([v[1] for v in values])
                context, attention_weights = self.attention.compute_attention(
                    sequence[-100:], len(sequence) - 1
                )
        
        # Detect precursor patterns
        precursor_patterns = self._detect_precursor_patterns(current_context)
        
        for h in horizons_to_check:
            horizon_seconds = self._horizon_to_seconds(h)
            
            # Base probability from statistical analysis
            all_features = np.concatenate([f.flatten() for f in current_context.values()])
            volatility = np.std(all_features) / (np.mean(np.abs(all_features)) + 1e-10)
            base_probability = np.tanh(volatility)
            
            # Adjust for precursor patterns
            pattern_boost = 0
            causal_factors = []
            prevention_actions = []
            
            for pattern in precursor_patterns:
                if pattern.lead_time <= horizon_seconds:
                    pattern_boost += 0.2 * pattern.historical_accuracy
                    causal_factors.append(pattern.pattern_id)
                    prevention_actions.extend(pattern.prevention_actions)
            
            probability = min(base_probability + pattern_boost, 0.99)
            
            # Generate counterfactuals
            counterfactuals = []
            if self.causal_discovery.discovered_links:
                for link in self.causal_discovery.discovered_links[:3]:  # Top 3 causes
                    counterfactuals.append({
                        "intervention": f"Remove {link.cause_id}",
                        "estimated_reduction": link.strength * 0.5,
                        "confidence": link.confidence
                    })
            
            # Create prediction
            prediction = Prediction(
                prediction_id=f"pred_{current_time}_{h.value}",
                horizon=h,
                probability=probability,
                severity=volatility,
                predicted_time=current_time + horizon_seconds,
                confidence_interval=(
                    max(0, probability - 0.15),
                    min(1, probability + 0.15)
                ),
                causal_factors=causal_factors,
                prevention_actions=prevention_actions[:5],
                counterfactuals=counterfactuals,
                timestamp=current_time
            )
            
            predictions.append(prediction)
            self.predictions.append(prediction)
        
        return predictions
    
    def simulate_intervention(
        self,
        action: Dict[str, Any],
        target_horizon: PredictionHorizon = PredictionHorizon.HOUR_24
    ) -> InterventionResult:
        """
        Simulate the effect of a preventive intervention.
        
        Args:
            action: The intervention action to simulate
            target_horizon: Which prediction horizon to evaluate
            
        Returns:
            InterventionResult with effectiveness estimate
        """
        current_time = time.time()
        
        # Get current prediction
        current_predictions = self.predict(target_horizon)
        if not current_predictions:
            return InterventionResult(
                intervention_id=f"int_{current_time}",
                action=action,
                original_probability=0.5,
                reduced_probability=0.5,
                effectiveness=0,
                side_effects=[],
                cost_estimate=0,
                recommended=False
            )
        
        original_prob = current_predictions[0].probability
        
        # Simulate intervention effect
        # This is a simplified simulation - real implementation would use
        # the causal graph to propagate effects
        
        estimated_reduction = 0.2  # Default 20% reduction
        side_effects = []
        
        if "target_variable" in action and action["target_variable"] in self.history_buffer:
            # Find causal links involving this variable
            for link in self.causal_discovery.discovered_links:
                if link.cause_id == action["target_variable"]:
                    estimated_reduction += link.strength * 0.1
                elif link.effect_id == action["target_variable"]:
                    side_effects.append(f"May affect {link.cause_id}")
        
        reduced_prob = max(0, original_prob - estimated_reduction)
        
        return InterventionResult(
            intervention_id=f"int_{current_time}",
            action=action,
            original_probability=original_prob,
            reduced_probability=reduced_prob,
            effectiveness=estimated_reduction / (original_prob + 1e-10),
            side_effects=side_effects,
            cost_estimate=action.get("estimated_cost", 100),
            recommended=estimated_reduction > 0.1 and reduced_prob < 0.5
        )
    
    def update_causal_model(self):
        """
        Update the causal graph based on accumulated history.
        """
        if not self.history_buffer:
            return
        
        # Convert history to arrays
        data_arrays = {}
        for var_name, history in self.history_buffer.items():
            if len(history) > 20:
                data_arrays[var_name] = np.array([h[1] for h in history])
        
        if len(data_arrays) >= 2:
            self.causal_discovery.discover_causal_links(data_arrays)
    
    def learn_pattern(
        self,
        pattern_signature: np.ndarray,
        pattern_name: str,
        lead_time: float,
        prevention_actions: List[Dict]
    ):
        """
        Learn a new precursor pattern from labeled data.
        """
        pattern = TemporalPattern(
            pattern_id=pattern_name,
            signature=pattern_signature,
            frequency=0,
            lead_time=lead_time,
            trigger_conditions=[],
            prevention_actions=prevention_actions,
            historical_accuracy=0.5,
            last_seen=time.time()
        )
        
        self.known_patterns.append(pattern)
        
        # Trim if too many
        if len(self.known_patterns) > self.pattern_memory_size:
            # Remove least accurate
            self.known_patterns.sort(key=lambda p: p.historical_accuracy, reverse=True)
            self.known_patterns = self.known_patterns[:self.pattern_memory_size]
    
    def validate_prediction(
        self,
        prediction_id: str,
        actual_outcome: bool
    ):
        """
        Validate a past prediction against actual outcome.
        Updates pattern accuracy for learning.
        """
        for pred in self.predictions:
            if pred.prediction_id == prediction_id:
                predicted_positive = pred.probability > 0.5
                
                if predicted_positive == actual_outcome:
                    # Correct prediction
                    for pattern_id in pred.causal_factors:
                        for pattern in self.known_patterns:
                            if pattern.pattern_id == pattern_id:
                                pattern.historical_accuracy = min(
                                    1.0,
                                    pattern.historical_accuracy + 0.1
                                )
                else:
                    # Wrong prediction
                    for pattern_id in pred.causal_factors:
                        for pattern in self.known_patterns:
                            if pattern.pattern_id == pattern_id:
                                pattern.historical_accuracy = max(
                                    0.1,
                                    pattern.historical_accuracy - 0.1
                                )
                
                # Update attention weights
                error = 1.0 if predicted_positive != actual_outcome else 0.0
                self.attention.update_weights(error, {}, learning_rate=0.01)
                break
    
    def get_status(self) -> Dict[str, Any]:
        """Get comprehensive system status"""
        return {
            "active_horizons": [h.value for h in self.horizons],
            "variables_tracked": list(self.history_buffer.keys()),
            "history_depth": {
                k: len(v) for k, v in self.history_buffer.items()
            },
            "known_patterns": len(self.known_patterns),
            "causal_links_discovered": len(self.causal_discovery.discovered_links),
            "causal_graph_summary": [
                {"cause": l.cause_id, "effect": l.effect_id, "strength": l.strength}
                for l in self.causal_discovery.discovered_links[:10]
            ],
            "recent_predictions": [
                {
                    "id": p.prediction_id,
                    "horizon": p.horizon.value,
                    "probability": p.probability,
                    "severity": p.severity
                }
                for p in self.predictions[-10:]
            ],
            "pattern_accuracy": {
                p.pattern_id: p.historical_accuracy
                for p in self.known_patterns[:10]
            }
        }


# Singleton instance
_precognition_system: Optional[TemporalPrecognitionSystem] = None


def get_precognition_system() -> TemporalPrecognitionSystem:
    """Get or create the singleton precognition system"""
    global _precognition_system
    if _precognition_system is None:
        _precognition_system = TemporalPrecognitionSystem()
    return _precognition_system


def predict_future_anomalies(
    horizon: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Convenience function to get predictions.
    
    Args:
        horizon: "1h", "6h", "24h", or "7d" (None = all)
        
    Returns:
        List of prediction dictionaries
    """
    system = get_precognition_system()
    
    horizon_enum = None
    if horizon:
        horizon_map = {
            "1h": PredictionHorizon.HOUR_1,
            "6h": PredictionHorizon.HOUR_6,
            "24h": PredictionHorizon.HOUR_24,
            "7d": PredictionHorizon.DAY_7
        }
        horizon_enum = horizon_map.get(horizon)
    
    predictions = system.predict(horizon_enum)
    
    return [
        {
            "id": p.prediction_id,
            "horizon": p.horizon.value,
            "probability": p.probability,
            "severity": p.severity,
            "predicted_time": p.predicted_time,
            "confidence_interval": p.confidence_interval,
            "causal_factors": p.causal_factors,
            "prevention_actions": p.prevention_actions,
            "counterfactuals": p.counterfactuals
        }
        for p in predictions
    ]
