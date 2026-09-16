export interface ErdTable {
  name: string;
  category: 'VENTES' | 'CATALOGUE' | 'STOCK' | 'TIERS' | 'AUDIT';
  description: string;
  columns: {
    name: string;
    type: string;
    key?: 'PK' | 'FK' | 'UK';
    description: string;
    references?: string;
  }[];
}

export const ERD_TABLES: ErdTable[] = [
  {
    name: 'produits',
    category: 'CATALOGUE',
    description: 'Catalogue principal des articles avec référencement, CMP et seuils',
    columns: [
      { name: 'code_produit', type: 'VARCHAR(32)', key: 'PK', description: 'Identifiant unique métier (ex: PRD-001)' },
      { name: 'code_barres', type: 'VARCHAR(64)', key: 'UK', description: 'EAN-13, Code 128 ou QR Code constructeur/interne' },
      { name: 'designation', type: 'VARCHAR(255)', description: 'Nom commercial complet de l’article' },
      { name: 'id_categorie', type: 'INT', key: 'FK', description: 'Référence catégorie', references: 'categories.id' },
      { name: 'id_marque', type: 'INT', key: 'FK', description: 'Marque', references: 'marques.id' },
      { name: 'unite_vente', type: 'VARCHAR(20)', description: 'carton, pack, litre, kg, piece' },
      { name: 'unite_base', type: 'VARCHAR(20)', description: 'Unité stock standard (kg, litre, piece)' },
      { name: 'facteur_conversion', type: 'DECIMAL(10,3)', description: 'Multiplicateur (ex: 1 carton = 24 pieces)' },
      { name: 'prix_vente_ht', type: 'DECIMAL(12,2)', description: 'Prix unitaire HT standard' },
      { name: 'taux_tva', type: 'DECIMAL(5,2)', description: 'Taux TVA applicable (0%, 9%, 18%)' },
      { name: 'prix_vente_ttc', type: 'DECIMAL(12,2)', description: 'Prix public affiché en caisse' },
      { name: 'cout_moyen_pondere', type: 'DECIMAL(12,2)', description: 'CMP d’achat valorisé' },
      { name: 'seuil_alerte_min', type: 'DECIMAL(10,2)', description: 'Stock minimum déclencheur' },
      { name: 'stock_securite', type: 'DECIMAL(10,2)', description: 'Buffer sécurité face aux aléas' },
      { name: 'point_commande_rop', type: 'DECIMAL(10,2)', description: 'Niveau de réapprovisionnement ROP' },
      { name: 'quantite_eco_eoq', type: 'DECIMAL(10,2)', description: 'Lot économique Wilson' },
      { name: 'est_au_poids', type: 'BOOLEAN', description: 'Nécessite pesée sur balance connectée' },
      { name: 'actif', type: 'BOOLEAN', description: 'Statut actif en vente' }
    ]
  },
  {
    name: 'lots_stock_dlc',
    category: 'STOCK',
    description: 'Traçabilité par lot, entrepôt et date limite de consommation (DLC)',
    columns: [
      { name: 'id_lot', type: 'BIGSERIAL', key: 'PK', description: 'Identifiant interne de lot' },
      { name: 'code_produit', type: 'VARCHAR(32)', key: 'FK', description: 'Produit associé', references: 'produits.code_produit' },
      { name: 'id_depot', type: 'INT', key: 'FK', description: 'Emplacement / rayon de stockage', references: 'depots.id' },
      { name: 'numero_lot', type: 'VARCHAR(64)', description: 'Numéro de lot fournisseur' },
      { name: 'quantite_restante', type: 'DECIMAL(10,3)', description: 'Quantité courante disponible dans ce lot' },
      { name: 'date_reception', type: 'DATE', description: 'Date d’entrée en stock' },
      { name: 'date_expiration_dlc', type: 'DATE', description: 'DLC pour le dynamic pricing' },
      { name: 'prix_achat_lot', type: 'DECIMAL(12,2)', description: 'Coût d’achat spécifique du lot' }
    ]
  },
  {
    name: 'ventes',
    category: 'VENTES',
    description: 'En-tête de ticket de caisse / transaction financière',
    columns: [
      { name: 'id_vente', type: 'BIGSERIAL', key: 'PK', description: 'ID séquentiel transaction' },
      { name: 'numero_ticket', type: 'VARCHAR(64)', key: 'UK', description: 'Numéro lisible (ex: TCK-2026-09-0012)' },
      { name: 'id_caisse', type: 'INT', description: 'Identifiant terminal physique' },
      { name: 'id_caissier', type: 'INT', key: 'FK', description: 'Utilisateur opérateur', references: 'utilisateurs.id' },
      { name: 'id_client', type: 'VARCHAR(32)', key: 'FK', description: 'Client identifié ou NULL pour anonyme', references: 'clients.id' },
      { name: 'date_vente', type: 'TIMESTAMP WITH TIME ZONE', description: 'Horodatage précis à la seconde' },
      { name: 'total_ht', type: 'DECIMAL(14,2)', description: 'Montant total HT' },
      { name: 'total_tva', type: 'DECIMAL(14,2)', description: 'TVA cumulée' },
      { name: 'total_remises', type: 'DECIMAL(14,2)', description: 'Total des rabais (DLC + promotions)' },
      { name: 'total_ttc', type: 'DECIMAL(14,2)', description: 'Net à payer TTC' },
      { name: 'mode_paiement', type: 'VARCHAR(30)', description: 'ESPECES, CARTE, MOBILE_MONEY, CREDIT' },
      { name: 'reference_paiement', type: 'VARCHAR(128)', description: 'Ref Wave/Orange/MTN ou CB' },
      { name: 'statut_sync', type: 'VARCHAR(20)', description: 'SYNCHRONISE ou EN_ATTENTE' },
      { name: 'crdt_vector_clock', type: 'JSONB', description: 'Horloge vectorielle pour résolution offline' }
    ]
  },
  {
    name: 'lignes_vente',
    category: 'VENTES',
    description: 'Détail des articles vendus par ticket',
    columns: [
      { name: 'id_ligne', type: 'BIGSERIAL', key: 'PK', description: 'Identifiant de la ligne' },
      { name: 'id_vente', type: 'BIGINT', key: 'FK', description: 'Lien ticket de caisse', references: 'ventes.id_vente' },
      { name: 'code_produit', type: 'VARCHAR(32)', key: 'FK', description: 'Article vendu', references: 'produits.code_produit' },
      { name: 'id_lot_concerne', type: 'BIGINT', key: 'FK', description: 'Lot FIFO décrémenté', references: 'lots_stock_dlc.id_lot' },
      { name: 'quantite_vendue', type: 'DECIMAL(10,3)', description: 'Quantité dans l’unité scannée' },
      { name: 'unite_saisie', type: 'VARCHAR(20)', description: 'Unité (carton, kg, piece)' },
      { name: 'quantite_base_deduite', type: 'DECIMAL(10,3)', description: 'Impact réel sur le stock de base' },
      { name: 'prix_unitaire_origine', type: 'DECIMAL(12,2)', description: 'Prix normal sans remise' },
      { name: 'taux_remise_dlc', type: 'DECIMAL(5,2)', description: 'Pourcentage appliqué (20%, 50%)' },
      { name: 'prix_unitaire_effectif', type: 'DECIMAL(12,2)', description: 'Prix net unitaire facturé' },
      { name: 'sous_total_ligne', type: 'DECIMAL(14,2)', description: 'Total TTC de la ligne' }
    ]
  },
  {
    name: 'mouvements_stock',
    category: 'STOCK',
    description: 'Journal inaltérable de tous les flux matières (Entrées, Ventes, Casse, Périmés, Vol)',
    columns: [
      { name: 'id_mvt', type: 'BIGSERIAL', key: 'PK', description: 'ID flux' },
      { name: 'date_mvt', type: 'TIMESTAMP', description: 'Horodatage' },
      { name: 'code_produit', type: 'VARCHAR(32)', key: 'FK', description: 'Produit', references: 'produits.code_produit' },
      { name: 'type_mouvement', type: 'VARCHAR(30)', description: 'VENTE, RECEPTION_ACHAT, CASSE, PERIME, VOL, INVENTAIRE' },
      { name: 'quantite', type: 'DECIMAL(10,3)', description: 'Quantité avec signe (+ ou -)' },
      { name: 'cout_unitaire', type: 'DECIMAL(12,2)', description: 'Valorisation unitaire' },
      { name: 'stock_avant', type: 'DECIMAL(10,3)', description: 'Niveau stock avant mouvement' },
      { name: 'stock_apres', type: 'DECIMAL(10,3)', description: 'Niveau stock après mouvement' },
      { name: 'reference_piece', type: 'VARCHAR(64)', description: 'Numéro ticket, BL d’achat ou PV casse' },
      { name: 'id_operateur', type: 'INT', key: 'FK', description: 'Utilisateur', references: 'utilisateurs.id' }
    ]
  },
  {
    name: 'clients',
    category: 'TIERS',
    description: 'Fichier clients, cagnottes fidélité et comptes à crédit',
    columns: [
      { name: 'id_client', type: 'VARCHAR(32)', key: 'PK', description: 'Identifiant (ex: CUST-001)' },
      { name: 'nom_complet', type: 'VARCHAR(150)', description: 'Nom et prénom' },
      { name: 'telephone', type: 'VARCHAR(30)', key: 'UK', description: 'Numéro SMS / WhatsApp' },
      { name: 'points_fidelite', type: 'INT', description: 'Solde de points fidélité' },
      { name: 'solde_cashback', type: 'DECIMAL(12,2)', description: 'Cagnotte en monnaie locale' },
      { name: 'statut_vip', type: 'VARCHAR(20)', description: 'Standard, Silver, Gold, VIP' },
      { name: 'plafond_credit', type: 'DECIMAL(12,2)', description: 'Limite autorisée en arriéré' },
      { name: 'arriere_actuel', type: 'DECIMAL(12,2)', description: 'Montant de la dette en cours' },
      { name: 'date_dernier_reglement', type: 'DATE', description: 'Pour calcul des échéances et relances' }
    ]
  },
  {
    name: 'fournisseurs',
    category: 'TIERS',
    description: 'Fournisseurs avec conditions d’approvisionnement',
    columns: [
      { name: 'id_fournisseur', type: 'VARCHAR(32)', key: 'PK', description: 'Code fournisseur (ex: SUP-001)' },
      { name: 'raison_sociale', type: 'VARCHAR(150)', description: 'Nom de la société' },
      { name: 'contact_commercial', type: 'VARCHAR(100)', description: 'Nom interlocuteur' },
      { name: 'telephone', type: 'VARCHAR(30)', description: 'Téléphone direct' },
      { name: 'email', type: 'VARCHAR(120)', description: 'Email d’envoi des bons de commande' },
      { name: 'delai_livraison_moyen', type: 'INT', description: 'Lead time en jours' },
      { name: 'note_fiabilite', type: 'DECIMAL(5,2)', description: 'Score ponctualité & conformité (0-100%)' }
    ]
  },
  {
    name: 'audit_logs',
    category: 'AUDIT',
    description: 'Piste d’audit inaltérable avec chaînage cryptographique SHA-256',
    columns: [
      { name: 'id_log', type: 'BIGSERIAL', key: 'PK', description: 'ID séquentiel' },
      { name: 'timestamp', type: 'TIMESTAMP', description: 'Horodatage UTC inaltérable' },
      { name: 'operateur', type: 'VARCHAR(100)', description: 'Identité de l’agent' },
      { name: 'role', type: 'VARCHAR(50)', description: 'Rôle RBAC' },
      { name: 'evenement', type: 'VARCHAR(100)', description: 'Type d’action (NO_SALE, CANCEL, PRICE_OVERRIDE)' },
      { name: 'payload_json', type: 'JSONB', description: 'Données brutes contextuelles' },
      { name: 'hash_precedent', type: 'CHAR(64)', description: 'Lien de chaîne blockchain-like' },
      { name: 'hash_courant', type: 'CHAR(64)', description: 'SHA-256(timestamp + evenement + payload + hash_precedent)' }
    ]
  }
];

