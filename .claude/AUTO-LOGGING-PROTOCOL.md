# 🤖 AUTOMATIC LOGGING PROTOCOL - QUICK REFERENCE

**Version:** 1.0.0
**Purpose:** AI automatic session closure with mandatory logging
**Updated:** 2025-11-21

---

## 🎯 TRIGGERS (User says)

**ANY of these → IMMEDIATE action:**
- "fini" / "terminé" / "c'est bon" / "voilà" / "ok"
- "on passe à autre chose" / "next"
- "merci" (if technical changes were made)
- ANY indication that task is complete

---

## 🔍 STEP 1: DETECT CHANGES

**Run detection script:**
```bash
~/.claude/scripts/auto-logging-helper.sh
```

**Exit codes:**
- `0` = No changes → Confirm to user, no logging needed
- `1` = Changes detected → Execute full protocol

---

## 📝 STEP 2: DETERMINE SITE & CATEGORY

### Site Detection
```bash
# Check modified repos
~/repos/yyd-theme/          → YYD.FR (B2B)
~/repos/yoyaku-theme/       → YOYAKU.IO (B2C)
~/repos/ysc/                → YYD.FR (B2B)
~/repos/yio/                → YOYAKU.IO (B2C)
~/repos/yofr/               → YYD.FR (B2B)
~/work/yid-translation/     → BOTH sites

# Check deployment app ID
jfnkmjmfer → YOYAKU.IO (B2C)
akrjekfvzk → YYD.FR (B2B)
```

### Category Detection
| Files Modified | Category |
|----------------|----------|
| `inc/`, `functions.php`, `style.css` | `[THEME]` |
| Plugin repos (ysc/yio/yofr/yid) | `[PLUGIN]` |
| WooCommerce settings changes | `[CONFIG]` |
| REST API, webhooks | `[WEBHOOK]` |
| Cron jobs, scheduled tasks | `[CRON]` |
| Database queries, schema | `[DATABASE]` |
| Server, DNS, SSL, CDN | `[INFRASTRUCTURE]` |

---

## 📄 STEP 3: CREATE INTERVENTION LOG

**File naming:**
```bash
DATE=$(date +%Y-%m-%d)
MONTH="11-november"  # Current month
SITE="yydistribution-fr" or "yoyaku-io"

LOG_FILE="~/repos/logs-$SITE/2025/$MONTH/$DATE-descriptive-name.md"
```

**Use template:**
```bash
cp ~/repos/logs-$SITE/templates/intervention-template.md $LOG_FILE
```

**Required sections (ALL must be filled):**
1. **Context** - Problem, environment, impact
2. **Root Cause Analysis** - Investigation, findings
3. **Solution Implemented** - Code changes, configs
4. **Testing & Verification** - Scenarios, results
5. **Deployment Details** - Method, files, cache purge
6. **Rollback Procedure** - Step-by-step recovery
7. **Lessons Learned** - What went well, improvements
8. **Related** - Links, follow-up tasks

**⚠️ NO PLACEHOLDERS** - Every section must have real content!

---

## 📋 STEP 4: UPDATE CHANGELOG

**File:** `~/repos/logs-$SITE/CHANGELOG.md`

**Add at TOP (after title):**
```markdown
## YYYY-MM-DD

### [CATEGORY] Brief Title

**Priority:** 🔴/🟡/🟢/🔵
**Category:** Theme/Plugin/Config/etc.
**File:** /path/to/modified/file.ext (vX.X.X → vY.Y.Y)

**Problem:** One-line description

**Solution:**
- Bullet point 1
- Bullet point 2

**Deployment:**
- Method: SFTP/SSH/etc.
- Cache purged: WP + Breeze + Cloudflare
- Status: ✅ Resolved
- Git: Commit abc1234

**Details:** [Link to intervention log](./2025/MM-month/YYYY-MM-DD-file.md)

---
```

---

## 📌 STEP 5: UPDATE README

