# 🎯 Guide Tests & Simulations SKU001

## ✅ DÉPLOYÉ ET PRÊT !

Toutes les simulations sont maintenant disponibles dans Google Apps Script.

## 📋 Menu de Tests Disponible

Dans ton Google Sheet, va dans le menu :
**🔍 Diagnostics** → **🎯 API Simulations SKU001**

### 🚀 Tests Disponibles :

1. **🚀 Complete API Sites Simulation**
   - **Ce que ça fait** : Teste TOUTES les fonctions API avec SKU001
   - **Vérifications** : Site de destination, endpoints, champs, transformations
   - **Résultat** : Rapport complet montrant où chaque fonction envoie ses données

2. **📍 Picking Update Detail**
   - **Ce que ça fait** : Test détaillé UNIQUEMENT pour l'update picking
   - **Vérifications** : YOYAKU.IO, champs `_picking_location_1/2`, valeurs test
   - **Résultat** : Trace complète de l'appel API qui sera fait

3. **📊 Stock Update Detail**
   - **Ce que ça fait** : Test détaillé pour stock update (choix YOYAKU ou YYD)
   - **Vérifications** : Site correct, calcul stock_status, payload
   - **Résultat** : Trace complète avec différences YYD (pre-order transition)

4. **🔍 Validate API Endpoints**
   - **Ce que ça fait** : Teste la connectivité aux APIs WooCommerce
   - **Vérifications** : yoyaku.io et yydistribution.fr accessibles
   - **Résultat** : Status de connectivité (401 = bon signe, API existe)

## 🎯 Simulation avec SKU001 - Données de Test

### 📍 Test Picking (YOYAKU.IO)
```
SKU: SKU001
picking1: SH-J3  → _picking_location_1 = "SH-J3"
picking2: SH-K4  → _picking_location_2 = "SH-K4"
Endpoint: https://www.yoyaku.io/wp-json/wc/v3/products
```

### 📦 Test Stock YOYAKU (YOYAKU.IO)
```
SKU: SKU001
Quantity: 25
Stock Status: instock (calculé automatiquement)
Endpoint: https://www.yoyaku.io/wp-json/wc/v3/products
```

### 📦 Test Stock YYD (YYDISTRIBUTION.FR)
```
SKU: SKU001
Quantity: 15
Stock Status: instock
Pre-order Transition: Oui (disable pre-order car stock > 0)
Fields bonus: _is_pre_order = "no", _backorders = "no"
Endpoint: https://www.yydistribution.fr/wp-json/wc/v3/products
```

### 📅 Test Release Date YYD (YYDISTRIBUTION.FR)
```
SKU: SKU001
Release Date: 2025-09-15
Fields: _release_date = "2025-09-15", _date_out = "2025-09-15"
Endpoint: https://www.yydistribution.fr/wp-json/wc/v3/products
```

## 🔍 Ce Que Les Tests Vérifient

### ✅ Site Targeting (LE PLUS IMPORTANT)
- ✅ Picking → **YOYAKU.IO uniquement**
- ✅ Stock YOYAKU → **YOYAKU.IO uniquement**  
- ✅ Stock YYD → **YYDISTRIBUTION.FR uniquement**
- ✅ Release Date → **YYDISTRIBUTION.FR uniquement**

### ✅ Field Mapping
- ✅ Picking : `_picking_location_1/2` (champs legacy, 6342+ produits)
- ✅ Stock : `stock_quantity`, `stock_status`, `manage_stock`
- ✅ YYD Pre-order : `_is_pre_order`, `_backorders`
- ✅ Release Date : `_release_date`, `_date_out`

### ✅ Data Transformation
- ✅ Stock status auto-calculé (> 0 = instock, = 0 = outofstock)
- ✅ YYD transition pré-commande → stock
- ✅ Format dates standardisé (YYYY-MM-DD)

## 🎯 Comment Tester

### Étape 1 : Test Complet
1. Menu : **🔍 Diagnostics** → **🎯 API Simulations SKU001**
2. Clique **🚀 Complete API Sites Simulation**
3. Lis le rapport complet

### Étape 2 : Tests Individuels
1. Pour chaque fonction, clique sur le test détaillé
2. Vois exactement l'endpoint et les données
3. Vérifie que c'est le bon site

### Étape 3 : Validation Connectivité
1. Clique **🔍 Validate API Endpoints**
2. Vois si les APIs sont accessibles
3. Status 401 = bon (API existe, besoin auth)

## ⚠️ Notes Importantes

### 🔑 Credentials YYD
- **Status actuel** : Placeholders (`ck_YOUR_YYD_KEY`)
- **Impact** : Tests YYD montrent "NEEDS_CREDS"
- **Action requise** : Ajouter vraies clés YYD quand disponibles

### 🎯 Différences Critiques YYD vs YOYAKU
- **YOYAKU** : Stock simple, pas de pré-commandes
- **YYD** : Gestion transition pré-commande → stock
- **Sites séparés** : Impossible de confondre grâce aux endpoints

## 🚀 Performance Attendue

- **WP Import Legacy** : 2 secondes par produit
- **API Direct New** : 0.1 seconde par produit
- **Amélioration** : **20x plus rapide !**

## 📊 Prochaines Étapes

Une fois les tests validés :
1. **Phase 1** : Utiliser les nouvelles fonctions API
2. **Phase 2** : Migrer imports pré-commandes (717, 935)
3. **Phase 3** : Migrer création nouveaux produits (852)
4. **Phase 4** : Migration complète, suppression WP Import

---

**🎉 Tout est prêt pour les tests !**

Lance le **Complete API Sites Simulation** pour voir le rapport complet avec SKU001 !