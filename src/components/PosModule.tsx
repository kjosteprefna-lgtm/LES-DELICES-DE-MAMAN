import React, { useState, useMemo } from 'react';
import { 
  Barcode, 
  Scale, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard, 
  Banknote, 
  Smartphone, 
  UserCheck, 
  Percent, 
  Lock, 
  Printer, 
  CheckCircle2, 
  RotateCcw,
  Sparkles,
  QrCode,
  Layers
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Product, CartItem, Customer, PaymentMethod, MobileMoneyProvider, SaleTransaction } from '../types';
import { getDlcDynamicPricing, formatCurrency } from '../data/mockDatabase';

interface PosModuleProps {
  products: Product[];
  customers: Customer[];
  onCompleteSale: (sale: SaleTransaction) => void;
  onOpenDrawerNoSale: () => void;
  isOnline: boolean;
  currentRole: string;
  cashierName: string;
}

export const PosModule: React.FC<PosModuleProps> = ({
  products,
  customers,
  onCompleteSale,
  onOpenDrawerNoSale,
  isOnline,
  currentRole,
  cashierName,
}) => {
  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('TOUS');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Connected Scale state
  const [connectedScaleWeight, setConnectedScaleWeight] = useState<number>(0.450); // in kg
  const [isTareActive, setIsTareActive] = useState<boolean>(false);
  const [selectedWeighedProduct, setSelectedWeighedProduct] = useState<Product | null>(null);

  // Payment Modal
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('ESPECES');
  const [mobileProvider, setMobileProvider] = useState<MobileMoneyProvider>('WAVE');
  const [cashTendered, setCashTendered] = useState<number>(0);
  const [mobileRefCode, setMobileRefCode] = useState<string>('WAV-CI-' + Math.floor(100000 + Math.random() * 900000));
  
  // Manager Override PIN
  const [managerPinModal, setManagerPinModal] = useState<{ open: boolean; action: 'DISCOUNT' | 'CANCEL_ITEM' | 'CREDIT_OVERRIDE'; targetIndex?: number }>({ open: false, action: 'DISCOUNT' });
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState(false);

  // Last Completed Receipt
  const [lastReceipt, setLastReceipt] = useState<SaleTransaction | null>(null);

  // Departments for Quick Touch grid
  const departments = ['TOUS', 'Épicerie', 'Frais & Crèmerie', 'Boissons', 'Fruits & Légumes', 'Boucherie & Poisson', 'Hygiène & Entretien'];

  // Filtered product grid
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchDept = selectedDepartment === 'TOUS' || p.department === selectedDepartment;
      const matchSearch = barcodeInput === '' || 
        p.name.toLowerCase().includes(barcodeInput.toLowerCase()) || 
        p.code.toLowerCase().includes(barcodeInput.toLowerCase()) ||
        p.barcode.includes(barcodeInput);
      return matchDept && matchSearch;
    });
  }, [products, selectedDepartment, barcodeInput]);

  // Cart calculations
  const subTotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + (item.originalUnitPrice * item.quantity), 0);
  }, [cart]);

  const grandTotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.subTotal, 0);
  }, [cart]);

  const discountTotal = useMemo(() => {
    return Math.max(0, subTotal - grandTotal);
  }, [subTotal, grandTotal]);

  const changeDue = useMemo(() => {
    return Math.max(0, cashTendered - grandTotal);
  }, [cashTendered, grandTotal]);

  // Add standard or dynamic product to cart
  const addToCart = (product: Product, quantity = 1, customWeightKg?: number) => {
    const dlcInfo = getDlcDynamicPricing(product);

    if (dlcInfo.status === 'EXPIRED') {
      alert(`⚠️ PRODUIT PÉRIMÉ ! La vente de l'article "${product.name}" est strictement interdite par la réglementation sanitaire.`);
      return;
    }

    const isWeightItem = product.isWeighed;
    const effectiveQty = isWeightItem ? (customWeightKg || connectedScaleWeight) : quantity;
    const effectivePrice = dlcInfo.effectivePrice;
    const itemSubtotal = Math.round(effectivePrice * effectiveQty);

    const existingIndex = cart.findIndex(i => i.productCode === product.code);
    if (existingIndex >= 0 && !isWeightItem) {
      const updated = [...cart];
      const newQty = updated[existingIndex].quantity + quantity;
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: newQty,
        subTotal: Math.round(updated[existingIndex].effectiveUnitPrice * newQty)
      };
      setCart(updated);
    } else {
      const newItem: CartItem = {
        id: `ITEM-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        productCode: product.code,
        name: product.name,
        barcode: product.barcode,
        unit: product.unit,
        quantity: effectiveQty,
        weightKg: isWeightItem ? effectiveQty : undefined,
        originalUnitPrice: product.sellingPrice,
        discountPercent: dlcInfo.discountPercent,
        effectiveUnitPrice: effectivePrice,
        subTotal: itemSubtotal,
        isDlcPromo: dlcInfo.discountPercent > 0,
        dlcDaysRemaining: dlcInfo.daysRemaining !== null ? dlcInfo.daysRemaining : undefined
      };
      setCart(prev => [newItem, ...prev]);
    }
  };

  // Scan input handler
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    const found = products.find(p => p.barcode === barcodeInput.trim() || p.code.toLowerCase() === barcodeInput.trim().toLowerCase());
    if (found) {
      if (found.isWeighed) {
        setSelectedWeighedProduct(found);
      } else {
        addToCart(found, 1);
      }
      setBarcodeInput('');
    } else {
      alert(`Code-barres inconnu : "${barcodeInput}". Vérifiez le catalogue ou entrez la désignation.`);
    }
  };

  // Adjust quantity
  const updateQuantity = (index: number, delta: number) => {
    const updated = [...cart];
    const item = updated[index];
    const newQty = item.quantity + delta;

    if (newQty <= 0) {
      // Prompt manager pin for item cancellation
      setManagerPinModal({ open: true, action: 'CANCEL_ITEM', targetIndex: index });
    } else {
      item.quantity = newQty;
      item.subTotal = Math.round(item.effectiveUnitPrice * newQty);
      setCart(updated);
    }
  };

  const removeItemDirect = (index: number) => {
    setManagerPinModal({ open: true, action: 'CANCEL_ITEM', targetIndex: index });
  };

  // Verify PIN (Default manager PIN: 1234 or 9999)
  const handleVerifyPin = () => {
    if (enteredPin === '1234' || enteredPin === '9999') {
      if (managerPinModal.action === 'CANCEL_ITEM' && managerPinModal.targetIndex !== undefined) {
        const updated = cart.filter((_, idx) => idx !== managerPinModal.targetIndex);
        setCart(updated);
      }
      setManagerPinModal({ open: false, action: 'DISCOUNT' });
      setEnteredPin('');
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  // Open Checkout
  const openCheckout = () => {
    if (cart.length === 0) return;
    setCashTendered(grandTotal);
    setIsPaymentModalOpen(true);
  };

  // Finalize Sale
  const handleFinalizeSale = () => {
    if (paymentMethod === 'CREDIT_CLIENT') {
      if (!selectedCustomer) {
        alert('Erreur : Veuillez sélectionner un client enregistré pour la vente à crédit.');
        return;
      }
      if (selectedCustomer.currentCredit + grandTotal > selectedCustomer.creditLimit) {
        alert(`Dépassement de plafond de crédit ! Dette actuelle : ${formatCurrency(selectedCustomer.currentCredit)}, Plafond : ${formatCurrency(selectedCustomer.creditLimit)}.`);
        return;
      }
    }

    const receiptNum = `TCK-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newSale: SaleTransaction = {
      id: `SALE-${Date.now()}`,
      receiptNumber: receiptNum,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      cashierName,
      cashierRole: currentRole,
      items: [...cart],
      subTotal,
      discountTotal,
      taxTotal: Math.round(grandTotal * 0.18), // simulation TVA 18%
      grandTotal,
      amountPaid: paymentMethod === 'ESPECES' ? cashTendered : grandTotal,
      changeGiven: paymentMethod === 'ESPECES' ? changeDue : 0,
      paymentMethod,
      mobileProvider: paymentMethod === 'MOBILE_MONEY' ? mobileProvider : undefined,
      mobileReference: paymentMethod === 'MOBILE_MONEY' ? mobileRefCode : undefined,
      customerId: selectedCustomer?.id,
      customerName: selectedCustomer?.name,
      syncStatus: isOnline ? 'SYNCHRONISE' : 'EN_ATTENTE_SYNC'
    };

    onCompleteSale(newSale);
    setLastReceipt(newSale);
    setIsPaymentModalOpen(false);
    setCart([]);
    setSelectedCustomer(null);

    // Confetti effect on cash register success
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      
      {/* ================= GAUCHE : TICKET DE CAISSE ACTIF (Lg: 5 cols) ================= */}
      <div className="lg:col-span-5 flex flex-col bg-white rounded-xl shadow-xs border border-stone-200 overflow-hidden h-[calc(100vh-6.5rem)]">
        
        {/* En-tête Ticket & Statut */}
        <div className="p-3 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-sm tracking-wide">TICKET DE CAISSE EN COURS</h2>
              <span className="text-[10px] bg-emerald-600 px-1.5 py-0.5 rounded font-mono font-medium">
                {cart.length} article{cart.length > 1 ? 's' : ''}
              </span>
            </div>
            <p className="text-[11px] text-stone-400">Opérateur : {cashierName} • {currentRole}</p>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              id="drawer-open-btn"
              onClick={onOpenDrawerNoSale}
              className="p-1.5 rounded bg-stone-800 hover:bg-stone-700 text-amber-300 text-xs flex items-center gap-1 border border-stone-700"
              title="Ouvrir le tiroir caisse sans vente (Journalisé dans l'Audit)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tiroir</span>
            </button>
            <button
              id="clear-cart-btn"
              onClick={() => cart.length > 0 && setCart([])}
              disabled={cart.length === 0}
              className="p-1.5 rounded bg-red-900/40 hover:bg-red-800/60 text-red-300 text-xs flex items-center gap-1 border border-red-800 disabled:opacity-30"
              title="Vider le panier"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Sélection Client & Fidélité */}
        <div className="p-2.5 bg-stone-50 border-b border-stone-200 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-stone-700 font-medium">
            <UserCheck className="w-4 h-4 text-emerald-600" />
            <span>Client :</span>
          </div>

          <select
            id="cart-customer-select"
            value={selectedCustomer?.id || ''}
            onChange={(e) => {
              const cust = customers.find(c => c.id === e.target.value) || null;
              setSelectedCustomer(cust);
            }}
            className="flex-1 bg-white border border-stone-300 rounded px-2 py-1 text-xs text-stone-800 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
          >
            <option value="">Passage Anonyme (Comptant)</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.tier} - Points: {c.loyaltyPoints} | Arriéré: {formatCurrency(c.currentCredit)})
              </option>
            ))}
          </select>

          {selectedCustomer && (
            <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
              +{Math.round(grandTotal / 100)} pts
            </span>
          )}
        </div>

        {/* Liste des lignes du ticket */}
        <div className="flex-1 overflow-y-auto divide-y divide-stone-100 p-2 space-y-1">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-stone-400 p-6 text-center">
              <Barcode className="w-12 h-12 text-stone-300 mb-2 stroke-[1.5]" />
              <p className="font-semibold text-stone-600 text-sm">Panier vide</p>
              <p className="text-xs text-stone-400 mt-1 max-w-xs">
                Scannez un code-barres avec la douchette ou touchez un produit dans la grille tactile.
              </p>
            </div>
          ) : (
            cart.map((item, idx) => (
              <div 
                key={item.id} 
                className="p-2 rounded-lg hover:bg-stone-50 transition-colors flex items-center justify-between gap-2 border border-stone-100"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-xs text-stone-900 truncate">{item.name}</span>
                    {item.isDlcPromo && (
                      <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                        <Sparkles className="w-2.5 h-2.5 mr-0.5 text-amber-600" />
                        -{item.discountPercent}% DLC
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 text-[11px] text-stone-500 mt-0.5">
                    <span>
                      {item.quantity} {item.unit} x {formatCurrency(item.effectiveUnitPrice)}
                    </span>
                    {item.discountPercent > 0 && (
                      <span className="line-through text-stone-400">
                        {formatCurrency(item.originalUnitPrice)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Quantité +/- et Sous-Total */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center border border-stone-300 rounded bg-white overflow-hidden">
                    <button
                      id={`qty-minus-${idx}`}
                      onClick={() => updateQuantity(idx, -1)}
                      className="p-1 hover:bg-stone-100 text-stone-600"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-2 font-mono text-xs font-semibold text-stone-800 min-w-[24px] text-center">
                      {item.quantity}
                    </span>
                    <button
                      id={`qty-plus-${idx}`}
                      onClick={() => updateQuantity(idx, 1)}
                      className="p-1 hover:bg-stone-100 text-stone-600"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="w-20 text-right">
                    <span className="font-bold text-xs text-stone-900 block font-mono">
                      {formatCurrency(item.subTotal)}
                    </span>
                  </div>

                  <button
                    id={`remove-item-${idx}`}
                    onClick={() => removeItemDirect(idx)}
                    className="text-stone-400 hover:text-red-600 p-1"
                    title="Supprimer article (requiert code responsable)"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Totaux & Raccourcis Encaissement */}
        <div className="p-3 bg-stone-50 border-t border-stone-200">
          <div className="space-y-1 text-xs mb-2">
            <div className="flex justify-between text-stone-600">
              <span>Sous-total Brut :</span>
              <span className="font-mono">{formatCurrency(subTotal)}</span>
            </div>
            {discountTotal > 0 && (
              <div className="flex justify-between text-amber-700 font-semibold">
                <span className="flex items-center gap-1">
                  <Percent className="w-3 h-3" /> Remise Anti-Gaspillage DLC :
                </span>
                <span className="font-mono">-{formatCurrency(discountTotal)}</span>
              </div>
            )}
            <div className="flex justify-between text-xs text-stone-500">
              <span>TVA incluse (estim. 18%) :</span>
              <span className="font-mono">{formatCurrency(Math.round(grandTotal * 0.18))}</span>
            </div>
          </div>

          <div className="bg-emerald-950 text-white p-3 rounded-lg flex items-center justify-between mb-3 shadow-inner">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-emerald-300 font-bold block">TOTAL NET À PAYER</span>
              <span className="text-2xl font-black font-mono tracking-tight text-white">
                {formatCurrency(grandTotal)}
              </span>
            </div>
            <div className="text-right text-[11px] text-emerald-300">
              {cart.length > 0 && <span>{cart.reduce((a, b) => a + b.quantity, 0)} unités scannées</span>}
            </div>
          </div>

          {/* Gros Bouton d'encaissement */}
          <button
            id="checkout-trigger-btn"
            disabled={cart.length === 0}
            onClick={openCheckout}
            className="w-full py-3 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-stone-300 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:cursor-not-allowed"
          >
            <Banknote className="w-5 h-5" />
            <span>ENCAISSER ({formatCurrency(grandTotal)})</span>
          </button>
        </div>

      </div>

      {/* ================= DROITE : RECHERCHE, BALANCE ET GRILLE TACTILE (Lg: 7 cols) ================= */}
      <div className="lg:col-span-7 flex flex-col gap-3">
        
        {/* Barre de Scan Rapide & Douchette Barcode */}
        <div className="bg-white p-3 rounded-xl shadow-xs border border-stone-200">
          <form onSubmit={handleBarcodeSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
              <input
                id="pos-barcode-input"
                type="text"
                placeholder="Scanner code-barres EAN13 ou taper nom (ex: 3017620422003, Lait, Yaourt, PRD-004)..."
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                className="w-full pl-10 pr-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-stone-50 text-stone-900"
              />
            </div>
            <button
              id="pos-scan-submit-btn"
              type="submit"
              className="px-4 py-2 rounded-lg bg-stone-900 text-white hover:bg-stone-800 text-xs font-bold flex items-center gap-1.5"
            >
              <Barcode className="w-4 h-4" />
              <span>Valider Scan</span>
            </button>
          </form>
        </div>

        {/* Simulateur de Balance Connectée & Pesée Automatique */}
        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-950 uppercase tracking-wide">Balance Connectée (RS232/USB)</span>
                <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.2 rounded font-mono">Stable</span>
              </div>
              <p className="text-[11px] text-amber-800">
                Poids sur plateau : <strong className="font-mono text-xs">{connectedScaleWeight.toFixed(3)} kg</strong> {isTareActive && '(Tare active -0.050kg)'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              id="scale-tare-btn"
              onClick={() => setIsTareActive(!isTareActive)}
              className={`px-2 py-1 rounded text-xs font-mono font-medium border ${
                isTareActive ? 'bg-amber-200 text-amber-900 border-amber-400' : 'bg-white text-stone-700 border-stone-300'
              }`}
            >
              TARE (0.000)
            </button>

            {/* Quick weight presets */}
            {[0.250, 0.450, 0.750, 1.200, 2.500].map(w => (
              <button
                key={w}
                id={`scale-weight-${w}`}
                onClick={() => setConnectedScaleWeight(w)}
                className={`px-2 py-1 rounded text-xs font-mono ${
                  connectedScaleWeight === w ? 'bg-amber-600 text-white font-bold' : 'bg-white text-stone-700 border border-stone-300'
                }`}
              >
                {w.toFixed(3)} kg
              </button>
            ))}
          </div>
        </div>

        {/* Filtres par Rayons / Catégories */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
          {departments.map((dept) => (
            <button
              key={dept}
              id={`dept-tab-${dept}`}
              onClick={() => setSelectedDepartment(dept)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedDepartment === dept
                  ? 'bg-stone-900 text-white'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>

        {/* Grille Tactile des Produits */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5 overflow-y-auto max-h-[calc(100vh-18rem)] pr-1">
          {filteredProducts.map((prod) => {
            const dlcInfo = getDlcDynamicPricing(prod);
            const isCriticalDlc = dlcInfo.status === 'CRITICAL_50' || dlcInfo.status === 'WARN_20';

            return (
              <div
                key={prod.code}
                id={`product-card-${prod.code}`}
                onClick={() => {
                  if (prod.isWeighed) {
                    setSelectedWeighedProduct(prod);
                  } else {
                    addToCart(prod, 1);
                  }
                }}
                className={`p-2.5 rounded-xl bg-white border text-left flex flex-col justify-between transition-all hover:shadow-md cursor-pointer relative group ${
                  isCriticalDlc 
                    ? 'border-amber-300 ring-1 ring-amber-300 hover:border-amber-400 bg-amber-50/20' 
                    : 'border-stone-200 hover:border-emerald-400'
                }`}
              >
                {/* Badge DLC ou Balance */}
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span className="text-xl select-none">{prod.imageEmoji}</span>
                  <div className="flex flex-col items-end gap-0.5">
                    {prod.isWeighed && (
                      <span className="text-[10px] px-1 py-0.2 rounded bg-amber-100 text-amber-800 font-medium flex items-center gap-0.5">
                        <Scale className="w-2.5 h-2.5" /> Balance
                      </span>
                    )}
                    {dlcInfo.discountPercent > 0 && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${dlcInfo.badgeColor}`}>
                        {dlcInfo.badgeLabel}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-xs text-stone-900 line-clamp-2 leading-snug">
                    {prod.name}
                  </h3>
                  <p className="text-[10px] text-stone-400 mt-0.5">{prod.brand} • {prod.shelfLocation}</p>
                </div>

                <div className="mt-2 pt-2 border-t border-stone-100 flex items-baseline justify-between">
                  <div>
                    <span className="font-black text-xs text-emerald-800 font-mono">
                      {formatCurrency(dlcInfo.effectivePrice)}
                    </span>
                    {dlcInfo.discountPercent > 0 && (
                      <span className="line-through text-[10px] text-stone-400 ml-1 font-mono">
                        {formatCurrency(prod.sellingPrice)}
                      </span>
                    )}
                    <span className="text-[10px] text-stone-500 block">/{prod.unit}</span>
                  </div>

                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    prod.stockQty <= prod.minStockAlert ? 'bg-red-100 text-red-700 font-bold' : 'text-stone-500 bg-stone-100'
                  }`}>
                    Stk: {prod.stockQty}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* ================= MODAL PESÉE PRODUIT AU POIDS ================= */}
      {selectedWeighedProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-stone-200">
            <div className="flex items-center gap-3 border-b border-stone-100 pb-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center text-xl">
                {selectedWeighedProduct.imageEmoji}
              </div>
              <div>
                <h3 className="font-bold text-sm text-stone-900">{selectedWeighedProduct.name}</h3>
                <p className="text-xs text-stone-500">Produit vendu au poids ({selectedWeighedProduct.unit})</p>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 text-center">
              <span className="text-xs text-amber-800 font-medium block mb-1">POIDS CAPTÉ SUR LA BALANCE</span>
              <div className="text-3xl font-black font-mono text-amber-950">
                {connectedScaleWeight.toFixed(3)} kg
              </div>
              <div className="mt-2 text-xs text-stone-600">
                Prix unitaire : <strong>{formatCurrency(getDlcDynamicPricing(selectedWeighedProduct).effectivePrice)} / kg</strong>
              </div>
              <div className="mt-3 pt-3 border-t border-amber-200/60 flex items-center justify-between text-xs">
                <span className="text-stone-600 font-medium">Prix calculé net :</span>
                <span className="font-black font-mono text-base text-emerald-800">
                  {formatCurrency(Math.round(getDlcDynamicPricing(selectedWeighedProduct).effectivePrice * connectedScaleWeight))}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                id="cancel-scale-btn"
                onClick={() => setSelectedWeighedProduct(null)}
                className="flex-1 py-2 rounded-lg border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-100"
              >
                Annuler
              </button>
              <button
                id="confirm-scale-btn"
                onClick={() => {
                  addToCart(selectedWeighedProduct, connectedScaleWeight, connectedScaleWeight);
                  setSelectedWeighedProduct(null);
                }}
                className="flex-1 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Ajouter au Ticket</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL ENCAISSEMENT MULTI-MODES ================= */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-4">
              <div>
                <h3 className="font-bold text-base text-stone-900">FINALISATION DU PAIEMENT</h3>
                <p className="text-xs text-stone-500">Sélectionnez le mode de règlement</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-stone-400 block">Net à payer</span>
                <span className="font-mono font-black text-xl text-emerald-700">
                  {formatCurrency(grandTotal)}
                </span>
              </div>
            </div>

            {/* Onglets modes de paiement */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              <button
                id="pay-cash-tab"
                onClick={() => setPaymentMethod('ESPECES')}
                className={`p-2.5 rounded-xl border text-center flex flex-col items-center gap-1 transition-all ${
                  paymentMethod === 'ESPECES' ? 'bg-emerald-600 text-white border-emerald-600 font-bold' : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                }`}
              >
                <Banknote className="w-5 h-5" />
                <span className="text-[11px]">Espèces</span>
              </button>

              <button
                id="pay-card-tab"
                onClick={() => setPaymentMethod('CARTE')}
                className={`p-2.5 rounded-xl border text-center flex flex-col items-center gap-1 transition-all ${
                  paymentMethod === 'CARTE' ? 'bg-emerald-600 text-white border-emerald-600 font-bold' : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                }`}
              >
                <CreditCard className="w-5 h-5" />
                <span className="text-[11px]">Carte CB</span>
              </button>

              <button
                id="pay-mobile-tab"
                onClick={() => setPaymentMethod('MOBILE_MONEY')}
                className={`p-2.5 rounded-xl border text-center flex flex-col items-center gap-1 transition-all ${
                  paymentMethod === 'MOBILE_MONEY' ? 'bg-emerald-600 text-white border-emerald-600 font-bold' : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                }`}
              >
                <Smartphone className="w-5 h-5" />
                <span className="text-[11px]">Mobile Money</span>
              </button>

              <button
                id="pay-credit-tab"
                onClick={() => setPaymentMethod('CREDIT_CLIENT')}
                className={`p-2.5 rounded-xl border text-center flex flex-col items-center gap-1 transition-all ${
                  paymentMethod === 'CREDIT_CLIENT' ? 'bg-emerald-600 text-white border-emerald-600 font-bold' : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                }`}
              >
                <UserCheck className="w-5 h-5" />
                <span className="text-[11px]">Crédit Client</span>
              </button>
            </div>

            {/* Corps du mode de paiement sélectionné */}
            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 mb-5 min-h-[160px] flex flex-col justify-center">
              
              {/* --- ESPÈCES --- */}
              {paymentMethod === 'ESPECES' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <label className="text-xs font-semibold text-stone-700">Montant Reçu :</label>
                    <div className="flex items-center gap-2">
                      <input
                        id="cash-tendered-input"
                        type="number"
                        value={cashTendered || ''}
                        onChange={(e) => setCashTendered(Number(e.target.value))}
                        className="w-36 bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 font-mono text-sm font-bold text-right text-stone-900"
                      />
                      <span className="text-xs text-stone-500">FCFA</span>
                    </div>
                  </div>

                  {/* Raccourcis billets */}
                  <div className="flex gap-1.5 justify-end">
                    {[grandTotal, 5000, 10000, 20000, 50000].map((amt) => (
                      <button
                        key={amt}
                        id={`cash-quick-${amt}`}
                        onClick={() => setCashTendered(amt)}
                        className="px-2 py-1 rounded text-[11px] font-mono bg-white border border-stone-300 text-stone-700 hover:bg-stone-200"
                      >
                        {formatCurrency(amt)}
                      </button>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-stone-200 flex items-center justify-between text-xs">
                    <span className="font-bold text-stone-700">Monnaie à Rendre :</span>
                    <span className={`font-mono font-black text-lg ${changeDue >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                      {changeDue >= 0 ? formatCurrency(changeDue) : 'Montant insuffisant !'}
                    </span>
                  </div>
                </div>
              )}

              {/* --- CARTE BANCAIRE --- */}
              {paymentMethod === 'CARTE' && (
                <div className="text-center py-2 space-y-2">
                  <div className="inline-flex p-3 rounded-full bg-blue-100 text-blue-700">
                    <CreditCard className="w-8 h-8 animate-pulse" />
                  </div>
                  <p className="text-xs font-semibold text-stone-800">Terminal TPE Connecté (EMV / Sans-contact)</p>
                  <p className="text-[11px] text-stone-500">Invitez le client à insérer sa carte bancaire ou approcher son smartphone.</p>
                  <span className="inline-block px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 font-mono text-xs font-bold">
                    Autorisation préalable accordée (Code: AUTH-OK-98)
                  </span>
                </div>
              )}

              {/* --- MOBILE MONEY --- */}
              {paymentMethod === 'MOBILE_MONEY' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {(['WAVE', 'ORANGE_MONEY', 'MTN_MOMO', 'AIRTEL_MONEY'] as MobileMoneyProvider[]).map((prov) => (
                      <button
                        key={prov}
                        id={`prov-${prov}`}
                        onClick={() => {
                          setMobileProvider(prov);
                          setMobileRefCode(`${prov.substring(0, 3)}-CI-${Math.floor(100000 + Math.random() * 900000)}`);
                        }}
                        className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold border ${
                          mobileProvider === prov ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-stone-300 text-stone-700'
                        }`}
                      >
                        {prov.replace('_', ' ')}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-stone-200 text-xs">
                    <div className="flex items-center gap-2">
                      <QrCode className="w-8 h-8 text-stone-700" />
                      <div>
                        <span className="font-bold text-stone-800 block">Scan QR Code ou Réf Marchand</span>
                        <span className="font-mono text-stone-500 text-[10px]">{mobileRefCode}</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold">
                      Prêt
                    </span>
                  </div>
                </div>
              )}

              {/* --- CRÉDIT CLIENT --- */}
              {paymentMethod === 'CREDIT_CLIENT' && (
                <div className="space-y-2 text-xs">
                  {selectedCustomer ? (
                    <div>
                      <p className="font-bold text-stone-900">{selectedCustomer.name}</p>
                      <p className="text-stone-500">Téléphone : {selectedCustomer.phone}</p>
                      <div className="mt-2 p-2 bg-white rounded border border-stone-200 space-y-1">
                        <div className="flex justify-between">
                          <span>Plafond autorisé :</span>
                          <span className="font-mono font-bold">{formatCurrency(selectedCustomer.creditLimit)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Arriéré actuel :</span>
                          <span className="font-mono text-amber-700">{formatCurrency(selectedCustomer.currentCredit)}</span>
                        </div>
                        <div className="flex justify-between font-bold pt-1 border-t border-stone-100">
                          <span>Nouveau solde après vente :</span>
                          <span className={`font-mono ${selectedCustomer.currentCredit + grandTotal > selectedCustomer.creditLimit ? 'text-red-600' : 'text-emerald-700'}`}>
                            {formatCurrency(selectedCustomer.currentCredit + grandTotal)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-3 text-red-600">
                      <p className="font-bold">Aucun client sélectionné !</p>
                      <p className="text-[11px] text-stone-500">Veuillez d’abord assigner un compte client sur le ticket pour autoriser un arriéré.</p>
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Boutons actions modal */}
            <div className="flex gap-2">
              <button
                id="cancel-payment-modal-btn"
                onClick={() => setIsPaymentModalOpen(false)}
                className="flex-1 py-2.5 rounded-lg border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-100"
              >
                Retour
              </button>
              <button
                id="confirm-payment-modal-btn"
                disabled={paymentMethod === 'ESPECES' && changeDue < 0}
                onClick={handleFinalizeSale}
                className="flex-1 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-stone-300 text-white text-xs font-bold shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
              >
                <Printer className="w-4 h-4" />
                <span>Valider & Imprimer Ticket</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL CODE PIN RESPONSABLE ================= */}
      {managerPinModal.open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xs w-full p-5 shadow-2xl border border-stone-200 text-center">
            <div className="inline-flex p-3 rounded-full bg-amber-100 text-amber-800 mb-2">
              <Lock className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-sm text-stone-900">Code PIN Responsable Requis</h4>
            <p className="text-[11px] text-stone-500 mb-4">
              L'annulation d'une ligne ou l'octroi d'une remise nécessite l'approbation d'un chef de rayon (Défaut : 1234).
            </p>

            <input
              id="manager-pin-input"
              type="password"
              maxLength={4}
              placeholder="••••"
              value={enteredPin}
              onChange={(e) => setEnteredPin(e.target.value)}
              className="w-full text-center text-xl font-mono tracking-widest py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none mb-2"
            />

            {pinError && <p className="text-xs text-red-600 font-semibold mb-2">Code PIN incorrect !</p>}

            <div className="flex gap-2">
              <button
                id="cancel-pin-btn"
                onClick={() => {
                  setManagerPinModal({ open: false, action: 'DISCOUNT' });
                  setEnteredPin('');
                  setPinError(false);
                }}
                className="flex-1 py-2 rounded-lg border border-stone-300 text-xs font-bold text-stone-700"
              >
                Annuler
              </button>
              <button
                id="submit-pin-btn"
                onClick={handleVerifyPin}
                className="flex-1 py-2 rounded-lg bg-stone-900 text-white text-xs font-bold hover:bg-stone-800"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= DERNIER TICKET IMPRIMÉ ================= */}
      {lastReceipt && (
        <div className="fixed bottom-4 right-4 z-40 bg-stone-900 text-white rounded-xl p-4 shadow-2xl border border-stone-700 max-w-sm w-full animate-bounce-short">
          <div className="flex items-center justify-between pb-2 border-b border-stone-800 mb-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-xs">Vente Validée : {lastReceipt.receiptNumber}</span>
            </div>
            <button
              id="close-last-receipt-btn"
              onClick={() => setLastReceipt(null)}
              className="text-stone-400 hover:text-white text-xs"
            >
              ✕
            </button>
          </div>

          <div className="text-xs space-y-1 text-stone-300">
            <div className="flex justify-between">
              <span>Total Réglé :</span>
              <span className="font-mono font-bold text-emerald-400">{formatCurrency(lastReceipt.grandTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Règlement :</span>
              <span className="font-medium text-stone-200">{lastReceipt.paymentMethod} {lastReceipt.mobileProvider || ''}</span>
            </div>
            <div className="flex justify-between">
              <span>Synchronisation :</span>
              <span className="text-[10px] text-emerald-300 font-mono">{lastReceipt.syncStatus}</span>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-stone-800 flex justify-end">
            <button
              id="print-again-receipt-btn"
              onClick={() => window.print()}
              className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-white rounded text-[11px] flex items-center gap-1"
            >
              <Printer className="w-3 h-3" />
              <span>Réimprimer reçu</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
