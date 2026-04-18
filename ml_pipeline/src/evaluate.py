# src/evaluate.py

from sklearn.metrics import (
    accuracy_score, precision_recall_fscore_support,
    classification_report, confusion_matrix
)

import seaborn as sns
import matplotlib.pyplot as plt
import numpy as np


class ModelEvaluator:
    """Evaluate trained models"""
    
    def __init__(self, label_encoder):
        self.label_encoder = label_encoder
        
    def evaluate_model(self, model, X_test, y_test, model_name: str):
        """Comprehensive model evaluation"""
        
        # Predictions
        y_pred = model.predict(X_test)
        
        # Metrics
        accuracy = accuracy_score(y_test, y_pred)
        precision, recall, f1, _ = precision_recall_fscore_support(
            y_test, y_pred, average='weighted'
        )
        
        print(f"\n{'='*60}")
        print(f"[STATS] {model_name} Evaluation Results")
        print(f"{'='*60}")
        print(f"Accuracy:  {accuracy:.4f}")
        print(f"Precision: {precision:.4f}")
        print(f"Recall:    {recall:.4f}")
        print(f"F1-Score:  {f1:.4f}")
        
        # Detailed classification report
        print(f"\n[INFO] Detailed Classification Report:")
        print(classification_report(
            y_test, y_pred,
            target_names=self.label_encoder.classes_,
            digits=4
        ))
        
        # Confusion matrix
        self.plot_confusion_matrix(y_test, y_pred, model_name)
        
        return {
            'accuracy': accuracy,
            'precision': precision,
            'recall': recall,
            'f1_score': f1
        }
    
    def plot_confusion_matrix(self, y_true, y_pred, model_name: str):
        """Plot confusion matrix"""
        cm = confusion_matrix(y_true, y_pred)
        
        plt.figure(figsize=(12, 10))
        sns.heatmap(
            cm, annot=True, fmt='d', cmap='Blues',
            xticklabels=self.label_encoder.classes_,
            yticklabels=self.label_encoder.classes_
        )
        plt.title(f'Confusion Matrix - {model_name}')
        plt.ylabel('True Label')
        plt.xlabel('Predicted Label')
        plt.tight_layout()
        plt.savefig(f'models/evaluation/{model_name}_confusion_matrix.png', dpi=300)
        print(f"[OK] Confusion matrix saved")
        
    def compare_models(self, results: dict):
        """Compare multiple models"""
        import pandas as pd
        
        df = pd.DataFrame(results).T
        df = df.round(4)
        
        print("\n" + "="*80)
        print("[STATS] MODEL COMPARISON")
        print("="*80)
        print(df.to_string())
        
        # Plot comparison
        df.plot(kind='bar', figsize=(12, 6))
        plt.title('Model Performance Comparison')
        plt.ylabel('Score')
        plt.xticks(rotation=45)
        plt.legend(loc='lower right')
        plt.tight_layout()
        plt.savefig('models/evaluation/model_comparison.png', dpi=300)
        print("\n[OK] Comparison chart saved")

# Usage
if __name__ == "__main__":
    import joblib
    from train import MalwareModelTrainer
    
    # Load data
    trainer = MalwareModelTrainer()
    X_train, X_test, y_train, y_test = trainer.prepare_data('data/raw/malapi2019.csv')
    
    # Load trained models
    rf_model = joblib.load('saved_models/random_forest_model.pkl')
    xgb_model = joblib.load('saved_models/xgboost_model.pkl')
    label_encoder = joblib.load('saved_models/label_encoder.pkl')
    
    # Evaluate
    evaluator = ModelEvaluator(label_encoder)
    
    results = {}
    results['Random Forest'] = evaluator.evaluate_model(rf_model, X_test, y_test, 'Random Forest')
    results['XGBoost'] = evaluator.evaluate_model(xgb_model, X_test, y_test, 'XGBoost')
    
    # Compare
    evaluator.compare_models(results)