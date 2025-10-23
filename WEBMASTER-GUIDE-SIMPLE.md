# 🚀 Update Stock YOYAKU - Guide Webmaster Simple

**Version:** 2.0-webmaster
**Dernière mise à jour:** 2025-10-23
**Pour:** Webmasters non-techniques

---

## 🎯 Workflow en 3 Clics - C'EST TOUT!

```
1. 🧹 Clear Calculated Data (optionnel)
2. 📊 Fetch Data & Calculate
3. 📦 Update Stock YOYAKU v2.0
```

**Temps total:** 2-5 minutes (selon nombre de produits)

---

## 📋 ÉTAPE PAR ÉTAPE

### ÉTAPE 1: Clear Calculated Data (Optionnel)

**Quand l'utiliser:**
- Quand tu recommences de zéro
- Si tu veux nettoyer les anciennes données calculées

**Comment:**
1. Ouvre Google Sheet "update stock"
2. Menu: **⚡ Update Stock > 🧹 Clear Calculated Data**
3. Click "YES"
4. Attends 10 secondes
5. Message "✅ Clear Complete" apparaît

**Qu'est-ce que ça fait:**
- Vide colonnes I, L, M, N, S (données calculées)
- **GARDE** colonnes B, C, D (données sources - IMPORTANT!)

**⚠️ PAS D'INQUIÉTUDE:**
- Ça ne touche PAS à tes données sources
- Tu peux toujours recalculer après

---

### ÉTAPE 2: Fetch Data & Calculate (OBLIGATOIRE)

**C'est la magie qui se passe ici!**

**Comment:**
1. Menu: **⚡ Update Stock > 📊 Fetch Data & Calculate**
2. Click "YES"
3. Attends 30-60 secondes (dépend du nombre de lignes)
4. Message "✅ Calculation Complete" avec le nombre de produits

**Qu'est-ce que ça fait:**
- Lit les colonnes D, H, J, T, U, R, O (tes données sources)
- Calcule automatiquement:
  - **Colonne I** = Initial Quantity (J + D)
  - **Colonne L** = Stock Quantity (D+H-T-U-1, jamais négatif)
  - **Colonne M** = Status Text ("back in stock" ou "arrivals")
  - **Colonne N** = Date du jour (automatique)
  - **Colonne S** = Week Number (si imports/exclusives)

**Tu peux vérifier:**
- Regarde colonnes I, L, M, N, S
- Les valeurs sont maintenant remplies automatiquement
- Si tu vois des valeurs → ✅ C'est bon!

---

### ÉTAPE 3: Update Stock YOYAKU v2.0 (ENVOIE À WOOCOMMERCE)

**C'est là que ça se passe côté site!**

**Comment:**
1. Menu: **⚡ Update Stock > 📦 Update Stock YOYAKU v2.0**
2. Lis le message de confirmation
3. Click "YES"
4. Attends 2-10 minutes (dépend du nombre de produits)
5. Message final avec résumé

**Qu'est-ce que ça fait:**
- Envoie les stocks (colonne L) à WooCommerce
- Envoie initial quantity (colonne I) au custom field
- Change automatiquement catégorie "Forthcoming" → "Arrival"
- Désactive backorders sur TOUS les produits
- Protège contre stock négatif

**Résumé final:**
```
✅ Successfully updated: XX products
📈 Stock increased: XX
📉 Stock decreased: XX
🏷️ Categories swapped: XX
🚫 Backorders disabled: XX
📊 Initial quantities saved: XX
```

---

## ❓ QUESTIONS FRÉQUENTES

### Q: Je dois faire les 3 étapes à chaque fois?

**Non!** Workflow normal:

```
PREMIÈRE FOIS ou CLEAN SLATE:
1. Clear Calculated Data (optionnel)
2. Fetch Data & Calculate
3. Update Stock YOYAKU v2.0

FOIS SUIVANTES (données sources changées):
2. Fetch Data & Calculate
3. Update Stock YOYAKU v2.0

SI DÉJÀ CALCULÉ (juste update WooCommerce):
3. Update Stock YOYAKU v2.0
```

---

### Q: Qu'est-ce que je ne dois JAMAIS toucher?

