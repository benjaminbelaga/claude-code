# 🤖 DISCORD API AUTOMATION
**Benjamin Belaga - YOYAKU** | 2025-11-20

---

## 📁 CREDENTIALS

```bash
File: ~/.credentials/yoyaku/api-keys/discord.env
Bot Token: DISCORD_BOT_TOKEN
App ID: 943936960488169552
```

**Charger les credentials :**
```bash
source ~/.credentials/yoyaku/api-keys/discord.env
```

---

## 🛠️ SCRIPTS DISPONIBLES

### **1. Modifier un channel**
```bash
# Charger les credentials d'abord
source ~/.credentials/yoyaku/api-keys/discord.env

# Voir les infos d'un channel
python3 ~/tools/discord/modify-channel.py CHANNEL_ID info

# Modifier la description/topic
python3 ~/tools/discord/modify-channel.py CHANNEL_ID topic "Nouvelle description"

# Modifier le nom
python3 ~/tools/discord/modify-channel.py CHANNEL_ID name "nouveau-nom"

# Modifier plusieurs paramètres
python3 ~/tools/discord/modify-channel.py CHANNEL_ID \
  name "nouveau-nom" \
  topic "Nouvelle description" \
  nsfw false
```

---

## 📋 PARAMÈTRES MODIFIABLES

### **Text Channels:**
- `name` - Nom du channel (2-100 caractères)
- `topic` - Description/topic (0-1024 caractères)
- `position` - Position dans la liste
- `nsfw` - Channel NSFW (true/false)
- `rate_limit_per_user` - Slowmode en secondes (0-21600)
- `parent_id` - ID de la catégorie parent

### **Voice Channels:**
- `name` - Nom du channel
- `bitrate` - Qualité audio (8000-96000, 128000 pour serveurs boostés)
- `user_limit` - Limite d'utilisateurs (0-99)
- `position` - Position dans la liste
- `parent_id` - ID de la catégorie parent

---

## 🔍 TROUVER UN CHANNEL ID

### **Méthode 1 : Via Discord UI**
1. Activer le mode développeur : Settings → Advanced → Developer Mode
2. Clic droit sur un channel → Copy ID

### **Méthode 2 : Via un script de listing**
```python
# Je peux te créer un script pour lister tous les channels si besoin
```

---

## ⚡ EXEMPLES PRATIQUES

### **Exemple 1 : Modifier mcp-logistics channel**
```bash
source ~/.credentials/yoyaku/api-keys/discord.env

# Voir les infos actuelles
python3 ~/tools/discord/modify-channel.py 1234567890 info

# Changer la description
python3 ~/tools/discord/modify-channel.py 1234567890 \
  topic "🚚 Logistics automation - UPS, FedEx, La Poste quotes"
```

### **Exemple 2 : Ajouter un slowmode**
```bash
# 30 secondes entre chaque message
python3 ~/tools/discord/modify-channel.py 1234567890 \
  rate_limit_per_user 30
```

### **Exemple 3 : Renommer un channel**
```bash
python3 ~/tools/discord/modify-channel.py 1234567890 \
  name "mcp-logistics-v2"
```

---

## 🎯 CE QUE TU PEUX FAIRE AVEC DISCORD API

### ✅ **Gestion des Channels**
- Créer, modifier, supprimer des channels
- Modifier les descriptions, noms, permissions
- Gérer les catégories
- Configurer slowmode, NSFW, etc.

### ✅ **Gestion des Messages**
- Envoyer des messages (déjà fait avec tes webhooks)
- Éditer des messages
- Supprimer des messages
- Ajouter des réactions
- Pin/unpin messages

### ✅ **Gestion des Roles**
- Créer, modifier, supprimer des rôles
- Assigner des rôles à des utilisateurs
- Modifier les permissions

### ✅ **Gestion du Serveur**
- Modifier le nom, icon, description du serveur
- Gérer les webhooks
- Audit logs
- Moderation (ban, kick, timeout)

### ✅ **Automatisations**
- Bots interactifs (slash commands)
- Notifications automatiques
- Logs automatiques
- Intégrations avec d'autres services

---

## 📚 DOCUMENTATION

- **Discord API Docs:** https://discord.com/developers/docs/intro
- **Bot Dashboard:** https://discord.com/developers/applications/943936960488169552
- **Python discord.py library:** https://discordpy.readthedocs.io/ (alternative plus complète)

---

## 🚀 PROCHAINES ÉTAPES POSSIBLES

**Si tu veux aller plus loin, je peux créer :**

1. **Script pour lister tous les channels** d'un serveur
2. **Script pour créer des channels** avec configuration complète
3. **Script pour gérer les permissions** des channels
4. **Bot Discord interactif** avec slash commands
5. **Automatisations** (ex: logs automatiques dans un channel)

---

## ⚠️ IMPORTANT

**Permissions du bot :**
- Le bot doit avoir les permissions nécessaires sur le serveur
- Pour modifier des channels : "Manage Channels" permission
- Pour modifier des messages : "Manage Messages" permission
- Vérifie les permissions sur : https://discord.com/developers/applications/943936960488169552/bot

**Rate Limits :**
- Discord API a des rate limits
- Ne fais pas trop de requêtes en peu de temps
- Le bot peut être temporairement bloqué si tu dépasses les limites

---

**Status:** Opérationnel ✅
**Created:** 2025-11-20
