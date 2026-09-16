import { ProductItem, StockItem, SaleRecord, CategoryConfig, UnitConfig, SectorType } from '../types';
export type { ProductItem, StockItem, SaleRecord, CategoryConfig, UnitConfig, SectorType };

export const SECTOR_CONFIG = {
  ALIMENTATION_PATISSERIE: {
    id: 'ALIMENTATION_PATISSERIE' as const,
    label: 'Alimentation Divers & Pâtisserie',
    shortLabel: 'Alimentation & Pâtisserie',
    icon: '🥐',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
    colorHex: '#d97706',
    borderClass: 'border-amber-200',
    bgLight: 'bg-amber-50/70',
    description: 'Alimentation, pâtisserie, délices, épicerie et divers'
  },
  TECHNIQUE_INDUSTRIEL: {
    id: 'TECHNIQUE_INDUSTRIEL' as const,
    label: 'Électronique, Mécanique & Électricité',
    shortLabel: 'Électronique & Mécanique',
    icon: '⚡',
    badgeClass: 'bg-blue-100 text-blue-900 border-blue-300',
    colorHex: '#2563eb',
    borderClass: 'border-blue-200',
    bgLight: 'bg-blue-50/70',
    description: 'Électronique, mécanique, électricité, froid et climatisation'
  }
};

export function getCategorySector(categoryName: string): SectorType {
  const c = (categoryName || '').toLowerCase().trim();
  if (
    c.includes('alim') ||
    c.includes('patiss') ||
    c.includes('pâtiss') ||
    c.includes('diver') ||
    c.includes('pain') ||
    c.includes('yaourt') ||
    c.includes('boulang') ||
    c.includes('croiss') ||
    c.includes('gateau') ||
    c.includes('gâteau') ||
    c.includes('coulis')
  ) {
    return 'ALIMENTATION_PATISSERIE';
  }
  return 'TECHNIQUE_INDUSTRIEL';
}

export function getItemSector(item: { category: string }): SectorType {
  return getCategorySector(item.category);
}

export const INITIAL_CATEGORIES: CategoryConfig[] = [
  // Pôle Alimentation Divers & Pâtisserie
  { id: 'cat-4', name: 'Alimentation', sector: 'ALIMENTATION_PATISSERIE', description: 'Produits alimentaires & ingrédients' },
  { id: 'cat-7', name: 'Patisserie', sector: 'ALIMENTATION_PATISSERIE', description: 'Gâteaux, viennoiseries et créations' },
  { id: 'cat-6', name: 'Divers', sector: 'ALIMENTATION_PATISSERIE', description: 'Articles consommables et divers' },

  // Pôle Électronique, Mécanique & Électricité
  { id: 'cat-2', name: 'Produits - Electronique', sector: 'TECHNIQUE_INDUSTRIEL', description: 'Automates et cartes de contrôle' },
  { id: 'cat-1', name: 'Produits - Electrique', sector: 'TECHNIQUE_INDUSTRIEL', description: 'Contacteurs, chargeurs et appareillage' },
  { id: 'cat-5', name: 'Produits - Mécanique', sector: 'TECHNIQUE_INDUSTRIEL', description: 'Démarreurs, radiateurs et pièces mécaniques' },
  { id: 'cat-3', name: 'Produits - Froid & climatisation', sector: 'TECHNIQUE_INDUSTRIEL', description: 'Fluides frigorigènes et climatisation' }
];

export const INITIAL_UNITS: UnitConfig[] = [
  { id: 'u-1', name: 'Pce' },
  { id: 'u-2', name: 'Prestation' },
  { id: 'u-3', name: 'Carton' },
  { id: 'u-4', name: 'L' },
  { id: 'u-5', name: 'Kg' },
  { id: 'u-6', name: 'Paquet' }
];

// Formule Excel : =IF($D5=0,"",LEFT($D5,4)&"-"&LEFT($E5,4)&"-"&$G5)
export function generateReference(designation: string, category: string, ranking: string): string {
  if (!designation || designation.trim() === '') return '';
  const dPart = designation.trim().substring(0, 4);
  const cPart = category ? category.trim().substring(0, 4) : 'Prod';
  const rPart = ranking && ranking.trim() !== '' ? ranking.trim() : 'R1';
  return `${dPart}-${cPart}-${rPart}`;
}

