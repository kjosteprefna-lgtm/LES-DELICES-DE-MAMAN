import { Product, Customer, Supplier, AuditLog, FraudAlert, AssociationRule, DemandPrediction, CartItem } from '../types';

export const TODAY_ISO = '2026-09-15';

export const INITIAL_PRODUCTS: Product[] = [
  {
    code: 'PRD-001',
    barcode: '3017620422003',
    name: 'Lait UHT Demi-Écrémé 1L',
    department: 'Frais & Crèmerie',
    category: 'Produits Laitiers',
    brand: 'Candia',
    shelfLocation: 'Rayon Frais F-02',
    unit: 'litre',
    baseUnit: 'litre',
    conversionFactor: 1,
    costPrice: 950,
    sellingPrice: 1200,
    stockQty: 48,
    minStockAlert: 10,
    safetyStock: 8,
    reorderPoint: 20,
    eoq: 60,
    dlc: '2026-10-15',
    isWeighed: false,
    leadTimeDays: 3,
    dailyDemandAvg: 4,
    imageEmoji: '🥛',
  },
  {
    code: 'PRD-002',
    barcode: '3256540012019',
    name: 'Sac de Riz Parfumé 5Kg',
    department: 'Épicerie',
    category: 'Féculents & Céréales',
    brand: 'Royal Dragon',
    shelfLocation: 'Allée Centrale E-01',
    unit: 'piece',
    baseUnit: 'piece',
    conversionFactor: 1,
    costPrice: 3800,
    sellingPrice: 4500,
    stockQty: 15,
    minStockAlert: 5,
    safetyStock: 6,
    reorderPoint: 14,
    eoq: 30,
    dlc: undefined,
    isWeighed: false,
    leadTimeDays: 5,
    dailyDemandAvg: 1.5,
    imageEmoji: '🍚',
  },
  {
    code: 'PRD-003',
    barcode: '3124480182772',
    name: 'Huile de Tournesol Pure 1L',
    department: 'Épicerie',
    category: 'Huiles & Condiments',
    brand: 'Lesieur',
    shelfLocation: 'Rayon Épicerie E-08',
    unit: 'litre',
    baseUnit: 'litre',
    conversionFactor: 1,
    costPrice: 1450,
    sellingPrice: 1800,
    stockQty: 30,
    minStockAlert: 8,
    safetyStock: 10,
    reorderPoint: 22,
    eoq: 45,
    dlc: '2027-05-20',
    isWeighed: false,
    leadTimeDays: 4,
    dailyDemandAvg: 3,
    imageEmoji: '🌻',
  },
  {
    code: 'PRD-004',
    barcode: '3033490004521',
    name: 'Yaourt Nature Bio (Pack de 4)',
    department: 'Frais & Crèmerie',
    category: 'Ultra-Frais',
    brand: 'Danone',
    shelfLocation: 'Rayon Frais F-04',
    unit: 'pack',
    baseUnit: 'piece',
    conversionFactor: 4,
    costPrice: 1100,
    sellingPrice: 1500,
    stockQty: 4,
    minStockAlert: 5,
    safetyStock: 6,
    reorderPoint: 12,
    eoq: 24,
    dlc: '2026-09-18', // 3 jours restants ! => Promo -50%
    isWeighed: false,
    leadTimeDays: 2,
    dailyDemandAvg: 3,
    imageEmoji: '🥣',
  },
  {
    code: 'PRD-005',
    barcode: '2000000000508', // Code balance interne
    name: 'Tomates Rondes Fraîches',
    department: 'Fruits & Légumes',
    category: 'Légumes primeurs',
    brand: 'Maraîcher Local',
    shelfLocation: 'Îlot Primeur B-01',
    unit: 'kg',
    baseUnit: 'kg',
    conversionFactor: 1,
    costPrice: 550,
    sellingPrice: 850,
    stockQty: 24.5,
    minStockAlert: 10,
    safetyStock: 8,
    reorderPoint: 18,
    eoq: 40,
    dlc: '2026-09-20', // 5 jours restants => Promo -20%
    isWeighed: true,
    leadTimeDays: 1,
    dailyDemandAvg: 8,
    imageEmoji: '🍅',
  },
  {
    code: 'PRD-006',
    barcode: '3152010006240',
    name: 'Bière Blonde Premium 33cl',
    department: 'Boissons',
    category: 'Bières & Cidres',
    brand: 'Heineken',
    shelfLocation: 'Rayon Boissons B-06',
    unit: 'carton', // Carton de 24 pièces
    baseUnit: 'piece',
    conversionFactor: 24, // 1 carton = 24 bouteilles
    costPrice: 11500,
    sellingPrice: 14400, // 600 FCFA à la pièce
    stockQty: 96, // 4 cartons en stock (exprimé en unités)
    minStockAlert: 24,
    safetyStock: 24,
    reorderPoint: 48,
    eoq: 72,
    dlc: '2027-01-10',
    isWeighed: false,
    leadTimeDays: 3,
    dailyDemandAvg: 8,
    imageEmoji: '🍺',
  },
  {
    code: 'PRD-007',
    barcode: '8076800195057',
    name: 'Spaghetti N°5 500g',
    department: 'Épicerie',
    category: 'Pâtes alimentaires',
    brand: 'Barilla',
    shelfLocation: 'Rayon Épicerie E-03',
    unit: 'piece',
    baseUnit: 'piece',
    conversionFactor: 1,
    costPrice: 480,
    sellingPrice: 650,
    stockQty: 85,
    minStockAlert: 15,
    safetyStock: 12,
    reorderPoint: 28,
    eoq: 60,
    dlc: '2027-08-30',
    isWeighed: false,
    leadTimeDays: 3,
    dailyDemandAvg: 5,
    imageEmoji: '🍝',
  },
  {
    code: 'PRD-008',
    barcode: '8001440123984',
    name: 'Sauce Tomate Basilic 400g',
    department: 'Épicerie',
    category: 'Sauces & Épices',
    brand: 'Panzani',
    shelfLocation: 'Rayon Épicerie E-03',
    unit: 'piece',
    baseUnit: 'piece',
    conversionFactor: 1,
    costPrice: 720,
    sellingPrice: 950,
    stockQty: 42,
    minStockAlert: 10,
    safetyStock: 8,
    reorderPoint: 18,
    eoq: 36,
    dlc: '2027-03-15',
    isWeighed: false,
    leadTimeDays: 2,
    dailyDemandAvg: 4,
    imageEmoji: '🥫',
  },
  {
    code: 'PRD-009',
    barcode: '3184670001092',
    name: 'Fromage Emmental Râpé 200g',
    department: 'Frais & Crèmerie',
    category: 'Fromages',
    brand: 'Président',
    shelfLocation: 'Rayon Frais F-03',
    unit: 'piece',
    baseUnit: 'piece',
    conversionFactor: 1,
    costPrice: 1250,
    sellingPrice: 1600,
    stockQty: 7,
    minStockAlert: 5,
    safetyStock: 4,
    reorderPoint: 10,
    eoq: 20,
    dlc: '2026-09-17', // 2 jours restants ! => Promo -50%
    isWeighed: false,
    leadTimeDays: 2,
    dailyDemandAvg: 3,
    imageEmoji: '🧀',
  },
  {
    code: 'PRD-010',
    barcode: '2000000001000',
    name: 'Filet de Poulet Fermier (Kg)',
    department: 'Boucherie & Poisson',
    category: 'Volaille fraîche',
    brand: 'Boucherie Centrale',
    shelfLocation: 'Vitrine Boucherie V-01',
    unit: 'kg',
    baseUnit: 'kg',
    conversionFactor: 1,
    costPrice: 2600,
    sellingPrice: 3200,
    stockQty: 11.2,
    minStockAlert: 5,
    safetyStock: 4,
    reorderPoint: 10,
    eoq: 25,
    dlc: '2026-09-19', // 4 jours restants => Promo -20%
    isWeighed: true,
    leadTimeDays: 1,
    dailyDemandAvg: 5,
    imageEmoji: '🍗',
  },
  {
    code: 'PRD-011',
    barcode: '3059943004051',
    name: 'Savon Antibactérien 100g (Pack 3)',
    department: 'Hygiène & Entretien',
    category: 'Toilette corporelle',
    brand: 'Dettol',
    shelfLocation: 'Rayon Hygiène H-04',
    unit: 'pack',
    baseUnit: 'piece',
    conversionFactor: 3,
    costPrice: 750,
    sellingPrice: 1050,
    stockQty: 60,
    minStockAlert: 15,
    safetyStock: 10,
    reorderPoint: 25,
    eoq: 50,
    dlc: undefined,
    isWeighed: false,
    leadTimeDays: 4,
    dailyDemandAvg: 3.5,
    imageEmoji: '🧼',
  },
  {
    code: 'PRD-012',
    barcode: '2000000001208',
    name: 'Pommes Golden Délicieuse (Kg)',
    department: 'Fruits & Légumes',
    category: 'Fruits frais',
    brand: 'Vergers du Sud',
    shelfLocation: 'Îlot Primeur B-02',
    unit: 'kg',
    baseUnit: 'kg',
    conversionFactor: 1,
    costPrice: 900,
    sellingPrice: 1350,
    stockQty: 18.0,
    minStockAlert: 8,
    safetyStock: 6,
    reorderPoint: 16,
    eoq: 30,
    dlc: '2026-09-22', // 7 jours restants => Promo -20%
    isWeighed: true,
    leadTimeDays: 2,
    dailyDemandAvg: 4.5,
    imageEmoji: '🍎',
  },
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'CUST-001',
    name: 'Koffi Mensah',
    phone: '+225 07 08 12 34 56',
    email: 'koffi.mensah@gmail.com',
    loyaltyPoints: 420,
    loyaltyCashback: 2100,
    tier: 'Gold',
    creditLimit: 150000,
    currentCredit: 28500,
    lastPaymentDate: '2026-09-02',
    active: true,
  },
  {
    id: 'CUST-002',
    name: 'Awa Diop',
    phone: '+221 77 123 45 67',
    email: 'awa.diop@orange.sn',
    loyaltyPoints: 890,
    loyaltyCashback: 4450,
    tier: 'VIP',
    creditLimit: 300000,
    currentCredit: 0,
    lastPaymentDate: '2026-09-10',
    active: true,
  },
  {
    id: 'CUST-003',
    name: 'Jean-Baptiste Traoré',
    phone: '+226 70 99 88 77',
    email: 'jb.traore@fasonet.bf',
    loyaltyPoints: 110,
    loyaltyCashback: 550,
    tier: 'Silver',
    creditLimit: 75000,
    currentCredit: 62000, // Proche du plafond !
    lastPaymentDate: '2026-08-14',
    active: true,
  },
  {
    id: 'CUST-004',
    name: 'Fatou Bamba',
    phone: '+225 05 44 33 22 11',
    email: 'fatou.bamba@ci-market.com',
    loyaltyPoints: 45,
    loyaltyCashback: 225,
    tier: 'Standard',
    creditLimit: 30000,
    currentCredit: 0,
    lastPaymentDate: '2026-09-12',
    active: true,
  }
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'SUP-001',
    name: 'Centrale d’Achat Agro-Distribution Ouest',
    contactName: 'Mamadou Touré',
    phone: '+225 27 21 00 11 22',
    email: 'commandes@agro-ouest.com',
    address: 'Zone Industrielle de Vridi, Abidjan',
    reliabilityScore: 98,
    suppliedProducts: [
      { productCode: 'PRD-001', productName: 'Lait UHT Demi-Écrémé 1L', lastPurchasePrice: 950, leadTimeDays: 3 },
      { productCode: 'PRD-002', productName: 'Sac de Riz Parfumé 5Kg', lastPurchasePrice: 3800, leadTimeDays: 5 },
      { productCode: 'PRD-003', productName: 'Huile de Tournesol Pure 1L', lastPurchasePrice: 1450, leadTimeDays: 4 },
      { productCode: 'PRD-007', productName: 'Spaghetti N°5 500g', lastPurchasePrice: 480, leadTimeDays: 3 },
      { productCode: 'PRD-008', productName: 'Sauce Tomate Basilic 400g', lastPurchasePrice: 720, leadTimeDays: 2 }
    ]
  },
  {
    id: 'SUP-002',
    name: 'Coopérative Laitière & Frais Sahel',
    contactName: 'Aminata Ndiaye',
    phone: '+221 33 820 45 90',
    email: 'commercial@frais-sahel.sn',
    address: 'Km 14 Route de Rufisque, Dakar',
    reliabilityScore: 94,
    suppliedProducts: [
      { productCode: 'PRD-004', productName: 'Yaourt Nature Bio (Pack de 4)', lastPurchasePrice: 1100, leadTimeDays: 2 },
      { productCode: 'PRD-009', productName: 'Fromage Emmental Râpé 200g', lastPurchasePrice: 1250, leadTimeDays: 2 }
    ]
  },
  {
    id: 'SUP-003',
    name: 'Union Maraîchère & Primeurs Régionaux',
    contactName: 'Blaise Konan',
    phone: '+225 01 02 03 04 05',
    email: 'contact@primeurs-region.org',
    address: 'Marché de Gros d’Anyama',
    reliabilityScore: 91,
    suppliedProducts: [
      { productCode: 'PRD-005', productName: 'Tomates Rondes Fraîches', lastPurchasePrice: 550, leadTimeDays: 1 },
      { productCode: 'PRD-010', productName: 'Filet de Poulet Fermier (Kg)', lastPurchasePrice: 2600, leadTimeDays: 1 },
      { productCode: 'PRD-012', productName: 'Pommes Golden Délicieuse (Kg)', lastPurchasePrice: 900, leadTimeDays: 2 }
    ]
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'AUD-901',
    timestamp: '2026-09-15 08:30:14',
    operator: 'Aïcha Diallo',
    role: 'Caissière',
    category: 'AUTH',
    action: 'Ouverture de session Caisse N°1',
    details: 'Fond de caisse déclaré : 50 000 FCFA',
    severity: 'INFO',
    immutableHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
  },
  {
    id: 'AUD-902',
    timestamp: '2026-09-15 09:15:22',
    operator: 'Marc Kouassi',
    role: 'Chef de Rayon',
    category: 'DLC',
    action: 'Dynamic Pricing Expiration',
    details: 'Application automatique remise -50% sur Yaourt Nature Bio (DLC dans 3 jours)',
    severity: 'INFO',
    immutableHash: '7d1a2f4c9b88e10419d85483bb7243c98342718ef0e99b247f480393b4f62118'
  },
  {
    id: 'AUD-903',
    timestamp: '2026-09-15 10:04:45',
    operator: 'Aïcha Diallo',
    role: 'Caissière',
    category: 'SECURITY',
    action: 'Tiroir-Caisse Ouvert Sans Vente',
    details: 'Détection impulsion NO_SALE sur Port RJ12 sans ticket actif',
    severity: 'WARNING',
    immutableHash: 'c4ca4238a0b923820dcc509a6f75849b283084e0391024355523412093849123'
  },
  {
    id: 'AUD-904',
    timestamp: '2026-09-15 11:20:00',
    operator: 'Yannick Boka',
    role: 'Gestionnaire de Stock',
    category: 'STOCK',
    action: 'Ajustement Inventaire Casse',
    details: 'Déclaration casse 2 bouteilles Huile de Tournesol (chute manutention)',
    severity: 'WARNING',
    immutableHash: '8b1a9953c4611296a827abf8c47804d7e6c49c6b90757a3e811c01b4c6e93e21'
  }
];

