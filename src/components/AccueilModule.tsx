import React from 'react';
import { 
  Package, 
  ShoppingCart, 
  BarChart3, 
  Layers, 
  AlertTriangle, 
  CheckCircle2, 
  DollarSign, 
  TrendingUp, 
  Database,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { StockItem, SaleRecord, getStockFinal, getValeurStock, isAlerteStock, formatFCFA } from '../data/initialData';
import { ActiveTab } from '../types';
import { StockStatusFilter } from './StockModule';

interface AccueilModuleProps {
  stockList: StockItem[];
  salesList: SaleRecord[];
  setActiveTab: (tab: ActiveTab) => void;
  onNavigateToStockWithFilter?: (filter: StockStatusFilter) => void;
}

export const AccueilModule: React.FC<AccueilModuleProps> = ({
  stockList,
  salesList,
  setActiveTab,
  onNavigateToStockWithFilter
}) => {
  const totalValeurStock = stockList.reduce((acc, item) => acc + getValeurStock(item), 0);
  const totalCA = salesList.reduce((acc, sale) => acc + sale.prixVenteTotal, 0);
  const totalProfit = salesList.reduce((acc, sale) => acc + sale.benefice, 0);
  const alertesStockCount = stockList.filter(isAlerteStock).length;
  const margeGlobalePct = totalCA > 0 ? Math.round((totalProfit / totalCA) * 100) : 0;

  const handleStockClick = (filter: StockStatusFilter) => {
    if (onNavigateToStockWithFilter) {
      onNavigateToStockWithFilter(filter);
    } else {
      setActiveTab('STOCK');
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-br from-white via-rose-50/60 to-amber-50/50 rounded-3xl p-6 sm:p-8 shadow-sm border border-rose-100 relative overflow-hidden">
        {/* Fruity ambient glows */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-rose-200/40 via-amber-200/30 to-transparent rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-emerald-100/30 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100/70 text-rose-700 text-xs font-bold uppercase tracking-wider mb-4 border border-rose-200 shadow-xs">
            <span className="text-sm">🍓</span>
            <span>Yaourterie Artisanale • Saveurs Fruitières Fraîches</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-stone-900 mb-3 flex items-center gap-2.5">
            <span>LES DÉLICES DE MAMAN</span>
            <span className="text-2xl sm:text-3xl">🥛</span>
          </h1>
          
          <p className="text-stone-600 text-base sm:text-lg leading-relaxed mb-6 font-medium">
            Gestion intégrée des stocks de vos yaourts frais, coulis, douceurs et délices fruités.
            Contrôlez les rotations, enregistrez vos ventes, visualisez instantanément le chiffre d'affaires 
            et la marge bénéficiaire réelle grâce aux tableaux de bord connectés Looker Studio.
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setActiveTab('VENTE')}
              className="flex items-center gap-2 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-md shadow-rose-200 hover:shadow-lg transition-all cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Enregistrer une Vente</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => handleStockClick('ALL')}
              className="flex items-center gap-2 bg-white hover:bg-emerald-50 text-emerald-800 px-5 py-2.5 rounded-xl font-bold border border-emerald-200 shadow-xs transition-all cursor-pointer"
            >
              <Package className="w-4 h-4 text-emerald-600" />
              <span>Consulter le Stock ({stockList.length} délices)</span>
            </button>

            <button
              onClick={() => setActiveTab('BI_DASHBOARDS')}
              className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white px-5 py-2.5 rounded-xl font-bold shadow-md shadow-purple-200 hover:shadow-lg transition-all cursor-pointer"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Dashboards Looker Studio BI</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Highlights - Fruity Flavors & White Yogurt */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Stock - Myrtille & Yaourt */}
        <div 
          onClick={() => handleStockClick('ALL')}
          className="bg-white p-5 rounded-2xl border border-violet-100 shadow-sm hover:shadow-md hover:border-violet-300 transition-all flex items-center justify-between cursor-pointer group"
          title="Cliquer pour voir tous les produits en stock"
        >
          <div>
            <span className="text-xs font-bold text-violet-600 uppercase tracking-wider flex items-center gap-1">
              <span>🫐</span> Valeur du Stock
            </span>
            <div className="text-2xl font-black text-stone-900 mt-1">{formatFCFA(totalValeurStock)}</div>
            <span className="text-xs text-violet-600 font-semibold underline flex items-center gap-1 mt-0.5">
              Voir les {stockList.length} articles →
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 border border-violet-100 flex items-center justify-center shadow-xs text-xl group-hover:scale-105 transition-transform">
            🥣
          </div>
        </div>

        {/* Chiffre d'Affaires - Fraise Gourmande */}
        <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-rose-600 uppercase tracking-wider flex items-center gap-1">
              <span>🍓</span> Chiffre d'Affaires
            </span>
            <div className="text-2xl font-black text-rose-700 mt-1">{formatFCFA(totalCA)}</div>
            <span className="text-xs text-rose-600/90 font-medium">Cumulé des ventes de douceurs</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shadow-xs text-xl">
            🍓
          </div>
        </div>

        {/* Marge Réelle - Mangue & Passion */}
        <div className="bg-white p-5 rounded-2xl border border-amber-100 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1">
              <span>🥭</span> Bénéfice Réel Net
            </span>
            <div className="text-2xl font-black text-amber-700 mt-1">{formatFCFA(totalProfit)}</div>
            <span className="text-xs text-amber-700 font-medium">Taux de marge : {margeGlobalePct}%</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shadow-xs text-xl">
            🥭
          </div>
        </div>

        {/* Ruptures - Framboise & Pêche - Fully Clickable */}
        <div 
          onClick={() => handleStockClick('CRITIQUE')}
          className={`p-5 rounded-2xl border shadow-sm hover:shadow-md transition-all flex items-center justify-between cursor-pointer group ${
            alertesStockCount > 0 
              ? 'bg-rose-50/50 border-rose-300 hover:border-rose-500 hover:bg-rose-50 ring-1 ring-rose-200' 
              : 'bg-white border-rose-100 hover:border-rose-300'
          }`}
          title="Cliquer pour afficher directement les produits en alerte"
        >
          <div>
            <span className="text-xs font-bold text-rose-600 uppercase tracking-wider flex items-center gap-1">
              <span>🍑</span> Alertes Rupture
            </span>
            <div className={`text-2xl font-black mt-1 ${alertesStockCount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
              {alertesStockCount} {alertesStockCount > 1 ? 'en alerte' : 'article'}
            </div>
            <span className="text-xs text-rose-700 font-bold underline flex items-center gap-1 mt-0.5">
              {alertesStockCount > 0 ? `Afficher les ${alertesStockCount} produits →` : 'Vérifier les stocks →'}
            </span>
          </div>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border text-xl shadow-xs group-hover:scale-110 transition-transform ${
            alertesStockCount > 0 ? 'bg-rose-100 text-rose-600 border-rose-300 animate-pulse' : 'bg-emerald-50 text-emerald-600 border-emerald-200'
          }`}>
            {alertesStockCount > 0 ? '⚠️' : '🥝'}
          </div>
        </div>
      </div>

      {/* Two Columns: Section A (Avantages) & Section B (Bénéfices) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Avantages */}
        <div className="bg-white p-6 rounded-3xl border border-rose-100/80 shadow-sm space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-rose-100">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center font-black text-base shadow-xs">
              🍓
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900">Avantages Spécial Yaourts & Délices</h2>
              <p className="text-xs text-stone-500">Gestion fine des produits frais et rotations</p>
            </div>
          </div>

          <ul className="space-y-3">
            <li className="flex items-start gap-3 text-sm text-stone-700">
              <span className="text-base shrink-0 mt-0.5">🥛</span>
              <div>
                <strong className="font-semibold text-stone-900">Alerte avant épuisement de stock :</strong> notification proactive pour relancer la production de yaourts blancs et coulis frais.
              </div>
            </li>
            <li className="flex items-start gap-3 text-sm text-stone-700">
              <span className="text-base shrink-0 mt-0.5">📊</span>
              <div>
                <strong className="font-semibold text-stone-900">Situation détaillée en temps réel :</strong> suivi des ventes par jour, semaine, mois et année.
              </div>
            </li>
            <li className="flex items-start gap-3 text-sm text-stone-700">
              <span className="text-base shrink-0 mt-0.5">🏆</span>
              <div>
                <strong className="font-semibold text-stone-900">Palmarès des saveurs préférées :</strong> identifiez vos yaourts best-sellers (Fraise, Mangue, Passion, Vanille...).
              </div>
            </li>
            <li className="flex items-start gap-3 text-sm text-stone-700">
              <span className="text-base shrink-0 mt-0.5">🏷️</span>
              <div>
                <strong className="font-semibold text-stone-900">Classification par familles :</strong> Yaourts blancs brassés, compotes fruitières, desserts gourmands et boissons.
              </div>
            </li>
            <li className="flex items-start gap-3 text-sm text-stone-700">
              <span className="text-base shrink-0 mt-0.5">💰</span>
              <div>
                <strong className="font-semibold text-stone-900">Calcul en direct du CA et bénéfice net :</strong> marge exacte déduite des coûts d'ingrédients et emballages.
              </div>
            </li>
            <li className="flex items-start gap-3 text-sm text-stone-700">
              <span className="text-base shrink-0 mt-0.5">📝</span>
              <div>
                <strong className="font-semibold text-stone-900">Traçabilité complète :</strong> historique sans faille de toutes les entrées en chambre froide et ventes.
              </div>
            </li>
          </ul>
        </div>

        {/* Bénéfices */}
        <div className="bg-white p-6 rounded-3xl border border-amber-100/80 shadow-sm space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-amber-100">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center font-black text-base shadow-xs">
              🥭
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900">Bénéfices Directs pour la Boutique</h2>
              <p className="text-xs text-stone-500">Protection de la marge et fraîcheur garantie</p>
            </div>
          </div>

          <ul className="space-y-4">
            <li className="flex items-start gap-3 text-sm text-stone-700">
              <div className="w-6 h-6 rounded-full bg-rose-50 text-rose-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 border border-rose-200">
                1
              </div>
              <div>
                <strong className="font-semibold text-stone-900 text-base">Zéro perte sur les produits laitiers frais :</strong>
                <p className="text-stone-600 mt-0.5">Le suivi précis des quantités fabriquées, sorties et vendues évite les gaspillages et les pertes non élucidées.</p>
              </div>
            </li>
            <li className="flex items-start gap-3 text-sm text-stone-700">
              <div className="w-6 h-6 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 border border-amber-200">
                2
              </div>
              <div>
                <strong className="font-semibold text-stone-900 text-base">Maîtrise de la chaîne du froid & rotations :</strong>
                <p className="text-stone-600 mt-0.5">Gestion optimale du stock critique pour réapprovisionner les fruits frais et le lait au moment parfait.</p>
              </div>
            </li>
            <li className="flex items-start gap-3 text-sm text-stone-700">
              <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 border border-emerald-200">
                3
              </div>
              <div>
                <strong className="font-semibold text-stone-900 text-base">Distinction nette entre capital et profit réel :</strong>
                <p className="text-stone-600 mt-0.5">Le système isole rigoureusement le coût d'achat unitaire et les charges pour préserver votre trésorerie d'exploitation.</p>
              </div>
            </li>
          </ul>

          <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-rose-50/80 to-amber-50/80 border border-rose-200/80">
            <div className="flex items-center gap-2 text-rose-900 font-bold text-sm mb-1">
              <span>🥣</span>
              <span>Formule maîtresse de rentabilité laitière</span>
            </div>
            <p className="text-xs text-stone-700 leading-relaxed font-mono">
              Stock Final = Stock Initial + Entrées - Sorties - Ventes
              <br />
              Coût de revient = Prix d'Achat Ingrédients + Marge Frais
              <br />
              Bénéfice net = Prix Total Vendu - (Quantité × Coût de revient)
            </p>
          </div>
        </div>

      </div>

      {/* Modules Shortcuts Grid */}
      <div className="bg-gradient-to-r from-rose-50/40 via-white to-amber-50/40 rounded-3xl p-6 border border-rose-100">
        <h3 className="text-base font-bold text-stone-900 mb-4 flex items-center gap-2">
          <span>🍓</span>
          <span>Accès direct aux modules de gestion gourmande</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <button
            onClick={() => setActiveTab('STOCK')}
            className="p-4 bg-white rounded-2xl border border-emerald-100 hover:border-emerald-400 hover:shadow-md transition-all text-left flex flex-col justify-between group cursor-pointer"
          >
            <div>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2 text-base group-hover:scale-110 transition-transform">
                🥝
              </div>
              <div className="font-bold text-stone-900 text-sm">Stock & Chambre Froide</div>
              <div className="text-xs text-stone-500 mt-1">Inventaire, entrées/sorties de yaourts</div>
            </div>
            <span className="text-xs text-emerald-600 font-semibold mt-3 flex items-center gap-1">
              Consulter <ArrowRight className="w-3 h-3" />
            </span>
          </button>

          <button
            onClick={() => setActiveTab('VENTE')}
            className="p-4 bg-white rounded-2xl border border-rose-100 hover:border-rose-400 hover:shadow-md transition-all text-left flex flex-col justify-between group cursor-pointer"
          >
            <div>
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-2 text-base group-hover:scale-110 transition-transform">
                🍓
              </div>
              <div className="font-bold text-stone-900 text-sm">Caisse & Ventes</div>
              <div className="text-xs text-stone-500 mt-1">Saisie directe, déstockage & CA</div>
            </div>
            <span className="text-xs text-rose-600 font-semibold mt-3 flex items-center gap-1">
              Encaisser <ArrowRight className="w-3 h-3" />
            </span>
          </button>

          <button
            onClick={() => setActiveTab('PRODUITS')}
            className="p-4 bg-white rounded-2xl border border-amber-100 hover:border-amber-400 hover:shadow-md transition-all text-left flex flex-col justify-between group cursor-pointer"
          >
            <div>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2 text-base group-hover:scale-110 transition-transform">
                🥭
              </div>
              <div className="font-bold text-stone-900 text-sm">Catalogue Délices</div>
              <div className="text-xs text-stone-500 mt-1">Générateur de références & formats</div>
            </div>
            <span className="text-xs text-amber-600 font-semibold mt-3 flex items-center gap-1">
              Configurer <ArrowRight className="w-3 h-3" />
            </span>
          </button>

          <button
            onClick={() => setActiveTab('BI_DASHBOARDS')}
            className="p-4 bg-white rounded-2xl border border-purple-100 hover:border-purple-400 hover:shadow-md transition-all text-left flex flex-col justify-between group cursor-pointer"
          >
            <div>
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-2 text-base group-hover:scale-110 transition-transform">
                🫐
              </div>
              <div className="font-bold text-stone-900 text-sm">Looker Studio BI</div>
              <div className="text-xs text-stone-500 mt-1">3 tableaux d'analyse des ventes</div>
            </div>
            <span className="text-xs text-purple-600 font-semibold mt-3 flex items-center gap-1">
              Explorer <ArrowRight className="w-3 h-3" />
            </span>
          </button>

          <button
            onClick={() => setActiveTab('CONFIGURATION')}
            className="p-4 bg-white rounded-2xl border border-stone-200 hover:border-stone-400 hover:shadow-md transition-all text-left flex flex-col justify-between group cursor-pointer"
          >
            <div>
              <div className="w-8 h-8 rounded-xl bg-stone-100 text-stone-600 flex items-center justify-center mb-2 text-base group-hover:scale-110 transition-transform">
                ⚙️
              </div>
              <div className="font-bold text-stone-900 text-sm">Configuration</div>
              <div className="text-xs text-stone-500 mt-1">Catégories de fruits & contenants</div>
            </div>
            <span className="text-xs text-stone-600 font-semibold mt-3 flex items-center gap-1">
              Paramétrer <ArrowRight className="w-3 h-3" />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
