# BENJAMIN BELAGA - GLOBAL USER MEMORY
# v5.7.0 - Mandatory intervention logging system | 2025-11-21

## 👤 IDENTITY & CONTEXT

**Real Name:** Benjamin Belaga | **GitHub:** `benjaminbelaga` | **System:** `yoyaku` (macOS - legacy, DO NOT rename) | **Email:** ben@yoyaku.fr

### Team Structure
**Webmasters (Ops/Support):** Team members (see internal directory - contacts may change)
**Tech Team (3 Developers):** Separate team, GitHub access, NOT webmasters
**External Dev:** Yoann (dev@yoyaku.fr) - Complex projects, GitHub/Linear access

### Linear Project Management (Complex Missions)

**Use TodoWrite when:** Small tasks (3-15), single session, solo work, quick iterations
**Use Linear when:** 20+ tasks, multi-sprint, external collab (Yoann), GitHub integration, long-term tracking

**Linear Setup:** https://linear.app/yoyaku | Credentials: `~/.credentials/yoyaku/api-keys/linear.env` | Scripts: `~/tools/08-linear/`
**Example:** Discogs Vision (52 tasks, 3 sprints) - https://linear.app/yoyaku/project/discogs-vision-8a468bb22964

**AI Triggers:** "grosse mission" / "big project" / "tasks pour Yoann" / "multiple sprints" → Suggest Linear

**Linear Commands:**
```bash
source ~/.credentials/yoyaku/api-keys/linear.env
# Via MCP: "Create Linear issue for Sprint S1: Fix barcode"
cd ~/tools/08-linear/ && python3 linear_automation.py
```

### Repository Separation (CRITICAL)

**Webmasters (Ops):** `benjaminbelaga/webmaster-woo-tools` → `~/Git/webmaster-woo-tools/` | Aliases: `w*` (wtrack, whelp) | Purpose: Orders, SAV, shipping
**Developers (Tech):** `benjaminbelaga/yoyaku-team-config` → `~/yoyaku-team-config/` | Aliases: `y*` (ydeploy, ysync) | Purpose: Deployment, infrastructure

**AI Rule:** Orders/tracking/SAV → webmaster-woo-tools | Code/deploy/infra → yoyaku-team-config

### AI Note
"yoyaku" = 2 meanings: (1) `/Users/yoyaku/` (macOS username), (2) YOYAKU.IO (business)

**CRITICAL - NO AI ATTRIBUTION:**
- ❌ NEVER "Generated with Claude Code", "Co-Authored-By: Claude", "(via Claude Code)"
- ✅ ALWAYS "Benjamin Belaga" ONLY
- **Pre-commit scan:** `git diff --cached | grep -E "(Generated with|Co-Authored-By.*Claude|via Claude Code)"` → Clean if found

---

## 🌍 LANGUAGE POLICY
**User:** 🇫🇷 French | **ALL Tech:** 🇬🇧 English (code, docs, commits, logs)

---

## 🔑 API CREDENTIALS
**Location:** `~/.credentials/yoyaku/` | **Index:** `~/.credentials/CREDENTIALS-INDEX.md`

**Encryption:** `~/.credentials/encrypt-credentials-for-team.sh` or `yencrypt` → AES-256-CBC → `~/Desktop/credentials-team-encrypted.tar.gz.enc`
**Password:** `~/.credentials/yoyaku/passwords/team-encryption.key` + 1Password backup

**Dynamic Loading:**
```bash
yoyaku_load() {
  case "$1" in
    google|discogs|anthropic|cloudways|cloudflare|mcp-discogs) source ~/.credentials/yoyaku/api-keys/$1.env ;;
    google-workspace|workspace|gw) source ~/.credentials/yoyaku/api-keys/google-workspace-admin.env ;;
    gmail|gmail-smtp|email) source ~/.credentials/yoyaku/api-keys/gmail-smtp.env ;;
    discord|discord-bot) source ~/.credentials/yoyaku/api-keys/discord.env ;;
    contabo|sftp) source ~/.credentials/yoyaku/passwords/$1.env ;;
    all) for s in google discogs anthropic cloudways cloudflare mcp-discogs google-workspace gmail discord contabo sftp; do yoyaku_load $s; done ;;
  esac
}
```