export const INITIAL_PRODUCTS_LIST: ProductItem[] = [
  {
    id: 'p-1',
    reference: 'AMF -Prod-E1R1',
    designation: 'AMF Genset Controller En occasion Automate',
    category: 'Produits - Electronique',
    sellingPrice: 100000,
    rankingOrder: 'E1R1',
    unit: 'Pce'
  },
  {
    id: 'p-2',
    reference: 'Inte-Prod-E1R1',
    designation: 'Intelilite AMF 25 En occasion Automate',
    category: 'Produits - Electronique',
    sellingPrice: 100000,
    rankingOrder: 'E1R1',
    unit: 'Pce'
  },
  {
    id: 'p-3',
    reference: '7420-Prod-E1R1',
    designation: '7420 MKII Deep Sea Electronic Automate',
    category: 'Produits - Electronique',
    sellingPrice: 250000,
    rankingOrder: 'E1R1',
    unit: 'Pce'
  },
  {
    id: 'p-4',
    reference: '7320-Prod-E1R1',
    designation: '7320 MKII Deep Sea Electronic Automate',
    category: 'Produits - Electronique',
    sellingPrice: 250000,
    rankingOrder: 'E1R1',
    unit: 'Pce'
  },
  {
    id: 'p-5',
    reference: 'APM -Prod-E1R1',
    designation: 'APM 303 Automate Occasion 15582H',
    category: 'Produits - Electronique',
    sellingPrice: 50000,
    rankingOrder: 'E1R1',
    unit: 'Pce'
  },
  {
    id: 'p-6',
    reference: '12v--Prod-E1R1',
    designation: '12v-3,5 A Unicharge 50 Chargeur electrique Occas',
    category: 'Produits - Electrique',
    sellingPrice: 35000,
    rankingOrder: 'E1R1',
    unit: 'Pce'
  },
  {
    id: 'p-7',
    reference: 'Elc-Prod-E1R1',
    designation: 'Elcos Chargeur 12v-2,5 A',
    category: 'Produits - Electrique',
    sellingPrice: 35000,
    rankingOrder: 'E1R1',
    unit: 'Pce'
  },
  {
    id: 'p-8',
    reference: '12v--Prod-E1R1b',
    designation: '12v-5 A power chargeur electrique',
    category: 'Produits - Electrique',
    sellingPrice: 35000,
    rankingOrder: 'E1R1',
    unit: 'Pce'
  },
  {
    id: 'p-9',
    reference: 'R-22-Prod-F1R1',
    designation: 'R-22 Refrigerants',
    category: 'Produits - Froid & climatisation',
    sellingPrice: 6000,
    rankingOrder: 'F1R1',
    unit: 'Kg'
  },
  {
    id: 'p-10',
    reference: 'R-41-Prod-F1R1',
    designation: 'R-410A Refrigerants',
    category: 'Produits - Froid & climatisation',
    sellingPrice: 10000,
    rankingOrder: 'F1R1',
    unit: 'Kg'
  },
  {
    id: 'p-11',
    reference: '12v -Prod-M1R1',
    designation: '12v demarreur Perkins 10,13,22,25 KVA',
    category: 'Produits - Mécanique',
    sellingPrice: 80000,
    rankingOrder: 'M1R1',
    unit: 'Pce'
  },
  {
    id: 'p-12',
    reference: 'Radi-Prod-M1R1',
    designation: 'Radiateur Perkins 10,13,22,25 KVA',
    category: 'Produits - Mécanique',
    sellingPrice: 200000,
    rankingOrder: 'M1R1',
    unit: 'Pce'
  },
  {
    id: 'p-13',
    reference: 'Coff-Prod-E1R1',
    designation: 'Coffret Pose Compteur E2C',
    category: 'Produits - Electrique',
    sellingPrice: 18000,
    rankingOrder: 'E1R1',
    unit: 'Pce'
  },
  {
    id: 'p-14',
    reference: 'dema-Prod-M1R1',
    designation: 'demarreur 12v J33',
    category: 'Produits - Mécanique',
    sellingPrice: 250000,
    rankingOrder: 'M1R1',
    unit: 'Pce'
  },
  {
    id: 'p-15',
    reference: 'LC1D-Prod-E1R1',
    designation: 'LC1DT60A Schneider Contacteur',
    category: 'Produits - Electrique',
    sellingPrice: 50000,
    rankingOrder: 'E1R1',
    unit: 'Pce'
  },
  {
    id: 'p-16',
    reference: 'Cont-Prod-E1R1',
    designation: 'Contacteur Telemecanique LC1D40004',
    category: 'Produits - Electrique',
    sellingPrice: 50000,
    rankingOrder: 'E1R1',
    unit: 'Pce'
  },
  {
    id: 'p-17',
    reference: '12v--Prod-E1R1c',
    designation: '12v-5 A DSE chargeur electrique',
    category: 'Produits - Electrique',
    sellingPrice: 50000,
    rankingOrder: 'E1R1',
    unit: 'Pce'
  },
  {
    id: 'p-18',
    reference: 'Cole-Prod-M1R2',
    designation: 'Cole Bossil Grey RTV 625 F',
    category: 'Produits - Mécanique',
    sellingPrice: 2000,
    rankingOrder: 'M1R2',
    unit: 'Pce'
  },
  {
    id: 'p-19',
    reference: 'Cole-Prod-M1R2b',
    designation: 'Cole Araldite',
    category: 'Produits - Mécanique',
    sellingPrice: 10000,
    rankingOrder: 'M1R2',
    unit: 'Pce'
  },
  {
    id: 'p-20',
    reference: 'P553-Prod-M1R2',
    designation: 'P553004 Filtre à Gasoil',
    category: 'Produits - Mécanique',
    sellingPrice: 5000,
    rankingOrder: 'M1R2',
    unit: 'Pce'
  },
  {
    id: 'p-21',
    reference: 'Pain-Alim-A1R1',
    designation: 'Pain Brioché Spécial Délices',
    category: 'Patisserie',
    sellingPrice: 0,
    rankingOrder: 'A1R1',
    unit: 'Pce'
  },
  {
    id: 'p-22',
    reference: 'Croi-Pati-A1R2',
    designation: 'Croissants Pur Beurre (Lot de 4)',
    category: 'Patisserie',
    sellingPrice: 0,
    rankingOrder: 'A1R2',
    unit: 'Paquet'
  },
  {
    id: 'p-23',
    reference: 'Huile-Alim-A2R1',
    designation: 'Huile Raffinée Végétale 5L',
    category: 'Alimentation',
    sellingPrice: 0,
    rankingOrder: 'A2R1',
    unit: 'L'
  },
  {
    id: 'p-24',
    reference: 'RizB-Alim-A2R2',
    designation: 'Riz Blanc Supérieur 25Kg',
    category: 'Alimentation',
    sellingPrice: 0,
    rankingOrder: 'A2R2',
    unit: 'Carton'
  },
  {
    id: 'p-25',
    reference: 'Dive-Dive-D1R1',
    designation: 'Sacs Emballage & Consommables Divers',
    category: 'Divers',
    sellingPrice: 0,
    rankingOrder: 'D1R1',
    unit: 'Paquet'
  }
];