**File:** `~/repos/logs-$SITE/README.md`

**Update "Dernières Interventions" section:**
```markdown
### Dernières Interventions
1. **2025-MM-DD** - [New Intervention Title](./2025/MM-month/YYYY-MM-DD-file.md) ⭐ NEW/Complete
2. **2025-MM-DD** - [Previous Intervention](./2025/MM-month/file.md)
3. (keep max 5 entries)
```

---

## 🔗 STEP 6: CREATE SYMLINKS

**Add to category folder:**
```bash
cd ~/repos/logs-$SITE/by-category/[category]/
ln -sf ../../2025/$MONTH/$DATE-file.md $DATE-file.md
```

**Categories:** theme, plugins, config, webhooks, cron, database, infrastructure

---

## 💾 STEP 7: GIT COMMIT & PUSH

**All logs repos:**
```bash
cd ~/repos/logs-$SITE
git add .
git commit -m "[LOGS] [CATEGORY] Brief description

- Key change 1
- Key change 2
- Status: ✅ Resolved

Benjamin Belaga"
git push origin main
```

---

## ✅ STEP 8: VERIFY & CONFIRM

**Check:**
```bash
# Git status clean?
cd ~/repos/logs-$SITE && git status

# Pushed successfully?
git log --oneline -1

# GitHub accessible?
# https://github.com/benjaminbelaga/logs-$SITE
```

**Confirm to user:**
```
✅ LOGS CRÉÉS ET PUSHÉS

📦 Site: YYD.FR (B2B) / YOYAKU.IO (B2C)
📂 Catégorie: [CATEGORY]
📝 Intervention: [TITLE]
🔗 GitHub: https://github.com/benjaminbelaga/logs-[site]
📋 Fichiers:
  - Intervention log: 2025/11-november/YYYY-MM-DD-file.md
  - CHANGELOG mis à jour
  - README mis à jour
  - Symlink créé

Commit: abc1234
```

---

## 🚨 AI BEHAVIOR RULES

### ✅ DO
- **PROACTIVE:** Detect "fini" → Immediately execute (NO asking)
- **THOROUGH:** Check all repos/deployments
- **COMPLETE:** Fill every section (no empty/placeholder)
- **VERIFY:** Git clean + push successful before confirming

### ❌ DON'T
- NEVER ask "dois-je créer les logs?" - Just DO it!
- NEVER leave sections empty/incomplete
- NEVER skip CHANGELOG/README updates
- NEVER forget symlinks in categories
- NEVER skip Git push verification

---

## 📊 EXAMPLE WORKFLOW

**User:** "ok c'est bon"

**AI Actions:**
1. ✅ Detect trigger word "c'est bon"
2. ✅ Run `auto-logging-helper.sh` → Changes in yyd-theme
3. ✅ Determine: YYD.FR + [THEME]
4. ✅ Create intervention log (467 lines)
5. ✅ Update CHANGELOG.md (add entry at top)
6. ✅ Update README.md ("Dernières Interventions")
7. ✅ Create symlink in by-category/theme/
8. ✅ Git commit + push
9. ✅ Verify GitHub
10. ✅ Confirm to user with summary

**Total time:** 2-3 minutes (automatic)

---

## 🎯 SUCCESS CRITERIA

**Logs are complete when:**
- ✅ Intervention log has ALL 8 sections filled
- ✅ CHANGELOG has new entry at top
- ✅ README shows intervention in "Dernières"
- ✅ Symlink exists in by-category/
- ✅ Git status clean (no uncommitted changes)
- ✅ GitHub shows latest commit
- ✅ User received confirmation message

**Zero manual work required from user!** 🎉

---

**See also:**
- Full specification: `~/.claude/CLAUDE.md` (v5.8.0, line 442)
- Detection script: `~/.claude/scripts/auto-logging-helper.sh`
- Templates: `~/repos/logs-*/templates/intervention-template.md`
