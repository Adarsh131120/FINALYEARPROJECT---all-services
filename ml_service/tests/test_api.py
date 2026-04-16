# ml-service/tests/test_api.py

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert "status" in response.json()

def test_predict_endpoint():
    response = client.post(
        "/api/predict",
        json={"api_sequence": "createfile writefile regsetvalueex"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "success" in data

def test_models_endpoint():
    response = client.get("/api/models")
    assert response.status_code == 200
    data = response.json()
    assert "model_type" in data
    assert "classes" in data