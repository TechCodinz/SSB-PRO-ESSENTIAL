"""
Marketplace Anomaly Detection & Moderation
============================================
AI-powered marketplace protection that:
- Detects fraudulent listings
- Identifies counterfeit products
- Catches suspicious pricing
- Moderates content automatically
- Protects buyers and sellers

Author: EchoForge AI Team
License: Proprietary
"""

import numpy as np
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass, field
from enum import Enum
import time
import hashlib
import re
from collections import defaultdict


class ListingStatus(Enum):
    """Listing status"""
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    FLAGGED = "flagged"
    REMOVED = "removed"
    UNDER_REVIEW = "under_review"


class ThreatType(Enum):
    """Types of marketplace threats"""
    FRAUD = "fraud"
    COUNTERFEIT = "counterfeit"
    PRICE_MANIPULATION = "price_manipulation"
    SUSPICIOUS_SELLER = "suspicious_seller"
    PROHIBITED_CONTENT = "prohibited_content"
    SPAM = "spam"
    ACCOUNT_TAKEOVER = "account_takeover"
    MONEY_LAUNDERING = "money_laundering"
    FAKE_REVIEWS = "fake_reviews"
    BOT_ACTIVITY = "bot_activity"


class RiskLevel(Enum):
    """Risk levels"""
    CRITICAL = "critical"    # Immediate action
    HIGH = "high"            # Review within 1h
    MEDIUM = "medium"        # Review within 24h
    LOW = "low"              # Monitor
    SAFE = "safe"            # No action needed


@dataclass
class SellerProfile:
    """Seller profile with trust metrics"""
    seller_id: str
    name: str
    email: str
    registered_at: float
    total_sales: int = 0
    total_revenue: float = 0
    rating: float = 0.0
    review_count: int = 0
    verified: bool = False
    trust_score: float = 0.5
    risk_flags: List[str] = field(default_factory=list)
    listing_count: int = 0
    rejection_count: int = 0
    warning_count: int = 0
    suspended: bool = False
    metadata: Dict = field(default_factory=dict)


@dataclass
class Listing:
    """Marketplace listing"""
    listing_id: str
    seller_id: str
    title: str
    description: str
    price: float
    currency: str = "USD"
    category: str = ""
    images: List[str] = field(default_factory=list)
    status: ListingStatus = ListingStatus.PENDING
    created_at: float = 0
    updated_at: float = 0
    views: int = 0
    sales: int = 0
    risk_score: float = 0
    risk_factors: List[str] = field(default_factory=list)
    ai_moderated: bool = False
    human_reviewed: bool = False
    metadata: Dict = field(default_factory=dict)
    
    def __post_init__(self):
        if self.created_at == 0:
            self.created_at = time.time()
        self.updated_at = self.created_at


@dataclass
class ModerationResult:
    """Result of AI moderation"""
    listing_id: str
    status: ListingStatus
    risk_level: RiskLevel
    risk_score: float
    threats_detected: List[ThreatType]
    risk_factors: List[str]
    recommendation: str
    confidence: float
    processing_time_ms: float
    auto_action_taken: bool
    requires_human_review: bool


class PriceAnalyzer:
    """Analyzes pricing for anomalies"""
    
    def __init__(self):
        self.category_prices: Dict[str, List[float]] = defaultdict(list)
        self.max_samples = 10000
    
    def record_price(self, category: str, price: float):
        """Record a price for category analysis"""
        self.category_prices[category].append(price)
        if len(self.category_prices[category]) > self.max_samples:
            self.category_prices[category] = self.category_prices[category][-self.max_samples:]
    
    def analyze(self, category: str, price: float) -> Dict[str, Any]:
        """Analyze if price is anomalous"""
        prices = self.category_prices.get(category, [])
        
        if len(prices) < 10:
            return {"anomaly": False, "reason": "insufficient_data", "score": 0}
        
        mean = np.mean(prices)
        std = np.std(prices)
        
        if std < 0.01:
            return {"anomaly": False, "reason": "stable_prices", "score": 0}
        
        z_score = (price - mean) / std
        
        result = {
            "z_score": float(z_score),
            "mean": float(mean),
            "std": float(std),
            "percentile": float(np.sum(np.array(prices) < price) / len(prices) * 100)
        }
        
        # Too cheap (potential scam)
        if z_score < -2:
            result["anomaly"] = True
            result["type"] = "too_cheap"
            result["score"] = min(abs(z_score) / 5, 1)
            result["reason"] = f"Price ${price:.2f} is {abs(z_score):.1f}σ below average ${mean:.2f}"
        
        # Too expensive (potential fraud)
        elif z_score > 3:
            result["anomaly"] = True
            result["type"] = "too_expensive"
            result["score"] = min(z_score / 10, 1)
            result["reason"] = f"Price ${price:.2f} is {z_score:.1f}σ above average ${mean:.2f}"
        
        else:
            result["anomaly"] = False
            result["type"] = "normal"
            result["score"] = 0
            result["reason"] = "Price within normal range"
        
        return result