**Credential Files:** google.env (GOOGLE_API_KEY), discogs.env (DISCOGS_TOKEN), anthropic.env, cloudways.env, cloudflare.env (zone IDs), mcp-discogs.env, **google-workspace-admin.env** (Google Workspace API - groups/users/calendar/drive), **gmail-smtp.env** (Email sending via ben@yoyaku.fr), **discord.env** (Discord Bot API - server/channel management), woocommerce.env (WC_YYD_*, WC_YOYAKU_*), contabo.env, sftp.env (SFTP_YOYAKU_PASSWORD, SFTP_YYD_PASSWORD)

**Docs:** https://developers.cloudways.com/docs/ | https://api.cloudflare.com/ | https://api.contabo.com/ | https://mcp-discogs.yoyaku.fr

---

## 🔐 SSH & SERVER ACCESS

**Cloudways (134.122.80.6):**
```bash
User: master_crhmyfjcsf | Auth: ~/.ssh/cloudways_rsa | Alias: ssh yoyaku-cloudways (or: ssh yoyaku)
```

**SFTP (passwords in `~/.credentials/yoyaku/passwords/sftp.env`):**
- YYD.FR: yydistributiondev@134.122.80.6 (App: akrjekfvzk)
- YOYAKU.IO: yoyakudev@134.122.80.6 (App: jfnkmjmfer)
- ⚠️ Direct `scp` often fails - use SFTP interactive or two-step via /tmp

**GitHub SSH:** ~/.ssh/github_yoyaku (ED25519) | Test: `ssh -T git@github.com`

**Contabo (95.111.255.235):** Host: yoyaku-server | User: root | Purpose: MCP Discogs, N8N, PostgreSQL, bots (NOT legacy - parallel infra)

---

## ⚡ CLOUDWAYS QUICK REFERENCE (Session-tested 2025-11-12)

**PATHS (CRITICAL):**
```bash
# ✅ CORRECT
/home/870689.cloudwaysapps.com/jfnkmjmfer/public_html  # YOYAKU.IO
/home/870689.cloudwaysapps.com/akrjekfvzk/public_html  # YYD.FR
# ❌ WRONG
/home/master_crhmyfjcsf/applications/jfnkmjmfer/  # Does NOT exist!
```

**WP-CLI (always cd first):**
```bash
ssh yoyaku-cloudways "cd /home/870689.cloudwaysapps.com/jfnkmjmfer/public_html && wp post list --post_type=product"
ssh yoyaku-cloudways "cd /home/870689.cloudwaysapps.com/jfnkmjmfer/public_html && wp db query 'SELECT...'"
# ❌ Direct mysql fails (ERROR 1045)
```

**Deployment Methods (order of preference):**
1. **SFTP interactive** (best for plugins/themes):
```bash
source ~/.credentials/yoyaku/passwords/sftp.env
cat <<'SFTP_CMD' | sshpass -p "$SFTP_YOYAKU_PASSWORD" sftp yoyakudev@134.122.80.6
cd public_html/wp-content/plugins/my-plugin
put /local/file.php
quit
SFTP_CMD
```
2. **Two-step via /tmp** (best for single files): Upload to /tmp via SFTP → Copy via SSH
3. **Direct SCP** (often fails with Permission denied)

**Limitations:**
- ❌ Sudo requires interactive terminal
- ❌ REST API ignores `post_author=0` images → Use WP-CLI or `/wp-json/yoyaku/v2/media/search`

**Mental Model:**
```
Master SSH (master_crhmyfjcsf): Read/execute/copy | Cannot: Write 644, sudo, mysql
SFTP (yoyakudev, yydistributiondev): Write 644 | Cannot: SSH commands
```

---

## 🔄 PRODUCTION-TO-GIT SYNC (Automated)
**Philosophy:** Production = source of truth. Sync production → Local → Git after hotfixes/drift.

**Triggers:** Drift detection, emergency hotfixes, team push without Git, before new work