export const INITIAL_STOCK_LIST: StockItem[] = [
  {
    id: 's-1',
    reference: 'AMF -Prod-E1R1',
    designation: 'AMF Genset Controller En occasion Automate',
    category: 'Produits - Electronique',
    unit: 'Pce',
    stockCritique: 1,
    stockInitial: 2,
    entrees: 0,
    sorties: 0,
    vente: 0,
    prixAchat: 80000,
    margeFrais: 20000
  },
  {
    id: 's-2',
    reference: 'Inte-Prod-E1R1',
    designation: 'Intelilite AMF 25 En occasion Automate',
    category: 'Produits - Electronique',
    unit: 'Pce',
    stockCritique: 1,
    stockInitial: 1,
    entrees: 0,
    sorties: 0,
    vente: 0,
    prixAchat: 80000,
    margeFrais: 20000
  },
  {
    id: 's-3',
    reference: '7320-Prod-E1R1',
    designation: '7320 MKII Deep Sea Electronic Automate',
    category: 'Produits - Electronique',
    unit: 'Pce',
    stockCritique: 5,
    stockInitial: 6,
    entrees: 0,
    sorties: 0,
    vente: 0,
    prixAchat: 120000,
    margeFrais: 0
  },
  {
    id: 's-4',
    reference: '7420-Prod-E1R1',
    designation: '7420 MKII Deep Sea Electronic Automate',
    category: 'Produits - Electronique',
    unit: 'Pce',
    stockCritique: 5,
    stockInitial: 3,
    entrees: 0,
    sorties: 0,
    vente: 0,
    prixAchat: 120000,
    margeFrais: 0
  },
  {
    id: 's-5',
    reference: 'APM -Prod-E1R1',
    designation: 'APM 303 Automate Occasion 15582H',
    category: 'Produits - Electronique',
    unit: 'Pce',
    stockCritique: 5,
    stockInitial: 1,
    entrees: 0,
    sorties: 0,
    vente: 1,
    prixAchat: 30000,
    margeFrais: 5000
  },
  {
    id: 's-6',
    reference: '12,5-Prod-M1R2',
    designation: '12,5*1375 LA Courroie Alternateur Mitsuboshi',
    category: 'Produits - Mécanique',
    unit: 'Pce',
    stockCritique: 7,
    stockInitial: 10,
    entrees: 0,
    sorties: 0,
    vente: 0,
    prixAchat: 2000,
    margeFrais: 0
  },
  {
    id: 's-7',
    reference: 'R-22-Prod-F1R1',
    designation: 'R-22 Refrigerants',
    category: 'Produits - Froid & climatisation',
    unit: 'Kg',
    stockCritique: 14,
    stockInitial: 39,
    entrees: 0,
    sorties: 0,
    vente: 0,
    prixAchat: 3000,
    margeFrais: 0
  },
  {
    id: 's-8',
    reference: 'R-41-Prod-F1R1',
    designation: 'R-410A Refrigerants',
    category: 'Produits - Froid & climatisation',
    unit: 'Kg',
    stockCritique: 12,
    stockInitial: 22,
    entrees: 0,
    sorties: 0,
    vente: 0,
    prixAchat: 4000,
    margeFrais: 0
  },
  {
    id: 's-9',
    reference: '12v--Prod-E1R1',
    designation: '12v-3,5 A Unicharge 50 Chargeur electrique Occas',
    category: 'Produits - Electrique',
    unit: 'Pce',
    stockCritique: 5,
    stockInitial: 1,
    entrees: 0,
    sorties: 0,
    vente: 0,
    prixAchat: 25000,
    margeFrais: 0
  },
  {
    id: 's-10',
    reference: 'Radi-Prod-M1R1',
    designation: 'Radiateur Perkins 10,13,22,25 KVA',
    category: 'Produits - Mécanique',
    unit: 'Pce',
    stockCritique: 2,
    stockInitial: 4,
    entrees: 0,
    sorties: 0,
    vente: 0,
    prixAchat: 140000,
    margeFrais: 10000
  },
  {
    id: 's-11',
    reference: '12v -Prod-M1R1',
    designation: '12v demarreur Perkins 10,13,22,25 KVA',
    category: 'Produits - Mécanique',
    unit: 'Pce',
    stockCritique: 3,
    stockInitial: 5,
    entrees: 0,
    sorties: 0,
    vente: 0,
    prixAchat: 55000,
    margeFrais: 5000
  },
  {
    id: 's-12',
    reference: 'Elc-Prod-E1R1',
    designation: 'Elcos Chargeur 12v-2,5 A',
    category: 'Produits - Electrique',
    unit: 'Pce',
    stockCritique: 4,
    stockInitial: 6,
    entrees: 0,
    sorties: 0,
    vente: 0,
    prixAchat: 24000,
    margeFrais: 2000
  },
  {
    id: 's-13',
    reference: 'Coff-Prod-E1R1',
    designation: 'Coffret Pose Compteur E2C',
    category: 'Produits - Electrique',
    unit: 'Pce',
    stockCritique: 5,
    stockInitial: 8,
    entrees: 0,
    sorties: 0,
    vente: 0,
    prixAchat: 12000,
    margeFrais: 1500
  },
  {
    id: 's-14',
    reference: 'Pain-Alim-A1R1',
    designation: 'Pain Brioché Spécial Délices',
    category: 'Patisserie',
    unit: 'Pce',
    stockCritique: 0,
    stockInitial: 0,
    entrees: 0,
    sorties: 0,
    vente: 0,
    prixAchat: 0,
    margeFrais: 0
  },
  {
    id: 's-15',
    reference: 'Huile-Alim-A2R1',
    designation: 'Huile Raffinée Végétale 5L',
    category: 'Alimentation',
    unit: 'L',
    stockCritique: 0,
    stockInitial: 0,
    entrees: 0,
    sorties: 0,
    vente: 0,
    prixAchat: 0,
    margeFrais: 0
  },
  {
    id: 's-16',
    reference: 'Croi-Pati-A1R2',
    designation: 'Croissants Pur Beurre (Lot de 4)',
    category: 'Patisserie',
    unit: 'Paquet',
    stockCritique: 0,
    stockInitial: 0,
    entrees: 0,
    sorties: 0,
    vente: 0,
    prixAchat: 0,
    margeFrais: 0
  },
  {
    id: 's-17',
    reference: 'RizB-Alim-A2R2',
    designation: 'Riz Blanc Supérieur 25Kg',
    category: 'Alimentation',
    unit: 'Carton',
    stockCritique: 0,
    stockInitial: 0,
    entrees: 0,
    sorties: 0,
    vente: 0,
    prixAchat: 0,
    margeFrais: 0
  },
  {
    id: 's-18',
    reference: 'Dive-Dive-D1R1',
    designation: 'Sacs Emballage & Consommables Divers',
    category: 'Divers',
    unit: 'Paquet',
    stockCritique: 0,
    stockInitial: 0,
    entrees: 0,
    sorties: 0,
    vente: 0,
    prixAchat: 0,
    margeFrais: 0
  }
];

