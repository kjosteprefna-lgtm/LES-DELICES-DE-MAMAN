import React, { useState } from 'react';
import { 
  Users, 
  CreditCard, 
  MessageSquare, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  DollarSign, 
  Award, 
  Search,
  Phone
} from 'lucide-react';
import { Customer } from '../types';
import { formatCurrency } from '../data/mockDatabase';

interface CrmModuleProps {
  customers: Customer[];
  onAddCustomer: (customer: Customer) => void;
  onRecordDebtPayment: (customerId: string, amount: number) => void;
}

export const CrmModule: React.FC<CrmModuleProps> = ({
  customers,
  onAddCustomer,
  onRecordDebtPayment,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer>(customers[0]);
  const [paymentAmount, setPaymentAmount] = useState<number>(10000);
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
  const [simulatedSmsSent, setSimulatedSmsSent] = useState<string | null>(null);

  // New customer form
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newCreditLimit, setNewCreditLimit] = useState(100000);

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newCust: Customer = {
      id: `CUST-${String(customers.length + 1).padStart(3, '0')}`,
      name: newName,
      phone: newPhone || '+225 07 00 00 00 00',
      email: `${newName.toLowerCase().replace(/\s+/g, '.')}@client.com`,
      loyaltyPoints: 50,
      loyaltyCashback: 250,
      tier: 'Standard',
      creditLimit: newCreditLimit,
      currentCredit: 0,
      lastPaymentDate: new Date().toISOString().split('T')[0],
      active: true
    };

    onAddCustomer(newCust);
    setIsAddCustomerModalOpen(false);
    setNewName('');
    setNewPhone('');
  };

  const handleSendReminderSms = (cust: Customer) => {
    const msg = `Cher(e) ${cust.name}, votre supermarché OmniMarket vous informe que votre compte présente un arriéré de ${formatCurrency(cust.currentCredit)}. Merci de bien vouloir régulariser auprès de nos caisses ou via Wave/Orange Money.`;
    setSimulatedSmsSent(msg);
  };

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm) ||
    c.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Top Banner Overview */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <h2 className="font-bold text-sm text-stone-900 tracking-wide">CRM, FIDÉLITÉ & GESTION DU CRÉDIT CLIENT</h2>
          <p className="text-xs text-stone-500">Comptes VIP, cagnottes fidélité / cashback et relances automatiques des arriérés.</p>
        </div>

        <button
          id="add-customer-btn"
          onClick={() => setIsAddCustomerModalOpen(true)}
          className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau Compte Client</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ================= LISTE CLIENTS & SOLDES (Lg: 7 cols) ================= */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="p-3 bg-stone-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-xs uppercase tracking-wider">Répertoire Clients & Arriérés</h3>
            </div>
            
            <div className="relative w-48">
              <input
                type="text"
                placeholder="Rechercher nom, tél..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-stone-800 border border-stone-700 rounded px-2.5 py-1 text-xs text-white placeholder-stone-400"
              />
            </div>
          </div>

          <div className="divide-y divide-stone-100 overflow-y-auto max-h-[500px]">
            {filtered.map(cust => {
              const isOverLimit = cust.currentCredit >= cust.creditLimit * 0.85;

              return (
                <div
                  key={cust.id}
                  onClick={() => setSelectedCustomer(cust)}
                  className={`p-3.5 hover:bg-stone-50 cursor-pointer transition-colors flex items-center justify-between gap-3 ${
                    selectedCustomer.id === cust.id ? 'bg-emerald-50/70 border-l-4 border-l-emerald-600' : ''
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-stone-900">{cust.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                        cust.tier === 'VIP' ? 'bg-purple-100 text-purple-800' :
                        cust.tier === 'Gold' ? 'bg-amber-100 text-amber-800' :
                        'bg-stone-100 text-stone-700'
                      }`}>
                        {cust.tier}
                      </span>
                    </div>

                    <p className="text-[11px] text-stone-500 mt-0.5">{cust.phone} • {cust.email}</p>
                    
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-stone-400">
                      <span>Fidélité : <strong className="text-emerald-700">{cust.loyaltyPoints} pts</strong></span>
                      <span>• Cagnotte : <strong className="text-emerald-700">{formatCurrency(cust.loyaltyCashback)}</strong></span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-stone-400 block uppercase">Arriéré / Dette</span>
                    <span className={`font-mono font-black text-xs ${cust.currentCredit > 0 ? 'text-amber-800' : 'text-emerald-700'}`}>
                      {formatCurrency(cust.currentCredit)}
                    </span>
                    <span className="text-[10px] text-stone-400 block font-mono">Plafond: {formatCurrency(cust.creditLimit)}</span>

                    {isOverLimit && (
                      <span className="inline-block mt-1 text-[9px] px-1.5 py-0.2 bg-red-100 text-red-700 font-bold rounded animate-pulse">
                        Plafond Critique
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ================= FICHE CLIENT DÉTAILLÉE & RELANCE (Lg: 5 cols) ================= */}
        <div className="lg:col-span-5 space-y-4">
          
          {selectedCustomer && (
            <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-3">
                <div>
                  <h3 className="font-bold text-sm text-stone-900">{selectedCustomer.name}</h3>
                  <p className="text-xs text-stone-500">{selectedCustomer.phone} • Ref : {selectedCustomer.id}</p>
                </div>
                <div className="h-9 w-9 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
                  {selectedCustomer.tier.charAt(0)}
                </div>
              </div>

              {/* Statuts Crédit et Carte Fidélité */}
              <div className="space-y-2 text-xs mb-4">
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <div className="flex justify-between text-stone-600 mb-1">
                    <span>Arriéré en cours :</span>
                    <strong className="font-mono text-stone-900 text-sm">{formatCurrency(selectedCustomer.currentCredit)}</strong>
                  </div>
                  <div className="flex justify-between text-stone-600 mb-2">
                    <span>Plafond autorisé :</span>
                    <strong className="font-mono text-stone-700">{formatCurrency(selectedCustomer.creditLimit)}</strong>
                  </div>

                  {/* Progress bar utilisation crédit */}
                  <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${
                        (selectedCustomer.currentCredit / selectedCustomer.creditLimit) > 0.85 ? 'bg-red-600' : 'bg-emerald-600'
                      }`}
                      style={{ width: `${Math.min(100, (selectedCustomer.currentCredit / selectedCustomer.creditLimit) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Formulaire règlement d'arriéré */}
                {selectedCustomer.currentCredit > 0 && (
                  <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-2">
                    <span className="font-bold text-xs text-emerald-950 block">Encaisser un Remboursement d'Arriéré</span>
                    
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min={100}
                        max={selectedCustomer.currentCredit}
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(Number(e.target.value))}
                        className="flex-1 bg-white border border-emerald-300 rounded px-2.5 py-1 text-xs font-mono font-bold text-stone-900"
                      />
                      <button
                        id="record-debt-payment-btn"
                        onClick={() => {
                          onRecordDebtPayment(selectedCustomer.id, paymentAmount);
                          setPaymentAmount(Math.max(0, selectedCustomer.currentCredit - paymentAmount));
                        }}
                        className="px-3 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-xs font-bold cursor-pointer"
                      >
                        Valider
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Bouton relance WhatsApp / SMS */}
              {selectedCustomer.currentCredit > 0 && (
                <button
                  id="send-whatsapp-reminder-btn"
                  onClick={() => handleSendReminderSms(selectedCustomer)}
                  className="w-full py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Envoyer Relance SMS / WhatsApp</span>
                </button>
              )}

              {/* Message simulé */}
              {simulatedSmsSent && (
                <div className="mt-3 p-3 bg-stone-900 text-stone-100 rounded-xl text-xs space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-emerald-400 font-bold uppercase">
                    <span>SMS / WhatsApp Délivré</span>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-[11px] text-stone-300 leading-relaxed font-mono">
                    "{simulatedSmsSent}"
                  </p>
                </div>
              )}

            </div>
          )}

        </div>

      </div>

      {/* ================= MODAL NOUVEAU CLIENT ================= */}
      {isAddCustomerModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreateCustomer} className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-stone-200">
            <h3 className="font-bold text-base text-stone-900 mb-1">Ouverture Compte Client & Crédit</h3>
            <p className="text-xs text-stone-500 mb-4">Attribution d'une carte fidélité et d'un plafond autorisé.</p>

            <div className="space-y-3 text-xs mb-4">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">Nom et Prénoms :</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Ibrahim Sanogo"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded p-2 text-stone-900"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Téléphone (SMS/WhatsApp) :</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: +225 07 12 34 56 78"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded p-2 text-stone-900"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Plafond Crédit Autorisé (FCFA) :</label>
                <input
                  type="number"
                  min={0}
                  step={10000}
                  value={newCreditLimit}
                  onChange={(e) => setNewCreditLimit(Number(e.target.value))}
                  className="w-full bg-stone-50 border border-stone-300 rounded p-2 font-mono text-stone-900"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsAddCustomerModalOpen(false)}
                className="flex-1 py-2 rounded-lg border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-100"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Créer Compte
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
