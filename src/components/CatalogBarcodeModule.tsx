import React, { useState } from 'react';
import { 
  Barcode, 
  Plus, 
  Printer, 
  Check, 
  Layers, 
  Search, 
  Sparkles, 
  QrCode, 
  Hash,
  Tag
} from 'lucide-react';
import { Product, ShelfDepartment, UnitType } from '../types';
import { calculateEan13Checksum, formatCurrency } from '../data/mockDatabase';

interface CatalogBarcodeModuleProps {
  products: Product[];
  onAddProduct: (prod: Product) => void;
}

export const CatalogBarcodeModule: React.FC<CatalogBarcodeModuleProps> = ({
  products,
  onAddProduct,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('TOUS');

  // Generator State
  const [generatorType, setGeneratorType] = useState<'EAN13' | 'CODE128' | 'QR'>('EAN13');
  const [prefixDigits, setPrefixDigits] = useState('200000000080'); // 12 digits for internal supermarket products
  const [generatedBarcode, setGeneratedBarcode] = useState('');
  const [previewProduct, setPreviewProduct] = useState<Product | null>(products[0] || null);

  // New Product Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdDept, setNewProdDept] = useState<ShelfDepartment>('Épicerie');
  const [newProdCategory, setNewProdCategory] = useState('');
  const [newProdBrand, setNewProdBrand] = useState('');
  const [newProdUnit, setNewProdUnit] = useState<UnitType>('piece');
  const [newProdConversion, setNewProdConversion] = useState<number>(1);
  const [newProdPrice, setNewProdPrice] = useState<number>(1000);
  const [newProdCost, setNewProdCost] = useState<number>(750);
  const [newProdStock, setNewProdStock] = useState<number>(20);
  const [newProdDlc, setNewProdDlc] = useState<string>('');
  const [newProdWeighed, setNewProdWeighed] = useState<boolean>(false);

  // Calculate EAN-13 automatically
  const handleGenerateEan = () => {
    if (generatorType === 'EAN13') {
      const clean12 = prefixDigits.padEnd(12, '0').slice(0, 12);
      const checksum = calculateEan13Checksum(clean12);
      const fullEan = `${clean12}${checksum}`;
      setGeneratedBarcode(fullEan);
    } else if (generatorType === 'CODE128') {
      setGeneratedBarcode(`INT-SUPER-${Math.floor(10000 + Math.random() * 90000)}`);
    } else {
      setGeneratedBarcode(`QR-OMNI-${Date.now()}`);
    }
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim()) return;

    const randomCode = `PRD-${String(products.length + 1).padStart(3, '0')}`;
    const clean12 = `20000000${String(products.length + 1).padStart(4, '0')}`;
    const checksum = calculateEan13Checksum(clean12);
    const barcode = `${clean12}${checksum}`;

    const newProd: Product = {
      code: randomCode,
      barcode,
      name: newProdName,
      department: newProdDept,
      category: newProdCategory || 'Général',
      brand: newProdBrand || 'Marque Interne',
      shelfLocation: `Rayon ${newProdDept.charAt(0)}-0${products.length + 1}`,
      unit: newProdUnit,
      baseUnit: newProdUnit === 'carton' ? 'piece' : newProdUnit === 'pack' ? 'piece' : newProdUnit,
      conversionFactor: newProdConversion,
      costPrice: newProdCost,
      sellingPrice: newProdPrice,
      stockQty: newProdStock,
      minStockAlert: 5,
      safetyStock: 6,
      reorderPoint: 12,
      eoq: 24,
      dlc: newProdDlc || undefined,
      isWeighed: newProdWeighed,
      leadTimeDays: 2,
      dailyDemandAvg: 3,
      imageEmoji: '📦'
    };

    onAddProduct(newProd);
    setIsAddModalOpen(false);
    // Reset form
    setNewProdName('');
  };

  const filtered = products.filter(p => {
    const matchDept = selectedDept === 'TOUS' || p.department === selectedDept;
    const matchSearch = searchTerm === '' || 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.barcode.includes(searchTerm);
    return matchDept && matchSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Top action bar */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            id="catalog-search-input"
            type="text"
            placeholder="Rechercher article, code interne ou code-barres EAN13..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-stone-50"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            id="catalog-dept-select"
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="bg-stone-50 border border-stone-300 rounded-lg px-2.5 py-2 text-xs text-stone-700"
          >
            {['TOUS', 'Épicerie', 'Frais & Crèmerie', 'Boissons', 'Fruits & Légumes', 'Boucherie & Poisson', 'Hygiène & Entretien'].map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <button
            id="add-new-product-btn"
            onClick={() => setIsAddModalOpen(true)}
            className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvel Article</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ================= CATALOGUE ET CONVERSIONS MULTI-UNITÉS (Lg: 8 cols) ================= */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-stone-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-sm tracking-wide">RÉFÉRENTIEL PRODUITS & UNITÉS MULTIPLES</h3>
            </div>
            <span className="text-xs text-stone-400 font-mono">{filtered.length} références</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-100 text-stone-600 border-b border-stone-200 uppercase text-[10px] font-bold tracking-wider">
                  <th className="p-3">Produit & Code</th>
                  <th className="p-3">Code-Barres</th>
                  <th className="p-3">Gestion Multi-Unités</th>
                  <th className="p-3">Prix TTC</th>
                  <th className="p-3">CMP Achat</th>
                  <th className="p-3 text-right">Étiquette</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filtered.map((prod) => (
                  <tr key={prod.code} className="hover:bg-stone-50 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{prod.imageEmoji}</span>
                        <div>
                          <span className="font-bold text-stone-900 block">{prod.name}</span>
                          <span className="text-[10px] text-stone-500">{prod.department} • {prod.shelfLocation}</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-3">
                      <span className="font-mono text-xs font-semibold text-stone-800 block">{prod.barcode}</span>
                      <span className="text-[10px] text-stone-400 font-mono">{prod.code}</span>
                    </td>

                    <td className="p-3">
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-50 text-blue-900 border border-blue-200">
                        <span className="font-bold">{prod.unit}</span>
                        {prod.conversionFactor > 1 && (
                          <span className="text-[10px] text-blue-700 font-mono">
                            (= {prod.conversionFactor} {prod.baseUnit}s)
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-3 font-mono font-bold text-stone-900">
                      {formatCurrency(prod.sellingPrice)}
                    </td>

                    <td className="p-3 font-mono text-stone-500">
                      {formatCurrency(prod.costPrice)}
                    </td>

                    <td className="p-3 text-right">
                      <button
                        id={`preview-tag-${prod.code}`}
                        onClick={() => setPreviewProduct(prod)}
                        className="p-1.5 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs inline-flex items-center gap-1"
                        title="Prévisualiser l'étiquette de rayon"
                      >
                        <Tag className="w-3 h-3" />
                        <span>Étiquette</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ================= GÉNÉRATEUR CODE-BARRES & ÉTIQUETTE RAYON (Lg: 4 cols) ================= */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Générateur EAN13 */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-4">
            <div className="flex items-center gap-2 border-b border-stone-100 pb-2 mb-3">
              <Barcode className="w-4 h-4 text-emerald-600" />
              <h4 className="font-bold text-xs text-stone-900 uppercase">Générateur Code-Barres Interne</h4>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex gap-1">
                {(['EAN13', 'CODE128', 'QR'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setGeneratorType(t)}
                    className={`flex-1 py-1 rounded text-xs font-bold border ${
                      generatorType === t ? 'bg-stone-900 text-white border-stone-900' : 'bg-stone-50 text-stone-700 border-stone-200'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {generatorType === 'EAN13' && (
                <div>
                  <label className="text-[11px] text-stone-600 block mb-1">Préfixe 12 Chiffres (Supermarché) :</label>
                  <input
                    type="text"
                    maxLength={12}
                    value={prefixDigits}
                    onChange={(e) => setPrefixDigits(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-stone-50 border border-stone-300 rounded px-2 py-1.5 font-mono text-xs text-stone-900"
                  />
                  <p className="text-[10px] text-stone-400 mt-0.5">Le 13ème chiffre (clé de contrôle modulo 10) est calculé automatiquement.</p>
                </div>
              )}

              <button
                id="generate-barcode-btn"
                onClick={handleGenerateEan}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Générer Code-Barres</span>
              </button>

              {generatedBarcode && (
                <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg text-center">
                  <span className="text-[10px] text-stone-500 block uppercase font-mono">Code Généré Conforme GS1 :</span>
                  <span className="text-base font-black font-mono text-stone-900 block my-1">{generatedBarcode}</span>
                  {/* Visuel simulé code barres */}
                  <div className="flex justify-center items-center h-8 gap-0.5 px-4 bg-white border border-stone-300 rounded my-1">
                    {[3,1,2,1,4,1,2,3,1,2,1,3,2,1,4,2,1,3,1,2,1,4].map((h, i) => (
                      <div key={i} className="bg-black h-full" style={{ width: `${(i % 3) + 1}px` }} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Prévisualisation Étiquette Linéaire Rayon */}
          {previewProduct && (
            <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-2 mb-3">
                <span className="font-bold text-xs text-stone-900 uppercase">Étiquette Linéaire (Gondole)</span>
                <button
                  onClick={() => window.print()}
                  className="text-stone-500 hover:text-stone-800 p-1"
                  title="Imprimer l'étiquette sur imprimante thermique"
                >
                  <Printer className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Étiquette Linéaire Format Supermarché */}
              <div className="p-3 bg-amber-50/30 border-2 border-dashed border-stone-300 rounded-xl text-stone-900">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-extrabold text-xs block leading-tight">{previewProduct.name}</span>
                    <span className="text-[10px] text-stone-500">{previewProduct.brand} • {previewProduct.shelfLocation}</span>
                  </div>
                  <span className="text-lg">{previewProduct.imageEmoji}</span>
                </div>

                <div className="my-2 py-1 border-y border-stone-200 flex items-baseline justify-between">
                  <span className="text-xl font-black font-mono text-emerald-800">
                    {formatCurrency(previewProduct.sellingPrice)}
                  </span>
                  <span className="text-[10px] text-stone-500 font-mono">
                    Prix/{previewProduct.unit}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  {/* Faux code barres */}
                  <div>
                    <div className="flex h-6 gap-0.5 bg-white p-0.5 border border-stone-300">
                      {[2,1,3,1,2,4,1,2,3,1,2,1,3,1,2].map((w, i) => (
                        <div key={i} className="bg-black h-full" style={{ width: `${(i % 2) + 1}px` }} />
                      ))}
                    </div>
                    <span className="font-mono text-[9px] text-stone-600 block mt-0.5">{previewProduct.barcode}</span>
                  </div>

                  <span className="text-[9px] font-mono text-stone-400">REF: {previewProduct.code}</span>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* ================= MODAL AJOUT PRODUIT ================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreateProduct} className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200">
            <h3 className="font-bold text-base text-stone-900 mb-3">Ajout d'un Nouvel Article au Catalogue</h3>

            <div className="grid grid-cols-2 gap-3 text-xs mb-4">
              <div className="col-span-2">
                <label className="font-semibold text-stone-700 block mb-1">Désignation Commerciale :</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Biscuits Sablés Chocolat 250g"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded px-2.5 py-1.5"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Rayon :</label>
                <select
                  value={newProdDept}
                  onChange={(e) => setNewProdDept(e.target.value as ShelfDepartment)}
                  className="w-full bg-stone-50 border border-stone-300 rounded px-2 py-1.5"
                >
                  {['Épicerie', 'Frais & Crèmerie', 'Boissons', 'Fruits & Légumes', 'Boucherie & Poisson', 'Hygiène & Entretien'].map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Marque :</label>
                <input
                  type="text"
                  placeholder="Ex: Lu, Nestlé, Locale..."
                  value={newProdBrand}
                  onChange={(e) => setNewProdBrand(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded px-2 py-1.5"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Unité de Vente :</label>
                <select
                  value={newProdUnit}
                  onChange={(e) => setNewProdUnit(e.target.value as UnitType)}
                  className="w-full bg-stone-50 border border-stone-300 rounded px-2 py-1.5"
                >
                  <option value="piece">Pièce</option>
                  <option value="carton">Carton (Multi-unités)</option>
                  <option value="pack">Pack</option>
                  <option value="kg">Kilogramme (Balance)</option>
                  <option value="litre">Litre</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Facteur de Conversion :</label>
                <input
                  type="number"
                  min={1}
                  value={newProdConversion}
                  onChange={(e) => setNewProdConversion(Number(e.target.value))}
                  className="w-full bg-stone-50 border border-stone-300 rounded px-2.5 py-1.5 font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Prix de Vente TTC (FCFA) :</label>
                <input
                  type="number"
                  required
                  value={newProdPrice}
                  onChange={(e) => setNewProdPrice(Number(e.target.value))}
                  className="w-full bg-stone-50 border border-stone-300 rounded px-2.5 py-1.5 font-mono font-bold text-emerald-800"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Coût d'Achat CMP (FCFA) :</label>
                <input
                  type="number"
                  required
                  value={newProdCost}
                  onChange={(e) => setNewProdCost(Number(e.target.value))}
                  className="w-full bg-stone-50 border border-stone-300 rounded px-2.5 py-1.5 font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Date Limite (DLC optionnelle) :</label>
                <input
                  type="date"
                  value={newProdDlc}
                  onChange={(e) => setNewProdDlc(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded px-2.5 py-1.5 text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Stock Initial :</label>
                <input
                  type="number"
                  value={newProdStock}
                  onChange={(e) => setNewProdStock(Number(e.target.value))}
                  className="w-full bg-stone-50 border border-stone-300 rounded px-2.5 py-1.5 font-mono"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="flex-1 py-2.5 rounded-lg border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-100"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Créer l'Article
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