export const INITIAL_SALES_LIST: SaleRecord[] = [
  {
    id: 'sale-1',
    date: '2025-07-09',
    mois: 'Juillet',
    reference: 'APM -Prod-E1R1',
    designation: 'APM 303 Automate Occasion 15582H',
    category: 'Produits - Electronique',
    unit: 'Pce',
    quantiteDispo: 1,
    quantiteVendue: 1,
    prixVenteUnitaire: 50000,
    remiseUnitaire: 0,
    prixVenteTotal: 50000,
    benefice: 15000
  },
  {
    id: 'sale-5',
    date: '2025-08-18',
    mois: 'Août',
    reference: 'Coff-Prod-E1R1',
    designation: 'Coffret Pose Compteur E2C',
    category: 'Produits - Electrique',
    unit: 'Pce',
    quantiteDispo: 8,
    quantiteVendue: 1,
    prixVenteUnitaire: 18000,
    remiseUnitaire: 0,
    prixVenteTotal: 18000,
    benefice: 4500
  },
  {
    id: 'sale-7',
    date: '2025-09-08',
    mois: 'Septembre',
    reference: '12v--Prod-E1R1',
    designation: '12v-3,5 A Unicharge 50 Chargeur electrique Occas',
    category: 'Produits - Electrique',
    unit: 'Pce',
    quantiteDispo: 1,
    quantiteVendue: 1,
    prixVenteUnitaire: 35000,
    remiseUnitaire: 0,
    prixVenteTotal: 35000,
    benefice: 10000
  }
];

// Helper calculations based on Excel Formulas
export function getStockFinal(item: StockItem): number {
  return (item.stockInitial || 0) + (item.entrees || 0) - (item.sorties || 0) - (item.vente || 0);
}

export function getCoutRevient(item: StockItem): number {
  return (item.prixAchat || 0) + (item.margeFrais || 0);
}

export function getValeurStock(item: StockItem): number {
  return Math.max(0, getStockFinal(item)) * getCoutRevient(item);
}

export function isAlerteStock(item: StockItem): boolean {
  if (!item.stockCritique || item.stockCritique <= 0) {
    return false;
  }
  return getStockFinal(item) <= item.stockCritique;
}

export function formatFCFA(val: number): string {
  return new Intl.NumberFormat('fr-FR').format(Math.round(val)) + ' FCFA';
}

export const MOIS_LIST = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];