export const INITIAL_FRAUD_ALERTS: FraudAlert[] = [
  {
    id: 'FRD-101',
    timestamp: '2026-09-15 10:04:45',
    cashierName: 'Aïcha Diallo',
    type: 'DRAWER_NO_SALE',
    title: 'Ouverture tiroir sans transaction enregistrée',
    description: 'Le tiroir-caisse de la Caisse N°1 a été ouvert manuellement hors processus d’encaissement.',
    severity: 'MEDIUM',
    status: 'PENDING',
    posTerminal: 'POS-TERMINAL-01'
  },
  {
    id: 'FRD-102',
    timestamp: '2026-09-14 18:42:10',
    cashierName: 'Bakary Sanogo',
    type: 'ABNORMAL_CANCELLATION',
    title: 'Taux inhabituel d’annulations d’articles',
    description: '4 annulations successives d’articles après scanning totalisant 24 500 FCFA.',
    severity: 'HIGH',
    status: 'RESOLVED',
    posTerminal: 'POS-TERMINAL-02'
  }
];

export const MARKET_BASKET_RULES: AssociationRule[] = [
  {
    antecedent: ['Spaghetti N°5 500g'],
    consequent: ['Sauce Tomate Basilic 400g'],
    support: 0.18, // 18% des paniers contiennent les deux
    confidence: 0.74, // 74% de ceux qui prennent des pâtes prennent la sauce
    lift: 3.42, // Association 3.4 fois plus forte que le hasard
    businessAction: 'Placer la sauce tomate en tête de gondole du rayon pâtes et créer un bundle pack Duo Repas Express.'
  },
  {
    antecedent: ['Bière Blonde Premium'],
    consequent: ['Savon Antibactérien'],
    support: 0.04,
    confidence: 0.22,
    lift: 1.05,
    businessAction: 'Aucune synergie forte détectée.'
  },
  {
    antecedent: ['Tomates Rondes Fraîches'],
    consequent: ['Filet de Poulet Fermier'],
    support: 0.14,
    confidence: 0.62,
    lift: 2.85,
    businessAction: 'Proposer une recette "Poulet mijoté aux tomates fraîches" avec coupon fidélité combiné.'
  },
  {
    antecedent: ['Sac de Riz Parfumé 5Kg'],
    consequent: ['Huile de Tournesol Pure 1L'],
    support: 0.26,
    confidence: 0.81,
    lift: 3.10,
    businessAction: 'Créer un pack "Essentiels Cuisine Famille" avec remise groupée de 5%.'
  }
];