**Scripts:**
```bash
# Themes
~/yoyaku-team-config/tools/01-core/sync-theme-from-production.sh {yoyaku|yyd} [--force]
# Plugins/themes (universal)
~/yoyaku-team-config/tools/01-core/sync-from-production.sh {yoyaku|yyd|ysc|yio|yid|yofr} [--dry-run]
```

**8-Step Workflow:** Git check → Local backup → Connection test → Diff analysis → Confirmation → rsync → Git commit `[SYNC FROM PROD]` → Push

**Commit Format:**
```
[SYNC FROM PROD] Production sync YYYY-MM-DD - Resolved drift (N files)
- Synced from production [SITE] ([APP_ID])
- Source: /home/870689.cloudwaysapps.com/[APP_ID]/public_html/...
- Files synced: [COUNT]
Author: Benjamin Belaga
```

**Verification:** `git log -1 --oneline` | `cat .last-sync.json` | Check backup: `~/Desktop/issues/sync-backups/`

**AI Behavior:** ALWAYS check drift → STOP if detected → Sync → Verify → Continue

---

## 🌐 INFRASTRUCTURE MAP
**Cloudways (134.122.80.6):** WordPress/WooCommerce (revenue-critical) | DigitalOcean | YOYAKU.IO + YYD.FR
**Contabo (95.111.255.235):** MCP Discogs, PostgreSQL, N8N, bots (active parallel infra, NOT legacy)
**Vercel:** Static/JAMstack, Next.js (Git-based)

---

## 📧 EMAIL SENDING (Automatic Workflow)
**Setup:** Gmail SMTP via `ben@yoyaku.fr` | App password auth | Auto-send enabled

### 🚀 AUTO-SEND RULES (2025-11-20)

**Triggers:** "envoie email", "mail à", "notifie par email", "écris un email"
**Action:** SEND IMMEDIATELY without asking confirmation

**User specifies recipients:** User will ALWAYS provide explicit email addresses
- Example: "mail à seb@yoyaku.fr et didier@yoyaku.fr"
- Example: "envoie à ben@yoyaku.fr"
- NO aliases - Direct emails only

**Script:** `~/tools/send-email-yoyaku.sh -t "email@domain.com" -s "Subject" -b "Body"`
**Credentials:** `~/.credentials/yoyaku/api-keys/gmail-smtp.env`
**Full Workflow:** `~/.claude/EMAIL-AUTO-WORKFLOW.md` ⭐

### 📋 Email Types
**Ops notifications:** YOYAKU.IO/YYD.FR operations | French, pedagogical, structured
**Dev/Tech:** Discord logs (no email unless explicitly requested)
**Incidents:** 🚨 tag for urgent issues

**Example:**
```bash
User: "mail à seb@yoyaku.fr et didier@yoyaku.fr un recap"
AI: [Creates content] → Sends immediately → Confirms
```

---

## 📚 REFERENCE DOCS
**YOYAKU Product Data:** https://github.com/benjaminbelaga/yoyaku-theme/blob/master/docs/REFERENCE-YOYAKU-PRODUCT-DATA-COMPLETE.md (check before schema mods)
**Cron Jobs:** Use `scheduler-on-website` repo | CRON-REGISTRY.md | NEVER standalone crons

---

## 🗂️ GITHUB REPOSITORIES

| Type | Repo | Location | Purpose |
|------|------|----------|---------|
| **Workspace Docs** | `benjaminbelaga/claude-code` | `/Users/yoyaku/claude-code/` | CLAUDE.md, workspace config |
| **Team Tools** | `benjaminbelaga/yoyaku-team-config` | `~/yoyaku-team-config/` | Deploy scripts, workflows |
| **Plugins** | `ysc`, `yio`, `yid`, `yofr` | `~/repos/{ysc,yio,yofr}/`, `~/work/yid-translation/` | Plugin code |
| **WP Plugins** | `yoyaku-api-connector`, `google-apps-script-yoyaku` | `/tmp/yoyaku-api-connector/`, `~/repos/google-apps-script-yoyaku/` | Specialized |
| **Webmaster** | `webmaster-woo-tools` | `~/Git/webmaster-woo-tools/` | Order tracking, SAV tools |

**Incident 2025-10-26:** CLAUDE.md pushed to `ysc` → Fixed: Separate claude-code repo

---

