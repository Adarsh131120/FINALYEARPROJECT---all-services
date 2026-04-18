# # src/train.py

# from sklearn.ensemble import RandomForestClassifier
# from sklearn.model_selection import train_test_split, cross_val_score
# from sklearn.preprocessing import LabelEncoder
# import xgboost as xgb
# import joblib
# import numpy as np
# from preprocessing import MalwareDataPreprocessor
# from feature_engineering import FeatureEngineer



# class MalwareModelTrainer:
#     """Train malware classification models"""
    
#     def __init__(self):
#         self.models = {}
#         self.label_encoder = LabelEncoder()
#         self.feature_engineer = None
        
#     def prepare_data(self, csv_path: str, test_size: float = 0.2):
#         """Load and prepare data"""
        
#         # Load and preprocess
#         preprocessor = MalwareDataPreprocessor(csv_path)
#         preprocessor.load_data()
#         preprocessor.clean_api_sequences()
        
#         X, y = preprocessor.get_processed_data()
        
#         # Encode labels
#         y_encoded = self.label_encoder.fit_transform(y)
        
#         # Train-test split
#         X_train, X_test, y_train, y_test = train_test_split(
#             X, y_encoded, 
#             test_size=test_size, 
#             stratify=y_encoded,
#             random_state=42
#         )
        
#         print(f"\n[OK] Data split:")
#         print(f"  Train: {len(X_train)} samples")
#         print(f"  Test: {len(X_test)} samples")
        
#         # Feature engineering
#         self.feature_engineer = FeatureEngineer(max_features=5000, pca_components=500)
#         X_train_features, X_test_features = self.feature_engineer.fit_transform(X_train, X_test)
        
#         return X_train_features, X_test_features, y_train, y_test
    
#     def train_random_forest(self, X_train, y_train):
#         """Train Random Forest model"""
#         print("\n[RF] Training Random Forest...")
        
#         rf_model = RandomForestClassifier(
#             n_estimators=200,
#             max_depth=30,
#             min_samples_split=5,
#             min_samples_leaf=2,
#             class_weight='balanced',
#             random_state=42,
#             n_jobs=-1,
#             verbose=1
#         )
        
#         rf_model.fit(X_train, y_train)
        
#         self.models['random_forest'] = rf_model
#         print("[OK] Random Forest trained")
        
#         return rf_model
    
#     def train_xgboost(self, X_train, y_train):
#         """Train XGBoost model"""
#         print("\n[XGB] Training XGBoost...")
        
#         # Calculate scale_pos_weight for imbalanced data
#         from collections import Counter
#         class_counts = Counter(y_train)
#         scale_pos_weight = sum(class_counts.values()) / (len(class_counts) * min(class_counts.values()))
        
#         xgb_model = xgb.XGBClassifier(
#             n_estimators=200,
#             max_depth=10,
#             learning_rate=0.1,
#             subsample=0.8,
#             colsample_bytree=0.8,
#             gamma=0.1,
#             reg_alpha=0.1,
#             reg_lambda=1.0,
#             scale_pos_weight=scale_pos_weight,
#             random_state=42,
#             n_jobs=-1,
#             verbosity=1
#         )
        
#         xgb_model.fit(X_train, y_train)
        
#         self.models['xgboost'] = xgb_model
#         print("[OK] XGBoost trained")
        
#         return xgb_model
    
#     def save_models(self, save_dir: str = 'saved_models/'):
#         """Save all trained models"""
#         import os
#         os.makedirs(save_dir, exist_ok=True)
        
#         # Save models
#         for name, model in self.models.items():
#             path = os.path.join(save_dir, f'{name}_model.pkl')
#             joblib.dump(model, path)
#             print(f"[OK] Saved {name} to {path}")
        
#         # Save label encoder
#         joblib.dump(self.label_encoder, os.path.join(save_dir, 'label_encoder.pkl'))
        
