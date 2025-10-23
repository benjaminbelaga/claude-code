# 📚 WP IMPORT DASHBOARD - MEGA DOCUMENTATION COMPLÈTE
## Version: 3.1.0 - Documentation Ultime
## Date: 2025-10-23
## Author: Claude Code (après leçon apprise 😅)

---

## ⚠️ RÈGLE D'OR - LIRE AVANT TOUTE MODIFICATION

**MANDATORY:** Lire cette documentation COMPLÈTE avant de modifier quoi que ce soit dans ce projet.

**Leçon apprise (2025-10-23):** J'ai supprimé des menus pensant qu'ils étaient consolidables, mais ils sont ACTIVEMENT utilisés pour importer vers des sites différents (YOYAKU.IO, YYD.FR, BARCELONA).

**Principe ULTRATHINK:**
1. Lire cette doc
2. Comprendre l'usage
3. Vérifier les dépendances
4. Tester sur clone
5. ENSUITE modifier

---

## 🎯 VUE D'ENSEMBLE - ARCHITECTURE PROJET

### Projet: WP Import Dashboard (Google Apps Script)

**Objectif:** Gestion centralisée des imports/updates de produits WooCommerce pour 3 sites:
- **YOYAKU.IO** (B2C) - Boutique vinyles en ligne
- **YYD.FR** (YYDistribution - B2B) - Distribution B2B
- **BARCELONA** - Site tiers (import de produits)

**Type:** Google Apps Script + Google Sheets
**Langage:** JavaScript (Google Apps Script flavor)
**API:** WooCommerce REST API v3 + Custom endpoints

---

## 🏗️ ARCHITECTURE FICHIERS

### Fichiers Principaux

| Fichier | Rôle | Modification autorisée? |
|---------|------|------------------------|
| `main.js` | Menu structure + entry points | ⚠️ OUI mais LIRE CETTE DOC |
| `api-stock-functions-v2-webmaster.js` | Workflow webmaster v2.0 (3-click) | ✅ OUI |
| `api-fetch-stock-data.js` | Fetch data depuis YOYAKU.IO API | ✅ OUI |
| `api-stock-functions-v2.js` | Workflow v2.0 avec formules manuelles | ⚠️ Legacy |
| `api-stock-functions.js` | Workflow v1.0 | ❌ Legacy, ne pas toucher |
| `import-852-new-products-api.js` | Import 852 (création produits) | ✅ OUI |
| `api-release-date-functions.js` | Update release dates YYD | ✅ OUI |
| `api-direct-functions.js` | Picking updates | ✅ OUI |
| `complete-import-functions.js` | Legacy import handlers | ⚠️ Legacy |
| `config.js` | Configuration API (credentials) | ⚠️ Sensible |

### Fichiers Documentation

| Fichier | Contenu |
|---------|---------|
| `MEGA-DOCUMENTATION-COMPLETE-2025-10-23.md` | **CE FICHIER** - Doc complète |
| `WEBMASTER-GUIDE-SIMPLE.md` | Guide pour webmasters non-tech |
| `MENU-CLEANUP-MIGRATION-2025-10-23.md` | Historique cleanup menu |
| `IMPORT-803-V2-MIGRATION-GUIDE.md` | Migration WP Import 803 → API |
| `README.md` | Doc générale projet |
| `TECHNICAL-GUIDE.md` | Guide technique détaillé |

---

## 📋 STRUCTURE MENU COMPLÈTE

### Niveau 1: Menus Principaux

```
WP Import Dashboard
├── 📊 metadata
├── 🛒 YOYAKU.io Tools
├── 📦 YYDistribution Tools
├── 🏬 BARCELONA Tools
├── ⚡ Update Stock
├── 🔧 Other Tools
└── 🔍 Diagnostics
```

---

## 🛒 MENU: YOYAKU.io Tools

**⚠️ NE PAS SUPPRIMER - ACTIVEMENT UTILISÉ**

### Fonction: Import NEW products
**Function:** `runYoyakuNewImport()`
**Usage:** Import nouveaux produits sur YOYAKU.IO (B2C)
**Workflow:**
1. Lit les données depuis sheet actif
2. Crée nouveaux produits via WooCommerce API
3. Associe taxonomies (musicartist, musiclabel, etc.)

**Quand l'utiliser:**
- Arrivage nouveaux vinyles à mettre en ligne sur YOYAKU.IO
- Création produits B2C uniquement

**Ne PAS utiliser pour:**
- YYD.FR (utiliser YYDistribution Tools)
- Updates de stock (utiliser Update Stock menu)

### Fonction: Import PRE-ORDER products
**Function:** `runYoyakuPreOrderImport()`
**Usage:** Import produits en pré-commande sur YOYAKU.IO
**Workflow:**
1. Lit données sheet
2. Crée produits avec status "pre-order"
3. Configure backorders activés