export const DEMAND_PREDICTIONS: DemandPrediction[] = [
  {
    productCode: 'PRD-001',
    productName: 'Lait UHT Demi-Écrémé 1L',
    currentStock: 48,
    avgDailySales: 4.2,
    forecast7Days: 32,
    trend: 'STABLE',
    weatherImpact: 'Neutre (consommation constante en petit-déjeuner)',
    seasonalityFactor: 1.05,
    recommendedOrder: 40
  },
  {
    productCode: 'PRD-006',
    productName: 'Bière Blonde Premium (Carton)',
    currentStock: 96,
    avgDailySales: 8.5,
    forecast7Days: 85,
    trend: 'HAUSSE',
    weatherImpact: 'Canicule annoncée (+34°C le weekend) -> pic de consommation prévu +35%',
    seasonalityFactor: 1.35,
    recommendedOrder: 120
  },
  {
    productCode: 'PRD-005',
    productName: 'Tomates Rondes Fraîches',
    currentStock: 24.5,
    avgDailySales: 8.0,
    forecast7Days: 58,
    trend: 'HAUSSE',
    weatherImpact: 'Forte demande primeur hebdomadaire',
    seasonalityFactor: 1.15,
    recommendedOrder: 50
  },
  {
    productCode: 'PRD-004',
    productName: 'Yaourt Nature Bio (Pack)',
    currentStock: 4,
    avgDailySales: 3.1,
    forecast7Days: 22,
    trend: 'BAISSE',
    weatherImpact: 'Produit en rupture imminente, rotation rapide',
    seasonalityFactor: 0.95,
    recommendedOrder: 24
  }
];

