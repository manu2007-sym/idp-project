/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Navbar, NavPage } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { DashboardPage } from './pages/DashboardPage';
import { DistrictDataPage } from './pages/DistrictDataPage';
import { PredictionPage } from './pages/PredictionPage';
import { XAIPage } from './pages/XAIPage';
import { MapPage } from './pages/MapPage';
import { HistoryPage } from './pages/HistoryPage';
import { AboutPage } from './pages/AboutPage';
import { PythonCodePage } from './pages/PythonCodePage';
import { Satellite, ShieldCheck, Heart } from 'lucide-react';

export default function App() {
  const [currentPage, setCurrentPage] = useState<NavPage>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [selectedPredictionIdForXai, setSelectedPredictionIdForXai] = useState<number | null>(null);

  const handleSelectPredictionForXai = (predId: number) => {
    setSelectedPredictionIdForXai(predId);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Sidebar Navigation */}
      <Navbar
        currentPage={currentPage}
        onPageChange={(page) => {
          setCurrentPage(page);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Main Content Area (offset by 288px / w-72 on desktop) */}
      <div className="lg:pl-72 flex-1 flex flex-col min-h-screen">
        {/* Top Quick Navigation Bar (always accessible at the top of the screen) */}
        <div className="bg-white border-b border-slate-200/90 sticky top-0 lg:top-0 z-30 px-3 sm:px-6 py-2.5 shadow-2xs">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 overflow-x-auto no-scrollbar py-0.5">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider hidden sm:inline mr-1">
                Quick Pages:
              </span>
              <button
                onClick={() => setCurrentPage('home')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  currentPage === 'home' 
                    ? 'bg-emerald-600 text-white shadow-xs' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                🏠 Home
              </button>
              <button
                onClick={() => setCurrentPage('dashboard')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  currentPage === 'dashboard' 
                    ? 'bg-emerald-600 text-white shadow-xs' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                📊 Dashboard
              </button>
              <button
                onClick={() => setCurrentPage('predict')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all border ${
                  currentPage === 'predict' 
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs' 
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                🧠 1D CNN Predict
              </button>
              <button
                onClick={() => setCurrentPage('climate-data')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  currentPage === 'climate-data' 
                    ? 'bg-emerald-600 text-white shadow-xs' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                🌱 District Data
              </button>
              <button
                onClick={() => setCurrentPage('history')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all border ${
                  currentPage === 'history' 
                    ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs' 
                    : 'bg-indigo-50 text-indigo-800 border-indigo-200 hover:bg-indigo-100'
                }`}
              >
                ⏳ 5-Year Future Forecast
              </button>
              <button
                onClick={() => setCurrentPage('xai')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  currentPage === 'xai' 
                    ? 'bg-emerald-600 text-white shadow-xs' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                ✨ XAI Gradients
              </button>
              <button
                onClick={() => setCurrentPage('map')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  currentPage === 'map' 
                    ? 'bg-emerald-600 text-white shadow-xs' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                🗺️ AP Map
              </button>
              <button
                onClick={() => setCurrentPage('python-code')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  currentPage === 'python-code' 
                    ? 'bg-emerald-600 text-white shadow-xs' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                🐍 Python Code
              </button>
            </div>

            <div className="hidden md:flex items-center gap-2 shrink-0 text-xs text-slate-500">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-medium text-slate-600">Active Page:</span>
              <span className="font-bold text-emerald-800 capitalize bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                {currentPage.replace('-', ' ')}
              </span>
            </div>
          </div>
        </div>

        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          {currentPage === 'home' && (
            <HomePage onNavigate={setCurrentPage} />
          )}

          {currentPage === 'dashboard' && (
            <DashboardPage onNavigate={setCurrentPage} />
          )}

          {currentPage === 'climate-data' && (
            <DistrictDataPage />
          )}

          {currentPage === 'predict' && (
            <PredictionPage
              onNavigate={setCurrentPage}
              onSelectPredictionForXai={handleSelectPredictionForXai}
            />
          )}

          {currentPage === 'xai' && (
            <XAIPage initialPredictionId={selectedPredictionIdForXai} />
          )}

          {currentPage === 'map' && (
            <MapPage onNavigate={setCurrentPage} />
          )}

          {currentPage === 'history' && (
            <HistoryPage />
          )}

          {currentPage === 'about' && (
            <AboutPage />
          )}

          {currentPage === 'python-code' && (
            <PythonCodePage />
          )}
        </main>

        {/* Global Footer */}
        <footer className="border-t border-slate-200/80 bg-white py-6 px-4 md:px-8 text-xs text-slate-500">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-md bg-emerald-700 text-white flex items-center justify-center">
                <Satellite className="h-3.5 w-3.5" />
              </div>
              <div>
                <span className="font-bold text-slate-800">AP Climate Risk Monitoring System</span>
                <span className="text-slate-400 ml-2">1D CNN & Integrated Gradients</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-slate-500 text-[11px]">
              <span>Coverage: 26 AP Districts</span>
              <span>•</span>
              <span>PyTorch Architecture (400 Epochs)</span>
              <span>•</span>
              <span>Benchmark Accuracy: 72.41%</span>
            </div>

            <div className="text-[11px] text-slate-400">
              Prototype for Environmental Research & Demonstration
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