**Quand l'utiliser:**
- Vinyles annoncés mais pas encore en stock
- Produits pré-commande B2C

---

## 📦 MENU: YYDistribution Tools

**⚠️ NE PAS SUPPRIMER - ACTIVEMENT UTILISÉ**

### Fonction: Import products
**Function:** `runYYDImport()`
**Usage:** Import produits sur YYD.FR (B2B distribution)
**Workflow:**
1. Lit données sheet
2. Crée produits B2B sur YYD.FR
3. Prix distributeur (différents de B2C)

**Quand l'utiliser:**
- Import catalogue distributeur B2B
- Nouveaux produits pour revendeurs

**Différences vs YOYAKU.IO:**
- Prix: Marge distributeur (40% moins cher que B2C)
- Custom fields: `_yyd_total_shelf`, `_units_on_shelf`
- Public: Revendeurs uniquement (B2B)

---

## 🏬 MENU: BARCELONA Tools

**⚠️ NE PAS SUPPRIMER - ACTIVEMENT UTILISÉ**

### Fonction: Import products
**Function:** `runBarcelonaImport()`
**Usage:** Import produits vers site tiers BARCELONA
**Workflow:**
1. Lit données sheet
2. Crée produits sur site BARCELONA
3. Configuration spécifique BARCELONA

**Quand l'utiliser:**
- Import vers site partenaire BARCELONA
- Synchronisation catalogue tiers

**Important:** Ce site est DIFFÉRENT de YOYAKU.IO et YYD.FR. Ne PAS consolider avec d'autres menus!

---

## ⚡ MENU: Update Stock (PRINCIPAL)

**⚠️ MENU LE PLUS UTILISÉ - Comprendre chaque fonction**

### Section 1: Webmaster v2.0 (3-Click Workflow)

#### Fonction: 🧹 Clear Calculated Data
**Function:** `clearCalculatedData()`
**Usage:** Nettoie colonnes calculées I, L, M, N, S
**⚠️ PRÉSERVE:** Colonnes B, C, D (données sources critiques)

**Workflow:**
```javascript
1. Confirm action
2. Clear columns: I, L, M, N, S (keep B, C, D)
3. Show success message
```

**Quand l'utiliser:**
- Recommencer calcul de zéro
- Nettoyer anciennes données calculées

**Ne PAS utiliser si:**
- Tu veux garder les calculs existants
- Pas sûr de ce que tu fais (DANGEREUX)

#### Fonction: 📊 Fetch Data & Calculate
**Function:** `fetchDataAndCalculate()`
**Usage:** Calcule automatiquement I, L, M, N, S depuis sources D, H, J, T, U, R, O

**Formules calculées:**
```javascript
I = J + D                    // Initial Quantity
L = MAX(0, D+H-T-U-1)       // Stock Quantity (protected)
M = IF(J>0, "back in stock", "arrivals")  // Status Text
N = TODAY()                  // Date
S = IF(R="imports" OR R="exclusives", "Week " + WEEKNUM(O), "")
```

**Workflow:**
```
1. Lit colonnes sources (D, H, J, T, U, R, O)
2. Calcule I, L, M, N, S en JavaScript
3. Écrit dans sheet
4. Affiche rapport
```

**Quand l'utiliser:**
- Après avoir rempli colonnes sources manuellement
- Pour recalculer avec nouvelles données

**Important:** NE FAIT PAS D'APPEL API! Lit juste le sheet.

#### Fonction: 📦 Update Stock YOYAKU v2.0
**Function:** `updateYoyakuStockDirectAPI_V2_Webmaster()`
**Usage:** Envoie stocks calculés (colonnes I, L) vers WooCommerce

**Business rules appliquées:**
1. Stock = Column L (calculé)
2. Initial Quantity = Column I → custom field `_initial_quantity`
3. Category swap: "forthcoming" → "arrival"
4. Force disable backorders (sauf produits spécifiques)
5. Negative stock protection (set to 0)

**Workflow:**
```
1. Lit colonnes I, L (pré-calculées)
2. Pour chaque SKU:
   - Update stock_quantity (L)
   - Update _initial_quantity (I)
   - Swap category si nécessaire
   - Disable backorders
3. Résumé final
```

**Quand l'utiliser:**
- Après Fetch Data & Calculate
- Pour envoyer stocks vers YOYAKU.IO

**⚠️ CRITIQUE:** Ne JAMAIS utiliser sans avoir calculé I, L d'abord!

#### Fonction: 📊 Show Calculation Report
**Function:** `showCalculationReport()`
**Usage:** Affiche exemple de calcul (ligne 2)

**Quand l'utiliser:**
- Vérifier que formules sont correctes
- Comprendre les calculs
- Debug calculs bizarres