class ContentAnalyzer:
    """Analyzes listing content for issues"""
    
    def __init__(self):
        # Suspicious patterns
        self.spam_patterns = [
            r'\$\$\$', r'FREE MONEY', r'GUARANTEED',
            r'ACT NOW', r'LIMITED TIME', r'URGENT',
            r'[\p{L}]+@[\p{L}]+\.(com|net|org)',  # Email patterns
            r'bit\.ly|tinyurl|goo\.gl',  # URL shorteners
            r'whatsapp|telegram|signal',  # Off-platform contact
        ]
        
        self.prohibited_keywords = [
            'counterfeit', 'replica', 'fake', 'knockoff',
            'stolen', 'illegal', 'drugs', 'weapons',
            'prescription', 'controlled substance'
        ]
        
        self.scam_indicators = [
            'wire transfer', 'western union', 'moneygram',
            'gift card', 'bitcoin only', 'no returns',
            'too good to be true', 'act fast'
        ]
    
    def analyze(self, title: str, description: str) -> Dict[str, Any]:
        """Analyze content for issues"""
        full_text = f"{title} {description}".lower()
        issues = []
        risk_score = 0
        
        # Check spam patterns
        for pattern in self.spam_patterns:
            if re.search(pattern, full_text, re.IGNORECASE):
                issues.append(f"spam_pattern:{pattern}")
                risk_score += 20
        
        # Check prohibited keywords
        for keyword in self.prohibited_keywords:
            if keyword in full_text:
                issues.append(f"prohibited:{keyword}")
                risk_score += 40
        
        # Check scam indicators
        for indicator in self.scam_indicators:
            if indicator in full_text:
                issues.append(f"scam_indicator:{indicator}")
                risk_score += 30
        
        # Text quality analysis
        if len(description) < 20:
            issues.append("short_description")
            risk_score += 10
        
        if title.isupper():
            issues.append("all_caps_title")
            risk_score += 15
        
        if len(set(full_text.split())) < 5:
            issues.append("low_vocabulary")
            risk_score += 10
        
        # Excessive punctuation
        punct_ratio = sum(1 for c in full_text if c in '!?$%') / max(len(full_text), 1)
        if punct_ratio > 0.1:
            issues.append("excessive_punctuation")
            risk_score += 15
        
        return {
            "issues": issues,
            "risk_score": min(risk_score, 100),
            "has_prohibited": any("prohibited" in i for i in issues),
            "has_spam": any("spam" in i for i in issues),
            "has_scam_indicators": any("scam" in i for i in issues)
        }


