import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Sparkles, 
  Sliders, 
  ArrowDownRight, 
  PlusCircle, 
  Layers, 
  Calendar, 
  FileText, 
  CheckCircle2, 
  TrendingUp,
  Tag
} from 'lucide-react';
import { Product, ShelfDepartment } from '../types';
import { getDlcDynamicPricing, formatCurrency } from '../data/mockDatabase';

interface StockDlcModuleProps {
  products: Product[];
  onUpdateStock: (code: string, newStock: number, reason: string) => void;
  onGeneratePurchaseOrderForProduct: (product: Product) => void;
}

export const StockDlcModule: React.FC<StockDlcModuleProps> = ({
  products,
  onUpdateStock,
  onGeneratePurchaseOrderForProduct,
}) => {
  const [selectedDept, setSelectedDept] = useState<string>('TOUS');
  const [filterDlcOnly, setFilterDlcOnly] = useState<boolean>(false);
  const [stockAdjustmentModal, setStockAdjustmentModal] = useState<{ open: boolean; product: Product | null; type: 'ENTREE' | 'CASSE' | 'VOL' | 'PERIME' }>({
    open: false,
    product: null,
    type: 'CASSE'
  });
  const [adjustmentQty, setAdjustmentQty] = useState<number>(1);
  const [adjustmentReason, setAdjustmentReason] = useState<string>('');

  // ROP / EOQ interactive simulator product
  const [simulatedProductCode, setSimulatedProductCode] = useState<string>(products[0]?.code || 'PRD-001');
  const [dailyDemandInput, setDailyDemandInput] = useState<number>(4);
  const [leadTimeInput, setLeadTimeInput] = useState<number>(3);
  const [safetyStockInput, setSafetyStockInput] = useState<number>(8);
  const [orderCostInput, setOrderCostInput] = useState<number>(2500);
  const [holdingCostInput, setHoldingCostInput] = useState<number>(180);

  const currentSimulatedProduct = products.find(p => p.code === simulatedProductCode) || products[0];

  // Wilson EOQ and ROP live calculation
  const calculatedRop = Math.round((dailyDemandInput * leadTimeInput) + safetyStockInput);
  const annualDemand = dailyDemandInput * 365;
  const calculatedEoq = Math.round(Math.sqrt((2 * annualDemand * orderCostInput) / holdingCostInput));

  // Products filtered
  const filteredProducts = products.filter(p => {
    const matchDept = selectedDept === 'TOUS' || p.department === selectedDept;
    if (filterDlcOnly) {
      const dlc = getDlcDynamicPricing(p);
      return matchDept && (dlc.status === 'CRITICAL_50' || dlc.status === 'WARN_20' || dlc.status === 'EXPIRED');
    }
    return matchDept;
  });

  // Critical items summary
  const criticalDlcCount = products.filter(p => {
    const dlc = getDlcDynamicPricing(p);
    return dlc.status === 'CRITICAL_50' || dlc.status === 'WARN_20';
  }).length;

  const lowStockCount = products.filter(p => p.stockQty <= p.reorderPoint).length;

  const handleApplyAdjustment = () => {
    if (!stockAdjustmentModal.product) return;
    const prod = stockAdjustmentModal.product;
    const delta = stockAdjustmentModal.type === 'ENTREE' ? adjustmentQty : -adjustmentQty;
    const newStock = Math.max(0, prod.stockQty + delta);

    onUpdateStock(
      prod.code, 
      newStock, 
      `${stockAdjustmentModal.type}: ${adjustmentReason || 'Déclaration manuelle'} (${delta > 0 ? '+' : ''}${delta} ${prod.unit})`
    );

    setStockAdjustmentModal({ open: false, product: null, type: 'CASSE' });
    setAdjustmentQty(1);
    setAdjustmentReason('');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">Valeur du Stock Total</span>
            <span className="text-xl font-bold font-mono text-stone-900 mt-1 block">
              {formatCurrency(products.reduce((acc, p) => acc + (p.stockQty * p.costPrice), 0))}
            </span>
            <span className="text-[11px] text-stone-400">Valorisation au Coût Moyen Pondéré (CMP)</span>
          </div>
          <div className="h-10 w-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            💰
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-xs flex items-center justify-between bg-amber-50/40">
          <div>
            <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider block">Anti-Gaspillage & DLC</span>
            <span className="text-xl font-bold font-mono text-amber-950 mt-1 block">
              {criticalDlcCount} Articles en Promo
            </span>
            <span className="text-[11px] text-amber-700">Remises auto -20% et -50% appliquées</span>
          </div>
          <div className="h-10 w-10 rounded-lg bg-amber-200 text-amber-900 flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-red-200 shadow-xs flex items-center justify-between bg-red-50/30">
          <div>
            <span className="text-xs font-semibold text-red-700 uppercase tracking-wider block">Alertes Réappro (≤ ROP)</span>
            <span className="text-xl font-bold font-mono text-red-950 mt-1 block">
              {lowStockCount} Articles sous le Seuil
            </span>
            <span className="text-[11px] text-red-600">Commandes fournisseurs suggérées</span>
          </div>
          <div className="h-10 w-10 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-bold">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">Dépôts & Rayons Actifs</span>
            <span className="text-xl font-bold font-mono text-stone-900 mt-1 block">
              6 Rayons Métiers
            </span>
            <span className="text-[11px] text-emerald-600 font-medium">Synchronisation temps réel active</span>
          </div>
          <div className="h-10 w-10 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
            <Layers className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* ================= MODULE ANTI-GASPILLAGE & DLC INTELLIGENTE ================= */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-stone-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-sm tracking-wide">ALERTE AUTOMATIQUE DLC & TARIFICATION DYNAMIQUE (DYNAMIC PRICING)</h3>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              Détecte les produits à rotation critique et applique automatiquement les remises dégressives pour liquider avant péremption.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="filter-dlc-toggle"
              onClick={() => setFilterDlcOnly(!filterDlcOnly)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                filterDlcOnly ? 'bg-amber-400 text-stone-950 shadow-xs' : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>{filterDlcOnly ? 'Afficher Tous' : 'Filtrer Promos DLC Uniquement'}</span>
            </button>
          </div>
        </div>

        {/* Table du stock et alertes DLC */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-stone-100 text-stone-600 border-b border-stone-200 uppercase text-[10px] font-bold tracking-wider">
                <th className="p-3">Produit & Code</th>
                <th className="p-3">Rayon / Emplacement</th>
                <th className="p-3">Stock Actuel</th>
                <th className="p-3">Seuil Alerte (ROP)</th>
                <th className="p-3">Date Limite (DLC)</th>
                <th className="p-3">Prix Initial</th>
                <th className="p-3">Prix Dynamique POS</th>
                <th className="p-3 text-right">Actions Rapides</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredProducts.map((prod) => {
                const dlc = getDlcDynamicPricing(prod);
                const isUnderRop = prod.stockQty <= prod.reorderPoint;

                return (
                  <tr key={prod.code} className="hover:bg-stone-50 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl select-none">{prod.imageEmoji}</span>
                        <div>
                          <span className="font-bold text-stone-900 block">{prod.name}</span>
                          <span className="text-[10px] font-mono text-stone-400">{prod.code} • {prod.barcode}</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-3 text-stone-600">
                      <span className="font-medium text-stone-800 block">{prod.department}</span>
                      <span className="text-[10px] text-stone-400">{prod.shelfLocation}</span>
                    </td>

                    <td className="p-3">
                      <span className={`font-mono font-bold text-xs px-2 py-0.5 rounded ${
                        prod.stockQty <= prod.minStockAlert 
                          ? 'bg-red-100 text-red-700 font-black animate-pulse' 
                          : isUnderRop 
                          ? 'bg-amber-100 text-amber-800' 
                          : 'bg-stone-100 text-stone-800'
                      }`}>
                        {prod.stockQty} {prod.unit}
                      </span>
                    </td>

                    <td className="p-3 text-stone-600 font-mono">
                      <span>ROP: {prod.reorderPoint}</span>
                      <span className="text-[10px] text-stone-400 block">Secu: {prod.safetyStock}</span>
                    </td>

                    <td className="p-3">
                      {prod.dlc ? (
                        <div>
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${dlc.badgeColor}`}>
                            {dlc.badgeLabel}
                          </span>
                          <span className="text-[10px] text-stone-400 block mt-0.5 font-mono">Exp: {prod.dlc}</span>
                        </div>
                      ) : (
                        <span className="text-stone-400 text-[10px]">Non périssable</span>
                      )}
                    </td>

                    <td className="p-3 font-mono text-stone-500">
                      {formatCurrency(prod.sellingPrice)}
                    </td>

                    <td className="p-3 font-mono font-bold">
                      <span className={dlc.discountPercent > 0 ? 'text-amber-800' : 'text-stone-900'}>
                        {formatCurrency(dlc.effectivePrice)}
                      </span>
                      {dlc.discountPercent > 0 && (
                        <span className="block text-[10px] text-amber-600 font-semibold">
                          -{dlc.discountPercent}% Liquidation
                        </span>
                      )}
                    </td>

                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {isUnderRop && (
                          <button
                            id={`rop-order-${prod.code}`}
                            onClick={() => onGeneratePurchaseOrderForProduct(prod)}
                            className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded text-[10px] font-bold flex items-center gap-1"
                            title="Créer un bon de commande automatique (Wilson EOQ)"
                          >
                            <FileText className="w-3 h-3" />
                            <span>Commander</span>
                          </button>
                        )}

                        <button
                          id={`adjust-stock-${prod.code}`}
                          onClick={() => setStockAdjustmentModal({ open: true, product: prod, type: 'CASSE' })}
                          className="px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded text-[10px] font-medium"
                        >
                          Ajuster
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= CALCULATRICE ROP (REORDER POINT) & EOQ WILSON ================= */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5">
        <div className="flex items-center gap-3 border-b border-stone-100 pb-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-stone-900">SIMULATEUR DE RÉAPPROVISIONNEMENT AUTOMATIQUE (ROP & WILSON EOQ)</h3>
            <p className="text-xs text-stone-500">
              Formule mathématique : ROP = (Demande Quotidienne × Délai Fournisseur) + Stock de Sécurité
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Paramètres interactifs (Sliders) */}
          <div className="lg:col-span-6 space-y-4">
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                Sélectionnez l'article pour le calcul :
              </label>
              <select
                id="calc-product-select"
                value={simulatedProductCode}
                onChange={(e) => {
                  setSimulatedProductCode(e.target.value);
                  const p = products.find(prod => prod.code === e.target.value);
                  if (p) {
                    setDailyDemandInput(p.dailyDemandAvg);
                    setLeadTimeInput(p.leadTimeDays);
                    setSafetyStockInput(p.safetyStock);
                  }
                }}
                className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {products.map(p => (
                  <option key={p.code} value={p.code}>
                    {p.name} ({p.code}) - Stock actuel : {p.stockQty} {p.unit}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-stone-600 flex justify-between">
                  <span>Ventes Journalières (d) :</span>
                  <strong className="font-mono">{dailyDemandInput} {currentSimulatedProduct.unit}/j</strong>
                </label>
                <input
                  type="range"
                  min={0.5}
                  max={25}
                  step={0.5}
                  value={dailyDemandInput}
                  onChange={(e) => setDailyDemandInput(Number(e.target.value))}
                  className="w-full accent-indigo-600 mt-1"
                />
              </div>

              <div>
                <label className="text-xs text-stone-600 flex justify-between">
                  <span>Délai Fournisseur (L) :</span>
                  <strong className="font-mono">{leadTimeInput} jours</strong>
                </label>
                <input
                  type="range"
                  min={1}
                  max={15}
                  step={1}
                  value={leadTimeInput}
                  onChange={(e) => setLeadTimeInput(Number(e.target.value))}
                  className="w-full accent-indigo-600 mt-1"
                />
              </div>

              <div>
                <label className="text-xs text-stone-600 flex justify-between">
                  <span>Stock de Sécurité (SS) :</span>
                  <strong className="font-mono">{safetyStockInput} {currentSimulatedProduct.unit}</strong>
                </label>
                <input
                  type="range"
                  min={1}
                  max={50}
                  step={1}
                  value={safetyStockInput}
                  onChange={(e) => setSafetyStockInput(Number(e.target.value))}
                  className="w-full accent-indigo-600 mt-1"
                />
              </div>

              <div>
                <label className="text-xs text-stone-600 flex justify-between">
                  <span>Coût d'une Commande (S) :</span>
                  <strong className="font-mono">{formatCurrency(orderCostInput)}</strong>
                </label>
                <input
                  type="range"
                  min={500}
                  max={10000}
                  step={500}
                  value={orderCostInput}
                  onChange={(e) => setOrderCostInput(Number(e.target.value))}
                  className="w-full accent-indigo-600 mt-1"
                />
              </div>
            </div>
          </div>

          {/* Résultats du modèle mathématique */}
          <div className="lg:col-span-6 bg-stone-50 border border-stone-200 rounded-xl p-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                <span className="text-xs font-bold text-stone-800">Seuil de Réapprovisionnement ROP :</span>
                <span className="font-mono font-black text-lg text-indigo-700">{calculatedRop} {currentSimulatedProduct.unit}</span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                <span className="text-xs font-bold text-stone-800">Quantité Économique de Commande (EOQ Wilson) :</span>
                <span className="font-mono font-black text-lg text-emerald-700">{calculatedEoq} {currentSimulatedProduct.unit}</span>
              </div>

              <div className="p-3 bg-white rounded-lg border border-stone-200 text-xs space-y-1">
                <div className="flex justify-between text-stone-600">
                  <span>Stock physique actuel :</span>
                  <span className="font-mono font-bold text-stone-900">{currentSimulatedProduct.stockQty} {currentSimulatedProduct.unit}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>État du réapprovisionnement :</span>
                  {currentSimulatedProduct.stockQty <= calculatedRop ? (
                    <span className="font-bold text-red-600 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> CRITIQUE : Seuil ROP franchi !
                    </span>
                  ) : (
                    <span className="font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Stock Sécurisé (Au-dessus du ROP)
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-stone-200 flex justify-end">
              <button
                id="trigger-po-from-calc-btn"
                onClick={() => onGeneratePurchaseOrderForProduct(currentSimulatedProduct)}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>Générer Bon de Commande Automatique ({calculatedEoq} {currentSimulatedProduct.unit})</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* ================= MODAL AJUSTEMENT STOCK (CASSE, VOL, PÉRIMÉ) ================= */}
      {stockAdjustmentModal.open && stockAdjustmentModal.product && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-stone-200">
            <h4 className="font-bold text-sm text-stone-900 mb-1">Ajustement de Stock Inaltérable</h4>
            <p className="text-xs text-stone-500 mb-3">{stockAdjustmentModal.product.name} ({stockAdjustmentModal.product.code})</p>

            <div className="space-y-3 mb-4">
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">Type de Mouvement :</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(['CASSE', 'PERIME', 'VOL', 'ENTREE'] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => setStockAdjustmentModal(prev => ({ ...prev, type: t }))}
                      className={`py-1.5 px-2 rounded text-xs font-bold border ${
                        stockAdjustmentModal.type === t ? 'bg-stone-900 text-white border-stone-900' : 'bg-stone-50 text-stone-700 border-stone-200'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">Quantité :</label>
                <input
                  type="number"
                  min={1}
                  value={adjustmentQty}
                  onChange={(e) => setAdjustmentQty(Number(e.target.value))}
                  className="w-full bg-stone-50 border border-stone-300 rounded px-2.5 py-1.5 text-xs font-mono text-stone-900"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">Motif / Référence PV :</label>
                <input
                  type="text"
                  placeholder="Ex: Chute manutention, inventaire tournant..."
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded px-2.5 py-1.5 text-xs text-stone-900"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setStockAdjustmentModal({ open: false, product: null, type: 'CASSE' })}
                className="flex-1 py-2 rounded-lg border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-100"
              >
                Annuler
              </button>
              <button
                onClick={handleApplyAdjustment}
                className="flex-1 py-2 rounded-lg bg-stone-900 text-white text-xs font-bold hover:bg-stone-800"
              >
                Valider
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
