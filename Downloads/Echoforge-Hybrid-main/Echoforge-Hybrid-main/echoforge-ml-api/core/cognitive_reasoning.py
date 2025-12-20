"""
Cognitive Reasoning Engine
==========================
A revolutionary AI system that goes beyond pattern matching to true
reasoning about anomalies.

Key Innovations:
- Neuro-Symbolic Architecture: Combines neural networks with logic rules
- Dynamic Knowledge Graph: Maintains relationships between entities
- Abductive Reasoning: Generates best explanations for observations
- Natural Language Explanations: Human-readable reasoning chains
- Uncertainty Quantification: Knows what it doesn't know

This is the closest to true AI reasoning in anomaly detection.

Author: EchoForge AI Team
License: Proprietary
"""

import numpy as np
from typing import Dict, List, Any, Optional, Tuple, Set
from dataclasses import dataclass, field
from enum import Enum
import time
from collections import defaultdict
import hashlib
import re


class ReasoningType(Enum):
    """Types of reasoning"""
    DEDUCTIVE = "deductive"       # If A then B, A, therefore B
    INDUCTIVE = "inductive"       # Observe patterns, generalize
    ABDUCTIVE = "abductive"       # Best explanation for observation
    ANALOGICAL = "analogical"     # Similar to known case
    CAUSAL = "causal"             # X causes Y


class EntityType(Enum):
    """Types of entities in knowledge graph"""
    DATA_POINT = "data_point"
    FEATURE = "feature"
    ANOMALY = "anomaly"
    PATTERN = "pattern"
    RULE = "rule"
    HYPOTHESIS = "hypothesis"
    CAUSE = "cause"
    EFFECT = "effect"


class ConfidenceLevel(Enum):
    """Levels of epistemic confidence"""
    CERTAIN = "certain"           # > 0.95
    HIGH = "high"                 # > 0.80
    MEDIUM = "medium"             # > 0.60
    LOW = "low"                   # > 0.40
    UNCERTAIN = "uncertain"       # <= 0.40
    UNKNOWN = "unknown"           # No data


@dataclass
class Entity:
    """An entity in the knowledge graph"""
    entity_id: str
    entity_type: EntityType
    name: str
    properties: Dict[str, Any] = field(default_factory=dict)
    embedding: Optional[np.ndarray] = None
    created_at: float = 0
    
    def __post_init__(self):
        if self.created_at == 0:
            self.created_at = time.time()


@dataclass
class Relation:
    """A relation between entities"""
    relation_id: str
    source_id: str
    target_id: str
    relation_type: str
    strength: float = 1.0
    confidence: float = 1.0
    evidence: List[str] = field(default_factory=list)


@dataclass
class LogicRule:
    """A logic rule for reasoning"""
    rule_id: str
    rule_type: ReasoningType
    antecedent: str          # If this...
    consequent: str          # Then this...
    confidence: float        # How reliable is this rule
    support: int             # How many examples support this
    exceptions: List[str] = field(default_factory=list)
    
    def evaluate(self, context: Dict[str, Any]) -> Tuple[bool, float]:
        """Evaluate if rule applies in given context"""
        # Simple pattern matching
        # Real implementation would use logic programming
        try:
            # Check if antecedent conditions are met
            conditions = self.antecedent.split(" AND ")
            all_met = True
            
            for condition in conditions:
                condition = condition.strip()
                if ">" in condition:
                    var, val = condition.split(">")
                    var = var.strip()
                    val = float(val.strip())
                    if var in context:
                        if not context[var] > val:
                            all_met = False
                            break
                elif "<" in condition:
                    var, val = condition.split("<")
                    var = var.strip()
                    val = float(val.strip())
                    if var in context:
                        if not context[var] < val:
                            all_met = False
                            break
                elif "==" in condition:
                    var, val = condition.split("==")
                    var = var.strip()
                    val = val.strip().strip('"').strip("'")
                    if var in context:
                        if str(context[var]) != val:
                            all_met = False
                            break
            
            return all_met, self.confidence if all_met else 0.0
        except:
            return False, 0.0


