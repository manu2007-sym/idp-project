import os
import sys
import pandas as pd
from datetime import datetime

# Add root directory to path
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.append(BASE_DIR)

from database.models import db, District, ClimateData, Prediction, XAIExplanation
from flask import Flask

# 26 Andhra Pradesh Districts
AP_DISTRICTS_DATA = [
    {"id": 1, "name": "Srikakulam", "zone": "North Coastal", "lat": 18.2949, "lon": 83.8938, "hq": "Srikakulam"},
    {"id": 2, "name": "Parvathipuram Manyam", "zone": "North Coastal", "lat": 18.7738, "lon": 83.4264, "hq": "Parvathipuram"},
    {"id": 3, "name": "Vizianagaram", "zone": "North Coastal", "lat": 18.1067, "lon": 83.3956, "hq": "Vizianagaram"},
    {"id": 4, "name": "Visakhapatnam", "zone": "North Coastal", "lat": 17.6868, "lon": 83.2185, "hq": "Visakhapatnam"},
    {"id": 5, "name": "Alluri Sitharama Raju", "zone": "North Coastal", "lat": 18.0833, "lon": 82.6667, "hq": "Paderu"},
    {"id": 6, "name": "Anakapalli", "zone": "North Coastal", "lat": 17.6913, "lon": 83.0039, "hq": "Anakapalli"},
    {"id": 7, "name": "Kakinada", "zone": "Coastal Delta", "lat": 16.9891, "lon": 82.2475, "hq": "Kakinada"},
    {"id": 8, "name": "East Godavari", "zone": "Coastal Delta", "lat": 17.0005, "lon": 81.8040, "hq": "Rajahmundry"},
    {"id": 9, "name": "Dr. B.R. Ambedkar Konaseema", "zone": "Coastal Delta", "lat": 16.5787, "lon": 81.9961, "hq": "Amalapuram"},
    {"id": 10, "name": "Eluru", "zone": "Coastal Delta", "lat": 16.7107, "lon": 81.0952, "hq": "Eluru"},
    {"id": 11, "name": "West Godavari", "zone": "Coastal Delta", "lat": 16.5449, "lon": 81.5212, "hq": "Bhimavaram"},
    {"id": 12, "name": "Krishna", "zone": "Coastal Delta", "lat": 16.1876, "lon": 81.1389, "hq": "Machilipatnam"},
    {"id": 13, "name": "NTR", "zone": "Coastal Delta", "lat": 16.5062, "lon": 80.6480, "hq": "Vijayawada"},
    {"id": 14, "name": "Guntur", "zone": "Coastal Delta", "lat": 16.3067, "lon": 80.4365, "hq": "Guntur"},
    {"id": 15, "name": "Bapatla", "zone": "Coastal Delta", "lat": 15.9042, "lon": 80.4674, "hq": "Bapatla"},
    {"id": 16, "name": "Palnadu", "zone": "Coastal Delta", "lat": 16.2361, "lon": 80.0506, "hq": "Narasaraopet"},
    {"id": 17, "name": "Prakasam", "zone": "South Coastal", "lat": 15.5057, "lon": 80.0499, "hq": "Ongole"},
    {"id": 18, "name": "Sri Potti Sriramulu Nellore", "zone": "South Coastal", "lat": 14.4426, "lon": 79.9865, "hq": "Nellore"},
    {"id": 19, "name": "Kurnool", "zone": "Rayalaseema", "lat": 15.8281, "lon": 78.0373, "hq": "Kurnool"},
    {"id": 20, "name": "Nandyal", "zone": "Rayalaseema", "lat": 15.4886, "lon": 78.4836, "hq": "Nandyal"},
    {"id": 21, "name": "Ananthapuramu", "zone": "Rayalaseema", "lat": 14.6819, "lon": 77.6006, "hq": "Anantapur"},
    {"id": 22, "name": "Sri Sathya Sai", "zone": "Rayalaseema", "lat": 14.1683, "lon": 77.8118, "hq": "Puttaparthi"},
    {"id": 23, "name": "YSR Kadapa", "zone": "Rayalaseema", "lat": 14.4673, "lon": 78.8242, "hq": "Kadapa"},
    {"id": 24, "name": "Annamayya", "zone": "Rayalaseema", "lat": 14.0560, "lon": 78.7523, "hq": "Rayachoti"},
    {"id": 25, "name": "Tirupati", "zone": "Rayalaseema", "lat": 13.6288, "lon": 79.4192, "hq": "Tirupati"},
    {"id": 26, "name": "Chittoor", "zone": "Rayalaseema", "lat": 13.2172, "lon": 79.1003, "hq": "Chittoor"},
]

