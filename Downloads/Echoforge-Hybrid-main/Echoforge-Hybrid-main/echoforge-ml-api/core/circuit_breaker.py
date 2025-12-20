# EchoForge Production Utilities
# Circuit Breaker, Request Validation, and Resilience Patterns

import time
import hashlib
import threading
from typing import Dict, Any, Optional, Callable, TypeVar, Generic
from functools import wraps
from datetime import datetime, timedelta
from dataclasses import dataclass, field
from enum import Enum
import logging

logger = logging.getLogger(__name__)

T = TypeVar('T')


class CircuitState(Enum):
    """Circuit breaker states."""
    CLOSED = "closed"      # Normal operation
    OPEN = "open"          # Failing, reject requests
    HALF_OPEN = "half_open"  # Testing if service recovered


@dataclass
class CircuitBreakerConfig:
    """Circuit breaker configuration."""
    failure_threshold: int = 5           # Failures before opening
    success_threshold: int = 3           # Successes to close from half-open
    timeout_seconds: float = 60.0        # Time before trying half-open
    half_open_max_calls: int = 3         # Max calls in half-open state


@dataclass
class CircuitBreakerStats:
    """Circuit breaker statistics."""
    state: CircuitState = CircuitState.CLOSED
    failures: int = 0
    successes: int = 0
    last_failure_time: Optional[datetime] = None
    last_success_time: Optional[datetime] = None
    total_calls: int = 0
    total_failures: int = 0
    total_successes: int = 0
    half_open_calls: int = 0


class CircuitBreaker:
    """
    Circuit Breaker pattern for resilient service calls.
    
    Prevents cascade failures by failing fast when a service is unhealthy.
    
    Usage:
        breaker = CircuitBreaker("ml_api")
        
        @breaker
        def call_ml_api():
            return requests.post(...)
        
        # Or manually:
        if breaker.allow_request():
            try:
                result = call_api()
                breaker.record_success()
            except Exception:
                breaker.record_failure()
    """
    
    def __init__(self, name: str, config: Optional[CircuitBreakerConfig] = None):
        self.name = name
        self.config = config or CircuitBreakerConfig()
        self.stats = CircuitBreakerStats()
        self._lock = threading.RLock()
    
    def __call__(self, func: Callable[..., T]) -> Callable[..., T]:
        """Decorator for circuit-protected functions."""
        @wraps(func)
        def wrapper(*args, **kwargs) -> T:
            if not self.allow_request():
                raise CircuitOpenError(f"Circuit '{self.name}' is open")
            try:
                result = func(*args, **kwargs)
                self.record_success()
                return result
            except Exception as e:
                self.record_failure()
                raise
        return wrapper
    
    def allow_request(self) -> bool:
        """Check if request should be allowed."""
        with self._lock:
            if self.stats.state == CircuitState.CLOSED:
                return True
            
            if self.stats.state == CircuitState.OPEN:
                # Check if timeout expired
                if self.stats.last_failure_time:
                    elapsed = (datetime.now() - self.stats.last_failure_time).total_seconds()
                    if elapsed >= self.config.timeout_seconds:
                        self._transition_to_half_open()
                        return True
                return False
            
            if self.stats.state == CircuitState.HALF_OPEN:
                if self.stats.half_open_calls < self.config.half_open_max_calls:
                    self.stats.half_open_calls += 1
                    return True
                return False
            
            return False
    
    def record_success(self):
        """Record a successful call."""
        with self._lock:
            self.stats.successes += 1
            self.stats.total_successes += 1
            self.stats.total_calls += 1
            self.stats.last_success_time = datetime.now()
            
            if self.stats.state == CircuitState.HALF_OPEN:
                if self.stats.successes >= self.config.success_threshold:
                    self._transition_to_closed()
            elif self.stats.state == CircuitState.CLOSED:
                self.stats.failures = 0  # Reset consecutive failures
    
    def record_failure(self):
        """Record a failed call."""
        with self._lock:
            self.stats.failures += 1
            self.stats.total_failures += 1
            self.stats.total_calls += 1
            self.stats.last_failure_time = datetime.now()
            
            if self.stats.state == CircuitState.HALF_OPEN:
                self._transition_to_open()
            elif self.stats.state == CircuitState.CLOSED:
                if self.stats.failures >= self.config.failure_threshold:
                    self._transition_to_open()
    
    def _transition_to_open(self):
        """Transition to open state."""
        logger.warning(f"Circuit '{self.name}' opened after {self.stats.failures} failures")
        self.stats.state = CircuitState.OPEN
    
    def _transition_to_half_open(self):
        """Transition to half-open state."""
        logger.info(f"Circuit '{self.name}' transitioning to half-open")
        self.stats.state = CircuitState.HALF_OPEN
        self.stats.successes = 0
        self.stats.half_open_calls = 0
    
    def _transition_to_closed(self):
        """Transition to closed state."""
        logger.info(f"Circuit '{self.name}' closed after recovery")
        self.stats.state = CircuitState.CLOSED
        self.stats.failures = 0
        self.stats.successes = 0
        self.stats.half_open_calls = 0
    
    def get_stats(self) -> Dict[str, Any]:
        """Get circuit breaker statistics."""
        with self._lock:
            return {
                'name': self.name,
                'state': self.stats.state.value,
                'failures': self.stats.failures,
                'successes': self.stats.successes,
                'total_calls': self.stats.total_calls,
                'total_failures': self.stats.total_failures,
                'total_successes': self.stats.total_successes,
                'last_failure': self.stats.last_failure_time.isoformat() if self.stats.last_failure_time else None,
                'last_success': self.stats.last_success_time.isoformat() if self.stats.last_success_time else None,
            }
    
    def reset(self):
        """Reset circuit breaker to initial state."""
        with self._lock:
            self.stats = CircuitBreakerStats()


