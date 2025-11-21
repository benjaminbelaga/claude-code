# 🔧 GOOGLE WORKSPACE API - REFERENCE RAPIDE
**Benjamin Belaga - YOYAKU** | Configuré: 2025-11-20

---

## 📁 CREDENTIALS - EMPLACEMENTS EXACTS

### **Fichiers de credentials :**
```bash
# Service Account JSON (ne JAMAIS modifier)
~/.credentials/yoyaku/api-keys/google-workspace-service-account.json

# Variables d'environnement (config)
~/.credentials/yoyaku/api-keys/google-workspace-admin.env
```

### **Charger les credentials :**
```bash
# Méthode 1 : Source directe
source ~/.credentials/yoyaku/api-keys/google-workspace-admin.env

# Méthode 2 : Via fonction universelle
yoyaku_load google-workspace
# OU
yoyaku_load workspace
# OU
yoyaku_load gw
```

---

## 🔑 INFORMATIONS SERVICE ACCOUNT

```
Email: yoyaku-workspace-automation@gen-lang-client-0413900274.iam.gserviceaccount.com
Client ID: 115885553305006200372
Project: gen-lang-client-0413900274
Admin Email (delegation): ben@yoyaku.fr
Domain: yoyaku.fr
```

---

## 🎯 SCOPES CONFIGURÉS

✅ `admin.directory.group` - Gestion des groupes
✅ `admin.directory.user` - Gestion des utilisateurs
✅ `admin.directory.domain` - Gestion du domaine
✅ `gmail.modify` - Accès Gmail
✅ `calendar` - Accès Calendar
✅ `drive` - Accès Google Drive

---

## 📝 SCRIPTS DISPONIBLES

### **Test de connexion :**
```bash
python3 ~/tools/google-workspace/test-connection.py
```

### **Créer un groupe :**
```bash
python3 ~/tools/google-workspace/create-group.py \
  GROUP_EMAIL \
  "GROUP_NAME" \
  "DESCRIPTION"

# Exemple:
python3 ~/tools/google-workspace/create-group.py \
  webmaster@yoyaku.fr \
  "YOYAKU Webmasters" \
  "Team group for webmaster operations"
```

### **Lister les groupes :**
```bash
python3 ~/tools/google-workspace/list-groups.py
```

### **Ajouter un membre à un groupe :**
```bash
python3 ~/tools/google-workspace/add-member.py \
  GROUP_EMAIL \
  MEMBER_EMAIL

# Exemple:
python3 ~/tools/google-workspace/add-member.py \
  webmaster@yoyaku.fr \
  seb@yoyaku.fr
```

### **Lister les utilisateurs :**
```bash
python3 ~/tools/google-workspace/list-users.py
```

---

## 🔧 CONFIGURATION GOOGLE CLOUD

### **Projet configuré :**
- **Project ID:** `834820557299` (projet principal)
- **Service Account Project:** `gen-lang-client-0413900274`

### **APIs activées dans le projet 834820557299 :**
✅ Admin SDK API
✅ Gmail API
✅ Google Calendar API
✅ Google Drive API

### **Domain-Wide Delegation :**
📍 **URL:** https://admin.google.com/ac/owl/domainwidedelegation

**Configuration actuelle :**
- **Client ID:** `115885553305006200372`
- **Client Name:** `yoyaku-w...`
- **Scopes:** Tous les scopes ci-dessus

---

## ⚡ USAGE RAPIDE

### **Python (dans un script) :**
```python
import os
from google.oauth2 import service_account
from googleapiclient.discovery import build

SERVICE_ACCOUNT_FILE = os.path.expanduser(
    '~/.credentials/yoyaku/api-keys/google-workspace-service-account.json'
)
ADMIN_EMAIL = 'ben@yoyaku.fr'

SCOPES = [
    'https://www.googleapis.com/auth/admin.directory.group',
    'https://www.googleapis.com/auth/admin.directory.user'
]

credentials = service_account.Credentials.from_service_account_file(
    SERVICE_ACCOUNT_FILE, scopes=SCOPES)

delegated_credentials = credentials.with_subject(ADMIN_EMAIL)

# Utiliser avec Admin SDK
admin_service = build('admin', 'directory_v1', credentials=delegated_credentials)

# Lister les groupes
results = admin_service.groups().list(customer='my_customer').execute()
groups = results.get('groups', [])
```

---

## 🧪 VÉRIFICATION RAPIDE

```bash
# Test complet (5 APIs)
python3 ~/tools/google-workspace/test-connection.py

# Charger les credentials dans le shell
source ~/.credentials/yoyaku/api-keys/google-workspace-admin.env
echo $GOOGLE_CLIENT_ID  # Devrait afficher: 115885553305006200372
```

---

## 📚 DOCUMENTATION

- **Guide complet:** `~/tools/google-workspace/SETUP-GUIDE.md`
- **Credentials Index:** `~/.credentials/CREDENTIALS-INDEX.md` (section 6.6)
- **Google Admin SDK API:** https://developers.google.com/admin-sdk
- **Google Workspace API Docs:** https://developers.google.com/workspace

---

## ✅ RÉSUMÉ POUR CLAUDE

**Credentials toujours ici :**
```
~/.credentials/yoyaku/api-keys/google-workspace-service-account.json
~/.credentials/yoyaku/api-keys/google-workspace-admin.env
```

**Charger avant utilisation :**
```bash
source ~/.credentials/yoyaku/api-keys/google-workspace-admin.env
```

**Test rapide :**
```bash
python3 ~/tools/google-workspace/test-connection.py
```

**Client ID du Service Account :** `115885553305006200372` (juste un nombre, pas `.apps.googleusercontent.com`)

---

**Créé le:** 2025-11-20
**Testé le:** 2025-11-20 ✅
**Status:** Opérationnel - Tous les tests passent
