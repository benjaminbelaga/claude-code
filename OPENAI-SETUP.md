# 🤖 OpenAI API Setup Guide

## Vue d'ensemble

Ce guide explique comment configurer l'API OpenAI pour le parsing automatique de métadonnées dans le WP Import Dashboard.

**Version:** 1.1.0
**Feature:** Metadata Parser with Direct OpenAI Integration
**Author:** Benjamin Belaga

---

## 🎯 Pourquoi OpenAI Direct?

### Comparaison: Make.com vs OpenAI Direct

| Critère | Make.com (Ancien) | OpenAI Direct (Nouveau) |
|---------|-------------------|-------------------------|
| **Coût** | $36-40/mois | ~$5/mois |
| **Vitesse** | 3-5s/produit | 1-2s/produit |
| **Debugging** | Complexe (5+ étapes) | Simple (1 endroit) |
| **Dépendances** | Make.com uptime | Aucune |
| **Latence réseau** | Élevée (3 hops) | Faible (1 hop) |

**💰 Économie annuelle: ~$420/an**

---

## 🔐 Sécurité de la clé API

### Où est stockée la clé?

La clé API OpenAI est stockée dans **Google Apps Script Properties Service**:

```javascript
PropertiesService.getScriptProperties().setProperty('OPENAI_API_KEY', 'sk-...')
```

### Pourquoi c'est sécurisé?

✅ **Encrypted at rest** - Google encrypt les données
✅ **Scoped to script** - Uniquement accessible par ce script
✅ **Not in code** - Jamais hardcodée dans le code source
✅ **Not in version control** - Pas dans Git/GitHub
✅ **User-specific** - Chaque utilisateur configure sa propre clé

### Best practices suivies