#         # Save feature transformers
#         self.feature_engineer.save_transformers(
#             os.path.join(save_dir, 'tfidf_vectorizer.pkl'),
#             os.path.join(save_dir, 'pca_transformer.pkl')
#         )

# # Full training pipeline
# if __name__ == "__main__":
#     trainer = MalwareModelTrainer()
    
#     # Prepare data
#     X_train, X_test, y_train, y_test = trainer.prepare_data('data/raw/malapi2019.csv')
    
#     # Train models
#     trainer.train_random_forest(X_train, y_train)
#     trainer.train_xgboost(X_train, y_train)
    
#     # Save everything
#     trainer.save_models()
    
#     print("\n[OK] Training complete!")

# ml-pipeline/src/train.py


import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import xgboost as xgb
import joblib
import os
import sys
from pathlib import Path

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

from src.preprocessing import MalwareDataPreprocessor
from src.feature_engineering import FeatureEngineer
from src.evaluate import ModelEvaluator

import warnings
warnings.filterwarnings('ignore')


class MalwareModelTrainer:
    """Train malware classification models"""
    
    def __init__(self):
        self.models = {}
        self.label_encoder = LabelEncoder()
        self.feature_engineer = None
        self.X_train = None
        self.X_test = None
        self.y_train = None
        self.y_test = None
        
    def prepare_data(self, csv_path: str, test_size: float = 0.2):
        """Load and prepare data"""
        
        print("\n" + "="*70)
        print("STEP 1: DATA LOADING AND PREPROCESSING")
        print("="*70)
        
        # Check if file exists
        if not os.path.exists(csv_path):
            print(f"\n[ERROR] ERROR: Dataset not found at {csv_path}")
            print("\n[INFO] Please download the Mal-API-2019 dataset:")
            print("   1. Go to: https://www.kaggle.com/datasets/catak/malapi2019")
            print("   2. Download malapi2019.csv")
            print(f"   3. Place it at: {csv_path}")
            print("\nOr use wget:")
            print(f"   mkdir -p {os.path.dirname(csv_path)}")
            print(f"   # Download and place malapi2019.csv there")
            sys.exit(1)
        
        # Load and preprocess
        preprocessor = MalwareDataPreprocessor(csv_path)
        df = preprocessor.load_data()
        df = preprocessor.clean_api_sequences()
        preprocessor.analyze_class_distribution()
        
        X, y = preprocessor.get_processed_data()
        
        # Encode labels
        print("\n[STATS] Encoding labels...")
        y_encoded = self.label_encoder.fit_transform(y)
        print(f"   Classes: {self.label_encoder.classes_.tolist()}")
        
        # Train-test split
        print("\n[SPLIT]  Splitting data...")
        self.X_train, self.X_test, self.y_train, self.y_test = train_test_split(
            X, y_encoded,
            test_size=test_size,
            stratify=y_encoded,
            random_state=42
        )
        
        print(f"   Train samples: {len(self.X_train)}")
        print(f"   Test samples:  {len(self.X_test)}")
        
        # Feature engineering
        print("\n" + "="*70)
        print("STEP 2: FEATURE ENGINEERING")
        print("="*70)
        
        self.feature_engineer = FeatureEngineer(
            max_features=5000,
            pca_components=500
        )
        
        X_train_features, X_test_features = self.feature_engineer.fit_transform(
            self.X_train,
            self.X_test
        )
        
        return X_train_features, X_test_features
    
    def train_random_forest(self, X_train, y_train):
        """Train Random Forest model"""
        
        print("\n" + "="*70)
        print("STEP 3: TRAINING RANDOM FOREST")
        print("="*70)
        
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
        
        print("\n[RF] Training Random Forest...")
        rf_model.fit(X_train, y_train)
        
        self.models['random_forest'] = rf_model
        print("[OK] Random Forest training complete")
        
        return rf_model
    
    def train_xgboost(self, X_train, y_train):
        """Train XGBoost model"""
        
        print("\n" + "="*70)
        print("STEP 4: TRAINING XGBOOST")
        print("="*70)
        
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
        
        print("\n[XGB] Training XGBoost...")
        xgb_model.fit(X_train, y_train)
        
        self.models['xgboost'] = xgb_model
        print("[OK] XGBoost training complete")
        
        return xgb_model
    
    def save_models(self, save_dir: str = 'saved_models/'):
        """Save all trained models"""
        
        print("\n" + "="*70)
        print("STEP 5: SAVING MODELS")
        print("="*70)
        
        os.makedirs(save_dir, exist_ok=True)
        
        # Save models
        for name, model in self.models.items():
            path = os.path.join(save_dir, f'{name}_model.pkl')
            joblib.dump(model, path)
            
            # Check file size
            size_mb = os.path.getsize(path) / (1024 * 1024)
            print(f"[OK] Saved {name:20s} ({size_mb:.2f} MB) -> {path}")
        
        # Save label encoder
        le_path = os.path.join(save_dir, 'label_encoder.pkl')
        joblib.dump(self.label_encoder, le_path)
        size_mb = os.path.getsize(le_path) / (1024 * 1024)
        print(f"[OK] Saved {'label_encoder':20s} ({size_mb:.2f} MB) -> {le_path}")
        
        # Save feature transformers
        tfidf_path = os.path.join(save_dir, 'tfidf_vectorizer.pkl')
        pca_path = os.path.join(save_dir, 'pca_transformer.pkl')
        
        self.feature_engineer.save_transformers(tfidf_path, pca_path)
        
        tfidf_size = os.path.getsize(tfidf_path) / (1024 * 1024)
        pca_size = os.path.getsize(pca_path) / (1024 * 1024)
        
        print(f"[OK] Saved {'tfidf_vectorizer':20s} ({tfidf_size:.2f} MB) -> {tfidf_path}")
        print(f"[OK] Saved {'pca_transformer':20s} ({pca_size:.2f} MB) -> {pca_path}")
        
        print("\n[INFO] All models saved successfully!")
        
        # Instructions
        print("\n" + "="*70)
        print("NEXT STEPS")
        print("="*70)
        print("\n1[INFO]  Copy models to ML service:")
        print(f"   cp -r {save_dir}* ../ml-service/saved_models/")
        print("\n2[INFO]  Verify models are not empty:")
        print(f"   ls -lh {save_dir}")
        print("\n3[INFO]  Start ML service:")
        print("   cd ../ml-service")
        print("   uvicorn app.main:app --reload --port 8000")