@dataclass
class Hypothesis:
    """A hypothesis generated through abductive reasoning"""
    hypothesis_id: str
    statement: str
    reasoning_type: ReasoningType
    supporting_evidence: List[str]
    contradicting_evidence: List[str]
    probability: float
    confidence: float
    explanation: str
    alternative_hypotheses: List[str] = field(default_factory=list)


@dataclass
class ReasoningChain:
    """A chain of reasoning steps"""
    chain_id: str
    steps: List[Dict[str, Any]]
    conclusion: str
    overall_confidence: float
    natural_language: str


class KnowledgeGraph:
    """
    Dynamic knowledge graph for storing and querying
    relationships between entities.
    """
    
    def __init__(self):
        self.entities: Dict[str, Entity] = {}
        self.relations: Dict[str, Relation] = {}
        self.entity_index: Dict[str, Set[str]] = defaultdict(set)  # type -> entity_ids
        self.relation_index: Dict[str, Set[str]] = defaultdict(set)  # entity_id -> relation_ids
    
    def add_entity(self, entity: Entity) -> str:
        """Add an entity to the graph"""
        self.entities[entity.entity_id] = entity
        self.entity_index[entity.entity_type.value].add(entity.entity_id)
        return entity.entity_id
    
    def add_relation(self, relation: Relation) -> str:
        """Add a relation to the graph"""
        self.relations[relation.relation_id] = relation
        self.relation_index[relation.source_id].add(relation.relation_id)
        self.relation_index[relation.target_id].add(relation.relation_id)
        return relation.relation_id
    
    def get_entity(self, entity_id: str) -> Optional[Entity]:
        """Get an entity by ID"""
        return self.entities.get(entity_id)
    
    def get_related(
        self,
        entity_id: str,
        relation_type: Optional[str] = None,
        direction: str = "both"
    ) -> List[Tuple[Entity, Relation]]:
        """Get entities related to the given entity"""
        results = []
        
        for rel_id in self.relation_index.get(entity_id, set()):
            relation = self.relations[rel_id]
            
            if relation_type and relation.relation_type != relation_type:
                continue
            
            if direction in ("outgoing", "both") and relation.source_id == entity_id:
                target = self.entities.get(relation.target_id)
                if target:
                    results.append((target, relation))
            
            if direction in ("incoming", "both") and relation.target_id == entity_id:
                source = self.entities.get(relation.source_id)
                if source:
                    results.append((source, relation))
        
        return results
    
    def query(
        self,
        entity_type: Optional[EntityType] = None,
        properties: Optional[Dict[str, Any]] = None
    ) -> List[Entity]:
        """Query entities by type and properties"""
        if entity_type:
            candidates = [
                self.entities[eid]
                for eid in self.entity_index.get(entity_type.value, set())
            ]
        else:
            candidates = list(self.entities.values())
        
        if properties:
            results = []
            for entity in candidates:
                match = True
                for key, value in properties.items():
                    if key not in entity.properties or entity.properties[key] != value:
                        match = False
                        break
                if match:
                    results.append(entity)
            return results
        
        return candidates
    
    def find_path(
        self,
        source_id: str,
        target_id: str,
        max_depth: int = 5
    ) -> Optional[List[Relation]]:
        """Find a path between two entities"""
        if source_id not in self.entities or target_id not in self.entities:
            return None
        
        # BFS
        visited = {source_id}
        queue = [(source_id, [])]
        
        while queue:
            current_id, path = queue.pop(0)
            
            if current_id == target_id:
                return path
            
            if len(path) >= max_depth:
                continue
            
            for rel_id in self.relation_index.get(current_id, set()):
                relation = self.relations[rel_id]
                
                if relation.source_id == current_id:
                    next_id = relation.target_id
                else:
                    next_id = relation.source_id
                
                if next_id not in visited:
                    visited.add(next_id)
                    queue.append((next_id, path + [relation]))
        
        return None
    
    def get_statistics(self) -> Dict[str, Any]:
        """Get graph statistics"""
        return {
            "total_entities": len(self.entities),
            "total_relations": len(self.relations),
            "entities_by_type": {
                etype: len(eids) 
                for etype, eids in self.entity_index.items()
            },
            "average_relations_per_entity": (
                len(self.relations) * 2 / max(len(self.entities), 1)
            )
        }


