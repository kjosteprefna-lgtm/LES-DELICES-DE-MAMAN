import React, { useState } from 'react';
import { 
  ShoppingCart, 
  PlusCircle, 
  Search, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Download, 
  AlertCircle,
  FileSpreadsheet,
  Filter,
  CheckCircle2,
  PieChart
} from 'lucide-react';
import { 
  SaleRecord, 
  StockItem, 
  ProductItem, 
  SectorType,
  MOIS_LIST, 
  getStockFinal, 
  getCoutRevient, 
  formatFCFA,
  getItemSector,
  SECTOR_CONFIG
} from '../data/initialData';

interface VenteModuleProps {
  salesList: SaleRecord[];
  stockList: StockItem[];
  productsList: ProductItem[];
  onAddSale: (sale: Omit<SaleRecord, 'id'>) => void;
}

export const VenteModule: React.FC<VenteModuleProps> = ({
  salesList,
  stockList,
  productsList,
  onAddSale
}) => {
  const todayStr = new Date().toISOString().substring(0, 10);
  const currentMonthName = MOIS_LIST[new Date().getMonth()] || 'Juillet';

  // Sector filter for sales entry ("Remplissage")
  const [entrySectorFilter, setEntrySectorFilter] = useState<'ALL' | SectorType>('ALL');

  // Sector filter for monthly summary
  const [summaryViewMode, setSummaryViewMode] = useState<'ALL' | 'ALIMENTATION_PATISSERIE' | 'TECHNIQUE_INDUSTRIEL' | 'COMPARE'>('COMPARE');

  // Sector filter for sales journal
  const [journalSectorFilter, setJournalSectorFilter] = useState<'ALL' | SectorType>('ALL');

  // Sale entry form state
  const [selectedProductRef, setSelectedProductRef] = useState<string>(stockList[0]?.reference || '');
  const [saleDate, setSaleDate] = useState<string>(todayStr);
  const [saleMonth, setSaleMonth] = useState<string>(currentMonthName);
  const [qtySold, setQtySold] = useState<number>(1);
  const [discountPerUnit, setDiscountPerUnit] = useState<number>(0);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Search & Filter for journal
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedFilterMonth, setSelectedFilterMonth] = useState<string>('TOUS');

  // Filtered stock list for the sales entry dropdown based on entrySectorFilter
  const entryStockItems = stockList.filter(item => {
    if (entrySectorFilter === 'ALL') return true;
    return getItemSector(item) === entrySectorFilter;
  });

  // Find currently selected stock item and product
  const currentStockItem = stockList.find(s => s.reference === selectedProductRef) || entryStockItems[0] || stockList[0];
  const currentProduct = productsList.find(p => p.reference === (currentStockItem?.reference || selectedProductRef));
  const currentItemSector = currentStockItem ? getItemSector(currentStockItem) : 'ALIMENTATION_PATISSERIE';
  const sectorInfo = SECTOR_CONFIG[currentItemSector];

  const unitPrice = currentProduct ? currentProduct.sellingPrice : 0;
  const costPrice = currentStockItem ? getCoutRevient(currentStockItem) : 0;
  const stockDispo = currentStockItem ? getStockFinal(currentStockItem) : 0;

  // Real-time calculations (Excel formulas)
  const effectiveUnitPrice = Math.max(0, unitPrice - discountPerUnit);
  const totalSalesPrice = effectiveUnitPrice * qtySold;
  const estimatedProfit = totalSalesPrice - (costPrice * qtySold);

  // Global KPIs & Sector CA Breakdown
  const totalGeneralCA = salesList.reduce((acc, s) => acc + s.prixVenteTotal, 0);
  const totalGeneralProfit = salesList.reduce((acc, s) => acc + s.benefice, 0);

  const alimSales = salesList.filter(s => getItemSector(s) === 'ALIMENTATION_PATISSERIE');
  const alimCA = alimSales.reduce((acc, s) => acc + s.prixVenteTotal, 0);
  const alimProfit = alimSales.reduce((acc, s) => acc + s.benefice, 0);
  const alimMarginRate = alimCA > 0 ? Math.round((alimProfit / alimCA) * 100) : 0;
  const alimCaShare = totalGeneralCA > 0 ? Math.round((alimCA / totalGeneralCA) * 100) : 0;

  const techSales = salesList.filter(s => getItemSector(s) === 'TECHNIQUE_INDUSTRIEL');
  const techCA = techSales.reduce((acc, s) => acc + s.prixVenteTotal, 0);
  const techProfit = techSales.reduce((acc, s) => acc + s.benefice, 0);
  const techMarginRate = techCA > 0 ? Math.round((techProfit / techCA) * 100) : 0;
  const techCaShare = totalGeneralCA > 0 ? Math.round((techCA / totalGeneralCA) * 100) : 0;

  // Monthly summary calculations per sector and total
  const monthlySummary = MOIS_LIST.map(mois => {
    const monthSales = salesList.filter(s => s.mois.toLowerCase() === mois.toLowerCase());
    const caTotal = monthSales.reduce((acc, s) => acc + s.prixVenteTotal, 0);
    const profitTotal = monthSales.reduce((acc, s) => acc + s.benefice, 0);

    const mAlimSales = monthSales.filter(s => getItemSector(s) === 'ALIMENTATION_PATISSERIE');
    const caAlim = mAlimSales.reduce((acc, s) => acc + s.prixVenteTotal, 0);
    const profitAlim = mAlimSales.reduce((acc, s) => acc + s.benefice, 0);

    const mTechSales = monthSales.filter(s => getItemSector(s) === 'TECHNIQUE_INDUSTRIEL');
    const caTech = mTechSales.reduce((acc, s) => acc + s.prixVenteTotal, 0);
    const profitTech = mTechSales.reduce((acc, s) => acc + s.benefice, 0);

    return {
      mois,
      caTotal,
      profitTotal,
      caAlim,
      profitAlim,
      caTech,
      profitTech
    };
  });

  // Filtered sales journal
  const filteredSales = salesList.filter(s => {
    const matchesSearch = 
      s.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesMonth = selectedFilterMonth === 'TOUS' || s.mois.toLowerCase() === selectedFilterMonth.toLowerCase();
    const matchesSector = journalSectorFilter === 'ALL' || getItemSector(s) === journalSectorFilter;

    return matchesSearch && matchesMonth && matchesSector;
  });

  const handleCreateSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStockItem) return;

    if (qtySold > stockDispo) {
      alert(`Attention : La quantité demandée (${qtySold}) dépasse le stock disponible (${stockDispo} ${currentStockItem.unit}) !`);
      return;
    }

    onAddSale({
      date: saleDate,
      mois: saleMonth,
      reference: currentStockItem.reference,
      designation: currentStockItem.designation,
      category: currentStockItem.category,
      unit: currentStockItem.unit,
      quantiteDispo: stockDispo,
      quantiteVendue: qtySold,
      prixVenteUnitaire: unitPrice,
      remiseUnitaire: discountPerUnit,
      prixVenteTotal: totalSalesPrice,
      benefice: estimatedProfit
    });

    setSuccessMessage(`Vente enregistrée avec succès : ${currentStockItem.designation} (${qtySold} ${currentStockItem.unit}) !`);
    setTimeout(() => setSuccessMessage(null), 4000);
    setQtySold(1);
    setDiscountPerUnit(0);
  };

  const exportSalesCSV = () => {
    const headers = [
      'Date', 'Mois', 'Pôle d\'Activité', 'Référence', 'Désignation', 'Catégorie', 'Unité',
      'Quantité Disponible', 'Quantité Vendue', 'Prix Vente Unitaire',
      'Remise Accordée par Unité', 'Prix Vente Total', 'Bénéfice'
    ];

    const rows = salesList.map(s => {
      const sec = getItemSector(s);
      const poleName = sec === 'ALIMENTATION_PATISSERIE' ? 'Alimentation Divers & Pâtisserie' : 'Électronique, Mécanique & Électricité';
      return [
        s.date,
        `"${s.mois}"`,
        `"${poleName}"`,
        `"${s.reference}"`,
        `"${s.designation.replace(/"/g, '""')}"`,
        `"${s.category}"`,
        s.unit,
        s.quantiteDispo,
        s.quantiteVendue,
        s.prixVenteUnitaire,
        s.remiseUnitaire,
        s.prixVenteTotal,
        s.benefice
      ].join(';');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Journal_Ventes_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-stone-900 flex items-center gap-2">
              <span>Caisse & Chiffre d'Affaires par Pôle</span>
              <span>💰</span>
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-800 font-bold font-mono">
              2 Pôles Distincts
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Séparation stricte du Chiffre d'Affaires et des encaissements entre <strong>Alimentation Divers & Pâtisserie</strong> et <strong>Électronique, Mécanique & Électricité</strong>
          </p>
        </div>

        <button
          onClick={exportSalesCSV}
          className="flex items-center gap-1.5 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl transition-all self-start sm:self-auto cursor-pointer shadow-xs"
        >
          <Download className="w-4 h-4" />
          <span>Exporter Journal CSV</span>
        </button>
      </div>

      {/* 3 KPI Cards: Global CA, Pôle Alimentation/Pâtisserie, Pôle Électronique/Mécanique */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Global Total */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Chiffre d'Affaires Global</span>
            <span className="w-8 h-8 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center font-bold text-sm">
              📊
            </span>
          </div>
          <div className="text-2xl font-black text-stone-900 font-mono mb-1">
            {formatFCFA(totalGeneralCA)}
          </div>
          <div className="flex items-center justify-between text-xs pt-2 border-t border-stone-100">
            <span className="text-stone-500">Bénéfice Total :</span>
            <span className="font-mono font-bold text-emerald-700">+{formatFCFA(totalGeneralProfit)}</span>
          </div>
          <div className="flex items-center justify-between text-xs mt-1">
            <span className="text-stone-500">Taux de marge globale :</span>
            <span className="font-mono font-bold text-stone-800">
              {totalGeneralCA > 0 ? Math.round((totalGeneralProfit / totalGeneralCA) * 100) : 0}%
            </span>
          </div>
        </div>

        {/* POLE 1: Alimentation Divers & Pâtisserie */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50/40 p-5 rounded-3xl border-2 border-amber-300 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-base">🥐</span>
              <span className="text-[11px] font-extrabold text-amber-900 uppercase tracking-wider">Pôle Alimentation & Pâtisserie</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px] font-bold">
              {alimCaShare}% du CA
            </span>
          </div>
          <div className="text-2xl font-black text-amber-900 font-mono mb-1">
            {formatFCFA(alimCA)}
          </div>
          <div className="flex items-center justify-between text-xs pt-2 border-t border-amber-200">
            <span className="text-amber-800">Bénéfice Pôle :</span>
            <span className="font-mono font-bold text-emerald-700">+{formatFCFA(alimProfit)}</span>
          </div>
          <div className="flex items-center justify-between text-xs mt-1">
            <span className="text-amber-800">Marge & Ventes :</span>
            <span className="font-mono font-bold text-amber-900">
              {alimMarginRate}% ({alimSales.length} ventes)
            </span>
          </div>
        </div>

        {/* POLE 2: Électronique, Mécanique & Électricité */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50/40 p-5 rounded-3xl border-2 border-blue-300 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-base">⚡</span>
              <span className="text-[11px] font-extrabold text-blue-900 uppercase tracking-wider">Pôle Électronique & Mécanique</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-blue-200 text-blue-900 text-[10px] font-bold">
              {techCaShare}% du CA
            </span>
          </div>
          <div className="text-2xl font-black text-blue-900 font-mono mb-1">
            {formatFCFA(techCA)}
          </div>
          <div className="flex items-center justify-between text-xs pt-2 border-t border-blue-200">
            <span className="text-blue-800">Bénéfice Pôle :</span>
            <span className="font-mono font-bold text-emerald-700">+{formatFCFA(techProfit)}</span>
          </div>
          <div className="flex items-center justify-between text-xs mt-1">
            <span className="text-blue-800">Marge & Ventes :</span>
            <span className="font-mono font-bold text-blue-900">
              {techMarginRate}% ({techSales.length} ventes)
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left = New Sale Entry Form, Right = Monthly Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* New Sale Form (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-100 mb-5 gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-stone-100 text-stone-800 border border-stone-200 flex items-center justify-center font-bold text-base shadow-xs">
                🧾
              </div>
              <div>
                <h2 className="text-base font-bold text-stone-900">Saisie d'une Vente (Remplissage)</h2>
                <p className="text-[11px] text-stone-500">Choisissez le pôle pour filtrer immédiatement les articles</p>
              </div>
            </div>
            <span className="text-xs text-stone-500 font-medium">Déstockage immédiat</span>
          </div>

          {/* POLE SELECTOR FOR ENTRY */}
          <div className="mb-4 p-3 bg-stone-50 rounded-2xl border border-stone-200">
            <label className="block text-[11px] font-bold text-stone-600 mb-2 uppercase tracking-wider">
              1. Filtrer le formulaire par Pôle d'Activité :
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setEntrySectorFilter('ALL')}
                className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all cursor-pointer text-center ${
                  entrySectorFilter === 'ALL'
                    ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                    : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                🌐 Tous
              </button>
              <button
                type="button"
                onClick={() => {
                  setEntrySectorFilter('ALIMENTATION_PATISSERIE');
                  const firstAlim = stockList.find(i => getItemSector(i) === 'ALIMENTATION_PATISSERIE');
                  if (firstAlim) setSelectedProductRef(firstAlim.reference);
                }}
                className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all cursor-pointer text-center ${
                  entrySectorFilter === 'ALIMENTATION_PATISSERIE'
                    ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                    : 'bg-white text-amber-900 border-amber-200 hover:bg-amber-50'
                }`}
              >
                🥐 Alimentation & Pâtisserie
              </button>
              <button
                type="button"
                onClick={() => {
                  setEntrySectorFilter('TECHNIQUE_INDUSTRIEL');
                  const firstTech = stockList.find(i => getItemSector(i) === 'TECHNIQUE_INDUSTRIEL');
                  if (firstTech) setSelectedProductRef(firstTech.reference);
                }}
                className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all cursor-pointer text-center ${
                  entrySectorFilter === 'TECHNIQUE_INDUSTRIEL'
                    ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                    : 'bg-white text-blue-900 border-blue-200 hover:bg-blue-50'
                }`}
              >
                ⚡ Électronique & Mécanique
              </button>
            </div>
          </div>

          {successMessage && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
              <span className="font-bold">✓</span>
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleCreateSale} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Date de la vente</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="date"
                    value={saleDate}
                    onChange={(e) => setSaleDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:ring-2 focus:ring-stone-400 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Mois de rattachement</label>
                <select
                  value={saleMonth}
                  onChange={(e) => setSaleMonth(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:ring-2 focus:ring-stone-400 focus:outline-none cursor-pointer"
                >
                  {MOIS_LIST.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Product selection with optgroups and clear pole badge */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-stone-700">
                  2. Sélectionner l'article à vendre
                </label>
                {currentStockItem && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${sectorInfo.badgeClass}`}>
                    {sectorInfo.icon} {sectorInfo.label}
                  </span>
                )}
              </div>
              <select
                value={selectedProductRef}
                onChange={(e) => setSelectedProductRef(e.target.value)}
                className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 font-medium focus:ring-2 focus:ring-stone-400 focus:outline-none cursor-pointer"
              >
                {entrySectorFilter === 'ALL' ? (
                  <>
                    <optgroup label="🥐 ALIMENTATION DIVERS & PÂTISSERIE">
                      {stockList
                        .filter(i => getItemSector(i) === 'ALIMENTATION_PATISSERIE')
                        .map(item => {
                          const sFinal = getStockFinal(item);
                          return (
                            <option key={item.id} value={item.reference}>
                              [Alim] {item.reference} — {item.designation} (Dispo : {sFinal} {item.unit})
                            </option>
                          );
                        })}
                    </optgroup>
                    <optgroup label="⚡ ÉLECTRONIQUE, MÉCANIQUE & ÉLECTRICITÉ">
                      {stockList
                        .filter(i => getItemSector(i) === 'TECHNIQUE_INDUSTRIEL')
                        .map(item => {
                          const sFinal = getStockFinal(item);
                          return (
                            <option key={item.id} value={item.reference}>
                              [Technique] {item.reference} — {item.designation} (Dispo : {sFinal} {item.unit})
                            </option>
                          );
                        })}
                    </optgroup>
                  </>
                ) : (
                  entryStockItems.map(item => {
                    const sFinal = getStockFinal(item);
                    return (
                      <option key={item.id} value={item.reference}>
                        {item.reference} — {item.designation} (Dispo : {sFinal} {item.unit})
                      </option>
                    );
                  })
                )}
              </select>
            </div>

            {/* Current Item Specs Callout */}
            {currentStockItem && (
              <div className={`p-3.5 rounded-2xl border grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs ${
                currentItemSector === 'ALIMENTATION_PATISSERIE' 
                  ? 'bg-amber-50/50 border-amber-200' 
                  : 'bg-blue-50/50 border-blue-200'
              }`}>
                <div>
                  <span className="text-stone-500 block text-[11px]">Stock Disponible</span>
                  <span className={`font-mono font-bold ${stockDispo <= currentStockItem.stockCritique ? 'text-rose-600' : 'text-emerald-700'}`}>
                    {stockDispo} {currentStockItem.unit}
                  </span>
                </div>
                <div>
                  <span className="text-stone-500 block text-[11px]">Prix Public Unit.</span>
                  <span className="font-mono font-bold text-stone-900">
                    {unitPrice.toLocaleString('fr-FR')} F
                  </span>
                </div>
                <div>
                  <span className="text-stone-500 block text-[11px]">Coût de Revient</span>
                  <span className="font-mono text-stone-600">
                    {costPrice.toLocaleString('fr-FR')} F
                  </span>
                </div>
                <div>
                  <span className="text-stone-500 block text-[11px]">Marge Réelle/U</span>
                  <span className="font-mono font-bold text-emerald-700">
                    +{(unitPrice - costPrice).toLocaleString('fr-FR')} F
                  </span>
                </div>
              </div>
            )}

            {/* Quantity and Discount */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Quantité vendue ({currentStockItem?.unit || 'u.'})
                </label>
                <input
                  type="number"
                  min="1"
                  max={stockDispo > 0 ? stockDispo : 1}
                  value={qtySold}
                  onChange={(e) => setQtySold(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full p-2.5 font-mono bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold text-stone-900 focus:ring-2 focus:ring-stone-400 focus:outline-none"
                  required
                />
                {qtySold > stockDispo && (
                  <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3" />
                    Attention : Dépassement du stock disponible ({stockDispo}) !
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Remise accordée par unité (FCFA)
                </label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={discountPerUnit}
                  onChange={(e) => setDiscountPerUnit(Math.max(0, parseInt(e.target.value) || 0))}
                  placeholder="0"
                  className="w-full p-2.5 font-mono bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 focus:ring-2 focus:ring-stone-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Real-time Calculation Card */}
            <div className="p-4 bg-gradient-to-br from-stone-900 via-stone-850 to-stone-900 text-white rounded-2xl shadow-sm border border-stone-800 relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] uppercase tracking-wider text-stone-300 font-bold flex items-center gap-1.5">
                  <span>💰</span>
                  <span>Calcul Immédiat de la Recette & Marge</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-800 text-stone-300">
                  {sectorInfo.label}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-stone-400">Prix de Vente Total (CA) :</span>
                  <div className="text-xl font-black text-amber-300 font-mono">
                    {formatFCFA(totalSalesPrice)}
                  </div>
                  <span className="text-[10px] text-stone-400">
                    ({effectiveUnitPrice.toLocaleString('fr-FR')} F × {qtySold})
                  </span>
                </div>
                <div>
                  <span className="text-xs text-stone-400">Bénéfice Réel :</span>
                  <div className={`text-xl font-black font-mono ${estimatedProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {formatFCFA(estimatedProfit)}
                  </div>
                  <span className="text-[10px] text-stone-400">
                    (Vente - {costPrice.toLocaleString('fr-FR')} F × {qtySold})
                  </span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={stockDispo <= 0 || qtySold > stockDispo}
              className={`w-full py-3 px-4 rounded-xl text-xs font-bold text-white shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer ${
                stockDispo <= 0 || qtySold > stockDispo
                  ? 'bg-stone-400 cursor-not-allowed'
                  : 'bg-stone-900 hover:bg-stone-800 shadow-stone-300'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Valider la Vente et Déstocker</span>
            </button>
          </form>
        </div>

        {/* Monthly Summary Table (5 cols) with Dual Sector View */}
        <div className="lg:col-span-5 bg-white p-5 rounded-3xl border border-stone-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-3">
              <div>
                <h2 className="text-base font-bold text-stone-900 flex items-center gap-1.5">
                  <span>Chiffre d'Affaires Mensuel par Pôle</span>
                </h2>
                <p className="text-[11px] text-stone-500">Comparaison détaillée Alimentation vs Technique</p>
              </div>
              <div className="w-8 h-8 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center shadow-xs">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
            </div>

            {/* View Mode Selector for Monthly Table */}
            <div className="flex gap-1 p-1 bg-stone-100 rounded-xl mb-3 text-[11px]">
              <button
                onClick={() => setSummaryViewMode('COMPARE')}
                className={`flex-1 py-1 px-2 rounded-lg font-bold transition-all cursor-pointer ${
                  summaryViewMode === 'COMPARE' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                ⚖️ Comparatif 2 Pôles
              </button>
              <button
                onClick={() => setSummaryViewMode('ALIMENTATION_PATISSERIE')}
                className={`flex-1 py-1 px-2 rounded-lg font-bold transition-all cursor-pointer ${
                  summaryViewMode === 'ALIMENTATION_PATISSERIE' ? 'bg-amber-500 text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                🥐 Alim.
              </button>
              <button
                onClick={() => setSummaryViewMode('TECHNIQUE_INDUSTRIEL')}
                className={`flex-1 py-1 px-2 rounded-lg font-bold transition-all cursor-pointer ${
                  summaryViewMode === 'TECHNIQUE_INDUSTRIEL' ? 'bg-blue-600 text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                ⚡ Tech.
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-stone-200">
              <table className="w-full text-xs text-left">
                <thead>
                  {summaryViewMode === 'COMPARE' ? (
                    <tr className="bg-stone-100 text-stone-700 font-bold border-b border-stone-200">
                      <th className="py-2 px-2.5">Mois</th>
                      <th className="py-2 px-2 text-right text-amber-900">CA Alim/Pâtiss.</th>
                      <th className="py-2 px-2 text-right text-blue-900">CA Tech/Méc.</th>
                      <th className="py-2 px-2.5 text-right font-black text-stone-900">Total CA</th>
                    </tr>
                  ) : (
                    <tr className="bg-stone-100 text-stone-700 font-bold border-b border-stone-200">
                      <th className="py-2 px-3">Mois</th>
                      <th className="py-2 px-3 text-right">CA (FCFA)</th>
                      <th className="py-2 px-3 text-right text-emerald-800">Profit / Bénéfice</th>
                    </tr>
                  )}
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-700">
                  {monthlySummary.map((item) => {
                    if (summaryViewMode === 'COMPARE') {
                      const hasSales = item.caTotal > 0;
                      return (
                        <tr 
                          key={item.mois}
                          className={`hover:bg-stone-50 transition-colors ${
                            hasSales ? 'bg-stone-50/50 font-medium' : ''
                          }`}
                        >
                          <td className="py-1.5 px-2.5 font-semibold text-stone-800">{item.mois}</td>
                          <td className="py-1.5 px-2 text-right font-mono text-amber-900 font-bold">
                            {item.caAlim > 0 ? item.caAlim.toLocaleString('fr-FR') : '-'}
                          </td>
                          <td className="py-1.5 px-2 text-right font-mono text-blue-900 font-bold">
                            {item.caTech > 0 ? item.caTech.toLocaleString('fr-FR') : '-'}
                          </td>
                          <td className="py-1.5 px-2.5 text-right font-mono font-extrabold text-stone-900">
                            {item.caTotal > 0 ? item.caTotal.toLocaleString('fr-FR') : '-'}
                          </td>
                        </tr>
                      );
                    } else if (summaryViewMode === 'ALIMENTATION_PATISSERIE') {
                      return (
                        <tr key={item.mois} className={`hover:bg-amber-50/30 ${item.caAlim > 0 ? 'bg-amber-50/20 font-medium' : ''}`}>
                          <td className="py-1.5 px-3 font-semibold text-stone-800">{item.mois}</td>
                          <td className="py-1.5 px-3 text-right font-mono font-bold text-amber-900">
                            {item.caAlim > 0 ? item.caAlim.toLocaleString('fr-FR') : '0'}
                          </td>
                          <td className="py-1.5 px-3 text-right font-mono font-bold text-emerald-700">
                            {item.profitAlim > 0 ? item.profitAlim.toLocaleString('fr-FR') : '0'}
                          </td>
                        </tr>
                      );
                    } else {
                      return (
                        <tr key={item.mois} className={`hover:bg-blue-50/30 ${item.caTech > 0 ? 'bg-blue-50/20 font-medium' : ''}`}>
                          <td className="py-1.5 px-3 font-semibold text-stone-800">{item.mois}</td>
                          <td className="py-1.5 px-3 text-right font-mono font-bold text-blue-900">
                            {item.caTech > 0 ? item.caTech.toLocaleString('fr-FR') : '0'}
                          </td>
                          <td className="py-1.5 px-3 text-right font-mono font-bold text-emerald-700">
                            {item.profitTech > 0 ? item.profitTech.toLocaleString('fr-FR') : '0'}
                          </td>
                        </tr>
                      );
                    }
                  })}
                </tbody>
                <tfoot>
                  {summaryViewMode === 'COMPARE' ? (
                    <tr className="bg-stone-900 text-white font-extrabold border-t-2 border-stone-700 text-[11px]">
                      <td className="py-2.5 px-2.5 uppercase tracking-wider text-amber-300">TOTAL</td>
                      <td className="py-2.5 px-2 text-right font-mono text-amber-300">{alimCA.toLocaleString('fr-FR')} F</td>
                      <td className="py-2.5 px-2 text-right font-mono text-blue-300">{techCA.toLocaleString('fr-FR')} F</td>
                      <td className="py-2.5 px-2.5 text-right font-mono text-white font-black">{totalGeneralCA.toLocaleString('fr-FR')} F</td>
                    </tr>
                  ) : summaryViewMode === 'ALIMENTATION_PATISSERIE' ? (
                    <tr className="bg-amber-900 text-white font-extrabold border-t-2 border-amber-700 text-xs">
                      <td className="py-2.5 px-3 uppercase tracking-wider text-amber-200">TOTAL ALIMENTATION</td>
                      <td className="py-2.5 px-3 text-right font-mono">{alimCA.toLocaleString('fr-FR')} F</td>
                      <td className="py-2.5 px-3 text-right font-mono text-emerald-300">{alimProfit.toLocaleString('fr-FR')} F</td>
                    </tr>
                  ) : (
                    <tr className="bg-blue-900 text-white font-extrabold border-t-2 border-blue-700 text-xs">
                      <td className="py-2.5 px-3 uppercase tracking-wider text-blue-200">TOTAL TECHNIQUE</td>
                      <td className="py-2.5 px-3 text-right font-mono">{techCA.toLocaleString('fr-FR')} F</td>
                      <td className="py-2.5 px-3 text-right font-mono text-emerald-300">{techProfit.toLocaleString('fr-FR')} F</td>
                    </tr>
                  )}
                </tfoot>
              </table>
            </div>
          </div>

          <div className="mt-4 p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between text-xs">
            <span className="text-stone-600 font-medium">Bénéfice Net Total Réalisé :</span>
            <span className="font-mono font-black text-emerald-700 text-sm">
              +{formatFCFA(totalGeneralProfit)} ({totalGeneralCA > 0 ? Math.round((totalGeneralProfit / totalGeneralCA) * 100) : 0}%)
            </span>
          </div>
        </div>

      </div>

      {/* Sales History Register with Sector Filter */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-stone-200 flex flex-col md:flex-row items-center justify-between gap-3 bg-stone-50/50">
          <div>
            <h3 className="text-sm font-bold text-stone-900">Journal Chronologique des Ventes</h3>
            <p className="text-xs text-stone-500">Traçabilité complète avec indication distincte du Pôle d'Activité</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Sector filter tabs */}
            <div className="flex items-center gap-1 bg-stone-200/70 p-1 rounded-xl text-xs">
              <button
                onClick={() => setJournalSectorFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  journalSectorFilter === 'ALL' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Tous les Pôles
              </button>
              <button
                onClick={() => setJournalSectorFilter('ALIMENTATION_PATISSERIE')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  journalSectorFilter === 'ALIMENTATION_PATISSERIE' ? 'bg-amber-500 text-white shadow-xs' : 'text-stone-600 hover:text-amber-900'
                }`}
              >
                🥐 Alimentation & Pâtiss.
              </button>
              <button
                onClick={() => setJournalSectorFilter('TECHNIQUE_INDUSTRIEL')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  journalSectorFilter === 'TECHNIQUE_INDUSTRIEL' ? 'bg-blue-600 text-white shadow-xs' : 'text-stone-600 hover:text-blue-900'
                }`}
              >
                ⚡ Tech. & Méc.
              </button>
            </div>

            <div className="relative w-full md:w-48">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filtrer article..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-stone-500"
              />
            </div>

            <select
              value={selectedFilterMonth}
              onChange={(e) => setSelectedFilterMonth(e.target.value)}
              className="text-xs px-2.5 py-1.5 bg-white border border-stone-200 rounded-xl text-stone-700 focus:outline-none focus:ring-1 focus:ring-stone-500 cursor-pointer"
            >
              <option value="TOUS">Tous les mois</option>
              {MOIS_LIST.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-stone-100 text-stone-700 font-bold border-b border-stone-200">
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-2">Mois</th>
                <th className="py-3 px-2.5">Pôle</th>
                <th className="py-3 px-3">Référence</th>
                <th className="py-3 px-3">Désignation</th>
                <th className="py-3 px-2">Catégorie</th>
                <th className="py-3 px-2 text-center">Unité</th>
                <th className="py-3 px-2 text-center font-extrabold text-stone-900 bg-stone-200/50">Qte</th>
                <th className="py-3 px-3 text-right">Prix Unit.</th>
                <th className="py-3 px-3 text-right font-bold text-stone-900 bg-amber-50/40">CA Vente</th>
                <th className="py-3 px-3 text-right font-black text-emerald-700 bg-emerald-50/60">Bénéfice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 text-stone-700">
              {filteredSales.map((sale) => {
                const sec = getItemSector(sale);
                const sConf = SECTOR_CONFIG[sec];
                return (
                  <tr key={sale.id} className="hover:bg-stone-50 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-stone-600 whitespace-nowrap">{sale.date}</td>
                    <td className="py-2.5 px-2 font-medium capitalize text-stone-700">{sale.mois}</td>
                    <td className="py-2.5 px-2.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${sConf.badgeClass}`}>
                        {sConf.icon} {sConf.shortLabel}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-stone-900 whitespace-nowrap">{sale.reference}</td>
                    <td className="py-2.5 px-3 font-medium text-stone-800">{sale.designation}</td>
                    <td className="py-2.5 px-2 text-stone-500">{sale.category}</td>
                    <td className="py-2.5 px-2 text-center text-stone-600">{sale.unit}</td>
                    <td className="py-2.5 px-2 text-center font-mono font-black text-stone-900 bg-stone-100">
                      {sale.quantiteVendue}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-stone-700">
                      {sale.prixVenteUnitaire.toLocaleString('fr-FR')} F
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-stone-900 bg-amber-50/20">
                      {sale.prixVenteTotal.toLocaleString('fr-FR')} F
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-black text-emerald-700 bg-emerald-50/40">
                      +{sale.benefice.toLocaleString('fr-FR')} F
                    </td>
                  </tr>
                );
              })}

              {filteredSales.length === 0 && (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-stone-400">
                    Aucune vente enregistrée pour ce filtre.
                  </td>
                </tr>
              )}
            </tbody>
            {filteredSales.length > 0 && (
              <tfoot>
                <tr className="bg-stone-900 text-white font-bold">
                  <td colSpan={7} className="py-3 px-3 text-right text-xs uppercase tracking-wider text-stone-400">
                    Sous-Total filtré ({filteredSales.length} lignes) :
                  </td>
                  <td className="py-3 px-2 text-center font-mono font-black text-amber-400">
                    {filteredSales.reduce((acc, s) => acc + s.quantiteVendue, 0)} u.
                  </td>
                  <td></td>
                  <td className="py-3 px-3 text-right font-mono font-black text-white">
                    {formatFCFA(filteredSales.reduce((acc, s) => acc + s.prixVenteTotal, 0))}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-black text-emerald-300">
                    +{formatFCFA(filteredSales.reduce((acc, s) => acc + s.benefice, 0))}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};
