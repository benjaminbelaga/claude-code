# 🔧 GOOGLE WORKSPACE API - SETUP COMPLET
**Benjamin Belaga - YOYAKU** | 2025-11-20

## 🎯 OBJECTIF
Accès complet à l'API Google Workspace pour automatiser :
- Gestion des groupes (webmaster@yoyaku.fr, etc.)
- Gestion des utilisateurs
- Calendriers, Drive, Gmail
- Toute l'infrastructure Google Workspace

---

## 📋 ÉTAPES DE CONFIGURATION

### ÉTAPE 1 : Créer un Service Account (5 min)

**URL :** https://console.cloud.google.com/iam-admin/serviceaccounts

1. Sélectionne ton projet Google Cloud (ou crée-en un si besoin)
2. Click **"Create Service Account"**

**Configuration :**
```
Name: yoyaku-workspace-automation
ID: yoyaku-workspace-automation
Description: Full Google Workspace automation for YOYAKU ecosystem
```

3. Click **"Create and Continue"**
4. Skip "Grant access" (pas nécessaire) → Click **"Continue"**
5. Click **"Done"**

---

### ÉTAPE 2 : Créer la clé JSON (2 min)

1. Click sur le service account **yoyaku-workspace-automation**
2. Onglet **"Keys"**
3. **"Add Key"** → **"Create new key"** → Select **JSON**
4. Click **"Create"**
5. Le fichier JSON est téléchargé automatiquement

**⚠️ IMPORTANT :** Note le **Client ID** (visible dans les détails du service account)
Exemple : `123456789012345678901@developer.gserviceaccount.com`

---

### ÉTAPE 3 : Activer les APIs nécessaires (3 min)

Active ces APIs dans Google Cloud Console :

**URL rapide pour chaque API :**

1. **Admin SDK API** (groupes, utilisateurs)
   👉 https://console.cloud.google.com/apis/library/admin.googleapis.com
   → Click **"Enable"**

2. **Gmail API** (emails)
   👉 https://console.cloud.google.com/apis/library/gmail.googleapis.com
   → Click **"Enable"**

3. **Google Calendar API** (calendriers)
   👉 https://console.cloud.google.com/apis/library/calendar-json.googleapis.com
   → Click **"Enable"**

4. **Google Drive API** (drive)
   👉 https://console.cloud.google.com/apis/library/drive.googleapis.com
   → Click **"Enable"**

5. **Google Sheets API** (déjà activé probablement)
   👉 https://console.cloud.google.com/apis/library/sheets.googleapis.com
   → Click **"Enable"** (si pas déjà fait)

---

### ÉTAPE 4 : Domain-Wide Delegation (5 min) ⭐ CRITIQUE

**C'est l'étape qui donne les permissions au service account !**

**URL :** https://admin.google.com/ac/owl/domainwidedelegation

1. Click **"Add new"**

2. **Client ID** : Colle le Client ID du service account
   (Format: `123456789012345678901`)

3. **OAuth Scopes** : Copie-colle EXACTEMENT ces scopes :
   ```
   https://www.googleapis.com/auth/admin.directory.group,https://www.googleapis.com/auth/admin.directory.user,https://www.googleapis.com/auth/admin.directory.domain,https://www.googleapis.com/auth/gmail.modify,https://www.googleapis.com/auth/calendar,https://www.googleapis.com/auth/drive
   ```

4. Click **"Authorize"**

✅ Le service account a maintenant accès complet à Google Workspace !

---

## 💾 INSTALLATION DES CREDENTIALS

Une fois le fichier JSON téléchargé, exécute ce script :

```bash
/tmp/setup-workspace-api-quick.sh
```

Ou manuellement :

```bash
# Copier le fichier JSON téléchargé
cp ~/Downloads/yoyaku-workspace-automation-*.json \
   ~/.credentials/yoyaku/api-keys/google-workspace-service-account.json

chmod 600 ~/.credentials/yoyaku/api-keys/google-workspace-service-account.json

# Créer le fichier de config
cat > ~/.credentials/yoyaku/api-keys/google-workspace-admin.env << 'EOF'
# Google Workspace Admin API - Full Access
# Created: 2025-11-20
# Service Account: yoyaku-workspace-automation

export GOOGLE_SERVICE_ACCOUNT_FILE="$HOME/.credentials/yoyaku/api-keys/google-workspace-service-account.json"
export GOOGLE_ADMIN_EMAIL="ben@yoyaku.fr"
export GOOGLE_WORKSPACE_DOMAIN="yoyaku.fr"

# Scopes disponibles
export GOOGLE_WORKSPACE_SCOPES="admin.directory.group,admin.directory.user,gmail.modify,calendar,drive"
EOF

chmod 600 ~/.credentials/yoyaku/api-keys/google-workspace-admin.env
```

---

## 📦 INSTALLER LES DÉPENDANCES PYTHON

```bash
pip3 install --upgrade google-auth google-auth-oauthlib google-auth-httplib2 google-api-python-client
```

---

## ✅ TEST DE CONNEXION

Une fois tout configuré, je créerai un script de test pour vérifier :

```python
#!/usr/bin/env python3
# Test Google Workspace API Access

from google.oauth2 import service_account
from googleapiclient.discovery import build

SCOPES = [
    'https://www.googleapis.com/auth/admin.directory.group',
    'https://www.googleapis.com/auth/admin.directory.user'
]

SERVICE_ACCOUNT_FILE = '/Users/yoyaku/.credentials/yoyaku/api-keys/google-workspace-service-account.json'
ADMIN_EMAIL = 'ben@yoyaku.fr'

credentials = service_account.Credentials.from_service_account_file(
    SERVICE_ACCOUNT_FILE, scopes=SCOPES)

delegated_credentials = credentials.with_subject(ADMIN_EMAIL)

# Test 1: List groups
service = build('admin', 'directory_v1', credentials=delegated_credentials)
results = service.groups().list(customer='my_customer').execute()
groups = results.get('groups', [])

print(f"✅ Connexion OK - {len(groups)} groupes trouvés:")
for group in groups:
    print(f"  • {group['email']}")
```

---

## 🎯 SCRIPTS À CRÉER APRÈS SETUP

Une fois configuré, je créerai des scripts pour :

1. **Gestion des groupes**
   - `~/tools/google-workspace/create-group.sh`
   - `~/tools/google-workspace/add-member.sh`
   - `~/tools/google-workspace/list-groups.sh`

2. **Gestion des utilisateurs**
   - `~/tools/google-workspace/create-user.sh`
   - `~/tools/google-workspace/list-users.sh`

3. **Automatisations avancées**
   - Sync automatique groupes ↔ équipes
   - Notifications calendrier → Discord
   - Backup automatique Drive

---

## 📝 CHECKLIST

- [ ] Service Account créé (yoyaku-workspace-automation)
- [ ] Clé JSON téléchargée
- [ ] Client ID noté
- [ ] Admin SDK API activée
- [ ] Gmail API activée
- [ ] Calendar API activée
- [ ] Drive API activée
- [ ] Domain-Wide Delegation configurée (avec scopes)
- [ ] JSON installé dans ~/.credentials/
- [ ] Config .env créée
- [ ] Dépendances Python installées
- [ ] Test de connexion réussi

---

## 🚀 NEXT STEPS APRÈS SETUP

1. Test de connexion
2. Créer webmaster@yoyaku.fr via API
3. Lister tous les groupes existants
4. Créer les scripts de gestion
5. Documenter dans CREDENTIALS-INDEX.md

---

**Prêt à commencer ?** Dis-moi quand tu as terminé chaque étape et je t'aide !