def calculate_csi(ndvi, rainfall, temperature, soil_moisture):
    r_stress = min(1.0, max(0.0, 1.0 - rainfall / 180.0))
    n_stress = min(1.0, max(0.0, 1.0 - (ndvi - 0.15) / 0.50))
    s_stress = min(1.0, max(0.0, 1.0 - (soil_moisture - 10.0) / 30.0))
    t_stress = min(1.0, max(0.0, (temperature - 26.0) / 16.0))
    
    csi = 0.35 * r_stress + 0.30 * n_stress + 0.20 * s_stress + 0.15 * t_stress
    csi = round(csi, 4)
    
    if csi >= 0.62:
        risk = 'HIGH'
    elif csi >= 0.38:
        risk = 'MEDIUM'
    else:
        risk = 'LOW'
        
    return csi, risk

def generate_climate_dataset():
    records = []
    for d in AP_DISTRICTS_DATA:
        zone = d['zone']
        for m in range(1, 13):
            # Base regional parameters
            is_summer = 3 <= m <= 5
            is_monsoon = 6 <= m <= 10
            is_ne_monsoon = 10 <= m <= 11

            base_rain = 45.0
            base_temp = 31.0
            base_ndvi = 0.38
            base_soil = 22.0

            if zone == 'Rayalaseema':
                base_temp += 2.8
                base_rain -= 18.0
                base_ndvi -= 0.12
                base_soil -= 8.0
            elif zone == 'Coastal Delta':
                base_temp -= 0.8
                base_rain += 15.0
                base_ndvi += 0.14
                base_soil += 12.0
            elif zone == 'North Coastal':
                base_rain += 22.0
                if d['name'] == 'Alluri Sitharama Raju':
                    base_temp -= 5.5
                    base_ndvi += 0.22
                    base_soil += 10.0

            if is_summer:
                temp = base_temp + (4.5 if m == 5 else 2.5)
                rain = max(5.0, base_rain * 0.25)
                ndvi = max(0.14, base_ndvi - 0.10)
                soil = max(9.0, base_soil - 9.0)
            elif is_monsoon:
                temp = base_temp - 2.2
                rain = base_rain * 2.4
                ndvi = min(0.78, base_ndvi + 0.18)
                soil = min(48.0, base_soil + 15.0)
            else:
                temp = base_temp - 4.5
                if is_ne_monsoon and ('Nellore' in d['name'] or 'Tirupati' in d['name']):
                    rain = 135.0
                    soil = 34.0
                    ndvi = 0.48
                else:
                    rain = max(8.0, base_rain * 0.4)
                    soil = max(14.0, base_soil - 3.0)
                    ndvi = max(0.24, base_ndvi - 0.03)

            # Deterministic pseudo-random variation
            seed = (d['id'] * 7 + m * 13) % 19
            rain = round(max(3.0, rain + (seed - 9) * 1.5), 1)
            temp = round(max(18.0, min(44.5, temp + ((seed % 5) - 2) * 0.4)), 1)
            ndvi = round(max(0.12, min(0.85, ndvi + ((seed % 7) - 3) * 0.015)), 2)
            soil = round(max(8.0, min(48.0, soil + ((seed % 6) - 2.5) * 0.8)), 1)

            csi, risk = calculate_csi(ndvi, rain, temp, soil)

            records.append({
                'district_id': d['id'],
                'district': d['name'],
                'zone': zone,
                'month': m,
                'year': 2026,
                'ndvi': ndvi,
                'rainfall': rain,
                'temperature': temp,
                'soil_moisture': soil,
                'climate_stress_index': csi,
                'risk': risk
            })

    df = pd.DataFrame(records)
    data_dir = os.path.join(BASE_DIR, 'data')
    os.makedirs(data_dir, exist_ok=True)
    csv_file = os.path.join(data_dir, 'climate_data.csv')
    df.to_csv(csv_file, index=False)
    print(f"Generated {len(records)} observations and saved to {csv_file}")
    return df

def init_database():
    app = Flask(__name__)
    from config import Config
    app.config.from_object(Config)
    db.init_app(app)

    with app.app_context():
        print("Creating SQLite database tables...")
        db.create_all()

        if District.query.count() == 0:
            print("Populating 26 Andhra Pradesh districts...")
            for d in AP_DISTRICTS_DATA:
                dist = District(
                    id=d['id'],
                    district_name=d['name'],
                    zone=d['zone'],
                    latitude=d['lat'],
                    longitude=d['lon'],
                    hq=d['hq']
                )
                db.session.add(dist)
            db.session.commit()

        df = generate_climate_dataset()

        if ClimateData.query.count() == 0:
            print("Populating climate observations...")
            for _, row in df.iterrows():
                clim = ClimateData(
                    district_id=int(row['district_id']),
                    month=int(row['month']),
                    year=int(row['year']),
                    ndvi=float(row['ndvi']),
                    rainfall=float(row['rainfall']),
                    temperature=float(row['temperature']),
                    soil_moisture=float(row['soil_moisture']),
                    climate_stress_index=float(row['climate_stress_index'])
                )
                db.session.add(clim)
            db.session.commit()
            print("Database initialized successfully.")

if __name__ == '__main__':
    init_database()