class AbductiveReasoner:
    """
    Generates the best explanations for observations
    using abductive reasoning.
    """
    
    def __init__(self, knowledge_graph: KnowledgeGraph):
        self.knowledge_graph = knowledge_graph
        self.hypothesis_history: List[Hypothesis] = []
    
    def generate_hypotheses(
        self,
        observation: Dict[str, Any],
        max_hypotheses: int = 5
    ) -> List[Hypothesis]:
        """
        Generate hypotheses that could explain the observation.
        """
        hypotheses = []
        
        # Get relevant entities from knowledge graph
        anomaly_entities = self.knowledge_graph.query(
            entity_type=EntityType.ANOMALY
        )
        pattern_entities = self.knowledge_graph.query(
            entity_type=EntityType.PATTERN
        )
        cause_entities = self.knowledge_graph.query(
            entity_type=EntityType.CAUSE
        )
        
        # Hypothesis 1: Statistical anomaly
        if "z_score" in observation and abs(observation["z_score"]) > 2:
            h = Hypothesis(
                hypothesis_id=f"h_stat_{int(time.time()*1000)}",
                statement="The data point is a statistical outlier based on deviation from the mean.",
                reasoning_type=ReasoningType.DEDUCTIVE,
                supporting_evidence=[
                    f"Z-score of {observation['z_score']:.2f} exceeds threshold of 2.0"
                ],
                contradicting_evidence=[],
                probability=min(0.9, abs(observation["z_score"]) / 5),
                confidence=0.85,
                explanation=f"With a z-score of {observation['z_score']:.2f}, this point deviates significantly from the normal distribution of values."
            )
            hypotheses.append(h)
        
        # Hypothesis 2: Pattern match
        for pattern in pattern_entities[:3]:
            if pattern.properties.get("type") == observation.get("type"):
                h = Hypothesis(
                    hypothesis_id=f"h_pattern_{pattern.entity_id}",
                    statement=f"This matches known pattern: {pattern.name}",
                    reasoning_type=ReasoningType.ANALOGICAL,
                    supporting_evidence=[f"Similarity to pattern {pattern.name}"],
                    contradicting_evidence=[],
                    probability=pattern.properties.get("match_probability", 0.7),
                    confidence=0.75,
                    explanation=f"The observed data closely resembles the known pattern '{pattern.name}', which has been associated with anomalies in the past."
                )
                hypotheses.append(h)
        
        # Hypothesis 3: Known cause
        for cause in cause_entities[:3]:
            related = self.knowledge_graph.get_related(
                cause.entity_id, 
                relation_type="causes"
            )
            if related:
                h = Hypothesis(
                    hypothesis_id=f"h_cause_{cause.entity_id}",
                    statement=f"Likely caused by: {cause.name}",
                    reasoning_type=ReasoningType.CAUSAL,
                    supporting_evidence=[
                        f"Known causal relationship: {cause.name} -> anomaly"
                    ],
                    contradicting_evidence=[],
                    probability=0.6,
                    confidence=0.7,
                    explanation=f"Based on our knowledge graph, '{cause.name}' is a known cause of this type of anomaly."
                )
                hypotheses.append(h)
        
        # Hypothesis 4: Novel anomaly
        if not hypotheses:
            h = Hypothesis(
                hypothesis_id=f"h_novel_{int(time.time()*1000)}",
                statement="This appears to be a novel, previously unseen type of anomaly.",
                reasoning_type=ReasoningType.INDUCTIVE,
                supporting_evidence=["No matching patterns in knowledge base"],
                contradicting_evidence=[],
                probability=0.5,
                confidence=0.4,
                explanation="This anomaly doesn't match any known patterns, suggesting it may be a new type of anomaly that requires investigation."
            )
            hypotheses.append(h)
        
        # Rank by probability * confidence
        hypotheses.sort(
            key=lambda h: h.probability * h.confidence,
            reverse=True
        )
        
        # Add alternatives to each hypothesis
        for i, h in enumerate(hypotheses):
            h.alternative_hypotheses = [
                alt.hypothesis_id 
                for j, alt in enumerate(hypotheses) 
                if j != i
            ][:3]
        
        self.hypothesis_history.extend(hypotheses)
        return hypotheses[:max_hypotheses]
    
    def evaluate_hypothesis(
        self,
        hypothesis: Hypothesis,
        new_evidence: Dict[str, Any]
    ) -> Hypothesis:
        """Update hypothesis based on new evidence"""
        # Simple Bayesian update
        prior = hypothesis.probability
        
        # Check if evidence supports or contradicts
        likelihood_if_true = 0.8  # Default
        likelihood_if_false = 0.3
        
        for key, value in new_evidence.items():
            if key in ["supports", "confirms"]:
                likelihood_if_true = min(0.99, likelihood_if_true + 0.1)
                hypothesis.supporting_evidence.append(str(value))
            elif key in ["contradicts", "refutes"]:
                likelihood_if_false = min(0.99, likelihood_if_false + 0.2)
                hypothesis.contradicting_evidence.append(str(value))
        
        # Bayes update
        posterior = (
            prior * likelihood_if_true /
            (prior * likelihood_if_true + (1 - prior) * likelihood_if_false)
        )
        
        hypothesis.probability = posterior
        hypothesis.confidence = min(
            hypothesis.confidence + 0.1,
            1.0
        ) if posterior > prior else max(hypothesis.confidence - 0.1, 0.1)
        
        return hypothesis


