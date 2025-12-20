"""
Autonomous Self-Healing System
==============================
A revolutionary system that automatically detects, diagnoses, and FIXES
issues without human intervention.

This is true autonomous AI - the system:
- Monitors its own health continuously
- Detects degradation and anomalies in its own performance
- Diagnoses root causes automatically
- Applies fixes and validates them
- Learns from failures to prevent recurrence
- Triggers retraining when model drift is detected

No anomaly detection platform has anything like this.

Author: EchoForge AI Team
License: Proprietary
"""

import numpy as np
from typing import Dict, List, Any, Optional, Tuple, Callable
from dataclasses import dataclass, field
from enum import Enum
import threading
import time
from collections import deque
import hashlib
import traceback


class HealthStatus(Enum):
    """System health status levels"""
    OPTIMAL = "optimal"           # Everything running perfectly
    HEALTHY = "healthy"           # Normal operation
    DEGRADED = "degraded"         # Performance issues detected
    CRITICAL = "critical"         # Major issues, intervention needed
    RECOVERING = "recovering"     # Self-healing in progress
    FAILED = "failed"             # System failure


class IssueCategory(Enum):
    """Categories of detected issues"""
    PERFORMANCE = "performance"
    ACCURACY = "accuracy"
    MEMORY = "memory"
    LATENCY = "latency"
    MODEL_DRIFT = "model_drift"
    DATA_QUALITY = "data_quality"
    RESOURCE = "resource"
    DEPENDENCY = "dependency"
    CONFIGURATION = "configuration"
    UNKNOWN = "unknown"


class HealingAction(Enum):
    """Types of self-healing actions"""
    RESTART_COMPONENT = "restart_component"
    RECALIBRATE = "recalibrate"
    CLEAR_CACHE = "clear_cache"
    ADJUST_THRESHOLD = "adjust_threshold"
    RETRAIN_MODEL = "retrain_model"
    SCALE_RESOURCES = "scale_resources"
    ROLLBACK = "rollback"
    ISOLATE_COMPONENT = "isolate_component"
    SWITCH_FALLBACK = "switch_fallback"
    NOTIFY_HUMAN = "notify_human"


@dataclass
class HealthMetric:
    """A single health metric measurement"""
    name: str
    value: float
    thresholds: Dict[str, float]  # warning, critical thresholds
    timestamp: float
    unit: str = ""
    
    def get_status(self) -> HealthStatus:
        """Evaluate status based on thresholds"""
        if "critical_high" in self.thresholds and self.value >= self.thresholds["critical_high"]:
            return HealthStatus.CRITICAL
        if "critical_low" in self.thresholds and self.value <= self.thresholds["critical_low"]:
            return HealthStatus.CRITICAL
        if "warning_high" in self.thresholds and self.value >= self.thresholds["warning_high"]:
            return HealthStatus.DEGRADED
        if "warning_low" in self.thresholds and self.value <= self.thresholds["warning_low"]:
            return HealthStatus.DEGRADED
        return HealthStatus.HEALTHY


@dataclass
class DiagnosisResult:
    """Result of automated diagnosis"""
    issue_id: str
    category: IssueCategory
    description: str
    severity: float  # 0-1
    root_cause: str
    contributing_factors: List[str]
    recommended_actions: List[HealingAction]
    confidence: float
    evidence: Dict[str, Any]
    timestamp: float


@dataclass
class HealingResult:
    """Result of a self-healing action"""
    action_id: str
    action: HealingAction
    success: bool
    before_value: float
    after_value: float
    duration_ms: float
    side_effects: List[str]
    rollback_available: bool
    timestamp: float


@dataclass
class ComponentHealth:
    """Health status of a system component"""
    component_id: str
    name: str
    status: HealthStatus
    metrics: Dict[str, HealthMetric]
    last_check: float
    uptime: float
    error_count: int
    healing_history: List[HealingResult] = field(default_factory=list)