## ⚡ SLASH COMMANDS & AUTO-WORKFLOWS

**Location:** `~/.claude/commands/` | **Triggers:** `~/.claude/AUTO-TRIGGER-PATTERNS.md`

| Command | Trigger | Workflow |
|---------|---------|----------|
| `/drift-check` | "deploy", "sync" | Check versions → Report drift → Suggest /sync-prod |
| `/deploy-yoyaku` | "deploy", "mettre en ligne" | Drift → Backup → SFTP → 3-layer cache → Verify |
| `/sync-prod` | "drift detected", "hotfix" | Backup → Download → Commit → Report |
| `/purge-cf` | "cache", "old version" | API/assets/everything patterns |
| `/test-plugin` | "test", "validate" | Detect project → Find ATP config → Execute |

**AI Decision Trees:**
- "deploy" → Check /drift-check → If drift: BLOCK + /sync-prod → Else: /deploy-yoyaku
- SessionStart in project → Auto-load creds → /drift-check → Show ATP/commands
- Edit file → PreDeploy: drift check → PostEdit: syntax + ATP

---

## 🎯 CLAUDE CODE SKILLS (v2.0)
**Location:** `~/.claude/skills/` | **Total:** 7 skills (2559 lines)

| Skill | Purpose | Triggers |
|-------|---------|----------|
| `yoyaku-woo-skill` | WooCommerce, 500+ custom fields | "order", "product", "SKU" |
| `yoyaku-b2c-b2b-skill` ⭐ | B2C vs B2B differences | "YOYAKU.IO", "YYD.FR", "pre-order" |
| `yoyaku-cloudways-skill` | Deployment patterns | "deploy", "SSH", "SFTP" |
| `yoyaku-contabo-skill` ⭐ | Contabo VPS automation | "N8N", "MCP", "bot" |
| `yoyaku-plugins-skill` ⭐ | WP plugins (YSC/YIO/YID/YOFR) | "plugin", "REST API" |
| `yoyaku-gas-skill` | Google Apps Script | "Sheets", "import" |
| `yoyaku-webmaster-skill` | Ops tools (webmaster team) | "tracking", "SAV" |

**B2C vs B2B (CRITICAL):**
| Aspect | YOYAKU.IO (B2C) | YYD.FR (B2B) |
|--------|-----------------|--------------|
| Domain | yoyaku.io | yydistribution.fr |
| App ID | jfnkmjmfer | akrjekfvzk |
| Date Field | `_pre_order_date` | `_release_date` |
| Sheet | "852 - YOYAKU.IO" | "YYD - Import NEW" |
| Import Fn | `importNewProductsToYoyakuAPI()` | `importNewProductsYYDToWooCommerceAPI()` |
| Pricing | Retail (higher) | Wholesale (lower) |

**Manual:** `/skill yoyaku-b2c-b2b-skill` | **Auto:** Context detection
**Reference:** `~/.claude/skills/README.md` | `~/.claude/skills/QUICK-REFERENCE.md`

---

## 🪝 HOOKS SYSTEM (v2.0.45+)
**Location:** `~/.claude/hooks/` | **Config:** `~/.claude/settings.json`

| Hook | Purpose | Implementation |
|------|---------|----------------|
| **SessionStart** | Load credentials, check connectivity, display context | `session-start.sh` |
| **Stop** | Archive transcripts, generate metrics, Discord notifications | `stop.sh` |
| **SubagentStart** | Track agent launches for performance metrics | `subagent-start.sh` |
| **SubagentStop** | Track completions, generate daily stats | `subagent-stop.sh` |
| **Notification** | Discord alerts for idle >5min, errors, warnings | `notification.sh` |
| **PermissionRequest** ⭐ | Auto-approve safe patterns, deny dangerous ones | `permission-request.sh` |
| **PreToolUse** | Drift check before Edit/Write operations | `pre-deploy-drift-check.sh` |
| **PostToolUse** | Syntax validation after Edit/Write | `post-edit-verify.sh` |

**PermissionRequest Auto-Approve Patterns:**
- SSH/SFTP to yoyaku-cloudways, yoyaku-server
- Cloudflare cache purge operations
- Drift-check, sync-from-production scripts
- WP-CLI safe commands (cache, list, get)
- Git read-only operations (status, log, diff)
- Scripts from `/Users/yoyaku/tools/`

