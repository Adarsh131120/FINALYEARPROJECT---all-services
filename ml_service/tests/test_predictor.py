# ml-service/tests/test_predictor.py

import pytest
from app.predictor import MalwarePredictor

@pytest.fixture
def predictor():
    return MalwarePredictor(model_dir="../saved_models")

def test_predictor_initialization(predictor):
    assert predictor.model is not None
    assert predictor.tfidf is not None
    assert predictor.pca is not None
    assert predictor.label_encoder is not None

def test_prediction(predictor):
    # Sample API sequence
    api_sequence = "createfile writefile closehandle regsetvalueex createprocess"
    
    result = predictor.predict(api_sequence)
    
    assert result["success"] == True
    assert "malware_family" in result
    assert "confidence" in result
    assert result["confidence"] >= 0 and result["confidence"] <= 1

def test_empty_sequence(predictor):
    result = predictor.predict("")
    assert result["success"] == False
    assert "error" in result

def test_short_sequence(predictor):
    result = predictor.predict("createfile")
    # Should still predict but with lower confidence
    assert "malware_family" in result or "error" in result