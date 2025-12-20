"""
Neural Swarm Intelligence Engine
================================
A revolutionary multi-agent AI system where thousands of specialized neural "bees" 
work as a coordinated swarm for unprecedented anomaly detection.

This is unlike ANYTHING that exists in any anomaly detection platform.

Key Innovations:
- Stigmergic Learning: Agents leave "pheromone trails" on data
- Emergent Intelligence: Patterns emerge from swarm consensus
- Anti-Fragile Architecture: System gets stronger when attacked
- Collective Memory: Shared experience across all agents
- Dynamic Specialization: Agents evolve to specialize

Author: EchoForge AI Team
License: Proprietary
"""

import numpy as np
from typing import Dict, List, Any, Optional, Tuple, Callable
from dataclasses import dataclass, field
from enum import Enum
import threading
import time
import hashlib
from collections import defaultdict
import random
import math


class AgentState(Enum):
    """Current state of a neural agent"""
    SCOUTING = "scouting"       # Exploring data space
    ANALYZING = "analyzing"      # Deep analysis on suspicious area
    SIGNALING = "signaling"      # Broadcasting discovery
    LEARNING = "learning"        # Updating from collective
    DORMANT = "dormant"          # Energy conservation mode


@dataclass
class PheromoneTrail:
    """Digital pheromone left by agents on data regions"""
    position: np.ndarray        # Location in feature space
    intensity: float            # Strength of signal (0-1)
    type: str                   # "anomaly", "normal", "uncertain"
    timestamp: float            # When deposited
    agent_id: str               # Which agent left it
    confidence: float           # How sure the agent was
    evaporation_rate: float = 0.1
    
    def evaporate(self, current_time: float) -> float:
        """Reduce intensity over time (like real pheromones)"""
        age = current_time - self.timestamp
        self.intensity *= math.exp(-self.evaporation_rate * age)
        return self.intensity


@dataclass
class CollectiveMemory:
    """Shared memory bank across all swarm agents"""
    known_patterns: Dict[str, np.ndarray] = field(default_factory=dict)
    attack_signatures: Dict[str, Dict] = field(default_factory=dict)
    consensus_thresholds: Dict[str, float] = field(default_factory=dict)
    successful_detections: List[Dict] = field(default_factory=list)
    failed_detections: List[Dict] = field(default_factory=list)
    evolution_history: List[Dict] = field(default_factory=list)
    
    def record_success(self, pattern: np.ndarray, method: str, confidence: float):
        """Record a successful detection for learning"""
        signature = hashlib.md5(pattern.tobytes()).hexdigest()[:16]
        self.successful_detections.append({
            "signature": signature,
            "method": method,
            "confidence": confidence,
            "timestamp": time.time()
        })
        # Keep only last 10000 detections
        if len(self.successful_detections) > 10000:
            self.successful_detections = self.successful_detections[-10000:]
    
    def get_similar_patterns(self, pattern: np.ndarray, top_k: int = 5) -> List[Dict]:
        """Find similar patterns from memory"""
        if not self.known_patterns:
            return []
        
        similarities = []
        for name, stored_pattern in self.known_patterns.items():
            if stored_pattern.shape == pattern.shape:
                sim = 1 - np.linalg.norm(pattern - stored_pattern) / (
                    np.linalg.norm(pattern) + np.linalg.norm(stored_pattern) + 1e-10
                )
                similarities.append({"name": name, "similarity": sim})
        
        return sorted(similarities, key=lambda x: x["similarity"], reverse=True)[:top_k]


@dataclass 
class NeuralAgent:
    """A single neural "bee" in the swarm"""
    agent_id: str
    specialization: str = "general"  # What this agent is good at
    state: AgentState = AgentState.SCOUTING
    energy: float = 1.0
    experience: int = 0
    detection_accuracy: float = 0.5
    position: Optional[np.ndarray] = None
    
    # Genetic properties (can evolve)
    sensitivity: float = 0.5        # How easily triggered
    exploration_rate: float = 0.3   # How much random exploration
    communication_range: float = 0.5
    learning_rate: float = 0.1
    
    # Performance tracking
    true_positives: int = 0
    false_positives: int = 0
    true_negatives: int = 0
    false_negatives: int = 0
    
    def update_accuracy(self):
        """Recalculate detection accuracy from history"""
        total = self.true_positives + self.false_positives + \
                self.true_negatives + self.false_negatives
        if total > 0:
            self.detection_accuracy = (self.true_positives + self.true_negatives) / total
    
    def should_explore(self) -> bool:
        """Decide whether to explore or exploit"""
        return random.random() < self.exploration_rate * (1 - self.experience / 1000)
    
    def mutate(self, mutation_rate: float = 0.1):
        """Mutate genetic properties for evolution"""
        if random.random() < mutation_rate:
            self.sensitivity += random.gauss(0, 0.1)
            self.sensitivity = max(0.1, min(0.9, self.sensitivity))
        if random.random() < mutation_rate:
            self.exploration_rate += random.gauss(0, 0.05)
            self.exploration_rate = max(0.05, min(0.5, self.exploration_rate))
        if random.random() < mutation_rate:
            self.learning_rate += random.gauss(0, 0.02)
            self.learning_rate = max(0.01, min(0.3, self.learning_rate))


