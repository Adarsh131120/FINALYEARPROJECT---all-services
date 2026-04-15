# src/preprocessing.py

import pandas as pd
import numpy as np
from typing import Tuple, List
import re

class MalwareDataPreprocessor:
    """Preprocess Mal-API-2019 dataset"""
    
    def __init__(self, filepath: str):
        self.filepath = filepath
        self.df = None
        
    def load_data(self) -> pd.DataFrame:
        """Load dataset"""
        self.df = pd.read_csv(self.filepath)
        print(f"✓ Loaded {len(self.df)} samples")
        print(f"✓ Columns: {self.df.columns.tolist()}")
        return self.df
    
    def clean_api_sequences(self, api_column: str = 'api_calls') -> pd.DataFrame:
        """Clean and normalize API call sequences"""
        
        def clean_sequence(seq):
            if pd.isna(seq):
                return ""
            
            # Convert to string
            seq = str(seq)
            
            # Split by common delimiters
            apis = re.split(r'[,\s]+', seq)
            
            # Clean each API
            cleaned = []
            for api in apis:
                api = api.strip().lower()
                
                # Remove A/W/Ex suffixes
                if api.endswith(('a', 'w')):
                    api = api[:-1]
                elif api.endswith('ex'):
                    api = api[:-2]
                
                if api:  # Skip empty
                    cleaned.append(api)
            
            return ' '.join(cleaned)
        
        self.df['cleaned_apis'] = self.df[api_column].apply(clean_sequence)
        
        # Remove empty sequences
        initial_count = len(self.df)
        self.df = self.df[self.df['cleaned_apis'].str.len() > 0]
        removed = initial_count - len(self.df)
        
        print(f"✓ Cleaned API sequences")
        print(f"✓ Removed {removed} empty sequences")
        
        return self.df
    
    def analyze_class_distribution(self, label_column: str = 'family'):
        """Analyze malware family distribution"""
        print("\n📊 Class Distribution:")
        print(self.df[label_column].value_counts())
        print(f"\nClass imbalance ratio: {self.df[label_column].value_counts().max() / self.df[label_column].value_counts().min():.2f}")
    
    def get_processed_data(self) -> Tuple[pd.Series, pd.Series]:
        """Get X (API sequences) and y (labels)"""
        return self.df['cleaned_apis'], self.df['family']

# Usage
if __name__ == "__main__":
    preprocessor = MalwareDataPreprocessor('data/raw/malapi2019.csv')
    df = preprocessor.load_data()
    df = preprocessor.clean_api_sequences()
    preprocessor.analyze_class_distribution()
    
    X, y = preprocessor.get_processed_data()
    print(f"\n✓ Ready for feature engineering")
    print(f"  Samples: {len(X)}")
    print(f"  Classes: {y.nunique()}")