**Auto-Deny Patterns:**
- `rm -rf /` or `~` (destructive)
- `DROP TABLE`, `TRUNCATE` (database)
- `chmod 777` (insecure permissions)
- `git push --force` (requires explicit approval)

**Metrics Tracking:**
- Session archives: `~/.claude/session-archives/YYYYMMDD-HHMMSS.json`
- Agent logs: `~/.claude/agent-logs/agents-YYYY-MM-DD.jsonl`
- Daily stats: `~/.claude/agent-logs/stats-YYYY-MM-DD.json`

**Discord Notifications:** Configured via `~/.credentials/yoyaku/api-keys/discord.env` → `DISCORD_WEBHOOK_MONITORING`

---

## 🎓 LESSONS LEARNED

**Data Processing:**
1. Verify parsing BEFORE insertion (XML/API parsing if DB empty)
2. Missing data = missing parsing
3. Nested XML tags ≠ attributes

**Deployment & Caching (CRITICAL):**
4. **3-layer cache:** WP (`wp cache flush`) → Breeze (`wp breeze purge`) → **Cloudflare** (`cloudflare-purge-cache.sh` - NEVER skip!)
5. **CF purge mandatory:** Users see stale 10-30min without | Incidents Oct 18 (CSS), Oct 19 (API 31d cache)
6. **Deploy order:** Code → wp cache → breeze → cloudflare

**File Permissions:**
7. SFTP bypasses 644 restrictions (direct ownership) | SSH master limited (read-only)
8. Bidirectional sync prevents code loss | Drift detection before deploy

**Operations:**
9. Never standalone crons (use scheduler-on-website)
10. **Performance:** Load <4.0 (abort >5.0), MySQL <30%, Orders >20k/sec

**Cloudways (2025-11-12):**
11. ALWAYS consult CLOUDWAYS QUICK REFERENCE before SSH/SFTP/WP-CLI
12. REST API ignores `post_author=0` images → Use WP-CLI or custom endpoint

**Version Drift (MANDATORY):**
13. ALWAYS check local vs production BEFORE plugin/theme ops
14. **Pattern:** `LOCAL_VERSION=$(grep "Version:" ...)` vs `PROD_VERSION=$(ssh...)`
15. **If drift:** STOP → Report → Backup → Sync → Commit → Resume
16. **Scenarios:** Hotfixes, team push without Git, multi-dev

**Cloudflare API Authentication (2025-11-19):**
17. **Bearer tokens fail** with "Authentication error" (expired/permissions)
18. **Use Global API Key instead:** `X-Auth-Email` + `X-Auth-Key` headers
19. **Working pattern:**
```bash
source ~/.credentials/yoyaku/api-keys/cloudflare.env
curl -X POST "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_YOYAKU/purge_cache" \
  -H "X-Auth-Email: $CLOUDFLARE_EMAIL" \
  -H "X-Auth-Key: $CLOUDFLARE_API_KEY" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything":true}'
```
20. **Script updated:** `cloudflare-purge-cache.sh` now uses API Key (100% reliable)

**Contabo Backup System (2025-11-20):**
21. **Backup self-protection:** Scripts refuse to run if disk >80% (prevents server crash)
22. **Backup D+ Strategy:** Rsync with hardlinks (like TimeMachine) = 86% space savings
23. **Working pattern:**
```bash
# Hardlinks: Old files = 0 space, only new files copied
rsync -avh --link-dest=../yesterday/uploads current/uploads/
# YOYAKU: 15G base + 500MB/day × 6 = 18G total (vs 105G before)
# YYD: 6G base + 200MB/day × 6 = 7.2G total (vs 40G before)
```
24. **Monitoring deduplication:** 1 alert/day/type max (prevents 465 duplicate emails)
25. **Disk management:** Alert at 75%, block backups at 80%, critical at 90%

