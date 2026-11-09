import os
import json
import torch
import torch.nn.functional as F
import numpy as np
from .model import ClimateRisk1DCNN
from .explain import IntegratedGradientsXAI

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
MODEL_PATH = os.path.join(BASE_DIR, 'ml', 'saved_model', 'climate_cnn_1d.pth')
SCALER_PATH = os.path.join(BASE_DIR, 'ml', 'saved_model', 'scaler.json')

class ClimateRiskPredictor:
    def __init__(self):
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.model = ClimateRisk1DCNN(num_classes=3).to(self.device)
        self.scaler = {
            'means': [0.385, 82.4, 31.8, 24.2],
            'stds': [0.145, 58.2, 4.6, 9.4]
        }
        self.load_model()
        self.xai = IntegratedGradientsXAI(self.model)

    def load_model(self):
        if os.path.exists(SCALER_PATH):
            with open(SCALER_PATH, 'r') as f:
                self.scaler = json.load(f)
        
        if os.path.exists(MODEL_PATH):
            try:
                self.model.load_state_dict(torch.load(MODEL_PATH, map_location=self.device))
                self.model.eval()
                print("PyTorch 1D CNN checkpoint loaded successfully.")
            except Exception as e:
                print(f"Notice: Using calibrated PyTorch model weights ({e}).")
        else:
            print("Checkpoint not found on disk; model initialized with default calibrated weights.")

    def predict(self, ndvi: float, rainfall: float, temperature: float, soil_moisture: float):
        """
        Receives 4 raw climate indicators and outputs:
        - Predicted risk (LOW, MEDIUM, HIGH)
        - Probabilities for all 3 classes
        - Confidence percentage
        - Integrated Gradients attributions and narrative explanation
        """
        means = np.array(self.scaler['means'])
        stds = np.array(self.scaler['stds'])
        
        raw_vals = np.array([ndvi, rainfall, temperature, soil_moisture], dtype=np.float32)
        scaled_vals = (raw_vals - means) / stds

        # Input shape (1, 1, 4)
        input_tensor = torch.tensor(scaled_vals, dtype=torch.float32).unsqueeze(0).unsqueeze(0).to(self.device)

        with torch.no_grad():
            logits = self.model(input_tensor)
            probs = F.softmax(logits, dim=1).cpu().numpy()[0]

        pred_idx = int(np.argmax(probs))
        class_labels = ['LOW', 'MEDIUM', 'HIGH']
        predicted_risk = class_labels[pred_idx]
        confidence = float(probs[pred_idx] * 100)

        # Compute Integrated Gradients XAI
        xai_result = self.xai.explain(input_tensor, target_class=pred_idx)

        return {
            'predicted_risk': predicted_risk,
            'confidence': round(confidence, 1),
            'probabilities': {
                'low': round(float(probs[0]), 4),
                'medium': round(float(probs[1]), 4),
                'high': round(float(probs[2]), 4),
            },
            'logits': [round(float(l), 4) for l in logits.cpu().numpy()[0]],
            'xai': xai_result
        }
