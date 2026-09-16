import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { AccueilModule } from './components/AccueilModule';
import { StockModule, StockStatusFilter } from './components/StockModule';
import { VenteModule } from './components/VenteModule';
import { ProduitsModule } from './components/ProduitsModule';
import { BiDashboardsModule } from './components/BiDashboardsModule';
import { ConfigurationModule } from './components/ConfigurationModule';
import { BackupAndPublishModal } from './components/BackupAndPublishModal';
import { 
  ActiveTab, 
  ProductItem, 
  StockItem, 
  SaleRecord, 
  CategoryConfig, 
  UnitConfig,
  SectorType
} from './types';
import { 
  INITIAL_CATEGORIES, 
  INITIAL_UNITS, 
  INITIAL_PRODUCTS_LIST, 
  INITIAL_STOCK_LIST, 
  INITIAL_SALES_LIST,
  isAlerteStock,
  formatFCFA,
  getCategorySector
} from './data/initialData';
import { FileSpreadsheet, Download, HardDrive, Smartphone, ShieldCheck } from 'lucide-react';

const STORAGE_KEYS = {
  CATEGORIES: 'DELICES_CATEGORIES_V1',
  UNITS: 'DELICES_UNITS_V1',
  PRODUCTS: 'DELICES_PRODUCTS_V1',
  STOCK: 'DELICES_STOCK_V1',
  SALES: 'DELICES_SALES_V1',
  LAST_SAVED: 'DELICES_LAST_SAVED_V1'
};

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('ACCUEIL');
  const [stockStatusFilter, setStockStatusFilter] = useState<StockStatusFilter>('ALL');
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LAST_SAVED);
    return saved ? new Date(saved) : null;
  });

  // Application State initialized from LocalStorage (persisted) or default fallback
  const [categories, setCategories] = useState<CategoryConfig[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_CATEGORIES;
  });

  const [units, setUnits] = useState<UnitConfig[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.UNITS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_UNITS;
  });

  const [productsList, setProductsList] = useState<ProductItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_PRODUCTS_LIST;
  });

  const [stockList, setStockList] = useState<StockItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STOCK);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_STOCK_LIST;
  });

  const [salesList, setSalesList] = useState<SaleRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SALES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_SALES_LIST;
  });

  // Automatic LocalStorage sync whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
      localStorage.setItem(STORAGE_KEYS.UNITS, JSON.stringify(units));
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(productsList));
      localStorage.setItem(STORAGE_KEYS.STOCK, JSON.stringify(stockList));
      localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(salesList));
      const now = new Date();
      localStorage.setItem(STORAGE_KEYS.LAST_SAVED, now.toISOString());
      setLastSavedTime(now);
    } catch (err) {
      console.warn('LocalStorage save failed:', err);
    }
  }, [categories, units, productsList, stockList, salesList]);

  // Listen for PWA install prompt
  useEffect(() => {
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleTriggerInstall = () => {
    if (installPrompt) {
      installPrompt.prompt();
      installPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          setInstallPrompt(null);
        }
      });
    }
  };

  const alertesCount = stockList.filter(isAlerteStock).length;

  const handleNavigateToStockWithFilter = (filter: StockStatusFilter = 'ALL') => {
    setStockStatusFilter(filter);
    setActiveTab('STOCK');
  };

  // --- Handlers: Stock & Movements ---
  const handleUpdateStockItem = (updated: StockItem) => {
    setStockList(prev => prev.map(item => item.id === updated.id ? updated : item));
  };

  const handleAddStockMovement = (
    reference: string, 
    type: 'ENTREE' | 'SORTIE', 
    qty: number, 
    _motif: string
  ) => {
    setStockList(prev => prev.map(item => {
      if (item.reference !== reference) return item;
      if (type === 'ENTREE') {
        return {
          ...item,
          entrees: item.entrees + qty
        };
      } else {
        return {
          ...item,
          sorties: item.sorties + qty
        };
      }
    }));
  };

  // --- Handlers: Vente & Live Déstockage ---
  const handleAddSale = (saleData: Omit<SaleRecord, 'id'>) => {
    const newSale: SaleRecord = {
      ...saleData,
      id: `sale-${Date.now()}`
    };

    // 1. Append sale to register
    setSalesList(prev => [newSale, ...prev]);

    // 2. Automatically decrement stock (increment item.vente)
    setStockList(prev => prev.map(item => {
      if (item.reference === saleData.reference) {
        return {
          ...item,
          vente: item.vente + saleData.quantiteVendue
        };
      }
      return item;
    }));
  };

  // --- Handlers: Products & Services ---
  const handleAddProduct = (newProdData: Omit<ProductItem, 'id'>) => {
    const newId = `p-${Date.now()}`;
    const newProduct: ProductItem = {
      ...newProdData,
      id: newId
    };

    setProductsList(prev => [...prev, newProduct]);

    // Also create initial stock row for this product in Stock sheet
    const newStockItem: StockItem = {
      id: `s-${Date.now()}`,
      reference: newProduct.reference,
      designation: newProduct.designation,
      category: newProduct.category,
      unit: newProduct.unit,
      stockCritique: 5,
      stockInitial: 0,
      entrees: 0,
      sorties: 0,
      vente: 0,
      prixAchat: Math.round(newProduct.sellingPrice * 0.7),
      margeFrais: 0
    };
    setStockList(prev => [...prev, newStockItem]);
  };

  const handleUpdateProduct = (updated: ProductItem) => {
    setProductsList(prev => prev.map(p => p.id === updated.id ? updated : p));
    // Synchronize in stock sheet
    setStockList(prev => prev.map(s => {
      if (s.reference === updated.reference || s.id === updated.id) {
        return {
          ...s,
          reference: updated.reference,
          designation: updated.designation,
          category: updated.category,
          unit: updated.unit
        };
      }
      return s;
    }));
  };

  const handleDeleteProduct = (id: string) => {
    const prod = productsList.find(p => p.id === id);
    setProductsList(prev => prev.filter(p => p.id !== id));
    if (prod) {
      setStockList(prev => prev.filter(s => s.reference !== prod.reference));
    }
  };

  // --- Handlers: Configuration (Categories & Units) ---
  const handleAddCategory = (name: string, sector?: SectorType) => {
    const determinedSector = sector || getCategorySector(name);
    setCategories(prev => [...prev, { id: `cat-${Date.now()}`, name, sector: determinedSector }]);
  };

  const handleDeleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  const handleAddUnit = (name: string) => {
    setUnits(prev => [...prev, { id: `u-${Date.now()}`, name }]);
  };

  const handleDeleteUnit = (id: string) => {
    setUnits(prev => prev.filter(u => u.id !== id));
  };

  const handleResetAllData = () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
      localStorage.removeItem(STORAGE_KEYS.UNITS);
      localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
      localStorage.removeItem(STORAGE_KEYS.STOCK);
      localStorage.removeItem(STORAGE_KEYS.SALES);
      localStorage.removeItem(STORAGE_KEYS.LAST_SAVED);
    } catch (e) {}
    setCategories(INITIAL_CATEGORIES);
    setUnits(INITIAL_UNITS);
    setProductsList(INITIAL_PRODUCTS_LIST);
    setStockList(INITIAL_STOCK_LIST);
    setSalesList(INITIAL_SALES_LIST);
    setLastSavedTime(new Date());
  };

  const handleClearDemoSales = () => {
    setSalesList([]);
    setStockList(prev => prev.map(s => ({ ...s, vente: 0 })));
  };

  const handleRestoreData = (backup: {
    categories?: CategoryConfig[];
    units?: UnitConfig[];
    productsList?: ProductItem[];
    stockList?: StockItem[];
    salesList?: SaleRecord[];
  }) => {
    if (backup.categories) setCategories(backup.categories);
    if (backup.units) setUnits(backup.units);
    if (backup.productsList) setProductsList(backup.productsList);
    if (backup.stockList) setStockList(backup.stockList);
    if (backup.salesList) setSalesList(backup.salesList);
  };

  // Global Backup Export (JSON format mirroring all 5 Excel sheets)
  const exportFullWorkbookJSON = () => {
    setIsBackupModalOpen(true);
  };

  const categoryNames = categories.map(c => c.name);
  const unitNames = units.map(u => u.name);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-stone-900 font-sans flex flex-col selection:bg-rose-100 selection:text-rose-900">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        alertesCount={alertesCount}
        onOpenStockWithFilter={handleNavigateToStockWithFilter}
        onOpenBackupModal={() => setIsBackupModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8">
        {activeTab === 'ACCUEIL' && (
          <AccueilModule
            stockList={stockList}
            salesList={salesList}
            setActiveTab={setActiveTab}
            onNavigateToStockWithFilter={handleNavigateToStockWithFilter}
          />
        )}

        {activeTab === 'STOCK' && (
          <StockModule
            stockList={stockList}
            onUpdateStockItem={handleUpdateStockItem}
            onAddStockMovement={handleAddStockMovement}
            categories={categoryNames}
            initialStatusFilter={stockStatusFilter}
            onStatusFilterChange={setStockStatusFilter}
          />
        )}

        {activeTab === 'VENTE' && (
          <VenteModule
            salesList={salesList}
            stockList={stockList}
            productsList={productsList}
            onAddSale={handleAddSale}
          />
        )}

        {activeTab === 'PRODUITS' && (
          <ProduitsModule
            productsList={productsList}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            categories={categoryNames}
            units={unitNames}
          />
        )}

        {activeTab === 'BI_DASHBOARDS' && (
          <BiDashboardsModule
            stockList={stockList}
            salesList={salesList}
            productsList={productsList}
            onNavigateToStockWithFilter={handleNavigateToStockWithFilter}
          />
        )}

        {activeTab === 'CONFIGURATION' && (
          <ConfigurationModule
            categories={categories}
            units={units}
            onAddCategory={handleAddCategory}
            onDeleteCategory={handleDeleteCategory}
            onAddUnit={handleAddUnit}
            onDeleteUnit={handleDeleteUnit}
            onResetAllData={handleResetAllData}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-rose-100 py-4 px-6 text-xs text-stone-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-stone-800 tracking-tight flex items-center gap-1.5">
              <span>🍓</span> LES DÉLICES DE MAMAN
            </span>
            <span>•</span>
            <span className="text-stone-600">Yaourterie Artisanale, Délices Fruitiers & Suivi Commercial</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsBackupModalOpen(true)}
              className="flex items-center gap-1.5 text-stone-700 hover:text-rose-600 font-semibold cursor-pointer transition-colors"
            >
              <HardDrive className="w-3.5 h-3.5 text-rose-500" />
              <span>Centre de Sauvegarde & Export</span>
            </button>
            <span>•</span>
            <span className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              {lastSavedTime ? `Auto-sauvegardé (${lastSavedTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })})` : 'Auto-sauvegarde active'}
            </span>
          </div>
        </div>
      </footer>

      {/* Modal: Centre de Sauvegarde, Installation PWA & Déploiement */}
      <BackupAndPublishModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        categories={categories}
        units={units}
        productsList={productsList}
        stockList={stockList}
        salesList={salesList}
        lastSavedTime={lastSavedTime}
        onRestoreData={handleRestoreData}
        onClearDemoSales={handleClearDemoSales}
        onResetAllData={handleResetAllData}
        installPrompt={installPrompt}
        onTriggerInstall={handleTriggerInstall}
      />
    </div>
  );
}