export const ALGORITHM_SPECS = [
  {
    id: 'multi-unit',
    title: '1. Gestion du Stock Multi-Unités & Conversion Automatique',
    summary: 'Décrémente fidèlement le stock de base quelle que soit l’unité scannée en caisse (Carton de 24, Pack de 4, Kilogramme ou Pièce individuelle).',
    pythonCode: `def deduire_stock_multi_unites(code_produit: str, unite_scassee: str, quantite_vendue: float):
    """
    Exemple : 
    Le stock est stocké en 'pièces'.
    Si le caissier scanne 2 cartons de 24 pièces, la quantité de base déduite est 2 * 24 = 48 pièces.
    Si le client achète 0.450 kg d'un produit au kilo, la quantité déduite est 0.450 kg.
    """
    produit = db.query("SELECT unite_base, facteur_conversion, stock_qte FROM produits WHERE code = ?", code_produit)
    
    if unite_scassee == produit.unite_base:
        impact_stock = quantite_vendue
    else:
        # Conversion selon le facteur déclaré dans la table produits
        impact_stock = quantite_vendue * produit.facteur_conversion

    if produit.stock_qte < impact_stock:
        raise StockInsuffisantError(f"Stock insuffisant ({produit.stock_qte} dispo vs {impact_stock} requis)")

    nouveau_stock = produit.stock_qte - impact_stock
    db.execute("UPDATE produits SET stock_qte = ? WHERE code = ?", nouveau_stock, code_produit)
    
    # Écriture dans le journal inaltérable des mouvements
    enregistrer_mouvement_stock(
        code=code_produit, 
        type="VENTE", 
        qte=-impact_stock, 
        stock_restant=nouveau_stock
    )
    return nouveau_stock`,
    explanation: 'Évite les écarts d’inventaire entre les réserves (palettes/cartons) et le linéaire (rayons en pièces ou packs détachés).'
  },
  {
    id: 'dynamic-dlc',
    title: '2. Dynamic Pricing Anti-Gaspillage & DLC Intelligente',
    summary: 'Ajuste dynamiquement le prix en caisse et imprime les étiquettes promos dégressives en fonction du nombre de jours restants avant péremption.',
    pythonCode: `from datetime import date, datetime

def calculer_prix_dynamique_dlc(date_dlc_str: str, prix_catalogue: float):
    """
    Règle Métier Anti-Gaspillage Grande Distribution :
    - DLC > 7 jours : Prix normal (0% remise)
    - DLC entre 4 et 7 jours : Promotion de déstockage -20%
    - DLC entre 1 et 3 jours : Liquidation flash anti-gaspi -50%
    - DLC <= 0 jour : Retrait impératif du rayon (Vente strictement bloquée)
    """
    if not date_dlc_str:
        return {"remise_taux": 0.0, "prix_effectif": prix_catalogue, "statut": "SANS_DLC"}

    today = date.today()
    dlc = datetime.strptime(date_dlc_str, "%Y-%m-%d").date()
    jours_restants = (dlc - today).days

    if jours_restants <= 0:
        return {
            "remise_taux": 1.0, 
            "prix_effectif": 0.0, 
            "statut": "PERIME_A_RETIRER",
            "bloquer_caisse": True
        }
    elif jours_restants <= 3:
        taux = 0.50  # -50%
        return {
            "remise_taux": taux, 
            "prix_effectif": round(prix_catalogue * (1 - taux)),
            "jours_restants": jours_restants,
            "statut": "CRITIQUE_MOINS_50",
            "bloquer_caisse": False
        }
    elif jours_restants <= 7:
        taux = 0.20  # -20%
        return {
            "remise_taux": taux, 
            "prix_effectif": round(prix_catalogue * (1 - taux)),
            "jours_restants": jours_restants,
            "statut": "PROCHE_MOINS_20",
            "bloquer_caisse": False
        }
    else:
        return {
            "remise_taux": 0.0, 
            "prix_effectif": prix_catalogue, 
            "jours_restants": jours_restants,
            "statut": "CONFORME",
            "bloquer_caisse": False
        }`,
    explanation: 'Diminue la casse et le gaspillage de 35% à 60% dès le premier mois tout en préservant la marge contributive.'
  },
  {
    id: 'reorder-rop-eoq',
    title: '3. Réapprovisionnement Automatique : ROP (Reorder Point) & EOQ (Wilson)',
    summary: 'Calcule le niveau de stock déclencheur de commande et la quantité optimale à commander pour minimiser les coûts de stockage et de passation.',
    pythonCode: `import math

def calculer_rop_et_eoq(
    demande_quotidienne: float,     # d : ventes moyennes par jour
    delai_fournisseur_jours: int,   # L : lead time en jours
    ecart_type_demande: float,      # sigma_d : volatilité des ventes
    facteur_service_z: float = 1.65,# 95% de taux de service client
    cout_passation_commande: float = 2500, # S : coût fixe par commande (FCFA)
    cout_possession_unitaire: float = 180  # H : coût de stockage par unité/an
):
    """
    1. Stock de Sécurité (Safety Stock) :
       SS = Z * sqrt(L) * sigma_d
    
    2. Point de Commande (Reorder Point ROP) :
       ROP = (d * L) + SS
       Dès que Stock_Physique + En_Transit <= ROP -> Émission bon de commande auto !
       
    3. Quantité Économique de Commande (Wilson EOQ) :
       D_annuelle = d * 365
       EOQ = sqrt((2 * D_annuelle * S) / H)
    """
    stock_securite = round(facteur_service_z * math.sqrt(delai_fournisseur_jours) * ecart_type_demande)
    point_commande_rop = round((demande_quotidienne * delai_fournisseur_jours) + stock_securite)
    
    demande_annuelle = demande_quotidienne * 365
    quantite_eco_eoq = round(math.sqrt((2 * demande_annuelle * cout_passation_commande) / cout_possession_unitaire))
    
    return {
        "stock_securite_ss": stock_securite,
        "point_commande_rop": point_commande_rop,
        "quantite_eco_eoq": quantite_eco_eoq
    }`,
    explanation: 'Automatise les commandes fournisseurs dès que le stock franchit le ROP, sans risque de rupture ni de sur-stockage coûteux.'
  }
];

