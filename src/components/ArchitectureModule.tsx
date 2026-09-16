import React, { useState } from 'react';
import { 
  Network, 
  Code2, 
  Terminal, 
  Layout, 
  Play, 
  Check, 
  Copy, 
  Database, 
  Sparkles, 
  Layers, 
  Cpu,
  MousePointerClick
} from 'lucide-react';
import { ERD_TABLES, ALGORITHM_SPECS, API_ENDPOINTS } from '../data/architectureDocs';
import { calculateEan13Checksum, formatCurrency } from '../data/mockDatabase';

export const ArchitectureModule: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'ERD' | 'ALGO' | 'API' | 'WIREFRAME'>('ERD');
  const [selectedTable, setSelectedTable] = useState(ERD_TABLES[0]);

  // Algo Sandbox interactive state
  const [selectedAlgoId, setSelectedAlgoId] = useState(ALGORITHM_SPECS[0].id);
  const [copiedCode, setCopiedCode] = useState(false);

  // Live sandbox inputs for Multi-unit
  const [sandboxCartonQty, setSandboxCartonQty] = useState(2);
  const [sandboxCartonFactor, setSandboxCartonFactor] = useState(24);
  const [sandboxInitialStock, setSandboxInitialStock] = useState(96);

  // Live sandbox inputs for Dynamic DLC
  const [sandboxDlcDays, setSandboxDlcDays] = useState(3);
  const [sandboxOriginalPrice, setSandboxOriginalPrice] = useState(1500);

  // Live sandbox inputs for ROP / EOQ
  const [sandboxDemand, setSandboxDemand] = useState(5);
  const [sandboxLeadTime, setSandboxLeadTime] = useState(3);
  const [sandboxSafety, setSandboxSafety] = useState(8);

  const activeAlgo = ALGORITHM_SPECS.find(a => a.id === selectedAlgoId) || ALGORITHM_SPECS[0];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Navigation */}
      <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            id="subtab-erd"
            onClick={() => setActiveSubTab('ERD')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
              activeSubTab === 'ERD' ? 'bg-indigo-600 text-white shadow-xs' : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>1. Schéma Conceptuel MCD / ERD</span>
          </button>

          <button
            id="subtab-algo"
            onClick={() => setActiveSubTab('ALGO')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
              activeSubTab === 'ALGO' ? 'bg-indigo-600 text-white shadow-xs' : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>2. Algorithmes Clés & Simulateur</span>
          </button>

          <button
            id="subtab-api"
            onClick={() => setActiveSubTab('API')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
              activeSubTab === 'API' ? 'bg-indigo-600 text-white shadow-xs' : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>3. Spécification API REST & Sync</span>
          </button>

          <button
            id="subtab-wireframe"
            onClick={() => setActiveSubTab('WIREFRAME')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
              activeSubTab === 'WIREFRAME' ? 'bg-indigo-600 text-white shadow-xs' : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <Layout className="w-4 h-4" />
            <span>4. Wireframe & Ergonomie Tactile</span>
          </button>
        </div>

        <div className="text-[11px] text-stone-500 font-mono hidden md:block">
          Spécification Technique Senior Architect
        </div>
      </div>

      {/* ================= 1. SCHÉMA CONCEPTUEL MCD / ERD ================= */}
      {activeSubTab === 'ERD' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-4">
              <div>
                <h3 className="font-bold text-sm text-stone-900">MODÈLE CONCEPTUEL DES DONNÉES (MCD) & RELATIONNEL (ERD)</h3>
                <p className="text-xs text-stone-500">
                  Base PostgreSQL (serveur central) répliquée en SQLite local (terminaux caisse POS avec synchronisation bidirectionnelle).
                </p>
              </div>
              <span className="text-xs font-mono bg-indigo-50 text-indigo-800 px-2 py-1 rounded border border-indigo-200">
                {ERD_TABLES.length} Entités Principales
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Liste des tables (Lg: 4 cols) */}
              <div className="lg:col-span-4 space-y-2">
                <span className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-2">Tables Relationnelles</span>
                {ERD_TABLES.map(table => (
                  <div
                    key={table.name}
                    onClick={() => setSelectedTable(table)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      selectedTable.name === table.name 
                        ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500' 
                        : 'bg-stone-50 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-stone-900">{table.name}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-stone-200 text-stone-800 font-bold">
                        {table.columns.length} cols
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500 mt-1">{table.description}</p>
                  </div>
                ))}
              </div>

              {/* Détail de la table sélectionnée (Lg: 8 cols) */}
              <div className="lg:col-span-8 bg-stone-50 rounded-xl border border-stone-200 p-4">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-200">
                  <div>
                    <span className="text-xs font-mono font-black text-indigo-700 text-base">{selectedTable.name}</span>
                    <span className="text-xs text-stone-500 block">{selectedTable.description}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 text-xs font-mono font-bold">
                    Catégorie : {selectedTable.category}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-stone-200 text-stone-500 text-[10px] uppercase font-bold">
                        <th className="pb-2">Champ</th>
                        <th className="pb-2">Type</th>
                        <th className="pb-2">Clé</th>
                        <th className="pb-2">Description & Référence</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200/60 font-mono">
                      {selectedTable.columns.map(col => (
                        <tr key={col.name} className="hover:bg-white/60">
                          <td className="py-2 text-stone-900 font-bold">{col.name}</td>
                          <td className="py-2 text-stone-600 text-[11px]">{col.type}</td>
                          <td className="py-2">
                            {col.key === 'PK' && (
                              <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">
                                PK
                              </span>
                            )}
                            {col.key === 'FK' && (
                              <span className="px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 font-bold text-[10px]">
                                FK ➔ {col.references}
                              </span>
                            )}
                            {col.key === 'UK' && (
                              <span className="px-1.5 py-0.2 rounded bg-purple-100 text-purple-800 font-bold text-[10px]">
                                UNIQUE
                              </span>
                            )}
                          </td>
                          <td className="py-2 text-stone-600 font-sans text-xs">{col.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ================= 2. ALGORITHMES CLÉS & SIMULATEUR ================= */}
      {activeSubTab === 'ALGO' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3 mb-4">
              <div>
                <h3 className="font-bold text-sm text-stone-900">ALGORITHMES MÉTIERS CRITIQUES (PYTHON & SPÉCIFICATIONS)</h3>
                <p className="text-xs text-stone-500">
                  Implémentations haute performance pour la conversion multi-unités, le dynamic pricing DLC et le calcul de réapprovisionnement.
                </p>
              </div>

              {/* Sélecteur d'algo */}
              <div className="flex gap-1.5">
                {ALGORITHM_SPECS.map(algo => (
                  <button
                    key={algo.id}
                    onClick={() => setSelectedAlgoId(algo.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      selectedAlgoId === algo.id 
                        ? 'bg-stone-900 text-white border-stone-900 shadow-xs' 
                        : 'bg-stone-50 text-stone-700 border-stone-200'
                    }`}
                  >
                    {algo.id.replace('-', ' ').toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Code Python inspectable (Lg: 7 cols) */}
              <div className="lg:col-span-7 bg-stone-950 rounded-xl p-4 text-stone-100 font-mono text-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-stone-800 mb-3">
                    <span className="text-emerald-400 font-bold">{activeAlgo.title}</span>
                    <button
                      onClick={() => handleCopy(activeAlgo.pythonCode)}
                      className="text-stone-400 hover:text-white flex items-center gap-1 text-[11px]"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCode ? 'Copié' : 'Copier'}</span>
                    </button>
                  </div>
                  
                  <pre className="overflow-x-auto text-[11px] leading-relaxed text-stone-300">
                    {activeAlgo.pythonCode}
                  </pre>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-800 text-[11px] text-stone-400 font-sans">
                  💡 {activeAlgo.explanation}
                </div>
              </div>

              {/* Bac à sable de simulation interactive (Lg: 5 cols) */}
              <div className="lg:col-span-5 bg-stone-50 rounded-xl border border-stone-200 p-4 space-y-4">
                <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
                  <Play className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-xs uppercase text-stone-800">Bac à Sable d’Exécution en Direct</span>
                </div>

                {/* Cas 1 : Multi-unités */}
                {selectedAlgoId === 'multi-unit' && (
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="text-stone-600 block mb-1">Nombre de Cartons Scannés :</label>
                      <input
                        type="number"
                        min={1}
                        value={sandboxCartonQty}
                        onChange={(e) => setSandboxCartonQty(Number(e.target.value))}
                        className="w-full bg-white border border-stone-300 rounded p-1.5 font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-stone-600 block mb-1">Facteur de Conversion (Pièces par Carton) :</label>
                      <input
                        type="number"
                        min={1}
                        value={sandboxCartonFactor}
                        onChange={(e) => setSandboxCartonFactor(Number(e.target.value))}
                        className="w-full bg-white border border-stone-300 rounded p-1.5 font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-stone-600 block mb-1">Stock Initial en Rayon (Pièces) :</label>
                      <input
                        type="number"
                        min={0}
                        value={sandboxInitialStock}
                        onChange={(e) => setSandboxInitialStock(Number(e.target.value))}
                        className="w-full bg-white border border-stone-300 rounded p-1.5 font-mono"
                      />
                    </div>

                    <div className="p-3 bg-white rounded-lg border border-stone-200 font-mono space-y-1 mt-2">
                      <div className="text-stone-600">Impact stock réel : <strong className="text-indigo-700">-{sandboxCartonQty * sandboxCartonFactor} pièces</strong></div>
                      <div className="text-stone-600">Nouveau stock après vente : <strong className="text-emerald-700">{Math.max(0, sandboxInitialStock - (sandboxCartonQty * sandboxCartonFactor))} pièces</strong></div>
                    </div>
                  </div>
                )}

                {/* Cas 2 : Dynamic DLC */}
                {selectedAlgoId === 'dynamic-dlc' && (
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="text-stone-600 block mb-1">Jours Restants avant DLC :</label>
                      <input
                        type="range"
                        min={0}
                        max={15}
                        value={sandboxDlcDays}
                        onChange={(e) => setSandboxDlcDays(Number(e.target.value))}
                        className="w-full accent-amber-500"
                      />
                      <span className="font-mono font-bold text-amber-800">{sandboxDlcDays} jours restants</span>
                    </div>

                    <div>
                      <label className="text-stone-600 block mb-1">Prix Catalogue Initial (FCFA) :</label>
                      <input
                        type="number"
                        value={sandboxOriginalPrice}
                        onChange={(e) => setSandboxOriginalPrice(Number(e.target.value))}
                        className="w-full bg-white border border-stone-300 rounded p-1.5 font-mono"
                      />
                    </div>

                    <div className="p-3 bg-white rounded-lg border border-stone-200 font-mono space-y-1 mt-2">
                      {sandboxDlcDays <= 0 ? (
                        <span className="text-red-600 font-bold block">🚨 PÉRIMÉ ! Vente bloquée en caisse.</span>
                      ) : sandboxDlcDays <= 3 ? (
                        <div>
                          <span className="text-amber-800 font-bold block">🔥 Promo Flash Liquidation -50%</span>
                          <span className="text-stone-600">Prix unitaire en caisse : <strong className="text-emerald-700">{formatCurrency(sandboxOriginalPrice * 0.5)}</strong></span>
                        </div>
                      ) : sandboxDlcDays <= 7 ? (
                        <div>
                          <span className="text-orange-800 font-bold block">🟠 Promo Déstockage -20%</span>
                          <span className="text-stone-600">Prix unitaire en caisse : <strong className="text-emerald-700">{formatCurrency(sandboxOriginalPrice * 0.8)}</strong></span>
                        </div>
                      ) : (
                        <span className="text-emerald-700 font-bold block">🟢 DLC Conforme (Prix 100% normal)</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Cas 3 : ROP & EOQ */}
                {selectedAlgoId === 'reorder-rop-eoq' && (
                  <div className="space-y-3 text-xs">
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-stone-500 block">Ventes/j (d) :</label>
                        <input
                          type="number"
                          value={sandboxDemand}
                          onChange={(e) => setSandboxDemand(Number(e.target.value))}
                          className="w-full bg-white border border-stone-300 rounded p-1 font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-stone-500 block">Délai (L) :</label>
                        <input
                          type="number"
                          value={sandboxLeadTime}
                          onChange={(e) => setSandboxLeadTime(Number(e.target.value))}
                          className="w-full bg-white border border-stone-300 rounded p-1 font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-stone-500 block">Sécu (SS) :</label>
                        <input
                          type="number"
                          value={sandboxSafety}
                          onChange={(e) => setSandboxSafety(Number(e.target.value))}
                          className="w-full bg-white border border-stone-300 rounded p-1 font-mono"
                        />
                      </div>
                    </div>

                    <div className="p-3 bg-white rounded-lg border border-stone-200 font-mono space-y-1">
                      <div className="text-stone-700">Seuil de Réappro ROP = (d × L) + SS</div>
                      <div className="text-base font-black text-indigo-700">
                        ROP = ({sandboxDemand} × {sandboxLeadTime}) + {sandboxSafety} = {(sandboxDemand * sandboxLeadTime) + sandboxSafety} unités
                      </div>
                    </div>
                  </div>
                )}

              </div>

            </div>
          </div>
        </div>
      )}

      {/* ================= 3. SPÉCIFICATION API REST & SYNC ================= */}
      {activeSubTab === 'API' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
            <div className="border-b border-stone-100 pb-3 mb-4">
              <h3 className="font-bold text-sm text-stone-900">SPÉCIFICATION DES ENDPOINTS REST & WEBSOCKETS (POS/ERP)</h3>
              <p className="text-xs text-stone-500">
                Architecture microservices / NestJS ou FastAPI avec synchronisation par vecteur d’horloge (Vector Clocks / CRDTs).
              </p>
            </div>

            <div className="space-y-4">
              {API_ENDPOINTS.map((endpoint, i) => (
                <div key={i} className="border border-stone-200 rounded-xl overflow-hidden text-xs">
                  <div className="p-3 bg-stone-900 text-white flex items-center justify-between font-mono">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                        endpoint.method === 'POST' ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white'
                      }`}>
                        {endpoint.method}
                      </span>
                      <span className="font-bold text-stone-100">{endpoint.path}</span>
                    </div>
                    <span className="text-[11px] text-stone-400 font-sans">{endpoint.summary}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-stone-200 bg-stone-50 p-3 font-mono text-[11px]">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-stone-500 block mb-1 font-sans">
                        Request Body (JSON) :
                      </span>
                      <pre className="bg-white p-2.5 rounded border border-stone-200 overflow-x-auto text-stone-800">
                        {endpoint.payload ? JSON.stringify(endpoint.payload, null, 2) : '/* Aucun corps de requête (Paramètre URL) */'}
                      </pre>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-stone-500 block mb-1 font-sans">
                        Response 200 OK (JSON) :
                      </span>
                      <pre className="bg-white p-2.5 rounded border border-stone-200 overflow-x-auto text-emerald-900">
                        {JSON.stringify(endpoint.response, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= 4. WIREFRAME & ERGONOMIE TACTILE ================= */}
      {activeSubTab === 'WIREFRAME' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
            <div className="border-b border-stone-100 pb-3 mb-4">
              <h3 className="font-bold text-sm text-stone-900">WIREFRAME & ERGONOMIE DE L'ÉCRAN DE CAISSE TACTILE</h3>
              <p className="text-xs text-stone-500">
                Optimisation du nombre de clics (Fitts' Law) pour un encaissement moyen en moins de 12 secondes.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-stone-900 text-sm">
                  <span className="h-6 w-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">1</span>
                  <span>Zone Gauche : Ticket & Total</span>
                </div>
                <p className="text-stone-600 leading-relaxed">
                  • Largeur fixe (40% de l’écran) dédiée au ticket en cours.<br/>
                  • Affichage immédiat du sous-total, des remises DLC automatiques et du grand total en caractères de 24px.<br/>
                  • Bouton d'encaissement géant en bas à gauche (cible Fitts' Law de 48px de hauteur minimale).
                </p>
              </div>

              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-stone-900 text-sm">
                  <span className="h-6 w-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">2</span>
                  <span>Zone Haute : Scan & Balance</span>
                </div>
                <p className="text-stone-600 leading-relaxed">
                  • Focus permanent sur le champ douchette code-barres (capture USB HID).<br/>
                  • Affichage en temps réel du poids stable de la balance connectée RS-232.<br/>
                  • Bouton TARE instantané et raccourcis de poids rapides (0.250kg, 0.450kg, etc.).
                </p>
              </div>

              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-stone-900 text-sm">
                  <span className="h-6 w-6 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs">3</span>
                  <span>Zone Droite : Grille Tactile</span>
                </div>
                <p className="text-stone-600 leading-relaxed">
                  • Boutons de rayon en onglets horizontaux tactiles.<br/>
                  • Pavés produits de 80x80px avec icônes contrastées, prix et badges promotions DLC clignotants.<br/>
                  • 1 seul toucher suffit pour insérer l’article au ticket.
                </p>
              </div>

            </div>

            {/* Analyse comparative des clics */}
            <div className="mt-5 p-4 bg-stone-900 text-white rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <MousePointerClick className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-xs uppercase text-emerald-400">Budget Clics & Vitesse Opérationnelle</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className="p-2 bg-stone-800 rounded border border-stone-700">
                  <span className="text-stone-400 block text-[10px]">Article Code-Barres :</span>
                  <strong className="text-emerald-400 text-sm">0 Clic (Scan direct)</strong>
                </div>
                <div className="p-2 bg-stone-800 rounded border border-stone-700">
                  <span className="text-stone-400 block text-[10px]">Article au Poids :</span>
                  <strong className="text-emerald-400 text-sm">2 Clics (Pose + Toucher)</strong>
                </div>
                <div className="p-2 bg-stone-800 rounded border border-stone-700">
                  <span className="text-stone-400 block text-[10px]">Règlement Espèces :</span>
                  <strong className="text-emerald-400 text-sm">2 Clics (Encaisser + Billet)</strong>
                </div>
                <div className="p-2 bg-stone-800 rounded border border-stone-700">
                  <span className="text-stone-400 block text-[10px]">Temps Moyen Ticket :</span>
                  <strong className="text-amber-400 text-sm">11.4 secondes</strong>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