class SellerRiskAnalyzer:
    """Analyzes seller risk profile"""
    
    def __init__(self):
        self.suspicious_patterns: Dict[str, List[float]] = {}  # seller_id -> timestamps
    
    def analyze(self, seller: SellerProfile, listing: Listing) -> Dict[str, Any]:
        """Analyze seller risk for this listing"""
        risk_factors = []
        risk_score = 0
        
        # New seller risk
        account_age_days = (time.time() - seller.registered_at) / 86400
        if account_age_days < 7:
            risk_factors.append("new_account")
            risk_score += 25
        elif account_age_days < 30:
            risk_factors.append("young_account")
            risk_score += 10
        
        # Unverified seller
        if not seller.verified:
            risk_factors.append("unverified")
            risk_score += 15
        
        # Low trust score
        if seller.trust_score < 0.3:
            risk_factors.append("low_trust")
            risk_score += 30
        
        # High rejection rate
        if seller.listing_count > 5:
            rejection_rate = seller.rejection_count / seller.listing_count
            if rejection_rate > 0.3:
                risk_factors.append("high_rejection_rate")
                risk_score += 25
        
        # Previous warnings
        if seller.warning_count > 0:
            risk_factors.append(f"previous_warnings:{seller.warning_count}")
            risk_score += seller.warning_count * 10
        
        # Velocity check - too many listings too fast
        if seller.listing_count > 10 and account_age_days < 3:
            risk_factors.append("high_velocity")
            risk_score += 20
        
        # Rating issues
        if seller.review_count > 5 and seller.rating < 3.0:
            risk_factors.append("poor_ratings")
            risk_score += 20
        
        return {
            "risk_factors": risk_factors,
            "risk_score": min(risk_score, 100),
            "trust_score": seller.trust_score,
            "account_age_days": account_age_days,
            "recommendation": self._get_recommendation(risk_score)
        }
    
    def _get_recommendation(self, risk_score: float) -> str:
        if risk_score >= 70:
            return "block_and_review"
        elif risk_score >= 50:
            return "hold_for_review"
        elif risk_score >= 30:
            return "enhanced_monitoring"
        else:
            return "normal_processing"


