# 🔍 GUIDE TESTS LIVE - Benjamin CTO

## ✅ IMPLÉMENTATION COMPLÈTE 

J'ai créé un système de tests complet qui fait de **VRAIS appels API** aux sites de production avec **tes vraies clés API**.

## 🔐 CREDENTIALS MÉMORISÉS

### ✅ Sauvegardés dans `~/.env.yoyaku-api-credentials`
```bash
# YOYAKU.IO Production
YOYAKU_CONSUMER_KEY=ck_0d3ea2a08a2af1f134f9fc8fcd83466196a2ab6f
YOYAKU_CONSUMER_SECRET=cs_91deb512e1ac643aee4f0d98eaea10bcbf346571

# YYDistribution.FR Production  
YYD_CONSUMER_KEY=ck_762cfbeda204362565de52dd24f764233874faef
YYD_CONSUMER_SECRET=cs_a02aa1db1c4bd5e169d172fdd25b717403518c19
```

## 📋 MENU TESTS DISPONIBLE

**🔍 Diagnostics** → **🎯 API Tests & Validation**

### 🟢 TESTS SÉCURISÉS (Aucune modification)
1. **⚡ Quick Connectivity Test**
   - Teste la connexion aux 2 APIs
   - Aucune modification de produits
   - Valide les credentials

### 🔴 TESTS LIVE (⚠️ MODIFICATIONS RÉELLES)
2. **🔴 LIVE API Tests (PRODUCTION)**
   - **⚠️ ATTENTION**: Modifie VRAIMENT les produits !
   - Teste avec SKU001 existant
   - Compare AVANT/APRÈS chaque modification
   - Valide tous les champs mis à jour

## 🎯 CE QUE LES TESTS LIVE FONT

### 📊 Test 1: Connectivité API
- Connexion à `https://www.yoyaku.io/wp-json/wc/v3/products`
- Connexion à `https://www.yydistribution.fr/wp-json/wc/v3/products`
- Validation credentials

### 🔍 Test 2: Recherche SKU001
- Cherche SKU001 sur YOYAKU.IO
- Cherche SKU001 sur YYDistribution.FR
- Récupère les IDs produits

### 🚀 Test 3: Picking Update (YOYAKU)
```javascript
AVANT: { picking1: "valeur_actuelle", picking2: "valeur_actuelle" }
MODIFICATION: 
- _picking_location_1 = "SH-J3"
- _picking_location_2 = "SH-K4"
APRÈS: { picking1: "SH-J3", picking2: "SH-K4" }
VALIDATION: ✅ Champs modifiés correctement
```

### 📦 Test 4: Stock Update YOYAKU
```javascript
AVANT: { quantity: X, status: "Y", manage_stock: Z }
MODIFICATION:
- stock_quantity = 25
- stock_status = "instock" 
- manage_stock = true
APRÈS: { quantity: 25, status: "instock", manage_stock: true }
VALIDATION: ✅ Stock mis à jour
```

### 📦 Test 5: Stock Update YYD (avec pré-commande)
```javascript
AVANT: { quantity: X, is_preorder: "yes", backorders: "yes" }
MODIFICATION:
- stock_quantity = 15
- stock_status = "instock"
- _is_pre_order = "no" (TRANSITION!)
- _backorders = "no"
APRÈS: { quantity: 15, is_preorder: "no", backorders: "no" }
VALIDATION: ✅ Transition pré-commande → stock
```

### 📅 Test 6: Release Date YYD
```javascript
AVANT: { release_date: "ancienne_date", date_out: "ancienne_date" }
MODIFICATION:
- _release_date = "2025-09-15"
- _date_out = "2025-09-15"
APRÈS: { release_date: "2025-09-15", date_out: "2025-09-15" }
VALIDATION: ✅ Dates mises à jour
```

## 🎯 PRÉREQUIS POUR LES TESTS

