export interface ProductItem {
  id: string;
  reference: string;
  designation: string;
  category: string;
  sellingPrice: number;
  rankingOrder: string;
  unit: string;
}

export interface StockItem {
  id: string;
  reference: string;
  designation: string;
  category: string;
  unit: string;
  stockCritique: number;
  stockInitial: number;
  entrees: number;
  sorties: number;
  vente: number;
  prixAchat: number;
  margeFrais: number;
}

export interface StockMovement {
  id: string;
  date: string;
  reference: string;
  designation: string;
  type: 'ENTREE' | 'SORTIE';
  quantity: number;
  motif: string;
}

export interface SaleRecord {
  id: string;
  date: string;
  mois: string;
  reference: string;
  designation: string;
  category: string;
  unit: string;
  quantiteDispo: number;
  quantiteVendue: number;
  prixVenteUnitaire: number;
  remiseUnitaire: number;
  prixVenteTotal: number;
  benefice: number;
}

export type SectorType = 'ALIMENTATION_PATISSERIE' | 'TECHNIQUE_INDUSTRIEL';

export interface CategoryConfig {
  id: string;
  name: string;
  sector: SectorType;
  description?: string;
}

export interface UnitConfig {
  id: string;
  name: string;
}

export type ActiveTab = 'ACCUEIL' | 'STOCK' | 'VENTE' | 'PRODUITS' | 'BI_DASHBOARDS' | 'CONFIGURATION';

// Backward compatibility types for legacy modules
export type PaymentMethod = 'ESPECES' | 'CARTE' | 'MOBILE_MONEY' | 'CREDIT_CLIENT';
export type MobileMoneyProvider = 'WAVE' | 'ORANGE_MONEY' | 'MTN_MOMO' | 'AIRTEL_MONEY';
export type UnitType = 'piece' | 'kg' | 'litre' | 'pack' | 'carton';
export type ShelfDepartment = 'Épicerie' | 'Frais & Crèmerie' | 'Boissons' | 'Fruits & Légumes' | 'Boucherie & Poisson' | 'Hygiène & Entretien';

export interface Product {
  code: string;
  barcode: string;
  name: string;
  department: ShelfDepartment;
  category: string;
  brand: string;
  shelfLocation: string;
  unit: UnitType;
  baseUnit: 'piece' | 'kg' | 'litre';
  conversionFactor: number;
  costPrice: number;
  sellingPrice: number;
  stockQty: number;
  minStockAlert: number;
  safetyStock: number;
  reorderPoint: number;
  eoq: number;
  dlc?: string;
  isWeighed: boolean;
  leadTimeDays: number;
  dailyDemandAvg: number;
  imageEmoji: string;
}

export interface CartItem {
  id: string;
  productCode: string;
  name: string;
  barcode: string;
  unit: UnitType;
  quantity: number;
  weightKg?: number;
  originalUnitPrice: number;
  discountPercent: number;
  effectiveUnitPrice: number;
  subTotal: number;
  isDlcPromo: boolean;
  dlcDaysRemaining?: number;
}

export interface SaleTransaction {
  id: string;
  receiptNumber: string;
  timestamp: string;
  cashierName: string;
  cashierRole: string;
  items: CartItem[];
  subTotal: number;
  discountTotal: number;
  taxTotal: number;
  grandTotal: number;
  amountPaid: number;
  changeGiven: number;
  paymentMethod: PaymentMethod;
  mobileProvider?: MobileMoneyProvider;
  mobileReference?: string;
  customerId?: string;
  customerName?: string;
  syncStatus: 'SYNCHRONISE' | 'EN_ATTENTE_SYNC';
  refunded?: boolean;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  loyaltyPoints: number;
  loyaltyCashback: number;
  tier: 'Standard' | 'Silver' | 'Gold' | 'VIP';
  creditLimit: number;
  currentCredit: number;
  lastPaymentDate?: string;
  active: boolean;
}

export interface Supplier {
  id: string;
  name: string;
  contactName: string;
  phone: string;
  email: string;
  address: string;
  reliabilityScore: number;
  suppliedProducts: {
    productCode: string;
    productName: string;
    lastPurchasePrice: number;
    leadTimeDays: number;
  }[];
}

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplierId: string;
  supplierName: string;
  createdAt: string;
  expectedDelivery: string;
  status: 'BROUILLON' | 'TRANSMIS' | 'RECU' | 'ANNULE';
  totalAmount: number;
  items: {
    productCode: string;
    name: string;
    quantity: number;
    unitCost: number;
    subTotal: number;
  }[];
}

export interface AuditLog {
  id: string;
  timestamp: string;
  operator: string;
  role: string;
  action: string;
  category: 'FINANCE' | 'STOCK' | 'SECURITY' | 'AUTH' | 'DLC';
  details: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  immutableHash: string;
}

export interface FraudAlert {
  id: string;
  timestamp: string;
  cashierName: string;
  type: 'DRAWER_NO_SALE' | 'ABNORMAL_CANCELLATION' | 'PRICE_OVERRIDE' | 'INVENTORY_GAP';
  title: string;
  description: string;
  severity: 'HIGH' | 'MEDIUM';
  status: 'PENDING' | 'RESOLVED';
  posTerminal: string;
}

export interface AssociationRule {
  antecedent: string[];
  consequent: string[];
  support: number;
  confidence: number;
  lift: number;
  businessAction: string;
}

export interface DemandPrediction {
  productCode: string;
  productName: string;
  currentStock: number;
  avgDailySales: number;
  forecast7Days: number;
  trend: 'HAUSSE' | 'STABLE' | 'BAISSE';
  weatherImpact: string;
  seasonalityFactor: number;
  recommendedOrder: number;
}
