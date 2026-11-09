import os
import io
import csv
from datetime import datetime
from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
from config import Config
from database.models import db, District, ClimateData, Prediction, XAIExplanation
from ml.predict import ClimateRiskPredictor

app = Flask(__name__)
app.config.from_object(Config)
CORS(app)

db.init_app(app)

# Initialize ML Predictor
predictor = ClimateRiskPredictor()

def calculate_csi(ndvi, rainfall, temperature, soil_moisture):
    r_stress = min(1.0, max(0.0, 1.0 - rainfall / 180.0))
    n_stress = min(1.0, max(0.0, 1.0 - (ndvi - 0.15) / 0.50))
    s_stress = min(1.0, max(0.0, 1.0 - (soil_moisture - 10.0) / 30.0))
    t_stress = min(1.0, max(0.0, (temperature - 26.0) / 16.0))
    csi = 0.35 * r_stress + 0.30 * n_stress + 0.20 * s_stress + 0.15 * t_stress
    return round(csi, 4)

# ==================== REST APIS ====================

@app.route('/api/districts', methods=['GET'])
def get_districts():
    districts = District.query.order_by(District.id.asc()).all()
    return jsonify({
        'success': True,
        'count': len(districts),
        'data': [d.to_dict() for d in districts]
    })

@app.route('/api/district-telemetry/<name>', methods=['GET'])
def get_district_telemetry(name):
    # Auto-populate 4 features for the selected district
    dist = District.query.filter(District.district_name.ilike(name)).first()
    if not dist:
        dist = District.query.first()
        
    month = request.args.get('month', default=datetime.utcnow().month, type=int)
    year = request.args.get('year', default=2026, type=int)

    # Fetch latest observation or baseline
    latest_clim = ClimateData.query.filter_by(district_id=dist.id, month=month).first()
    if latest_clim:
        ndvi = latest_clim.ndvi
        rain = latest_clim.rainfall
        temp = latest_clim.temperature
        soil = latest_clim.soil_moisture
        csi = latest_clim.climate_stress_index
    else:
        ndvi, rain, temp, soil = 0.38, 75.0, 31.5, 22.0
        csi = calculate_csi(ndvi, rain, temp, soil)

    risk = 'HIGH' if csi >= 0.62 else 'MEDIUM' if csi >= 0.38 else 'LOW'

    return jsonify({
        'success': True,
        'data': {
            'district_name': dist.district_name,
            'zone': dist.zone,
            'month': month,
            'year': year,
            'ndvi': ndvi,
            'rainfall': rain,
            'temperature': temp,
            'soil_moisture': soil,
            'calculated_csi': csi,
            'baseline_risk': risk,
            'station_code': f"IMD-{dist.district_name[:4].upper()}-01",
            'sensor_source': "IMD AWS & ISRO Bhuvan / Sentinel-2 Satellites"
        }
    })

@app.route('/api/dashboard', methods=['GET'])
def get_dashboard():
    total_districts = District.query.count()
    total_obs = ClimateData.query.count()
    
    # Latest predictions for all districts
    subq = db.session.query(
        Prediction.district_id,
        db.func.max(Prediction.id).label('max_id')
    ).group_by(Prediction.district_id).subquery()

    latest_preds = db.session.query(Prediction).join(
        subq, Prediction.id == subq.c.max_id
    ).all()

    low_count = sum(1 for p in latest_preds if p.predicted_risk == 'LOW')
    med_count = sum(1 for p in latest_preds if p.predicted_risk == 'MEDIUM')
    high_count = sum(1 for p in latest_preds if p.predicted_risk == 'HIGH')

    latest_global = Prediction.query.order_by(Prediction.id.desc()).first()

    # Monthly averages
    monthly_data = db.session.query(
        ClimateData.month,
        db.func.avg(ClimateData.rainfall).label('rainfall'),
        db.func.avg(ClimateData.ndvi).label('ndvi'),
        db.func.avg(ClimateData.temperature).label('temperature'),
        db.func.avg(ClimateData.soil_moisture).label('soil_moisture')
    ).group_by(ClimateData.month).order_by(ClimateData.month.asc()).all()

    month_names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    monthly_averages = [{
        'month': m.month,
        'month_name': month_names[m.month - 1] if 1 <= m.month <= 12 else f"M{m.month}",
        'rainfall': round(float(m.rainfall), 1),
        'ndvi': round(float(m.ndvi), 2),
        'temperature': round(float(m.temperature), 1),
        'soil_moisture': round(float(m.soil_moisture), 1)
    } for m in monthly_data]

    return jsonify({
        'success': True,
        'data': {
            'total_districts': total_districts,
            'total_observations': total_obs,
            'climate_indicators_count': 4,
            'risk_categories_count': 3,
            'low_risk_count': low_count,
            'medium_risk_count': med_count,
            'high_risk_count': high_count,
            'latest_prediction': latest_global.to_dict() if latest_global else None,
            'monthly_averages': monthly_averages
        }
    })