def main():
    """Main training pipeline"""
    
    print("\n" + "="*70)
    print(" "*15 + "MALWARE DETECTION MODEL TRAINING")
    print("="*70)
    
    # Initialize trainer
    trainer = MalwareModelTrainer()
    
    # Dataset path
    dataset_path = 'data/raw/malapi2019.csv'
    
    try:
        # Prepare data
        X_train, X_test = trainer.prepare_data(dataset_path)
        
        # Train models
        trainer.train_random_forest(X_train, trainer.y_train)
        trainer.train_xgboost(X_train, trainer.y_train)
        
        # Evaluate models
        print("\n" + "="*70)
        print("STEP 6: MODEL EVALUATION")
        print("="*70)
        
        evaluator = ModelEvaluator(trainer.label_encoder)
        
        results = {}
        for name, model in trainer.models.items():
            print(f"\n[STATS] Evaluating {name.upper()}...")
            results[name] = evaluator.evaluate_model(
                model, X_test, trainer.y_test, name.replace('_', ' ').title()
            )
        
        # Compare models
        evaluator.compare_models(results)
        
        # Save models
        trainer.save_models()
        
        print("\n" + "="*70)
        print("[OK] TRAINING PIPELINE COMPLETE!")
        print("="*70 + "\n")
        
    except FileNotFoundError as e:
        print(f"\n[ERROR] Error: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"\n[ERROR] Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()