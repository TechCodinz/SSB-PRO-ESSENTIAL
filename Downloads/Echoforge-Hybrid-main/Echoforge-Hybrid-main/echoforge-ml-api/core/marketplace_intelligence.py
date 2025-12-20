"""
Marketplace Intelligence & Quality Sourcing
=============================================
AI-powered system that helps users make smart purchasing decisions.

Features:
- Price Anomaly Detection (overpriced vs fair vs deal)
- Authenticity Verification (fake vs original indicators)
- Quality Sourcing Intelligence (find best sources/deals)
- Price History Tracking (price trends over time)
- Smart Recommendations (best value suggestions)
- Competitor Price Comparison
- Quality Score Assessment

This transforms the marketplace from just protection to
actively HELPING users find the best deals.

Author: EchoForge AI Team
License: Proprietary
"""

import numpy as np
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass, field
from enum import Enum
import time
import hashlib
from collections import defaultdict
import re


class PriceVerdict(Enum):
    """Price assessment verdict"""
    AMAZING_DEAL = "amazing_deal"      # > 40% below market
    GREAT_VALUE = "great_value"        # 20-40% below market
    FAIR_PRICE = "fair_price"          # Within 20% of market
    SLIGHTLY_HIGH = "slightly_high"    # 20-40% above market
    OVERPRICED = "overpriced"          # 40-70% above market
    EXTREMELY_OVERPRICED = "extremely_overpriced"  # > 70% above market
    SUSPICIOUS = "suspicious"          # Too cheap to be real


class AuthenticityLevel(Enum):
    """Product authenticity assessment"""
    VERIFIED_AUTHENTIC = "verified_authentic"
    LIKELY_AUTHENTIC = "likely_authentic"
    UNCERTAIN = "uncertain"
    LIKELY_COUNTERFEIT = "likely_counterfeit"
    CONFIRMED_FAKE = "confirmed_fake"


class SourceQuality(Enum):
    """Seller/source quality rating"""
    PREMIUM = "premium"           # Verified, high ratings, reliable
    TRUSTED = "trusted"           # Good history, reliable
    STANDARD = "standard"         # Acceptable
    CAUTION = "caution"           # Some concerns
    AVOID = "avoid"               # High risk


@dataclass
class PricePoint:
    """Historical price data point"""
    price: float
    source: str
    seller_id: str
    timestamp: float
    currency: str = "USD"
    is_sale: bool = False
    verified: bool = False


@dataclass
class ProductProfile:
    """Product information for comparison"""
    product_id: str
    name: str
    category: str
    brand: Optional[str] = None
    model: Optional[str] = None
    sku: Optional[str] = None
    msrp: Optional[float] = None  # Manufacturer's suggested retail price
    price_history: List[PricePoint] = field(default_factory=list)
    quality_score: float = 0.5
    authenticity_indicators: List[str] = field(default_factory=list)
    known_sources: List[Dict] = field(default_factory=list)
    created_at: float = 0
    
    def __post_init__(self):
        if self.created_at == 0:
            self.created_at = time.time()
    
    def get_average_price(self, days: int = 30) -> float:
        """Get average price over specified days"""
        cutoff = time.time() - (days * 86400)
        recent_prices = [p.price for p in self.price_history if p.timestamp >= cutoff]
        return np.mean(recent_prices) if recent_prices else 0
    
    def get_lowest_price(self, days: int = 30) -> Tuple[float, str]:
        """Get lowest price and source"""
        cutoff = time.time() - (days * 86400)
        recent = [p for p in self.price_history if p.timestamp >= cutoff]
        if not recent:
            return 0, "unknown"
        lowest = min(recent, key=lambda p: p.price)
        return lowest.price, lowest.source


@dataclass
class SourceProfile:
    """Seller/source profile for quality assessment"""
    source_id: str
    name: str
    source_type: str  # "marketplace", "retailer", "manufacturer", "reseller"
    verified: bool = False
    rating: float = 0.0
    review_count: int = 0
    years_active: float = 0
    return_policy: str = ""
    warranty_offered: bool = False
    ships_from: str = ""
    total_sales: int = 0
    dispute_rate: float = 0.0
    response_time_hours: float = 0
    quality_score: float = 0.5
    trust_score: float = 0.5
    price_competitiveness: float = 0.5  # How often they have good prices


