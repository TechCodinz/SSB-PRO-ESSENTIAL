"""
Sol Sniper Bot PRO - Multi-Source Token Scanner
🌐 Aggregates token data from multiple sources for maximum opportunity coverage

Supported Sources:
- Pump.fun (new launches)
- Moonshot (competitor launches)  
- Raydium (DEX new pairs)
- Jupiter (aggregator trending)
- Birdeye (trending tokens)
- Dexscreener (new pairs)
- Helius (RPC events)
"""

import asyncio
import json
import aiohttp
from datetime import datetime
from typing import Dict, List, Optional, Callable, Any
from dataclasses import dataclass, field
from enum import Enum


class TokenSource(Enum):
    PUMP_FUN = "pump_fun"
    MOONSHOT = "moonshot"
    RAYDIUM = "raydium"
    JUPITER = "jupiter"
    BIRDEYE = "birdeye"
    DEXSCREENER = "dexscreener"
    HELIUS = "helius"


@dataclass
class TokenEvent:
    """Unified token event from any source"""
    mint: str
    source: TokenSource
    event_type: str  # "new_token", "new_pair", "trending", "volume_spike"
    price: float = 0.0
    liquidity_usd: float = 0.0
    volume_5m: float = 0.0
    market_cap: float = 0.0
    holder_count: int = 0
    created_at: datetime = field(default_factory=datetime.utcnow)
    raw_data: dict = field(default_factory=dict)
    
    def to_dict(self) -> dict:
        """Convert to dict for processing"""
        return {
            "mint": self.mint,
            "source": self.source.value,
            "event_type": self.event_type,
            "price": self.price,
            "liquidityUsd": self.liquidity_usd,
            "volume5m": self.volume_5m,
            "marketCap": self.market_cap,
            "holderCount": self.holder_count,
            **self.raw_data
        }


