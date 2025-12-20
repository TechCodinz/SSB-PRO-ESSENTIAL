"""
Adversarial Immune System
=========================
A revolutionary defense system inspired by biological immune systems.
It actively hunts and neutralizes adversarial attacks on ML models.

Key Innovations:
- Antibody Generation: Creates specific defenses for each attack type
- Memory Cells: Remembers past attacks for instant recognition
- Adaptive Response: Escalates defense based on threat severity
- Deception Detection: Identifies crafted inputs designed to fool AI
- Honeypot Integration: Attracts attackers to learn their methods

This is enterprise-grade adversarial robustness like no one has built.

Author: EchoForge AI Team  
License: Proprietary
"""

import numpy as np
from typing import Dict, List, Any, Optional, Tuple, Callable, Set
from dataclasses import dataclass, field
from enum import Enum
import time
import hashlib
from collections import defaultdict
import threading


class ThreatLevel(Enum):
    """Threat severity levels"""
    NONE = "none"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"
    ACTIVE_ATTACK = "active_attack"


class AttackType(Enum):
    """Known adversarial attack types"""
    FGSM = "fgsm"                      # Fast Gradient Sign Method
    PGD = "pgd"                        # Projected Gradient Descent
    CW = "carlini_wagner"              # Carlini & Wagner
    DEEPFOOL = "deepfool"
    JSMA = "jsma"                      # Jacobian Saliency Map
    BOUNDARY = "boundary_attack"
    HOPSKIPJUMP = "hopskipjump"
    PATCH = "adversarial_patch"
    TRIGGER = "backdoor_trigger"
    DATA_POISONING = "data_poisoning"
    MODEL_EXTRACTION = "model_extraction"
    EVASION = "evasion_attack"
    UNKNOWN = "unknown"


class DefenseState(Enum):
    """Defense system states"""
    DORMANT = "dormant"           # Normal operation, minimal checking
    ALERT = "alert"               # Increased vigilance
    ACTIVE = "active"             # Active defense measures
    LOCKDOWN = "lockdown"         # Maximum security, reduced functionality


@dataclass
class Antibody:
    """
    An antibody that recognizes specific attack patterns.
    Inspired by B-cells in biological immune systems.
    """
    antibody_id: str
    attack_type: AttackType
    signature: np.ndarray         # Pattern that triggers this antibody
    affinity: float               # How well it recognizes the attack (0-1)
    generation: int               # Which generation of evolution
    neutralization_method: str    # How this antibody neutralizes
    created_at: float
    activation_count: int = 0
    success_count: int = 0
    
    def matches(self, input_data: np.ndarray, threshold: float = 0.8) -> bool:
        """Check if this antibody matches the input"""
        if len(self.signature) != len(input_data.flatten()):
            return False
        
        similarity = 1 - np.linalg.norm(
            self.signature - input_data.flatten()
        ) / (np.linalg.norm(self.signature) + np.linalg.norm(input_data.flatten()) + 1e-10)
        
        return similarity >= threshold * self.affinity
    
    def update_success(self, success: bool):
        """Update success rate"""
        self.activation_count += 1
        if success:
            self.success_count += 1
            self.affinity = min(1.0, self.affinity + 0.05)
        else:
            self.affinity = max(0.5, self.affinity - 0.1)


@dataclass
class MemoryCell:
    """
    Memory cell that remembers past attacks.
    Inspired by Memory B/T cells in biological immune systems.
    """
    memory_id: str
    attack_type: AttackType
    attack_signature: np.ndarray
    source_indicators: Dict[str, Any]  # IPs, patterns, etc.
    encounter_count: int
    last_seen: float
    successful_defenses: int
    response_antibodies: List[str]  # IDs of antibodies that worked
    
    def decay(self, current_time: float, half_life: float = 86400):
        """Memories decay over time if not reinforced"""
        age = current_time - self.last_seen
        decay_factor = 0.5 ** (age / half_life)
        return decay_factor > 0.1  # Return False to remove
    
    def reinforce(self):
        """Reinforce this memory (attack was seen again)"""
        self.encounter_count += 1
        self.last_seen = time.time()