class CircuitOpenError(Exception):
    """Exception raised when circuit is open."""
    pass


# Global circuit breakers registry
_circuit_breakers: Dict[str, CircuitBreaker] = {}


def get_circuit_breaker(name: str, config: Optional[CircuitBreakerConfig] = None) -> CircuitBreaker:
    """Get or create a circuit breaker by name."""
    if name not in _circuit_breakers:
        _circuit_breakers[name] = CircuitBreaker(name, config)
    return _circuit_breakers[name]


def get_all_circuit_stats() -> Dict[str, Dict[str, Any]]:
    """Get statistics for all circuit breakers."""
    return {name: cb.get_stats() for name, cb in _circuit_breakers.items()}


# ============================================================================
# RATE LIMITER
# ============================================================================

@dataclass
class RateLimiterConfig:
    """Rate limiter configuration."""
    requests_per_minute: int = 60
    burst_size: int = 10
    window_seconds: float = 60.0


class TokenBucketRateLimiter:
    """
    Token bucket rate limiter for API request throttling.
    
    Features:
    - Allows burst traffic up to bucket size
    - Smooth refill over time
    - Thread-safe
    """
    
    def __init__(self, name: str, config: Optional[RateLimiterConfig] = None):
        self.name = name
        self.config = config or RateLimiterConfig()
        self.tokens = float(self.config.burst_size)
        self.last_refill = time.time()
        self._lock = threading.Lock()
        
        # Calculate refill rate (tokens per second)
        self.refill_rate = self.config.requests_per_minute / 60.0
    
    def _refill(self):
        """Refill tokens based on elapsed time."""
        now = time.time()
        elapsed = now - self.last_refill
        self.tokens = min(
            self.config.burst_size,
            self.tokens + elapsed * self.refill_rate
        )
        self.last_refill = now
    
    def acquire(self, tokens: int = 1) -> bool:
        """Try to acquire tokens. Returns True if successful."""
        with self._lock:
            self._refill()
            if self.tokens >= tokens:
                self.tokens -= tokens
                return True
            return False
    
    def wait_and_acquire(self, tokens: int = 1, max_wait: float = 10.0) -> bool:
        """Wait for tokens to become available."""
        deadline = time.time() + max_wait
        while time.time() < deadline:
            if self.acquire(tokens):
                return True
            time.sleep(0.1)
        return False


# ============================================================================
# REQUEST VALIDATOR
# ============================================================================