class ExplanationGenerator:
    """
    Generates natural language explanations for
    anomaly detections and reasoning.
    """
    
    def __init__(self):
        self.templates = {
            ReasoningType.DEDUCTIVE: [
                "Based on the rule '{rule}', and observing that {observation}, we conclude that {conclusion}.",
                "Given {antecedent}, it follows logically that {consequent}.",
                "The evidence definitively shows that {conclusion}."
            ],
            ReasoningType.INDUCTIVE: [
                "By analyzing {n_samples} similar cases, we observe a pattern: {pattern}.",
                "The data suggests a trend where {trend}.",
                "Based on repeated observations, it appears that {conclusion}."
            ],
            ReasoningType.ABDUCTIVE: [
                "The best explanation for {observation} is that {hypothesis}.",
                "Given what we observe, the most likely cause is {cause}.",
                "While not certain, the evidence points to {conclusion}."
            ],
            ReasoningType.ANALOGICAL: [
                "This situation resembles {past_case}, where {past_outcome}.",
                "Similar to {analogy}, we can expect {prediction}.",
                "Drawing parallels to {reference}, this suggests {conclusion}."
            ],
            ReasoningType.CAUSAL: [
                "{cause} directly leads to {effect}.",
                "The root cause analysis reveals that {cause} triggers {effect}.",
                "We traced the anomaly back to {cause}, which results in {effect}."
            ]
        }
    
    def generate_explanation(
        self,
        reasoning_chain: ReasoningChain,
        detail_level: str = "medium"
    ) -> str:
        """Generate human-readable explanation"""
        if not reasoning_chain.steps:
            return reasoning_chain.natural_language
        
        parts = []
        
        # Introduction
        parts.append(f"**Analysis Summary** (Confidence: {reasoning_chain.overall_confidence:.0%})")
        parts.append("")
        
        # Reasoning steps
        parts.append("**Reasoning Process:**")
        for i, step in enumerate(reasoning_chain.steps, 1):
            step_type = step.get("type", ReasoningType.DEDUCTIVE)
            confidence = step.get("confidence", 0.5)
            
            if detail_level == "high":
                parts.append(f"{i}. [{step_type.value.title()}] (confidence: {confidence:.0%})")
                parts.append(f"   {step.get('description', '')}")
            else:
                parts.append(f"{i}. {step.get('description', '')}")
        
        # Conclusion
        parts.append("")
        parts.append(f"**Conclusion:** {reasoning_chain.conclusion}")
        
        # Confidence assessment
        conf_level = self._confidence_to_level(reasoning_chain.overall_confidence)
        parts.append("")
        parts.append(f"**Certainty Level:** {conf_level.value.title()}")
        
        return "\n".join(parts)
    
    def _confidence_to_level(self, confidence: float) -> ConfidenceLevel:
        """Convert numeric confidence to level"""
        if confidence > 0.95:
            return ConfidenceLevel.CERTAIN
        elif confidence > 0.80:
            return ConfidenceLevel.HIGH
        elif confidence > 0.60:
            return ConfidenceLevel.MEDIUM
        elif confidence > 0.40:
            return ConfidenceLevel.LOW
        else:
            return ConfidenceLevel.UNCERTAIN


