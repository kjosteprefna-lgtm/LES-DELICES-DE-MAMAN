import React, { useState } from 'react';
import { 
  BrainCircuit, 
  TrendingUp, 
  ShoppingBag, 
  ShieldAlert, 
  Sun, 
  CloudRain, 
  Sparkles, 
  ArrowRight, 
  Lock, 
  CheckCircle2, 
  FileSpreadsheet,
  AlertTriangle
} from 'lucide-react';
import { DemandPrediction, AssociationRule, FraudAlert, AuditLog } from '../types';
import { formatCurrency } from '../data/mockDatabase';

interface AiBiModuleProps {
  demandPredictions: DemandPrediction[];
  associationRules: AssociationRule[];
  fraudAlerts: FraudAlert[];
  auditLogs: AuditLog[];
  onResolveFraudAlert: (id: string) => void;
}

export const AiBiModule: React.FC<AiBiModuleProps> = ({
  demandPredictions,
  associationRules,
  fraudAlerts,
  auditLogs,
  onResolveFraudAlert,
}) => {
  const [activeTab, setActiveTab] = useState<'FORECAST' | 'BASKET' | 'FRAUD'>('BASKET');
  const [weatherCondition, setWeatherCondition] = useState<'NORMAL' | 'HEATWAVE' | 'RAIN'>('HEATWAVE');
  const [minLiftFilter, setMinLiftFilter] = useState<number>(1.2);

  // Weather modifier factor
  const getWeatherMultiplier = () => {
    if (weatherCondition === 'HEATWAVE') return 1.35; // boost boissons & fruits
    if (weatherCondition === 'RAIN') return 0.85; // baisse fréquentation globale
    return 1.0;
  };

  const filteredRules = associationRules.filter(r => r.lift >= minLiftFilter);

  return (
    <div className="space-y-6">
      
      {/* Sub tabs */}
      <div className="flex items-center justify-between border-b border-stone-200 pb-3">
        <div className="flex gap-2">
          <button
            id="tab-market-basket"
            onClick={() => setActiveTab('BASKET')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'BASKET' ? 'bg-amber-500 text-stone-950 shadow-xs' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Panier Moyen & Apriori (Bundles)</span>
          </button>

          <button
            id="tab-demand-forecast"
            onClick={() => setActiveTab('FORECAST')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'FORECAST' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Prédiction Demande & Météo</span>
          </button>

          <button
            id="tab-fraud-detection"
            onClick={() => setActiveTab('FRAUD')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'FRAUD' ? 'bg-red-600 text-white shadow-xs' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Anti-Fraude & Audit Hash</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-stone-500 font-mono">
          <BrainCircuit className="w-4 h-4 text-amber-500" />
          <span>Moteurs IA / Règles d’Association Actives</span>
        </div>
      </div>

      {/* ================= SECTION 1 : MARKET BASKET ANALYSIS (APRIORI) ================= */}
      {activeTab === 'BASKET' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3 mb-4">
              <div>
                <h3 className="font-bold text-sm text-stone-900">ANALYSE DU PANIER MOYEN (MARKET BASKET / APRIORI)</h3>
                <p className="text-xs text-stone-500">
                  Détection des affinités d’achats croisés calculées sur l'historique des tickets de caisse.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-stone-600 font-medium">Filtrer Lift minimum :</span>
                <input
                  type="range"
                  min={1.0}
                  max={3.5}
                  step={0.1}
                  value={minLiftFilter}
                  onChange={(e) => setMinLiftFilter(Number(e.target.value))}
                  className="w-24 accent-amber-500"
                />
                <span className="font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  ≥ {minLiftFilter.toFixed(1)}
                </span>
              </div>
            </div>

            {/* Règles d'association */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRules.map((rule, idx) => (
                <div 
                  key={idx} 
                  className="p-4 rounded-xl bg-stone-50 border border-stone-200 hover:border-amber-400 transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Visual relation: A -> B */}
                    <div className="flex items-center gap-2 text-xs font-bold text-stone-900 mb-3 bg-white p-2.5 rounded-lg border border-stone-200 shadow-2xs">
                      <span className="text-emerald-700 bg-emerald-50 px-2 py-1 rounded">
                        {rule.antecedent.join(', ')}
                      </span>
                      <ArrowRight className="w-4 h-4 text-stone-400 shrink-0" />
                      <span className="text-indigo-700 bg-indigo-50 px-2 py-1 rounded">
                        {rule.consequent.join(', ')}
                      </span>
                    </div>

                    {/* Mathematical metrics (Support, Confidence, Lift) */}
                    <div className="grid grid-cols-3 gap-2 text-center text-xs mb-3 font-mono">
                      <div className="p-2 bg-white rounded border border-stone-200">
                        <span className="text-[10px] text-stone-400 uppercase block">Support</span>
                        <strong className="text-stone-800 text-xs">{(rule.support * 100).toFixed(0)}%</strong>
                      </div>

                      <div className="p-2 bg-white rounded border border-stone-200">
                        <span className="text-[10px] text-stone-400 uppercase block">Confiance</span>
                        <strong className="text-stone-800 text-xs">{(rule.confidence * 100).toFixed(0)}%</strong>
                      </div>

                      <div className="p-2 bg-amber-50 border border-amber-200 rounded">
                        <span className="text-[10px] text-amber-800 uppercase block font-bold">Lift</span>
                        <strong className="text-amber-950 text-xs font-black">{rule.lift.toFixed(2)}x</strong>
                      </div>
                    </div>

                    <p className="text-xs text-stone-600 leading-relaxed bg-white/70 p-2.5 rounded border border-stone-200">
                      💡 <strong>Recommandation Merchandising :</strong> {rule.businessAction}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-stone-200 flex items-center justify-between text-[11px] text-stone-500">
                    <span>Algorithme : Apriori Frequent Itemsets</span>
                    <span className="text-emerald-700 font-semibold font-mono">Impact Marge +8.5%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= SECTION 2 : PRÉDICTION DE DEMANDE & MÉTÉO ================= */}
      {activeTab === 'FORECAST' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3 mb-4">
              <div>
                <h3 className="font-bold text-sm text-stone-900">PRÉDICTION INTELLIGENTE DE LA DEMANDE (7 JOURS)</h3>
                <p className="text-xs text-stone-500">
                  Modèle prédictif combinant l'historique de rotation, le calendrier saisonnier et l'impact météorologique.
                </p>
              </div>

              {/* Weather simulation toggle */}
              <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-lg border border-stone-200 text-xs">
                <span className="text-[11px] text-stone-500 px-2 font-medium">Scénario Météo :</span>
                <button
                  onClick={() => setWeatherCondition('HEATWAVE')}
                  className={`px-2.5 py-1 rounded-md font-bold flex items-center gap-1 transition-all ${
                    weatherCondition === 'HEATWAVE' ? 'bg-amber-400 text-stone-950 shadow-2xs' : 'text-stone-600'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" /> Canicule (+35°C)
                </button>
                <button
                  onClick={() => setWeatherCondition('NORMAL')}
                  className={`px-2.5 py-1 rounded-md font-bold flex items-center gap-1 transition-all ${
                    weatherCondition === 'NORMAL' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-stone-600'
                  }`}
                >
                  Saison Normale
                </button>
                <button
                  onClick={() => setWeatherCondition('RAIN')}
                  className={`px-2.5 py-1 rounded-md font-bold flex items-center gap-1 transition-all ${
                    weatherCondition === 'RAIN' ? 'bg-blue-600 text-white shadow-2xs' : 'text-stone-600'
                  }`}
                >
                  <CloudRain className="w-3.5 h-3.5" /> Fortes Pluies
                </button>
              </div>
            </div>

            {/* Table des prédictions */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-stone-100 text-stone-600 border-b border-stone-200 uppercase text-[10px] font-bold tracking-wider">
                    <th className="p-3">Produit</th>
                    <th className="p-3">Stock Actuel</th>
                    <th className="p-3">Vente Moyenne/j</th>
                    <th className="p-3">Tendance</th>
                    <th className="p-3">Impact Météo Estimé</th>
                    <th className="p-3">Demande Prévue (7j)</th>
                    <th className="p-3 text-right">Commande Conseillée</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {demandPredictions.map((pred) => {
                    const adjustedForecast = Math.round(pred.forecast7Days * (pred.productName.includes('Bière') ? getWeatherMultiplier() : 1.0));
                    const adjustedOrder = Math.max(0, adjustedForecast - pred.currentStock + 15);

                    return (
                      <tr key={pred.productCode} className="hover:bg-stone-50">
                        <td className="p-3">
                          <span className="font-bold text-stone-900 block">{pred.productName}</span>
                          <span className="text-[10px] text-stone-400 font-mono">{pred.productCode}</span>
                        </td>

                        <td className="p-3 font-mono font-semibold text-stone-800">
                          {pred.currentStock}
                        </td>

                        <td className="p-3 font-mono text-stone-600">
                          {pred.avgDailySales} /j
                        </td>

                        <td className="p-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                            pred.trend === 'HAUSSE' ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-700'
                          }`}>
                            <TrendingUp className="w-3 h-3" />
                            {pred.trend}
                          </span>
                        </td>

                        <td className="p-3 text-stone-600 max-w-xs">
                          {pred.productName.includes('Bière') && weatherCondition === 'HEATWAVE' ? (
                            <span className="text-amber-800 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                              ☀️ +35% Pic Canicule
                            </span>
                          ) : (
                            pred.weatherImpact
                          )}
                        </td>

                        <td className="p-3 font-mono font-bold text-indigo-700">
                          {adjustedForecast} unités
                        </td>

                        <td className="p-3 text-right">
                          <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                            +{adjustedOrder} unités
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= SECTION 3 : DÉTECTION DE FRAUDE & AUDIT INALTÉRABLE ================= */}
      {activeTab === 'FRAUD' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Alertes de fraude & anomalies (Lg: 5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-stone-200 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-600" />
                <h3 className="font-bold text-sm text-stone-900">ALERTES ANOMALIES EN DIRECT</h3>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-red-100 text-red-800 font-bold">
                {fraudAlerts.filter(a => a.status === 'PENDING').length} actives
              </span>
            </div>

            <div className="space-y-3">
              {fraudAlerts.map((alert) => (
                <div 
                  key={alert.id}
                  className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                    alert.status === 'PENDING' ? 'bg-red-50/50 border-red-200' : 'bg-stone-50 border-stone-200 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      alert.severity === 'HIGH' ? 'bg-red-600 text-white' : 'bg-amber-500 text-stone-950'
                    }`}>
                      {alert.type}
                    </span>
                    <span className="font-mono text-[10px] text-stone-400">{alert.timestamp}</span>
                  </div>

                  <p className="font-bold text-stone-900">{alert.title}</p>
                  <p className="text-stone-600">{alert.description}</p>
                  <div className="text-[10px] text-stone-500 font-mono">
                    Opérateur : {alert.cashierName} • Terminal : {alert.posTerminal}
                  </div>

                  {alert.status === 'PENDING' ? (
                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => onResolveFraudAlert(alert.id)}
                        className="px-2.5 py-1 rounded bg-stone-900 hover:bg-stone-800 text-white font-bold text-[10px]"
                      >
                        Marquer Examiné
                      </button>
                    </div>
                  ) : (
                    <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Audit clôturé par le superviseur
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Journal d'Audit Inaltérable avec Hash SHA-256 (Lg: 7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-stone-200 shadow-xs p-5">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-sm text-stone-900">PISTE D’AUDIT INALTÉRABLE (HASH CHAIN)</h3>
              </div>
              <span className="text-[10px] font-mono bg-stone-100 px-2 py-1 rounded border text-stone-600">
                Norme NF525 / ACID Compliant
              </span>
            </div>

            <div className="space-y-2.5 overflow-y-auto max-h-[420px] pr-1">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-stone-900">{log.action}</span>
                    <span className="font-mono text-[10px] text-stone-400">{log.timestamp}</span>
                  </div>

                  <p className="text-stone-600 mb-1">{log.details}</p>
                  <p className="text-[10px] text-stone-500">
                    Opérateur : <strong>{log.operator}</strong> ({log.role}) • Catégorie : {log.category}
                  </p>

                  <div className="mt-2 pt-1.5 border-t border-stone-200/80 flex items-center justify-between font-mono text-[9px] text-stone-500">
                    <span>EMPREINTE SHA-256 :</span>
                    <span className="text-emerald-800 truncate max-w-[280px]">{log.immutableHash}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
