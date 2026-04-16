# ml-pipeline/README.md

# Malware Detection ML Pipeline

Train machine learning models on Mal-API-2019 dataset.

## Setup

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## Download Dataset

1. Download Mal-API-2019 from Kaggle
2. Place `malapi2019.csv` in `data/raw/`

## Train Models

```bash
python src/train.py
```

This will:
- Preprocess data
- Extract features (TF-IDF + PCA)
- Train Random Forest and XGBoost
- Evaluate models
- Save models to `saved_models/`

## Copy Models

```bash
cp -r saved_models/* ../ml-service/saved_models/
```

## Results

Models are saved in `saved_models/`:
- `random_forest_model.pkl`
- `xgboost_model.pkl`
- `tfidf_vectorizer.pkl`
- `pca_transformer.pkl`
- `label_encoder.pkl`

Evaluation metrics in `models/evaluation/`