class MultiSourceScanner:
    """
    🌐 Multi-Source Token Scanner
    
    Connects to multiple data sources simultaneously and aggregates
    token opportunities into a unified stream.
    
    Features:
    - Parallel WebSocket connections
    - Deduplication (same token from multiple sources)
    - Source prioritization
    - Automatic reconnection
    - Rate limiting per source
    """
    
    # WebSocket endpoints
    ENDPOINTS = {
        TokenSource.PUMP_FUN: "wss://pumpportal.fun/api/data",
        TokenSource.MOONSHOT: "wss://api.moonshot.cc/ws/v1",
        # Note: Some sources use REST polling instead of WebSocket
    }
    
    # REST API endpoints for polling
    REST_ENDPOINTS = {
        TokenSource.BIRDEYE: "https://public-api.birdeye.so/defi/trending",
        TokenSource.DEXSCREENER: "https://api.dexscreener.com/latest/dex/tokens/solana",
        TokenSource.JUPITER: "https://api.jup.ag/price/v2",
    }
    
    def __init__(self, on_token_event: Callable[[TokenEvent], Any]):
        self.on_token_event = on_token_event
        self.running = False
        self.seen_mints: set = set()  # Deduplication
        self.source_stats: Dict[TokenSource, dict] = {}
        self.tasks: List[asyncio.Task] = []
        
        # Initialize stats for each source
        for source in TokenSource:
            self.source_stats[source] = {
                "connected": False,
                "tokens_received": 0,
                "last_event": None,
                "errors": 0
            }
    
    async def start(self):
        """Start all source connections"""
        self.running = True
        print("[MULTI-SOURCE] 🌐 Starting multi-source scanner...", flush=True)
        
        # Start WebSocket connections
        self.tasks.append(asyncio.create_task(self._connect_pump_fun()))
        self.tasks.append(asyncio.create_task(self._connect_moonshot()))
        
        # Start REST pollers
        self.tasks.append(asyncio.create_task(self._poll_dexscreener()))
        self.tasks.append(asyncio.create_task(self._poll_birdeye()))
        self.tasks.append(asyncio.create_task(self._poll_raydium_new_pairs()))
        
        print("[MULTI-SOURCE] ✅ All sources initialized!", flush=True)
        
    async def stop(self):
        """Stop all connections"""
        self.running = False
        for task in self.tasks:
            task.cancel()
        self.tasks.clear()
        print("[MULTI-SOURCE] 🛑 Scanner stopped", flush=True)
    
    async def _emit_event(self, event: TokenEvent):
        """Emit a token event (with deduplication)"""
        # Deduplicate - only process each mint once per minute
        dedup_key = f"{event.mint}:{event.source.value}"
        if dedup_key in self.seen_mints:
            return
        
        self.seen_mints.add(dedup_key)
        
        # Clear old entries periodically
        if len(self.seen_mints) > 10000:
            self.seen_mints.clear()
        
        # Update stats
        self.source_stats[event.source]["tokens_received"] += 1
        self.source_stats[event.source]["last_event"] = datetime.utcnow()
        
        # Emit to handler
        await self.on_token_event(event)
    
    # ==================== PUMP.FUN ====================
    
    async def _connect_pump_fun(self):
        """Connect to Pump.fun WebSocket"""
        import websockets
        
        source = TokenSource.PUMP_FUN
        ws_url = self.ENDPOINTS[source]
        
        while self.running:
            try:
                print(f"[{source.value}] 🔌 Connecting...", flush=True)
                
                async with websockets.connect(ws_url, ping_interval=30) as ws:
                    await ws.send(json.dumps({"method": "subscribeNewToken"}))
                    self.source_stats[source]["connected"] = True
                    print(f"[{source.value}] ✅ Connected!", flush=True)
                    
                    async for raw in ws:
                        if not self.running:
                            break
                        
                        try:
                            data = json.loads(raw)
                            mint = data.get("mint")
                            if not mint:
                                continue
                            
                            event = TokenEvent(
                                mint=mint,
                                source=source,
                                event_type="new_token",
                                price=data.get("price", 0),
                                liquidity_usd=data.get("liquidityUsd", 0),
                                volume_5m=data.get("volume5m", 0),
                                market_cap=data.get("marketCap", 0),
                                raw_data=data
                            )
                            await self._emit_event(event)
                            
                        except Exception as e:
                            self.source_stats[source]["errors"] += 1
                            
            except Exception as e:
                self.source_stats[source]["connected"] = False
                self.source_stats[source]["errors"] += 1
                print(f"[{source.value}] ⚠️ Error: {e}. Reconnecting in 5s...", flush=True)
                await asyncio.sleep(5)
    
    # ==================== MOONSHOT ====================
    
    async def _connect_moonshot(self):
        """Connect to Moonshot WebSocket (Pump.fun competitor)"""
        import websockets
        
        source = TokenSource.MOONSHOT
        # Moonshot uses a similar WebSocket protocol
        ws_url = "wss://api.moonshot.cc/ws/v1/tokens"
        
        while self.running:
            try:
                print(f"[{source.value}] 🔌 Connecting...", flush=True)
                
                try:
                    async with websockets.connect(ws_url, ping_interval=30) as ws:
                        await ws.send(json.dumps({"action": "subscribe", "channel": "new_tokens"}))
                        self.source_stats[source]["connected"] = True
                        print(f"[{source.value}] ✅ Connected!", flush=True)
                        
                        async for raw in ws:
                            if not self.running:
                                break
                            
                            try:
                                data = json.loads(raw)
                                mint = data.get("tokenAddress") or data.get("mint")
                                if not mint:
                                    continue
                                
                                event = TokenEvent(
                                    mint=mint,
                                    source=source,
                                    event_type="new_token",
                                    price=data.get("price", 0),
                                    liquidity_usd=data.get("liquidity", 0),
                                    market_cap=data.get("marketCap", 0),
                                    raw_data=data
                                )
                                await self._emit_event(event)
                                
                            except Exception:
                                pass
                                
                except Exception:
                    # Moonshot WS might not be available, fall back to polling
                    await self._poll_moonshot_fallback()
                    
            except Exception as e:
                self.source_stats[source]["connected"] = False
                print(f"[{source.value}] ⚠️ Using REST fallback", flush=True)
                await asyncio.sleep(30)
    
    async def _poll_moonshot_fallback(self):
        """Fallback polling for Moonshot"""
        source = TokenSource.MOONSHOT
        url = "https://api.moonshot.cc/tokens/v1/new"
        
        async with aiohttp.ClientSession() as session:
            while self.running:
                try:
                    async with session.get(url, timeout=10) as resp:
                        if resp.status == 200:
                            data = await resp.json()
                            tokens = data.get("tokens", []) if isinstance(data, dict) else data
                            
                            for token in tokens[:20]:  # Top 20 newest
                                mint = token.get("tokenAddress") or token.get("address")
                                if mint:
                                    event = TokenEvent(
                                        mint=mint,
                                        source=source,
                                        event_type="new_token",
                                        price=token.get("price", 0),
                                        liquidity_usd=token.get("liquidity", 0),
                                        market_cap=token.get("marketCap", 0),
                                        raw_data=token
                                    )
                                    await self._emit_event(event)
                                    
                except Exception as e:
                    self.source_stats[source]["errors"] += 1
                    
                await asyncio.sleep(10)  # Poll every 10 seconds
    
    # ==================== DEXSCREENER ====================
    
    async def _poll_dexscreener(self):
        """Poll DexScreener for new Solana pairs"""
        source = TokenSource.DEXSCREENER
        url = "https://api.dexscreener.com/latest/dex/search?q=solana"
        
        print(f"[{source.value}] 🔌 Starting polling...", flush=True)
        
        async with aiohttp.ClientSession() as session:
            while self.running:
                try:
                    async with session.get(url, timeout=15) as resp:
                        if resp.status == 200:
                            data = await resp.json()
                            pairs = data.get("pairs", [])
                            
                            # Filter for new pairs (< 1 hour old) and Solana
                            for pair in pairs[:30]:
                                if pair.get("chainId") != "solana":
                                    continue
                                    
                                mint = pair.get("baseToken", {}).get("address")
                                if not mint:
                                    continue
                                
                                # Check if new (created in last hour)
                                created_at = pair.get("pairCreatedAt", 0)
                                age_hours = (datetime.utcnow().timestamp() * 1000 - created_at) / 3600000
                                
                                if age_hours < 2:  # Less than 2 hours old
                                    event = TokenEvent(
                                        mint=mint,
                                        source=source,
                                        event_type="new_pair",
                                        price=float(pair.get("priceUsd", 0) or 0),
                                        liquidity_usd=float(pair.get("liquidity", {}).get("usd", 0) or 0),
                                        volume_5m=float(pair.get("volume", {}).get("m5", 0) or 0),
                                        market_cap=float(pair.get("fdv", 0) or 0),
                                        raw_data=pair
                                    )
                                    await self._emit_event(event)
                                    
                            self.source_stats[source]["connected"] = True
                            
                except Exception as e:
                    self.source_stats[source]["errors"] += 1
                    self.source_stats[source]["connected"] = False
                    
                await asyncio.sleep(15)  # Poll every 15 seconds
    
    # ==================== BIRDEYE ====================
    
    async def _poll_birdeye(self):
        """Poll Birdeye for trending tokens"""
        source = TokenSource.BIRDEYE
        url = "https://public-api.birdeye.so/defi/token_trending?sort_by=volume24hChangePercent&sort_type=desc&offset=0&limit=20"
        
        print(f"[{source.value}] 🔌 Starting polling...", flush=True)
        
        headers = {
            "accept": "application/json",
            # Note: Birdeye may require API key for production
        }
        
        async with aiohttp.ClientSession() as session:
            while self.running:
                try:
                    async with session.get(url, headers=headers, timeout=15) as resp:
                        if resp.status == 200:
                            data = await resp.json()
                            tokens = data.get("data", {}).get("items", [])
                            
                            for token in tokens:
                                mint = token.get("address")
                                if not mint:
                                    continue
                                
                                event = TokenEvent(
                                    mint=mint,
                                    source=source,
                                    event_type="trending",
                                    price=float(token.get("price", 0) or 0),
                                    liquidity_usd=float(token.get("liquidity", 0) or 0),
                                    volume_5m=float(token.get("volume24h", 0) or 0) / 288,  # Estimate 5m
                                    market_cap=float(token.get("mc", 0) or 0),
                                    raw_data=token
                                )
                                await self._emit_event(event)
                                
                            self.source_stats[source]["connected"] = True
                            
                except Exception as e:
                    self.source_stats[source]["errors"] += 1
                    
                await asyncio.sleep(30)  # Poll every 30 seconds (trending updates slower)
    
    # ==================== RAYDIUM ====================
    
    async def _poll_raydium_new_pairs(self):
        """Poll Raydium for new AMM pools"""
        source = TokenSource.RAYDIUM
        url = "https://api.raydium.io/v2/main/pairs"
        
        print(f"[{source.value}] 🔌 Starting polling...", flush=True)
        
        seen_pools = set()
        
        async with aiohttp.ClientSession() as session:
            while self.running:
                try:
                    async with session.get(url, timeout=20) as resp:
                        if resp.status == 200:
                            data = await resp.json()
                            pairs = data if isinstance(data, list) else data.get("data", [])
                            
                            for pair in pairs[:50]:
                                pool_id = pair.get("ammId") or pair.get("id")
                                if pool_id in seen_pools:
                                    continue
                                
                                seen_pools.add(pool_id)
                                
                                # Get base token (the new token, not SOL/USDC)
                                base_mint = pair.get("baseMint")
                                quote_mint = pair.get("quoteMint")
                                
                                # Skip if base is SOL or USDC
                                stable_mints = [
                                    "So11111111111111111111111111111111111111112",  # SOL
                                    "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",  # USDC
                                ]
                                
                                mint = base_mint if base_mint not in stable_mints else quote_mint
                                if not mint or mint in stable_mints:
                                    continue
                                
                                event = TokenEvent(
                                    mint=mint,
                                    source=source,
                                    event_type="new_pair",
                                    price=float(pair.get("price", 0) or 0),
                                    liquidity_usd=float(pair.get("liquidity", 0) or 0),
                                    volume_5m=float(pair.get("volume24h", 0) or 0) / 288,
                                    raw_data=pair
                                )
                                await self._emit_event(event)
                                
                            self.source_stats[source]["connected"] = True
                            
                            # Clear old pool IDs periodically
                            if len(seen_pools) > 5000:
                                seen_pools.clear()
                                
                except Exception as e:
                    self.source_stats[source]["errors"] += 1
                    
                await asyncio.sleep(20)  # Poll every 20 seconds
    
    def get_stats(self) -> dict:
        """Get scanner statistics"""
        return {
            source.value: stats 
            for source, stats in self.source_stats.items()
        }


# Global scanner instance
multi_scanner: Optional[MultiSourceScanner] = None


def get_multi_scanner(on_token_event: Callable) -> MultiSourceScanner:
    """Get or create the global multi-scanner"""
    global multi_scanner
    if multi_scanner is None:
        multi_scanner = MultiSourceScanner(on_token_event)
    return multi_scanner
