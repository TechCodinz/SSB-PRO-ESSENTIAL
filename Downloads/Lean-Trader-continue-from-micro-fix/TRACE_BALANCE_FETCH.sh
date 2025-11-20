#!/bin/bash
# Trace exact balance fetch flow

cd ~/bot || exit 1

echo "=========================================="
echo "TRACING BALANCE FETCH FLOW"
echo "=========================================="
echo ""

# Find the LAST execution attempt and show full balance context
echo "=== LAST EXECUTION WITH BALANCE ==="
LAST_EXEC=$(grep -n "EXECUTING\|execute_intelligent\|Got exchange balance\|Position sizing" bot.log | tail -1 | cut -d: -f1)

if [ -n "$LAST_EXEC" ]; then
    START=$((LAST_EXEC - 10))
    END=$((LAST_EXEC + 80))
    echo "Showing context around line $LAST_EXEC:"
    sed -n "${START},${END}p" bot.log | grep -E "balance|Balance|BALANCE|exchange|Exchange|testnet|Position sizing|Got exchange|insufficient"
fi
echo ""

# Check for balance fetch sequence
echo "=== BALANCE FETCH SEQUENCE (last attempt) ==="
tail -200 bot.log | grep -B 3 -A 10 "Got exchange balance\|Position sizing\|fetch_balance" | tail -30
echo ""

# Check what balance value is used
echo "=== BALANCE VALUES IN EXECUTION ==="
tail -300 bot.log | grep -E "balance.*\$|Position sizing.*\$|Got exchange balance.*\$|💰.*\$" | tail -20
echo ""

# Check exchange initialization
echo "=== EXCHANGE INITIALIZATION ==="
tail -1000 bot.log | grep -iE "bybit.*testnet|testnet.*bybit|exchange.*created|exchange.*init" | tail -10
echo ""

# Check for multiple balance sources
echo "=== BALANCE SOURCE TRACE ==="
tail -500 bot.log | grep -E "Got exchange balance|Using orchestrator balance|Using fallback balance|actual_balance|position_sizer" | tail -15
echo ""

echo "=========================================="
echo "Check .env for testnet API keys"
echo "=========================================="
if [ -f ".env" ]; then
    echo "Testnet API configuration:"
    grep -E "BYBIT|TESTNET|API" .env | grep -v "^#" | head -10
fi