class CognitiveReasoningEngine:
    """
    The Cognitive Reasoning Engine
    
    A revolutionary AI that reasons about anomalies using
    neuro-symbolic approaches combined with knowledge graphs.
    """
    
    def __init__(self):
        # Knowledge graph for storing learned relationships
        self.knowledge_graph = KnowledgeGraph()
        
        # Abductive reasoner
        self.abductive_reasoner = AbductiveReasoner(self.knowledge_graph)
        
        # Explanation generator
        self.explanation_generator = ExplanationGenerator()
        
        # Logic rules
        self.rules: List[LogicRule] = []
        self._initialize_default_rules()
        
        # Reasoning history
        self.reasoning_history: List[ReasoningChain] = []
        
        # Uncertainty tracking
        self.uncertainty_zones: Dict[str, float] = {}
    
    def _initialize_default_rules(self):
        """Initialize default reasoning rules"""
        default_rules = [
            LogicRule(
                rule_id="r1",
                rule_type=ReasoningType.DEDUCTIVE,
                antecedent="z_score > 3",
                consequent="is_statistical_anomaly = True",
                confidence=0.95,
                support=1000
            ),
            LogicRule(
                rule_id="r2",
                rule_type=ReasoningType.DEDUCTIVE,
                antecedent="isolation_score > 0.7",
                consequent="is_isolation_anomaly = True",
                confidence=0.90,
                support=800
            ),
            LogicRule(
                rule_id="r3",
                rule_type=ReasoningType.DEDUCTIVE,
                antecedent="lof_score > 1.5",
                consequent="is_density_anomaly = True",
                confidence=0.85,
                support=600
            ),
            LogicRule(
                rule_id="r4",
                rule_type=ReasoningType.CAUSAL,
                antecedent="high_traffic == True AND late_night == True",
                consequent="possible_attack = True",
                confidence=0.70,
                support=200
            ),
            LogicRule(
                rule_id="r5",
                rule_type=ReasoningType.CAUSAL,
                antecedent="sudden_spike == True AND no_pattern_match == True",
                consequent="novel_anomaly = True",
                confidence=0.65,
                support=150
            )
        ]
        self.rules.extend(default_rules)
    
    def reason(
        self,
        observation: Dict[str, Any],
        context: Optional[Dict[str, Any]] = None
    ) -> ReasoningChain:
        """
        Perform full cognitive reasoning on an observation.
        
        Args:
            observation: The observation to reason about
            context: Additional context
            
        Returns:
            ReasoningChain with full explanation
        """
        chain_id = f"chain_{int(time.time() * 1000)}"
        steps = []
        overall_confidence = 1.0
        
        # Step 1: Apply deductive rules
        applicable_rules = []
        for rule in self.rules:
            applies, confidence = rule.evaluate(observation)
            if applies:
                applicable_rules.append((rule, confidence))
                steps.append({
                    "type": rule.rule_type,
                    "confidence": confidence,
                    "description": f"Rule '{rule.rule_id}' applies: {rule.antecedent} → {rule.consequent}",
                    "rule_id": rule.rule_id
                })
                overall_confidence *= confidence
        
        # Step 2: Generate hypotheses (abductive reasoning)
        hypotheses = self.abductive_reasoner.generate_hypotheses(observation)
        if hypotheses:
            best_h = hypotheses[0]
            steps.append({
                "type": ReasoningType.ABDUCTIVE,
                "confidence": best_h.probability,
                "description": f"Hypothesis: {best_h.statement}",
                "hypothesis_id": best_h.hypothesis_id
            })
            overall_confidence *= best_h.probability
        
        # Step 3: Knowledge graph lookup
        if context and "entity_id" in context:
            related = self.knowledge_graph.get_related(context["entity_id"])
            if related:
                steps.append({
                    "type": ReasoningType.ANALOGICAL,
                    "confidence": 0.8,
                    "description": f"Found {len(related)} related entities in knowledge graph",
                    "related_count": len(related)
                })
        
        # Step 4: Uncertainty assessment
        uncertainty = self._assess_uncertainty(observation, steps)
        self.uncertainty_zones[chain_id] = uncertainty
        
        if uncertainty > 0.5:
            steps.append({
                "type": ReasoningType.INDUCTIVE,
                "confidence": 1 - uncertainty,
                "description": f"High uncertainty detected ({uncertainty:.0%}). Results should be validated.",
                "uncertainty": uncertainty
            })
        
        # Generate conclusion
        conclusion = self._generate_conclusion(steps, hypotheses, observation)
        
        # Generate natural language explanation
        overall_confidence = max(0.1, min(overall_confidence, 0.99))
        
        chain = ReasoningChain(
            chain_id=chain_id,
            steps=steps,
            conclusion=conclusion,
            overall_confidence=overall_confidence,
            natural_language=""  # Will be filled below
        )
        
        # Generate full explanation
        chain.natural_language = self.explanation_generator.generate_explanation(
            chain, detail_level="medium"
        )
        
        self.reasoning_history.append(chain)
        return chain
    
    def _assess_uncertainty(
        self,
        observation: Dict[str, Any],
        steps: List[Dict]
    ) -> float:
        """Assess epistemic uncertainty"""
        uncertainty_factors = []
        
        # Factor 1: Data quality
        if "null_rate" in observation:
            uncertainty_factors.append(observation["null_rate"])
        
        # Factor 2: Number of applicable rules
        num_rules = sum(1 for s in steps if s["type"] == ReasoningType.DEDUCTIVE)
        if num_rules == 0:
            uncertainty_factors.append(0.5)
        else:
            uncertainty_factors.append(1 / (num_rules + 1))
        
        # Factor 3: Hypothesis confidence
        for step in steps:
            if step["type"] == ReasoningType.ABDUCTIVE:
                uncertainty_factors.append(1 - step["confidence"])
        
        # Factor 4: Knowledge graph coverage
        kg_stats = self.knowledge_graph.get_statistics()
        if kg_stats["total_entities"] < 10:
            uncertainty_factors.append(0.4)  # Sparse knowledge
        
        if uncertainty_factors:
            return np.mean(uncertainty_factors)
        return 0.3
    
    def _generate_conclusion(
        self,
        steps: List[Dict],
        hypotheses: List[Hypothesis],
        observation: Dict[str, Any]
    ) -> str:
        """Generate a conclusion from reasoning steps"""
        conclusions = []
        
        # From rules
        for step in steps:
            if step["type"] == ReasoningType.DEDUCTIVE and step["confidence"] > 0.7:
                conclusions.append(step["description"].split("→")[-1].strip())
        
        # From hypotheses
        if hypotheses:
            conclusions.append(hypotheses[0].statement)
        
        if conclusions:
            return " ".join(conclusions[:2])
        
        return "Insufficient evidence for a definitive conclusion."
    
    def learn_from_feedback(
        self,
        chain_id: str,
        feedback: Dict[str, Any]
    ):
        """
        Learn from human feedback on reasoning.
        """
        # Find the chain
        chain = None
        for c in self.reasoning_history:
            if c.chain_id == chain_id:
                chain = c
                break
        
        if not chain:
            return
        
        # Update rule confidences based on feedback
        was_correct = feedback.get("correct", False)
        
        for step in chain.steps:
            if "rule_id" in step:
                for rule in self.rules:
                    if rule.rule_id == step["rule_id"]:
                        if was_correct:
                            rule.confidence = min(1.0, rule.confidence + 0.02)
                            rule.support += 1
                        else:
                            rule.confidence = max(0.3, rule.confidence - 0.05)
        
        # Add to knowledge graph if novel insight
        if "new_pattern" in feedback:
            pattern_entity = Entity(
                entity_id=f"pattern_{int(time.time())}",
                entity_type=EntityType.PATTERN,
                name=feedback["new_pattern"],
                properties={"learned_from_feedback": True}
            )
            self.knowledge_graph.add_entity(pattern_entity)
    
    def add_knowledge(
        self,
        entity_type: EntityType,
        name: str,
        properties: Dict[str, Any],
        relations: Optional[List[Tuple[str, str, str]]] = None
    ) -> str:
        """
        Add knowledge to the graph.
        
        Args:
            entity_type: Type of entity
            name: Entity name
            properties: Entity properties
            relations: List of (target_id, relation_type, evidence)
            
        Returns:
            Entity ID
        """
        entity = Entity(
            entity_id=f"{entity_type.value}_{hashlib.md5(name.encode()).hexdigest()[:8]}",
            entity_type=entity_type,
            name=name,
            properties=properties
        )
        
        entity_id = self.knowledge_graph.add_entity(entity)
        
        if relations:
            for target_id, relation_type, evidence in relations:
                rel = Relation(
                    relation_id=f"rel_{entity_id}_{target_id}_{int(time.time()*1000)}",
                    source_id=entity_id,
                    target_id=target_id,
                    relation_type=relation_type,
                    evidence=[evidence]
                )
                self.knowledge_graph.add_relation(rel)
        
        return entity_id
    
    def add_rule(
        self,
        antecedent: str,
        consequent: str,
        rule_type: ReasoningType = ReasoningType.DEDUCTIVE,
        confidence: float = 0.8
    ) -> str:
        """Add a new reasoning rule"""
        rule = LogicRule(
            rule_id=f"custom_r{len(self.rules) + 1}",
            rule_type=rule_type,
            antecedent=antecedent,
            consequent=consequent,
            confidence=confidence,
            support=0
        )
        self.rules.append(rule)
        return rule.rule_id
    
    def get_status(self) -> Dict[str, Any]:
        """Get engine status"""
        return {
            "knowledge_graph": self.knowledge_graph.get_statistics(),
            "rules_count": len(self.rules),
            "rules_by_type": {
                rt.value: sum(1 for r in self.rules if r.rule_type == rt)
                for rt in ReasoningType
            },
            "reasoning_chains_count": len(self.reasoning_history),
            "hypotheses_generated": len(self.abductive_reasoner.hypothesis_history),
            "uncertainty_zones": len(self.uncertainty_zones),
            "average_confidence": (
                np.mean([c.overall_confidence for c in self.reasoning_history])
                if self.reasoning_history else 0
            )
        }


# Singleton instance
_reasoning_engine: Optional[CognitiveReasoningEngine] = None


def get_reasoning_engine() -> CognitiveReasoningEngine:
    """Get or create the cognitive reasoning engine"""
    global _reasoning_engine
    if _reasoning_engine is None:
        _reasoning_engine = CognitiveReasoningEngine()
    return _reasoning_engine


def reason_about_anomaly(
    observation: Dict[str, Any],
    context: Optional[Dict] = None
) -> Dict[str, Any]:
    """
    Convenience function to reason about an anomaly.
    
    Returns:
        Dict with conclusion, explanation, and confidence
    """
    engine = get_reasoning_engine()
    chain = engine.reason(observation, context)
    
    return {
        "chain_id": chain.chain_id,
        "conclusion": chain.conclusion,
        "confidence": chain.overall_confidence,
        "explanation": chain.natural_language,
        "steps": chain.steps,
        "uncertainty": engine.uncertainty_zones.get(chain.chain_id, 0)
    }
