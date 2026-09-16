import React, { useState } from 'react';
import { 
  Settings, 
  Plus, 
  Trash2, 
  RotateCcw, 
  Check, 
  Layers, 
  Scale, 
  FileSpreadsheet,
  Zap,
  Coffee
} from 'lucide-react';
import { CategoryConfig, UnitConfig, SectorType } from '../types';
import { getCategorySector, SECTOR_CONFIG } from '../data/initialData';

interface ConfigurationModuleProps {
  categories: CategoryConfig[];
  units: UnitConfig[];
  onAddCategory: (name: string, sector?: SectorType) => void;
  onDeleteCategory: (id: string) => void;
  onAddUnit: (name: string) => void;
  onDeleteUnit: (id: string) => void;
  onResetAllData: () => void;
}

export const ConfigurationModule: React.FC<ConfigurationModuleProps> = ({
  categories,
  units,
  onAddCategory,
  onDeleteCategory,
  onAddUnit,
  onDeleteUnit,
  onResetAllData
}) => {
  const [newCatName, setNewCatName] = useState('');
  const [newCatSector, setNewCatSector] = useState<SectorType>('ALIMENTATION_PATISSERIE');
  const [newUnitName, setNewUnitName] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleAddCat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    onAddCategory(newCatName.trim(), newCatSector);
    setNewCatName('');
  };

  const handleAddUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnitName.trim()) return;
    onAddUnit(newUnitName.trim());
    setNewUnitName('');
  };

  const alimCategories = categories.filter(
    c => (c.sector || getCategorySector(c.name)) === 'ALIMENTATION_PATISSERIE'
  );
  const techCategories = categories.filter(
    c => (c.sector || getCategorySector(c.name)) === 'TECHNIQUE_INDUSTRIEL'
  );

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-stone-900 flex items-center gap-2">
              <span>Organisation des Catégories & Pôles</span>
              <span>⚙️</span>
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-800 font-bold font-mono">
              2 Pôles Distincts
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Séparation stricte en deux pôles d'activité : <strong>Alimentation Divers & Pâtisserie</strong> d'un côté, et <strong>Électronique, Mécanique & Électricité</strong> de l'autre
          </p>
        </div>

        <button
          onClick={() => setShowResetConfirm(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 transition-all cursor-pointer self-start sm:self-auto shadow-xs"
        >
          <RotateCcw className="w-4 h-4 text-rose-600" />
          <span>Réinitialiser aux Données d'Origine</span>
        </button>
      </div>

      {/* Confirmation Modal for Reset */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-rose-100 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-stone-900">Confirmer la réinitialisation ?</h3>
            <p className="text-xs text-stone-600">
              Cette action va recharger l'ensemble des données d'origine avec la séparation intégrale des deux pôles d'activité.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  onResetAllData();
                  setShowResetConfirm(false);
                }}
                className="px-4 py-2 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
              >
                Oui, Réinitialiser
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Category Form Banner */}
      <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm">
        <h3 className="text-sm font-bold text-stone-900 mb-3 flex items-center gap-2">
          <Plus className="w-4 h-4 text-stone-700" />
          <span>Créer une nouvelle catégorie rattachée à son Pôle</span>
        </h3>
        <form onSubmit={handleAddCat} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-5">
            <label className="block text-[11px] font-semibold text-stone-600 mb-1">Nom de la catégorie</label>
            <input
              type="text"
              placeholder="Ex: Biscuiterie, Câblage, Boissons..."
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-400"
              required
            />
          </div>

          <div className="sm:col-span-5">
            <label className="block text-[11px] font-semibold text-stone-600 mb-1">Pôle d'Appartenance</label>
            <select
              value={newCatSector}
              onChange={(e) => setNewCatSector(e.target.value as SectorType)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-400 font-medium cursor-pointer"
            >
              <option value="ALIMENTATION_PATISSERIE">
                🥐 Alimentation Divers & Pâtisserie
              </option>
              <option value="TECHNIQUE_INDUSTRIEL">
                ⚡ Électronique, Mécanique & Électricité
              </option>
            </select>
          </div>

          <div className="sm:col-span-2 flex items-end">
            <button
              type="submit"
              className="w-full py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter</span>
            </button>
          </div>
        </form>
      </div>

      {/* Grid: The 2 Sectors Side by Side + Units below */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* POLE 1: ALIMENTATION DIVERS & PATISSERIE */}
        <div className="bg-white p-6 rounded-3xl border-2 border-amber-200 shadow-sm space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-28 h-28 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between pb-3 border-b border-amber-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-800 border border-amber-300 flex items-center justify-center font-bold text-base shadow-xs">
                🥐
              </div>
              <div>
                <h2 className="font-bold text-stone-900 text-sm sm:text-base">Alimentation Divers & Pâtisserie</h2>
                <p className="text-[11px] text-amber-800 font-medium">{alimCategories.length} catégories enregistrées</p>
              </div>
            </div>
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 font-bold border border-amber-300">
              Pôle 1
            </span>
          </div>

          <p className="text-xs text-stone-500">
            Regroupe l'ensemble des délices alimentaires, produits d'épicerie, boulangerie, viennoiseries, gâteaux et consommables divers.
          </p>

          <div className="divide-y divide-amber-100 border border-amber-200 rounded-2xl overflow-hidden bg-amber-50/20">
            {alimCategories.map((cat, idx) => (
              <div key={cat.id} className="p-3 flex items-center justify-between hover:bg-amber-50/60 text-xs transition-colors">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center font-mono text-[10px] font-bold border border-amber-200">
                    {idx + 1}
                  </span>
                  <div>
                    <span className="font-bold text-stone-900 block">{cat.name}</span>
                    {cat.description && (
                      <span className="text-[10px] text-stone-500">{cat.description}</span>
                    )}
                  </div>
                </div>
                {categories.length > 1 && (
                  <button
                    onClick={() => onDeleteCategory(cat.id)}
                    className="p-1.5 text-stone-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                    title="Supprimer la catégorie"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* POLE 2: ELECTRONIQUE, MECANIQUE & ELECTRICITE */}
        <div className="bg-white p-6 rounded-3xl border-2 border-blue-200 shadow-sm space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-28 h-28 bg-blue-500/5 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between pb-3 border-b border-blue-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-blue-100 text-blue-800 border border-blue-300 flex items-center justify-center font-bold text-base shadow-xs">
                ⚡
              </div>
              <div>
                <h2 className="font-bold text-stone-900 text-sm sm:text-base">Électronique, Mécanique & Électricité</h2>
                <p className="text-[11px] text-blue-800 font-medium">{techCategories.length} catégories enregistrées</p>
              </div>
            </div>
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-blue-100 text-blue-900 font-bold border border-blue-300">
              Pôle 2
            </span>
          </div>

          <p className="text-xs text-stone-500">
            Regroupe tous les automates, chargeurs, réfrigérants, systèmes de climatisation, démarreurs et équipements techniques.
          </p>

          <div className="divide-y divide-blue-100 border border-blue-200 rounded-2xl overflow-hidden bg-blue-50/20">
            {techCategories.map((cat, idx) => (
              <div key={cat.id} className="p-3 flex items-center justify-between hover:bg-blue-50/60 text-xs transition-colors">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center font-mono text-[10px] font-bold border border-blue-200">
                    {idx + 1}
                  </span>
                  <div>
                    <span className="font-bold text-stone-900 block">{cat.name}</span>
                    {cat.description && (
                      <span className="text-[10px] text-stone-500">{cat.description}</span>
                    )}
                  </div>
                </div>
                {categories.length > 1 && (
                  <button
                    onClick={() => onDeleteCategory(cat.id)}
                    className="p-1.5 text-stone-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                    title="Supprimer la catégorie"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Units Box */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center font-bold text-sm">
              📏
            </div>
            <h2 className="font-bold text-stone-900 text-base">Unités de Conditionnement ({units.length})</h2>
          </div>
          <span className="text-xs text-teal-700 font-mono font-bold">Unités Partagées</span>
        </div>

        <form onSubmit={handleAddUnit} className="flex gap-2">
          <input
            type="text"
            placeholder="Nouvelle unité (ex: Boîte, Paquet, Rouleau, Kg, Litre...)"
            value={newUnitName}
            onChange={(e) => setNewUnitName(e.target.value)}
            className="flex-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
            required
          />
          <button
            type="submit"
            className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ajouter</span>
          </button>
        </form>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {units.map((u, idx) => (
            <div key={u.id} className="p-2.5 flex items-center justify-between bg-stone-50 border border-stone-200 rounded-xl text-xs">
              <span className="font-mono font-bold text-stone-900">{u.name}</span>
              {units.length > 1 && (
                <button
                  onClick={() => onDeleteUnit(u.id)}
                  className="p-1 text-stone-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                  title="Supprimer l'unité"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
