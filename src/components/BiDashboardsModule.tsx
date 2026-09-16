import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Package, 
  DollarSign, 
  AlertTriangle, 
  PieChart as PieIcon, 
  Sparkles, 
  CheckCircle2, 
  RefreshCw, 
  Download, 
  Layers,
  ArrowUpRight,
  ShieldCheck,
  AlertOctagon,
  Filter
} from 'lucide-react';
import { 
  StockItem, 
  SaleRecord, 
  ProductItem, 
  SectorType,
  MOIS_LIST, 
  getStockFinal, 
  getCoutRevient, 
  getValeurStock, 
  isAlerteStock, 
  formatFCFA,
  getItemSector,
  SECTOR_CONFIG
} from '../data/initialData';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';

import { StockStatusFilter } from './StockModule';

interface BiDashboardsModuleProps {
  stockList: StockItem[];
  salesList: SaleRecord[];
  productsList: ProductItem[];
  onNavigateToStockWithFilter?: (filter: StockStatusFilter) => void;
}

export const BiDashboardsModule: React.FC<BiDashboardsModuleProps> = ({
  stockList,
  salesList,
  productsList,
  onNavigateToStockWithFilter
}) => {
  const [selectedDashboard, setSelectedDashboard] = useState<'DASH_1' | 'DASH_2' | 'DASH_3'>('DASH_1');
  const [selectedSector, setSelectedSector] = useState<'ALL' | SectorType>('ALL');
  const [pieMode, setPieMode] = useState<'SECTORS' | 'CATEGORIES'>('SECTORS');

  // Sector calculations for items
  const alimStock = stockList.filter(s => getItemSector(s) === 'ALIMENTATION_PATISSERIE');
  const techStock = stockList.filter(s => getItemSector(s) === 'TECHNIQUE_INDUSTRIEL');

  const alimSales = salesList.filter(s => getItemSector(s) === 'ALIMENTATION_PATISSERIE');
  const techSales = salesList.filter(s => getItemSector(s) === 'TECHNIQUE_INDUSTRIEL');

  // Sector financial metrics
  const totalValeurStock = stockList.reduce((acc, item) => acc + getValeurStock(item), 0);
  const alimValeurStock = alimStock.reduce((acc, item) => acc + getValeurStock(item), 0);
  const techValeurStock = techStock.reduce((acc, item) => acc + getValeurStock(item), 0);

  const totalCA = salesList.reduce((acc, s) => acc + s.prixVenteTotal, 0);
  const alimCA = alimSales.reduce((acc, s) => acc + s.prixVenteTotal, 0);
  const techCA = techSales.reduce((acc, s) => acc + s.prixVenteTotal, 0);

  const totalProfit = salesList.reduce((acc, s) => acc + s.benefice, 0);
  const alimProfit = alimSales.reduce((acc, s) => acc + s.benefice, 0);
  const techProfit = techSales.reduce((acc, s) => acc + s.benefice, 0);

  const itemsEnAlerte = stockList.filter(isAlerteStock);
  const alimAlerte = alimStock.filter(isAlerteStock);
  const techAlerte = techStock.filter(isAlerteStock);

  const margeGlobalePct = totalCA > 0 ? ((totalProfit / totalCA) * 100).toFixed(1) : '0.0';
  const margeAlimPct = alimCA > 0 ? ((alimProfit / alimCA) * 100).toFixed(1) : '0.0';
  const margeTechPct = techCA > 0 ? ((techProfit / techCA) * 100).toFixed(1) : '0.0';

  // Filtered datasets based on active sector tab
  const currentStockList = selectedSector === 'ALL' 
    ? stockList 
    : stockList.filter(s => getItemSector(s) === selectedSector);

  const currentSalesList = selectedSector === 'ALL'
    ? salesList
    : salesList.filter(s => getItemSector(s) === selectedSector);

  // Data for Dashboard 1: Monthly CA vs Profit (with Dual Sector Breakdown)
  const monthlyChartData = MOIS_LIST.map(mois => {
    const matchingSales = salesList.filter(s => s.mois.toLowerCase() === mois.toLowerCase());
    const caTotal = matchingSales.reduce((acc, s) => acc + s.prixVenteTotal, 0);
    const profitTotal = matchingSales.reduce((acc, s) => acc + s.benefice, 0);

    const mAlimSales = matchingSales.filter(s => getItemSector(s) === 'ALIMENTATION_PATISSERIE');
    const caAlim = mAlimSales.reduce((acc, s) => acc + s.prixVenteTotal, 0);
    const profitAlim = mAlimSales.reduce((acc, s) => acc + s.benefice, 0);

    const mTechSales = matchingSales.filter(s => getItemSector(s) === 'TECHNIQUE_INDUSTRIEL');
    const caTech = mTechSales.reduce((acc, s) => acc + s.prixVenteTotal, 0);
    const profitTech = mTechSales.reduce((acc, s) => acc + s.benefice, 0);

    return {
      name: mois.substring(0, 4),
      moisComplet: mois,
      CA_Total: caTotal,
      Profit_Total: profitTotal,
      CA_Alim: caAlim,
      Profit_Alim: profitAlim,
      CA_Tech: caTech,
      Profit_Tech: profitTech
    };
  });

  // Data for Dashboard 2: Top produits proches de la rupture (Stock Final vs Stock Critique) filtered by sector
  const stockComparisonData = [...currentStockList]
    .map(item => {
      const stockFinal = getStockFinal(item);
      const ecart = stockFinal - item.stockCritique;
      return {
        name: item.designation.length > 20 ? item.designation.substring(0, 18) + '...' : item.designation,
        reference: item.reference,
        category: item.category,
        sector: getItemSector(item),
        stockFinal,
        stockCritique: item.stockCritique,
        ecart,
        unit: item.unit,
        isAlerte: stockFinal <= item.stockCritique
      };
    })
    .sort((a, b) => a.ecart - b.ecart)
    .slice(0, 10);

  // Data for Dashboard 3: Classement des ventes (Top articles vendus)
  const salesByProductMap: { [ref: string]: { ref: string; name: string; category: string; sector: SectorType; qty: number; ca: number; profit: number } } = {};
  
  const relevantProducts = selectedSector === 'ALL' 
    ? productsList 
    : productsList.filter(p => getItemSector(p) === selectedSector);

  relevantProducts.forEach(p => {
    salesByProductMap[p.reference] = {
      ref: p.reference,
      name: p.designation,
      category: p.category,
      sector: getItemSector(p),
      qty: 0,
      ca: 0,
      profit: 0
    };
  });

  currentSalesList.forEach(s => {
    if (!salesByProductMap[s.reference]) {
      salesByProductMap[s.reference] = {
        ref: s.reference,
        name: s.designation,
        category: s.category,
        sector: getItemSector(s),
        qty: 0,
        ca: 0,
        profit: 0
      };
    }
    salesByProductMap[s.reference].qty += s.quantiteVendue;
    salesByProductMap[s.reference].ca += s.prixVenteTotal;
    salesByProductMap[s.reference].profit += s.benefice;
  });

  const allProductSalesRanking = Object.values(salesByProductMap).sort((a, b) => b.ca - a.ca);
  const topVentesData = allProductSalesRanking.slice(0, 7).map(item => ({
    name: item.name.length > 18 ? item.name.substring(0, 16) + '...' : item.name,
    CA: item.ca,
    Quantite: item.qty,
    sector: item.sector
  }));

  // Data for Dashboard 3: Répartition par Pôle (Donut 1)
  const sectorPieData = [
    { name: 'Alimentation & Pâtisserie', value: alimCA, profit: alimProfit, color: '#F59E0B' },
    { name: 'Électronique & Mécanique', value: techCA, profit: techProfit, color: '#3B82F6' }
  ];

  // Data for Dashboard 3: Répartition par Catégorie (Donut 2)
  const caByCategoryMap: { [cat: string]: { ca: number; profit: number; sector: SectorType } } = {};
  currentSalesList.forEach(s => {
    if (!caByCategoryMap[s.category]) {
      caByCategoryMap[s.category] = { ca: 0, profit: 0, sector: getItemSector(s) };
    }
    caByCategoryMap[s.category].ca += s.prixVenteTotal;
    caByCategoryMap[s.category].profit += s.benefice;
  });

  const categoryDistributionData = Object.entries(caByCategoryMap).map(([category, vals]) => ({
    name: category,
    value: vals.ca,
    profit: vals.profit,
    sector: vals.sector
  }));

  const COLORS = ['#F59E0B', '#3B82F6', '#10B981', '#EC4899', '#8B5CF6', '#14B8A6', '#F97316'];

  // Contrôle d'erreurs
  const anomalies = [];
  productsList.forEach(p => {
    const stock = stockList.find(s => s.reference === p.reference);
    if (!p.sellingPrice || p.sellingPrice <= 0) {
      anomalies.push({
        ref: p.reference,
        name: p.designation,
        sector: getItemSector(p),
        type: 'Prix de vente manquant ou nul',
        severity: 'HIGH'
      });
    }
    if (stock) {
      const cout = getCoutRevient(stock);
      if (p.sellingPrice < cout) {
        anomalies.push({
          ref: p.reference,
          name: p.designation,
          sector: getItemSector(p),
          type: `Marge négative : Vente (${p.sellingPrice} F) < Coût (${cout} F)`,
          severity: 'CRITICAL'
        });
      }
    }
  });

  return (
    <div className="space-y-6">
      {/* Top Banner / Looker Studio Title */}
      <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-stone-900 flex items-center gap-2">
              <span>Google Looker Studio • Business Intelligence</span>
              <span>📈</span>
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-800 font-bold font-mono">
              2 Pôles Décisionnels
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Tableaux de bord analytiques avec séparation stricte : <strong>Alimentation & Pâtisserie</strong> vs <strong>Électronique, Mécanique & Électricité</strong>
          </p>
        </div>

        {/* Dashboard switcher tabs */}
        <div className="flex items-center bg-stone-100 p-1.5 rounded-2xl text-xs flex-wrap border border-stone-200">
          <button
            onClick={() => setSelectedDashboard('DASH_1')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer ${
              selectedDashboard === 'DASH_1'
                ? 'bg-stone-900 text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Dashboard 1 : Vue Générale 📊
          </button>

          <button
            onClick={() => setSelectedDashboard('DASH_2')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer ${
              selectedDashboard === 'DASH_2'
                ? 'bg-stone-900 text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Dashboard 2 : Gestion des Stocks 📦
          </button>

          <button
            onClick={() => setSelectedDashboard('DASH_3')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer ${
              selectedDashboard === 'DASH_3'
                ? 'bg-stone-900 text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Dashboard 3 : Ventes & Catégories 🥧
          </button>
        </div>
      </div>

      {/* SECTOR SWITCHER TABS (Universal across dashboards) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-stone-200 shadow-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-stone-500" />
          <span className="text-xs font-bold text-stone-700">Filtrer l'analyse par Pôle d'Activité :</span>
        </div>

        <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl text-xs">
          <button
            onClick={() => setSelectedSector('ALL')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              selectedSector === 'ALL' ? 'bg-stone-900 text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            🌐 Vue Consolidée (2 Pôles)
          </button>
          <button
            onClick={() => setSelectedSector('ALIMENTATION_PATISSERIE')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              selectedSector === 'ALIMENTATION_PATISSERIE' ? 'bg-amber-500 text-white shadow-xs' : 'text-stone-600 hover:text-amber-900'
            }`}
          >
            🥐 Alimentation & Pâtisserie
          </button>
          <button
            onClick={() => setSelectedSector('TECHNIQUE_INDUSTRIEL')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              selectedSector === 'TECHNIQUE_INDUSTRIEL' ? 'bg-blue-600 text-white shadow-xs' : 'text-stone-600 hover:text-blue-900'
            }`}
          >
            ⚡ Électronique & Mécanique
          </button>
        </div>
      </div>

      {/* DASHBOARD 1: VUE GÉNÉRALE (EXECUTIVE KPI & HISTORIQUE MENSUEL) */}
      {selectedDashboard === 'DASH_1' && (
        <div className="space-y-6">
          {/* Dual Sector Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pole 1: Alimentation */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 p-5 rounded-3xl border-2 border-amber-300 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🥐</span>
                  <div>
                    <h3 className="text-sm font-extrabold text-amber-950 uppercase tracking-wider">
                      Pôle Alimentation, Divers & Pâtisserie
                    </h3>
                    <span className="text-[11px] text-amber-700 font-medium">
                      Yaourts, coulis, délices, confiseries, emballages
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-amber-200 text-amber-900 text-xs font-bold font-mono">
                  {alimStock.length} références
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-amber-200/80">
                <div>
                  <span className="text-[11px] text-amber-800 block">Chiffre d'Affaires</span>
                  <div className="text-lg font-black text-amber-950 font-mono">{formatFCFA(alimCA)}</div>
                  <span className="text-[10px] text-amber-700">
                    {totalCA > 0 ? Math.round((alimCA / totalCA) * 100) : 0}% du CA total
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-amber-800 block">Bénéfice Réel</span>
                  <div className="text-lg font-black text-emerald-700 font-mono">+{formatFCFA(alimProfit)}</div>
                  <span className="text-[10px] text-emerald-700 font-semibold">Marge : {margeAlimPct}%</span>
                </div>
                <div>
                  <span className="text-[11px] text-amber-800 block">Valeur en Stock</span>
                  <div className="text-lg font-black text-stone-900 font-mono">{formatFCFA(alimValeurStock)}</div>
                  <span className={`text-[10px] font-bold ${alimAlerte.length > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                    {alimAlerte.length > 0 ? `🚨 ${alimAlerte.length} en alerte` : '✅ Stock optimal'}
                  </span>
                </div>
              </div>
            </div>

            {/* Pole 2: Technique & Industriel */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 p-5 rounded-3xl border-2 border-blue-300 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">⚡</span>
                  <div>
                    <h3 className="text-sm font-extrabold text-blue-950 uppercase tracking-wider">
                      Pôle Électronique, Mécanique & Électricité
                    </h3>
                    <span className="text-[11px] text-blue-700 font-medium">
                      Composants, outillage, pièces moteur, câblage, automatisme
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-blue-200 text-blue-900 text-xs font-bold font-mono">
                  {techStock.length} références
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-blue-200/80">
                <div>
                  <span className="text-[11px] text-blue-800 block">Chiffre d'Affaires</span>
                  <div className="text-lg font-black text-blue-950 font-mono">{formatFCFA(techCA)}</div>
                  <span className="text-[10px] text-blue-700">
                    {totalCA > 0 ? Math.round((techCA / totalCA) * 100) : 0}% du CA total
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-blue-800 block">Bénéfice Réel</span>
                  <div className="text-lg font-black text-emerald-700 font-mono">+{formatFCFA(techProfit)}</div>
                  <span className="text-[10px] text-emerald-700 font-semibold">Marge : {margeTechPct}%</span>
                </div>
                <div>
                  <span className="text-[11px] text-blue-800 block">Valeur en Stock</span>
                  <div className="text-lg font-black text-stone-900 font-mono">{formatFCFA(techValeurStock)}</div>
                  <span className={`text-[10px] font-bold ${techAlerte.length > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                    {techAlerte.length > 0 ? `🚨 ${techAlerte.length} en alerte` : '✅ Stock optimal'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 4 Scorecards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div 
              onClick={() => onNavigateToStockWithFilter?.('ALL')}
              className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm relative overflow-hidden hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group"
              title="Cliquer pour afficher tous les articles en stock"
            >
              <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider flex items-center gap-1">
                <span>📦</span> Valeur Totale Stock
              </div>
              <div className="text-2xl font-black text-stone-900 mt-1">
                {formatFCFA(selectedSector === 'ALL' ? totalValeurStock : selectedSector === 'ALIMENTATION_PATISSERIE' ? alimValeurStock : techValeurStock)}
              </div>
              <div className="text-xs text-emerald-600 font-semibold mt-1 group-hover:underline">
                Voir les {currentStockList.length} articles →
              </div>
              <div className="absolute right-4 top-4 text-emerald-600/20 group-hover:scale-110 transition-transform">
                <Package className="w-10 h-10" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm relative overflow-hidden">
              <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Chiffre d'Affaires Cumulé</div>
              <div className="text-2xl font-black text-stone-900 mt-1">
                {formatFCFA(selectedSector === 'ALL' ? totalCA : selectedSector === 'ALIMENTATION_PATISSERIE' ? alimCA : techCA)}
              </div>
              <div className="text-xs text-stone-500 font-semibold mt-1">
                {selectedSector === 'ALL' ? 'Total des 2 pôles' : selectedSector === 'ALIMENTATION_PATISSERIE' ? 'Pôle Alimentation' : 'Pôle Technique'}
              </div>
              <div className="absolute right-4 top-4 text-amber-500/20">
                <DollarSign className="w-10 h-10" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm relative overflow-hidden">
              <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Bénéfice / Profit Total</div>
              <div className="text-2xl font-black text-emerald-700 mt-1">
                +{formatFCFA(selectedSector === 'ALL' ? totalProfit : selectedSector === 'ALIMENTATION_PATISSERIE' ? alimProfit : techProfit)}
              </div>
              <div className="text-xs text-emerald-700 font-semibold mt-1">
                Marge : {selectedSector === 'ALL' ? margeGlobalePct : selectedSector === 'ALIMENTATION_PATISSERIE' ? margeAlimPct : margeTechPct}%
              </div>
              <div className="absolute right-4 top-4 text-emerald-600/20">
                <TrendingUp className="w-10 h-10" />
              </div>
            </div>

            <div 
              onClick={() => onNavigateToStockWithFilter?.('CRITIQUE')}
              className={`p-5 rounded-2xl border shadow-sm relative overflow-hidden transition-all cursor-pointer group ${
                itemsEnAlerte.length > 0 
                  ? 'bg-rose-50/40 border-rose-300 hover:border-rose-500 hover:shadow-md ring-1 ring-rose-200' 
                  : 'bg-white border-stone-200'
              }`}
              title="Cliquer pour afficher les produits en alerte"
            >
              <div className="text-xs font-semibold text-rose-600 uppercase tracking-wider flex items-center gap-1">
                <span>🚨</span> Références en Alerte
              </div>
              <div className={`text-2xl font-black mt-1 ${itemsEnAlerte.length > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                {(selectedSector === 'ALL' ? itemsEnAlerte : selectedSector === 'ALIMENTATION_PATISSERIE' ? alimAlerte : techAlerte).length} critiques
              </div>
              <div className="text-xs text-rose-700 font-bold mt-1 group-hover:underline">
                Afficher les références critiques →
              </div>
              <div className="absolute right-4 top-4 text-rose-600/20 group-hover:scale-110 transition-transform">
                <AlertTriangle className="w-10 h-10" />
              </div>
            </div>
          </div>

          {/* Temporal Chart: CA vs Profit Evolution */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div>
                <h3 className="text-base font-bold text-stone-900">
                  {selectedSector === 'ALL' 
                    ? 'Évolution Temporelle : CA Alimentation vs CA Technique vs Bénéfice' 
                    : `Évolution Temporelle : Chiffre d'Affaires vs Profit (${SECTOR_CONFIG[selectedSector].label})`}
                </h3>
                <p className="text-xs text-stone-500">Données issues de la formule =SUMIF(Tableau2[Mois], ...)</p>
              </div>
              <div className="flex items-center gap-3 text-xs font-medium text-stone-600">
                {selectedSector === 'ALL' ? (
                  <>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" /> CA Alimentation & Pâtiss.
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-blue-600 inline-block" /> CA Électronique & Méc.
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block" /> Bénéfice Total
                    </span>
                  </>
                ) : (
                  <>
                    <span className="flex items-center gap-1.5">
                      <span className={`w-3 h-3 rounded-full inline-block ${selectedSector === 'ALIMENTATION_PATISSERIE' ? 'bg-amber-500' : 'bg-blue-600'}`} /> Chiffre d'Affaires
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block" /> Bénéfice Net
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyChartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                  <YAxis 
                    stroke="#64748b" 
                    fontSize={11} 
                    tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`} 
                  />
                  <Tooltip 
                    formatter={(val: number | string | undefined) => [
                      formatFCFA(Number(val) || 0),
                      ''
                    ]}
                    contentStyle={{ backgroundColor: '#1c1917', borderRadius: '12px', color: '#fff', border: 'none' }}
                  />
                  {selectedSector === 'ALL' ? (
                    <>
                      <Bar dataKey="CA_Alim" fill="#F59E0B" radius={[4, 4, 0, 0]} name="CA Alimentation & Pâtiss." />
                      <Bar dataKey="CA_Tech" fill="#3B82F6" radius={[4, 4, 0, 0]} name="CA Électronique & Méc." />
                      <Bar dataKey="Profit_Total" fill="#10B981" radius={[4, 4, 0, 0]} name="Bénéfice Total" />
                    </>
                  ) : selectedSector === 'ALIMENTATION_PATISSERIE' ? (
                    <>
                      <Bar dataKey="CA_Alim" fill="#F59E0B" radius={[4, 4, 0, 0]} name="Chiffre d'Affaires" />
                      <Bar dataKey="Profit_Alim" fill="#10B981" radius={[4, 4, 0, 0]} name="Bénéfice Net" />
                    </>
                  ) : (
                    <>
                      <Bar dataKey="CA_Tech" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Chiffre d'Affaires" />
                      <Bar dataKey="Profit_Tech" fill="#10B981" radius={[4, 4, 0, 0]} name="Bénéfice Net" />
                    </>
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* DASHBOARD 2: GESTION DES STOCKS & RÉAPPROVISIONNEMENT */}
      {selectedDashboard === 'DASH_2' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div>
                <h3 className="text-base font-bold text-stone-900">
                  Top 10 des Produits Proches de la Rupture ou Critiques
                  {selectedSector !== 'ALL' && ` — ${SECTOR_CONFIG[selectedSector].label}`}
                </h3>
                <p className="text-xs text-stone-500">
                  Comparaison en unités : Stock Final actuel vs Seuil de Stock Critique défini
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs font-medium text-stone-600">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" /> Stock Final Actuel
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-stone-400 inline-block" /> Stock Critique
                </span>
              </div>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stockComparisonData} margin={{ top: 10, right: 10, left: 10, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} angle={-20} textAnchor="end" />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip 
                    formatter={(val: number | string | undefined, name: string | undefined) => [
                      `${val} unités`,
                      name === 'stockFinal' ? 'Stock Final' : 'Stock Critique'
                    ]}
                    contentStyle={{ backgroundColor: '#1c1917', borderRadius: '12px', color: '#fff', border: 'none' }}
                  />
                  <Bar dataKey="stockFinal" fill="#ef4444" radius={[4, 4, 0, 0]} name="Stock Final" />
                  <Bar dataKey="stockCritique" fill="#94a3b8" radius={[4, 4, 0, 0]} name="Stock Critique" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Detailed Replenishment Table */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-sm font-bold text-stone-900">Plan d'Approvisionnement Prioritaire</h4>
                <p className="text-xs text-rose-600 font-semibold">
                  {stockComparisonData.filter(i => i.isAlerte).length} références en dessous du seuil critique
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigateToStockWithFilter?.('CRITIQUE')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Afficher dans le Stock →</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-stone-100 text-stone-700 font-bold border-b border-stone-200">
                    <th className="py-2.5 px-3">Référence</th>
                    <th className="py-2.5 px-3">Désignation</th>
                    <th className="py-2.5 px-2">Pôle</th>
                    <th className="py-2.5 px-3">Catégorie</th>
                    <th className="py-2.5 px-2 text-center">Unité</th>
                    <th className="py-2.5 px-2 text-center text-rose-600 font-bold">Stock Final</th>
                    <th className="py-2.5 px-2 text-center">Stock Critique</th>
                    <th className="py-2.5 px-3 text-center">Quantité à commander recommandée</th>
                    <th className="py-2.5 px-3 text-center">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-700">
                  {stockComparisonData.map(item => {
                    const sConf = SECTOR_CONFIG[item.sector];
                    return (
                      <tr key={item.reference} className={`hover:bg-stone-50 ${item.isAlerte ? 'bg-rose-50/20' : ''}`}>
                        <td className="py-2.5 px-3 font-mono font-semibold">{item.reference}</td>
                        <td className="py-2.5 px-3 font-medium text-stone-900">{item.name}</td>
                        <td className="py-2.5 px-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${sConf.badgeClass}`}>
                            {sConf.icon} {sConf.shortLabel}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-stone-500">{item.category}</td>
                        <td className="py-2.5 px-2 text-center">{item.unit}</td>
                        <td className={`py-2.5 px-2 text-center font-mono font-black ${item.isAlerte ? 'text-rose-600' : 'text-stone-800'}`}>
                          {item.stockFinal}
                        </td>
                        <td className="py-2.5 px-2 text-center font-mono text-stone-500">{item.stockCritique}</td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-stone-800">
                          {item.stockFinal <= item.stockCritique 
                            ? `+${Math.max(item.stockCritique * 2 - item.stockFinal, 5)} ${item.unit}` 
                            : 'Seuil respecté'}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {item.isAlerte ? (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700">
                              🚨 Réapprovisionner
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700">
                              ✅ Bon niveau
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* DASHBOARD 3: PERFORMANCE DES VENTES & RÉPARTITION PAR CATÉGORIE */}
      {selectedDashboard === 'DASH_3' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Top Ventes Ranking (7 cols) */}
            <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-stone-900">
                    Palmarès des Ventes (Top Articles)
                    {selectedSector !== 'ALL' && ` — ${SECTOR_CONFIG[selectedSector].label}`}
                  </h3>
                  <p className="text-xs text-stone-500">Classement par Chiffre d'Affaires généré</p>
                </div>
                <div className="text-xs text-stone-500 font-mono">En FCFA</div>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topVentesData} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" stroke="#64748b" fontSize={11} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                    <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={11} width={100} />
                    <Tooltip 
                      formatter={(val: number | string | undefined) => [formatFCFA(Number(val) || 0), 'Chiffre d\'Affaires']}
                      contentStyle={{ backgroundColor: '#1c1917', borderRadius: '12px', color: '#fff', border: 'none' }}
                    />
                    <Bar 
                      dataKey="CA" 
                      fill={selectedSector === 'TECHNIQUE_INDUSTRIEL' ? '#3B82F6' : '#F59E0B'} 
                      radius={[0, 6, 6, 0]} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Sector / Category Pie Chart (5 cols) */}
            <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-base font-bold text-stone-900">Répartition du CA</h3>
                    <p className="text-xs text-stone-500">Contribution au Chiffre d'Affaires</p>
                  </div>

                  {/* Toggle between Sector Donut and Category Donut */}
                  <div className="flex gap-1 p-0.5 bg-stone-100 rounded-lg text-[11px]">
                    <button
                      onClick={() => setPieMode('SECTORS')}
                      className={`px-2 py-1 rounded-md font-bold transition-all cursor-pointer ${
                        pieMode === 'SECTORS' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
                      }`}
                    >
                      Pôles
                    </button>
                    <button
                      onClick={() => setPieMode('CATEGORIES')}
                      className={`px-2 py-1 rounded-md font-bold transition-all cursor-pointer ${
                        pieMode === 'CATEGORIES' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
                      }`}
                    >
                      Catégories
                    </button>
                  </div>
                </div>

                {pieMode === 'SECTORS' ? (
                  <div>
                    <div className="h-56 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={sectorPieData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            innerRadius={45}
                            paddingAngle={4}
                          >
                            {sectorPieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(val: number | string | undefined) => [formatFCFA(Number(val) || 0), 'CA généré']}
                            contentStyle={{ backgroundColor: '#1c1917', borderRadius: '12px', color: '#fff', border: 'none' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="space-y-2 pt-3 border-t border-stone-100">
                      {sectorPieData.map((sec) => (
                        <div key={sec.name} className="flex items-center justify-between text-xs p-2 rounded-xl bg-stone-50">
                          <span className="flex items-center gap-2 font-bold text-stone-800">
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: sec.color }} />
                            <span>{sec.name}</span>
                          </span>
                          <div className="text-right font-mono">
                            <div className="font-extrabold text-stone-900">{formatFCFA(sec.value)}</div>
                            <div className="text-[10px] text-stone-500">
                              {totalCA > 0 ? Math.round((sec.value / totalCA) * 100) : 0}% du CA
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="h-56 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryDistributionData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            innerRadius={45}
                            paddingAngle={3}
                          >
                            {categoryDistributionData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(val: number | string | undefined) => [formatFCFA(Number(val) || 0), 'CA généré']}
                            contentStyle={{ backgroundColor: '#1c1917', borderRadius: '12px', color: '#fff', border: 'none' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="space-y-1.5 pt-3 border-t border-stone-100 max-h-40 overflow-y-auto">
                      {categoryDistributionData.map((cat, i) => (
                        <div key={cat.name} className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-2 text-stone-700">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                            <span className="truncate max-w-[150px]">{cat.name}</span>
                          </span>
                          <span className="font-mono font-bold text-stone-900">{formatFCFA(cat.value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </div>

          </div>

          {/* Anomalies & Error Control */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-bold text-stone-900">
                Axe d'Amélioration & Contrôle d'Erreurs Automatisé
              </h3>
            </div>

            {anomalies.length === 0 ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-xs text-emerald-800 font-medium">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>
                  Audit parfait : Toutes les références ont un prix de vente valide supérieur à leur coût de revient unitaire (aucune marge négative ni prix manquant).
                </span>
              </div>
            ) : (
              <div className="space-y-2">
                {anomalies.map((ano, idx) => (
                  <div key={idx} className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <AlertOctagon className="w-4 h-4 text-rose-600" />
                      <span className="font-mono font-bold text-rose-900">{ano.ref}</span>
                      <span className="text-stone-700">{ano.name}</span>
                    </div>
                    <span className="font-bold text-rose-700">{ano.type}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