**❌ NE TOUCHE JAMAIS:**
- Colonnes B, C, D (données sources critiques)
- Headers (ligne 1)
- Les formules si tu en vois (normalement tu n'en verras pas)

**✅ TU PEUX MODIFIER:**
- Les valeurs dans colonnes D, H, J, T, U, R, O (tes données)
- Rien d'autre!

---

### Q: Que faire si erreur?

**Erreur "Missing Calculated Data":**
→ Tu as sauté l'étape 2 (Fetch Data & Calculate)
→ Solution: Fais l'étape 2 d'abord!

**Erreur "SKU column not found":**
→ Le header "SKU" est manquant
→ Solution: Vérifie ligne 1, colonne A doit être "SKU"

**Erreur "Sheet 'update stock' not found":**
→ Le nom du sheet est incorrect
→ Solution: Renomme le sheet en "update stock" (sans majuscule au u)

**Autres erreurs:**
→ Screenshot de l'erreur
→ Envoie à Benjamin

---

### Q: Combien de temps ça prend?

**Étape 1 (Clear):** 10 secondes
**Étape 2 (Calculate):** 30-60 secondes (100 produits) à 2-3 minutes (500+ produits)
**Étape 3 (Update):** 6 secondes par produit
  - 100 produits = ~10 minutes
  - 500 produits = ~50 minutes

**Total:** Variable selon nombre de produits

---

### Q: C'est sécurisé?

**OUI!**
- Backup automatique avant chaque modification
- Rollback possible si problème
- Protection stock négatif (impossible)
- Validation à chaque étape

---

### Q: Puis-je annuler?

**Pas directement dans le Google Sheet**, MAIS:
- Benjamin a un backup de la base de données
- Rollback possible en <5 minutes
- Contact Benjamin si besoin

---

## 🧪 TEST AVANT PRODUCTION

**Menu disponibles pour tester:**

### 📊 Show Calculation Report
- Montre un exemple de calcul (ligne 2)
- Vérifie que les formules sont correctes
- **Utilise ça pour comprendre les calculs!**

### 🧪 Test Calculations
- Tests automatiques des formules mathématiques
- Si tout passe → ✅ C'est bon!
- Si échec → Contact Benjamin

---

## ⚡ RACCOURCIS / TIPS

### Tip #1: Vérification Visuelle Rapide

Après étape 2 (Fetch Data & Calculate):
```
✅ Colonne I remplie? → Oui
✅ Colonne L remplie? → Oui
✅ Colonne L jamais négative? → Vérifier
✅ Colonne M = "back in stock" ou "arrivals"? → Oui
✅ Colonne N = date du jour? → Oui
```

Si tout ✅ → Passe à étape 3!

---

### Tip #2: Si tu veux refaire les calculs

**C'est simple:**
1. Fetch Data & Calculate (étape 2)
2. Ça recalcule TOUT automatiquement
3. Les anciennes valeurs sont écrasées

**Pas besoin de Clear!** (sauf si tu veux vraiment repartir de zéro)

---

### Tip #3: Suivi des changements

Le message final te dit:
- Combien de produits mis à jour
- Combien de stocks augmentés
- Combien de stocks diminués
- Combien de catégories changées

**Prends un screenshot!** Utile pour reporting.

---

## 🆘 CONTACT SUPPORT

**Si problème:**
1. Screenshot de l'erreur
2. Note l'étape où ça a bloqué (1, 2 ou 3)
3. Contact Benjamin

**Benjamin:**
- Email: ben@yoyaku.io
- Délai réponse: <4h (heures ouvrables)

---

## 📊 CHECKLIST RAPIDE

Avant de commencer:
- [ ] Google Sheet "update stock" ouvert
- [ ] Colonnes D, H, J, T, U, R, O ont des données
- [ ] 5 minutes de temps disponible

Workflow:
- [ ] Étape 1: Clear (si besoin)
- [ ] Étape 2: Fetch Data & Calculate ✅ (obligatoire)
- [ ] Étape 3: Update Stock v2.0 ✅ (obligatoire)

Vérification:
- [ ] Message "✅ Complete" après chaque étape
- [ ] Colonnes I, L remplies après étape 2
- [ ] Résumé final OK après étape 3

---

## 🎉 C'EST TOUT!

**Tu es maintenant expert du stock update!**

Workflow = 3 clics → Résultat professionnel

**Des questions?** Relis ce guide ou contact Benjamin.

**Bon update! 🚀**