class MarketplaceProtector:
    """
    The AI-powered marketplace protection system.
    
    Features:
    - Automatic listing moderation
    - Fraud detection
    - Price anomaly detection
    - Seller risk assessment
    - Content moderation
    - Real-time monitoring
    """
    
    def __init__(
        self,
        auto_approve_threshold: float = 0.2,
        auto_reject_threshold: float = 0.8,
        auto_flag_threshold: float = 0.5
    ):
        self.auto_approve_threshold = auto_approve_threshold
        self.auto_reject_threshold = auto_reject_threshold
        self.auto_flag_threshold = auto_flag_threshold
        
        # Analyzers
        self.price_analyzer = PriceAnalyzer()
        self.content_analyzer = ContentAnalyzer()
        self.seller_analyzer = SellerRiskAnalyzer()
        
        # Data
        self.listings: Dict[str, Listing] = {}
        self.sellers: Dict[str, SellerProfile] = {}
        self.moderation_history: List[ModerationResult] = []
        
        # Statistics
        self.stats = {
            "listings_processed": 0,
            "auto_approved": 0,
            "auto_rejected": 0,
            "flagged_for_review": 0,
            "threats_detected": 0,
            "fraud_prevented": 0
        }
    
    def register_seller(
        self,
        seller_id: str,
        name: str,
        email: str
    ) -> SellerProfile:
        """Register a new seller"""
        seller = SellerProfile(
            seller_id=seller_id,
            name=name,
            email=email,
            registered_at=time.time()
        )
        self.sellers[seller_id] = seller
        return seller
    
    def get_seller(self, seller_id: str) -> Optional[SellerProfile]:
        """Get seller profile"""
        return self.sellers.get(seller_id)
    
    def moderate_listing(
        self,
        listing: Listing,
        auto_action: bool = True
    ) -> ModerationResult:
        """
        AI moderates a listing.
        
        Returns complete moderation result with:
        - Risk assessment
        - Detected threats
        - Recommended action
        - Whether auto-action was taken
        """
        start_time = time.time()
        
        # Get or create seller
        seller = self.sellers.get(listing.seller_id)
        if not seller:
            seller = SellerProfile(
                seller_id=listing.seller_id,
                name="Unknown",
                email="unknown@unknown.com",
                registered_at=time.time()
            )
            self.sellers[listing.seller_id] = seller
        
        # Run all analyzers
        price_result = self.price_analyzer.analyze(listing.category, listing.price)
        content_result = self.content_analyzer.analyze(listing.title, listing.description)
        seller_result = self.seller_analyzer.analyze(seller, listing)
        
        # Combine risk scores
        combined_risk = (
            price_result.get("score", 0) * 0.3 +
            content_result.get("risk_score", 0) / 100 * 0.4 +
            seller_result.get("risk_score", 0) / 100 * 0.3
        )
        
        # Detect threats
        threats = []
        risk_factors = []
        
        if price_result.get("anomaly"):
            if price_result.get("type") == "too_cheap":
                threats.append(ThreatType.FRAUD)
            else:
                threats.append(ThreatType.PRICE_MANIPULATION)
            risk_factors.append(price_result.get("reason", "price_anomaly"))
        
        if content_result.get("has_prohibited"):
            threats.append(ThreatType.PROHIBITED_CONTENT)
            risk_factors.extend([i for i in content_result["issues"] if "prohibited" in i])
        
        if content_result.get("has_spam"):
            threats.append(ThreatType.SPAM)
        
        if content_result.get("has_scam_indicators"):
            threats.append(ThreatType.FRAUD)
            risk_factors.extend([i for i in content_result["issues"] if "scam" in i])
        
        if seller_result.get("risk_score", 0) > 50:
            threats.append(ThreatType.SUSPICIOUS_SELLER)
            risk_factors.extend(seller_result.get("risk_factors", []))
        
        # Determine risk level
        if combined_risk >= 0.8 or ThreatType.PROHIBITED_CONTENT in threats:
            risk_level = RiskLevel.CRITICAL
        elif combined_risk >= 0.6 or len(threats) >= 2:
            risk_level = RiskLevel.HIGH
        elif combined_risk >= 0.4 or len(threats) >= 1:
            risk_level = RiskLevel.MEDIUM
        elif combined_risk >= 0.2:
            risk_level = RiskLevel.LOW
        else:
            risk_level = RiskLevel.SAFE
        
        # Determine status and action
        status = listing.status
        auto_action_taken = False
        requires_human_review = False
        
        if auto_action:
            if combined_risk <= self.auto_approve_threshold and not threats:
                status = ListingStatus.APPROVED
                auto_action_taken = True
                self.stats["auto_approved"] += 1
            
            elif combined_risk >= self.auto_reject_threshold or ThreatType.PROHIBITED_CONTENT in threats:
                status = ListingStatus.REJECTED
                auto_action_taken = True
                self.stats["auto_rejected"] += 1
                self.stats["fraud_prevented"] += 1
            
            elif combined_risk >= self.auto_flag_threshold or threats:
                status = ListingStatus.FLAGGED
                auto_action_taken = True
                requires_human_review = True
                self.stats["flagged_for_review"] += 1
            
            else:
                requires_human_review = True
        else:
            requires_human_review = True
        
        # Generate recommendation
        recommendation = self._generate_recommendation(
            risk_level, threats, combined_risk
        )
        
        # Update listing
        listing.status = status
        listing.risk_score = combined_risk
        listing.risk_factors = risk_factors
        listing.ai_moderated = True
        listing.updated_at = time.time()
        
        # Update seller
        seller.listing_count += 1
        if status == ListingStatus.REJECTED:
            seller.rejection_count += 1
            seller.trust_score = max(0, seller.trust_score - 0.05)
        elif status == ListingStatus.APPROVED:
            seller.trust_score = min(1, seller.trust_score + 0.01)
        
        # Store listing
        self.listings[listing.listing_id] = listing
        
        # Create result
        result = ModerationResult(
            listing_id=listing.listing_id,
            status=status,
            risk_level=risk_level,
            risk_score=combined_risk,
            threats_detected=threats,
            risk_factors=risk_factors,
            recommendation=recommendation,
            confidence=0.85 + (0.1 if len(threats) > 0 else 0),
            processing_time_ms=(time.time() - start_time) * 1000,
            auto_action_taken=auto_action_taken,
            requires_human_review=requires_human_review
        )
        
        # Update stats
        self.stats["listings_processed"] += 1
        self.stats["threats_detected"] += len(threats)
        
        # Store result
        self.moderation_history.append(result)
        if len(self.moderation_history) > 100000:
            self.moderation_history = self.moderation_history[-100000:]
        
        return result
    
    def _generate_recommendation(
        self,
        risk_level: RiskLevel,
        threats: List[ThreatType],
        risk_score: float
    ) -> str:
        """Generate recommendation string"""
        if risk_level == RiskLevel.CRITICAL:
            return f"CRITICAL: Immediate rejection recommended. Detected: {[t.value for t in threats]}"
        elif risk_level == RiskLevel.HIGH:
            return f"HIGH RISK: Manual review required urgently. Risk score: {risk_score:.0%}"
        elif risk_level == RiskLevel.MEDIUM:
            return f"MEDIUM RISK: Review within 24 hours. Flags: {[t.value for t in threats]}"
        elif risk_level == RiskLevel.LOW:
            return "LOW RISK: Monitor for suspicious activity"
        else:
            return "SAFE: Listing appears legitimate"
    
    def submit_listing(
        self,
        seller_id: str,
        title: str,
        description: str,
        price: float,
        category: str = "",
        images: List[str] = None,
        auto_moderate: bool = True
    ) -> Tuple[Listing, Optional[ModerationResult]]:
        """
        Submit a new listing for moderation.
        
        Returns:
            (listing, moderation_result)
        """
        listing = Listing(
            listing_id=f"listing_{int(time.time()*1000)}_{hashlib.md5(title.encode()).hexdigest()[:8]}",
            seller_id=seller_id,
            title=title,
            description=description,
            price=price,
            category=category,
            images=images or []
        )
        
        # Record price for category analysis
        self.price_analyzer.record_price(category, price)
        
        result = None
        if auto_moderate:
            result = self.moderate_listing(listing)
        else:
            listing.status = ListingStatus.PENDING
            self.listings[listing.listing_id] = listing
        
        return listing, result
    
    def get_pending_reviews(self) -> List[Listing]:
        """Get listings pending human review"""
        return [
            l for l in self.listings.values()
            if l.status in (ListingStatus.FLAGGED, ListingStatus.UNDER_REVIEW)
        ]
    
    def human_review(
        self,
        listing_id: str,
        decision: str,
        reviewer_id: str,
        notes: str = ""
    ) -> bool:
        """
        Process human review decision.
        
        Args:
            listing_id: The listing to review
            decision: "approve", "reject", or "flag"
            reviewer_id: Who made the decision
            notes: Review notes
        """
        listing = self.listings.get(listing_id)
        if not listing:
            return False
        
        decision_map = {
            "approve": ListingStatus.APPROVED,
            "reject": ListingStatus.REJECTED,
            "flag": ListingStatus.FLAGGED
        }
        
        listing.status = decision_map.get(decision, ListingStatus.PENDING)
        listing.human_reviewed = True
        listing.updated_at = time.time()
        listing.metadata["reviewer_id"] = reviewer_id
        listing.metadata["review_notes"] = notes
        listing.metadata["review_time"] = time.time()
        
        # Update seller trust
        seller = self.sellers.get(listing.seller_id)
        if seller:
            if decision == "reject":
                seller.rejection_count += 1
                seller.trust_score = max(0, seller.trust_score - 0.1)
            elif decision == "approve":
                seller.trust_score = min(1, seller.trust_score + 0.02)
        
        return True
    
    def get_statistics(self) -> Dict[str, Any]:
        """Get comprehensive statistics"""
        return {
            **self.stats,
            "total_listings": len(self.listings),
            "total_sellers": len(self.sellers),
            "pending_reviews": len(self.get_pending_reviews()),
            "approval_rate": (
                self.stats["auto_approved"] / max(self.stats["listings_processed"], 1)
            ),
            "rejection_rate": (
                self.stats["auto_rejected"] / max(self.stats["listings_processed"], 1)
            ),
            "avg_seller_trust": (
                sum(s.trust_score for s in self.sellers.values()) / max(len(self.sellers), 1)
            )
        }


# Singleton
_protector: Optional[MarketplaceProtector] = None


def get_marketplace_protector() -> MarketplaceProtector:
    """Get or create the marketplace protector"""
    global _protector
    if _protector is None:
        _protector = MarketplaceProtector()
    return _protector


# Convenience functions
def moderate_listing(
    seller_id: str,
    title: str,
    description: str,
    price: float,
    category: str = ""
) -> Tuple[Listing, ModerationResult]:
    """Quick listing moderation"""
    protector = get_marketplace_protector()
    return protector.submit_listing(seller_id, title, description, price, category)


def check_seller_risk(seller_id: str) -> Dict[str, Any]:
    """Quick seller risk check"""
    protector = get_marketplace_protector()
    seller = protector.get_seller(seller_id)
    if not seller:
        return {"error": "Seller not found"}
    
    # Create dummy listing for analysis
    dummy_listing = Listing(
        listing_id="check",
        seller_id=seller_id,
        title="check",
        description="check",
        price=0
    )
    
    return protector.seller_analyzer.analyze(seller, dummy_listing)
