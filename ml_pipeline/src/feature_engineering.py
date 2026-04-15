# src/feature_engineering.py

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import PCA
from sklearn.model_selection import train_test_split
import joblib
import numpy as np

class FeatureEngineer:
    """Transform API sequences into ML features"""
    
    def __init__(self, max_features: int = 5000, pca_components: int = 500):
        self.max_features = max_features
        self.pca_components = pca_components
        
        self.tfidf = TfidfVectorizer(
            max_features=max_features,
            ngram_range=(1, 2),  # Unigrams and bigrams
            min_df=2,
            max_df=0.95,
            sublinear_tf=True
        )
        
        self.pca = PCA(n_components=pca_components, random_state=42)
        
    def fit_transform(self, X_train, X_test=None):
        """Fit TF-IDF and PCA, transform data"""
        
        # TF-IDF
        print("🔄 Applying TF-IDF...")
        X_train_tfidf = self.tfidf.fit_transform(X_train)
        print(f"✓ TF-IDF shape: {X_train_tfidf.shape}")
        
        if X_test is not None:
            X_test_tfidf = self.tfidf.transform(X_test)
        else:
            X_test_tfidf = None
        
        # PCA
        print("🔄 Applying PCA...")
        X_train_pca = self.pca.fit_transform(X_train_tfidf.toarray())
        print(f"✓ PCA shape: {X_train_pca.shape}")
        print(f"✓ Explained variance: {self.pca.explained_variance_ratio_.sum():.4f}")
        
        if X_test_tfidf is not None:
            X_test_pca = self.pca.transform(X_test_tfidf.toarray())
            return X_train_pca, X_test_pca
        
        return X_train_pca
    
    def transform(self, X):
        """Transform new data using fitted transformers"""
        X_tfidf = self.tfidf.transform(X)
        X_pca = self.pca.transform(X_tfidf.toarray())
        return X_pca
    
    def save_transformers(self, tfidf_path: str, pca_path: str):
        """Save fitted transformers"""
        joblib.dump(self.tfidf, tfidf_path)
        joblib.dump(self.pca, pca_path)
        print(f"✓ Saved TF-IDF to {tfidf_path}")
        print(f"✓ Saved PCA to {pca_path}")
    
    @staticmethod
    def load_transformers(tfidf_path: str, pca_path: str):
        """Load saved transformers"""
        tfidf = joblib.load(tfidf_path)
        pca = joblib.load(pca_path)
        
        fe = FeatureEngineer()
        fe.tfidf = tfidf
        fe.pca = pca
        
        return fe