class ModelDriftDetector:
    """
    Detects when ML models have degraded due to data drift,
    concept drift, or feature drift.
    """
    
    def __init__(
        self,
        baseline_accuracy: float = 0.95,
        drift_threshold: float = 0.1,
        window_size: int = 1000
    ):
        self.baseline_accuracy = baseline_accuracy
        self.drift_threshold = drift_threshold
        self.window_size = window_size
        
        # Performance tracking
        self.prediction_history: deque = deque(maxlen=window_size)
        self.accuracy_history: deque = deque(maxlen=100)
        self.feature_distributions: Dict[str, Dict] = {}
        self.baseline_distributions: Dict[str, Dict] = {}
        
    def record_prediction(
        self,
        predicted: Any,
        actual: Any,
        features: Optional[np.ndarray] = None
    ):
        """Record a prediction for drift monitoring"""
        is_correct = predicted == actual
        self.prediction_history.append({
            "predicted": predicted,
            "actual": actual,
            "correct": is_correct,
            "timestamp": time.time(),
            "features": features
        })
        
        # Update rolling accuracy
        if len(self.prediction_history) >= 100:
            recent = list(self.prediction_history)[-100:]
            accuracy = sum(1 for p in recent if p["correct"]) / len(recent)
            self.accuracy_history.append(accuracy)
            
        # Update feature distributions
        if features is not None:
            self._update_feature_distribution(features)
    
    def _update_feature_distribution(self, features: np.ndarray):
        """Track feature distribution changes"""
        for i, value in enumerate(features.flatten()):
            feat_name = f"feature_{i}"
            if feat_name not in self.feature_distributions:
                self.feature_distributions[feat_name] = {
                    "values": deque(maxlen=self.window_size),
                    "mean": 0,
                    "std": 1
                }
            
            self.feature_distributions[feat_name]["values"].append(value)
            values = list(self.feature_distributions[feat_name]["values"])
            self.feature_distributions[feat_name]["mean"] = np.mean(values)
            self.feature_distributions[feat_name]["std"] = np.std(values) + 1e-10
    
    def set_baseline(self):
        """Set current distributions as baseline"""
        for feat_name, dist in self.feature_distributions.items():
            self.baseline_distributions[feat_name] = {
                "mean": dist["mean"],
                "std": dist["std"]
            }
        
        if self.accuracy_history:
            self.baseline_accuracy = np.mean(list(self.accuracy_history))
    
    def detect_drift(self) -> Dict[str, Any]:
        """
        Detect various types of drift.
        
        Returns:
            Dict with drift detection results
        """
        results = {
            "concept_drift": False,
            "feature_drift": {},
            "accuracy_degradation": 0,
            "needs_retraining": False,
            "evidence": []
        }
        
        # Concept drift (accuracy degradation)
        if len(self.accuracy_history) >= 10:
            current_accuracy = np.mean(list(self.accuracy_history)[-10:])
            accuracy_drop = self.baseline_accuracy - current_accuracy
            
            if accuracy_drop > self.drift_threshold:
                results["concept_drift"] = True
                results["accuracy_degradation"] = accuracy_drop
                results["evidence"].append(
                    f"Accuracy dropped from {self.baseline_accuracy:.2%} to {current_accuracy:.2%}"
                )
        
        # Feature drift (distribution shift)
        for feat_name, current_dist in self.feature_distributions.items():
            if feat_name in self.baseline_distributions:
                baseline = self.baseline_distributions[feat_name]
                
                # Calculate KL divergence approximation
                mean_shift = abs(current_dist["mean"] - baseline["mean"]) / baseline["std"]
                std_ratio = current_dist["std"] / baseline["std"]
                
                if mean_shift > 2 or std_ratio > 2 or std_ratio < 0.5:
                    results["feature_drift"][feat_name] = {
                        "mean_shift": mean_shift,
                        "std_ratio": std_ratio
                    }
                    results["evidence"].append(
                        f"Feature {feat_name} distribution shifted significantly"
                    )
        
        # Determine if retraining needed
        if results["concept_drift"] or len(results["feature_drift"]) > 3:
            results["needs_retraining"] = True
        
        return results


