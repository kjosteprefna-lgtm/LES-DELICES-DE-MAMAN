import React from 'react';
import { 
  Home,
  Package, 
  ShoppingCart, 
  Layers, 
  BarChart3, 
  Settings, 
  AlertTriangle,
  FileSpreadsheet
} from 'lucide-react';
import { ActiveTab } from '../types';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  alertesCount: number;
  onOpenStockWithFilter?: (filter: 'ALL' | 'CRITIQUE') => void;
  onOpenBackupModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  alertesCount,
  onOpenStockWithFilter,
  onOpenBackupModal
}) => {
  const handleStockNavigation = (filter: 'ALL' | 'CRITIQUE') => {
    if (onOpenStockWithFilter) {
      onOpenStockWithFilter(filter);
    } else {
      setActiveTab('STOCK');
    }
  };
  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-rose-100 shadow-sm sticky top-0 z-30 select-none">
      {/* Subtle fruity decorative top bar */}
      <div className="h-1 w-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400" />

      <div className="max-w-7xl mx-auto px-4 py-2.5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
            <div className="flex items-center gap-2.5">
              <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-rose-200 border-2 border-white text-xl">
                🍓
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-base sm:text-lg tracking-tight text-stone-900">
                    LES DÉLICES DE MAMAN
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 font-semibold border border-rose-200 flex items-center gap-1">
                    <span>🥛</span> Yaourterie & Fruits
                  </span>
                </div>
                <p className="text-[11px] text-stone-500">
                  Délices Gourmands • Gestion Intégrée Stock, Ventes & Looker BI
                </p>
              </div>
            </div>

            {alertesCount > 0 && (
              <div 
                onClick={() => handleStockNavigation('CRITIQUE')}
                className="flex md:hidden items-center gap-1 px-2.5 py-1 bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-700 rounded-full text-xs font-bold cursor-pointer shadow-sm transition-all"
                title="Cliquer pour afficher les produits en alerte de réapprovisionnement"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                <span>{alertesCount} en alerte</span>
              </div>
            )}
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto py-1 scrollbar-none">
            <button
              onClick={() => setActiveTab('ACCUEIL')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'ACCUEIL'
                  ? 'bg-gradient-to-r from-rose-600 to-rose-500 text-white shadow-sm shadow-rose-200'
                  : 'text-stone-600 hover:bg-rose-50 hover:text-rose-700'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Accueil</span>
            </button>

            <button
              onClick={() => handleStockNavigation('ALL')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'STOCK'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm shadow-emerald-200'
                  : 'text-stone-600 hover:bg-emerald-50 hover:text-emerald-700'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Stock</span>
              {alertesCount > 0 && (
                <span 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStockNavigation('CRITIQUE');
                  }}
                  className="ml-1 px-1.5 py-0.2 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-black cursor-pointer shadow-xs transition-transform hover:scale-110"
                  title="Cliquer pour afficher uniquement les produits en alerte"
                >
                  {alertesCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('VENTE')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'VENTE'
                  ? 'bg-gradient-to-r from-rose-600 to-orange-500 text-white shadow-sm shadow-rose-200'
                  : 'text-stone-600 hover:bg-rose-50 hover:text-rose-700'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Vente & Caisse</span>
            </button>

            <button
              onClick={() => setActiveTab('PRODUITS')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'PRODUITS'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm shadow-amber-200'
                  : 'text-stone-600 hover:bg-amber-50 hover:text-amber-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Produits & Délices</span>
            </button>

            <button
              onClick={() => setActiveTab('BI_DASHBOARDS')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'BI_DASHBOARDS'
                  ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-sm shadow-purple-200 ring-2 ring-violet-200'
                  : 'text-purple-700 bg-purple-50/80 border border-purple-200 hover:bg-purple-100/80'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-purple-600" />
              <span>Looker Studio BI</span>
            </button>

            <button
              onClick={() => setActiveTab('CONFIGURATION')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'CONFIGURATION'
                  ? 'bg-stone-800 text-white shadow-sm'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Configuration</span>
            </button>
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            {onOpenBackupModal && (
              <button
                onClick={onOpenBackupModal}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer transition-all hover:shadow-md"
                title="Sauvegarder vos données, exporter vers Excel ou installer l'application"
              >
                <span>💾</span>
                <span className="hidden sm:inline">Sauvegarde & App</span>
              </button>
            )}

            {alertesCount > 0 ? (
              <button 
                onClick={() => handleStockNavigation('CRITIQUE')}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold hover:bg-rose-100 hover:border-rose-400 transition-all cursor-pointer shadow-xs"
                title="Cliquer pour afficher les produits en alerte critique dans le stock"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
                <span>{alertesCount} en alerte</span>
              </button>
            ) : (
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>Stocks OK 🍓</span>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