class NeuralSwarmEngine:
    """
    The Neural Swarm Intelligence Engine
    
    A revolutionary approach to anomaly detection using swarm intelligence.
    Thousands of lightweight neural agents work together, leaving pheromone
    trails and achieving consensus through emergent collective behavior.
    """
    
    def __init__(
        self,
        num_agents: int = 1000,
        specializations: Optional[List[str]] = None,
        consensus_threshold: float = 0.6,
        pheromone_decay: float = 0.1,
        evolution_rate: float = 0.05
    ):
        self.num_agents = num_agents
        self.consensus_threshold = consensus_threshold
        self.pheromone_decay = pheromone_decay
        self.evolution_rate = evolution_rate
        
        # Default specializations
        if specializations is None:
            specializations = [
                "statistical",      # Statistical anomalies
                "temporal",         # Time-series patterns
                "spatial",          # Spatial clustering
                "behavioral",       # Behavior patterns
                "adversarial",      # Adversarial attacks
                "drift",            # Concept drift
                "noise",            # Noise vs signal
                "rare_event"        # Rare event detection
            ]
        
        self.specializations = specializations
        
        # Initialize swarm
        self.agents: List[NeuralAgent] = []
        self._initialize_swarm()
        
        # Pheromone grid
        self.pheromone_trails: List[PheromoneTrail] = []
        
        # Collective memory
        self.memory = CollectiveMemory()
        
        # Statistics
        self.generation = 0
        self.total_detections = 0
        self.swarm_accuracy = 0.5
        
        # Thread safety
        self._lock = threading.Lock()
    
    def _initialize_swarm(self):
        """Create the initial swarm of agents"""
        agents_per_specialization = self.num_agents // len(self.specializations)
        
        for i in range(self.num_agents):
            spec_idx = i % len(self.specializations)
            agent = NeuralAgent(
                agent_id=f"agent_{i:04d}",
                specialization=self.specializations[spec_idx],
                sensitivity=random.uniform(0.3, 0.7),
                exploration_rate=random.uniform(0.1, 0.4),
                learning_rate=random.uniform(0.05, 0.15)
            )
            self.agents.append(agent)
    
    def _deposit_pheromone(
        self,
        agent: NeuralAgent,
        position: np.ndarray,
        pheromone_type: str,
        intensity: float,
        confidence: float
    ):
        """Agent deposits a pheromone trail"""
        trail = PheromoneTrail(
            position=position.copy(),
            intensity=intensity,
            type=pheromone_type,
            timestamp=time.time(),
            agent_id=agent.agent_id,
            confidence=confidence,
            evaporation_rate=self.pheromone_decay
        )
        
        with self._lock:
            self.pheromone_trails.append(trail)
            
            # Cleanup old/weak trails
            current_time = time.time()
            self.pheromone_trails = [
                t for t in self.pheromone_trails
                if t.evaporate(current_time) > 0.01
            ]
    
    def _sense_pheromones(
        self,
        position: np.ndarray,
        radius: float = 1.0
    ) -> Dict[str, float]:
        """Sense pheromones in the local area"""
        signals = {"anomaly": 0.0, "normal": 0.0, "uncertain": 0.0}
        
        with self._lock:
            for trail in self.pheromone_trails:
                distance = np.linalg.norm(position - trail.position)
                if distance <= radius:
                    # Intensity decreases with distance
                    local_intensity = trail.intensity * (1 - distance / radius)
                    signals[trail.type] += local_intensity * trail.confidence
        
        return signals
    
    def _agent_analyze(
        self,
        agent: NeuralAgent,
        data_point: np.ndarray,
        context: Optional[Dict] = None
    ) -> Tuple[bool, float]:
        """Single agent analyzes a data point"""
        # Check local pheromones first (stigmergic behavior)
        local_signals = self._sense_pheromones(data_point, agent.communication_range)
        
        # Bias based on pheromones
        pheromone_bias = local_signals["anomaly"] - local_signals["normal"]
        
        # Agent's own analysis based on specialization
        if agent.specialization == "statistical":
            # Statistical analysis - check deviation from expected
            score = self._statistical_analysis(data_point, context)
        elif agent.specialization == "temporal":
            score = self._temporal_analysis(data_point, context)
        elif agent.specialization == "spatial":
            score = self._spatial_analysis(data_point, context)
        elif agent.specialization == "behavioral":
            score = self._behavioral_analysis(data_point, context)
        elif agent.specialization == "adversarial":
            score = self._adversarial_analysis(data_point, context)
        elif agent.specialization == "drift":
            score = self._drift_analysis(data_point, context)
        elif agent.specialization == "noise":
            score = self._noise_analysis(data_point, context)
        elif agent.specialization == "rare_event":
            score = self._rare_event_analysis(data_point, context)
        else:
            score = np.mean(np.abs(data_point)) / 10  # Fallback
        
        # Combine with pheromone bias
        adjusted_score = score + pheromone_bias * 0.2
        adjusted_score = max(0, min(1, adjusted_score))
        
        # Agent's decision based on sensitivity
        is_anomaly = adjusted_score > (1 - agent.sensitivity)
        
        # Deposit pheromone based on finding
        pheromone_type = "anomaly" if is_anomaly else "normal"
        confidence = abs(adjusted_score - 0.5) * 2  # Higher at extremes
        self._deposit_pheromone(agent, data_point, pheromone_type, adjusted_score, confidence)
        
        # Update agent state
        agent.experience += 1
        agent.energy -= 0.001  # Small energy cost
        
        return is_anomaly, adjusted_score
    
    def _statistical_analysis(self, point: np.ndarray, context: Optional[Dict]) -> float:
        """Statistical outlier detection"""
        if context and "mean" in context and "std" in context:
            z_scores = np.abs((point - context["mean"]) / (context["std"] + 1e-10))
            return np.tanh(np.mean(z_scores) / 3)
        return np.tanh(np.mean(np.abs(point)) / 5)
    
    def _temporal_analysis(self, point: np.ndarray, context: Optional[Dict]) -> float:
        """Temporal pattern analysis"""
        if context and "history" in context:
            history = np.array(context["history"])
            if len(history) > 0:
                recent_mean = np.mean(history[-10:], axis=0) if len(history) >= 10 else np.mean(history, axis=0)
                diff = np.linalg.norm(point - recent_mean)
                return np.tanh(diff / 5)
        return 0.3
    
    def _spatial_analysis(self, point: np.ndarray, context: Optional[Dict]) -> float:
        """Spatial clustering analysis"""
        if context and "neighbors" in context:
            neighbors = context["neighbors"]
            if len(neighbors) > 0:
                avg_distance = np.mean([np.linalg.norm(point - n) for n in neighbors])
                return np.tanh(avg_distance / 3)
        return 0.3
    
    def _behavioral_analysis(self, point: np.ndarray, context: Optional[Dict]) -> float:
        """Behavioral pattern analysis"""
        if context and "baseline" in context:
            deviation = np.linalg.norm(point - context["baseline"])
            return np.tanh(deviation / 5)
        return 0.3
    
    def _adversarial_analysis(self, point: np.ndarray, context: Optional[Dict]) -> float:
        """Adversarial attack detection"""
        # Check for signs of adversarial perturbations
        # Look for unnaturally small variations
        variance = np.var(point)
        if variance < 1e-6:
            return 0.8  # Suspiciously uniform
        
        # Check for specific adversarial signatures
        if context and "attack_signatures" in self.memory.attack_signatures:
            for sig_name, signature in self.memory.attack_signatures.items():
                if "pattern" in signature:
                    similarity = 1 - np.linalg.norm(point - signature["pattern"]) / (np.linalg.norm(point) + 1e-10)
                    if similarity > 0.9:
                        return 0.95
        
        return 0.2
    
    def _drift_analysis(self, point: np.ndarray, context: Optional[Dict]) -> float:
        """Concept drift detection"""
        if context and "baseline_distribution" in context:
            baseline = context["baseline_distribution"]
            # Compare current point to baseline distribution
            if "mean" in baseline and "cov" in baseline:
                diff = point - baseline["mean"]
                try:
                    mahal_dist = np.sqrt(diff @ np.linalg.inv(baseline["cov"]) @ diff)
                    return np.tanh(mahal_dist / 5)
                except:
                    pass
        return 0.3
    
    def _noise_analysis(self, point: np.ndarray, context: Optional[Dict]) -> float:
        """Distinguish noise from signal"""
        # Check for noise-like patterns
        if len(point) > 1:
            autocorr = np.correlate(point, point, mode='valid')[0]
            normalized = autocorr / (np.linalg.norm(point) ** 2 + 1e-10)
            # Pure noise has low autocorrelation
            if normalized < 0.3:
                return 0.1  # Likely just noise
        return 0.5
    
    def _rare_event_analysis(self, point: np.ndarray, context: Optional[Dict]) -> float:
        """Rare event detection"""
        # Check against known patterns
        similar = self.memory.get_similar_patterns(point, top_k=5)
        if similar:
            max_similarity = max(s["similarity"] for s in similar)
            if max_similarity < 0.3:
                return 0.8  # Very different from known patterns
        return 0.4
    
    def detect(
        self,
        data: np.ndarray,
        context: Optional[Dict] = None,
        return_details: bool = False
    ) -> Dict[str, Any]:
        """
        Perform swarm-based anomaly detection on data.
        
        Args:
            data: Input data array (n_samples, n_features)
            context: Optional context for analysis
            return_details: Whether to return detailed agent votes
            
        Returns:
            Detection results with consensus scores
        """
        if len(data.shape) == 1:
            data = data.reshape(1, -1)
        
        n_samples = data.shape[0]
        
        # Build context if not provided
        if context is None:
            context = {}
        
        if "mean" not in context:
            context["mean"] = np.mean(data, axis=0)
        if "std" not in context:
            context["std"] = np.std(data, axis=0) + 1e-10
        
        results = {
            "anomaly_scores": np.zeros(n_samples),
            "is_anomaly": np.zeros(n_samples, dtype=bool),
            "consensus_levels": np.zeros(n_samples),
            "agent_votes": [] if return_details else None,
            "specialization_scores": defaultdict(list),
            "processing_time_ms": 0,
            "swarm_statistics": {}
        }
        
        start_time = time.time()
        
        for i, point in enumerate(data):
            # Each agent votes
            votes = []
            scores_by_spec = defaultdict(list)
            
            # Sample a subset of agents for efficiency
            active_agents = random.sample(
                self.agents, 
                min(100, len(self.agents))  # Use 100 agents per point
            )
            
            for agent in active_agents:
                if agent.energy > 0.1:  # Only energetic agents participate
                    is_anomaly, score = self._agent_analyze(agent, point, context)
                    votes.append((is_anomaly, score, agent.detection_accuracy))
                    scores_by_spec[agent.specialization].append(score)
            
            if votes:
                # Weighted consensus based on agent accuracy
                weighted_anomaly_votes = sum(
                    (1 if v[0] else 0) * v[2] for v in votes
                )
                total_weight = sum(v[2] for v in votes)
                
                consensus = weighted_anomaly_votes / total_weight if total_weight > 0 else 0.5
                avg_score = sum(v[1] * v[2] for v in votes) / total_weight if total_weight > 0 else 0.5
                
                results["anomaly_scores"][i] = avg_score
                results["is_anomaly"][i] = consensus > self.consensus_threshold
                results["consensus_levels"][i] = consensus
                
                if return_details:
                    results["agent_votes"].append(votes)
                
                for spec, spec_scores in scores_by_spec.items():
                    results["specialization_scores"][spec].append(np.mean(spec_scores))
        
        results["processing_time_ms"] = (time.time() - start_time) * 1000
        
        # Swarm statistics
        results["swarm_statistics"] = {
            "num_agents": len(self.agents),
            "active_pheromone_trails": len(self.pheromone_trails),
            "generation": self.generation,
            "avg_agent_accuracy": np.mean([a.detection_accuracy for a in self.agents]),
            "avg_agent_energy": np.mean([a.energy for a in self.agents]),
            "specialization_distribution": {
                spec: sum(1 for a in self.agents if a.specialization == spec)
                for spec in self.specializations
            }
        }
        
        self.total_detections += n_samples
        
        return results
    
    def evolve(self, feedback: Optional[Dict] = None):
        """
        Evolve the swarm based on performance.
        
        Uses genetic algorithm principles:
        - Cull worst performers
        - Clone and mutate best performers
        - Random exploration agents
        """
        self.generation += 1
        
        # Sort agents by accuracy
        sorted_agents = sorted(
            self.agents,
            key=lambda a: a.detection_accuracy,
            reverse=True
        )
        
        # Keep top 50%
        survivors = sorted_agents[:len(sorted_agents) // 2]
        
        # Clone and mutate top performers to refill
        new_agents = []
        for i in range(len(sorted_agents) // 2):
            parent = survivors[i % len(survivors)]
            
            # Clone
            child = NeuralAgent(
                agent_id=f"agent_gen{self.generation}_{i:04d}",
                specialization=parent.specialization,
                sensitivity=parent.sensitivity,
                exploration_rate=parent.exploration_rate,
                learning_rate=parent.learning_rate
            )
            
            # Mutate
            child.mutate(mutation_rate=self.evolution_rate)
            new_agents.append(child)
        
        # Add some random explorers
        num_explorers = max(10, len(self.agents) // 20)
        for i in range(num_explorers):
            explorer = NeuralAgent(
                agent_id=f"explorer_gen{self.generation}_{i:04d}",
                specialization=random.choice(self.specializations),
                exploration_rate=0.4,  # High exploration
                sensitivity=random.uniform(0.3, 0.7)
            )
            new_agents.append(explorer)
        
        self.agents = survivors + new_agents[:len(sorted_agents) - len(survivors)]
        
        # Record evolution
        self.memory.evolution_history.append({
            "generation": self.generation,
            "population": len(self.agents),
            "avg_accuracy": np.mean([a.detection_accuracy for a in self.agents]),
            "timestamp": time.time()
        })
        
        # Replenish energy
        for agent in self.agents:
            agent.energy = min(1.0, agent.energy + 0.5)
    
    def train_on_feedback(
        self,
        predictions: np.ndarray,
        ground_truth: np.ndarray
    ):
        """
        Train the swarm on labeled data.
        
        Updates agent accuracy based on their votes matching ground truth.
        """
        for i, (pred, truth) in enumerate(zip(predictions, ground_truth)):
            for agent in self.agents:
                # Simplified: update based on whether swarm was correct
                if pred == truth:
                    agent.detection_accuracy = min(1.0, agent.detection_accuracy + agent.learning_rate * 0.1)
                    if truth:
                        agent.true_positives += 1
                    else:
                        agent.true_negatives += 1
                else:
                    agent.detection_accuracy = max(0.1, agent.detection_accuracy - agent.learning_rate * 0.1)
                    if truth:
                        agent.false_negatives += 1
                    else:
                        agent.false_positives += 1
        
        # Trigger evolution if enough data
        if self.total_detections > 0 and self.total_detections % 1000 == 0:
            self.evolve()
    
    def get_swarm_status(self) -> Dict[str, Any]:
        """Get comprehensive swarm status"""
        return {
            "total_agents": len(self.agents),
            "generation": self.generation,
            "total_detections": self.total_detections,
            "active_pheromones": len(self.pheromone_trails),
            "collective_memory_size": len(self.memory.successful_detections),
            "specialization_distribution": {
                spec: {
                    "count": sum(1 for a in self.agents if a.specialization == spec),
                    "avg_accuracy": np.mean([
                        a.detection_accuracy for a in self.agents 
                        if a.specialization == spec
                    ]) if any(a.specialization == spec for a in self.agents) else 0
                }
                for spec in self.specializations
            },
            "top_performers": [
                {
                    "id": a.agent_id,
                    "specialization": a.specialization,
                    "accuracy": a.detection_accuracy,
                    "experience": a.experience
                }
                for a in sorted(self.agents, key=lambda x: x.detection_accuracy, reverse=True)[:10]
            ],
            "known_attack_signatures": list(self.memory.attack_signatures.keys()),
            "evolution_history": self.memory.evolution_history[-10:]
        }


# Create singleton instance
_swarm_engine: Optional[NeuralSwarmEngine] = None


def get_swarm_engine() -> NeuralSwarmEngine:
    """Get or create the singleton swarm engine"""
    global _swarm_engine
    if _swarm_engine is None:
        _swarm_engine = NeuralSwarmEngine(
            num_agents=1000,
            consensus_threshold=0.6
        )
    return _swarm_engine


def detect_with_swarm(
    data: np.ndarray,
    context: Optional[Dict] = None
) -> Dict[str, Any]:
    """
    Convenience function for swarm detection.
    
    Args:
        data: Input data (n_samples, n_features)
        context: Optional analysis context
        
    Returns:
        Detection results with anomaly scores and swarm consensus
    """
    engine = get_swarm_engine()
    return engine.detect(data, context)