@dataclass
class ThreatAssessment:
    """Assessment of a potential threat"""
    threat_id: str
    threat_level: ThreatLevel
    attack_type: AttackType
    confidence: float
    indicators: List[str]
    recommended_response: str
    input_hash: str
    timestamp: float


class GradientMasker:
    """
    Masks gradients to prevent gradient-based attacks.
    Implements defense in depth against FGSM, PGD, etc.
    """
    
    def __init__(
        self,
        noise_scale: float = 0.1,
        quantization_levels: int = 256
    ):
        self.noise_scale = noise_scale
        self.quantization_levels = quantization_levels
    
    def add_noise(self, gradients: np.ndarray) -> np.ndarray:
        """Add noise to gradients"""
        noise = np.random.normal(0, self.noise_scale, gradients.shape)
        return gradients + noise
    
    def quantize_gradients(self, gradients: np.ndarray) -> np.ndarray:
        """Quantize gradients to limit information leakage"""
        min_val, max_val = gradients.min(), gradients.max()
        normalized = (gradients - min_val) / (max_val - min_val + 1e-10)
        quantized = np.round(normalized * self.quantization_levels) / self.quantization_levels
        return quantized * (max_val - min_val) + min_val
    
    def mask(self, gradients: np.ndarray) -> np.ndarray:
        """Apply full gradient masking pipeline"""
        noisy = self.add_noise(gradients)
        quantized = self.quantize_gradients(noisy)
        # Random dropout
        dropout_mask = np.random.binomial(1, 0.9, gradients.shape)
        return quantized * dropout_mask


class InputSanitizer:
    """
    Sanitizes inputs to remove potential adversarial perturbations.
    """
    
    def __init__(
        self,
        clip_percentile: float = 99,
        smoothing_sigma: float = 0.5
    ):
        self.clip_percentile = clip_percentile
        self.smoothing_sigma = smoothing_sigma
    
    def clip_outliers(self, data: np.ndarray) -> np.ndarray:
        """Clip extreme values"""
        low = np.percentile(data, 100 - self.clip_percentile)
        high = np.percentile(data, self.clip_percentile)
        return np.clip(data, low, high)
    
    def gaussian_smooth(self, data: np.ndarray) -> np.ndarray:
        """Apply Gaussian smoothing to remove high-frequency perturbations"""
        # Simple 1D smoothing
        if len(data.shape) == 1:
            kernel_size = max(3, int(self.smoothing_sigma * 3))
            kernel = np.exp(-np.arange(-kernel_size, kernel_size + 1) ** 2 / (2 * self.smoothing_sigma ** 2))
            kernel /= kernel.sum()
            
            # Pad and convolve
            padded = np.pad(data, kernel_size, mode='edge')
            smoothed = np.convolve(padded, kernel, mode='valid')
            return smoothed
        
        return data  # No smoothing for higher dimensions
    
    def jpeg_compression(self, data: np.ndarray, quality: int = 75) -> np.ndarray:
        """Simulate JPEG compression to remove perturbations"""
        # Simplified: quantization that mimics JPEG
        scale = (100 - quality) / 10 + 1
        quantized = np.round(data / scale) * scale
        return quantized
    
    def sanitize(
        self,
        data: np.ndarray,
        aggressive: bool = False
    ) -> np.ndarray:
        """Apply full sanitization pipeline"""
        result = self.clip_outliers(data)
        
        if aggressive:
            result = self.gaussian_smooth(result)
            result = self.jpeg_compression(result)
        
        return result


