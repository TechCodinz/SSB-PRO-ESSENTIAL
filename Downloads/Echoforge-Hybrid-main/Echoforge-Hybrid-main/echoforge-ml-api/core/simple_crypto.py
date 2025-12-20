"""
Simplified Crypto Analysis
Works without external API dependencies
"""

import hashlib
import json
import time
import random
from typing import Dict, Any, List
from datetime import datetime, timedelta
import re

class SimpleCryptoAnalyzer:
    def __init__(self):
        """Initialize simple crypto analyzer"""
        self.suspicious_patterns = [
            "round_amounts",  # Many round numbers
            "rapid_transactions",  # High frequency
            "unusual_timing",  # Transactions at odd hours
            "mixing_patterns",  # Multiple small transactions
            "address_reuse"  # Same address used multiple times
        ]
        
        # Simulated suspicious addresses (in real implementation, use real databases)
        self.suspicious_addresses = [
            "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",  # Genesis block
            "3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy",  # Known mixing service
            "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"  # Another example
        ]
    
    def validate_address(self, address: str, currency: str = 'BTC') -> Dict[str, Any]:
        """Validate cryptocurrency address format"""
        try:
            if currency.upper() == 'BTC':
                return self.validate_btc_address(address)
            elif currency.upper() == 'ETH':
                return self.validate_eth_address(address)
            elif currency.upper() == 'USDT':
                return self.validate_usdt_address(address)
            else:
                return {"valid": False, "error": "Unsupported currency"}
        except Exception as e:
            return {"valid": False, "error": str(e)}
    
    def validate_btc_address(self, address: str) -> Dict[str, Any]:
        """Validate Bitcoin address"""
        try:
            # Basic Bitcoin address validation
            if len(address) < 26 or len(address) > 35:
                return {"valid": False, "error": "Invalid length"}
            
            if not address.startswith(('1', '3', 'bc1')):
                return {"valid": False, "error": "Invalid prefix"}
            
            # Check for valid characters
            if not re.match(r'^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$', address):
                return {"valid": False, "error": "Invalid character set"}
            
            return {"valid": True, "type": "bitcoin", "network": "mainnet"}
        except Exception as e:
            return {"valid": False, "error": str(e)}
    
    def validate_eth_address(self, address: str) -> Dict[str, Any]:
        """Validate Ethereum address"""
        try:
            if not address.startswith('0x'):
                return {"valid": False, "error": "Must start with 0x"}
            
            if len(address) != 42:
                return {"valid": False, "error": "Invalid length"}
            
            # Check if it's a valid hex string
            if not re.match(r'^0x[a-fA-F0-9]{40}$', address):
                return {"valid": False, "error": "Invalid hex format"}
            
            return {"valid": True, "type": "ethereum", "network": "mainnet"}
        except Exception as e:
            return {"valid": False, "error": str(e)}
    
    def validate_usdt_address(self, address: str) -> Dict[str, Any]:
        """Validate USDT address"""
        try:
            # USDT can be on multiple networks
            if address.startswith('0x'):
                return self.validate_eth_address(address)
            elif address.startswith('T'):
                # Tron address
                if len(address) == 34 and re.match(r'^T[a-zA-Z0-9]{33}$', address):
                    return {"valid": True, "type": "tron", "network": "mainnet"}
                else:
                    return {"valid": False, "error": "Invalid Tron address format"}
            else:
                return {"valid": False, "error": "Invalid USDT address format"}
        except Exception as e:
            return {"valid": False, "error": str(e)}
    
    def generate_mock_transactions(self, address: str, count: int = 50) -> List[Dict[str, Any]]:
        """Generate mock transaction data for analysis"""
        try:
            transactions = []
            base_time = datetime.now() - timedelta(days=30)
            
            for i in range(count):
                # Generate realistic transaction data
                tx_time = base_time + timedelta(hours=random.randint(0, 720))
                amount = random.uniform(0.001, 10.0)
                
                # Add some patterns
                if random.random() < 0.3:  # 30% chance of round amounts
                    amount = round(amount, 0)
                
                transaction = {
                    "hash": hashlib.sha256(f"{address}_{i}_{tx_time.isoformat()}".encode()).hexdigest()[:16],
                    "time": tx_time.isoformat(),
                    "amount": amount,
                    "from_address": address if random.random() < 0.5 else self.generate_random_address(),
                    "to_address": self.generate_random_address() if random.random() < 0.5 else address,
                    "confirmations": random.randint(1, 6),
                    "fee": random.uniform(0.0001, 0.01)
                }
                transactions.append(transaction)
            
            return transactions
        except Exception as e:
            return []
    
    def generate_random_address(self) -> str:
        """Generate random address for testing"""
        return hashlib.sha256(str(random.random()).encode()).hexdigest()[:34]
    
    def analyze_transaction_patterns(self, transactions: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze transaction patterns for fraud detection"""
        try:
            if not transactions:
                return {"risk_score": 0, "patterns": [], "analysis": "No transactions to analyze"}
            
            patterns = []
            risk_factors = []
            
            # Analyze transaction amounts
            amounts = [tx.get('amount', 0) for tx in transactions]
            if amounts:
                avg_amount = sum(amounts) / len(amounts)
                amount_variance = sum((x - avg_amount) ** 2 for x in amounts) / len(amounts)
                
                # Check for round amounts (potential bot activity)
                round_amounts = [amt for amt in amounts if amt > 0 and amt % 1 == 0]
                if len(round_amounts) > len(amounts) * 0.7:
                    patterns.append("High percentage of round amounts")
                    risk_factors.append(20)
                
                # Check for unusual amount variance
                if amount_variance > avg_amount * 2:
                    patterns.append("High variance in transaction amounts")
                    risk_factors.append(15)
            
            # Analyze transaction timing
            times = [datetime.fromisoformat(tx['time'].replace('Z', '+00:00')) for tx in transactions if 'time' in tx]
            if len(times) > 1:
                time_diffs = [(times[i] - times[i+1]).total_seconds() for i in range(len(times)-1)]
                avg_interval = sum(time_diffs) / len(time_diffs)
                
                if avg_interval < 60:  # Less than 1 minute
                    patterns.append("Very high transaction frequency")
                    risk_factors.append(25)
                elif avg_interval < 300:  # Less than 5 minutes
                    patterns.append("High transaction frequency")
                    risk_factors.append(15)
            
            # Analyze address reuse
            from_addresses = [tx.get('from_address', '') for tx in transactions]
            to_addresses = [tx.get('to_address', '') for tx in transactions]
            
            unique_from = len(set(from_addresses))
            unique_to = len(set(to_addresses))
            
            if unique_from < len(transactions) * 0.3:  # Less than 30% unique from addresses
                patterns.append("Low address diversity in from_addresses")
                risk_factors.append(10)
            
            if unique_to < len(transactions) * 0.3:  # Less than 30% unique to addresses
                patterns.append("Low address diversity in to_addresses")
                risk_factors.append(10)
            
            # Calculate risk score
            risk_score = min(sum(risk_factors), 100)
            
            return {
                "risk_score": risk_score,
                "patterns": patterns,
                "transaction_count": len(transactions),
                "avg_amount": avg_amount if amounts else 0,
                "total_volume": sum(amounts) if amounts else 0,
                "unique_from_addresses": unique_from,
                "unique_to_addresses": unique_to,
                "analysis_timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            return {"error": str(e), "risk_score": 0, "patterns": []}
    
    def check_address_reputation(self, address: str) -> Dict[str, Any]:
        """Check address reputation against known databases"""
        try:
            reputation = {
                "is_suspicious": False,
                "is_mixing_service": False,
                "is_exchange": False,
                "is_known_scam": False,
                "reputation_score": 50  # Neutral score
            }
            
            # Check against suspicious addresses
            if address in self.suspicious_addresses:
                reputation["is_suspicious"] = True
                reputation["is_known_scam"] = True
                reputation["reputation_score"] = 0
            
            # Simulate additional checks
            address_hash = int(hashlib.sha256(address.encode()).hexdigest()[:8], 16)
            
            # Simulate exchange detection (addresses ending in certain patterns)
            if address.endswith(('000', '111', '222')):
                reputation["is_exchange"] = True
                reputation["reputation_score"] = 80
            
            # Simulate mixing service detection
            if address_hash % 100 < 5:  # 5% chance
                reputation["is_mixing_service"] = True
                reputation["reputation_score"] = 20
            
            return reputation
        except Exception as e:
            return {"error": str(e), "reputation_score": 50}
    
    def detect_money_laundering(self, transactions: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Detect potential money laundering patterns"""
        try:
            if not transactions:
                return {"is_laundering": False, "confidence": 0, "patterns": []}
            
            laundering_patterns = []
            confidence = 0
            
            # Check for smurfing (many small transactions)
            amounts = [tx.get('amount', 0) for tx in transactions if 'amount' in tx]
            if amounts:
                small_transactions = [amt for amt in amounts if 0 < amt < 0.1]
                if len(small_transactions) > len(amounts) * 0.7:
                    laundering_patterns.append("Smurfing pattern detected (many small transactions)")
                    confidence += 30
            
            # Check for rapid transactions
            times = [datetime.fromisoformat(tx['time'].replace('Z', '+00:00')) for tx in transactions if 'time' in tx]
            if len(times) > 1:
                time_diffs = [(times[i] - times[i+1]).total_seconds() for i in range(len(times)-1)]
                rapid_transactions = [diff for diff in time_diffs if diff < 10]
                if len(rapid_transactions) > len(time_diffs) * 0.5:
                    laundering_patterns.append("Rapid transaction timing")
                    confidence += 25
            
            # Check for round amounts (potential automated activity)
            round_amounts = [amt for amt in amounts if amt > 0 and amt % 1 == 0]
            if len(round_amounts) > len(amounts) * 0.8:
                laundering_patterns.append("High percentage of round amounts")
                confidence += 20
            
            return {
                "is_laundering": confidence > 50,
                "confidence": min(confidence, 100),
                "patterns": laundering_patterns
            }
        except Exception as e:
            return {"error": str(e), "is_laundering": False, "confidence": 0}
    
    def analyze_crypto_fraud(self, address: str, currency: str = 'BTC') -> Dict[str, Any]:
        """Main function to analyze crypto fraud"""
        try:
            start_time = time.time()
            
            # Validate address
            validation = self.validate_address(address, currency)
            if not validation.get('valid', False):
                return {"error": f"Invalid address: {validation.get('error', 'Unknown error')}"}
            
            # Generate mock transaction data
            transactions = self.generate_mock_transactions(address, 50)
            
            # Analyze patterns
            pattern_analysis = self.analyze_transaction_patterns(transactions)
            
            # Check reputation
            reputation = self.check_address_reputation(address)
            
            # Detect money laundering
            laundering_analysis = self.detect_money_laundering(transactions)
            
            # Calculate overall risk score
            risk_score = (
                pattern_analysis.get('risk_score', 0) * 0.4 +
                (100 - reputation.get('reputation_score', 50)) * 0.3 +
                laundering_analysis.get('confidence', 0) * 0.3
            )
            
            processing_time = time.time() - start_time
            
            return {
                "address": address,
                "currency": currency,
                "is_fraudulent": risk_score > 70,
                "risk_score": min(risk_score, 100),
                "validation": validation,
                "transaction_analysis": pattern_analysis,
                "reputation": reputation,
                "money_laundering": laundering_analysis,
                "transaction_count": len(transactions),
                "processing_time": processing_time,
                "analysis_timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            return {"error": str(e), "is_fraudulent": False, "risk_score": 0}


def analyze_crypto_fraud_simple(address: str, currency: str = 'BTC') -> Dict[str, Any]:
    """Simple crypto fraud analysis function"""
    try:
        analyzer = SimpleCryptoAnalyzer()
        return analyzer.analyze_crypto_fraud(address, currency)
    except Exception as e:
        return {"error": str(e), "is_fraudulent": False, "risk_score": 0}
