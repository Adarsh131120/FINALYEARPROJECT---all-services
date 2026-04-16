# ml-service/app/main.py (add caching)

from functools import lru_cache
import hashlib

class MalwarePredictor:
    def __init__(self):
        self.cache = {}
    
    def predict_with_cache(self, api_sequence: str):
        # Generate hash of API sequence
        seq_hash = hashlib.md5(api_sequence.encode()).hexdigest()
        
        # Check cache
        if seq_hash in self.cache:
            print(f"Cache hit for {seq_hash}")
            return self.cache[seq_hash]
        
        # Predict
        result = self.predict(api_sequence)
        
        # Cache result
        self.cache[seq_hash] = result
        
        return result