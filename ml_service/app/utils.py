# ml-service/app/utils.py

import logging
import hashlib
import time
from functools import wraps
from typing import Any, Callable

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def calculate_hash(text: str) -> str:
    """Calculate MD5 hash of text"""
    return hashlib.md5(text.encode()).hexdigest()

def timer(func: Callable) -> Callable:
    """Decorator to measure function execution time"""
    @wraps(func)
    async def wrapper(*args, **kwargs):
        start = time.time()
        result = await func(*args, **kwargs)
        end = time.time()
        logger.info(f"{func.__name__} took {end - start:.2f} seconds")
        return result
    return wrapper

def validate_api_sequence(api_sequence: str) -> bool:
    """Validate API sequence format"""
    if not api_sequence or len(api_sequence.strip()) == 0:
        return False
    
    # Check if contains reasonable number of API calls
    api_calls = api_sequence.split()
    if len(api_calls) < 5:  # Minimum threshold
        logger.warning(f"API sequence too short: {len(api_calls)} calls")
        return False
    
    if len(api_calls) > 100000:  # Maximum threshold
        logger.warning(f"API sequence too long: {len(api_calls)} calls")
        return False
    
    return True

class PerformanceMonitor:
    """Monitor prediction performance"""
    
    def __init__(self):
        self.predictions = []
        self.total_time = 0
        self.count = 0
    
    def record(self, duration: float):
        """Record prediction duration"""
        self.predictions.append(duration)
        self.total_time += duration
        self.count += 1
    
    def get_stats(self) -> dict:
        """Get performance statistics"""
        if self.count == 0:
            return {
                'total_predictions': 0,
                'average_time': 0,
                'min_time': 0,
                'max_time': 0
            }
        
        return {
            'total_predictions': self.count,
            'average_time': self.total_time / self.count,
            'min_time': min(self.predictions),
            'max_time': max(self.predictions)
        }

monitor = PerformanceMonitor()