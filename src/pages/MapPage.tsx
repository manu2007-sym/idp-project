import React, { useEffect, useRef, useState } from 'react';
import { 
  MapPin, 
  Layers, 
  Filter, 
  Info, 
  Sprout, 
  Droplets, 
  ThermometerSun, 
  Activity, 
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { RiskBadge } from '../components/RiskBadge';
import { RiskLevel } from '../types/climate';
import { NavPage } from '../components/Navbar';

declare const L: any; // Leaflet global from index.html

interface MapDistrictItem {
  id: number;
  district_name: string;
  zone: string;
  hq: string;
  latitude: number;
  longitude: number;
  predicted_risk: RiskLevel;
  confidence: number;
  ndvi: number;
  rainfall: number;
  temperature: number;
  soil_moisture: number;
  climate_stress_index: number;
  prediction_date: string;
}

interface MapPageProps {
  onNavigate: (page: NavPage) => void;
}

export const MapPage: React.FC<MapPageProps> = ({ onNavigate }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);

  const [districts, setDistricts] = useState<MapDistrictItem[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<MapDistrictItem | null>(null);
  const [riskFilter, setRiskFilter] = useState<'ALL' | RiskLevel>('ALL');
  const [zoneFilter, setZoneFilter] = useState<string>('ALL');
  const [tileMode, setTileMode] = useState<'streets' | 'satellite'>('streets');
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch map data from /api/map-data
  useEffect(() => {
    const fetchMapData = async () => {
      try {
        const res = await fetch('/api/map-data');
        const json = await res.json();
        if (json.success && json.data) {
          setDistricts(json.data);
          if (json.data.length > 0) {
            setSelectedDistrict(json.data[0]);
          }
        }
      } catch (err) {
        console.error('Error fetching map data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMapData();
  }, []);

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (typeof L === 'undefined') return;

    if (!mapInstanceRef.current) {
      // Center of Andhra Pradesh (~15.9° N, 79.7° E)
      const map = L.map(mapContainerRef.current, {
        center: [15.9129, 79.74],
        zoom: 7,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      mapInstanceRef.current = map;
      markersLayerRef.current = L.layerGroup().addTo(map);
    }

    const map = mapInstanceRef.current;

    // Remove existing tile layers
    map.eachLayer((layer: any) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    // Add selected tile layer
    if (tileMode === 'streets') {
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CartoDB & OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map);
    } else {
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '&copy; Esri & Earthstar Geographics',
        maxZoom: 18,
      }).addTo(map);
    }
  }, [tileMode]);

  // Update district markers when districts or filters change
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current || typeof L === 'undefined') return;

    const layer = markersLayerRef.current;
    layer.clearLayers();

    const filtered = districts.filter(d => {
      if (riskFilter !== 'ALL' && d.predicted_risk !== riskFilter) return false;
      if (zoneFilter !== 'ALL' && d.zone !== zoneFilter) return false;
      return true;
    });

    filtered.forEach(d => {
      let color = '#10b981'; // Green (LOW)
      let pulseClass = 'low-risk';
      if (d.predicted_risk === 'HIGH') {
        color = '#f43f5e'; // Red (HIGH)
        pulseClass = 'high-risk';
      } else if (d.predicted_risk === 'MEDIUM') {
        color = '#f59e0b'; // Amber (MEDIUM)
        pulseClass = 'med-risk';
      }

      // Custom HTML marker pin with risk color
      const customIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `
          <div style="
            background-color: ${color};
            width: 28px;
            height: 28px;
            border-radius: 50%;
            border: 3px solid #ffffff;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            font-size: 10px;
            font-weight: 800;
          ">
            ${d.id}
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([d.latitude, d.longitude], { icon: customIcon });

      // Click interaction
      marker.on('click', () => {
        setSelectedDistrict(d);
      });

      // Tooltip hover
      marker.bindTooltip(`
        <div style="font-family: sans-serif; font-size: 12px; font-weight: bold; padding: 2px;">
          ${d.district_name} (${d.predicted_risk})
        </div>
      `, { direction: 'top', offset: [0, -12] });

      layer.addLayer(marker);
    });
  }, [districts, riskFilter, zoneFilter]);

  const sel = selectedDistrict;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <MapPin className="h-4.5 w-4.5" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Andhra Pradesh District Risk Map</h2>
            <span className="text-[11px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
              26 Districts
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Interactive Leaflet.js spatial map with color-coded risk markers and district climate telemetry
          </p>
        </div>

        {/* Tile mode & quick filter */}
        <div className="flex items-center gap-2">
          <div className="bg-white border border-slate-200 rounded-xl p-1 flex items-center shadow-2xs">
            <button
              onClick={() => setTileMode('streets')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                tileMode === 'streets' ? 'bg-slate-900 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Street Map
            </button>
            <button
              onClick={() => setTileMode('satellite')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                tileMode === 'satellite' ? 'bg-slate-900 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Satellite
            </button>
          </div>
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="font-bold text-slate-700 mr-1 flex items-center gap-1">
            <Filter className="h-3.5 w-3.5 text-emerald-600" />
            Risk Filter:
          </span>
          {(['ALL', 'LOW', 'MEDIUM', 'HIGH'] as const).map(risk => (
            <button
              key={risk}
              onClick={() => setRiskFilter(risk)}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                riskFilter === risk 
                  ? risk === 'HIGH' ? 'bg-rose-600 text-white' : risk === 'MEDIUM' ? 'bg-amber-600 text-white' : risk === 'LOW' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {risk}
            </button>
          ))}
        </div>

        {/* Zone Filter */}
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-slate-700 mr-1">Zone:</span>
          {['ALL', 'North Coastal', 'Coastal Delta', 'South Coastal', 'Rayalaseema'].map(zone => (
            <button
              key={zone}
              onClick={() => setZoneFilter(zone)}
              className={`px-2 py-0.5 rounded-md font-semibold text-[11px] transition-all cursor-pointer ${
                zoneFilter === zone ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {zone}
            </button>
          ))}
        </div>
      </div>

      {/* Main Map + Selected District Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Leaflet Map Container (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 p-2 shadow-xs overflow-hidden relative">
          <div 
            ref={mapContainerRef} 
            className="w-full h-[540px] rounded-xl z-10"
            style={{ background: '#f8fafc' }}
          />

          {/* Map Legend Overlay */}
          <div className="absolute bottom-5 right-5 z-20 bg-white/90 backdrop-blur-md border border-slate-200 rounded-xl p-3 shadow-md text-xs space-y-1.5">
            <span className="font-bold text-[10px] text-slate-400 uppercase tracking-wider block">Risk Legend</span>
            <div className="flex items-center gap-2 text-slate-700">
              <span className="h-3 w-3 rounded-full bg-emerald-500 border border-white" />
              <span>LOW RISK</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <span className="h-3 w-3 rounded-full bg-amber-500 border border-white" />
              <span>MEDIUM RISK</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <span className="h-3 w-3 rounded-full bg-rose-500 border border-white" />
              <span>HIGH RISK</span>
            </div>
          </div>
        </div>

        {/* Selected District Telemetry Drawer (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {sel ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Selected District</span>
                  <h3 className="font-extrabold text-slate-900 text-lg">{sel.district_name}</h3>
                  <p className="text-xs text-slate-500">HQ: {sel.hq} • {sel.zone} Zone</p>
                </div>
                <RiskBadge risk={sel.predicted_risk} size="md" showPulse />
              </div>

              {/* Coordinates */}
              <div className="text-[11px] font-mono text-slate-500 bg-slate-50 p-2 rounded-lg flex items-center justify-between">
                <span>Lat: {sel.latitude.toFixed(4)}° N</span>
                <span>Lon: {sel.longitude.toFixed(4)}° E</span>
              </div>

              {/* Four Climate Indicators */}
              <div className="space-y-2.5">
                <span className="text-xs font-bold text-slate-700">Climate Observation Telemetry:</span>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sprout className="h-4 w-4 text-emerald-600" />
                    <span className="text-xs text-slate-700">NDVI (Vegetation Index)</span>
                  </div>
                  <strong className="text-xs font-bold text-slate-800">{sel.ndvi}</strong>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Droplets className="h-4 w-4 text-blue-600" />
                    <span className="text-xs text-slate-700">Rainfall</span>
                  </div>
                  <strong className="text-xs font-bold text-slate-800">{sel.rainfall} mm</strong>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ThermometerSun className="h-4 w-4 text-amber-600" />
                    <span className="text-xs text-slate-700">Temperature</span>
                  </div>
                  <strong className="text-xs font-bold text-slate-800">{sel.temperature} °C</strong>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-cyan-600" />
                    <span className="text-xs text-slate-700">Soil Moisture</span>
                  </div>
                  <strong className="text-xs font-bold text-slate-800">{sel.soil_moisture} %</strong>
                </div>
              </div>

              {/* Stress Index & Confidence */}
              <div className="grid grid-cols-2 gap-2 text-center pt-1">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-semibold">Stress Index (CSI)</span>
                  <span className="text-sm font-bold text-slate-800 font-mono">{sel.climate_stress_index.toFixed(3)}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-semibold">CNN Confidence</span>
                  <span className="text-sm font-bold text-slate-800">{sel.confidence}%</span>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 space-y-2">
                <button
                  onClick={() => onNavigate('predict')}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:brightness-105 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Run New 1D CNN Prediction</span>
                </button>
                <button
                  onClick={() => onNavigate('xai')}
                  className="w-full py-2 px-4 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold text-center cursor-pointer"
                >
                  View Integrated Gradients XAI →
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500">
              Click any district pin on the map to inspect its climate parameters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
