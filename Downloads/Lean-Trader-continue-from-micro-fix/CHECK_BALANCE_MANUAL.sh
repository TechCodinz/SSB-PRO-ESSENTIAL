#!/bin/bash
# Manual balance check - run directly on VPS

cd ~/bot || exit 1

echo "=========================================="
echo "BALANCE SOURCE DIAGNOSTIC"
echo "=========================================="
echo "Timestamp: $(date)"
echo ""

# 1. Recent balance logs
echo "=== RECENT BALANCE LOGS (last 30) ==="
tail -500 bot.log | grep -iE "balance|Balance|Got exchange|Position sizing|insufficient" | tail -30
echo ""

# 2. Exchange configuration
echo "=== EXCHANGE USED ==="
tail -500 bot.log | grep -iE "bybit|testnet|exchange.*selected|Router selected|exchange.*init" | tail -20
echo ""

# 3. Balance fetch attempts
echo "=== BALANCE FETCH ATTEMPTS ==="
tail -500 bot.log | grep -iE "fetch_balance|Got exchange balance|💰.*balance|orchestrator.*balance" | tail -20
echo ""

# 4. All balance values found
echo "=== ALL BALANCE VALUES IN LOGS ==="
tail -1000 bot.log | grep -oE '\$[0-9]+\.[0-9]+|\$[0-9]+' | sort -u | tail -20
echo ""

# 5. Execution with balance context
echo "=== EXECUTION WITH BALANCE CONTEXT ==="
tail -300 bot.log | grep -B 5 -A 10 "insufficient.*balance\|Got exchange balance\|Position sizing" | tail -40
echo ""

# 6. Testnet API config
echo "=== TESTNET API CONFIGURATION ==="
if [ -f ".env" ]; then
    echo "Checking .env for testnet config:"
    grep -E "BYBIT|TESTNET|API.*KEY" .env | grep -v "^#" | head -10
else
    echo ".env file not found"
fi
echo ""

# 7. Balance source trace
echo "=== BALANCE SOURCE TRACE ==="
tail -500 bot.log | grep -E "Got exchange balance|Using orchestrator balance|Using fallback balance|actual_balance|position_sizer" | tail -15
echo ""

# 8. Check for multiple exchange instances
echo "=== EXCHANGE INSTANCES ==="
tail -500 bot.log | grep -iE "exchange.*created|exchange.*initialized|bybit.*testnet|testnet.*bybit" | tail -15
echo ""

echo "=========================================="
echo "DIAGNOSTIC COMPLETE"
echo "=========================================="

