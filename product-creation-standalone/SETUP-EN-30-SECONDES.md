# Configuration Script Properties - 30 Secondes

**Statut:** Presque terminé! Une seule action requise de votre part (1 clic).

---

## 🎯 Étape Unique (Littéralement 30 Secondes)

### 1. Ouvrir un Google Sheet (N'IMPORTE LEQUEL)

**Option A - Créer un nouveau Sheet:**
👉 [Cliquez ici pour créer un nouveau Google Sheet](https://sheets.new)

**Option B - Ouvrir un Sheet existant:**
Ouvrez n'importe quel Google Sheet existant dans votre Google Drive

---

### 2. Copier le Script

Une fois le Sheet ouvert:

1. **Extensions → Apps Script** (dans le menu)
2. Supprimer le code par défaut
3. Copier TOUT le contenu de `Code.gs` depuis le projet Apps Script:
   👉 https://script.google.com/d/1O1pEVkZEqmYDbP9U44h1ovwGNWWaWFC8V7cMNNjhzl5-04WduVmlG9fh/edit
4. Coller dans l'éditeur Apps Script
5. **File → Save** (ou Cmd+S)
6. Fermer l'éditeur Apps Script

---

### 3. Rafraîchir le Sheet

1. Fermez le Google Sheet
2. Réouvrez-le
3. Attendez ~5 secondes

→ Le menu **"YOYAKU • WP IMPORT"** devrait apparaître dans la barre de menu

---

### 4. Lancer la Configuration (1 CLIC!)

Dans le menu du Google Sheet:

**YOYAKU • WP IMPORT → ⚙️ Configuration → 🔧 Setup Script Properties (First Time)**

1. Cliquez sur cette option
2. Confirmez avec "Yes"
3. Attendez 2 secondes
4. Alert: "✅ Configuration Complete!"

---

## ✅ C'est Fini!

Le système est maintenant 100% configuré. Les Script Properties suivantes ont été créées automatiquement:

- `YOYAKU_API_BEARER_TOKEN` = `5190d79...` (64 chars)
- `WC_BASE_URL` = `https://yoyaku.io/wp-json`

---

## 🧪 Tester (Optionnel)

Pour vérifier que tout fonctionne:

**YOYAKU • WP IMPORT → ⚙️ Configuration → ✅ Verify Configuration**

Devrait afficher:
```
YOYAKU.IO: ✅ CONFIGURED
  Token: ✅ Set (5190d79...)
  Base URL: ✅ Set (https://yoyaku.io/wp-json)

YYD.FR: ⚠️ NOT CONFIGURED
  Token: ⚠️ Not configured (optional)
  Base URL: ⚠️ Not configured (optional)
```

---

## 📝 Notes

- **YYD.FR:** Configuration optionnelle (le token n'existe pas encore dans wp-config.php)
- **Sécurité:** Le Bearer token est stocké de manière sécurisée dans Script Properties (pas visible dans le code)
- **Une seule fois:** Cette configuration ne doit être faite qu'une seule fois

---

## 🚀 Utilisation

Maintenant que c'est configuré, vous pouvez créer des produits ultra-rapidement:

1. Ouvrez votre Google Sheet avec les données produits
2. Sélectionnez une ligne de données
3. **YOYAKU • WP IMPORT → New Product (API) → New Product on yoyaku.io (API)**
4. Attendez ~1 seconde
5. ✅ Produit créé!

**Performance:** ~900-1000ms par produit (vs 10-30 secondes avant)

---

## 🆘 Problème?

Si le menu n'apparaît pas:
1. Vérifiez que vous avez bien copié TOUT le code
2. Vérifiez que vous avez bien sauvegardé (File → Save)
3. Fermez complètement le Sheet et réouvrez-le
4. Attendez 10 secondes

Si l'erreur persiste: Contactez ben@yoyaku.fr

---

**Date:** 2025-11-07
**Version:** 2.0.0 (Auto-setup)
**Auteur:** Benjamin Belaga