1. ✅ Utilisation de `PropertiesService` (standard Apps Script)
2. ✅ Validation du format de clé (`sk-` prefix)
3. ✅ UI prompt sécurisé (pas d'affichage en clair)
4. ✅ Error messages sanitisés (pas d'exposition de credentials)

---

## 📋 Setup Instructions

### Étape 1: Obtenir une clé API OpenAI

1. **Créer un compte OpenAI** (si pas déjà fait)
   - Aller sur: https://platform.openai.com/signup

2. **Ajouter des crédits**
   - Menu: Settings > Billing
   - Ajouter au minimum $5 de crédits
   - Recommandé: $10 pour commencer

3. **Créer une clé API**
   - Aller sur: https://platform.openai.com/api-keys
   - Cliquer: "Create new secret key"
   - Nom suggéré: "WP Import Dashboard"
   - **COPIER LA CLÉ** (elle commence par `sk-`)
   - ⚠️ **ATTENTION:** La clé ne sera affichée qu'une seule fois!

### Étape 2: Configurer dans Apps Script

#### Option A: Via le menu (Recommandé)

1. Ouvrir le Google Sheet
2. Menu: **📊 metadata > ⚙️ Setup OpenAI API Key**
3. Coller la clé (format: `sk-...`)
4. Cliquer OK
5. ✅ Clé stockée de manière sécurisée!

#### Option B: Via console Apps Script

1. Extensions > Apps Script
2. Ouvrir le fichier `metadata-parser-openai-direct.js`
3. Exécuter la fonction: `setupOpenAIKey`
4. Suivre les instructions

#### Option C: Manuelle (Avancé)

```javascript
// Exécuter une fois dans la console Apps Script
function setupManually() {
  PropertiesService.getScriptProperties()
    .setProperty('OPENAI_API_KEY', 'sk-VOTRE_CLE_ICI');
}
```

### Étape 3: Tester la connexion

1. Menu: **📊 metadata > 🧪 Test OpenAI Connection**
2. Vérifier le message de succès
3. En cas d'erreur, vérifier:
   - La clé est correcte
   - Vous avez des crédits OpenAI
   - La connexion internet fonctionne

---

## 🚀 Utilisation

### Parsing simple

1. **Préparer les données** dans la sheet "metadata creator":
   - Colonnes requises: `distributor`, `sku`, `price`, `bloc_metadata`

2. **Lancer le parsing**:
   - Menu: **📊 metadata > 🤖 AI Parsing (Direct OpenAI - NEW)**
   - Confirmer l'action
   - ⏳ Attendre la fin du traitement
   - ✅ Résultats écrits dans "wp import new product"

### Test avec une seule ligne

1. Menu: **📊 metadata > 🧪 Test Single Row Parsing**
2. Vérifier le résultat dans les logs
3. Valider le format JSON

---

## 💰 Coûts & Utilisation

### Tarification OpenAI (GPT-4o)

| Modèle | Prix Input | Prix Output | Coût/Produit (estimé) |
|--------|-----------|-------------|----------------------|
| GPT-4o | $2.50/1M tokens | $10/1M tokens | ~$0.005 |
| GPT-4o-mini | $0.15/1M tokens | $0.60/1M tokens | ~$0.001 |

### Calcul mensuel

**Exemple: 1000 produits/mois**

- GPT-4o: 1000 × $0.005 = **$5/mois**
- GPT-4o-mini: 1000 × $0.001 = **$1/mois**

**Comparé à Make.com: $36-40/mois → Économie de ~$35/mois**

### Changer de modèle

Dans `metadata-parser-openai-direct.js`:

```javascript
const OPENAI_CONFIG = {
  model: 'gpt-4o-mini', // Plus rapide et moins cher
  // ou
  model: 'gpt-4o',      // Plus précis mais plus cher
};
```

---

## 🔧 Troubleshooting

### Erreur: "API Key not configured"

**Solution:**
```
Menu > 📊 metadata > ⚙️ Setup OpenAI API Key
```

### Erreur: "Insufficient credits"

**Causes possibles:**
- Crédits OpenAI épuisés
- Carte de crédit expirée
- Limite de dépense atteinte

**Solution:**
1. Vérifier: https://platform.openai.com/account/billing
2. Ajouter des crédits
3. Vérifier les limites de dépense

### Erreur: "Rate limit exceeded"

**Cause:** Trop de requêtes simultanées

**Solution:** Le script gère automatiquement avec un délai de 1s entre requêtes

### Erreur: "Invalid API Key"

**Causes possibles:**
- Clé copiée incorrectement (espaces, retours ligne)
- Clé révoquée sur OpenAI
- Clé expirée

**Solution:**
1. Créer une nouvelle clé sur OpenAI
2. Reconfigurer: `Menu > Setup OpenAI API Key`

### Parsing incorrect

**Vérifications:**
1. Le `bloc_metadata` contient toutes les infos nécessaires
2. Le format est lisible (pas trop d'abréviations)
3. Tester avec `Test Single Row Parsing`

**Améliorer le prompt:**
Éditer le `systemPrompt` dans `metadata-parser-openai-direct.js`

---

## 📊 Monitoring & Logs

### Voir les logs détaillés

1. Extensions > Apps Script
2. View > Logs (Cmd+Enter sur Mac)
3. Filtrer: `[OpenAI Parse]`

### Métriques à surveiller

- **Success rate:** Taux de parsing réussi
- **API response time:** Temps de réponse OpenAI
- **Error rate:** Taux d'erreur
- **Cost per product:** Coût par produit

---

## 🔒 Sécurité & Conformité

### RGPD / Privacy

✅ **Aucune donnée personnelle envoyée** - Uniquement métadonnées produits
✅ **Pas de stockage chez OpenAI** (mode API, pas ChatGPT web)
✅ **Encrypted in transit** (HTTPS)
✅ **Clé stockée encrypted** (Google Apps Script Properties)

### Audit de sécurité

Pour auditer où la clé est utilisée:

```bash
# Dans le repo
grep -r "OPENAI_API_KEY" .
# Résultat: Uniquement dans metadata-parser-openai-direct.js
```

### Révoquer une clé compromise

1. Aller sur: https://platform.openai.com/api-keys
2. Cliquer sur la clé compromise
3. Cliquer: "Revoke"
4. Créer une nouvelle clé
5. Reconfigurer dans Apps Script

---

## 🗺️ Roadmap

### v1.1.0 (Actuel)
- ✅ Parsing direct OpenAI
- ✅ Setup UI sécurisé
- ✅ Tests intégrés

### v1.2.0 (Planifié)
- [ ] Fallback Claude (optionnel)
- [ ] Batch processing optimisé
- [ ] Cache de résultats
- [ ] Analytics dashboard

### v2.0.0 (Future)
- [ ] Multi-model support (GPT-4, Claude, Gemini)
- [ ] Fine-tuning custom model
- [ ] Auto-learning from corrections
- [ ] Cost optimization AI

---

## 💬 Support

### Documentation
- 📖 [README.md](README.md) - Guide général
- 📖 [TECHNICAL-GUIDE.md](TECHNICAL-GUIDE.md) - Architecture technique
- 📖 [CHANGELOG.md](CHANGELOG.md) - Historique des versions

### Questions fréquentes

**Q: Puis-je utiliser GPT-3.5 pour économiser?**
A: Oui, mais la qualité du parsing sera inférieure. GPT-4o-mini est un bon compromis.

**Q: Les données sont-elles stockées chez OpenAI?**
A: Non, l'API ne stocke pas les données (contrairement à ChatGPT web).

**Q: Puis-je utiliser ma propre instance OpenAI?**
A: Oui, modifier `OPENAI_CONFIG.apiEndpoint` dans le code.

**Q: Y a-t-il une limite de requêtes?**
A: Oui, voir: https://platform.openai.com/account/rate-limits

---

**Dernière mise à jour:** 2025-10-08
**Version:** 1.1.0
**Author:** Benjamin Belaga | YOYAKU SARL
