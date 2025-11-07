# Google Apps Script Project

**Project Name:** YOYAKU WP Import - Product Creation API v2

**Script ID:** 1O1pEVkZEqmYDbP9U44h1ovwGNWWaWFC8V7cMNNjhzl5-04WduVmlG9fh

**Edit URL:** https://script.google.com/d/1O1pEVkZEqmYDbP9U44h1ovwGNWWaWFC8V7cMNNjhzl5-04WduVmlG9fh/edit

## Déployé automatiquement via clasp

**Dernière mise à jour:** 2025-11-07

**Fichiers déployés:**
- Code.gs (script principal - 45KB)
- appsscript.json (configuration)
- config.example.js (exemple de configuration)

## Configuration requise (Script Properties)

### YOYAKU.IO (B2C - requis):
- `YOYAKU_API_BEARER_TOKEN`
- `WC_BASE_URL` = https://yoyaku.io/wp-json

### YYD.FR (B2B - optionnel):
- `YOYAKU_API_BEARER_TOKEN_YYD`
- `WC_BASE_URL_YYD` = https://yydistribution.fr/wp-json

## Commandes clasp

```bash
cd /Users/yoyaku/Git/wp-import-dashboard/product-creation-standalone/scripts

# Pousser les modifications
clasp push

# Voir les versions
clasp versions

# Créer une version
clasp version "Description"
```