#### Fonction: 🧪 Test Calculations
**Function:** `testCalculations()`
**Usage:** Tests automatiques des formules

**Quand l'utiliser:**
- Vérifier que logique fonctionne
- Après modification des formules
- Debug calculs

---

### Section 2: Phase 1 Functions (Existing)

#### Fonction: 🚀 Update Picking (Direct API)
**Function:** `updatePickingDirectAPI()`
**Usage:** Update picking locations sur YOYAKU.IO
**Custom fields:** `_picking_location_1`, `_picking_location_2`, `_picking_location_3`, `_picking_location_4`

**Quand l'utiliser:**
- Update emplacements warehouse
- Changement organisation picking

**⚠️ NE PAS DÉPLACER** - Utilisé activement!

#### Fonction: 📅 Update Release Date YYD (Direct API)
**Function:** `updateReleaseDateDirectAPI()`
**Usage:** Update release dates sur YYD.FR (B2B)
**Custom field:** `_release_date`

**Quand l'utiliser:**
- Changement dates de sortie distributeur
- YYD.FR seulement (pas YOYAKU.IO)

**⚠️ NE PAS DÉPLACER** - Utilisé activement pour YYD!

---

### Section 3: Import 852 (Create New Products)

**Submenu:** 🚀 Create New Products (Import 852)

#### Fonction: Create New Products API
**Function:** `processImport852NewProductsAPI()`
**Usage:** Création massive de produits depuis import 852

**Workflow:**
1. Lit données import 852 (format EDI)
2. Parse métadonnées (artiste, label, style)
3. Crée produits sur YOYAKU.IO
4. Associe taxonomies

**Quand l'utiliser:**
- Import EDI 852 (arrivages distributeur)
- Création batch de produits

#### Autres fonctions Import 852:
- **Test Import 852** - Test configuration
- **Validate Configuration** - Valide setup
- **View Dashboard** - Dashboard import 852
- **Setup Configuration** - Config initiale
- **Reset Configuration** - Reset config

---

## 📊 MENU: metadata

**Fonction:** Parsing et correction métadonnées produits

### Principales fonctions:
- **AI Parsing (OpenAI)** - Parse métadonnées avec AI
- **AI Parsing (Make.com)** - Parse via Make.com
- **Smart Validator** - Correction automatique
- **Update Metadata** - Update métadonnées

**Usage:** Nettoyage et enrichissement données produits

---

## 🔧 MENU: Other Tools

### Fonction: Delete Bulk Products (Yoyaku)
**Function:** `runDeleteBulkProducts()`
**Usage:** Suppression massive de produits sur YOYAKU.IO

**⚠️ DANGEREUX** - Double confirmation requise

**Workflow:**
1. Lit SKUs à supprimer
2. Double confirmation
3. Supprime produits via API
4. Rapport final

**Quand l'utiliser:**
- Nettoyage produits obsolètes
- Suppression batch

**⚠️ NE PAS DÉPLACER** - Fonction critique, doit rester accessible

---

## 🔍 MENU: Diagnostics

**Fonction:** Tests et validation système

### Principales fonctions:
- **Test Complete System** - Test complet
- **Test Stock Update Flow** - Test workflow stock
- **Test Connectivity** - Test connexions API
- **Debug Ultra Complete** - Debug approfondi

**Usage:** Troubleshooting et validation

---

## 🗺️ CARTOGRAPHIE SITES

### YOYAKU.IO (B2C)
**URL:** https://www.yoyaku.io
**App ID:** jfnkmjmfer
**Type:** Boutique B2C vinyles
**Custom Fields Principaux:**
- `_total_preorders` - Total pré-commandes
- `_initial_quantity` - Stock initial
- `_picking_location_1` to `_picking_location_4` - Emplacements
- `_depot_vente` - Dépôt vente

**Menus concernés:**
- ✅ YOYAKU.io Tools (Import NEW, PRE-ORDER)
- ✅ Update Stock (Update Stock YOYAKU v2.0)
- ✅ Update Stock (Update Picking)
- ✅ Other Tools (Delete Bulk Products)

### YYD.FR (B2B)
**URL:** https://yydistribution.fr
**App ID:** akrjekfvzk
**Type:** Distribution B2B revendeurs
**Custom Fields Principaux:**
- `_yyd_total_shelf` - Total shelf EUR
- `_units_on_shelf` - Unités sur shelf
- `_release_date` - Date de sortie
- `_total_preorders` - Synced depuis YOYAKU.IO

**Menus concernés:**
- ✅ YYDistribution Tools (Import products)
- ✅ Update Stock (Update Release Date YYD)

### BARCELONA
**URL:** [TBD - site tiers]
**Type:** Site partenaire/tiers
**Menus concernés:**
- ✅ BARCELONA Tools (Import products)

---

