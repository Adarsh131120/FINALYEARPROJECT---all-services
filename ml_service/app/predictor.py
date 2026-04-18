# ml-service/app/predictor.py

import joblib
import os
import numpy as np
from pathlib import Path
import logging

logger = logging.getLogger(__name__)


class MalwarePredictor:
    """Malware classification predictor"""

    def __init__(self, model_dir: str = "saved_models"):
        """Initialize predictor with trained models"""
        self.model_dir = Path(model_dir)
        self.models = {}
        self.tfidf_vectorizer = None
        self.pca_transformer = None
        self.label_encoder = None

        self.load_models()

    def load_models(self):
        """Load all trained models and transformers"""
        try:
            logger.info(f"Loading models from {self.model_dir}")

            # Load Random Forest
            rf_path = self.model_dir / "random_forest_model.pkl"
            if rf_path.exists():
                self.models['random_forest'] = joblib.load(rf_path)
                logger.info(f"Loaded Random Forest model ({rf_path.stat().st_size / 1024 / 1024:.2f} MB)")

            # Load XGBoost
            xgb_path = self.model_dir / "xgboost_model.pkl"
            if xgb_path.exists():
                self.models['xgboost'] = joblib.load(xgb_path)
                logger.info(f"Loaded XGBoost model ({xgb_path.stat().st_size / 1024 / 1024:.2f} MB)")

            # Load TF-IDF vectorizer
            tfidf_path = self.model_dir / "tfidf_vectorizer.pkl"
            if tfidf_path.exists():
                self.tfidf_vectorizer = joblib.load(tfidf_path)
                logger.info(f"Loaded TF-IDF vectorizer")

            # Load PCA transformer
            pca_path = self.model_dir / "pca_transformer.pkl"
            if pca_path.exists():
                self.pca_transformer = joblib.load(pca_path)
                logger.info(f"Loaded PCA transformer")

            # Load label encoder
            le_path = self.model_dir / "label_encoder.pkl"
            if le_path.exists():
                self.label_encoder = joblib.load(le_path)
                logger.info(f"Loaded label encoder: {self.label_encoder.classes_.tolist()}")

            if not self.models:
                raise ValueError("No models loaded!")

            logger.info(f"Successfully loaded {len(self.models)} models")

        except Exception as e:
            logger.error(f"Error loading models: {e}")
            raise

    def preprocess_api_sequence(self, api_sequence: str) -> str:
        """Clean and normalize API call sequence"""
        # Convert to lowercase
        api_sequence = api_sequence.lower()

        # Split by common delimiters
        apis = api_sequence.replace(',', ' ').split()

        # Remove A/W/Ex suffixes
        cleaned = []
        for api in apis:
            api = api.strip()
            if api.endswith(('a', 'w')):
                api = api[:-1]
            elif api.endswith('ex'):
                api = api[:-2]
            if api:
                cleaned.append(api)

        return ' '.join(cleaned)

    def extract_features(self, api_sequence: str):
        """Extract features from API sequence"""
        # Preprocess
        cleaned_seq = self.preprocess_api_sequence(api_sequence)

        # TF-IDF
        tfidf_features = self.tfidf_vectorizer.transform([cleaned_seq])

        # PCA
        pca_features = self.pca_transformer.transform(tfidf_features.toarray())

        return pca_features

    def predict(self, api_sequence: str, model_name: str = 'xgboost'):
        """Predict malware family"""
        try:
            # Check if model exists
            if model_name not in self.models:
                available = list(self.models.keys())
                raise ValueError(f"Model '{model_name}' not found. Available: {available}")

            # Extract features
            features = self.extract_features(api_sequence)

            # Get model
            model = self.models[model_name]

            # Predict
            prediction = model.predict(features)[0]
            probabilities = model.predict_proba(features)[0]

            # Decode label
            malware_family = self.label_encoder.inverse_transform([prediction])[0]

            # Get probability distribution
            prob_dict = {
                self.label_encoder.classes_[i]: float(prob)
                for i, prob in enumerate(probabilities)
            }

            # Get confidence
            confidence = float(probabilities[prediction])

            # Count API calls
            total_api_calls = len(api_sequence.split(','))
            unique_api_calls = len(set(api_sequence.split(',')))

            result = {
                'success': True,
                'malware_family': malware_family,
                'confidence': confidence,
                'probabilities': prob_dict,
                'model_used': model_name,
                'total_api_calls': total_api_calls,
                'unique_api_calls': unique_api_calls
            }

            logger.info(f"Prediction: {malware_family} (confidence: {confidence:.2f})")

            return result

        except Exception as e:
            logger.error(f"Prediction error: {e}")
            raise

    def predict_ensemble(self, api_sequence: str):
        """Predict using ensemble of all available models"""
        try:
            predictions = {}
            all_probabilities = []

            # Get predictions from all models
            for model_name in self.models.keys():
                result = self.predict(api_sequence, model_name)
                predictions[model_name] = result
                all_probabilities.append(list(result['probabilities'].values()))

            # Average probabilities
            avg_probs = np.mean(all_probabilities, axis=0)

            # Get final prediction
            final_pred_idx = np.argmax(avg_probs)
            final_family = self.label_encoder.classes_[final_pred_idx]
            final_confidence = float(avg_probs[final_pred_idx])

            result = {
                'malware_family': final_family,
                'confidence': final_confidence,
                'probabilities': {
                    self.label_encoder.classes_[i]: float(prob)
                    for i, prob in enumerate(avg_probs)
                },
                'model_used': 'ensemble',
                'individual_predictions': predictions,
                'total_api_calls': predictions[list(predictions.keys())[0]]['total_api_calls'],
                'unique_api_calls': predictions[list(predictions.keys())[0]]['unique_api_calls']
            }

            return result

        except Exception as e:
            logger.error(f"Ensemble prediction error: {e}")
            raise