@dataclass
class PriceIntelligenceReport:
    """Comprehensive price intelligence report"""
    listing_id: str
    product_id: str
    current_price: float
    verdict: PriceVerdict
    market_average: float
    price_percentile: float  # What percentile is this price at
    savings_potential: float  # How much user could save
    price_trend: str  # "rising", "falling", "stable"
    best_deal: Optional[Dict] = None
    alternative_sources: List[Dict] = field(default_factory=list)
    authenticity_assessment: AuthenticityLevel = AuthenticityLevel.UNCERTAIN
    authenticity_factors: List[str] = field(default_factory=list)
    quality_score: float = 0.0
    recommendation: str = ""
    confidence: float = 0.0
    timestamp: float = 0
    
    def __post_init__(self):
        if self.timestamp == 0:
            self.timestamp = time.time()


@dataclass
class DealAlert:
    """Alert for a good deal"""
    alert_id: str
    product_id: str
    product_name: str
    current_price: float
    previous_avg: float
    discount_percent: float
    source: str
    expires_at: Optional[float] = None
    confidence: float = 0.0
    timestamp: float = 0


class AuthenticityVerifier:
    """
    Verifies product authenticity using multiple indicators.
    """
    
    def __init__(self):
        # Authenticity indicators
        self.authentic_indicators = [
            "official_retailer", "authorized_dealer", "manufacturer_warranty",
            "serial_number_verified", "hologram_present", "original_packaging",
            "certificate_of_authenticity", "brand_verified"
        ]
        
        self.fake_indicators = [
            "no_warranty", "third_party_seller", "price_too_low",
            "no_serial_number", "generic_packaging", "spelling_errors",
            "wrong_logo", "poor_quality_images", "no_return_policy",
            "ships_from_suspicious_location"
        ]
        
        # Known counterfeit patterns by category
        self.counterfeit_patterns = {
            "electronics": [
                r"refurbish", r"open box", r"grade [abc]", r"oem",
                r"compatible", r"generic", r"aftermarket"
            ],
            "fashion": [
                r"inspired", r"style", r"like", r"replica", r"1:1",
                r"aaa quality", r"mirror", r"super"
            ],
            "cosmetics": [
                r"tester", r"unboxed", r"sample", r"mini", r"travel size"
            ]
        }
    
    def verify(
        self,
        listing: Dict,
        product: ProductProfile,
        source: SourceProfile
    ) -> Tuple[AuthenticityLevel, List[str], float]:
        """
        Verify product authenticity.
        
        Returns:
            (authenticity_level, factors, confidence)
        """
        authentic_score = 0
        fake_score = 0
        factors = []
        
        title = listing.get("title", "").lower()
        description = listing.get("description", "").lower()
        full_text = f"{title} {description}"
        price = listing.get("price", 0)
        
        # Check source reliability
        if source.verified:
            authentic_score += 30
            factors.append("✅ Verified seller")
        
        if source.trust_score > 0.8:
            authentic_score += 20
            factors.append("✅ High trust score seller")
        elif source.trust_score < 0.4:
            fake_score += 20
            factors.append("⚠️ Low trust seller")
        
        if source.warranty_offered:
            authentic_score += 15
            factors.append("✅ Warranty offered")
        
        # Check price sanity
        if product.msrp and price > 0:
            price_ratio = price / product.msrp
            
            if price_ratio < 0.3:  # Less than 30% of MSRP
                fake_score += 40
                factors.append(f"🚨 Price suspiciously low ({price_ratio:.0%} of MSRP)")
            elif price_ratio < 0.5:
                fake_score += 20
                factors.append(f"⚠️ Price significantly below MSRP ({price_ratio:.0%})")
            elif 0.7 <= price_ratio <= 1.3:
                authentic_score += 15
                factors.append("✅ Price within normal range")
        
        # Check counterfeit keywords
        category = product.category.lower() if product.category else ""
        patterns = self.counterfeit_patterns.get(category, [])
        
        for pattern in patterns:
            if re.search(pattern, full_text, re.IGNORECASE):
                fake_score += 15
                factors.append(f"⚠️ Contains '{pattern}' - possible counterfeit indicator")
        
        # Check for explicit authenticity claims
        if any(ind in full_text for ind in ["authentic", "genuine", "original", "official"]):
            # Claims of authenticity without verification can be suspicious
            if not source.verified:
                fake_score += 5
                factors.append("⚠️ Claims authenticity but unverified seller")
            else:
                authentic_score += 10
                factors.append("✅ Verified seller claims authenticity")
        
        # Calculate overall assessment
        total_score = authentic_score - fake_score
        
        if total_score >= 50:
            level = AuthenticityLevel.VERIFIED_AUTHENTIC
        elif total_score >= 20:
            level = AuthenticityLevel.LIKELY_AUTHENTIC
        elif total_score >= -10:
            level = AuthenticityLevel.UNCERTAIN
        elif total_score >= -40:
            level = AuthenticityLevel.LIKELY_COUNTERFEIT
        else:
            level = AuthenticityLevel.CONFIRMED_FAKE
        
        # Confidence based on how much data we have
        data_points = sum([
            bool(source.verified),
            bool(product.msrp),
            len(product.price_history) > 5,
            source.review_count > 10,
            source.years_active > 1
        ])
        confidence = min(0.5 + (data_points * 0.1), 0.95)
        
        return level, factors, confidence