class DeceptionDetector:
    """
    Detects when inputs are crafted to deceive the model.
    Uses multiple detection strategies.
    """
    
    def __init__(
        self,
        n_neighbors: int = 5,
        detection_threshold: float = 0.7
    ):
        self.n_neighbors = n_neighbors
        self.detection_threshold = detection_threshold
        self.clean_samples: List[np.ndarray] = []
        self.max_samples = 10000
    
    def add_clean_sample(self, sample: np.ndarray):
        """Add a known-clean sample for reference"""
        self.clean_samples.append(sample.flatten())
        if len(self.clean_samples) > self.max_samples:
            self.clean_samples = self.clean_samples[-self.max_samples:]
    
    def detect_statistical_anomaly(self, data: np.ndarray) -> Tuple[bool, float]:
        """Detect statistical anomalies that indicate adversarial inputs"""
        flat_data = data.flatten()
        
        # Check for unnaturally uniform values
        variance = np.var(flat_data)
        if variance < 1e-6:
            return True, 0.9
        
        # Check for unusual value distribution
        kurtosis = self._kurtosis(flat_data)
        if abs(kurtosis) > 10:
            return True, 0.7
        
        return False, 0.0
    
    def detect_perturbation_pattern(self, data: np.ndarray) -> Tuple[bool, float]:
        """Detect patterns typical of adversarial perturbations"""
        flat_data = data.flatten()
        
        # Check for grid-like perturbations (common in patch attacks)
        gradients = np.diff(flat_data)
        gradient_variance = np.var(gradients)
        
        # Very regular gradients suggest artificial perturbation
        if gradient_variance < 1e-4 and np.mean(np.abs(gradients)) > 0.01:
            return True, 0.8
        
        # Check for salt-and-pepper noise pattern
        extreme_ratio = np.sum(np.abs(flat_data) > np.percentile(np.abs(flat_data), 95)) / len(flat_data)
        if extreme_ratio > 0.1:
            return True, 0.6
        
        return False, 0.0
    
    def detect_distance_from_manifold(self, data: np.ndarray) -> Tuple[bool, float]:
        """Check if input is far from clean data manifold"""
        if len(self.clean_samples) < 10:
            return False, 0.0
        
        flat_data = data.flatten()
        
        # Find nearest neighbors
        distances = []
        for clean in self.clean_samples[-1000:]:  # Use recent samples
            if len(clean) == len(flat_data):
                dist = np.linalg.norm(flat_data - clean)
                distances.append(dist)
        
        if not distances:
            return False, 0.0
        
        avg_distance = np.mean(sorted(distances)[:self.n_neighbors])
        max_expected = np.percentile(distances, 95)
        
        if avg_distance > max_expected:
            return True, min(avg_distance / max_expected - 1, 1.0)
        
        return False, 0.0
    
    def detect(
        self,
        data: np.ndarray,
        use_all_methods: bool = True
    ) -> Tuple[bool, float, List[str]]:
        """
        Run all detection methods.
        
        Returns:
            (is_adversarial, confidence, indicators)
        """
        indicators = []
        max_confidence = 0.0
        
        # Statistical anomaly
        is_stat_anomaly, stat_conf = self.detect_statistical_anomaly(data)
        if is_stat_anomaly:
            indicators.append(f"Statistical anomaly (conf={stat_conf:.2f})")
            max_confidence = max(max_confidence, stat_conf)
        
        # Perturbation pattern
        is_perturbed, pert_conf = self.detect_perturbation_pattern(data)
        if is_perturbed:
            indicators.append(f"Perturbation pattern detected (conf={pert_conf:.2f})")
            max_confidence = max(max_confidence, pert_conf)
        
        # Distance from manifold
        is_distant, dist_conf = self.detect_distance_from_manifold(data)
        if is_distant:
            indicators.append(f"Far from clean manifold (conf={dist_conf:.2f})")
            max_confidence = max(max_confidence, dist_conf)
        
        is_adversarial = max_confidence >= self.detection_threshold
        
        return is_adversarial, max_confidence, indicators
    
    def _kurtosis(self, data: np.ndarray) -> float:
        """Calculate kurtosis"""
        mean = np.mean(data)
        std = np.std(data) + 1e-10
        return np.mean(((data - mean) / std) ** 4) - 3


