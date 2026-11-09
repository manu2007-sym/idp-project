import express, { Request, Response } from 'express';
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { AP_DISTRICTS, calculateClimateStressIndex, getDistrictTelemetry, getDistrictMultiYearProjections } from './src/data/districts.ts';
import { predictClimateRisk, REPORTED_MODEL_METRICS } from './src/ml/engine.ts';
import { RiskLevel } from './src/types/climate.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize SQLite database
const dbDir = path.join(__dirname, 'database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}
const dbPath = path.join(dbDir, 'climate.db');
const db = new DatabaseSync(dbPath);

// Enable foreign keys
db.exec('PRAGMA foreign_keys = ON;');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS districts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    district_name TEXT UNIQUE NOT NULL,
    zone TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    hq TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS climate_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    district_id INTEGER NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    ndvi REAL NOT NULL,
    rainfall REAL NOT NULL,
    temperature REAL NOT NULL,
    soil_moisture REAL NOT NULL,
    climate_stress_index REAL NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS predictions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    district_id INTEGER NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
    climate_data_id INTEGER REFERENCES climate_data(id) ON DELETE SET NULL,
    predicted_risk TEXT NOT NULL,
    low_probability REAL NOT NULL,
    medium_probability REAL NOT NULL,
    high_probability REAL NOT NULL,
    confidence REAL NOT NULL,
    prediction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS xai_explanations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    prediction_id INTEGER NOT NULL UNIQUE REFERENCES predictions(id) ON DELETE CASCADE,
    ndvi_contribution REAL NOT NULL,
    rainfall_contribution REAL NOT NULL,
    temperature_contribution REAL NOT NULL,
    soil_moisture_contribution REAL NOT NULL,
    explanation TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`);

// Database Seeder
function seedDatabase() {
  const countRow = db.prepare('SELECT COUNT(*) as count FROM districts').get() as { count: number };
  if (countRow.count === 0) {
    console.log('Seeding all 26 Andhra Pradesh districts and monthly climate records...');
    const insertDistrict = db.prepare(`
      INSERT INTO districts (id, district_name, zone, latitude, longitude, hq)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    for (const d of AP_DISTRICTS) {
      insertDistrict.run(d.id, d.district_name, d.zone, d.latitude, d.longitude, d.hq);
    }

    // Seed 12 months for 26 districts (312 observations)
    const insertClimate = db.prepare(`
      INSERT INTO climate_data (district_id, month, year, ndvi, rainfall, temperature, soil_moisture, climate_stress_index)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertPrediction = db.prepare(`
      INSERT INTO predictions (district_id, climate_data_id, predicted_risk, low_probability, medium_probability, high_probability, confidence, prediction_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertXAI = db.prepare(`
      INSERT INTO xai_explanations (prediction_id, ndvi_contribution, rainfall_contribution, temperature_contribution, soil_moisture_contribution, explanation)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    for (const d of AP_DISTRICTS) {
      for (let m = 1; m <= 12; m++) {
        const telemetry = getDistrictTelemetry(d.district_name, m, 2026);
        const { csi } = calculateClimateStressIndex(
          telemetry.ndvi,
          telemetry.rainfall,
          telemetry.temperature,
          telemetry.soil_moisture
        );

        const climRes = insertClimate.run(
          d.id,
          m,
          2026,
          telemetry.ndvi,
          telemetry.rainfall,
          telemetry.temperature,
          telemetry.soil_moisture,
          csi
        );

        // Pre-seed a baseline prediction for the current month
        if (m === 11) { // November
          const predResult = predictClimateRisk(
            telemetry.ndvi,
            telemetry.rainfall,
            telemetry.temperature,
            telemetry.soil_moisture
          );

          const predRes = insertPrediction.run(
            d.id,
            Number(climRes.lastInsertRowid),
            predResult.predictedRisk,
            predResult.lowProbability,
            predResult.mediumProbability,
            predResult.highProbability,
            predResult.confidence,
            new Date().toISOString()
          );

          const predId = Number(predRes.lastInsertRowid);
          insertXAI.run(
            predId,
            predResult.xai.ndvi_contribution,
            predResult.xai.rainfall_contribution,
            predResult.xai.temperature_contribution,
            predResult.xai.soil_moisture_contribution,
            predResult.xai.explanation
          );
        }
      }
    }
    console.log('Database seeded successfully with 26 districts, 312 climate records, and initial predictions.');
  }
}

seedDatabase();

// ==================== REST API ENDPOINTS ====================

// GET /api/districts - List all 26 districts
app.get('/api/districts', (_req: Request, res: Response) => {
  try {
    const districts = db.prepare('SELECT * FROM districts ORDER BY id ASC').all();
    res.json({ success: true, count: districts.length, data: districts });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/district-telemetry/:district_name - Auto-populate climate indicators
// User requirement: "just manm only oka city or oka state select chesukunte e four features manaki ravali ante a city ki entha unayi ani avii manam evakudadhu"
app.get('/api/district-telemetry/:name', (req: Request, res: Response) => {
  try {
    const districtName = decodeURIComponent(req.params.name);
    const month = req.query.month ? Number(req.query.month) : (new Date().getMonth() + 1);
    const year = req.query.year ? Number(req.query.year) : 2026;

    const telemetry = getDistrictTelemetry(districtName, month, year);
    res.json({ success: true, data: telemetry });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/dashboard - Dashboard statistics & live metrics from SQLite
app.get('/api/dashboard', (_req: Request, res: Response) => {
  try {
    const totalDistricts = (db.prepare('SELECT COUNT(*) as c FROM districts').get() as any).c;
    const totalObs = (db.prepare('SELECT COUNT(*) as c FROM climate_data').get() as any).c;
    
    // Risk distribution from latest prediction for each district
    const latestDistrictPreds = db.prepare(`
      SELECT p.*, d.district_name, d.zone, cd.ndvi, cd.rainfall, cd.temperature, cd.soil_moisture, cd.climate_stress_index
      FROM predictions p
      JOIN districts d ON p.district_id = d.id
      LEFT JOIN climate_data cd ON p.climate_data_id = cd.id
      WHERE p.id IN (
        SELECT MAX(id) FROM predictions GROUP BY district_id
      )
      ORDER BY d.id ASC
    `).all() as any[];

    let lowCount = 0;
    let medCount = 0;
    let highCount = 0;

    for (const p of latestDistrictPreds) {
      if (p.predicted_risk === 'LOW') lowCount++;
      else if (p.predicted_risk === 'MEDIUM') medCount++;
      else if (p.predicted_risk === 'HIGH') highCount++;
    }

    // Overall latest prediction across all records
    const latestGlobalPred = db.prepare(`
      SELECT p.*, d.district_name, d.zone, cd.ndvi, cd.rainfall, cd.temperature, cd.soil_moisture, cd.climate_stress_index, cd.month, cd.year,
             x.ndvi_contribution, x.rainfall_contribution, x.temperature_contribution, x.soil_moisture_contribution, x.explanation
      FROM predictions p
      JOIN districts d ON p.district_id = d.id
      LEFT JOIN climate_data cd ON p.climate_data_id = cd.id
      LEFT JOIN xai_explanations x ON p.id = x.prediction_id
      ORDER BY p.id DESC
      LIMIT 1
    `).get();

    // Monthly averages from climate_data
    const monthlyAverages = db.prepare(`
      SELECT 
        month,
        AVG(rainfall) as rainfall,
        AVG(ndvi) as ndvi,
        AVG(temperature) as temperature,
        AVG(soil_moisture) as soil_moisture
      FROM climate_data
      GROUP BY month
      ORDER BY month ASC
    `).all() as any[];

    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    const formattedMonthly = monthlyAverages.map((m: any) => ({
      month: m.month,
      month_name: monthNames[m.month - 1] || `M${m.month}`,
      rainfall: Number(m.rainfall.toFixed(1)),
      ndvi: Number(m.ndvi.toFixed(2)),
      temperature: Number(m.temperature.toFixed(1)),
      soil_moisture: Number(m.soil_moisture.toFixed(1))
    }));

    res.json({
      success: true,
      data: {
        total_districts: totalDistricts,
        total_observations: totalObs,
        climate_indicators_count: 4,
        risk_categories_count: 3,
        low_risk_count: lowCount,
        medium_risk_count: medCount,
        high_risk_count: highCount,
        latest_prediction: latestGlobalPred || null,
        district_risks: latestDistrictPreds,
        monthly_averages: formattedMonthly,
        model_metrics: REPORTED_MODEL_METRICS
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/climate-data - List climate observations
app.get('/api/climate-data', (req: Request, res: Response) => {
  try {
    const { district_id, month, year, limit = 100 } = req.query;
    let query = `
      SELECT cd.*, d.district_name, d.zone 
      FROM climate_data cd
      JOIN districts d ON cd.district_id = d.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (district_id) {
      query += ` AND cd.district_id = ?`;
      params.push(Number(district_id));
    }
    if (month) {
      query += ` AND cd.month = ?`;
      params.push(Number(month));
    }
    if (year) {
      query += ` AND cd.year = ?`;
      params.push(Number(year));
    }

    query += ` ORDER BY cd.year DESC, cd.month DESC, d.district_name ASC LIMIT ?`;
    params.push(Number(limit));

    const records = db.prepare(query).all(...params);
    res.json({ success: true, count: records.length, data: records });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/climate-data - Insert climate data
app.post('/api/climate-data', (req: Request, res: Response) => {
  try {
    const { district_id, month, year, ndvi, rainfall, temperature, soil_moisture } = req.body;

    if (!district_id || month == null || year == null || ndvi == null || rainfall == null || temperature == null || soil_moisture == null) {
      return res.status(400).json({ success: false, error: 'All fields (district_id, month, year, ndvi, rainfall, temperature, soil_moisture) are required.' });
    }

    // Validation
    const n = Number(ndvi);
    const r = Number(rainfall);
    const t = Number(temperature);
    const s = Number(soil_moisture);

    if (n < -1 || n > 1) return res.status(400).json({ success: false, error: 'NDVI must be between -1.0 and +1.0' });
    if (r < 0 || r > 1000) return res.status(400).json({ success: false, error: 'Rainfall must be between 0 and 1000 mm' });
    if (t < -10 || t > 60) return res.status(400).json({ success: false, error: 'Temperature must be between -10°C and 60°C' });
    if (s < 0 || s > 100) return res.status(400).json({ success: false, error: 'Soil moisture must be between 0% and 100%' });

    const { csi } = calculateClimateStressIndex(n, r, t, s);

    const stmt = db.prepare(`
      INSERT INTO climate_data (district_id, month, year, ndvi, rainfall, temperature, soil_moisture, climate_stress_index)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(district_id, month, year, n, r, t, s, csi);

    res.json({
      success: true,
      message: 'Climate observation saved successfully.',
      data: { id: Number(result.lastInsertRowid), district_id, month, year, ndvi: n, rainfall: r, temperature: t, soil_moisture: s, climate_stress_index: csi }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/climate-data/:id - Update climate observation
app.put('/api/climate-data/:id', (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { ndvi, rainfall, temperature, soil_moisture, month, year } = req.body;

    const existing = db.prepare('SELECT * FROM climate_data WHERE id = ?').get(id) as any;
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Climate data record not found.' });
    }

    const n = ndvi != null ? Number(ndvi) : existing.ndvi;
    const r = rainfall != null ? Number(rainfall) : existing.rainfall;
    const t = temperature != null ? Number(temperature) : existing.temperature;
    const s = soil_moisture != null ? Number(soil_moisture) : existing.soil_moisture;
    const m = month != null ? Number(month) : existing.month;
    const y = year != null ? Number(year) : existing.year;

    const { csi } = calculateClimateStressIndex(n, r, t, s);

    db.prepare(`
      UPDATE climate_data
      SET ndvi = ?, rainfall = ?, temperature = ?, soil_moisture = ?, month = ?, year = ?, climate_stress_index = ?
      WHERE id = ?
    `).run(n, r, t, s, m, y, csi, id);

    res.json({ success: true, message: 'Record updated successfully.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/predict - 1D CNN Risk Prediction + Integrated Gradients
app.post('/api/predict', (req: Request, res: Response) => {
  try {
    const { district_id, month = 11, year = 2026, ndvi, rainfall, temperature, soil_moisture } = req.body;

    if (!district_id || ndvi == null || rainfall == null || temperature == null || soil_moisture == null) {
      return res.status(400).json({ success: false, error: 'district_id, ndvi, rainfall, temperature, and soil_moisture are required.' });
    }

    const dist = db.prepare('SELECT * FROM districts WHERE id = ?').get(Number(district_id)) as any;
    if (!dist) {
      return res.status(404).json({ success: false, error: 'District not found.' });
    }

    const n = Number(ndvi);
    const r = Number(rainfall);
    const t = Number(temperature);
    const s = Number(soil_moisture);

    // Save climate data record
    const { csi } = calculateClimateStressIndex(n, r, t, s);
    const insertClim = db.prepare(`
      INSERT INTO climate_data (district_id, month, year, ndvi, rainfall, temperature, soil_moisture, climate_stress_index)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(Number(district_id), Number(month), Number(year), n, r, t, s, csi);
    const climateDataId = Number(insertClim.lastInsertRowid);

    // Run 1D CNN & Integrated Gradients
    const predictionResult = predictClimateRisk(n, r, t, s);

    // Save Prediction in SQLite
    const insertPred = db.prepare(`
      INSERT INTO predictions (district_id, climate_data_id, predicted_risk, low_probability, medium_probability, high_probability, confidence, prediction_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      Number(district_id),
      climateDataId,
      predictionResult.predictedRisk,
      predictionResult.lowProbability,
      predictionResult.mediumProbability,
      predictionResult.highProbability,
      predictionResult.confidence,
      new Date().toISOString()
    );
    const predictionId = Number(insertPred.lastInsertRowid);

    // Save XAI Explanation in SQLite
    db.prepare(`
      INSERT INTO xai_explanations (prediction_id, ndvi_contribution, rainfall_contribution, temperature_contribution, soil_moisture_contribution, explanation)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      predictionId,
      predictionResult.xai.ndvi_contribution,
      predictionResult.xai.rainfall_contribution,
      predictionResult.xai.temperature_contribution,
      predictionResult.xai.soil_moisture_contribution,
      predictionResult.xai.explanation
    );

    res.json({
      success: true,
      message: 'Risk predicted and saved successfully.',
      data: {
        id: predictionId,
        district_id: Number(district_id),
        district_name: dist.district_name,
        zone: dist.zone,
        month: Number(month),
        year: Number(year),
        ndvi: n,
        rainfall: r,
        temperature: t,
        soil_moisture: s,
        climate_stress_index: csi,
        predicted_risk: predictionResult.predictedRisk,
        confidence: predictionResult.confidence,
        low_probability: predictionResult.lowProbability,
        medium_probability: predictionResult.mediumProbability,
        high_probability: predictionResult.highProbability,
        logits: predictionResult.logits,
        xai: {
          ...predictionResult.xai,
          prediction_id: predictionId
        }
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/projections/:district_name - Multi-year (Past 2022-2025, Present 2026, Future 5-Year 2027-2031)
app.get('/api/projections/:district_name', (req: Request, res: Response) => {
  try {
    const districtName = decodeURIComponent(req.params.district_name);
    const projections = getDistrictMultiYearProjections(districtName);
    res.json({ success: true, district_name: districtName, data: projections });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/generate-5year-projection - Generate & save 5-year future predictions (2027-2031) to SQLite
app.post('/api/generate-5year-projection', (req: Request, res: Response) => {
  try {
    const { district_id } = req.body;
    const dist = db.prepare('SELECT * FROM districts WHERE id = ?').get(Number(district_id)) as any;
    if (!dist) {
      return res.status(404).json({ success: false, error: 'District not found.' });
    }

    const multiYear = getDistrictMultiYearProjections(dist.district_name);
    const futureYears = multiYear.filter(y => y.time_scope === 'FUTURE');

    const insertClimate = db.prepare(`
      INSERT INTO climate_data (district_id, month, year, ndvi, rainfall, temperature, soil_moisture, climate_stress_index)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertPred = db.prepare(`
      INSERT INTO predictions (district_id, climate_data_id, predicted_risk, low_probability, medium_probability, high_probability, confidence, prediction_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertXAI = db.prepare(`
      INSERT INTO xai_explanations (prediction_id, ndvi_contribution, rainfall_contribution, temperature_contribution, soil_moisture_contribution, explanation)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const savedRecords: any[] = [];

    for (const fy of futureYears) {
      // Save climate data for future year
      const climRes = insertClimate.run(
        dist.id,
        11,
        fy.year,
        fy.ndvi,
        fy.rainfall,
        fy.temperature,
        fy.soil_moisture,
        fy.climate_stress_index
      );
      const climId = Number(climRes.lastInsertRowid);

      // Run 1D CNN + XAI inference for the future year
      const predRes = predictClimateRisk(fy.ndvi, fy.rainfall, fy.temperature, fy.soil_moisture);

      const dbPredRes = insertPred.run(
        dist.id,
        climId,
        predRes.predictedRisk,
        predRes.lowProbability,
        predRes.mediumProbability,
        predRes.highProbability,
        predRes.confidence,
        new Date().toISOString()
      );
      const predId = Number(dbPredRes.lastInsertRowid);

      insertXAI.run(
        predId,
        predRes.xai.ndvi_contribution,
        predRes.xai.rainfall_contribution,
        predRes.xai.temperature_contribution,
        predRes.xai.soil_moisture_contribution,
        predRes.xai.explanation
      );

      savedRecords.push({
        id: predId,
        year: fy.year,
        time_scope: 'FUTURE',
        predicted_risk: predRes.predictedRisk,
        confidence: predRes.confidence,
        ndvi: fy.ndvi,
        rainfall: fy.rainfall,
        temperature: fy.temperature,
        soil_moisture: fy.soil_moisture
      });
    }

    res.json({
      success: true,
      message: `Generated 5-year future climate predictions for ${dist.district_name} (2027 - 2031)`,
      count: savedRecords.length,
      data: savedRecords
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/predictions - Retrieve prediction history with time_scope, filter, and search
app.get('/api/predictions', (req: Request, res: Response) => {
  try {
    const { district_id, risk, month, year, time_scope, search, limit = 150 } = req.query;

    let query = `
      SELECT p.*, d.district_name, d.zone, cd.ndvi, cd.rainfall, cd.temperature, cd.soil_moisture, cd.climate_stress_index, cd.month, cd.year,
             x.ndvi_contribution, x.rainfall_contribution, x.temperature_contribution, x.soil_moisture_contribution, x.explanation
      FROM predictions p
      JOIN districts d ON p.district_id = d.id
      LEFT JOIN climate_data cd ON p.climate_data_id = cd.id
      LEFT JOIN xai_explanations x ON p.id = x.prediction_id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (district_id) {
      query += ` AND p.district_id = ?`;
      params.push(Number(district_id));
    }
    if (risk) {
      query += ` AND p.predicted_risk = ?`;
      params.push(risk);
    }
    if (month) {
      query += ` AND cd.month = ?`;
      params.push(Number(month));
    }
    if (year) {
      query += ` AND cd.year = ?`;
      params.push(Number(year));
    }
    if (time_scope) {
      if (time_scope === 'PAST') {
        query += ` AND cd.year < 2026`;
      } else if (time_scope === 'PRESENT') {
        query += ` AND cd.year = 2026`;
      } else if (time_scope === 'FUTURE') {
        query += ` AND cd.year > 2026`;
      }
    }
    if (search) {
      query += ` AND d.district_name LIKE ?`;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY cd.year DESC, p.id DESC LIMIT ?`;
    params.push(Number(limit));

    const records = db.prepare(query).all(...params) as any[];

    // Annotate time_scope for each record
    const annotated = records.map((r: any) => {
      const y = r.year || 2026;
      let scope: 'PAST' | 'PRESENT' | 'FUTURE' = 'PRESENT';
      if (y < 2026) scope = 'PAST';
      else if (y > 2026) scope = 'FUTURE';
      return {
        ...r,
        time_scope: scope
      };
    });

    res.json({ success: true, count: annotated.length, data: annotated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/predictions/:id - Get single prediction
app.get('/api/predictions/:id', (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const record = db.prepare(`
      SELECT p.*, d.district_name, d.zone, cd.ndvi, cd.rainfall, cd.temperature, cd.soil_moisture, cd.climate_stress_index, cd.month, cd.year,
             x.ndvi_contribution, x.rainfall_contribution, x.temperature_contribution, x.soil_moisture_contribution, x.explanation
      FROM predictions p
      JOIN districts d ON p.district_id = d.id
      LEFT JOIN climate_data cd ON p.climate_data_id = cd.id
      LEFT JOIN xai_explanations x ON p.id = x.prediction_id
      WHERE p.id = ?
    `).get(id);

    if (!record) {
      return res.status(404).json({ success: false, error: 'Prediction not found.' });
    }
    res.json({ success: true, data: record });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/predictions/:id - Delete prediction with foreign key cascade
app.delete('/api/predictions/:id', (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const existing = db.prepare('SELECT id FROM predictions WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Prediction record not found.' });
    }

    db.prepare('DELETE FROM predictions WHERE id = ?').run(id);
    res.json({ success: true, message: `Prediction #${id} deleted successfully.` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/xai/:prediction_id - Explainable AI attribution
app.get('/api/xai/:prediction_id', (req: Request, res: Response) => {
  try {
    const predId = Number(req.params.prediction_id);
    const xai = db.prepare(`
      SELECT x.*, p.predicted_risk, p.confidence, d.district_name, cd.ndvi, cd.rainfall, cd.temperature, cd.soil_moisture
      FROM xai_explanations x
      JOIN predictions p ON x.prediction_id = p.id
      JOIN districts d ON p.district_id = d.id
      LEFT JOIN climate_data cd ON p.climate_data_id = cd.id
      WHERE x.prediction_id = ?
    `).get(predId);

    if (!xai) {
      return res.status(404).json({ success: false, error: 'XAI explanation not found for this prediction.' });
    }
    res.json({ success: true, data: xai });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/map-data - Andhra Pradesh 26 districts spatial map data
app.get('/api/map-data', (_req: Request, res: Response) => {
  try {
    const districts = db.prepare(`
      SELECT d.*, 
             p.id as prediction_id, p.predicted_risk, p.confidence, p.prediction_date,
             cd.ndvi, cd.rainfall, cd.temperature, cd.soil_moisture, cd.climate_stress_index, cd.month, cd.year
      FROM districts d
      LEFT JOIN predictions p ON p.id = (
        SELECT MAX(id) FROM predictions WHERE district_id = d.id
      )
      LEFT JOIN climate_data cd ON p.climate_data_id = cd.id
      ORDER BY d.id ASC
    `).all() as any[];

    const formatted = districts.map((d: any) => {
      // If no prediction yet, use telemetry baseline
      const telemetry = getDistrictTelemetry(d.district_name);
      return {
        id: d.id,
        district_name: d.district_name,
        zone: d.zone,
        hq: d.hq,
        latitude: d.latitude,
        longitude: d.longitude,
        predicted_risk: d.predicted_risk || telemetry.baseline_risk,
        confidence: d.confidence || 88.5,
        ndvi: d.ndvi != null ? d.ndvi : telemetry.ndvi,
        rainfall: d.rainfall != null ? d.rainfall : telemetry.rainfall,
        temperature: d.temperature != null ? d.temperature : telemetry.temperature,
        soil_moisture: d.soil_moisture != null ? d.soil_moisture : telemetry.soil_moisture,
        climate_stress_index: d.climate_stress_index != null ? d.climate_stress_index : telemetry.calculated_csi,
        prediction_date: d.prediction_date || new Date().toISOString()
      };
    });

    res.json({ success: true, count: formatted.length, data: formatted });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/export/csv - Export prediction history as downloadable CSV
app.get('/api/export/csv', (_req: Request, res: Response) => {
  try {
    const records = db.prepare(`
      SELECT p.id as prediction_id, d.district_name, d.zone, cd.month, cd.year,
             cd.ndvi, cd.rainfall, cd.temperature, cd.soil_moisture, cd.climate_stress_index,
             p.predicted_risk, p.confidence, p.low_probability, p.medium_probability, p.high_probability,
             p.prediction_date, x.explanation
      FROM predictions p
      JOIN districts d ON p.district_id = d.id
      LEFT JOIN climate_data cd ON p.climate_data_id = cd.id
      LEFT JOIN xai_explanations x ON p.id = x.prediction_id
      ORDER BY p.id DESC
    `).all() as any[];

    const headers = [
      'Prediction_ID',
      'District',
      'Zone',
      'Month',
      'Year',
      'NDVI',
      'Rainfall_mm',
      'Temperature_C',
      'Soil_Moisture_Pct',
      'Climate_Stress_Index',
      'Predicted_Risk',
      'Confidence_Pct',
      'Low_Prob',
      'Medium_Prob',
      'High_Prob',
      'Prediction_Date',
      'XAI_Explanation'
    ];

    let csvContent = headers.join(',') + '\n';
    for (const r of records) {
      const row = [
        r.prediction_id,
        `"${r.district_name}"`,
        `"${r.zone}"`,
        r.month || 11,
        r.year || 2026,
        r.ndvi,
        r.rainfall,
        r.temperature,
        r.soil_moisture,
        r.climate_stress_index,
        `"${r.predicted_risk}"`,
        r.confidence,
        r.low_probability,
        r.medium_probability,
        r.high_probability,
        `"${r.prediction_date}"`,
        `"${(r.explanation || '').replace(/"/g, '""')}"`
      ];
      csvContent += row.join(',') + '\n';
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="andhra_pradesh_climate_risk_predictions.csv"');
    res.send(csvContent);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/import-csv - Import dataset
app.post('/api/import-csv', (req: Request, res: Response) => {
  try {
    const { rows } = req.body;
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ success: false, error: 'No CSV rows provided.' });
    }

    const insertClim = db.prepare(`
      INSERT INTO climate_data (district_id, month, year, ndvi, rainfall, temperature, soil_moisture, climate_stress_index)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    let importedCount = 0;
    for (const row of rows) {
      const dName = String(row.District || row.district || row.district_name || '').trim();
      const dist = AP_DISTRICTS.find(d => d.district_name.toLowerCase() === dName.toLowerCase());
      if (dist) {
        const m = Number(row.Month || row.month || 1);
        const y = Number(row.Year || row.year || 2026);
        const ndvi = Number(row.NDVI || row.ndvi || 0.35);
        const rain = Number(row.Rainfall || row.rainfall || 60);
        const temp = Number(row.Temperature || row.temperature || 32);
        const soil = Number(row.Soil_Moisture || row.soil_moisture || 20);
        const { csi } = calculateClimateStressIndex(ndvi, rain, temp, soil);

        insertClim.run(dist.id, m, y, ndvi, rain, temp, soil, csi);
        importedCount++;
      }
    }

    res.json({ success: true, message: `Successfully imported ${importedCount} climate observations.` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/python-project-files - Serve file list and contents of the python project folder
app.get('/api/python-project-files', (_req: Request, res: Response) => {
  try {
    const projectDir = path.join(__dirname, 'climate-risk-project');
    const fileList: Array<{ path: string; name: string; content: string; language: string }> = [];

    function scanDir(dir: string, relative = '') {
      if (!fs.existsSync(dir)) return;
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const fullPath = path.join(dir, file);
        const relPath = path.join(relative, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          scanDir(fullPath, relPath);
        } else {
          const ext = path.extname(file);
          const lang = ext === '.py' ? 'python' : ext === '.json' ? 'json' : ext === '.csv' ? 'csv' : ext === '.md' ? 'markdown' : 'text';
          const content = fs.readFileSync(fullPath, 'utf-8');
          fileList.push({ path: relPath, name: file, content, language: lang });
        }
      }
    }

    scanDir(projectDir);
    res.json({ success: true, files: fileList });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Vite Middleware for Development / Static Serve for Production
async function startServer() {
  if (process.env.NODE_ENV === 'production' || fs.existsSync(path.join(__dirname, 'dist'))) {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
