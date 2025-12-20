"""
Marketplace Intelligence API
==============================
API endpoints for marketplace price intelligence,
quality sourcing, and deal finding.

Author: EchoForge AI Team
License: Proprietary
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Dict, List, Any, Optional
import time

from core.marketplace_intelligence import (
    get_marketplace_intelligence,
    MarketplaceIntelligence,
    PriceVerdict,
    AuthenticityLevel
)
from core.marketplace_protector import get_marketplace_protector


# =============================================================================
# API Models
# =============================================================================

class AnalyzeListingRequest(BaseModel):
    """Request to analyze a marketplace listing"""
    title: str
    description: str = ""
    price: float
    category: str = ""
    seller_id: Optional[str] = None
    seller_name: str = ""
    images: List[str] = []
    
    
class RegisterProductRequest(BaseModel):
    """Register a product for tracking"""
    name: str
    category: str
    brand: Optional[str] = None
    msrp: Optional[float] = None
    model: Optional[str] = None


class RegisterSourceRequest(BaseModel):
    """Register a source/seller"""
    name: str
    source_type: str = "marketplace"  # marketplace, retailer, manufacturer
    verified: bool = False
    rating: float = 0.0
    review_count: int = 0
    warranty_offered: bool = False
    ships_from: str = ""


class RecordPriceRequest(BaseModel):
    """Record a price observation"""
    product_id: str
    source_id: str
    price: float
    is_sale: bool = False


class CompareSourcesRequest(BaseModel):
    """Compare sources for a product"""
    product_id: str
    prioritize: str = "value"  # value, price, trust, quality


class IntelligenceResponse(BaseModel):
    """Price intelligence response"""
    listing_id: str
    product_id: str
    current_price: float
    verdict: str
    verdict_emoji: str
    market_average: float
    price_percentile: float
    savings_potential: float
    price_trend: str
    best_deal: Optional[Dict] = None
    alternative_sources: List[Dict] = []
    authenticity: str
    authenticity_factors: List[str] = []
    quality_score: float
    recommendation: str
    confidence: float


# =============================================================================
# Router
# =============================================================================

router = APIRouter(prefix="/api/v2/marketplace-intelligence", tags=["Marketplace Intelligence"])


@router.post("/analyze", response_model=IntelligenceResponse)
async def analyze_listing(request: AnalyzeListingRequest):
    """
    Analyze a marketplace listing for:
    - Price fairness (overpriced, fair, deal)
    - Authenticity (fake vs original indicators)
    - Best alternative sources
    - Quality score
    
    Returns actionable recommendation.
    """
    intel = get_marketplace_intelligence()
    
    listing = {
        "listing_id": f"analyze_{int(time.time()*1000)}",
        "title": request.title,
        "description": request.description,
        "price": request.price,
        "category": request.category,
        "seller_name": request.seller_name
    }
    
    report = intel.analyze_listing(
        listing,
        source_id=request.seller_id
    )
    
    # Map verdict to emoji
    verdict_emojis = {
        PriceVerdict.AMAZING_DEAL: "🎉",
        PriceVerdict.GREAT_VALUE: "✅",
        PriceVerdict.FAIR_PRICE: "👍",
        PriceVerdict.SLIGHTLY_HIGH: "💡",
        PriceVerdict.OVERPRICED: "🚨",
        PriceVerdict.EXTREMELY_OVERPRICED: "❌",
        PriceVerdict.SUSPICIOUS: "⚠️"
    }
    
    return IntelligenceResponse(
        listing_id=report.listing_id,
        product_id=report.product_id,
        current_price=report.current_price,
        verdict=report.verdict.value,
        verdict_emoji=verdict_emojis.get(report.verdict, "❓"),
        market_average=report.market_average,
        price_percentile=report.price_percentile,
        savings_potential=report.savings_potential,
        price_trend=report.price_trend,
        best_deal=report.best_deal,
        alternative_sources=report.alternative_sources,
        authenticity=report.authenticity_assessment.value,
        authenticity_factors=report.authenticity_factors,
        quality_score=report.quality_score,
        recommendation=report.recommendation,
        confidence=report.confidence
    )


@router.post("/quick-price-check")
async def quick_price_check(
    title: str,
    price: float,
    category: str = ""
):
    """
    Quick price check - just get verdict and recommendation.
    """
    intel = get_marketplace_intelligence()
    
    listing = {
        "title": title,
        "price": price,
        "category": category
    }
    
    report = intel.analyze_listing(listing)
    
    return {
        "price": price,
        "verdict": report.verdict.value,
        "is_good_deal": report.verdict in [PriceVerdict.AMAZING_DEAL, PriceVerdict.GREAT_VALUE],
        "is_overpriced": report.verdict in [PriceVerdict.OVERPRICED, PriceVerdict.EXTREMELY_OVERPRICED],
        "is_suspicious": report.verdict == PriceVerdict.SUSPICIOUS,
        "savings_potential": report.savings_potential,
        "recommendation": report.recommendation
    }


@router.post("/products")
async def register_product(request: RegisterProductRequest):
    """
    Register a product for price tracking.
    
    Once registered, the system will track prices
    and find the best deals.
    """
    intel = get_marketplace_intelligence()
    
    product = intel.register_product(
        name=request.name,
        category=request.category,
        brand=request.brand,
        msrp=request.msrp,
        model=request.model
    )
    
    return {
        "status": "registered",
        "product_id": product.product_id,
        "name": product.name,
        "category": product.category,
        "msrp": product.msrp
    }


@router.get("/products/{product_id}")
async def get_product(product_id: str):
    """Get product details and price history."""
    intel = get_marketplace_intelligence()
    
    product = intel.products.get(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return {
        "product_id": product.product_id,
        "name": product.name,
        "category": product.category,
        "brand": product.brand,
        "msrp": product.msrp,
        "average_price_30d": product.get_average_price(30),
        "lowest_price_30d": product.get_lowest_price(30),
        "price_history_count": len(product.price_history),
        "quality_score": product.quality_score,
        "created_at": product.created_at
    }


@router.post("/sources")
async def register_source(request: RegisterSourceRequest):
    """
    Register a seller/source for tracking.
    """
    intel = get_marketplace_intelligence()
    
    source = intel.register_source(
        name=request.name,
        source_type=request.source_type,
        verified=request.verified,
        rating=request.rating,
        review_count=request.review_count,
        warranty_offered=request.warranty_offered,
        ships_from=request.ships_from
    )
    
    return {
        "status": "registered",
        "source_id": source.source_id,
        "name": source.name,
        "source_type": source.source_type,
        "verified": source.verified
    }


@router.post("/prices")
async def record_price(request: RecordPriceRequest):
    """
    Record a price observation for a product from a source.
    
    This builds the price history for better analysis.
    """
    intel = get_marketplace_intelligence()
    
    intel.record_price(
        product_id=request.product_id,
        source_id=request.source_id,
        price=request.price,
        is_sale=request.is_sale
    )
    
    return {
        "status": "recorded",
        "product_id": request.product_id,
        "source_id": request.source_id,
        "price": request.price
    }


@router.post("/compare-sources")
async def compare_sources(request: CompareSourcesRequest):
    """
    Compare all sources selling a product.
    
    Find the best deal based on:
    - value (balanced price + trust + quality)
    - price (cheapest)
    - trust (most reliable seller)
    - quality (best product authenticity)
    """
    intel = get_marketplace_intelligence()
    
    result = intel.compare_sources(
        product_id=request.product_id,
        prioritize=request.prioritize
    )
    
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    
    return result


@router.get("/deals")
async def get_active_deals(
    category: Optional[str] = None,
    min_discount: float = 20
):
    """
    Get active deal alerts.
    
    Returns products that are currently significantly
    below their average price.
    """
    intel = get_marketplace_intelligence()
    
    deals = intel.get_active_deals(
        category=category,
        min_discount=min_discount
    )
    
    return {
        "deal_count": len(deals),
        "deals": [
            {
                "alert_id": d.alert_id,
                "product_name": d.product_name,
                "current_price": d.current_price,
                "previous_average": d.previous_avg,
                "discount_percent": f"{d.discount_percent:.0f}%",
                "source": d.source,
                "confidence": d.confidence,
                "found_at": d.timestamp
            }
            for d in deals
        ]
    }


@router.get("/authenticity-check")
async def authenticity_check(
    title: str,
    price: float,
    seller_verified: bool = False,
    category: str = ""
):
    """
    Quick authenticity check for a listing.
    
    Returns authenticity assessment and risk factors.
    """
    intel = get_marketplace_intelligence()
    
    listing = {
        "title": title,
        "description": "",
        "price": price,
        "category": category
    }
    
    report = intel.analyze_listing(listing)
    
    return {
        "authenticity": report.authenticity_assessment.value,
        "is_likely_authentic": report.authenticity_assessment in [
            AuthenticityLevel.VERIFIED_AUTHENTIC,
            AuthenticityLevel.LIKELY_AUTHENTIC
        ],
        "is_suspicious": report.authenticity_assessment in [
            AuthenticityLevel.LIKELY_COUNTERFEIT,
            AuthenticityLevel.CONFIRMED_FAKE
        ],
        "factors": report.authenticity_factors,
        "quality_score": report.quality_score,
        "recommendation": report.recommendation
    }


@router.get("/statistics")
async def get_intelligence_statistics():
    """Get marketplace intelligence statistics."""
    intel = get_marketplace_intelligence()
    return intel.get_statistics()


@router.post("/full-scan")
async def full_marketplace_scan(request: AnalyzeListingRequest):
    """
    Full marketplace scan combining:
    - Price intelligence (fair/overpriced/deal)
    - Marketplace protection (fraud/spam detection)
    - Authenticity verification
    - Source recommendations
    
    The ultimate buyer protection endpoint.
    """
    intel = get_marketplace_intelligence()
    protector = get_marketplace_protector()
    
    # Price intelligence analysis
    listing = {
        "listing_id": f"scan_{int(time.time()*1000)}",
        "title": request.title,
        "description": request.description,
        "price": request.price,
        "category": request.category,
        "seller_name": request.seller_name
    }
    
    intel_report = intel.analyze_listing(listing, source_id=request.seller_id)
    
    # Marketplace protection analysis
    from core.marketplace_protector import Listing, ListingStatus
    
    protection_listing = Listing(
        listing_id=listing["listing_id"],
        seller_id=request.seller_id or "unknown",
        title=request.title,
        description=request.description,
        price=request.price,
        category=request.category,
        images=request.images
    )
    
    protection_result = protector.moderate_listing(protection_listing, auto_action=False)
    
    # Combine results
    return {
        "listing_id": listing["listing_id"],
        "overall_safety_score": (
            (1 - protection_result.risk_score) * 0.5 +
            intel_report.quality_score * 0.5
        ),
        "price_intelligence": {
            "verdict": intel_report.verdict.value,
            "recommendation": intel_report.recommendation,
            "market_average": intel_report.market_average,
            "savings_potential": intel_report.savings_potential,
            "best_deal": intel_report.best_deal
        },
        "authenticity": {
            "assessment": intel_report.authenticity_assessment.value,
            "factors": intel_report.authenticity_factors,
            "confidence": intel_report.confidence
        },
        "protection": {
            "risk_level": protection_result.risk_level.value,
            "risk_score": protection_result.risk_score,
            "threats": [t.value for t in protection_result.threats_detected],
            "risk_factors": protection_result.risk_factors
        },
        "alternative_sources": intel_report.alternative_sources[:3],
        "final_recommendation": _generate_final_recommendation(
            intel_report, protection_result
        )
    }


def _generate_final_recommendation(intel_report, protection_result) -> str:
    """Generate final combined recommendation"""
    # Protection concerns override price
    if protection_result.risk_level.value in ["critical", "high"]:
        return "🚨 AVOID - High risk listing. Security concerns detected."
    
    # Price concerns
    if intel_report.verdict.value == "suspicious":
        return "⚠️ AVOID - Price too good to be true. Likely scam."
    
    if intel_report.verdict.value == "extremely_overpriced":
        return "❌ NOT RECOMMENDED - Extremely overpriced. Find alternatives."
    
    # Authenticity concerns
    if intel_report.authenticity_assessment.value in ["likely_counterfeit", "confirmed_fake"]:
        return "🚨 AVOID - High risk of counterfeit product."
    
    # Good cases
    if (intel_report.verdict.value in ["amazing_deal", "great_value"] and
        intel_report.authenticity_assessment.value in ["verified_authentic", "likely_authentic"]):
        return "🎉 STRONG BUY - Great deal on authentic product!"
    
    if intel_report.verdict.value == "fair_price":
        return "✅ SAFE TO BUY - Fair price, acceptable risk."
    
    if intel_report.verdict.value in ["slightly_high", "overpriced"]:
        if intel_report.alternative_sources:
            return f"💡 CONSIDER ALTERNATIVES - Better deals available from {intel_report.alternative_sources[0].get('source_name', 'other sources')}."
        return "⚠️ SHOP AROUND - Price is above market. Check other sellers."
    
    return "👍 PROCEED WITH CAUTION - Review details before purchasing."


# =============================================================================
# Export
# =============================================================================

def get_router():
    """Get the router for FastAPI app"""
    return router


__all__ = ["router", "get_router"]