export const API_ENDPOINTS = [
  {
    method: 'POST',
    path: '/api/v1/pos/checkout',
    summary: 'Enregistrement ultra-rapide d’une vente en caisse',
    payload: {
      caisse_id: 1,
      caissier_id: 104,
      client_id: 'CUST-001',
      mode_paiement: 'MOBILE_MONEY',
      fournisseur_mobile: 'WAVE',
      reference_transaction: 'WAV-CI-9988231',
      lignes: [
        { code_produit: 'PRD-004', quantite: 2, unite: 'pack', prix_applique: 750, remise_dlc: 50 },
        { code_produit: 'PRD-005', quantite: 1.450, unite: 'kg', prix_applique: 680, remise_dlc: 20 }
      ]
    },
    response: {
      status: 'SUCCESS',
      id_vente: 4892,
      numero_ticket: 'TCK-2026-09-4892',
      total_ttc: 2486,
      points_fidelite_gagnes: 24,
      nouveau_solde_points: 444,
      sync_offline_ack: true
    }
  },
  {
    method: 'GET',
    path: '/api/v1/products/scan/:barcode',
    summary: 'Recherche instantanée au scan douchette avec calcul dynamique DLC et pesée',
    payload: null,
    response: {
      code_produit: 'PRD-004',
      barcode: '3033490004521',
      designation: 'Yaourt Nature Bio (Pack de 4)',
      prix_catalogue: 1500,
      dlc: '2026-09-18',
      jours_restants: 3,
      dynamic_pricing: {
        taux_remise: 50,
        prix_effectif: 750,
        motif: 'PROMO_DLC_ANTI_GASPI'
      },
      stock_disponible: 4,
      unite: 'pack',
      est_au_poids: false
    }
  },
  {
    method: 'POST',
    path: '/api/v1/sync/offline-events',
    summary: 'Synchronisation par lots (CRDT/Vector Clocks) des tickets encaissés hors-ligne',
    payload: {
      terminal_id: 'POS-01',
      batch_timestamp: '2026-09-15T11:45:00Z',
      vector_clock: { 'POS-01': 142, 'SERVER': 890 },
      evenements: [
        { type: 'VENTE', ticket_id: 'TCK-OFFLINE-01-094', total: 18500, timestamp: 1789472300 },
        { type: 'TIROIR_OUVERT', timestamp: 1789472500 }
      ]
    },
    response: {
      status: 'RECONCILED',
      processed_events: 2,
      stock_conflicts: 0,
      next_server_vector: 891
    }
  },
  {
    method: 'GET',
    path: '/api/v1/inventory/alerts/dlc',
    summary: 'Liste des produits sous le seuil d’alerte de péremption pour démarquage',
    payload: null,
    response: {
      total_alertes: 4,
      critiques_3_jours: [
        { code: 'PRD-004', designation: 'Yaourt Nature Bio', jours: 3, stock: 4, remise_suggeree: 50 },
        { code: 'PRD-009', designation: 'Fromage Emmental Râpé', jours: 2, stock: 7, remise_suggeree: 50 }
      ],
      alertes_7_jours: [
        { code: 'PRD-005', designation: 'Tomates Rondes', jours: 5, stock: 24.5, remise_suggeree: 20 }
      ]
    }
  }
];
