import React, { useState } from 'react';
import { 
  Layers, 
  PlusCircle, 
  Search, 
  Edit3, 
  Trash2, 
  Sparkles, 
  Check, 
  FileSpreadsheet,
  ArrowRight
} from 'lucide-react';
import { ProductItem } from '../types';
import { generateReference, formatFCFA } from '../data/initialData';

interface ProduitsModuleProps {
  productsList: ProductItem[];
  onAddProduct: (product: Omit<ProductItem, 'id'>) => void;
  onUpdateProduct: (product: ProductItem) => void;
  onDeleteProduct: (id: string) => void;
  categories: string[];
  units: string[];
}

export const ProduitsModule: React.FC<ProduitsModuleProps> = ({
  productsList,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  categories,
  units
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('TOUTES');

  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [designation, setDesignation] = useState('');
  const [category, setCategory] = useState(categories[0] || 'Produits - Electronique');
  const [sellingPrice, setSellingPrice] = useState<number>(10000);
  const [rankingOrder, setRankingOrder] = useState('E1R1');
  const [unit, setUnit] = useState(units[0] || 'Pce');

  // Auto-calculated reference using Excel formula: =IF($D5=0,"",LEFT($D5,4)&"-"&LEFT($E5,4)&"-"&$G5)
  const autoCalculatedRef = generateReference(designation, category, rankingOrder);

  const handleOpenAdd = () => {
    setEditingId(null);
    setDesignation('');
    setCategory(categories[0] || 'Produits - Electronique');
    setSellingPrice(10000);
    setRankingOrder('E1R1');
    setUnit(units[0] || 'Pce');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (p: ProductItem) => {
    setEditingId(p.id);
    setDesignation(p.designation);
    setCategory(p.category);
    setSellingPrice(p.sellingPrice);
    setRankingOrder(p.rankingOrder);
    setUnit(p.unit);
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!designation.trim()) return;

    if (editingId) {
      const existing = productsList.find(p => p.id === editingId);
      if (existing) {
        onUpdateProduct({
          ...existing,
          reference: autoCalculatedRef,
          designation: designation.trim(),
          category,
          sellingPrice,
          rankingOrder: rankingOrder.trim(),
          unit
        });
      }
    } else {
      onAddProduct({
        reference: autoCalculatedRef,
        designation: designation.trim(),
        category,
        sellingPrice,
        rankingOrder: rankingOrder.trim(),
        unit
      });
    }

    setIsFormOpen(false);
  };

  const filteredProducts = productsList.filter(p => {
    const matchesSearch = 
      p.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.rankingOrder.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'TOUTES' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Title & Action */}
      <div className="bg-white p-5 rounded-3xl border border-amber-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-stone-900 flex items-center gap-2">
              <span>Catalogue des Délices & Saveurs</span>
              <span>🥭</span>
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold font-mono">
              Catalogue Produits
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Catalogue de référence de vos yaourts, coulis, crèmes et fruits avec générateur automatique de référence
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white text-xs font-bold rounded-xl shadow-xs transition-all self-start sm:self-auto cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Ajouter un Délice Fruité</span>
        </button>
      </div>

      {/* Add / Edit Form Modal */}
      {isFormOpen && (
        <div className="bg-white p-6 rounded-2xl border-2 border-emerald-500/40 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <h3 className="text-base font-bold text-stone-900">
              {editingId ? 'Modifier le Produit / Service' : 'Nouveau Produit / Service dans le Catalogue'}
            </h3>
            <button
              onClick={() => setIsFormOpen(false)}
              className="text-xs font-semibold text-stone-500 hover:text-stone-800"
            >
              Fermer
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Désignation de l'article ou service
                </label>
                <input
                  type="text"
                  placeholder="Ex : AMF Genset Controller..."
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Catégorie
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                >
                  {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Prix de vente (FCFA)
                </label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full p-2.5 font-mono bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  N° d'ordre de classement
                </label>
                <input
                  type="text"
                  placeholder="Ex : E1R1, M1R1, A1R1..."
                  value={rankingOrder}
                  onChange={(e) => setRankingOrder(e.target.value)}
                  className="w-full p-2.5 font-mono bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Unité de vente
                </label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                >
                  {units.map(u => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Live Reference Calculation Output Box */}
            <div className="p-3.5 bg-emerald-50/80 rounded-xl border border-emerald-200 flex items-center justify-between">
              <div>
                <span className="text-xs text-emerald-800 font-semibold block">Référence générée dynamiquement :</span>
                <span className="text-sm font-mono font-black text-emerald-900 tracking-wider">
                  {autoCalculatedRef || '— En attente de saisie —'}
                </span>
              </div>
              <div className="text-[11px] text-emerald-700 font-mono">
                {designation.substring(0, 4)} + {category.substring(0, 4)} + {rankingOrder}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-sm cursor-pointer"
              >
                {editingId ? 'Mettre à jour le produit' : 'Enregistrer le produit'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher référence, désignation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="TOUTES">Toutes les catégories ({productsList.length})</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-stone-100 text-stone-700 font-bold border-b border-stone-200 select-none">
                <th className="py-3 px-3 text-center">#</th>
                <th className="py-3 px-3">Référence</th>
                <th className="py-3 px-4">Désignation de l'article ou service</th>
                <th className="py-3 px-3">Catégorie</th>
                <th className="py-3 px-3 text-right">Prix de Vente</th>
                <th className="py-3 px-3 text-center">N° Ordre Classement</th>
                <th className="py-3 px-2 text-center">Unité</th>
                <th className="py-3 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 text-stone-700">
              {filteredProducts.map((p, index) => (
                <tr key={p.id} className="hover:bg-stone-50 transition-colors">
                  <td className="py-3 px-3 text-center font-mono text-stone-400 font-bold">{index + 1}</td>
                  <td className="py-3 px-3 font-mono font-bold text-stone-900 whitespace-nowrap">
                    {p.reference}
                  </td>
                  <td className="py-3 px-4 font-medium text-stone-800">
                    {p.designation}
                  </td>
                  <td className="py-3 px-3 text-stone-600 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 font-mono text-[11px]">
                      {p.category}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700">
                    {formatFCFA(p.sellingPrice)}
                  </td>
                  <td className="py-3 px-3 text-center font-mono text-stone-600 bg-stone-50/50">
                    {p.rankingOrder}
                  </td>
                  <td className="py-3 px-2 text-center font-medium text-stone-600">
                    {p.unit}
                  </td>
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="p-1.5 hover:bg-stone-200 rounded text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
                        title="Modifier"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteProduct(p.id)}
                        className="p-1.5 hover:bg-rose-100 rounded text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-stone-400">
                    Aucun produit trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