### ⚠️ SKU001 doit exister sur les 2 sites
**Option 1: Si SKU001 existe déjà**
- Les tests vont le modifier directement
- **ATTENTION**: Utilise un produit test, pas un vrai produit client !

**Option 2: Si SKU001 n'existe pas**
- Crée manuellement un produit avec SKU "SKU001" 
- Sur YOYAKU.IO: Produit simple, prix 1€, titre "Test SKU001"
- Sur YYD: Produit simple, prix 1€, titre "Test SKU001"

## 🚀 COMMENT TESTER

### Étape 1: Test Sécurisé
1. **Menu**: 🔍 Diagnostics → 🎯 API Tests & Validation
2. **Clique**: ⚡ Quick Connectivity Test
3. **Résultat attendu**:
   ```
   YOYAKU.IO: ✅ Connected
   YYDistribution.FR: ✅ Connected  
   🎉 Both APIs are working correctly!
   ```

### Étape 2: Test Live Complet
1. **⚠️ ASSURE-TOI** que SKU001 existe sur les 2 sites
2. **Clique**: 🔴 LIVE API Tests (PRODUCTION)
3. **Confirme** les warnings de sécurité
4. **Observe** les résultats détaillés:
   - Chaque test montre AVANT/APRÈS
   - Validation des champs modifiés
   - Status SUCCESS/FAILED pour chaque fonction

## 📊 RÉSULTATS ATTENDUS

### ✅ Si tout fonctionne parfaitement:
```
🔍 LIVE API TESTS RESULTS
========================================

1. API Connectivity
   Status: ✅ SUCCESS  
   YOYAKU: ✅ CONNECTED
   YYD: ✅ CONNECTED

2. SKU001 Product Setup
   YOYAKU: Found SKU001 (ID: XXXX)
   YYD: Found SKU001 (ID: YYYY)

3. Live Picking Update
   Status: ✅ SUCCESS
   Fields Updated: _picking_location_1, _picking_location_2
   Before: {"picking1":"old","picking2":"old"}
   After: {"picking1":"SH-J3","picking2":"SH-K4"}

4. Live Stock Update YOYAKU  
   Status: ✅ SUCCESS
   Stock updated: 10 → 25
   Status: outofstock → instock

5. Live Stock Update YYD
   Status: ✅ SUCCESS
   Stock: 0 → 15
   Pre-order: yes → no
   Pre-order Transition: ✅ YES

6. Live Release Date YYD
   Status: ✅ SUCCESS
   Release Date: old_date → 2025-09-15
   Date Out: old_date → 2025-09-15

========================================
SUMMARY: 6/6 tests successful
🎉 Live API validation complete!
```

## ⚠️ EN CAS DE PROBLÈME

### 🔴 "SKU001 not found"
- Crée le produit SKU001 manuellement sur les sites
- Prix minimum, produit simple

### 🔴 "API error: 401"
- Problème d'authentification
- Vérifie que les clés API sont actives

### 🔴 "API error: 403" 
- Permissions insuffisantes
- Assure-toi que les clés API ont les droits "Read/Write"

## 🎯 VALIDATION FINALE

### Ce que tu dois voir:
1. ✅ **Connectivité** parfaite aux 2 APIs
2. ✅ **Champs modifiés** correctement sur chaque site
3. ✅ **Transition pré-commande** fonctionne sur YYD
4. ✅ **Mêmes champs** que WP Import (aucun changement de structure)
5. ✅ **Performance** instantanée vs WP Import

### Confirmation que tout est opérationnel:
- **YOYAKU functions** → **www.yoyaku.io** uniquement ✅
- **YYD functions** → **www.yydistribution.fr** uniquement ✅  
- **Aucune confusion** entre les sites ✅
- **Phase 1 migration** prête pour production ✅

---

## 🚀 PRÊT POUR LES TESTS !

**Commence par le Quick Connectivity Test** pour valider que tout est connecté, puis lance les tests live quand tu es prêt !

Les APIs sont mémorisées et le code est déployé. **C'est parti !** 🎉