from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class District(db.Model):
    __tablename__ = 'districts'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    district_name = db.Column(db.String(100), unique=True, nullable=False)
    zone = db.Column(db.String(50), nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    hq = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    climate_records = db.relationship('ClimateData', backref='district', cascade='all, delete-orphan', lazy=True)
    predictions = db.relationship('Prediction', backref='district', cascade='all, delete-orphan', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'district_name': self.district_name,
            'zone': self.zone,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'hq': self.hq,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class ClimateData(db.Model):
    __tablename__ = 'climate_data'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    district_id = db.Column(db.Integer, db.ForeignKey('districts.id', ondelete='CASCADE'), nullable=False)
    month = db.Column(db.Integer, nullable=False)
    year = db.Column(db.Integer, nullable=False)
    ndvi = db.Column(db.Float, nullable=False)
    rainfall = db.Column(db.Float, nullable=False)
    temperature = db.Column(db.Float, nullable=False)
    soil_moisture = db.Column(db.Float, nullable=False)
    climate_stress_index = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    predictions = db.relationship('Prediction', backref='climate_data', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'district_id': self.district_id,
            'district_name': self.district.district_name if self.district else None,
            'month': self.month,
            'year': self.year,
            'ndvi': self.ndvi,
            'rainfall': self.rainfall,
            'temperature': self.temperature,
            'soil_moisture': self.soil_moisture,
            'climate_stress_index': self.climate_stress_index,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Prediction(db.Model):
    __tablename__ = 'predictions'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    district_id = db.Column(db.Integer, db.ForeignKey('districts.id', ondelete='CASCADE'), nullable=False)
    climate_data_id = db.Column(db.Integer, db.ForeignKey('climate_data.id', ondelete='SET NULL'), nullable=True)
    predicted_risk = db.Column(db.String(20), nullable=False) # LOW, MEDIUM, HIGH
    low_probability = db.Column(db.Float, nullable=False)
    medium_probability = db.Column(db.Float, nullable=False)
    high_probability = db.Column(db.Float, nullable=False)
    confidence = db.Column(db.Float, nullable=False)
    prediction_date = db.Column(db.DateTime, default=datetime.utcnow)

    xai = db.relationship('XAIExplanation', backref='prediction', uselist=False, cascade='all, delete-orphan', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'district_id': self.district_id,
            'district_name': self.district.district_name if self.district else None,
            'climate_data_id': self.climate_data_id,
            'predicted_risk': self.predicted_risk,
            'low_probability': self.low_probability,
            'medium_probability': self.medium_probability,
            'high_probability': self.high_probability,
            'confidence': self.confidence,
            'prediction_date': self.prediction_date.isoformat() if self.prediction_date else None,
            'xai': self.xai.to_dict() if self.xai else None
        }

class XAIExplanation(db.Model):
    __tablename__ = 'xai_explanations'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    prediction_id = db.Column(db.Integer, db.ForeignKey('predictions.id', ondelete='CASCADE'), unique=True, nullable=False)
    ndvi_contribution = db.Column(db.Float, nullable=False)
    rainfall_contribution = db.Column(db.Float, nullable=False)
    temperature_contribution = db.Column(db.Float, nullable=False)
    soil_moisture_contribution = db.Column(db.Float, nullable=False)
    explanation = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'prediction_id': self.prediction_id,
            'ndvi_contribution': self.ndvi_contribution,
            'rainfall_contribution': self.rainfall_contribution,
            'temperature_contribution': self.temperature_contribution,
            'soil_moisture_contribution': self.soil_moisture_contribution,
            'explanation': self.explanation,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
