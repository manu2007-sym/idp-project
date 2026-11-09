export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface District {
  id: number;
  district_name: string;
  zone: string;
  latitude: number;
  longitude: number;
  hq: string;
  created_at?: string;
}

export interface ClimateDataRecord {
  id: number;
  district_id: number;
  district_name?: string;
  month: number;
  year: number;
  ndvi: number;
  rainfall: number;
  temperature: number;
  soil_moisture: number;
  climate_stress_index: number;
  created_at?: string;
}

export interface PredictionRecord {
  id: number;
  district_id: number;
  district_name?: string;
  zone?: string;
  climate_data_id?: number | null;
  predicted_risk: RiskLevel;
  low_probability: number;
  medium_probability: number;
  high_probability: number;
  confidence: number;
  prediction_date: string;
  // Features used for prediction
  ndvi?: number;
  rainfall?: number;
  temperature?: number;
  soil_moisture?: number;
  climate_stress_index?: number;
  month?: number;
  year?: number;
  time_scope?: 'PAST' | 'PRESENT' | 'FUTURE';
  explanation?: string;
  xai?: XAIExplanationRecord;
}

export interface DistrictYearlyProjection {
  year: number;
  time_scope: 'PAST' | 'PRESENT' | 'FUTURE';
  ndvi: number;
  rainfall: number;
  temperature: number;
  soil_moisture: number;
  climate_stress_index: number;
  predicted_risk: RiskLevel;
  confidence: number;
  temperature_anomaly_c: number;
  rainfall_anomaly_pct: number;
}

export interface XAIExplanationRecord {
  id?: number;
  prediction_id: number;
  ndvi_contribution: number;
  rainfall_contribution: number;
  temperature_contribution: number;
  soil_moisture_contribution: number;
  explanation: string;
  created_at?: string;
}

export interface DashboardStats {
  total_districts: number;
  total_observations: number;
  climate_indicators_count: number;
  risk_categories_count: number;
  low_risk_count: number;
  medium_risk_count: number;
  high_risk_count: number;
  latest_prediction?: PredictionRecord | null;
  district_risks: Array<{
    district_id: number;
    district_name: string;
    zone: string;
    latest_risk: RiskLevel;
    confidence: number;
    ndvi: number;
    rainfall: number;
    temperature: number;
    soil_moisture: number;
    climate_stress_index: number;
  }>;
  monthly_averages: Array<{
    month: number;
    month_name: string;
    rainfall: number;
    ndvi: number;
    temperature: number;
    soil_moisture: number;
  }>;
}

export interface DistrictTelemetry {
  district_name: string;
  month: number;
  year: number;
  ndvi: number;
  rainfall: number;
  temperature: number;
  soil_moisture: number;
  station_code: string;
  sensor_source: string;
  vegetation_health_status: string;
  precipitation_condition: string;
  thermal_comfort: string;
  soil_condition: string;
  calculated_csi: number;
  baseline_risk: RiskLevel;
}
