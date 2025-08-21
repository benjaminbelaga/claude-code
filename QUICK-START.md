# ⚡ Quick Start - WP Import Dashboard

**Démarrage rapide en 5 minutes pour utiliser les fonctions API Direct**

---

## 🚀 Démarrage immédiat

### ✅ Prérequis (2 minutes)
1. **Accès Google Sheets** - Dashboard YOYAKU ouvert
2. **Feuille "update stock"** - Doit exister avec données
3. **Colonnes requises** - SKU + colonnes spécifiques par fonction

### 📋 Fonctions disponibles Phase 1

#### 🎯 **Update Picking** → `_picking_location_1`, `_picking_location_2`
**Colonnes requises**: `SKU`, `picking 1`, `picking 2`

#### 📦 **Update Stock YOYAKU** → `stock_quantity`, `stock_status` 
**Colonnes requises**: `SKU`, `new order quantity`

#### 📦 **Update Stock YYD** → Stock + transition pre-order
**Colonnes requises**: `SKU`, `new order quantity`

#### 📅 **Update Release Date YYD** → `_release_date`, `_date_out`
**Colonnes requises**: `SKU`, `release date`

---

## 🎮 Utilisation (30 secondes)

### 1️⃣ Accéder au menu
```
Menu Google Sheets → ⚡ Update Tools (API Direct NEW)
```

### 2️⃣ Choisir la fonction
- 🚀 **Update Picking** (YOYAKU.IO)
- 📦 **Update Stock YOYAKU** (YOYAKU.IO)  
- 📦 **Update Stock YYD** (YYDistribution.fr)
- 📅 **Update Release Date YYD** (YYDistribution.fr)

### 3️⃣ Confirmer et observer
- ✅ **Dialogue de confirmation** avec avantages
- ⏱️ **Progression temps réel** par batch
- 📊 **Résultats détaillés** succès/erreurs

---

## 📊 Exemple concret

### Structure des données
```
| SKU    | picking 1 | picking 2 | new order quantity | release date |
|--------|-----------|-----------|-------------------|--------------|
| SKU001 | SH-J3     | SH-K4     | 25                | 2025-09-15   |
| SKU002 | SH-A1     |           | 0                 | 2025-10-01   |
| SKU003 | SH-B2     | SH-C3     | 10                | 2025-11-15   |
```

### Résultat attendu
```
✅ 3 produits traités en 18 secondes
📈 2 stocks augmentés, 1 rupture de stock
🔄 1 transition pre-order → stock (YYD)
⏱️ Temps économisé vs WP Import: ~5 minutes
```

---

## 🧪 Test rapide 

### Validation avant utilisation (1 minute)
```javascript
// Dans Google Apps Script
testQuickConnectivity();
```

**Résultat attendu**:
```
🟢 YOYAKU.IO: Connected
🟢 YYDistribution.FR: Connected  
🎉 Both APIs are working correctly!
```

---

## ❌ Problèmes courants (30 secondes fix)

### "Sheet 'update stock' not found"
**Fix**: Créer feuille nommée exactement `update stock`

### "SKU column not found"  
**Fix**: Nommer colonne exactement `SKU` (majuscules)

### "API error: 401"
**Fix**: Vérifier credentials dans `api-credentials.js`

### "Product not found"
**Fix**: Vérifier SKU existe sur le site cible

---

## 🚀 Avantages immédiats

| Avantage | Impact |
|----------|--------|
| **20x plus rapide** | 6s vs 2min par produit |
| **0 timeout** | Workflow jamais interrompu |
| **Feedback temps réel** | Confiance utilisateur |
| **Gestion d'erreur précise** | Debug ligne par ligne |
| **Transition pre-order YYD** | Automatique et intelligent |

---

## 📞 Support express

**Problem?** → ben@yoyaku.io (< 4h response)  
**Emergency?** → ben@yoyaku.fr (< 1h response)

---

**🎯 Ready to go!** Sélectionnez votre fonction et démarrez le processing API Direct ultra-rapide!