class PriceAnalyzer:
    """
    Analyzes prices to determine if they're fair, overpriced, or deals.
    """
    
    def __init__(self):
        # Category-specific price tolerances
        self.category_tolerances = {
            "electronics": {"min_deal": 0.2, "max_normal": 1.3},
            "fashion": {"min_deal": 0.3, "max_normal": 2.0},
            "home": {"min_deal": 0.25, "max_normal": 1.5},
            "books": {"min_deal": 0.3, "max_normal": 1.2},
            "default": {"min_deal": 0.25, "max_normal": 1.5}
        }
    
    def analyze(
        self,
        price: float,
        product: ProductProfile,
        category: str = "default"
    ) -> Tuple[PriceVerdict, Dict[str, Any]]:
        """
        Analyze if a price is fair, overpriced, or a deal.
        
        Returns:
            (verdict, analysis_details)
        """
        # Get market data
        avg_price = product.get_average_price()
        msrp = product.msrp or avg_price
        reference_price = avg_price if avg_price > 0 else msrp
        
        if reference_price <= 0:
            return PriceVerdict.FAIR_PRICE, {"error": "No reference price available"}
        
        # Calculate price ratio
        ratio = price / reference_price
        
        # Get category tolerances
        tolerance = self.category_tolerances.get(
            category.lower(), 
            self.category_tolerances["default"]
        )
        
        # Determine verdict
        if ratio < 0.2:
            verdict = PriceVerdict.SUSPICIOUS
        elif ratio < 0.6:
            verdict = PriceVerdict.AMAZING_DEAL
        elif ratio < 0.8:
            verdict = PriceVerdict.GREAT_VALUE
        elif ratio <= 1.2:
            verdict = PriceVerdict.FAIR_PRICE
        elif ratio <= 1.4:
            verdict = PriceVerdict.SLIGHTLY_HIGH
        elif ratio <= 1.7:
            verdict = PriceVerdict.OVERPRICED
        else:
            verdict = PriceVerdict.EXTREMELY_OVERPRICED
        
        # Calculate savings/overpayment
        if price < reference_price:
            savings = reference_price - price
            savings_percent = (savings / reference_price) * 100
        else:
            savings = -(price - reference_price)
            savings_percent = -((price - reference_price) / reference_price) * 100
        
        # Get price trend
        trend = self._calculate_trend(product.price_history)
        
        # Calculate percentile
        all_prices = [p.price for p in product.price_history]
        if all_prices:
            percentile = (np.sum(np.array(all_prices) < price) / len(all_prices)) * 100
        else:
            percentile = 50
        
        analysis = {
            "current_price": price,
            "reference_price": reference_price,
            "msrp": msrp,
            "average_price": avg_price,
            "price_ratio": ratio,
            "savings": savings,
            "savings_percent": savings_percent,
            "percentile": percentile,
            "trend": trend,
            "verdict_explanation": self._explain_verdict(verdict, ratio, reference_price)
        }
        
        return verdict, analysis
    
    def _calculate_trend(self, history: List[PricePoint], days: int = 30) -> str:
        """Calculate price trend"""
        if len(history) < 3:
            return "unknown"
        
        cutoff = time.time() - (days * 86400)
        recent = [p for p in history if p.timestamp >= cutoff]
        
        if len(recent) < 3:
            return "stable"
        
        prices = [p.price for p in sorted(recent, key=lambda x: x.timestamp)]
        
        # Simple trend detection
        first_half_avg = np.mean(prices[:len(prices)//2])
        second_half_avg = np.mean(prices[len(prices)//2:])
        
        change_percent = ((second_half_avg - first_half_avg) / first_half_avg) * 100
        
        if change_percent > 10:
            return "rising"
        elif change_percent < -10:
            return "falling"
        else:
            return "stable"
    
    def _explain_verdict(self, verdict: PriceVerdict, ratio: float, reference: float) -> str:
        """Generate human-readable verdict explanation"""
        explanations = {
            PriceVerdict.AMAZING_DEAL: f"🎉 AMAZING DEAL! This is {(1-ratio)*100:.0f}% below the typical price of ${reference:.2f}. Rare opportunity!",
            PriceVerdict.GREAT_VALUE: f"✅ Great value! You're getting {(1-ratio)*100:.0f}% off the typical price. Recommended buy.",
            PriceVerdict.FAIR_PRICE: f"👍 Fair price. This is within the normal range for this product.",
            PriceVerdict.SLIGHTLY_HIGH: f"⚠️ Slightly overpriced. You could save ${(ratio-1)*reference:.2f} by shopping around.",
            PriceVerdict.OVERPRICED: f"🚨 Overpriced by {(ratio-1)*100:.0f}%! Better deals available elsewhere.",
            PriceVerdict.EXTREMELY_OVERPRICED: f"❌ WAY overpriced! This is {(ratio-1)*100:.0f}% above normal. Avoid!",
            PriceVerdict.SUSPICIOUS: f"🚨 SUSPICIOUS! Price is unrealistically low. Possible scam or counterfeit."
        }
        return explanations.get(verdict, "Unable to assess price.")


class SourceFinder:
    """
    Finds the best sources for a product.
    """
    
    def __init__(self):
        self.sources: Dict[str, SourceProfile] = {}
        self.product_sources: Dict[str, List[str]] = defaultdict(list)  # product_id -> source_ids
    
    def register_source(self, source: SourceProfile):
        """Register a source"""
        self.sources[source.source_id] = source
    
    def add_product_source(self, product_id: str, source_id: str, price: float):
        """Record that a source sells a product at a price"""
        if source_id not in self.product_sources[product_id]:
            self.product_sources[product_id].append(source_id)
    
    def find_best_sources(
        self,
        product_id: str,
        product: ProductProfile,
        max_results: int = 5,
        prioritize: str = "value"  # "value", "price", "trust", "quality"
    ) -> List[Dict]:
        """
        Find the best sources to buy a product.
        
        Args:
            product_id: Product to find
            product: Product profile
            max_results: Max sources to return
            prioritize: What factor to prioritize
            
        Returns:
            List of source recommendations with prices
        """
        source_ids = self.product_sources.get(product_id, [])
        
        if not source_ids:
            return []
        
        results = []
        avg_price = product.get_average_price()
        
        for source_id in source_ids:
            source = self.sources.get(source_id)
            if not source:
                continue
            
            # Get price from this source
            source_prices = [
                p for p in product.price_history 
                if p.source == source_id
            ]
            
            if not source_prices:
                continue
            
            latest_price = source_prices[-1].price
            lowest_price = min(p.price for p in source_prices)
            
            # Calculate value score
            trust_component = source.trust_score * 30
            price_component = (1 - (latest_price / (avg_price + 0.01))) * 40 if avg_price > 0 else 0
            quality_component = source.quality_score * 30
            
            value_score = trust_component + price_component + quality_component
            
            results.append({
                "source_id": source_id,
                "source_name": source.name,
                "source_type": source.source_type,
                "current_price": latest_price,
                "lowest_price": lowest_price,
                "trust_score": source.trust_score,
                "quality_score": source.quality_score,
                "value_score": value_score / 100,
                "verified": source.verified,
                "warranty": source.warranty_offered,
                "rating": source.rating,
                "reviews": source.review_count,
                "ships_from": source.ships_from,
                "savings_vs_avg": avg_price - latest_price if avg_price > 0 else 0
            })
        
        # Sort by priority
        sort_keys = {
            "value": lambda x: x["value_score"],
            "price": lambda x: -x["current_price"],
            "trust": lambda x: x["trust_score"],
            "quality": lambda x: x["quality_score"]
        }
        
        results.sort(key=sort_keys.get(prioritize, sort_keys["value"]), reverse=True)
        
        return results[:max_results]


class MarketplaceIntelligence:
    """
    Complete marketplace intelligence system that helps users
    make smart purchasing decisions.
    """
    
    def __init__(self):
        self.price_analyzer = PriceAnalyzer()
        self.authenticity_verifier = AuthenticityVerifier()
        self.source_finder = SourceFinder()
        
        # Data stores
        self.products: Dict[str, ProductProfile] = {}
        self.sources: Dict[str, SourceProfile] = {}
        
        # Deal tracking
        self.deal_alerts: List[DealAlert] = []
        
        # Statistics
        self.stats = {
            "products_tracked": 0,
            "sources_tracked": 0,
            "price_analyses": 0,
            "authenticity_checks": 0,
            "deals_found": 0,
            "overpriced_flagged": 0
        }
    
    def register_product(
        self,
        name: str,
        category: str,
        brand: Optional[str] = None,
        msrp: Optional[float] = None,
        **kwargs
    ) -> ProductProfile:
        """Register a product for tracking"""
        product_id = f"prod_{hashlib.md5(f'{name}{brand}'.encode()).hexdigest()[:12]}"
        
        product = ProductProfile(
            product_id=product_id,
            name=name,
            category=category,
            brand=brand,
            msrp=msrp,
            **kwargs
        )
        
        self.products[product_id] = product
        self.stats["products_tracked"] += 1
        
        return product
    
    def register_source(
        self,
        name: str,
        source_type: str,
        **kwargs
    ) -> SourceProfile:
        """Register a seller/source"""
        source_id = f"src_{hashlib.md5(name.encode()).hexdigest()[:12]}"
        
        source = SourceProfile(
            source_id=source_id,
            name=name,
            source_type=source_type,
            **kwargs
        )
        
        self.sources[source_id] = source
        self.source_finder.register_source(source)
        self.stats["sources_tracked"] += 1
        
        return source
    
    def record_price(
        self,
        product_id: str,
        source_id: str,
        price: float,
        is_sale: bool = False
    ):
        """Record a price observation"""
        product = self.products.get(product_id)
        if not product:
            return
        
        price_point = PricePoint(
            price=price,
            source=source_id,
            seller_id=source_id,
            timestamp=time.time(),
            is_sale=is_sale,
            verified=source_id in self.sources and self.sources[source_id].verified
        )
        
        product.price_history.append(price_point)
        self.source_finder.add_product_source(product_id, source_id, price)
        
        # Check for deal
        avg_price = product.get_average_price()
        if avg_price > 0 and price < avg_price * 0.7:
            self._create_deal_alert(product, source_id, price, avg_price)
    
    def _create_deal_alert(
        self,
        product: ProductProfile,
        source_id: str,
        price: float,
        avg_price: float
    ):
        """Create a deal alert"""
        discount = ((avg_price - price) / avg_price) * 100
        
        alert = DealAlert(
            alert_id=f"deal_{int(time.time()*1000)}",
            product_id=product.product_id,
            product_name=product.name,
            current_price=price,
            previous_avg=avg_price,
            discount_percent=discount,
            source=source_id,
            confidence=0.8,
            timestamp=time.time()
        )
        
        self.deal_alerts.append(alert)
        self.stats["deals_found"] += 1
        
        # Keep only recent alerts
        if len(self.deal_alerts) > 1000:
            self.deal_alerts = self.deal_alerts[-1000:]
    
    def analyze_listing(
        self,
        listing: Dict,
        product_id: Optional[str] = None,
        source_id: Optional[str] = None
    ) -> PriceIntelligenceReport:
        """
        Perform comprehensive analysis of a listing.
        
        Args:
            listing: Listing details (title, description, price, etc.)
            product_id: Known product ID (if available)
            source_id: Known source ID (if available)
            
        Returns:
            Complete intelligence report
        """
        self.stats["price_analyses"] += 1
        
        price = listing.get("price", 0)
        
        # Get or create product profile
        if product_id and product_id in self.products:
            product = self.products[product_id]
        else:
            # Create temporary product profile
            product = ProductProfile(
                product_id=product_id or f"temp_{int(time.time())}",
                name=listing.get("title", "Unknown"),
                category=listing.get("category", "")
            )
        
        # Get or create source profile
        if source_id and source_id in self.sources:
            source = self.sources[source_id]
        else:
            source = SourceProfile(
                source_id=source_id or f"temp_src_{int(time.time())}",
                name=listing.get("seller_name", "Unknown"),
                source_type="marketplace"
            )
        
        # Price analysis
        verdict, price_analysis = self.price_analyzer.analyze(
            price, product, listing.get("category", "")
        )
        
        # Authenticity check
        self.stats["authenticity_checks"] += 1
        auth_level, auth_factors, auth_confidence = self.authenticity_verifier.verify(
            listing, product, source
        )
        
        # Find best sources
        best_sources = self.source_finder.find_best_sources(
            product.product_id, product, max_results=5
        )
        
        # Calculate savings potential
        if best_sources and best_sources[0]["current_price"] < price:
            savings_potential = price - best_sources[0]["current_price"]
            best_deal = best_sources[0]
        else:
            savings_potential = 0
            best_deal = None
        
        # Track if overpriced
        if verdict in [PriceVerdict.OVERPRICED, PriceVerdict.EXTREMELY_OVERPRICED]:
            self.stats["overpriced_flagged"] += 1
        
        # Generate recommendation
        recommendation = self._generate_recommendation(
            verdict, auth_level, price_analysis, best_sources
        )
        
        # Calculate quality score
        quality_score = self._calculate_quality_score(auth_level, source, price_analysis)
        
        return PriceIntelligenceReport(
            listing_id=listing.get("listing_id", ""),
            product_id=product.product_id,
            current_price=price,
            verdict=verdict,
            market_average=price_analysis.get("average_price", 0),
            price_percentile=price_analysis.get("percentile", 50),
            savings_potential=savings_potential,
            price_trend=price_analysis.get("trend", "unknown"),
            best_deal=best_deal,
            alternative_sources=best_sources,
            authenticity_assessment=auth_level,
            authenticity_factors=auth_factors,
            quality_score=quality_score,
            recommendation=recommendation,
            confidence=min(auth_confidence, 0.95)
        )
    
    def _generate_recommendation(
        self,
        verdict: PriceVerdict,
        auth_level: AuthenticityLevel,
        analysis: Dict,
        sources: List[Dict]
    ) -> str:
        """Generate actionable recommendation"""
        parts = []
        
        # Price-based recommendation
        if verdict == PriceVerdict.AMAZING_DEAL:
            if auth_level in [AuthenticityLevel.VERIFIED_AUTHENTIC, AuthenticityLevel.LIKELY_AUTHENTIC]:
                parts.append("🎉 STRONG BUY! Amazing deal on authentic product.")
            else:
                parts.append("⚠️ Great price but verify authenticity before buying.")
        
        elif verdict == PriceVerdict.GREAT_VALUE:
            parts.append("✅ Recommended buy - good value for money.")
        
        elif verdict == PriceVerdict.FAIR_PRICE:
            parts.append("👍 Fair price. Safe to buy.")
        
        elif verdict == PriceVerdict.SLIGHTLY_HIGH:
            if sources:
                parts.append(f"💡 Could save ${analysis.get('savings', 0)*-1:.2f} at {sources[0]['source_name']}.")
            else:
                parts.append("💡 Consider waiting for a sale or checking other sources.")
        
        elif verdict == PriceVerdict.OVERPRICED:
            parts.append("🚨 NOT recommended. This is overpriced.")
            if sources:
                parts.append(f"Better deal at {sources[0]['source_name']} for ${sources[0]['current_price']:.2f}.")
        
        elif verdict == PriceVerdict.EXTREMELY_OVERPRICED:
            parts.append("❌ AVOID! Extremely overpriced.")
        
        elif verdict == PriceVerdict.SUSPICIOUS:
            parts.append("🚨 WARNING: Suspiciously low price. Likely scam or counterfeit.")
        
        # Authenticity warning
        if auth_level == AuthenticityLevel.LIKELY_COUNTERFEIT:
            parts.append("⚠️ High risk of counterfeit product.")
        elif auth_level == AuthenticityLevel.CONFIRMED_FAKE:
            parts.append("❌ CONFIRMED FAKE - Do not buy!")
        
        # Trend-based advice
        if analysis.get("trend") == "falling":
            parts.append("📉 Prices are falling - consider waiting.")
        
        return " ".join(parts)
    
    def _calculate_quality_score(
        self,
        auth_level: AuthenticityLevel,
        source: SourceProfile,
        analysis: Dict
    ) -> float:
        """Calculate overall quality score"""
        auth_scores = {
            AuthenticityLevel.VERIFIED_AUTHENTIC: 1.0,
            AuthenticityLevel.LIKELY_AUTHENTIC: 0.8,
            AuthenticityLevel.UNCERTAIN: 0.5,
            AuthenticityLevel.LIKELY_COUNTERFEIT: 0.2,
            AuthenticityLevel.CONFIRMED_FAKE: 0.0
        }
        
        auth_component = auth_scores.get(auth_level, 0.5) * 0.4
        source_component = source.trust_score * 0.3
        price_component = min(1 - abs(analysis.get("price_ratio", 1) - 1), 1) * 0.3
        
        return auth_component + source_component + price_component
    
    def get_active_deals(
        self,
        category: Optional[str] = None,
        min_discount: float = 20
    ) -> List[DealAlert]:
        """Get active deal alerts"""
        now = time.time()
        active = [
            d for d in self.deal_alerts
            if d.discount_percent >= min_discount and now - d.timestamp < 86400
        ]
        
        if category:
            # Filter by category if products are tracked
            active = [
                d for d in active
                if d.product_id in self.products and
                self.products[d.product_id].category.lower() == category.lower()
            ]
        
        return sorted(active, key=lambda x: x.discount_percent, reverse=True)
    
    def compare_sources(
        self,
        product_id: str,
        prioritize: str = "value"
    ) -> Dict[str, Any]:
        """Compare all sources for a product"""
        product = self.products.get(product_id)
        if not product:
            return {"error": "Product not found"}
        
        sources = self.source_finder.find_best_sources(
            product_id, product, max_results=10, prioritize=prioritize
        )
        
        return {
            "product_id": product_id,
            "product_name": product.name,
            "category": product.category,
            "msrp": product.msrp,
            "average_price": product.get_average_price(),
            "sources": sources,
            "recommendation": sources[0] if sources else None
        }
    
    def get_statistics(self) -> Dict[str, Any]:
        """Get intelligence statistics"""
        return {
            **self.stats,
            "active_deals": len([d for d in self.deal_alerts if time.time() - d.timestamp < 86400]),
            "categories_tracked": len(set(p.category for p in self.products.values() if p.category))
        }


# Singleton
_intelligence: Optional[MarketplaceIntelligence] = None


def get_marketplace_intelligence() -> MarketplaceIntelligence:
    """Get or create the marketplace intelligence system"""
    global _intelligence
    if _intelligence is None:
        _intelligence = MarketplaceIntelligence()
    return _intelligence


# Convenience functions
def analyze_price(
    title: str,
    price: float,
    category: str = "",
    seller_name: str = ""
) -> PriceIntelligenceReport:
    """Quick price analysis"""
    intel = get_marketplace_intelligence()
    
    listing = {
        "title": title,
        "price": price,
        "category": category,
        "seller_name": seller_name
    }
    
    return intel.analyze_listing(listing)


def find_best_deal(product_name: str, category: str = "") -> Dict[str, Any]:
    """Find best deal for a product"""
    intel = get_marketplace_intelligence()
    
    # Try to find product
    for prod_id, prod in intel.products.items():
        if product_name.lower() in prod.name.lower():
            return intel.compare_sources(prod_id)
    
    return {"error": "Product not tracked. Register it first."}


def get_deal_alerts(min_discount: float = 20) -> List[Dict]:
    """Get active deal alerts"""
    intel = get_marketplace_intelligence()
    alerts = intel.get_active_deals(min_discount=min_discount)
    
    return [
        {
            "product": a.product_name,
            "price": a.current_price,
            "previous_avg": a.previous_avg,
            "discount": f"{a.discount_percent:.0f}%",
            "source": a.source,
            "confidence": a.confidence
        }
        for a in alerts
    ]
