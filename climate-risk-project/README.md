# Climate Risk Prediction for Andhra Pradesh Using 1D CNN with Explainable AI (XAI)

An end-to-end, full-stack climate monitoring and risk intelligence system developed for all **26 districts of Andhra Pradesh**, powered by a **PyTorch 1D Convolutional Neural Network (1D CNN)** and **Integrated Gradients (XAI)**.

---

## 📌 Project Overview
- **Objective:** Predict multi-category climate risk (`LOW`, `MEDIUM`, `HIGH`) for Andhra Pradesh districts using four key biophysical climate indicators:
  1. **NDVI (Normalized Difference Vegetation Index)** - Satellite vegetation canopy health.
  2. **Rainfall (mm)** - Monthly precipitation deficit or surplus.
  3. **Temperature (°C)** - Thermal and heatwave stress.
  4. **Soil Moisture (%)** - Root-zone volumetric water availability.
- **Explainable AI (XAI):** Integrated Gradients computes the exact path integral feature attributions, explaining *why* the CNN classified a district into a specific risk category.
- **Coverage:** All 26 reorganized Andhra Pradesh districts across 4 agro-ecological zones (North Coastal, Coastal Delta, South Coastal, Rayalaseema).
- **Auto-Telemetry Integration:** Selecting any district automatically pulls its latest sensor and satellite climate telemetry (NDVI, rainfall, temperature, soil moisture) without requiring manual data entry.

---

## 🚀 Quick Start & Installation

### 1. Prerequisites
- Python 3.9+ or Python 3.10+
- `pip` package manager

### 2. Setup Virtual Environment
```bash
# Clone or navigate to the project directory
cd climate-risk-project

# Create a virtual environment
python3 -m venv venv

# Activate virtual environment
# On Linux/macOS:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Initialize Database & Seed Baseline Data
```bash
python database/db_init.py
```
This initializes the SQLite database (`database/climate.db`) with:
- All 26 Andhra Pradesh districts with geographic coordinates and zones.
- 312 monthly climate records (12 months x 26 districts) and generates `data/climate_data.csv`.

### 5. Train the PyTorch 1D CNN Model (Optional - Pre-trained weights available)
```bash
python ml/train.py
```
- Trains for 400 epochs with Adam optimizer and Cross-Entropy Loss.
- Saves model weights to `ml/saved_model/climate_cnn_1d.pth` and scaler to `ml/saved_model/scaler.json`.

### 6. Run the Flask Web Application
```bash
python app.py
```
The server will start on:
👉 **http://127.0.0.1:5000**

---

## 🧠 Machine Learning Architecture (1D CNN)
```
Input: [Batch, 1, 4]  -> [NDVI, Rainfall, Temperature, Soil Moisture]
  │
  ├── Conv1D (in=1, out=16, kernel=2, pad=1) + BatchNorm1d + ReLU
  │
  ├── Conv1D (in=16, out=32, kernel=2, pad=1) + BatchNorm1d + ReLU
  │
  ├── AdaptiveAvgPool1d(1) -> Output shape: [Batch, 32]
  │
  ├── Dense / Linear (32 -> 16) + ReLU + Dropout(0.2)
  │
  └── Output Linear (16 -> 3) -> Logits for [LOW RISK, MEDIUM RISK, HIGH RISK]
        │
        └── Softmax -> Class Probabilities [P_Low, P_Med, P_High]
```

### Presentation Evaluation Benchmark Results
- **Reported Accuracy:** `72.41%` (21 out of 29 test predictions correct)
- **Class Metrics:**
  - **LOW Risk:** Precision = 88% | Recall = 78% | F1 = 82.7%
  - **MEDIUM Risk:** Precision = 67% | Recall = 60% | F1 = 63.3%
  - **HIGH Risk:** Precision = 67% | Recall = 80% | F1 = 72.9%

---

## 🔍 Explainable AI: Integrated Gradients
Integrated Gradients approximates the path integral along the straight line from a baseline $x_0$ to input $x$:
$$Attribution_i(x) = (x_i - x_0_i) \times \int_{0}^{1} \frac{\partial F_c(x_0 + \alpha(x - x_0))}{\partial x_i} d\alpha$$
- Evaluated over $M = 50$ Riemann steps with PyTorch autograd.
- **Important Disclaimer:** *Integrated Gradients explains how input features influence the model prediction. It does not prove physical causation.*

---

## 📊 Climate Stress Index (CSI) Formulation
$$CSI = (0.35 \times S_{\text{rainfall}}) + (0.30 \times S_{\text{ndvi}}) + (0.20 \times S_{\text{soil}}) + (0.15 \times S_{\text{temperature}})$$
- **LOW Risk:** $CSI < 0.38$
- **MEDIUM Risk:** $0.38 \le CSI < 0.62$
- **HIGH Risk:** $CSI \ge 0.62$

---

## 🗄️ Database Schema (SQLite & SQLAlchemy)
1. `districts`: 26 districts with geographic coordinates, zones, and headquarters.
2. `climate_data`: Monthly observations of NDVI, Rainfall, Temperature, Soil Moisture, and CSI.
3. `predictions`: Prediction records, predicted risk, probabilities, and confidence score.
4. `xai_explanations`: Integrated Gradients percentage attributions and narrative explanation.

---

## ⚠️ Prototype Disclaimer
*This system is a research prototype built for monitoring and academic risk demonstration. It is not an official warning or emergency notification tool issued by the Andhra Pradesh State Disaster Management Authority (APSDMA) or IMD.*