## 🔗 SYNC CUSTOM FIELDS (IMPORTANT!)

**Découverte 2025-10-23:** Les custom fields sont synchronisés entre YOYAKU.IO et YYD.FR!

### Sync Bidirectionnel

| Custom Field | Site Source | Sites avec Sync | Usage |
|--------------|-------------|-----------------|-------|
| `_yyd_total_shelf` | YYD.FR | ✅ YOYAKU.IO (486 rows) | Shelf total EUR |
| `_total_preorders` | YOYAKU.IO | ✅ YYD.FR (237 rows) | Pré-commandes B2C |
| `_wishlist_count` | YOYAKU.IO | ✅ YYD.FR | Wishlist (TI Wishlist) |

**Implication:** Peut fetcher TOUTES les données depuis YOYAKU.IO API seulement! (Optimisation 50%)

---

## ⚡ OPTIMISATION API (À FAIRE)

### Problème Actuel
Workflow `fetchDataAndCalculate()` NE FAIT PAS D'APPEL API - il lit juste le sheet.
Les colonnes sources (D, H, J, T, U) doivent être remplies manuellement.

### Solution Proposée
Créer `fetchDataAndCalculateFromAPI()` qui:
1. Fetch depuis YOYAKU.IO API (1 request per SKU)
   - stock_quantity → H
   - initial_quantity → J
   - shelf_quantity → T (depuis _yyd_total_shelf synced)
   - total_preorders → U
2. Calcule I, L, M, N, S
3. Write to sheet

**Gain:** Auto-fetch + 50% moins de requêtes (1 endpoint au lieu de 2)

---

## 🚫 NE JAMAIS FAIRE

### ❌ Supprimer ces menus (TOUS UTILISÉS!)
- YOYAKU.io Tools
- YYDistribution Tools
- BARCELONA Tools

### ❌ Modifier sans lire cette doc
- main.js (menu structure)
- api-stock-functions-v2-webmaster.js (workflow critique)

### ❌ Consolidater menus "similaires"
- Chaque menu site-specific a une raison d'exister
- Sites différents = configurations différentes

### ❌ Déplacer fonctions sans comprendre dépendances
- Update Picking → utilisé activement
- Update Release Dates → utilisé pour YYD
- Delete Bulk Products → fonction critique

---

## ✅ CHECKLIST AVANT MODIFICATION

Avant TOUTE modification de ce projet:

- [ ] J'ai lu cette MEGA documentation complète
- [ ] Je comprends quel menu/fonction je veux modifier
- [ ] Je sais POURQUOI cette fonction existe
- [ ] Je connais les sites concernés (YOYAKU.IO / YYD.FR / BARCELONA)
- [ ] J'ai vérifié les dépendances
- [ ] J'ai un backup (git commit)
- [ ] Je teste sur clone AVANT production

**Si UNE seule case n'est pas cochée → NE PAS MODIFIER!**

---

## 📚 RÉFÉRENCES

### Documentation Liée
- `WEBMASTER-GUIDE-SIMPLE.md` - Guide utilisateur webmaster
- `MENU-CLEANUP-MIGRATION-2025-10-23.md` - Historique menu changes
- `IMPORT-803-V2-MIGRATION-GUIDE.md` - Migration guide v2.0
- `README.md` - Doc générale
- `TECHNICAL-GUIDE.md` - Doc technique

### APIs Documentation
- WooCommerce REST API: https://woocommerce.github.io/woocommerce-rest-api-docs/
- YOYAKU Custom API: `https://www.yoyaku.io/wp-json/yoyaku/v1/`

### GitHub Repository
- https://github.com/benjaminbelaga/wp-import-dashboard

---

## 📝 HISTORIQUE MODIFICATIONS

### 2025-10-23 - Menu Cleanup Rollback
**Changement:** Rollback consolidation menu
**Raison:** BARCELONA/YOYAKU.io/YYD Tools encore utilisés
**Leçon:** Lire doc AVANT de supprimer

### 2025-10-23 - Webmaster v2.0
**Changement:** Ajout workflow 3-click (zero formulas)
**Impact:** Simplifie workflow pour webmasters

### 2025-10-23 - Custom Fields Standardization
**Changement:** `_yyd_shelf_count` → `_yyd_total_shelf`
**Impact:** Cohérence naming + yoyaku-api-connector v1.4.0

---

## 👤 AUTHOR

**Benjamin Belaga** - ben@yoyaku.io
**Company:** YOYAKU SARL
**Date:** 2025-10-23

**Claude Code:** Documentation créée après avoir appris ma leçon 😅

---

**🎯 MISSION:** Cette documentation DOIT être lue AVANT toute modification future!

**Si tu lis ce fichier et que tu comprends tout → Tu peux modifier en sécurité!**

**Si tu ne comprends pas quelque chose → DEMANDE avant de toucher!**