/**
 * Calculateur intelligent de DLC et tarification dynamique
 */
export function getDlcDynamicPricing(product: Product, referenceDateStr = TODAY_ISO): {
  daysRemaining: number | null;
  discountPercent: number;
  effectivePrice: number;
  badgeLabel: string;
  badgeColor: string;
  status: 'EXPIRED' | 'CRITICAL_50' | 'WARN_20' | 'FRESH' | 'NO_EXPIRY';
} {
  if (!product.dlc) {
    return {
      daysRemaining: null,
      discountPercent: 0,
      effectivePrice: product.sellingPrice,
      badgeLabel: 'Sans DLC',
      badgeColor: 'text-stone-500 bg-stone-100 border-stone-200',
      status: 'NO_EXPIRY'
    };
  }

  const refDate = new Date(referenceDateStr);
  const expDate = new Date(product.dlc);
  const diffTime = expDate.getTime() - refDate.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (daysRemaining <= 0) {
    return {
      daysRemaining,
      discountPercent: 100,
      effectivePrice: 0,
      badgeLabel: 'PÉRIMÉ (Retirer)',
      badgeColor: 'text-red-700 bg-red-100 border-red-300 font-bold',
      status: 'EXPIRED'
    };
  } else if (daysRemaining <= 3) {
    const discountedPrice = Math.round(product.sellingPrice * 0.5);
    return {
      daysRemaining,
      discountPercent: 50,
      effectivePrice: discountedPrice,
      badgeLabel: `DLC ${daysRemaining}j (-50%)`,
      badgeColor: 'text-amber-900 bg-amber-200 border-amber-400 font-bold animate-pulse',
      status: 'CRITICAL_50'
    };
  } else if (daysRemaining <= 7) {
    const discountedPrice = Math.round(product.sellingPrice * 0.8);
    return {
      daysRemaining,
      discountPercent: 20,
      effectivePrice: discountedPrice,
      badgeLabel: `DLC ${daysRemaining}j (-20%)`,
      badgeColor: 'text-orange-800 bg-orange-100 border-orange-300 font-semibold',
      status: 'WARN_20'
    };
  } else {
    return {
      daysRemaining,
      discountPercent: 0,
      effectivePrice: product.sellingPrice,
      badgeLabel: `DLC OK (${daysRemaining}j)`,
      badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      status: 'FRESH'
    };
  }
}

/**
 * Calcul checksum modulo 10 pour codes-barres EAN-13
 */
export function calculateEan13Checksum(code12: string): number {
  if (code12.length !== 12) return 0;
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(code12[i], 10);
    sum += i % 2 === 0 ? digit : digit * 3;
  }
  const remainder = sum % 10;
  return remainder === 0 ? 0 : 10 - remainder;
}

/**
 * Formatage monétaire FCFA
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    maximumFractionDigits: 0
  }).format(amount) + ' FCFA';
}
