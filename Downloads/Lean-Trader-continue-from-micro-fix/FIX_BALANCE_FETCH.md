# Fix: Balance Fetch Issue

## Problem
Bot has $9000+ on testnet but logs show only $2.18 balance, causing "Insufficient balance" errors.

## Possible Causes

1. **Wrong Exchange Instance**: Fetching balance from wrong exchange account
2. **Balance Caching**: Using cached/stale balance instead of fresh fetch
3. **Wrong Balance Key**: Looking at wrong currency or account type
4. **Multiple Exchange Objects**: Different exchange instances with different balances
5. **Fallback Balance**: Code falling back to default $1000 or stored balance

## Diagnostic Commands

### Quick Check:
```bash
cd ~/bot && tail -500 bot.log | grep -iE "balance|Got exchange|Position sizing" | tail -25
```

### Full Trace:
```bash
cd ~/bot && chmod +x TRACE_BALANCE_FETCH.sh && ./TRACE_BALANCE_FETCH.sh
```

### Check Exchange Config:
```bash
cd ~/bot && grep -E "BYBIT|TESTNET|API" .env | grep -v "^#"
```

## What to Look For

1. **Which exchange is being used**: bybit_testnet vs bybit
2. **Balance fetch location**: exchange.fetch_balance() vs orchestrator balance
3. **Balance value**: $2.18 vs $9000+
4. **Currency**: USDT vs other currencies
5. **Account type**: Spot vs Futures balance

## Expected Fix

Once we identify the issue, we'll need to:
1. Ensure correct exchange instance is used
2. Fetch balance from correct account/currency
3. Use fresh balance, not cached
4. Log which balance source is used

