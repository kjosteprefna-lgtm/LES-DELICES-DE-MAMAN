import React, { useState } from 'react';
import { 
  Truck, 
  FileText, 
  Plus, 
  CheckCircle2, 
  History, 
  Printer, 
  Send, 
  Calculator,
  Building2,
  DollarSign
} from 'lucide-react';
import { Supplier, PurchaseOrder, Product } from '../types';
import { formatCurrency } from '../data/mockDatabase';

interface SuppliersModuleProps {
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  products: Product[];
  onCreatePurchaseOrder: (po: PurchaseOrder) => void;
  onReceivePurchaseOrder: (poId: string) => void;
}

export const SuppliersModule: React.FC<SuppliersModuleProps> = ({
  suppliers,
  purchaseOrders,
  products,
  onCreatePurchaseOrder,
  onReceivePurchaseOrder,
}) => {
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier>(suppliers[0]);
  const [isPoModalOpen, setIsPoModalOpen] = useState(false);
  const [activePoDetails, setActivePoDetails] = useState<PurchaseOrder | null>(null);

  // New PO form
  const [poProductCode, setPoProductCode] = useState(products[0]?.code || '');
  const [poQuantity, setPoQuantity] = useState(50);

  // Quick PO generator
  const handleQuickPoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const prod = products.find(p => p.code === poProductCode);
    if (!prod) return;

    const unitCost = prod.costPrice;
    const subTotal = unitCost * poQuantity;

    const newPo: PurchaseOrder = {
      id: `PO-${Date.now()}`,
      orderNumber: `BC-2026-09-${Math.floor(100 + Math.random() * 900)}`,
      supplierId: selectedSupplier.id,
      supplierName: selectedSupplier.name,
      createdAt: new Date().toISOString().split('T')[0],
      expectedDelivery: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
      status: 'TRANSMIS',
      totalAmount: subTotal,
      items: [
        {
          productCode: prod.code,
          name: prod.name,
          quantity: poQuantity,
          unitCost,
          subTotal
        }
      ]
    };

    onCreatePurchaseOrder(newPo);
    setIsPoModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner Overview */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <h2 className="font-bold text-sm text-stone-900 tracking-wide">GESTION DES FOURNISSEURS & ACHATS AUTOMATISÉS</h2>
          <p className="text-xs text-stone-500">Comparateur de mercuriale, calcul automatique du CMP et passation de commandes.</p>
        </div>

        <button
          id="new-purchase-order-btn"
          onClick={() => setIsPoModalOpen(true)}
          className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Émettre un Bon de Commande (PO)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ================= FICHIER FOURNISSEURS & COMPARATEUR (Lg: 5 cols) ================= */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2 mb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-xs text-stone-900 uppercase">Partenaires Référencés</h3>
              </div>
              <span className="text-[10px] font-mono text-stone-500">{suppliers.length} fournisseurs</span>
            </div>

            <div className="space-y-2">
              {suppliers.map(sup => (
                <div
                  key={sup.id}
                  onClick={() => setSelectedSupplier(sup)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    selectedSupplier.id === sup.id 
                      ? 'bg-emerald-50/70 border-emerald-500 ring-1 ring-emerald-500' 
                      : 'bg-stone-50 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <span className="font-bold text-stone-900">{sup.name}</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-mono font-bold">
                      {sup.reliabilityScore}% Fiabilité
                    </span>
                  </div>

                  <p className="text-stone-500 text-[11px]">Contact : {sup.contactName} • {sup.phone}</p>
                  <p className="text-stone-400 text-[10px]">{sup.email} • {sup.address}</p>

                  <div className="mt-2 pt-2 border-t border-stone-200/60 flex items-center justify-between text-[10px] text-stone-600">
                    <span>{sup.suppliedProducts.length} articles au catalogue</span>
                    <span className="text-emerald-700 font-semibold">Délai : ~{sup.suppliedProducts[0]?.leadTimeDays || 3}j</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Comparateur d'historique de prix d'achat */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-4">
            <div className="flex items-center gap-2 border-b border-stone-100 pb-2 mb-3">
              <History className="w-4 h-4 text-indigo-600" />
              <h4 className="font-bold text-xs text-stone-900 uppercase">Catalogue & Mercuriale ({selectedSupplier.name})</h4>
            </div>

            <div className="space-y-2 text-xs">
              {selectedSupplier.suppliedProducts.map(item => (
                <div key={item.productCode} className="p-2.5 bg-stone-50 rounded-lg border border-stone-200 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-stone-900 block">{item.productName}</span>
                    <span className="text-[10px] text-stone-500 font-mono">Code: {item.productCode} • Lead: {item.leadTimeDays} jours</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold font-mono text-xs text-emerald-800 block">
                      {formatCurrency(item.lastPurchasePrice)}
                    </span>
                    <span className="text-[9px] text-stone-400">Dernier coût unitaire</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ================= BONS DE COMMANDE & RÉCEPTIONS (Lg: 7 cols) ================= */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-stone-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-sm tracking-wide">BONS DE COMMANDE (PURCHASE ORDERS)</h3>
            </div>
            <span className="text-xs text-stone-400 font-mono">{purchaseOrders.length} bons émis</span>
          </div>

          <div className="divide-y divide-stone-100 overflow-y-auto max-h-[500px]">
            {purchaseOrders.length === 0 ? (
              <div className="p-8 text-center text-stone-400 text-xs">
                Aucun bon de commande pour le moment. Cliquez sur "Émettre un Bon de Commande".
              </div>
            ) : (
              purchaseOrders.map(po => (
                <div key={po.id} className="p-4 hover:bg-stone-50 transition-colors space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-stone-900">{po.orderNumber}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          po.status === 'RECU' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800 animate-pulse'
                        }`}>
                          {po.status === 'RECU' ? 'LIVRÉ & CMP ACTUALISÉ' : 'EN COURS DE LIVRAISON'}
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 mt-0.5">Fournisseur : <strong>{po.supplierName}</strong></p>
                      <p className="text-[10px] text-stone-400">Émis le {po.createdAt} • Livraison estimée : {po.expectedDelivery}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-black font-mono text-stone-900 block">
                        {formatCurrency(po.totalAmount)}
                      </span>
                      <span className="text-[10px] text-stone-500">{po.items.length} ligne(s)</span>
                    </div>
                  </div>

                  {/* Détail lignes */}
                  <div className="bg-stone-50 rounded-lg p-2.5 border border-stone-200 text-xs space-y-1">
                    {po.items.map((it, i) => (
                      <div key={i} className="flex justify-between items-center text-stone-700">
                        <span>• {it.name} x {it.quantity}</span>
                        <span className="font-mono font-medium">{formatCurrency(it.subTotal)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Actions sur le PO */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => window.print()}
                      className="px-2 py-1 rounded bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs flex items-center gap-1"
                    >
                      <Printer className="w-3 h-3" />
                      <span>Imprimer Bon PDF</span>
                    </button>

                    {po.status !== 'RECU' && (
                      <button
                        onClick={() => onReceivePurchaseOrder(po.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Réceptionner Stock & Recalculer CMP</span>
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* ================= MODAL CRÉATION BON DE COMMANDE ================= */}
      {isPoModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form onSubmit={handleQuickPoSubmit} className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-stone-200">
            <h3 className="font-bold text-base text-stone-900 mb-1">Émission d'un Bon de Commande Fournisseur</h3>
            <p className="text-xs text-stone-500 mb-4">Fournisseur : {selectedSupplier.name}</p>

            <div className="space-y-3 text-xs mb-4">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">Article à Réapprovisionner :</label>
                <select
                  value={poProductCode}
                  onChange={(e) => setPoProductCode(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded p-2 text-stone-900 text-xs"
                >
                  {products.map(p => (
                    <option key={p.code} value={p.code}>
                      {p.name} ({p.code}) - Stock: {p.stockQty} - ROP: {p.reorderPoint}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Quantité à Commander (Unités/Cartons) :</label>
                <input
                  type="number"
                  min={1}
                  value={poQuantity}
                  onChange={(e) => setPoQuantity(Number(e.target.value))}
                  className="w-full bg-stone-50 border border-stone-300 rounded p-2 font-mono text-stone-900"
                />
              </div>

              <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
                <div className="flex justify-between">
                  <span>Coût d'achat unitaire (CMP) :</span>
                  <span className="font-mono font-bold">{formatCurrency(products.find(p => p.code === poProductCode)?.costPrice || 0)}</span>
                </div>
                <div className="flex justify-between font-bold text-emerald-800 pt-1 border-t border-stone-200 mt-1">
                  <span>Total Estimé Bon :</span>
                  <span className="font-mono">{formatCurrency((products.find(p => p.code === poProductCode)?.costPrice || 0) * poQuantity)}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsPoModalOpen(false)}
                className="flex-1 py-2.5 rounded-lg border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-100"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Transmettre PO</span>
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