@app.route('/api/predict', methods=['POST'])
def predict_risk():
    data = request.get_json() or {}
    district_id = data.get('district_id')
    ndvi = data.get('ndvi')
    rainfall = data.get('rainfall')
    temperature = data.get('temperature')
    soil_moisture = data.get('soil_moisture')
    month = data.get('month', 11)
    year = data.get('year', 2026)

    if not all([district_id, ndvi is not None, rainfall is not None, temperature is not None, soil_moisture is not None]):
        return jsonify({'success': False, 'error': 'Missing required climate features'}), 400

    dist = District.query.get(district_id)
    if not dist:
        return jsonify({'success': False, 'error': 'District not found'}), 404

    # Save climate data record
    csi = calculate_csi(float(ndvi), float(rainfall), float(temperature), float(soil_moisture))
    clim_record = ClimateData(
        district_id=int(district_id),
        month=int(month),
        year=int(year),
        ndvi=float(ndvi),
        rainfall=float(rainfall),
        temperature=float(temperature),
        soil_moisture=float(soil_moisture),
        climate_stress_index=csi
    )
    db.session.add(clim_record)
    db.session.flush()

    # Model inference
    ml_res = predictor.predict(float(ndvi), float(rainfall), float(temperature), float(soil_moisture))

    # Save prediction
    pred = Prediction(
        district_id=int(district_id),
        climate_data_id=clim_record.id,
        predicted_risk=ml_res['predicted_risk'],
        low_probability=ml_res['probabilities']['low'],
        medium_probability=ml_res['probabilities']['medium'],
        high_probability=ml_res['probabilities']['high'],
        confidence=ml_res['confidence']
    )
    db.session.add(pred)
    db.session.flush()

    # Save XAI Explanation
    xai_data = ml_res['xai']
    xai = XAIExplanation(
        prediction_id=pred.id,
        ndvi_contribution=xai_data['percentage_contributions']['ndvi'],
        rainfall_contribution=xai_data['percentage_contributions']['rainfall'],
        temperature_contribution=xai_data['percentage_contributions']['temperature'],
        soil_moisture_contribution=xai_data['percentage_contributions']['soil_moisture'],
        explanation=xai_data['explanation']
    )
    db.session.add(xai)
    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'Prediction and XAI explanation generated successfully',
        'data': {
            'id': pred.id,
            'district_name': dist.district_name,
            'predicted_risk': pred.predicted_risk,
            'confidence': pred.confidence,
            'probabilities': ml_res['probabilities'],
            'xai': xai.to_dict()
        }
    })

@app.route('/api/predictions', methods=['GET'])
def get_predictions():
    query = Prediction.query.join(District)
    search = request.args.get('search')
    risk = request.args.get('risk')
    district_id = request.args.get('district_id', type=int)

    if search:
        query = query.filter(District.district_name.ilike(f'%{search}%'))
    if risk:
        query = query.filter(Prediction.predicted_risk == risk)
    if district_id:
        query = query.filter(Prediction.district_id == district_id)

    predictions = query.order_by(Prediction.id.desc()).limit(100).all()
    return jsonify({
        'success': True,
        'count': len(predictions),
        'data': [p.to_dict() for p in predictions]
    })

@app.route('/api/predictions/<int:id>', methods=['DELETE'])
def delete_prediction(id):
    pred = Prediction.query.get(id)
    if not pred:
        return jsonify({'success': False, 'error': 'Prediction not found'}), 404
    db.session.delete(pred)
    db.session.commit()
    return jsonify({'success': True, 'message': f'Prediction #{id} deleted successfully'})

@app.route('/api/export/csv', methods=['GET'])
def export_csv():
    preds = Prediction.query.join(District).order_by(Prediction.id.desc()).all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        'Prediction_ID', 'District', 'Zone', 'Predicted_Risk', 'Confidence_Pct',
        'Low_Prob', 'Medium_Prob', 'High_Prob', 'Prediction_Date'
    ])
    for p in preds:
        writer.writerow([
            p.id, p.district.district_name, p.district.zone, p.predicted_risk,
            p.confidence, p.low_probability, p.medium_probability, p.high_probability,
            p.prediction_date
        ])
    output.seek(0)
    return send_file(
        io.BytesIO(output.getvalue().encode('utf-8')),
        mimetype='text/csv',
        as_attachment=True,
        download_name='andhra_pradesh_climate_predictions.csv'
    )

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    print("Starting Flask AP Climate Risk Monitoring Server...")
    app.run(host='0.0.0.0', port=5000, debug=True)
