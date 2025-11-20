#!/bin/bash
# Check where balance is coming from and why it's wrong

cd ~/bot || exit 1

echo "=========================================="
echo "BALANCE SOURCE DIAGNOSTIC"
echo "=========================================="
echo ""

# 1. Check recent balance logs
echo "=== RECENT BALANCE LOGS ==="
tail -500 bot.log | grep -iE "balance|Balance|BALANCE|Got exchange balance|Position sizing|insufficient.*balance" | tail -30
echo ""

# 2. Check which exchange is being used
echo "=== EXCHANGE CONFIGURATION ==="
tail -500 bot.log | grep -iE "bybit|testnet|exchange.*init|exchange.*selected|Router selected" | tail -20
echo ""

# 3. Check balance fetch attempts
echo "=== BALANCE FETCH ATTEMPTS ==="
tail -500 bot.log | grep -iE "fetch_balance|fetchBalance|Got exchange balance|exchange balance|💰.*balance" | tail -20
echo ""

# 4. Check for balance errors
echo "=== BALANCE ERRORS ==="
tail -500 bot.log | grep -iE "balance.*error|balance.*failed|could not.*balance|insufficient" | tail -15
echo ""

# 5. Check orchestrator balance
echo "=== ORCHESTRATOR BALANCE ==="
tail -500 bot.log | grep -iE "orchestrator.*balance|position_sizer|actual_balance|LIVE Balance" | tail -15
echo ""

# 6. Check testnet configuration
echo "=== TESTNET CONFIGURATION ==="
if [ -f ".env" ]; then
    echo "Checking .env for testnet config:"
    grep -iE "testnet|bybit|api.*key|BYBIT" .env | head -5
else
    echo ".env file not found"
fi
echo ""

# 7. Check recent execution with balance context
echo "=== EXECUTION WITH BALANCE CONTEXT ==="
tail -300 bot.log | grep -B 5 -A 10 "Fetching live price\|Got live price\|insufficient.*balance" | tail -40
echo ""

# 8. Check for multiple exchange instances
echo "=== EXCHANGE INSTANCES ==="
tail -500 bot.log | grep -iE "exchange.*created|exchange.*initialized|bybit.*testnet|testnet.*bybit" | tail -15
echo ""

# 9. Check balance values in logs
echo "=== ALL BALANCE VALUES FOUND ==="
tail -1000 bot.log | grep -oE '\$[0-9]+\.[0-9]+|\$[0-9]+|balance.*\$[0-9]+' | sort -u | tail -20
echo ""

# 10. Check Python code for balance fetching
echo "=== CHECKING BALANCE FETCH CODE ==="
if [ -f "INTELLIGENT_EXECUTION_ENGINE.py" ]; then
    echo "Balance fetch locations in code:"
    grep -n "fetch_balance\|actual_balance\|position_sizer.balance" INTELLIGENT_EXECUTION_ENGINE.py | head -10
fi
echo ""

echo "=========================================="
echo "NEXT: Check which exchange account is active"
echo "=========================================="