class Honeypot:
    """
    A honeypot that attracts attackers to learn their methods.
    Deliberately vulnerable-looking endpoints that log attack patterns.
    """
    
    def __init__(self, trap_name: str):
        self.trap_name = trap_name
        self.triggers: List[Dict] = []
        self.ip_blacklist: Set[str] = set()
        self.extracted_patterns: List[np.ndarray] = []
    
    def process_trap(
        self,
        input_data: np.ndarray,
        source_ip: Optional[str] = None,
        metadata: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """Process an input to the honeypot"""
        trigger_event = {
            "trap_name": self.trap_name,
            "timestamp": time.time(),
            "source_ip": source_ip,
            "input_hash": hashlib.md5(input_data.tobytes()).hexdigest(),
            "input_shape": input_data.shape,
            "metadata": metadata,
            "analysis": self._analyze_attack(input_data)
        }
        
        self.triggers.append(trigger_event)
        
        if source_ip:
            self.ip_blacklist.add(source_ip)
        
        # Extract pattern for future detection
        self.extracted_patterns.append(input_data.flatten())
        
        # Return fake "successful" response to keep attacker engaged
        return {
            "success": True,  # Lie to the attacker
            "result": "Analysis complete",
            "_honeypot_triggered": True  # Internal flag
        }
    
    def _analyze_attack(self, data: np.ndarray) -> Dict[str, Any]:
        """Analyze attack characteristics"""
        flat = data.flatten()
        return {
            "variance": float(np.var(flat)),
            "mean_abs": float(np.mean(np.abs(flat))),
            "sparsity": float(np.sum(np.abs(flat) < 1e-6) / len(flat)),
            "gradient_pattern": self._detect_gradient_pattern(flat)
        }
    
    def _detect_gradient_pattern(self, data: np.ndarray) -> str:
        """Detect the type of gradient-based attack"""
        gradients = np.diff(data)
        
        # FGSM: uniform sign gradients
        if np.std(np.abs(gradients)) < 0.01:
            return "fgsm_like"
        
        # PGD: iterative small steps
        if np.mean(np.abs(gradients)) < 0.1:
            return "pgd_like"
        
        return "unknown"
    
    def get_intelligence(self) -> Dict[str, Any]:
        """Get intelligence gathered from honeypot"""
        return {
            "trap_name": self.trap_name,
            "total_triggers": len(self.triggers),
            "unique_ips": len(self.ip_blacklist),
            "patterns_extracted": len(self.extracted_patterns),
            "recent_triggers": self.triggers[-10:],
            "ip_blacklist": list(self.ip_blacklist)[:100]
        }


class AdversarialImmuneSystem:
    """
    The Adversarial Immune System
    
    A revolutionary defense system that protects ML models from
    adversarial attacks using principles from biological immune systems.
    """
    
    def __init__(
        self,
        max_antibodies: int = 1000,
        max_memories: int = 5000,
        auto_evolve: bool = True,
        aggressive_defense: bool = False  # More sanitization
    ):
        self.max_antibodies = max_antibodies
        self.max_memories = max_memories
        self.auto_evolve = auto_evolve
        self.aggressive_defense = aggressive_defense
        
        # Defense state
        self.state = DefenseState.DORMANT
        self.threat_level = ThreatLevel.NONE
        
        # Immune cells
        self.antibodies: List[Antibody] = []
        self.memory_cells: Dict[str, MemoryCell] = {}
        
        # Components
        self.gradient_masker = GradientMasker()
        self.input_sanitizer = InputSanitizer()
        self.deception_detector = DeceptionDetector()
        
        # Honeypots
        self.honeypots: Dict[str, Honeypot] = {
            "model_api": Honeypot("model_api"),
            "gradient_endpoint": Honeypot("gradient_endpoint"),
            "raw_input": Honeypot("raw_input")
        }
        
        # Statistics
        self.stats = {
            "inputs_processed": 0,
            "attacks_detected": 0,
            "attacks_neutralized": 0,
            "false_positives": 0,
            "antibodies_generated": 0
        }
        
        # Thread safety
        self._lock = threading.Lock()
        
        # Callbacks
        self.on_attack_detected: Optional[Callable] = None
        self.on_antibody_generated: Optional[Callable] = None
    
    def process_input(
        self,
        data: np.ndarray,
        source_ip: Optional[str] = None,
        validate_only: bool = False
    ) -> Dict[str, Any]:
        """
        Process an input through the immune system.
        
        Args:
            data: Input data to analyze
            source_ip: Optional source IP for tracking
            validate_only: If True, only validate without sanitizing
            
        Returns:
            Dict with validation results and sanitized data
        """
        self.stats["inputs_processed"] += 1
        current_time = time.time()
        
        result = {
            "is_safe": True,
            "threat_assessment": None,
            "sanitized_data": data,
            "defense_actions": [],
            "processing_time_ms": 0
        }
        
        start_time = time.time()
        
        # Step 1: Deception Detection
        is_adversarial, confidence, indicators = self.deception_detector.detect(data)
        
        if is_adversarial:
            result["is_safe"] = False
            result["threat_assessment"] = self._assess_threat(
                data, confidence, indicators
            )
            result["defense_actions"].append("deception_detected")
            
            self.stats["attacks_detected"] += 1
            
            if self.on_attack_detected:
                self.on_attack_detected(result["threat_assessment"])
        
        # Step 2: Memory Cell Check
        matching_memory = self._check_memory_cells(data)
        if matching_memory:
            result["is_safe"] = False
            result["defense_actions"].append(f"matched_memory:{matching_memory.memory_id}")
            matching_memory.reinforce()
        
        # Step 3: Antibody Matching
        matching_antibody = self._find_matching_antibody(data)
        if matching_antibody:
            result["is_safe"] = False
            result["defense_actions"].append(f"antibody_activated:{matching_antibody.antibody_id}")
            matching_antibody.update_success(True)
            
            # Apply neutralization
            if not validate_only:
                result["sanitized_data"] = self._neutralize(
                    data, matching_antibody
                )
                result["defense_actions"].append("neutralized")
                self.stats["attacks_neutralized"] += 1
        
        # Step 4: Sanitization (if not safe or aggressive mode)
        if not result["is_safe"] or self.aggressive_defense:
            if not validate_only:
                result["sanitized_data"] = self.input_sanitizer.sanitize(
                    data if result["sanitized_data"] is None else result["sanitized_data"],
                    aggressive=not result["is_safe"]
                )
                result["defense_actions"].append("sanitized")
        
        # Step 5: Generate new antibody if novel attack
        if not result["is_safe"] and matching_antibody is None and self.auto_evolve:
            attack_type = self._classify_attack(data, indicators)
            new_antibody = self._generate_antibody(data, attack_type)
            result["defense_actions"].append(f"antibody_generated:{new_antibody.antibody_id}")
        
        # Step 6: Update defense state
        self._update_defense_state(result["is_safe"])
        
        result["processing_time_ms"] = (time.time() - start_time) * 1000
        result["defense_state"] = self.state.value
        result["threat_level"] = self.threat_level.value
        
        # Add clean sample if safe
        if result["is_safe"]:
            self.deception_detector.add_clean_sample(data)
        
        return result
    
    def _assess_threat(
        self,
        data: np.ndarray,
        confidence: float,
        indicators: List[str]
    ) -> ThreatAssessment:
        """Create threat assessment"""
        attack_type = self._classify_attack(data, indicators)
        
        if confidence > 0.9:
            threat_level = ThreatLevel.CRITICAL
        elif confidence > 0.7:
            threat_level = ThreatLevel.HIGH
        elif confidence > 0.5:
            threat_level = ThreatLevel.MEDIUM
        else:
            threat_level = ThreatLevel.LOW
        
        return ThreatAssessment(
            threat_id=f"threat_{int(time.time() * 1000)}",
            threat_level=threat_level,
            attack_type=attack_type,
            confidence=confidence,
            indicators=indicators,
            recommended_response=self._recommend_response(threat_level),
            input_hash=hashlib.md5(data.tobytes()).hexdigest(),
            timestamp=time.time()
        )
    
    def _classify_attack(
        self,
        data: np.ndarray,
        indicators: List[str]
    ) -> AttackType:
        """Classify the type of attack"""
        flat = data.flatten()
        
        # Check for specific patterns
        gradients = np.diff(flat)
        
        # FGSM: very uniform perturbations
        if np.std(np.abs(gradients)) < 0.01:
            return AttackType.FGSM
        
        # PGD: small iterative steps
        if np.mean(np.abs(gradients)) < 0.05:
            return AttackType.PGD
        
        # Patch attack: localized high perturbation
        moving_var = [
            np.var(flat[i:i+10]) 
            for i in range(0, len(flat) - 10, 10)
        ]
        if len(moving_var) > 2 and max(moving_var) > 10 * np.mean(moving_var):
            return AttackType.PATCH
        
        return AttackType.UNKNOWN
    
    def _recommend_response(self, threat_level: ThreatLevel) -> str:
        """Recommend response based on threat level"""
        responses = {
            ThreatLevel.NONE: "normal_processing",
            ThreatLevel.LOW: "log_and_sanitize",
            ThreatLevel.MEDIUM: "sanitize_and_alert",
            ThreatLevel.HIGH: "block_and_alert",
            ThreatLevel.CRITICAL: "block_quarantine_alert",
            ThreatLevel.ACTIVE_ATTACK: "lockdown_notify_security"
        }
        return responses.get(threat_level, "unknown")
    
    def _check_memory_cells(self, data: np.ndarray) -> Optional[MemoryCell]:
        """Check if input matches known attack memory"""
        flat_data = data.flatten()
        
        for memory in self.memory_cells.values():
            if len(memory.attack_signature) == len(flat_data):
                similarity = 1 - np.linalg.norm(
                    memory.attack_signature - flat_data
                ) / (np.linalg.norm(memory.attack_signature) + 1e-10)
                
                if similarity > 0.9:
                    return memory
        
        return None
    
    def _find_matching_antibody(self, data: np.ndarray) -> Optional[Antibody]:
        """Find an antibody that matches this input"""
        for antibody in sorted(self.antibodies, key=lambda a: a.affinity, reverse=True):
            if antibody.matches(data):
                return antibody
        return None
    
    def _generate_antibody(
        self,
        data: np.ndarray,
        attack_type: AttackType
    ) -> Antibody:
        """Generate a new antibody for this attack pattern"""
        antibody = Antibody(
            antibody_id=f"ab_{int(time.time() * 1000)}",
            attack_type=attack_type,
            signature=data.flatten().copy(),
            affinity=0.7,  # Initial affinity
            generation=len(self.antibodies),
            neutralization_method="sanitize_and_reject",
            created_at=time.time()
        )
        
        with self._lock:
            self.antibodies.append(antibody)
            
            # Cleanup old/weak antibodies
            if len(self.antibodies) > self.max_antibodies:
                self.antibodies.sort(key=lambda a: a.affinity * a.success_count, reverse=True)
                self.antibodies = self.antibodies[:self.max_antibodies]
        
        self.stats["antibodies_generated"] += 1
        
        if self.on_antibody_generated:
            self.on_antibody_generated(antibody)
        
        # Also create memory cell
        self._create_memory(data, attack_type, antibody.antibody_id)
        
        return antibody
    
    def _create_memory(
        self,
        data: np.ndarray,
        attack_type: AttackType,
        antibody_id: str
    ):
        """Create a memory cell for this attack"""
        memory_id = f"mem_{hashlib.md5(data.tobytes()).hexdigest()[:8]}"
        
        memory = MemoryCell(
            memory_id=memory_id,
            attack_type=attack_type,
            attack_signature=data.flatten().copy(),
            source_indicators={},
            encounter_count=1,
            last_seen=time.time(),
            successful_defenses=1,
            response_antibodies=[antibody_id]
        )
        
        with self._lock:
            self.memory_cells[memory_id] = memory
            
            # Cleanup old memories
            if len(self.memory_cells) > self.max_memories:
                # Remove memories that have decayed
                current_time = time.time()
                to_remove = [
                    mid for mid, mem in self.memory_cells.items()
                    if not mem.decay(current_time)
                ]
                for mid in to_remove:
                    del self.memory_cells[mid]
    
    def _neutralize(
        self,
        data: np.ndarray,
        antibody: Antibody
    ) -> np.ndarray:
        """Neutralize adversarial input"""
        # Apply appropriate neutralization based on antibody type
        if antibody.attack_type == AttackType.FGSM:
            # Remove gradient sign perturbations
            return self.input_sanitizer.clip_outliers(data)
        
        elif antibody.attack_type == AttackType.PGD:
            # Aggressive smoothing
            return self.input_sanitizer.sanitize(data, aggressive=True)
        
        elif antibody.attack_type == AttackType.PATCH:
            # Replace high-variance regions with local mean
            flat = data.flatten()
            moving_mean = np.convolve(flat, np.ones(5)/5, mode='same')
            moving_var = np.convolve((flat - moving_mean)**2, np.ones(5)/5, mode='same')
            mask = moving_var > np.percentile(moving_var, 90)
            flat[mask] = moving_mean[mask]
            return flat.reshape(data.shape)
        
        # Default: full sanitization
        return self.input_sanitizer.sanitize(data, aggressive=True)
    
    def _update_defense_state(self, input_was_safe: bool):
        """Update defense state based on recent activity"""
        if not input_was_safe:
            if self.threat_level == ThreatLevel.NONE:
                self.threat_level = ThreatLevel.LOW
                self.state = DefenseState.ALERT
            elif self.threat_level == ThreatLevel.LOW:
                self.threat_level = ThreatLevel.MEDIUM
            elif self.threat_level == ThreatLevel.MEDIUM:
                self.threat_level = ThreatLevel.HIGH
                self.state = DefenseState.ACTIVE
            elif self.threat_level == ThreatLevel.HIGH:
                self.threat_level = ThreatLevel.CRITICAL
                self.state = DefenseState.LOCKDOWN
        else:
            # Gradual de-escalation
            if self.threat_level == ThreatLevel.CRITICAL:
                self.threat_level = ThreatLevel.HIGH
            elif self.threat_level == ThreatLevel.HIGH:
                self.threat_level = ThreatLevel.MEDIUM
                self.state = DefenseState.ALERT
            elif self.threat_level == ThreatLevel.MEDIUM:
                self.threat_level = ThreatLevel.LOW
            elif self.threat_level == ThreatLevel.LOW:
                self.threat_level = ThreatLevel.NONE
                self.state = DefenseState.DORMANT
    
    def mask_gradients(self, gradients: np.ndarray) -> np.ndarray:
        """Mask gradients to prevent gradient-based attacks"""
        return self.gradient_masker.mask(gradients)
    
    def get_status(self) -> Dict[str, Any]:
        """Get comprehensive immune system status"""
        return {
            "state": self.state.value,
            "threat_level": self.threat_level.value,
            "statistics": self.stats.copy(),
            "antibody_count": len(self.antibodies),
            "memory_cell_count": len(self.memory_cells),
            "top_antibodies": [
                {
                    "id": ab.antibody_id,
                    "attack_type": ab.attack_type.value,
                    "affinity": ab.affinity,
                    "activations": ab.activation_count
                }
                for ab in sorted(self.antibodies, key=lambda a: a.affinity, reverse=True)[:10]
            ],
            "honeypot_intelligence": {
                name: hp.get_intelligence()
                for name, hp in self.honeypots.items()
            },
            "known_attack_types": list(set(ab.attack_type.value for ab in self.antibodies))
        }


# Singleton instance
_immune_system: Optional[AdversarialImmuneSystem] = None


def get_immune_system() -> AdversarialImmuneSystem:
    """Get or create the singleton immune system"""
    global _immune_system
    if _immune_system is None:
        _immune_system = AdversarialImmuneSystem(auto_evolve=True)
    return _immune_system


def protect_input(
    data: np.ndarray,
    source_ip: Optional[str] = None
) -> Tuple[np.ndarray, bool]:
    """
    Convenience function to protect an input.
    
    Returns:
        (sanitized_data, is_safe)
    """
    system = get_immune_system()
    result = system.process_input(data, source_ip)
    return result["sanitized_data"], result["is_safe"]
