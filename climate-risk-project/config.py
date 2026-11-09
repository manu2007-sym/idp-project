import os

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'climate-risk-ap-secret-key-2026')
    SQLALCHEMY_DATABASE_URI = f"sqlite:///{os.path.join(BASE_DIR, 'database', 'climate.db')}"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Model parameters
    MODEL_PATH = os.path.join(BASE_DIR, 'ml', 'saved_model', 'climate_cnn_1d.pth')
    SCALER_PATH = os.path.join(BASE_DIR, 'ml', 'saved_model', 'scaler.json')
    
    # Climate Stress Index Weights
    WEIGHT_RAINFALL = 0.35
    WEIGHT_NDVI = 0.30
    WEIGHT_SOIL_MOISTURE = 0.20
    WEIGHT_TEMPERATURE = 0.15
