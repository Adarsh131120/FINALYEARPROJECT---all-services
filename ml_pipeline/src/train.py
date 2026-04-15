# src/train.py

from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import LabelEncoder
import xgboost as xgb
import joblib
import numpy as np
from preprocessing import MalwareDataPreprocessor
from feature_engineering import FeatureEngineer

class MalwareModelTrainer:
    """Train malware classification models"""
    
    def __init__(self):
        self.models = {}
        self.label_encoder = LabelEncoder()
        self.feature_engineer = None
        
    def prepare_data(self, csv_path: str, test_size: float = 0.2):
        """Load and prepare data"""
        
        # Load and preprocess
        preprocessor = MalwareDataPreprocessor(csv_path)
        preprocessor.load_data()
        preprocessor.clean_api_sequences()
        
        X, y = preprocessor.get_processed_data()
        
        # Encode labels
        y_encoded = self.label_encoder.fit_transform(y)
        
        # Train-test split
        X_train, X_test, y_train, y_test = train_test_split(
            X, y_encoded, 
            test_size=test_size, 
            stratify=y_encoded,
            random_state=42
        )
        
        print(f"\n✓ Data split:")
        print(f"  Train: {len(X_train)} samples")
        print(f"  Test: {len(X_test)} samples")
        
        # Feature engineering
        self.feature_engineer = FeatureEngineer(max_features=5000, pca_components=500)
        X_train_features, X_test_features = self.feature_engineer.fit_transform(X_train, X_test)
        
        return X_train_features, X_test_features, y_train, y_test
    
    def train_random_forest(self, X_train, y_train):
        """Train Random Forest model"""
        print("\n🌲 Training Random Forest...")
        
        rf_model = RandomForestClassifier(
            n_estimators=200,
            max_depth=30,
            min_samples_split=5,
            min_samples_leaf=2,
            class_weight='balanced',
            random_state=42,
            n_jobs=-1,
            verbose=1
        )
        
        rf_model.fit(X_train, y_train)
        
        self.models['random_forest'] = rf_model
        print("✓ Random Forest trained")
        
        return rf_model
    
    def train_xgboost(self, X_train, y_train):
        """Train XGBoost model"""
        print("\n🚀 Training XGBoost...")
        
        # Calculate scale_pos_weight for imbalanced data
        from collections import Counter
        class_counts = Counter(y_train)
        scale_pos_weight = sum(class_counts.values()) / (len(class_counts) * min(class_counts.values()))
        
        xgb_model = xgb.XGBClassifier(
            n_estimators=200,
            max_depth=10,
            learning_rate=0.1,
            subsample=0.8,
            colsample_bytree=0.8,
            gamma=0.1,
            reg_alpha=0.1,
            reg_lambda=1.0,
            scale_pos_weight=scale_pos_weight,
            random_state=42,
            n_jobs=-1,
            verbosity=1
        )
        
        xgb_model.fit(X_train, y_train)
        
        self.models['xgboost'] = xgb_model
        print("✓ XGBoost trained")
        
        return xgb_model
    
    def save_models(self, save_dir: str = 'saved_models/'):
        """Save all trained models"""
        import os
        os.makedirs(save_dir, exist_ok=True)
        
        # Save models
        for name, model in self.models.items():
            path = os.path.join(save_dir, f'{name}_model.pkl')
            joblib.dump(model, path)
            print(f"✓ Saved {name} to {path}")
        
        # Save label encoder
        joblib.dump(self.label_encoder, os.path.join(save_dir, 'label_encoder.pkl'))
        
        # Save feature transformers
        self.feature_engineer.save_transformers(
            os.path.join(save_dir, 'tfidf_vectorizer.pkl'),
            os.path.join(save_dir, 'pca_transformer.pkl')
        )

# Full training pipeline
if __name__ == "__main__":
    trainer = MalwareModelTrainer()
    
    # Prepare data
    X_train, X_test, y_train, y_test = trainer.prepare_data('data/raw/malapi2019.csv')
    
    # Train models
    trainer.train_random_forest(X_train, y_train)
    trainer.train_xgboost(X_train, y_train)
    
    # Save everything
    trainer.save_models()
    
    print("\n✅ Training complete!")