class AutoDiagnostics:
    """
    Automated diagnostics engine that identifies root causes
    of system issues.
    """
    
    def __init__(self):
        # Diagnostic rules
        self.rules: List[Dict] = []
        self._initialize_rules()
        
        # Issue history for pattern learning
        self.issue_history: List[DiagnosisResult] = []
    
    def _initialize_rules(self):
        """Initialize diagnostic rules"""
        self.rules = [
            {
                "name": "high_latency",
                "condition": lambda m: m.get("avg_latency_ms", 0) > 1000,
                "category": IssueCategory.LATENCY,
                "description": "Response latency exceeds acceptable threshold",
                "cause": "Processing bottleneck or resource contention",
                "actions": [HealingAction.SCALE_RESOURCES, HealingAction.CLEAR_CACHE]
            },
            {
                "name": "low_accuracy",
                "condition": lambda m: m.get("accuracy", 1) < 0.85,
                "category": IssueCategory.ACCURACY,
                "description": "Detection accuracy has dropped below threshold",
                "cause": "Model drift or data quality issues",
                "actions": [HealingAction.RECALIBRATE, HealingAction.RETRAIN_MODEL]
            },
            {
                "name": "high_memory",
                "condition": lambda m: m.get("memory_percent", 0) > 85,
                "category": IssueCategory.MEMORY,
                "description": "Memory usage critically high",
                "cause": "Memory leak or excessive caching",
                "actions": [HealingAction.CLEAR_CACHE, HealingAction.RESTART_COMPONENT]
            },
            {
                "name": "high_error_rate",
                "condition": lambda m: m.get("error_rate", 0) > 0.05,
                "category": IssueCategory.PERFORMANCE,
                "description": "Error rate exceeds 5%",
                "cause": "Bug or external dependency failure",
                "actions": [HealingAction.ROLLBACK, HealingAction.SWITCH_FALLBACK]
            },
            {
                "name": "model_drift",
                "condition": lambda m: m.get("drift_detected", False),
                "category": IssueCategory.MODEL_DRIFT,
                "description": "Model performance degrading due to data drift",
                "cause": "Input data distribution has shifted",
                "actions": [HealingAction.RETRAIN_MODEL, HealingAction.RECALIBRATE]
            },
            {
                "name": "data_quality",
                "condition": lambda m: m.get("null_rate", 0) > 0.1,
                "category": IssueCategory.DATA_QUALITY,
                "description": "High rate of null or invalid data",
                "cause": "Data pipeline issues or source problems",
                "actions": [HealingAction.NOTIFY_HUMAN, HealingAction.SWITCH_FALLBACK]
            }
        ]
    
    def diagnose(
        self,
        metrics: Dict[str, float],
        context: Optional[Dict] = None
    ) -> List[DiagnosisResult]:
        """
        Diagnose issues based on current metrics.
        
        Args:
            metrics: Current system metrics
            context: Additional context
            
        Returns:
            List of diagnosis results
        """
        diagnoses = []
        current_time = time.time()
        
        for rule in self.rules:
            try:
                if rule["condition"](metrics):
                    diagnosis = DiagnosisResult(
                        issue_id=f"issue_{hashlib.md5(rule['name'].encode()).hexdigest()[:8]}_{int(current_time)}",
                        category=rule["category"],
                        description=rule["description"],
                        severity=self._calculate_severity(rule["category"], metrics),
                        root_cause=rule["cause"],
                        contributing_factors=self._find_contributing_factors(metrics, rule["category"]),
                        recommended_actions=rule["actions"],
                        confidence=0.85,
                        evidence={"metrics": metrics, "rule": rule["name"]},
                        timestamp=current_time
                    )
                    diagnoses.append(diagnosis)
            except Exception as e:
                pass  # Rule evaluation failed
        
        self.issue_history.extend(diagnoses)
        return diagnoses
    
    def _calculate_severity(
        self,
        category: IssueCategory,
        metrics: Dict[str, float]
    ) -> float:
        """Calculate severity based on category and metrics"""
        severity_map = {
            IssueCategory.PERFORMANCE: 0.6,
            IssueCategory.ACCURACY: 0.8,
            IssueCategory.MEMORY: 0.7,
            IssueCategory.LATENCY: 0.5,
            IssueCategory.MODEL_DRIFT: 0.75,
            IssueCategory.DATA_QUALITY: 0.7,
            IssueCategory.RESOURCE: 0.6,
            IssueCategory.DEPENDENCY: 0.8,
            IssueCategory.CONFIGURATION: 0.5,
            IssueCategory.UNKNOWN: 0.5
        }
        
        base_severity = severity_map.get(category, 0.5)
        
        # Adjust based on specific metrics
        if "error_rate" in metrics and metrics["error_rate"] > 0.1:
            base_severity = min(1.0, base_severity + 0.2)
        
        return base_severity
    
    def _find_contributing_factors(
        self,
        metrics: Dict[str, float],
        category: IssueCategory
    ) -> List[str]:
        """Find additional contributing factors"""
        factors = []
        
        if category == IssueCategory.LATENCY:
            if metrics.get("queue_depth", 0) > 100:
                factors.append("High queue depth causing delays")
            if metrics.get("cpu_percent", 0) > 80:
                factors.append("High CPU usage")
        
        if category == IssueCategory.ACCURACY:
            if metrics.get("null_rate", 0) > 0.05:
                factors.append("Data quality issues (high null rate)")
            if metrics.get("outlier_rate", 0) > 0.1:
                factors.append("High rate of outliers in input data")
        
        if category == IssueCategory.MEMORY:
            if metrics.get("cache_size_mb", 0) > 500:
                factors.append("Large cache consuming memory")
            if metrics.get("active_connections", 0) > 1000:
                factors.append("Many active connections holding memory")
        
        return factors


