import React, { useState, useRef } from 'react';
import { 
  X, 
  Download, 
  Upload, 
  HardDrive, 
  Smartphone, 
  Globe, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  FileSpreadsheet, 
  Copy, 
  ExternalLink,
  ShieldCheck,
  Trash2
} from 'lucide-react';
import { ProductItem, StockItem, SaleRecord, CategoryConfig, UnitConfig } from '../types';
import { formatFCFA } from '../data/initialData';

interface BackupAndPublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryConfig[];
  units: UnitConfig[];
  productsList: ProductItem[];
  stockList: StockItem[];
  salesList: SaleRecord[];
  lastSavedTime: Date | null;
  onRestoreData: (backup: {
    categories?: CategoryConfig[];
    units?: UnitConfig[];
    productsList?: ProductItem[];
    stockList?: StockItem[];
    salesList?: SaleRecord[];
  }) => void;
  onClearDemoSales: () => void;
  onResetAllData: () => void;
  installPrompt: any;
  onTriggerInstall: () => void;
}

export const BackupAndPublishModal: React.FC<BackupAndPublishModalProps> = ({
  isOpen,
  onClose,
  categories,
  units,
  productsList,
  stockList,
  salesList,
  lastSavedTime,
  onRestoreData,
  onClearDemoSales,
  onResetAllData,
  installPrompt,
  onTriggerInstall
}) => {
  const [activeTab, setActiveTab] = useState<'BACKUP' | 'INSTALL' | 'PUBLISH'>('BACKUP');
  const [copySuccess, setCopySuccess] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const currentAppUrl = window.location.href.split('?')[0];

  // 1. Export JSON Full Backup
  const handleExportJSON = () => {
    const backupData = {
      nomApplication: 'LES DELICES DE MAMAN',
      dateExport: new Date().toISOString(),
      version: '1.2.0',
      statistiques: {
        totalProduits: productsList.length,
        totalArticlesStock: stockList.length,
        totalVentes: salesList.length
      },
      categories,
      units,
      productsList,
      stockList,
      salesList
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    const dateSlug = new Date().toISOString().slice(0, 10);
    a.download = `SAUVEGARDE_DELICES_DE_MAMAN_${dateSlug}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  // 2. Export CSV for Excel (Ventes)
  const handleExportSalesCSV = () => {
    const headers = ['ID', 'Date', 'Mois', 'Reference', 'Designation', 'Categorie', 'Quantite', 'Prix_Vente_Total', 'Benefice'];
    const rows = salesList.map(s => [
      s.id,
      s.date,
      s.mois,
      `"${s.reference.replace(/"/g, '""')}"`,
      `"${s.designation.replace(/"/g, '""')}"`,
      `"${s.category.replace(/"/g, '""')}"`,
      s.quantiteVendue,
      s.prixVenteTotal,
      s.benefice
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map(e => e.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `JOURNAL_VENTES_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // 3. Export CSV for Stock
  const handleExportStockCSV = () => {
    const headers = ['Reference', 'Designation', 'Categorie', 'Unite', 'Stock_Initial', 'Entrees', 'Sorties', 'Ventes', 'Stock_Final', 'Prix_Achat', 'Valeur_Stock'];
    const rows = stockList.map(s => {
      const stockFinal = (s.stockInitial || 0) + (s.entrees || 0) - (s.sorties || 0) - (s.vente || 0);
      const coutRevient = (s.prixAchat || 0) + (s.margeFrais || 0);
      const valeurStock = Math.max(0, stockFinal) * coutRevient;
      return [
        `"${s.reference.replace(/"/g, '""')}"`,
        `"${s.designation.replace(/"/g, '""')}"`,
        `"${s.category.replace(/"/g, '""')}"`,
        s.unit,
        s.stockInitial || 0,
        s.entrees || 0,
        s.sorties || 0,
        s.vente || 0,
        stockFinal,
        coutRevient,
        valeurStock
      ];
    });
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map(e => e.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ETAT_DU_STOCK_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // 4. File Import Handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    setImportSuccess(false);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed.productsList && !parsed.stockList && !parsed.feuille_Stock) {
          throw new Error("Format de fichier non reconnu. Veuillez importer un fichier JSON généré par cette application.");
        }

        const dataToRestore = {
          categories: parsed.categories || parsed.feuille_Configuration?.categories?.map((name: string, i: number) => ({ id: `cat-${i}`, name })),
          units: parsed.units || parsed.feuille_Configuration?.unites?.map((name: string, i: number) => ({ id: `u-${i}`, name })),
          productsList: parsed.productsList || parsed.feuille_Liste_produits_services,
          stockList: parsed.stockList || parsed.feuille_Stock,
          salesList: parsed.salesList || parsed.feuille_Vente
        };

        if (window.confirm(`Confirmez-vous la restauration de cette sauvegarde ?\n- ${dataToRestore.productsList?.length || 0} produits\n- ${dataToRestore.stockList?.length || 0} articles en stock\n- ${dataToRestore.salesList?.length || 0} ventes enregistrées`)) {
          onRestoreData(dataToRestore);
          setImportSuccess(true);
          setTimeout(() => {
            setImportSuccess(false);
          }, 4000);
        }
      } catch (err: any) {
        setImportError(err.message || "Erreur lors de la lecture du fichier de sauvegarde.");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentAppUrl);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-stone-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-500 to-amber-500 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              💾
            </div>
            <div>
              <h2 className="text-lg font-black text-stone-900">
                Centre de Sauvegarde, Installation & Déploiement
              </h2>
              <p className="text-xs text-stone-500">
                Sécurisez vos données et installez l'application sur tous vos appareils
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-stone-100 rounded-full text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 pt-3 pb-2 border-b border-stone-100">
          <button
            onClick={() => setActiveTab('BACKUP')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'BACKUP'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <HardDrive className="w-4 h-4" />
            <span>Sauvegarder & Exporter</span>
          </button>

          <button
            onClick={() => setActiveTab('INSTALL')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'INSTALL'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Installer l'Application</span>
          </button>

          <button
            onClick={() => setActiveTab('PUBLISH')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'PUBLISH'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Publier en Ligne</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="py-4 overflow-y-auto space-y-4 flex-1">
          
          {/* TAB 1: SAUVEGARDE & EXPORT */}
          {activeTab === 'BACKUP' && (
            <div className="space-y-4">
              {/* Auto-save status banner */}
              <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-emerald-900 block">
                    Sauvegarde automatique locale active (LocalStorage)
                  </span>
                  <p className="text-emerald-700 mt-0.5">
                    Toutes vos saisies (articles, entrées/sorties de stock, nouvelles ventes, modifications de prix) sont enregistrées automatiquement en temps réel dans votre navigateur.
                  </p>
                  {lastSavedTime && (
                    <span className="text-[11px] font-mono text-emerald-800 mt-1 block">
                      Dernier enregistrement : {lastSavedTime.toLocaleTimeString('fr-FR')} le {lastSavedTime.toLocaleDateString('fr-FR')}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Full Backup Download */}
                <div className="bg-stone-50 border border-stone-200 p-4 rounded-2xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-stone-900 font-bold text-xs">
                      <Download className="w-4 h-4 text-rose-600" />
                      <span>Télécharger une Sauvegarde (JSON)</span>
                    </div>
                    <p className="text-[11px] text-stone-500 mt-1">
                      Crée un fichier de sauvegarde complet contenant tous vos produits, stocks, ventes et paramètres pour le conserver sur votre ordinateur ou clé USB.
                    </p>
                  </div>
                  <button
                    onClick={handleExportJSON}
                    className="mt-3 w-full py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Sauvegarder (.JSON)</span>
                  </button>
                </div>

                {/* Restore Backup */}
                <div className="bg-stone-50 border border-stone-200 p-4 rounded-2xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-stone-900 font-bold text-xs">
                      <Upload className="w-4 h-4 text-teal-600" />
                      <span>Restaurer une Sauvegarde</span>
                    </div>
                    <p className="text-[11px] text-stone-500 mt-1">
                      Chargez un fichier de sauvegarde préalablement exporté pour récupérer vos données sur un autre appareil ou après nettoyage.
                    </p>
                  </div>
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept=".json"
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-3 w-full py-2 px-3 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Choisir un fichier (.JSON)</span>
                    </button>
                  </div>
                </div>

                {/* Export Excel / CSV Ventes */}
                <div className="bg-stone-50 border border-stone-200 p-4 rounded-2xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-stone-900 font-bold text-xs">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                      <span>Exporter les Ventes (Excel / CSV)</span>
                    </div>
                    <p className="text-[11px] text-stone-500 mt-1">
                      Téléchargez le journal de toutes les ventes avec CA, coûts et bénéfices calculés, directement ouvrable dans Excel.
                    </p>
                  </div>
                  <button
                    onClick={handleExportSalesCSV}
                    className="mt-3 w-full py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Exporter Journal Ventes (.CSV)</span>
                  </button>
                </div>

                {/* Export Excel / CSV Stocks */}
                <div className="bg-stone-50 border border-stone-200 p-4 rounded-2xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-stone-900 font-bold text-xs">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                      <span>Exporter le Stock Réel (Excel / CSV)</span>
                    </div>
                    <p className="text-[11px] text-stone-500 mt-1">
                      Téléchargez l'inventaire complet avec les stocks initiaux, entrées, sorties, ventes et valeurs de stock en FCFA.
                    </p>
                  </div>
                  <button
                    onClick={handleExportStockCSV}
                    className="mt-3 w-full py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Exporter Fiche Stock (.CSV)</span>
                  </button>
                </div>
              </div>

              {/* Status notifications */}
              {importSuccess && (
                <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Sauvegarde restaurée avec succès ! Toutes vos données sont à jour.</span>
                </div>
              )}
              {importError && (
                <div className="p-3 bg-rose-100 border border-rose-300 text-rose-900 rounded-xl text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0" />
                  <span>{importError}</span>
                </div>
              )}

              {/* Reset / Clean Options */}
              <div className="pt-3 border-t border-stone-200">
                <span className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block mb-2">
                  Nettoyage des Données de Test & Démarrage Réel
                </span>

                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => {
                      if (window.confirm("Voulez-vous supprimer les 3 ventes d'exemple (+29 500 FCFA de bénéfice) pour démarrer votre caisse réelle à 0 FCFA ?")) {
                        onClearDemoSales();
                      }
                    }}
                    className="flex-1 py-2.5 px-3 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-amber-700" />
                    <span>Effacer les 3 ventes de démo (Remise à 0 du Bénéfice)</span>
                  </button>

                  <button
                    onClick={() => {
                      if (window.confirm("Attention : Cette action va réinitialiser l'application aux données d'origine de LES DELICES DE MAMAN. Confirmer ?")) {
                        onResetAllData();
                      }
                    }}
                    className="py-2.5 px-3 bg-stone-100 hover:bg-rose-50 border border-stone-300 hover:border-rose-300 text-stone-700 hover:text-rose-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-stone-500" />
                    <span>Réinitialiser tout</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INSTALLATION APPLICATION */}
          {activeTab === 'INSTALL' && (
            <div className="space-y-4 text-xs">
              <div className="bg-gradient-to-r from-rose-50 to-amber-50 border border-rose-200 p-4 rounded-2xl">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center text-xl font-bold shadow-sm">
                    📲
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900 text-sm">
                      Installer comme une vraie application (PWA)
                    </h3>
                    <p className="text-stone-600 text-[11px] mt-0.5">
                      Accédez aux Délices de Maman depuis votre écran d'accueil sans passer par le navigateur, et utilisez-la même sans connexion internet !
                    </p>
                  </div>
                </div>

                {installPrompt && (
                  <button
                    onClick={onTriggerInstall}
                    className="mt-3 w-full py-2.5 px-4 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Cliquer ici pour Installer l'application maintenant</span>
                  </button>
                )}
              </div>

              {/* Detailed Guide per OS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Android */}
                <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 font-bold text-stone-900">
                    <span className="text-base">🤖</span>
                    <span>Android (Google Chrome)</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-[11px] text-stone-600">
                    <li>Ouvrez le lien dans <strong>Google Chrome</strong></li>
                    <li>Appuyez sur les <strong>3 petits points (⋮)</strong> en haut à droite</li>
                    <li>Sélectionnez <strong>« Installer l'application »</strong> ou « Ajouter à l'écran d'accueil »</li>
                    <li>L'icône Délices de Maman apparaît sur votre écran !</li>
                  </ol>
                </div>

                {/* iPhone / iPad */}
                <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 font-bold text-stone-900">
                    <span className="text-base">🍎</span>
                    <span>iPhone / iPad (Safari)</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-[11px] text-stone-600">
                    <li>Ouvrez le lien dans <strong>Safari</strong></li>
                    <li>Appuyez sur le bouton <strong>Partager</strong> (le carré avec flèche vers le haut ⬆️)</li>
                    <li>Faites défiler et touchez <strong>« Sur l'écran d'accueil »</strong></li>
                    <li>Touchez « Ajouter » en haut à droite.</li>
                  </ol>
                </div>

                {/* PC / Mac */}
                <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 font-bold text-stone-900">
                    <span className="text-base">💻</span>
                    <span>Ordinateur (Chrome / Edge)</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-[11px] text-stone-600">
                    <li>Regardez à l'extrémité droite de la barre d'adresse (URL)</li>
                    <li>Cliquez sur l'icône <strong>d'ordinateur avec flèche</strong> « Installer »</li>
                    <li>Ou cliquez sur le menu (⋮) &gt; « Enregistrer et partager » &gt; « Installer l'application »</li>
                    <li>L'application s'ouvre dans sa propre fenêtre dédiée !</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PUBLIER EN LIGNE */}
          {activeTab === 'PUBLISH' && (
            <div className="space-y-4 text-xs">
              {/* Public Link Card */}
              <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-bold text-blue-900 text-sm block">
                      Votre Lien d'Accès Web Actuel
                    </span>
                    <p className="text-blue-700 text-[11px] mt-0.5">
                      Ce lien est déjà hébergé en ligne sur Google Cloud et accessible depuis n'importe quel ordinateur ou téléphone dans le monde.
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    En Ligne
                  </span>
                </div>

                <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-blue-200">
                  <input
                    type="text"
                    readOnly
                    value={currentAppUrl}
                    className="w-full text-xs font-mono text-stone-800 bg-transparent focus:outline-none select-all"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shrink-0 cursor-pointer transition-colors"
                  >
                    {copySuccess ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copySuccess ? 'Copié !' : 'Copier'}</span>
                  </button>
                </div>
              </div>

              {/* Publication options */}
              <div className="space-y-2.5">
                <span className="font-bold text-stone-900 block">
                  3 Façons de publier et déployer votre logiciel :
                </span>

                <div className="p-3 bg-stone-50 border border-stone-200 rounded-2xl flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center font-bold text-xs shrink-0">
                    1
                  </div>
                  <div>
                    <span className="font-bold text-stone-900 block">Déploiement Cloud Run en 1 clic (Recommandé)</span>
                    <p className="text-[11px] text-stone-600 mt-0.5">
                      Dans le menu supérieur de Google AI Studio, cliquez simplement sur le bouton <strong>« Deploy » (Déployer)</strong> ou <strong>« Share » (Partager)</strong>. Votre application recevra une adresse web sécurisée (HTTPS) permanente.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-stone-50 border border-stone-200 rounded-2xl flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                    2
                  </div>
                  <div>
                    <span className="font-bold text-stone-900 block">Export vers GitHub ou ZIP</span>
                    <p className="text-[11px] text-stone-600 mt-0.5">
                      Depuis le menu de paramétrage de l'éditeur en haut à droite, vous pouvez exporter tout le projet sous forme de <strong>ZIP</strong> ou le pousser vers un dépôt <strong>GitHub</strong>.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-stone-50 border border-stone-200 rounded-2xl flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                    3
                  </div>
                  <div>
                    <span className="font-bold text-stone-900 block">Hébergement Gratuit (Vercel, Netlify, Render)</span>
                    <p className="text-[11px] text-stone-600 mt-0.5">
                      En connectant le code à Vercel ou Netlify, votre application est compilée automatiquement avec <code>npm run build</code> et reste accessible 24h/24 gratuitement avec nom de domaine personnalisable (ex: <code>delices-maman.com</code>).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
          <div className="text-[11px] text-stone-500 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Sauvegarde automatique active</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
};