**Contabo Monitoring & Logs (2025-11-20):**
26. **Bash variable scope:** `local` only works inside functions (daily-digest.sh empty counters)
27. **Email digest parsing:** `grep "Subject:"` shows full line → Use `sed 's/^Subject: //'` to extract
28. **Log cleanup strategy:** PostgreSQL logs (.3.gz+ = 1.3G), truncate active logs >10MB to 10k lines
29. **Disk monitoring:** Proactive alerts at 75% (planning), 80% (blocks backups), 90% (emergency)
30. **Log rotation targets:** Keep .1 and .2 (recent), delete .3+ (old), .gz >30 days auto-delete

**Contabo Docker Optimization (2025-11-21):**
31. **Docker build cache:** Can grow to 25+ GB unnoticed → Prune regularly with `docker builder prune -af`
32. **Dangling images:** `<none>` tags = obsolete layers from failed builds → Safe to remove with `docker image prune -f`
33. **Docker cleanup safety:** ALWAYS verify running containers before/after cleanup → `docker ps` verification mandatory
34. **Docker space recovery:** Build cache + dangling images = 30-35 GB typical recovery on active dev servers
35. **Container preservation:** Running containers and their images NEVER touched by safe cleanup (prune -f only stopped/unused)
36. **Docker monitoring:** Check `docker system df -v` regularly → Shows reclaimable space per resource type

**Why:** Prevents overwrite, correct base, avoids lost work, Git accuracy, disk safety, email spam prevention, proactive monitoring, Docker efficiency

---

## 🔄 QUICK REFERENCE
**Scripts:** `~/yoyaku-team-config/tools/01-core/`

```bash
# Deploy
deploy-with-backup.sh {yoyaku|yyd}
# Drift
check-theme-drift.sh yoyaku
# Sync
sync-theme-from-production.sh yoyaku [--force]
sync-from-production.sh {yoyaku|yyd|ysc|yio|yid|yofr} [--dry-run]
# Cloudflare
cloudflare-purge-cache.sh yoyaku {api|assets|everything}
# Debug
debug-assist.sh yoyaku 1 "issue"
# SSH
ssh yoyaku-cloudways  # E-commerce
ssh yoyaku-server     # Automation
# Git
git add [files] && git commit -m "Message - Benjamin Belaga" && git push origin main
```

---

## 📝 AI AGENT NOTES

**🚨 MANDATORY POST-INTERVENTION LOGGING (ALL CHANGES):**

**CRITICAL RULE:** À chaque modification sur YYD.FR (B2B) ou YOYAKU.IO (B2C), tu DOIS documenter dans les repos de logs **AVANT** de terminer la session.

**Scope:** Theme, Plugin, Config, Webhook, Cron, Database, Infrastructure - **TOUT changement technique**

**Workflow obligatoire:**
1. **Intervention** : Effectuer la modification (code/config/deployment)
2. **Test** : Vérifier en production
3. **Document** : Créer le log détaillé (template: `~/repos/logs-{site}/templates/intervention-template.md`)
4. **Commit** : Push dans le repo GitHub approprié
5. **Update CHANGELOG** : Ajouter l'entrée en haut de CHANGELOG.md

**Why:** Les problèmes sont souvent interconnectés. Sans logs, impossible de tracer l'origine des bugs récurrents.

**Repos:**
- YYD.FR (B2B): `~/repos/logs-yydistribution-fr/` → https://github.com/benjaminbelaga/logs-yydistribution-fr
- YOYAKU.IO (B2C): `~/repos/logs-yoyaku-io/` → https://github.com/benjaminbelaga/logs-yoyaku-io

**Template structure:** Contexte → Root Cause → Solution → Tests → Deployment → Rollback → Lessons Learned

**AI Behavior:** NEVER terminate a session with code changes without creating the log entry.

---

**🚨 MANDATORY PRE-ACTION (Cloudways ops):**
1. READ "CLOUDWAYS QUICK REFERENCE" (line 285)
2. VERIFY path: `/home/870689.cloudwaysapps.com/[APP_ID]/public_html`
3. CONFIRM app ID: `jfnkmjmfer` (YOYAKU) or `akrjekfvzk` (YYD)
4. USE session-tested patterns (NOT guessing)

**❌ NEVER:** `/home/master_crhmyfjcsf/applications/`, `/home/master/applications/`, relative paths
**✅ ALWAYS:** Full Cloudways paths above