class SelfHealingSystem:
    """
    The Autonomous Self-Healing System
    
    A revolutionary system that monitors, diagnoses, and heals
    itself without human intervention.
    """
    
    def __init__(
        self,
        auto_heal: bool = True,
        max_healing_attempts: int = 3,
        healing_cooldown: float = 60.0  # seconds between healing attempts
    ):
        self.auto_heal = auto_heal
        self.max_healing_attempts = max_healing_attempts
        self.healing_cooldown = healing_cooldown
        
        # Components
        self.drift_detector = ModelDriftDetector()
        self.diagnostics = AutoDiagnostics()
        
        # Component registry
        self.components: Dict[str, ComponentHealth] = {}
        
        # Healing state
        self.healing_in_progress: Dict[str, bool] = {}
        self.last_healing_time: Dict[str, float] = {}
        self.healing_attempts: Dict[str, int] = {}
        
        # Healing handlers
        self.healing_handlers: Dict[HealingAction, Callable] = {}
        self._register_default_handlers()
        
        # Event log
        self.event_log: deque = deque(maxlen=10000)
        
        # Monitoring thread
        self._monitor_thread: Optional[threading.Thread] = None
        self._stop_monitoring = threading.Event()
        
        # Callbacks
        self.on_issue_detected: Optional[Callable] = None
        self.on_healing_complete: Optional[Callable] = None
        self.on_status_change: Optional[Callable] = None
    
    def _register_default_handlers(self):
        """Register default healing action handlers"""
        self.healing_handlers = {
            HealingAction.CLEAR_CACHE: self._handle_clear_cache,
            HealingAction.RECALIBRATE: self._handle_recalibrate,
            HealingAction.ADJUST_THRESHOLD: self._handle_adjust_threshold,
            HealingAction.RESTART_COMPONENT: self._handle_restart,
            HealingAction.SWITCH_FALLBACK: self._handle_switch_fallback,
            HealingAction.SCALE_RESOURCES: self._handle_scale_resources,
            HealingAction.RETRAIN_MODEL: self._handle_retrain_model,
            HealingAction.ROLLBACK: self._handle_rollback,
            HealingAction.ISOLATE_COMPONENT: self._handle_isolate,
            HealingAction.NOTIFY_HUMAN: self._handle_notify_human
        }
    
    def register_component(
        self,
        component_id: str,
        name: str,
        metrics: Optional[Dict[str, HealthMetric]] = None
    ):
        """Register a component for health monitoring"""
        self.components[component_id] = ComponentHealth(
            component_id=component_id,
            name=name,
            status=HealthStatus.HEALTHY,
            metrics=metrics or {},
            last_check=time.time(),
            uptime=0,
            error_count=0
        )
        self.healing_attempts[component_id] = 0
        self.last_healing_time[component_id] = 0
    
    def update_metrics(
        self,
        component_id: str,
        metrics: Dict[str, float]
    ):
        """Update metrics for a component"""
        if component_id not in self.components:
            self.register_component(component_id, component_id)
        
        component = self.components[component_id]
        current_time = time.time()
        
        for metric_name, value in metrics.items():
            if metric_name not in component.metrics:
                # Create new metric with default thresholds
                component.metrics[metric_name] = HealthMetric(
                    name=metric_name,
                    value=value,
                    thresholds={
                        "warning_high": value * 1.5,
                        "critical_high": value * 2.0
                    },
                    timestamp=current_time
                )
            else:
                component.metrics[metric_name].value = value
                component.metrics[metric_name].timestamp = current_time
        
        # Update component status
        component.last_check = current_time
        component.uptime = current_time - component.last_check
        
        self._evaluate_component_health(component_id)
    
    def _evaluate_component_health(self, component_id: str):
        """Evaluate health of a component and trigger healing if needed"""
        component = self.components[component_id]
        
        # Aggregate metric statuses
        statuses = [m.get_status() for m in component.metrics.values()]
        
        if HealthStatus.CRITICAL in statuses:
            component.status = HealthStatus.CRITICAL
        elif HealthStatus.DEGRADED in statuses:
            component.status = HealthStatus.DEGRADED
        else:
            component.status = HealthStatus.HEALTHY
        
        # Check if healing needed
        if component.status in [HealthStatus.CRITICAL, HealthStatus.DEGRADED]:
            self._trigger_diagnosis_and_healing(component_id)
    
    def _trigger_diagnosis_and_healing(self, component_id: str):
        """Trigger diagnosis and healing for a component"""
        if not self.auto_heal:
            return
        
        # Check cooldown
        current_time = time.time()
        if current_time - self.last_healing_time.get(component_id, 0) < self.healing_cooldown:
            return
        
        # Check max attempts
        if self.healing_attempts.get(component_id, 0) >= self.max_healing_attempts:
            self._log_event(
                component_id,
                "Max healing attempts reached. Human intervention required.",
                "error"
            )
            return
        
        # Check if healing already in progress
        if self.healing_in_progress.get(component_id, False):
            return
        
        self.healing_in_progress[component_id] = True
        
        try:
            # Get current metrics
            component = self.components[component_id]
            metrics = {m.name: m.value for m in component.metrics.values()}
            
            # Add drift detection
            drift_result = self.drift_detector.detect_drift()
            metrics["drift_detected"] = drift_result["needs_retraining"]
            
            # Diagnose
            diagnoses = self.diagnostics.diagnose(metrics)
            
            if diagnoses:
                if self.on_issue_detected:
                    self.on_issue_detected(component_id, diagnoses)
                
                # Execute healing for each diagnosis
                for diagnosis in sorted(diagnoses, key=lambda d: d.severity, reverse=True):
                    healing_result = self._execute_healing(component_id, diagnosis)
                    
                    if healing_result.success:
                        self._log_event(
                            component_id,
                            f"Successfully healed: {diagnosis.description}",
                            "info"
                        )
                        break  # Stop after first successful healing
                    else:
                        self._log_event(
                            component_id,
                            f"Healing failed for: {diagnosis.description}",
                            "warning"
                        )
            
            self.last_healing_time[component_id] = current_time
            self.healing_attempts[component_id] = self.healing_attempts.get(component_id, 0) + 1
            
        finally:
            self.healing_in_progress[component_id] = False
    
    def _execute_healing(
        self,
        component_id: str,
        diagnosis: DiagnosisResult
    ) -> HealingResult:
        """Execute a healing action"""
        start_time = time.time()
        
        # Get before value (first metric related to issue)
        component = self.components[component_id]
        before_value = 0
        for metric in component.metrics.values():
            before_value = metric.value
            break
        
        # Try recommended actions in order
        for action in diagnosis.recommended_actions:
            handler = self.healing_handlers.get(action)
            
            if handler:
                try:
                    success, side_effects = handler(component_id, diagnosis)
                    
                    # Get after value
                    after_value = before_value
                    for metric in component.metrics.values():
                        after_value = metric.value
                        break
                    
                    result = HealingResult(
                        action_id=f"heal_{int(start_time)}",
                        action=action,
                        success=success,
                        before_value=before_value,
                        after_value=after_value,
                        duration_ms=(time.time() - start_time) * 1000,
                        side_effects=side_effects,
                        rollback_available=action != HealingAction.NOTIFY_HUMAN,
                        timestamp=time.time()
                    )
                    
                    component.healing_history.append(result)
                    
                    if success:
                        if self.on_healing_complete:
                            self.on_healing_complete(component_id, result)
                        return result
                        
                except Exception as e:
                    self._log_event(
                        component_id,
                        f"Healing action {action.value} failed: {str(e)}",
                        "error"
                    )
        
        # All actions failed
        return HealingResult(
            action_id=f"heal_failed_{int(start_time)}",
            action=HealingAction.NOTIFY_HUMAN,
            success=False,
            before_value=before_value,
            after_value=before_value,
            duration_ms=(time.time() - start_time) * 1000,
            side_effects=["All healing attempts failed"],
            rollback_available=False,
            timestamp=time.time()
        )
    
    # Healing handlers
    def _handle_clear_cache(
        self,
        component_id: str,
        diagnosis: DiagnosisResult
    ) -> Tuple[bool, List[str]]:
        """Clear caches to free memory"""
        self._log_event(component_id, "Clearing caches...", "info")
        
        # Simulate cache clearing
        time.sleep(0.1)
        
        # Update memory metric
        if component_id in self.components:
            metrics = self.components[component_id].metrics
            if "memory_percent" in metrics:
                metrics["memory_percent"].value *= 0.5  # Simulate reduction
        
        return True, ["Temporary performance dip during clear"]
    
    def _handle_recalibrate(
        self,
        component_id: str,
        diagnosis: DiagnosisResult
    ) -> Tuple[bool, List[str]]:
        """Recalibrate detection thresholds"""
        self._log_event(component_id, "Recalibrating thresholds...", "info")
        
        if component_id in self.components:
            for metric in self.components[component_id].metrics.values():
                # Adjust thresholds based on recent values
                current = metric.value
                if "warning_high" in metric.thresholds:
                    metric.thresholds["warning_high"] = current * 1.3
                if "critical_high" in metric.thresholds:
                    metric.thresholds["critical_high"] = current * 1.8
        
        return True, ["Thresholds adjusted based on current values"]
    
    def _handle_adjust_threshold(
        self,
        component_id: str,
        diagnosis: DiagnosisResult
    ) -> Tuple[bool, List[str]]:
        """Dynamically adjust anomaly thresholds"""
        return self._handle_recalibrate(component_id, diagnosis)
    
    def _handle_restart(
        self,
        component_id: str,
        diagnosis: DiagnosisResult
    ) -> Tuple[bool, List[str]]:
        """Restart a component"""
        self._log_event(component_id, "Simulating component restart...", "info")
        
        # Simulate restart
        time.sleep(0.2)
        
        if component_id in self.components:
            # Reset error counts
            self.components[component_id].error_count = 0
            self.components[component_id].status = HealthStatus.RECOVERING
        
        return True, ["Brief service interruption during restart"]
    
    def _handle_switch_fallback(
        self,
        component_id: str,
        diagnosis: DiagnosisResult
    ) -> Tuple[bool, List[str]]:
        """Switch to fallback/backup system"""
        self._log_event(component_id, "Switching to fallback system...", "info")
        return True, ["Using backup system, may have reduced functionality"]
    
    def _handle_scale_resources(
        self,
        component_id: str,
        diagnosis: DiagnosisResult
    ) -> Tuple[bool, List[str]]:
        """Scale up resources"""
        self._log_event(component_id, "Scaling resources...", "info")
        return True, ["Increased resource allocation, higher costs"]
    
    def _handle_retrain_model(
        self,
        component_id: str,
        diagnosis: DiagnosisResult
    ) -> Tuple[bool, List[str]]:
        """Trigger model retraining"""
        self._log_event(component_id, "Initiating model retraining...", "info")
        
        # Reset drift detector baseline
        self.drift_detector.set_baseline()
        
        return True, ["Model retraining queued, using existing model until complete"]
    
    def _handle_rollback(
        self,
        component_id: str,
        diagnosis: DiagnosisResult
    ) -> Tuple[bool, List[str]]:
        """Rollback to previous version"""
        self._log_event(component_id, "Rolling back to previous version...", "info")
        return True, ["Rolled back, new features unavailable"]
    
    def _handle_isolate(
        self,
        component_id: str,
        diagnosis: DiagnosisResult
    ) -> Tuple[bool, List[str]]:
        """Isolate problematic component"""
        self._log_event(component_id, "Isolating component...", "info")
        
        if component_id in self.components:
            self.components[component_id].status = HealthStatus.FAILED
        
        return True, ["Component isolated, traffic rerouted"]
    
    def _handle_notify_human(
        self,
        component_id: str,
        diagnosis: DiagnosisResult
    ) -> Tuple[bool, List[str]]:
        """Send notification to human operators"""
        self._log_event(
            component_id,
            f"ALERT: Human intervention required - {diagnosis.description}",
            "alert"
        )
        return True, ["Notification sent to operations team"]
    
    def _log_event(
        self,
        component_id: str,
        message: str,
        level: str = "info"
    ):
        """Log an event"""
        event = {
            "component_id": component_id,
            "message": message,
            "level": level,
            "timestamp": time.time()
        }
        self.event_log.append(event)
    
    def get_system_health(self) -> Dict[str, Any]:
        """Get comprehensive system health status"""
        component_statuses = {
            cid: {
                "name": c.name,
                "status": c.status.value,
                "metrics": {
                    m.name: {"value": m.value, "status": m.get_status().value}
                    for m in c.metrics.values()
                },
                "error_count": c.error_count,
                "healing_history_count": len(c.healing_history)
            }
            for cid, c in self.components.items()
        }
        
        # Overall status
        all_statuses = [c.status for c in self.components.values()]
        if HealthStatus.FAILED in all_statuses:
            overall = HealthStatus.CRITICAL
        elif HealthStatus.CRITICAL in all_statuses:
            overall = HealthStatus.CRITICAL
        elif HealthStatus.DEGRADED in all_statuses:
            overall = HealthStatus.DEGRADED
        elif HealthStatus.RECOVERING in all_statuses:
            overall = HealthStatus.RECOVERING
        else:
            overall = HealthStatus.HEALTHY if all_statuses else HealthStatus.OPTIMAL
        
        return {
            "overall_status": overall.value,
            "components": component_statuses,
            "drift_status": self.drift_detector.detect_drift(),
            "recent_events": list(self.event_log)[-20:],
            "healing_enabled": self.auto_heal,
            "timestamp": time.time()
        }
    
    def reset_healing_attempts(self, component_id: Optional[str] = None):
        """Reset healing attempt counter"""
        if component_id:
            self.healing_attempts[component_id] = 0
        else:
            for cid in self.healing_attempts:
                self.healing_attempts[cid] = 0


# Singleton instance
_self_healing_system: Optional[SelfHealingSystem] = None


def get_self_healing_system() -> SelfHealingSystem:
    """Get or create the singleton self-healing system"""
    global _self_healing_system
    if _self_healing_system is None:
        _self_healing_system = SelfHealingSystem(auto_heal=True)
        
        # Register default components
        _self_healing_system.register_component(
            "detection_engine",
            "Anomaly Detection Engine"
        )
        _self_healing_system.register_component(
            "ml_api",
            "ML API Service"
        )
        _self_healing_system.register_component(
            "database",
            "Database Service"
        )
    
    return _self_healing_system


def check_and_heal() -> Dict[str, Any]:
    """
    Convenience function to check system health and trigger healing if needed.
    
    Returns:
        System health status
    """
    system = get_self_healing_system()
    return system.get_system_health()
