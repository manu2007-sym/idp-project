import React from 'react';
import { 
  Home, 
  LayoutDashboard, 
  Database, 
  BrainCircuit, 
  Sparkles, 
  MapPin, 
  History, 
  Info, 
  FileCode2, 
  Menu, 
  X,
  Satellite,
  ShieldAlert
} from 'lucide-react';

export type NavPage = 
  | 'home' 
  | 'dashboard' 
  | 'climate-data' 
  | 'predict' 
  | 'xai' 
  | 'map' 
  | 'history' 
  | 'about' 
  | 'python-code';

interface NavbarProps {
  currentPage: NavPage;
  onPageChange: (page: NavPage) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onPageChange,
  mobileMenuOpen,
  setMobileMenuOpen
}) => {
  const navItems = [
    { id: 'home' as NavPage, label: 'Home', icon: Home, badge: null },
    { id: 'dashboard' as NavPage, label: 'Main Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'climate-data' as NavPage, label: 'District Climate Data', icon: Database, badge: '26 AP' },
    { id: 'predict' as NavPage, label: '1D CNN Risk Prediction', icon: BrainCircuit, badge: 'AI Model' },
    { id: 'xai' as NavPage, label: 'Explainable AI (XAI)', icon: Sparkles, badge: 'Gradients' },
    { id: 'map' as NavPage, label: 'AP District Risk Map', icon: MapPin, badge: 'Leaflet' },
    { id: 'history' as NavPage, label: 'Future & Past Timeline', icon: History, badge: '5-Year' },
    { id: 'about' as NavPage, label: 'About Project', icon: Info, badge: null },
    { id: 'python-code' as NavPage, label: 'Python / Flask Project', icon: FileCode2, badge: 'Folder' },
  ];

  return (
    <>
      {/* Top Mobile Bar */}
      <header className="lg:hidden sticky top-0 z-40 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-xs">
            <Satellite className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 text-sm leading-tight">AP Climate Risk</h1>
            <p className="text-[11px] text-emerald-600 font-medium">1D CNN with XAI • 26 Districts</p>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 border-emerald-600 bg-emerald-50 text-emerald-800 font-semibold text-xs shadow-xs hover:bg-emerald-100 transition-colors"
          aria-label="Toggle Navigation"
        >
          {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4 text-emerald-700" />}
          <span>{mobileMenuOpen ? 'Close' : '☰ Menu / Sidebar'}</span>
        </button>
      </header>

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar (Desktop sticky + Mobile slide-over) */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out
        lg:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Satellite className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-900 text-base tracking-tight">AP Climate Risk</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-sm">XAI</span>
              </div>
              <p className="text-xs text-slate-500">Monitoring & 1D CNN System</p>
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Telemetry Status Indicator */}
        <div className="px-5 py-3 bg-emerald-50/60 border-b border-emerald-100/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
            </span>
            <span className="text-xs font-semibold text-emerald-900">26 Districts Active</span>
          </div>
          <span className="text-[11px] font-mono font-medium text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
            SQLite / 1D CNN
          </span>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            const isPredict = item.id === 'predict';

            return (
              <button
                key={item.id}
                onClick={() => {
                  onPageChange(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`
                  w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all text-left
                  ${isActive 
                    ? isPredict
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-600/20 font-semibold'
                      : 'bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200/60' 
                    : isPredict
                      ? 'text-emerald-700 hover:bg-emerald-50/70'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4.5 w-4.5 ${isActive ? (isPredict ? 'text-white' : 'text-emerald-700') : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`
                    text-[10px] font-bold px-2 py-0.5 rounded-full
                    ${isActive 
                      ? isPredict ? 'bg-white/20 text-white' : 'bg-emerald-200/60 text-emerald-900' 
                      : 'bg-slate-100 text-slate-500'
                    }
                  `}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom System Banner */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/60">
          <div className="rounded-xl border border-slate-200/80 bg-white p-3 shadow-2xs">
            <div className="flex items-center gap-2 mb-1.5">
              <ShieldAlert className="h-4 w-4 text-emerald-600" />
              <span className="text-xs font-semibold text-slate-800">Academic Prototype</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              4 Climate Indicators: NDVI, Rainfall, Temperature & Soil Moisture analyzed via 1D CNN + XAI.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