class RequestValidator:
    """
    Request validation and sanitization for API inputs.
    
    Features:
    - Size limits
    - Type validation
    - Input sanitization
    - Schema validation
    """
    
    MAX_PAYLOAD_SIZE = 10 * 1024 * 1024  # 10 MB
    MAX_ARRAY_LENGTH = 100000
    MAX_STRING_LENGTH = 10000
    
    @classmethod
    def validate_detection_request(cls, data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate detection request data."""
        errors = []
        
        # Check required fields
        if 'data' not in data:
            errors.append("Missing required field: 'data'")
        else:
            input_data = data['data']
            if isinstance(input_data, list):
                if len(input_data) == 0:
                    errors.append("Data array is empty")
                if len(input_data) > cls.MAX_ARRAY_LENGTH:
                    errors.append(f"Data array too large (max {cls.MAX_ARRAY_LENGTH})")
        
        # Validate method
        valid_methods = [
            'isolation_forest', 'lof', 'ocsvm', 'hbos', 'knn', 'copod', 'ecod',
            'zscore', 'modified_zscore', 'iqr', 'grubbs', 'gesd', 'mahalanobis',
            'dbscan', 'hdbscan', 'suod', 'lscp', 'autoencoder', 'vae',
            'prophet', 'stl', 'changepoint', 'ensemble'
        ]
        method = data.get('method', 'isolation_forest')
        if method not in valid_methods:
            errors.append(f"Invalid method: {method}. Valid: {valid_methods}")
        
        # Validate numeric parameters
        sensitivity = data.get('sensitivity', 1.0)
        if not isinstance(sensitivity, (int, float)) or sensitivity <= 0 or sensitivity > 10:
            errors.append("Sensitivity must be a number between 0 and 10")
        
        expected_rate = data.get('expected_rate', 0.1)
        if not isinstance(expected_rate, (int, float)) or expected_rate < 0.01 or expected_rate > 0.5:
            errors.append("Expected rate must be between 0.01 and 0.5")
        
        return {
            'valid': len(errors) == 0,
            'errors': errors,
            'sanitized': {
                'method': method,
                'sensitivity': float(min(10, max(0.1, sensitivity))),
                'expected_rate': float(min(0.5, max(0.01, expected_rate))),
            }
        }
    
    @classmethod
    def sanitize_string(cls, value: str, max_length: Optional[int] = None) -> str:
        """Sanitize string input."""
        if not isinstance(value, str):
            return str(value)
        
        max_len = max_length or cls.MAX_STRING_LENGTH
        value = value[:max_len]
        
        # Remove null bytes and other dangerous characters
        value = value.replace('\x00', '')
        
        return value.strip()


# ============================================================================
# IDEMPOTENCY
# ============================================================================

class IdempotencyCache:
    """
    Idempotency cache for preventing duplicate request processing.
    
    Features:
    - TTL-based expiration
    - Thread-safe
    - Memory-bounded
    """
    
    def __init__(self, ttl_seconds: int = 300, max_size: int = 10000):
        self.ttl = ttl_seconds
        self.max_size = max_size
        self._cache: Dict[str, tuple[Any, float]] = {}
        self._lock = threading.Lock()
    
    def get(self, key: str) -> Optional[Any]:
        """Get cached result if exists and not expired."""
        with self._lock:
            if key in self._cache:
                result, timestamp = self._cache[key]
                if time.time() - timestamp < self.ttl:
                    return result
                del self._cache[key]
            return None
    
    def set(self, key: str, value: Any):
        """Cache a result."""
        with self._lock:
            # Evict old entries if at capacity
            if len(self._cache) >= self.max_size:
                self._evict_oldest()
            self._cache[key] = (value, time.time())
    
    def _evict_oldest(self):
        """Evict oldest 10% of entries."""
        if not self._cache:
            return
        
        entries = sorted(self._cache.items(), key=lambda x: x[1][1])
        to_remove = max(1, len(entries) // 10)
        
        for key, _ in entries[:to_remove]:
            del self._cache[key]
    
    def generate_key(self, *args, **kwargs) -> str:
        """Generate cache key from arguments."""
        key_parts = [str(arg) for arg in args]
        key_parts.extend(f"{k}={v}" for k, v in sorted(kwargs.items()))
        combined = "|".join(key_parts)
        return hashlib.md5(combined.encode()).hexdigest()


# ============================================================================
# HEALTH CHECKER
# ============================================================================

@dataclass
class HealthStatus:
    """Health check status."""
    healthy: bool
    message: str
    latency_ms: float
    timestamp: datetime = field(default_factory=datetime.now)
    details: Dict[str, Any] = field(default_factory=dict)


class HealthChecker:
    """
    Health checker for service dependencies.
    
    Features:
    - Multiple dependency checks
    - Aggregated health status
    - Latency tracking
    """
    
    def __init__(self):
        self.checks: Dict[str, Callable[[], HealthStatus]] = {}
    
    def register_check(self, name: str, check_func: Callable[[], HealthStatus]):
        """Register a health check function."""
        self.checks[name] = check_func
    
    def check_all(self) -> Dict[str, HealthStatus]:
        """Run all health checks."""
        results = {}
        for name, check_func in self.checks.items():
            try:
                start = time.time()
                status = check_func()
                status.latency_ms = (time.time() - start) * 1000
                results[name] = status
            except Exception as e:
                results[name] = HealthStatus(
                    healthy=False,
                    message=str(e),
                    latency_ms=0
                )
        return results
    
    def is_healthy(self) -> bool:
        """Check if all dependencies are healthy."""
        results = self.check_all()
        return all(status.healthy for status in results.values())
    
    def get_summary(self) -> Dict[str, Any]:
        """Get health summary."""
        results = self.check_all()
        return {
            'healthy': all(s.healthy for s in results.values()),
            'checks': {
                name: {
                    'healthy': status.healthy,
                    'message': status.message,
                    'latency_ms': round(status.latency_ms, 2),
                }
                for name, status in results.items()
            },
            'timestamp': datetime.now().isoformat(),
        }


# Singleton instances
_idempotency_cache = IdempotencyCache()
_health_checker = HealthChecker()


def get_idempotency_cache() -> IdempotencyCache:
    """Get global idempotency cache."""
    return _idempotency_cache


def get_health_checker() -> HealthChecker:
    """Get global health checker."""
    return _health_checker
