import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  PlusCircle, 
  MinusCircle, 
  Download, 
  X, 
  TrendingUp, 
  FileSpreadsheet, 
  Filter, 
  ArrowRight,
  Sparkles,
  RotateCcw,
  Edit3
} from 'lucide-react';
import { 
  StockItem, 
  getStockFinal, 
  getCoutRevient, 
  getValeurStock, 
  isAlerteStock, 
  formatFCFA,
  getItemSector,
  SECTOR_CONFIG,
  SectorType
} from '../data/initialData';

export type StockStatusFilter = 'ALL' | 'CRITIQUE' | 'OK' | 'ENTREES' | 'SORTIES' | 'VENTES';

interface StockModuleProps {
  stockList: StockItem[];
  onUpdateStockItem: (item: StockItem) => void;
  onAddStockMovement: (reference: string, type: 'ENTREE' | 'SORTIE', qty: number, motif: string) => void;
  categories: string[];
  initialStatusFilter?: StockStatusFilter;
  onStatusFilterChange?: (filter: StockStatusFilter) => void;
  onClearSectorNumbers?: (sector: SectorType) => void;
}

export const StockModule: React.FC<StockModuleProps> = ({
  stockList,
  onUpdateStockItem,
  onAddStockMovement,
  categories,
  initialStatusFilter = 'ALL',
  onStatusFilterChange,
  onClearSectorNumbers
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('TOUTES');
  const [selectedSector, setSelectedSector] = useState<'ALL' | SectorType>('ALL');
  const [statusFilter, setStatusFilter] = useState<StockStatusFilter>(initialStatusFilter);

  // Sync with initialStatusFilter when triggered from parent (Navbar, Accueil, or BI Dashboards)
  useEffect(() => {
    if (initialStatusFilter) {
      setStatusFilter(initialStatusFilter);
      if (initialStatusFilter === 'CRITIQUE') {
        setSelectedCategory('TOUTES');
        setSearchTerm('');
        setSelectedSector('ALL');
      }
    }
  }, [initialStatusFilter]);

  // Modal movement state
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [movementType, setMovementType] = useState<'ENTREE' | 'SORTIE'>('ENTREE');
  const [selectedItemRef, setSelectedItemRef] = useState<string>('');
  const [movementQty, setMovementQty] = useState<number>(1);
  const [movementMotif, setMovementMotif] = useState<string>('');

  // Edit stock item state (for filling in real numbers)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);
  const [editDesignation, setEditDesignation] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editUnit, setEditUnit] = useState('Pce');
  const [editStockCritique, setEditStockCritique] = useState(0);
  const [editStockInitial, setEditStockInitial] = useState(0);
  const [editEntrees, setEditEntrees] = useState(0);
  const [editSorties, setEditSorties] = useState(0);
  const [editPrixAchat, setEditPrixAchat] = useState(0);
  const [editMargeFrais, setEditMargeFrais] = useState(0);

  const handleOpenEditModal = (item: StockItem) => {
    setEditingItem(item);
    setEditDesignation(item.designation);
    setEditCategory(item.category);
    setEditUnit(item.unit);
    setEditStockCritique(item.stockCritique);
    setEditStockInitial(item.stockInitial);
    setEditEntrees(item.entrees);
    setEditSorties(item.sorties);
    setEditPrixAchat(item.prixAchat);
    setEditMargeFrais(item.margeFrais);
    setIsEditModalOpen(true);
  };

  const handleSaveEditItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    const updated: StockItem = {
      ...editingItem,
      designation: editDesignation.trim(),
      category: editCategory,
      unit: editUnit,
      stockCritique: Math.max(0, Number(editStockCritique) || 0),
      stockInitial: Math.max(0, Number(editStockInitial) || 0),
      entrees: Math.max(0, Number(editEntrees) || 0),
      sorties: Math.max(0, Number(editSorties) || 0),
      prixAchat: Math.max(0, Number(editPrixAchat) || 0),
      margeFrais: Math.max(0, Number(editMargeFrais) || 0)
    };

    onUpdateStockItem(updated);
    setIsEditModalOpen(false);
    setEditingItem(null);
  };

  const handleConfirmClearAlim = () => {
    if (window.confirm("Êtes-vous sûr de vouloir remettre à 0 tous les chiffres d'Alimentation, Divers et Pâtisserie pour saisir vos données réelles ?")) {
      if (onClearSectorNumbers) {
        onClearSectorNumbers('ALIMENTATION_PATISSERIE');
      }
    }
  };

  // Calculations across the stock list (mirroring Excel =SUM(O9:O2170))
  const totalValeurStock = stockList.reduce((acc, item) => acc + getValeurStock(item), 0);
  const totalEntrees = stockList.reduce((acc, item) => acc + item.entrees, 0);
  const totalSorties = stockList.reduce((acc, item) => acc + item.sorties, 0);
  const totalVentes = stockList.reduce((acc, item) => acc + item.vente, 0);
  
  const itemsEnAlerte = stockList.filter(isAlerteStock);
  const itemsNormaux = stockList.filter(item => !isAlerteStock(item));
  const itemsWithEntrees = stockList.filter(item => item.entrees > 0);
  const itemsWithSorties = stockList.filter(item => item.sorties > 0);
  const itemsWithVentes = stockList.filter(item => item.vente > 0);

  const alimItems = stockList.filter(item => getItemSector(item) === 'ALIMENTATION_PATISSERIE');
  const techItems = stockList.filter(item => getItemSector(item) === 'TECHNIQUE_INDUSTRIEL');

  const handleFilterSelect = (newFilter: StockStatusFilter, resetOtherFilters: boolean = false) => {
    setStatusFilter(newFilter);
    if (onStatusFilterChange) {
      onStatusFilterChange(newFilter);
    }
    if (resetOtherFilters) {
      setSelectedCategory('TOUTES');
      setSearchTerm('');
      setSelectedSector('ALL');
    }
  };

  const handleResetFilters = () => {
    setStatusFilter('ALL');
    setSelectedCategory('TOUTES');
    setSelectedSector('ALL');
    setSearchTerm('');
    if (onStatusFilterChange) {
      onStatusFilterChange('ALL');
    }
  };

  // Filtered rows based on search, category, sector, and status filter
  const filteredItems = stockList.filter(item => {
    const matchesSearch = 
      !searchTerm.trim() ||
      item.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSector = 
      selectedSector === 'ALL' || getItemSector(item) === selectedSector;

    const matchesCategory = selectedCategory === 'TOUTES' || item.category === selectedCategory;
    
    const isCritical = isAlerteStock(item);
    const matchesStatus = 
      statusFilter === 'ALL' ||
      (statusFilter === 'CRITIQUE' && isCritical) ||
      (statusFilter === 'OK' && !isCritical) ||
      (statusFilter === 'ENTREES' && item.entrees > 0) ||
      (statusFilter === 'SORTIES' && item.sorties > 0) ||
      (statusFilter === 'VENTES' && item.vente > 0);

    return matchesSearch && matchesSector && matchesCategory && matchesStatus;
  });

  const handleOpenMovementModal = (type: 'ENTREE' | 'SORTIE', itemRef?: string) => {
    setMovementType(type);
    setSelectedItemRef(itemRef || (stockList[0]?.reference || ''));
    setMovementQty(1);
    setMovementMotif(type === 'ENTREE' ? 'Réception fournisseur' : 'Ajustement inventaire / Casse');
    setIsMovementModalOpen(true);
  };

  const handleSaveMovement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemRef || movementQty <= 0) return;

    onAddStockMovement(selectedItemRef, movementType, movementQty, movementMotif);
    setIsMovementModalOpen(false);
  };

  const exportToCSV = () => {
    const headers = [
      '#', 'Référence', 'Désignation', 'Catégorie', 'Unité', 'Stock Critique',
      'Stock Initial', 'Entrées', 'Sorties', 'Vente', 'Stock Final',
      'Prix Achat Unitaire', 'Marge Frais', 'Coût Revient Unitaire', 'Valeur Totale Stock', 'Statut'
    ];

    const rows = stockList.map((item, index) => {
      const stockFinal = getStockFinal(item);
      const coutRevient = getCoutRevient(item);
      const valeurStock = getValeurStock(item);
      const statut = isAlerteStock(item) ? 'Besoin approvisionnement' : 'Bon niveau';

      return [
        index + 1,
        `"${item.reference}"`,
        `"${item.designation.replace(/"/g, '""')}"`,
        `"${item.category}"`,
        item.unit,
        item.stockCritique,
        item.stockInitial,
        item.entrees,
        item.sorties,
        item.vente,
        stockFinal,
        item.prixAchat,
        item.margeFrais,
        coutRevient,
        valeurStock,
        `"${statut}"`
      ].join(';');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Inventaire_Stock_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header with Title & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-rose-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-stone-900 flex items-center gap-2">
              <span>Inventaire du Stock & Chambre Froide</span>
              <span>🥝</span>
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold font-mono">
              Stock Délices
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Gestion fine des yaourts, coulis et douceurs : Stock Final = Initial + Entrées - Sorties - Ventes
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onClearSectorNumbers && (
            <button
              onClick={handleConfirmClearAlim}
              className="flex items-center gap-1.5 px-3 py-2 bg-stone-100 hover:bg-rose-50 text-stone-700 hover:text-rose-700 text-xs font-bold rounded-xl border border-stone-200 hover:border-rose-200 transition-all cursor-pointer"
              title="Remettre à 0 tous les chiffres d'Alimentation, Divers et Pâtisserie"
            >
              <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
              <span>Remettre à 0 Alimentation</span>
            </button>
          )}

          <button
            onClick={() => handleOpenMovementModal('ENTREE')}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Entrée Stock (+)</span>
          </button>

          <button
            onClick={() => handleOpenMovementModal('SORTIE')}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <MinusCircle className="w-4 h-4" />
            <span>Sortie Stock (-)</span>
          </button>

          <button
            onClick={exportToCSV}
            className="flex items-center gap-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-rose-600" />
            <span>Exporter CSV</span>
          </button>
        </div>
      </div>

      {/* Top Banner KPI matching Cell O3 in Excel - Fully Interactive Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Value */}
        <div 
          onClick={() => handleFilterSelect('ALL', true)}
          className={`p-5 rounded-3xl shadow-sm border relative overflow-hidden transition-all cursor-pointer hover:shadow-md hover:scale-[1.01] active:scale-98 ${
            statusFilter === 'ALL' && selectedCategory === 'TOUTES' && selectedSector === 'ALL' && !searchTerm
              ? 'bg-gradient-to-br from-emerald-900 via-teal-950 to-stone-900 text-white border-emerald-500 ring-2 ring-emerald-400/60'
              : 'bg-gradient-to-br from-emerald-950 via-teal-950 to-stone-900 text-white border-emerald-800/40 opacity-95 hover:opacity-100'
          }`}
          title="Cliquer pour afficher tous les articles et leur valeur"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
              <span>🥝</span> Valeur Totale Stock [O3]
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Tous ({stockList.length})
            </span>
          </div>
          <div className="text-2xl font-black mt-1 text-white">{formatFCFA(totalValeurStock)}</div>
          <div className="text-xs text-emerald-200/80 mt-1 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>=SUM(O9:O2170)</span>
            </span>
            <span className="text-[11px] font-semibold text-emerald-300 underline">Afficher tout ({stockList.length}) →</span>
          </div>
        </div>

        {/* Card 2: Total Items */}
        <div 
          onClick={() => handleFilterSelect('ALL', true)}
          className={`p-5 rounded-3xl border shadow-sm transition-all cursor-pointer hover:shadow-md hover:scale-[1.01] active:scale-98 ${
            statusFilter === 'ALL' && selectedCategory === 'TOUTES' && selectedSector === 'ALL' && !searchTerm
              ? 'bg-violet-50/80 border-violet-500 ring-2 ring-violet-300'
              : 'bg-white border-violet-100 hover:border-violet-300'
          }`}
          title="Cliquer pour afficher l'ensemble des articles"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-violet-600 flex items-center gap-1">
              <span>🫐</span> Total Articles Référencés
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              statusFilter === 'ALL' ? 'bg-violet-600 text-white' : 'bg-violet-100 text-violet-700'
            }`}>
              {statusFilter === 'ALL' ? 'Actif' : 'Cliquer'}
            </span>
          </div>
          <div className="text-2xl font-black text-stone-900 mt-1">{stockList.length} articles</div>
          <div className="text-xs text-stone-500 mt-1 flex items-center justify-between">
            <span>Catalogue complet</span>
            <span className="text-[11px] font-bold text-violet-700 underline">Voir les {stockList.length} →</span>
          </div>
        </div>

        {/* Card 3: Alertes Rupture - DIRECT USER ACTION */}
        <div 
          onClick={() => handleFilterSelect('CRITIQUE', true)}
          className={`p-5 rounded-3xl border shadow-sm transition-all cursor-pointer hover:shadow-md hover:scale-[1.01] active:scale-98 ${
            statusFilter === 'CRITIQUE'
              ? 'bg-rose-50 border-rose-500 ring-2 ring-rose-400 shadow-rose-100'
              : 'bg-white border-rose-200 hover:border-rose-400 hover:bg-rose-50/40'
          }`}
          title="Cliquer pour afficher directement les 4 produits en alerte critique"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1">
              <span>🍓</span> Alertes Rupture
            </span>
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
              statusFilter === 'CRITIQUE'
                ? 'bg-rose-600 text-white animate-pulse'
                : 'bg-rose-100 text-rose-700 border border-rose-200'
            }`}>
              <AlertTriangle className="w-3 h-3" />
              {statusFilter === 'CRITIQUE' ? 'Filtre Actif' : 'Cliquer pour filtrer'}
            </span>
          </div>
          <div className="text-2xl font-black mt-1 text-rose-600 flex items-center gap-2">
            <span>{itemsEnAlerte.length} en alerte</span>
            {statusFilter === 'CRITIQUE' && (
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-rose-600 text-white rounded-full">
                {itemsEnAlerte.length} affichés
              </span>
            )}
          </div>
          <div className="text-xs text-rose-700 font-medium mt-1 flex items-center justify-between">
            <span>Stock Final ≤ Stock Critique</span>
            <span className="text-[11px] font-bold text-rose-700 underline">
              {statusFilter === 'CRITIQUE' ? `✓ ${itemsEnAlerte.length} produits filtrés` : `Afficher les ${itemsEnAlerte.length} produits →`}
            </span>
          </div>
        </div>

        {/* Card 4: Flux Délices Cumulés */}
        <div className="bg-white p-5 rounded-3xl border border-amber-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 flex items-center gap-1">
              <span>🥭</span> Flux Délices Cumulés
            </span>
            <span className="text-[10px] text-stone-400">Filtrer par :</span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 mt-2">
            <button
              type="button"
              onClick={() => handleFilterSelect('ENTREES', true)}
              className={`px-2 py-1.5 rounded-xl text-left transition-all cursor-pointer border ${
                statusFilter === 'ENTREES'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs ring-1 ring-emerald-400'
                  : 'bg-emerald-50/70 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
              }`}
              title="Cliquer pour afficher uniquement les produits ayant des entrées"
            >
              <div className="text-[10px] font-semibold opacity-90">Entrées</div>
              <div className="text-xs font-black">+{totalEntrees}</div>
              <div className="text-[9px] opacity-75">{itemsWithEntrees.length} art.</div>
            </button>

            <button
              type="button"
              onClick={() => handleFilterSelect('SORTIES', true)}
              className={`px-2 py-1.5 rounded-xl text-left transition-all cursor-pointer border ${
                statusFilter === 'SORTIES'
                  ? 'bg-amber-600 text-white border-amber-600 shadow-xs ring-1 ring-amber-400'
                  : 'bg-amber-50/70 hover:bg-amber-100 text-amber-800 border-amber-200'
              }`}
              title="Cliquer pour afficher uniquement les produits ayant des sorties"
            >
              <div className="text-[10px] font-semibold opacity-90">Sorties</div>
              <div className="text-xs font-black">-{totalSorties}</div>
              <div className="text-[9px] opacity-75">{itemsWithSorties.length} art.</div>
            </button>

            <button
              type="button"
              onClick={() => handleFilterSelect('VENTES', true)}
              className={`px-2 py-1.5 rounded-xl text-left transition-all cursor-pointer border ${
                statusFilter === 'VENTES'
                  ? 'bg-rose-600 text-white border-rose-600 shadow-xs ring-1 ring-rose-400'
                  : 'bg-rose-50/70 hover:bg-rose-100 text-rose-800 border-rose-200'
              }`}
              title="Cliquer pour afficher uniquement les produits vendus"
            >
              <div className="text-[10px] font-semibold opacity-90">Ventes</div>
              <div className="text-xs font-black">{totalVentes}</div>
              <div className="text-[9px] opacity-75">{itemsWithVentes.length} art.</div>
            </button>
          </div>

          <div className="text-xs text-stone-400 mt-2 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
              <span>Mouvements de stock</span>
            </span>
            {(statusFilter !== 'ALL' || selectedCategory !== 'TOUTES' || selectedSector !== 'ALL' || searchTerm) && (
              <button 
                type="button"
                onClick={handleResetFilters}
                className="text-[10px] font-bold text-amber-700 underline cursor-pointer hover:text-amber-900 flex items-center gap-1"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                <span>Tout afficher</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Control Bar: Dual-Sector Tabs + Quick Filters + Search & Category */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-sm space-y-3.5">
        
        {/* Row 1: Dual-Sector Switcher Tabs */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider mr-1">
              Pôle d'activité :
            </span>
            <button
              onClick={() => setSelectedSector('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedSector === 'ALL'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              <span>🌐</span>
              <span>Tous les Pôles</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
                {stockList.length}
              </span>
            </button>

            <button
              onClick={() => setSelectedSector('ALIMENTATION_PATISSERIE')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                selectedSector === 'ALIMENTATION_PATISSERIE'
                  ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                  : 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
              }`}
            >
              <span>{SECTOR_CONFIG.ALIMENTATION_PATISSERIE.icon}</span>
              <span>{SECTOR_CONFIG.ALIMENTATION_PATISSERIE.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                selectedSector === 'ALIMENTATION_PATISSERIE' ? 'bg-white/25 text-white' : 'bg-amber-200 text-amber-900'
              }`}>
                {alimItems.length}
              </span>
            </button>

            <button
              onClick={() => setSelectedSector('TECHNIQUE_INDUSTRIEL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                selectedSector === 'TECHNIQUE_INDUSTRIEL'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-blue-50 text-blue-900 border-blue-200 hover:bg-blue-100'
              }`}
            >
              <span>{SECTOR_CONFIG.TECHNIQUE_INDUSTRIEL.icon}</span>
              <span>{SECTOR_CONFIG.TECHNIQUE_INDUSTRIEL.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                selectedSector === 'TECHNIQUE_INDUSTRIEL' ? 'bg-white/25 text-white' : 'bg-blue-200 text-blue-900'
              }`}>
                {techItems.length}
              </span>
            </button>
          </div>

          {(statusFilter !== 'ALL' || selectedCategory !== 'TOUTES' || selectedSector !== 'ALL' || searchTerm) && (
            <button
              onClick={handleResetFilters}
              className="text-xs text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1 underline cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Réinitialiser tous les filtres</span>
            </button>
          )}
        </div>

        {/* Row 2: Quick Status Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider shrink-0 mr-1">
            Filtre Statut :
          </span>

          <button
            type="button"
            onClick={() => handleFilterSelect('ALL')}
            className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              statusFilter === 'ALL'
                ? 'bg-stone-800 text-white shadow-xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            Tous les articles ({stockList.length})
          </button>

          <button
            type="button"
            onClick={() => handleFilterSelect('CRITIQUE', true)}
            className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 border ${
              statusFilter === 'CRITIQUE'
                ? 'bg-rose-600 text-white border-rose-600 shadow-xs ring-2 ring-rose-300'
                : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
            }`}
            title="Cliquer pour afficher les 4 produits en alerte"
          >
            <AlertTriangle className={`w-3.5 h-3.5 ${statusFilter === 'CRITIQUE' ? 'text-white' : 'text-rose-600'}`} />
            <span>🚨 {itemsEnAlerte.length} en alerte</span>
            {statusFilter === 'CRITIQUE' && (
              <span className="text-[10px] px-1 bg-white/20 rounded">Actif</span>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleFilterSelect('OK')}
            className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 border ${
              statusFilter === 'OK'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Stock normal ({itemsNormaux.length})</span>
          </button>

          <button
            type="button"
            onClick={() => handleFilterSelect('ENTREES')}
            className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
              statusFilter === 'ENTREES'
                ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                : 'bg-teal-50 text-teal-800 border-teal-200 hover:bg-teal-100'
            }`}
          >
            <span>📥 Avec entrées ({itemsWithEntrees.length})</span>
          </button>

          <button
            type="button"
            onClick={() => handleFilterSelect('SORTIES')}
            className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
              statusFilter === 'SORTIES'
                ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
            }`}
          >
            <span>📤 Avec sorties ({itemsWithSorties.length})</span>
          </button>

          <button
            type="button"
            onClick={() => handleFilterSelect('VENTES')}
            className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
              statusFilter === 'VENTES'
                ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                : 'bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100'
            }`}
          >
            <span>🛒 Produits vendus ({itemsWithVentes.length})</span>
          </button>
        </div>

        {/* Row 3: Search Input & Category Dropdown */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher par référence, désignation ou catégorie..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-400"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-400 cursor-pointer"
            >
              <option value="TOUTES">Toutes les catégories ({categories.length})</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Active Filter Notification Banner */}
      {statusFilter !== 'ALL' && (
        <div className={`p-3.5 rounded-2xl flex items-center justify-between gap-3 text-xs font-semibold shadow-xs ${
          statusFilter === 'CRITIQUE'
            ? 'bg-rose-100/90 text-rose-900 border border-rose-300'
            : statusFilter === 'OK'
            ? 'bg-emerald-100/90 text-emerald-900 border border-emerald-300'
            : statusFilter === 'ENTREES'
            ? 'bg-teal-100/90 text-teal-900 border border-teal-300'
            : statusFilter === 'SORTIES'
            ? 'bg-amber-100/90 text-amber-900 border border-amber-300'
            : 'bg-purple-100/90 text-purple-900 border border-purple-300'
        }`}>
          <div className="flex items-center gap-2">
            {statusFilter === 'CRITIQUE' && (
              <>
                <span className="text-base">🚨</span>
                <span>
                  <strong>Filtre Actif :</strong> Affichage des <strong>{filteredItems.length} produits en alerte critique</strong> (Stock final ≤ Stock critique).
                </span>
              </>
            )}
            {statusFilter === 'OK' && (
              <>
                <span className="text-base">✅</span>
                <span>
                  <strong>Filtre Actif :</strong> Affichage des <strong>{filteredItems.length} produits en stock normal</strong> (niveau sécurisé).
                </span>
              </>
            )}
            {statusFilter === 'ENTREES' && (
              <>
                <span className="text-base">📥</span>
                <span>
                  <strong>Filtre Actif :</strong> Affichage des <strong>{filteredItems.length} produits avec mouvements d'entrée</strong> (+{totalEntrees} unités).
                </span>
              </>
            )}
            {statusFilter === 'SORTIES' && (
              <>
                <span className="text-base">📤</span>
                <span>
                  <strong>Filtre Actif :</strong> Affichage des <strong>{filteredItems.length} produits avec mouvements de sortie</strong> (-{totalSorties} unités).
                </span>
              </>
            )}
            {statusFilter === 'VENTES' && (
              <>
                <span className="text-base">🛒</span>
                <span>
                  <strong>Filtre Actif :</strong> Affichage des <strong>{filteredItems.length} produits ayant des ventes enregistrées</strong> ({totalVentes} vendus).
                </span>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={handleResetFilters}
            className="px-3 py-1 bg-white hover:bg-stone-100 rounded-lg text-stone-800 font-bold border border-stone-300 shadow-2xs transition-all cursor-pointer shrink-0 flex items-center gap-1"
          >
            <span>Afficher tous les articles ({stockList.length})</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Stock Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-3 bg-stone-50 border-b border-stone-200 flex items-center justify-between text-xs text-stone-600">
          <div className="font-semibold flex items-center gap-2">
            <span>📋</span>
            <span>Résultats : <strong>{filteredItems.length}</strong> sur <strong>{stockList.length}</strong> article{stockList.length > 1 ? 's' : ''}</span>
            {selectedSector !== 'ALL' && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${SECTOR_CONFIG[selectedSector].badgeClass}`}>
                {SECTOR_CONFIG[selectedSector].icon} {SECTOR_CONFIG[selectedSector].shortLabel}
              </span>
            )}
          </div>
          <div className="text-[11px] text-stone-500">
            Astuce : Cliquez sur n'importe quel bouton ou carte pour filtrer instantanément
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-stone-100 text-stone-700 font-bold border-b border-stone-200 select-none">
                <th className="py-3.5 px-3 text-center">#</th>
                <th className="py-3.5 px-3">Référence</th>
                <th className="py-3.5 px-3">Désignation</th>
                <th className="py-3.5 px-2.5 text-center">Pôle</th>
                <th className="py-3.5 px-3">Catégorie</th>
                <th className="py-3.5 px-2 text-center">Unité</th>
                <th className="py-3.5 px-2 text-center text-amber-800 bg-amber-50/50">Stock Crit.</th>
                <th className="py-3.5 px-2 text-center text-stone-600">Stock Init.</th>
                <th className="py-3.5 px-2 text-center text-emerald-700 bg-emerald-50/40">Entrées</th>
                <th className="py-3.5 px-2 text-center text-amber-700 bg-amber-50/40">Sorties</th>
                <th className="py-3.5 px-2 text-center text-indigo-700 bg-indigo-50/40">Ventes</th>
                <th className="py-3.5 px-3 text-center font-extrabold text-stone-900 bg-stone-200/60">Stock Final</th>
                <th className="py-3.5 px-3 text-right">Prix Achat</th>
                <th className="py-3.5 px-2 text-right">Marge Frais</th>
                <th className="py-3.5 px-3 text-right font-bold text-stone-800">Coût Revient</th>
                <th className="py-3.5 px-3 text-right font-black text-emerald-800 bg-emerald-50/60">Valeur Stock</th>
                <th className="py-3.5 px-3 text-center">Statut</th>
                <th className="py-3.5 px-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 text-stone-700">
              {filteredItems.map((item, index) => {
                const stockFinal = getStockFinal(item);
                const coutRevient = getCoutRevient(item);
                const valeurStock = getValeurStock(item);
                const alerte = isAlerteStock(item);
                const itemSector = getItemSector(item);
                const sectorCfg = SECTOR_CONFIG[itemSector];

                return (
                  <tr 
                    key={item.id} 
                    className={`hover:bg-stone-50 transition-colors ${alerte ? 'bg-rose-50/40 font-medium' : ''}`}
                  >
                    <td className="py-3 px-3 text-center font-mono text-stone-400 font-bold">{index + 1}</td>
                    <td className="py-3 px-3 font-mono font-semibold text-stone-900 whitespace-nowrap">
                      {item.reference}
                    </td>
                    <td className="py-3 px-3 font-medium text-stone-800 min-w-[200px]">
                      <div className="flex flex-col">
                        <span>{item.designation}</span>
                        {item.stockInitial === 0 && item.prixAchat === 0 && (
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(item)}
                            className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold hover:bg-amber-100 transition-colors w-fit cursor-pointer"
                            title="Cliquer pour saisir les données réelles de cet article"
                          >
                            <Edit3 className="w-2.5 h-2.5 text-amber-700" />
                            <span>Données réelles à saisir</span>
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-2.5 text-center whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${sectorCfg.badgeClass}`}>
                        <span>{sectorCfg.icon}</span>
                        <span>{sectorCfg.shortLabel}</span>
                      </span>
                    </td>
                    <td className="py-3 px-3 text-stone-600 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 font-mono text-[11px]">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center font-medium text-stone-600">{item.unit}</td>
                    <td className="py-3 px-2 text-center font-mono font-bold text-amber-700 bg-amber-50/30">
                      {item.stockCritique}
                    </td>
                    <td className="py-3 px-2 text-center font-mono text-stone-600">
                      {item.stockInitial}
                    </td>
                    <td className="py-3 px-2 text-center font-mono text-emerald-700 font-semibold bg-emerald-50/30">
                      +{item.entrees}
                    </td>
                    <td className="py-3 px-2 text-center font-mono text-amber-700 font-semibold bg-amber-50/30">
                      -{item.sorties}
                    </td>
                    <td className="py-3 px-2 text-center font-mono text-indigo-700 font-bold bg-indigo-50/30">
                      {item.vente}
                    </td>
                    <td className={`py-3 px-3 text-center font-mono font-black text-sm bg-stone-100 ${
                      stockFinal <= 0 
                        ? 'text-rose-700 bg-rose-100/60' 
                        : alerte 
                        ? 'text-rose-700 bg-rose-100/80' 
                        : 'text-stone-900'
                    }`}>
                      {stockFinal}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-stone-600">
                      {item.prixAchat.toLocaleString('fr-FR')} F
                    </td>
                    <td className="py-3 px-2 text-right font-mono text-stone-500">
                      {item.margeFrais > 0 ? `+${item.margeFrais.toLocaleString('fr-FR')} F` : '-'}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-stone-900">
                      {coutRevient.toLocaleString('fr-FR')} F
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-black text-emerald-700 bg-emerald-50/40">
                      {valeurStock.toLocaleString('fr-FR')} F
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      {alerte ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-100 text-rose-700 border border-rose-300 animate-pulse">
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          <span>Seuil dépassé ({stockFinal} ≤ {item.stockCritique})</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Bon niveau</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          title="Saisir / Modifier les chiffres réels de cet article"
                          className="p-1.5 hover:bg-amber-100 rounded-lg text-amber-700 hover:text-amber-900 transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenMovementModal('ENTREE', item.reference)}
                          title="Ajuster le stock (+)"
                          className="p-1.5 hover:bg-emerald-100 rounded-lg text-stone-500 hover:text-emerald-700 transition-colors cursor-pointer"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={18} className="py-12 text-center text-stone-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <span className="text-3xl">🔍</span>
                      <p className="font-bold text-stone-800 text-sm">Aucun produit ne correspond aux critères de filtre sélectionnés.</p>
                      <p className="text-xs text-stone-500">Essayez de réinitialiser le filtre ou la recherche.</p>
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className="mt-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                      >
                        Afficher tous les {stockList.length} articles
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
            {filteredItems.length > 0 && (
              <tfoot>
                <tr className="bg-stone-900 text-white font-bold border-t-2 border-stone-700">
                  <td colSpan={10} className="py-3.5 px-4 text-right uppercase tracking-wider text-xs text-stone-300">
                    Total Général (Valeur Totale du Stock) :
                  </td>
                  <td className="py-3.5 px-3 text-center font-mono font-black text-sm text-emerald-400 bg-stone-800">
                    {filteredItems.reduce((acc, i) => acc + getStockFinal(i), 0)} u.
                  </td>
                  <td colSpan={3} className="py-3.5 px-3 text-right text-xs text-stone-400">
                    Valorisation globale :
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono font-black text-sm text-emerald-300 bg-emerald-950/80">
                    {formatFCFA(filteredItems.reduce((acc, i) => acc + getValeurStock(i), 0))}
                  </td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Movement Modal (Entrée / Sortie) */}
      {isMovementModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                {movementType === 'ENTREE' ? (
                  <PlusCircle className="w-5 h-5 text-emerald-600" />
                ) : (
                  <MinusCircle className="w-5 h-5 text-amber-600" />
                )}
                <h3 className="font-bold text-stone-900 text-base">
                  {movementType === 'ENTREE' ? 'Enregistrer une Entrée de Stock' : 'Enregistrer une Sortie de Stock'}
                </h3>
              </div>
              <button
                onClick={() => setIsMovementModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMovement} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Article concerné
                </label>
                <select
                  value={selectedItemRef}
                  onChange={(e) => setSelectedItemRef(e.target.value)}
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                >
                  {stockList.map(item => (
                    <option key={item.id} value={item.reference}>
                      {item.reference} - {item.designation} (Stock dispo : {getStockFinal(item)} {item.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Quantité à {movementType === 'ENTREE' ? 'ajouter' : 'déduire'}
                </label>
                <input
                  type="number"
                  min="1"
                  value={movementQty}
                  onChange={(e) => setMovementQty(parseInt(e.target.value) || 0)}
                  className="w-full text-sm font-mono p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Motif du mouvement
                </label>
                <input
                  type="text"
                  value={movementMotif}
                  onChange={(e) => setMovementMotif(e.target.value)}
                  placeholder="Ex : Réception fournisseur, Casse, Inventaire..."
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsMovementModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 text-xs font-bold text-white rounded-xl shadow-sm cursor-pointer ${
                    movementType === 'ENTREE' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-amber-600 hover:bg-amber-500'
                  }`}
                >
                  Confirmer le mouvement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Saisie des données réelles du stock */}
      {isEditModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <h3 className="text-base font-black text-stone-900 flex items-center gap-2">
                  <span>Saisie des Données Réelles</span>
                  <span className="text-sm">📝</span>
                </h3>
                <p className="text-xs text-stone-500 font-mono mt-0.5">
                  Réf: <strong className="text-stone-800">{editingItem.reference}</strong> ({editingItem.category})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 hover:bg-stone-100 rounded-full text-stone-400 hover:text-stone-700 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditItem} className="space-y-4 mt-4">
              {/* Designation & Category */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Désignation de l'article
                </label>
                <input
                  type="text"
                  value={editDesignation}
                  onChange={(e) => setEditDesignation(e.target.value)}
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Catégorie
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Unité (Pce, L, Kg, Carton...)
                  </label>
                  <input
                    type="text"
                    value={editUnit}
                    onChange={(e) => setEditUnit(e.target.value)}
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Quantités: Stock initial & seuil critique */}
              <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200 space-y-3">
                <span className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block">
                  1. Quantités & Niveaux de Stock
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Stock Initial (Réel)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={editStockInitial}
                      onChange={(e) => setEditStockInitial(parseInt(e.target.value) || 0)}
                      className="w-full text-sm font-mono font-bold p-2.5 bg-white border border-stone-300 rounded-xl text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      required
                    />
                    <span className="text-[10px] text-stone-500">Quantité réelle en stock</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-amber-900 mb-1">
                      Stock Critique (Alerte)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={editStockCritique}
                      onChange={(e) => setEditStockCritique(parseInt(e.target.value) || 0)}
                      className="w-full text-sm font-mono font-bold p-2.5 bg-white border border-amber-300 rounded-xl text-amber-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      required
                    />
                    <span className="text-[10px] text-stone-500">Seuil de réapprovisionnement</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-emerald-800 mb-1">
                      Entrées (+)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={editEntrees}
                      onChange={(e) => setEditEntrees(parseInt(e.target.value) || 0)}
                      className="w-full text-xs font-mono p-2 bg-white border border-emerald-300 rounded-xl text-emerald-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-amber-800 mb-1">
                      Sorties (-)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={editSorties}
                      onChange={(e) => setEditSorties(parseInt(e.target.value) || 0)}
                      className="w-full text-xs font-mono p-2 bg-white border border-amber-300 rounded-xl text-amber-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Prix & Coûts */}
              <div className="bg-emerald-50/50 p-3.5 rounded-2xl border border-emerald-100 space-y-3">
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                  2. Prix d'Achat & Frais (FCFA)
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Prix d'Achat Unitaire
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="50"
                      value={editPrixAchat}
                      onChange={(e) => setEditPrixAchat(parseInt(e.target.value) || 0)}
                      className="w-full text-sm font-mono font-bold p-2.5 bg-white border border-stone-300 rounded-xl text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      required
                    />
                    <span className="text-[10px] text-stone-500">Prix payé au fournisseur</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Marge / Frais supplémentaires
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="50"
                      value={editMargeFrais}
                      onChange={(e) => setEditMargeFrais(parseInt(e.target.value) || 0)}
                      className="w-full text-sm font-mono font-bold p-2.5 bg-white border border-stone-300 rounded-xl text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                    <span className="text-[10px] text-stone-500">Transport, emballage...</span>
                  </div>
                </div>
              </div>

              {/* Live Preview of Calculated Excel Formulas */}
              <div className="p-3 bg-stone-100 rounded-2xl border border-stone-200">
                <span className="text-[10px] font-bold text-stone-600 uppercase tracking-wider block mb-2">
                  Aperçu des Formules Calculées :
                </span>
                <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                  <div className="bg-white p-2 rounded-xl border border-stone-200">
                    <span className="text-[10px] text-stone-500 block font-sans">Stock Final</span>
                    <strong className="text-stone-900 text-sm">
                      {Math.max(0, editStockInitial + editEntrees - editSorties - (editingItem.vente || 0))} {editUnit}
                    </strong>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-stone-200">
                    <span className="text-[10px] text-stone-500 block font-sans">Coût Revient</span>
                    <strong className="text-stone-900 text-sm">
                      {(editPrixAchat + editMargeFrais).toLocaleString('fr-FR')} F
                    </strong>
                  </div>
                  <div className="bg-emerald-100/60 p-2 rounded-xl border border-emerald-200">
                    <span className="text-[10px] text-emerald-800 block font-sans font-bold">Valeur Stock</span>
                    <strong className="text-emerald-800 text-sm">
                      {(Math.max(0, editStockInitial + editEntrees - editSorties - (editingItem.vente || 0)) * (editPrixAchat + editMargeFrais)).toLocaleString('fr-FR')} F
                    </strong>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Enregistrer les données réelles</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