**Communication:** French (user) / English (code) | Professional, pedagogical
**Security:** Local creds OK, never modify prod without clone-dev, zero downtime, backup first
**Infrastructure:** Cloudways (critical) | Contabo (active parallel) | Vercel (frontend)

**Workflows:**
- Cron: scheduler-on-website repo
- **Drift:** ALWAYS check local vs prod BEFORE plugin/theme ops
- Deploy: Check drift → Sync if needed → Deploy
- Cache: NEVER skip Cloudflare
- Email: Webmaster ops only | Dev: Discord
- **Git:** ALWAYS push after commits

**Task Management:**
- **TodoWrite:** 3-15 items, single session, solo
- **Linear:** 20+ tasks, multi-sprint, Yoann collab, long-term
- **Auto-suggest Linear:** "grosse mission" / "big project" / "tasks pour Yoann"
- **Setup:** `~/tools/08-linear/` | MCP integration | Onboarding: START-HERE.md → dev@yoyaku.fr

**Code:** Check existing before creating | Archive obsolete | French → English | Benjamin Belaga author
**Performance:** Load <4.0 (abort >5.0) | MySQL <30% | Orders >20k/sec | Abort if >10% degradation

**Mental Model:** User (FR) → Agent (FR) → Code (EN) → Deploy (drift+test) → Cache (WP+Breeze+CF!) → **Document (logs repo!)** → Email (ops pedagogical)

**Decision Tree:**
- Code change? → Document in logs
- Config change? → Document in logs
- Plugin/theme update? → Document in logs
- Webhook/cron modification? → Document in logs
- Database query executed? → Document in logs
- **NO exceptions** - even "small" changes get logged

---

## 🗂️ DESKTOP FILE MANAGEMENT

**CRITICAL:** NEVER create temp/analysis files directly on Desktop!

**🚫 BANNED:** Reports/logs (*.txt/log/md), temp JSON/CSV, configs, "COMPLETE"/"REPORT" files, unorganized folders
**Exception:** User EXPLICITLY requests "save to Desktop"

**✅ CORRECT:**
1. **Analysis/reports:** `~/repos/[project]/{analysis,reports,logs}/` or `~/work/current-session/`
2. **Temp files:** `/tmp/[name]/` or `~/Downloads/temp-[date]/`
3. **Screenshots:** `~/Desktop/07-Screenshots/[year-month]/`
4. **Configs:** `~/.config/[service]/` or `~/.credentials/yoyaku/`

**Desktop Structure (2025-11-14):**
```
01-YYD-Gmail-Recovery → Invoice recovery
02-Contabo-Infrastructure → Server config
03-GoogleAppsScript-Archives → Obsolete GAS
04-Monitoring-Audits → System audits
05-WP-Import-Project → Import tools
06-API-Connector-Backups → Plugin backups
07-Screenshots → Organize by month
08-GitHub-Achievements → Stats
09-VPN-Data → VPN configs
10-Claude-TODOs → TODO archives
11-Issues → Issue tracking
12-Temp-Files → Short-term only
```

**AI Workflow:**
1. Deliverable? → Ask user where | Analysis? → Project dir or /tmp
2. User-requested? → Ask | Auto-analysis? → /tmp or project
3. **Monthly cleanup (1st):** Archive completed, clear Temp-Files >30d, organize screenshots

**Performance Rule:** Max 15 files/folders on Desktop root | Warn at 10+ | Auto-trigger org at 15+
**Why:** macOS performance, cognitive load, navigation, professional appearance

---

**Version:** 5.5.1 | **Philosophy:** Local secure, credentials OK, pragmatic
**Team:** Webmaster team (see internal directory), 3 separate devs, Yoann (external)
🔒 Local-only, never public

**Special Notes:**
- Never AI attribution → Benjamin Belaga only
- discogs.yoyaku.io → Contabo (95.111.255.235) /opt/discogs-dashboard/ (port 8003, systemd)
- yydistribution.fr → Production YYD.FR (B2B) | yyd.fr → OLD (199.59.243.228) DO NOT USE
- Cloudways apps: jfnkmjmfer (YOYAKU.IO), akrjekfvzk (YYD.FR)
