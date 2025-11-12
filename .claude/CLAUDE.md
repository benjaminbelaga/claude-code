# BENJAMIN BELAGA - GLOBAL USER MEMORY
# Private instructions across all projects
# Last Updated: 2025-11-12
# Version: 5.2.0 - Added mandatory version drift detection workflow

---

## 👤 IDENTITY & CONTEXT

**Real Name:** Benjamin Belaga (owner/developer)
**GitHub:** `benjaminbelaga`
**System Username:** `yoyaku` (macOS account - legacy, DO NOT rename)
**Primary Email:** ben@yoyaku.fr (Google Workspace)

### Team Structure

**Webmasters (Ops/Support/Client Management):**
- leopold@yoyaku.fr
- seb@yoyaku.fr
- nizar@yoyaku.fr

**Tech Team (3 Developers):**
- Separate team
- GitHub access for documentation
- NOT leopold/seb/nizar (they are webmasters, not devs)

### Repository Separation (CRITICAL - Remember This!)

**IMPORTANT:** Tools are separated by target audience:

**For Webmasters (Operations, SAV, Client Support):**
- **Repository:** `benjaminbelaga/webmaster-woo-tools`
- **Location:** `~/Git/webmaster-woo-tools/`
- **Users:** leopold, seb, nizar
- **Aliases:** `w*` prefix (wtrack, whelp, wcloud)
- **Purpose:** Order management, client support, shipping, product updates
- **Examples:** Find order by tracking, UPS labels, customer service tools

**For Developers (Code, Infrastructure, Technical):**
- **Repository:** `benjaminbelaga/yoyaku-team-config`
- **Location:** `~/yoyaku-team-config/`
- **Users:** Tech team (3 developers)
- **Aliases:** `y*` prefix (ydeploy, ysync, ylock)
- **Purpose:** Development tools, deployment, infrastructure, technical docs
- **Examples:** Theme deployment, Git workflows, server management

**Decision Rule for AI Agent:**
```
User asks about:
├─ Orders, tracking, customers, SAV, shipping
│  └─> Use webmaster-woo-tools (w* commands)
│
├─ Code, deployment, infrastructure, technical
│  └─> Use yoyaku-team-config (y* commands)
│
└─ Unsure?
   └─> Ask: "Is this for webmasters (operations) or developers (technical)?"
```

**Why This Matters:**
- Webmasters don't need dev tools (confusing)
- Developers don't need SAV tools (not their job)
- Clear separation = better UX for both teams

**Remember:** If user asks for tracking/order tools → webmaster-woo-tools!

### AI Note

"yoyaku" has TWO meanings:
1. `/Users/yoyaku/` = macOS username (technical)
2. YOYAKU.IO = The business/project

**Git commits:** Reference "Benjamin Belaga" as author

**CRITICAL - NO AI ATTRIBUTION:**
- ❌ NEVER write "Generated with Claude Code" in ANY output
- ❌ NEVER write "Co-Authored-By: Claude <noreply@anthropic.com>"
- ❌ NEVER write "(via Claude Code)" in reports, commits, or documentation
- ✅ ALWAYS attribute to "Benjamin Belaga" ONLY
- ✅ Code, commits, reports = Benjamin Belaga's work (AI is a tool, not author)

**PROACTIVE CLEANING (MANDATORY BEFORE GIT OPERATIONS):**
- 🔍 ALWAYS scan files before `git commit` or `git push`
- 🧹 AUTO-REMOVE any AI attribution found
- 📝 Commands to run before every commit:
  ```bash
  # Scan staged files for AI attribution
  git diff --cached | grep -E "(Generated with|Co-Authored-By.*Claude|via Claude Code)"

  # If found, clean ALL staged files:
  git diff --cached --name-only | xargs sed -i '' 's/Generated with \[Claude Code\].*//g'
  git diff --cached --name-only | xargs sed -i '' 's/Co-Authored-By: Claude.*//g'
  git diff --cached --name-only | xargs sed -i '' 's/ (via Claude Code)//g'
  ```
- ⚠️ If AI attribution detected → STOP → Clean → Re-stage → Then commit

---

## 🌍 LANGUAGE POLICY - MANDATORY

**User Communication:** 🇫🇷 French (natural conversation)
**ALL Technical Content:** 🇬🇧 English (code, docs, commits, logs, UI)

**Why:** International team, professional standards, scalability, AI compatibility

**Exception:** Only write French if explicitly requested

---

## 🔑 API CREDENTIALS & TOKENS

**📍 All credentials stored in:** `~/.credentials/yoyaku/`

**📋 Quick Index:** `~/.credentials/CREDENTIALS-INDEX.md` (complete reference)

### 🔐 Credentials Encryption for Team Sharing

**User says:** "Encrypte les credentials" or "Encrypt credentials for team"

**AI Agent action (ONE command):**
```bash
~/.credentials/encrypt-credentials-for-team.sh
```

**Or with alias:**
```bash
yencrypt  # After shell reload
```

**What it does (automated, ~10 seconds):**
- ✅ Loads password from `~/.credentials/yoyaku/passwords/team-encryption.key`
- ✅ Archives entire `~/.credentials/` directory
- ✅ Encrypts with AES-256-CBC + PBKDF2
- ✅ Generates decryption instructions
- ✅ Creates sharing summary with email template
- ✅ Outputs to `~/Desktop/credentials-team-encrypted.tar.gz.enc`

**Current password stored:**
- Location: `~/.credentials/yoyaku/passwords/team-encryption.key` (chmod 600)
- Backup: 1Password "YOYAKU Team Credentials Encryption Password"
- Preview: bGCJ...ahgw (32 chars)

**After encryption:**
1. Upload `~/Desktop/credentials-team-encrypted.tar.gz.enc` to Dropbox/Drive
2. Share 1Password item with new dev
3. Send email (template in `~/Desktop/SHARING-SUMMARY-*.md`)

**📖 Full protocol:** `~/.credentials/PROTOCOL-ENCRYPTION.md`

### Dynamic Loading Pattern

```bash
# Load single service
source ~/.credentials/yoyaku/api-keys/cloudflare.env
echo "Token: ${CLOUDFLARE_API_TOKEN:0:10}..." # Use securely

# Universal loader (add to ~/.bashrc or scripts)
yoyaku_load() {
    case "$1" in
        google) source ~/.credentials/yoyaku/api-keys/google.env ;;
        discogs) source ~/.credentials/yoyaku/api-keys/discogs.env ;;
        anthropic) source ~/.credentials/yoyaku/api-keys/anthropic.env ;;
        cloudways) source ~/.credentials/yoyaku/api-keys/cloudways.env ;;
        cloudflare) source ~/.credentials/yoyaku/api-keys/cloudflare.env ;;
        mcp-discogs) source ~/.credentials/yoyaku/api-keys/mcp-discogs.env ;;
        contabo) source ~/.credentials/yoyaku/passwords/contabo.env ;;
        sftp) source ~/.credentials/yoyaku/passwords/sftp.env ;;
        all)
            for svc in google discogs anthropic cloudways cloudflare mcp-discogs contabo sftp; do
                yoyaku_load $svc
            done
            ;;
    esac
}

# Usage in scripts
yoyaku_load cloudflare  # Load what you need
yoyaku_load sftp        # Load SFTP passwords
yoyaku_load all         # Load everything
```

### Credential Locations

| Service | Vault File | Variables |
|---------|-----------|-----------|
| **Google API** | `api-keys/google.env` | `GOOGLE_API_KEY` |
| **Discogs API** | `api-keys/discogs.env` | `DISCOGS_TOKEN`, `DISCOGS_USER_AGENT` |
| **Anthropic API** | `api-keys/anthropic.env` | `ANTHROPIC_API_KEY` |
| **Cloudways API** | `api-keys/cloudways.env` | `CLOUDWAYS_API_SECRET`, `CLOUDWAYS_EMAIL` |
| **Cloudflare API** | `api-keys/cloudflare.env` | `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, zone IDs |
| **MCP Discogs** | `api-keys/mcp-discogs.env` | `MCP_DISCOGS_URL`, `MCP_DISCOGS_TOKEN`, paths |
| **WooCommerce API** | `api-keys/woocommerce.env` | `WC_YYD_*`, `WC_YOYAKU_*` (consumer keys/secrets) |
| **Contabo VPS** | `passwords/contabo.env` | `CONTABO_CLIENT_ID`, `CONTABO_CLIENT_SECRET`, etc. |
| **SFTP Passwords** | `passwords/sftp.env` | `SFTP_YOYAKU_PASSWORD`, `SFTP_YYD_PASSWORD` |

**Documentation Links:**
- Cloudways API: https://developers.cloudways.com/docs/
- Cloudflare API: https://api.cloudflare.com/
- Contabo API: https://api.contabo.com/
- MCP Discogs: https://mcp-discogs.yoyaku.fr
- WooCommerce API: https://woocommerce.github.io/woocommerce-rest-api-docs/

---

## 🔐 SSH & SERVER ACCESS

### PRIMARY CLOUDWAYS: 134.122.80.6

**Master SSH:**
```bash
User: master_crhmyfjcsf
Auth: ~/.ssh/cloudways_rsa
Alias: ssh yoyaku-cloudways (or: ssh yoyaku, ssh y)
```

**SFTP Access:**

**Passwords:** `~/.credentials/yoyaku/passwords/sftp.env`

**⚠️ WARNING:** Direct `scp` often fails with "Permission denied" - See "CLOUDWAYS QUICK REFERENCE" section for reliable deployment methods.

```bash
# Load SFTP passwords
source ~/.credentials/yoyaku/passwords/sftp.env

# Basic syntax (may fail with Permission denied - use SFTP interactive instead)
# YYD.FR (B2B)
sshpass -p "$SFTP_YYD_PASSWORD" scp file.php \
  yydistributiondev@134.122.80.6:public_html/...

# YOYAKU.IO (B2C)
sshpass -p "$SFTP_YOYAKU_PASSWORD" scp file.php \
  yoyakudev@134.122.80.6:public_html/...
```

**SFTP Details:**
- **YYD.FR**: `yydistributiondev@134.122.80.6` (App: akrjekfvzk)
- **YOYAKU.IO**: `yoyakudev@134.122.80.6` (App: jfnkmjmfer)

**GitHub SSH Access:**
```bash
Host: github.com
User: git
Auth: ~/.ssh/github_yoyaku (ED25519)
Config: ~/.ssh/config (configured 2025-10-31)

# Test connection
ssh -T git@github.com

# Expected: "Hi benjaminbelaga! You've successfully authenticated"
```

**Contabo (95.111.255.235) - Automation Stack:**
```bash
Host: yoyaku-server
User: root
Auth: SSH Key
Purpose: Bots, N8N, MCP servers (NOT legacy - parallel infra)

# Quick connect
ssh yoyaku-server

# Projects hosted:
- MCP Discogs Electronic (/opt/mcp-discogs-electronic)
- PostgreSQL database for Discogs catalog
- N8N workflows and automation bots
- Specialized scripts and cron jobs
```

**Credentials:** `~/.credentials/yoyaku/api-keys/mcp-discogs.env`
```bash
# Load MCP Discogs credentials
source ~/.credentials/yoyaku/api-keys/mcp-discogs.env

# Access MCP Discogs API
curl -X GET "$MCP_DISCOGS_URL/api/endpoint" \
  -H "Authorization: Bearer $MCP_DISCOGS_TOKEN"

# View logs
ssh yoyaku-server "tail -f $MCP_DISCOGS_LOGS"
```

---

## ⚡ CLOUDWAYS QUICK REFERENCE (Session-tested 2025-11-12)

**CRITICAL: Application paths - ALWAYS use these patterns**

### Correct Paths
```bash
# ✅ YOYAKU.IO (jfnkmjmfer)
/home/870689.cloudwaysapps.com/jfnkmjmfer/public_html

# ✅ YYD.FR (akrjekfvzk)
/home/870689.cloudwaysapps.com/akrjekfvzk/public_html

# ❌ WRONG (common mistake)
/home/master_crhmyfjcsf/applications/jfnkmjmfer/  # Does NOT exist!
```

### WP-CLI Usage
```bash
# ✅ CORRECT: Always cd first
ssh yoyaku-cloudways "cd /home/870689.cloudwaysapps.com/jfnkmjmfer/public_html && wp post list --post_type=product"

# ✅ Database queries (NO direct mysql access)
ssh yoyaku-cloudways "cd /home/870689.cloudwaysapps.com/jfnkmjmfer/public_html && wp db query 'SELECT * FROM wp_posts LIMIT 10'"

# ❌ WRONG: Direct mysql fails
ssh yoyaku-cloudways "mysql -e \"SELECT...\""
# ERROR 1045: Access denied (no password available)
```

### File Deployment (Order of preference)

**Method 1: SFTP interactiv (BEST for plugins/themes)**
```bash
source ~/.credentials/yoyaku/passwords/sftp.env

# YOYAKU.IO
cat <<'SFTP_CMD' | sshpass -p "$SFTP_YOYAKU_PASSWORD" sftp yoyakudev@134.122.80.6
cd public_html/wp-content/plugins/my-plugin
put /local/path/file.php
quit
SFTP_CMD

# YYD.FR
cat <<'SFTP_CMD' | sshpass -p "$SFTP_YYD_PASSWORD" sftp yydistributiondev@134.122.80.6
cd public_html/wp-content/plugins/my-plugin
put /local/path/file.php
quit
SFTP_CMD
```

**Method 2: Two-step via /tmp (BEST for single files)**
```bash
source ~/.credentials/yoyaku/passwords/sftp.env

# Step 1: Upload to /tmp via SFTP
sshpass -p "$SFTP_YOYAKU_PASSWORD" scp /local/file.php yoyakudev@134.122.80.6:/tmp/

# Step 2: Copy from /tmp to destination via SSH (master user has ownership)
ssh yoyaku-cloudways "cp /home/870689.cloudwaysapps.com/jfnkmjmfer/tmp/file.php /home/870689.cloudwaysapps.com/jfnkmjmfer/public_html/wp-content/plugins/my-plugin/"
```

**Method 3: Direct SCP (often fails with Permission denied)**
```bash
# ❌ Often fails
scp file.php yoyakudev@134.122.80.6:public_html/wp-content/plugins/
# scp: dest open: Permission denied
```

### Sudo Limitations
```bash
# ❌ WRONG: Sudo requires interactive terminal
ssh yoyaku-cloudways "sudo cp /source /dest"
# sudo: a terminal is required to read the password

# ✅ CORRECT: No sudo needed (master_crhmyfjcsf has ownership)
ssh yoyaku-cloudways "cp /source /dest"
```

### WordPress REST API Limitations

**Problem: Images with `post_author=0` are invisible to REST API search**
```bash
# ❌ REST API ?search= ignores post_author=0
curl "https://www.yoyaku.io/wp-json/wp/v2/media?search=200050"
# Returns: [] (empty)

# ✅ WP-CLI finds ALL images
ssh yoyaku-cloudways "cd /home/870689.cloudwaysapps.com/jfnkmjmfer/public_html && wp post list --post_type=attachment --s=200050"
# Returns: IDs 629576, 629577 ✅
```

**Solution: Custom endpoint in yoyaku-api-connector plugin**
- Endpoint: `/wp-json/yoyaku/v2/media/search`
- Uses direct database queries (bypasses REST API filters)
- Finds ALL images including `post_author=0`
- Created: 2025-11-12 (class-media-search-endpoint.php)

### Quick Diagnostic Commands
```bash
# Find current working directory
ssh yoyaku-cloudways "pwd"
# Expected: /home/master

# List apps
ssh yoyaku-cloudways "ls -la /home/870689.cloudwaysapps.com/"
# Shows: jfnkmjmfer (YOYAKU), akrjekfvzk (YYD), ...

# Check WP installation
ssh yoyaku-cloudways "cd /home/870689.cloudwaysapps.com/jfnkmjmfer/public_html && wp core version"

# Search media (includes post_author=0)
ssh yoyaku-cloudways "cd /home/870689.cloudwaysapps.com/jfnkmjmfer/public_html && wp post list --post_type=attachment --s=SKU123"

# Get post details
ssh yoyaku-cloudways "cd /home/870689.cloudwaysapps.com/jfnkmjmfer/public_html && wp post get 12345 --format=json"
```

### Common Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `No such file or directory: /home/master_crhmyfjcsf/applications/` | Wrong path | Use `/home/870689.cloudwaysapps.com/[APP_ID]/` |
| `ERROR 1045: Access denied` | Direct mysql not available | Use `wp db query "SELECT..."` |
| `Permission denied` (SCP) | SFTP app user != master ownership | Use SFTP interactiv or two-step via /tmp |
| `sudo: terminal required` | Non-interactive SSH | Remove sudo (not needed) |
| REST API returns `[]` for images | `post_author=0` filtered out | Use WP-CLI or custom endpoint |

### Mental Model
```
Cloudways Infrastructure:
├─ Master SSH user: master_crhmyfjcsf
│  ├─ Can: Read, execute, copy files
│  ├─ Cannot: Write to 644 files, sudo, direct mysql
│  └─ Path: /home/870689.cloudwaysapps.com/
│
└─ SFTP App users: yoyakudev, yydistributiondev
   ├─ Can: Write to 644 files (direct ownership)
   ├─ Cannot: SSH commands
   └─ Path: public_html/ (relative to app root)
```

---

## 🌐 INFRASTRUCTURE MAP

**Cloudways (134.122.80.6):**
- Purpose: WordPress/WooCommerce (revenue-critical)
- Sites: YOYAKU.IO (yoyaku.io) + YYD.FR (yydistribution.fr)
- Provider: DigitalOcean via Cloudways

**Contabo (95.111.255.235):**
- Purpose: Automation, bots, N8N workflows, MCP servers
- Status: Active parallel infrastructure (NOT legacy!)
- Provider: Contabo
- **Active Projects:**
  - MCP Discogs Electronic (music catalog resolution)
  - PostgreSQL database (Discogs data)
  - N8N automation workflows
  - Discord bots and integrations

**Vercel:**
- Purpose: Static/JAMstack sites, Next.js apps
- Deployment: Git-based

---

## 📧 EMAIL NOTIFICATION POLICY

**Webmaster/Operations Issues:**
- YOYAKU.IO → leopold@yoyaku.fr, seb@yoyaku.fr, shop@yoyaku.fr, ben@yoyaku.fr
- YYD.FR → nizar@yoyaku.fr, ben@yoyaku.fr
- Method: WordPress email
- Format: Pedagogical (explain what, why, what was done)
- Language: French

**Development/Technical:**
- NOT via email
- Discord logs only
- Future: Post to Discogs platform

---

## 📚 REFERENCE DOCUMENTATION

**YOYAKU Product Data:**
- URL: https://github.com/benjaminbelaga/yoyaku-theme/blob/master/docs/REFERENCE-YOYAKU-PRODUCT-DATA-COMPLETE.md
- When: Discussing custom fields, taxonomies, product metadata
- Action: ALWAYS check before modifying schemas

**Cron Jobs:**
- ALL crons MUST integrate with `scheduler-on-website` repo (GitHub)
- Registry: CRON-REGISTRY.md (owner, schedule, command, rollout/rollback)
- NEVER create standalone cron jobs

---

## 🗂️ GITHUB REPOSITORY STRUCTURE

**CRITICAL: Workspace Docs vs Plugin Code (Avoid Confusion!)**

### Workspace Documentation
**Repository:** `benjaminbelaga/claude-code`
**Location:** `/Users/yoyaku/claude-code/`
**Contains:** CLAUDE.md, README.md, workspace configuration
**Push here:** Documentation updates, CLAUDE.md changes

### Team Configuration & Tools
**Repository:** `benjaminbelaga/yoyaku-team-config`
**Location:** `/Users/yoyaku/yoyaku-team-config/`
**Contains:** Deployment scripts, tools, workflows
**Tools:** `~/yoyaku-team-config/tools/01-core/` (cloudflare-purge, deploy, sync, debug)

### Plugin Code Repositories
**YSC:** `benjaminbelaga/ysc` → `/Users/yoyaku/repos/ysc/`
**YIO:** `benjaminbelaga/yio` → `/Users/yoyaku/repos/yio/`
**YID:** `benjaminbelaga/yid` → `/Users/yoyaku/work/yid-translation/`
**YOFR:** `benjaminbelaga/yofr` → `/Users/yoyaku/repos/yofr/`

### WordPress Plugins (Specialized)
**yoyaku-api-connector:** `benjaminbelaga/yoyaku-api-connector` → `/tmp/yoyaku-api-connector/` (clone on-demand)
**google-apps-script-yoyaku:** `benjaminbelaga/google-apps-script-yoyaku` → `/Users/yoyaku/repos/google-apps-script-yoyaku/`

### Webmaster Tools
**webmaster-woo-tools:** `benjaminbelaga/webmaster-woo-tools` → `/Users/yoyaku/Git/webmaster-woo-tools/`
**Purpose:** Order tracking, SAV, shipping tools for webmasters (leopold, seb, nizar)

**DO NOT:**
- ❌ Push CLAUDE.md to plugin repos (YSC, YIO, etc.)
- ❌ Push plugin code to claude-code repo
- ❌ Confuse workspace docs with plugin code

**Incident 2025-10-26:**
- CLAUDE.md was accidentally pushed to `ysc` plugin repo
- Root cause: Confusion between workspace docs and plugin code
- Fix: Created separate `claude-code` repo for workspace configuration
- Lesson: ALWAYS verify correct repo before pushing documentation

---

## 🎓 LESSONS LEARNED

### Data Processing
1. **Verify parsing BEFORE debugging insertion** (check XML/API parsing if DB empty)
2. **Missing data = missing parsing** (verify parsing logic first)
3. **Nested XML tags ≠ attributes** (different patterns)

### Deployment & Caching (CRITICAL)
4. **Three-layer cache - clear ALL:**
   - WordPress object cache (`wp cache flush`)
   - Breeze page cache (`wp breeze purge`)
   - **Cloudflare** (`cloudflare-purge-cache.sh` - NEVER skip!)

5. **Cloudflare purge is MANDATORY:**
   - Users see stale CSS/JS/API for 10-30 min without CF purge
   - Incident Oct 18: CSS invisible 10+ min
   - Incident Oct 19: API cached 31 days
   - Solution: ALWAYS purge after deployment

6. **Deployment order:**
   ```
   1. Deploy code
   2. wp cache flush
   3. wp breeze purge
   4. cloudflare-purge-cache.sh [site] [pattern]
   ```

### File Permissions
7. **SFTP bypasses permission restrictions:**
   - SSH master limited by 644 files (read-only)
   - SFTP app users have direct ownership (can write 644)
   - Use SFTP for production deployments

8. **Bidirectional sync prevents code loss:**
   - Production hotfixes MUST sync to local + Git
   - Drift detection before deploy
   - Use `sync-theme-from-production.sh` after hotfixes

### Operations
9. **Never standalone cron jobs** (use scheduler-on-website repo)
10. **Performance thresholds:**
    - Load avg <4.0 (ABORT if >5.0)
    - MySQL <30% memory
    - Order processing >20,000/sec

### Cloudways Operations (2025-11-12)
11. **ALWAYS consult "CLOUDWAYS QUICK REFERENCE" section FIRST:**
    - Before ANY SSH/SFTP command to Cloudways
    - Before WP-CLI operations
    - Before file deployments
    - Session-tested patterns prevent 5+ common errors

12. **WordPress REST API has limitations:**
    - Images with `post_author=0` invisible to `?search=` parameter
    - Use WP-CLI or custom endpoint `/wp-json/yoyaku/v2/media/search`
    - Incident 2025-11-12: 200050 SKU images not found via API

### Version Drift Detection (2025-11-12) - MANDATORY
13. **ALWAYS check version drift BEFORE any plugin/theme operation:**
    - Compare local vs production version numbers
    - Alert user if drift detected
    - Sync from production before modifications

14. **Automatic drift detection pattern:**
    ```bash
    # Example for yoyaku-api-connector
    LOCAL_VERSION=$(grep "Version:" /Users/yoyaku/repos/yoyaku-api-connector/yoyaku-api-connector.php | head -1)
    PROD_VERSION=$(ssh yoyaku-cloudways "grep 'Version:' /home/870689.cloudwaysapps.com/jfnkmjmfer/public_html/wp-content/plugins/yoyaku-api-connector/yoyaku-api-connector.php")

    # If different → ALERT + SYNC
    ```

15. **When drift detected:**
    - ⚠️ STOP current operation
    - 📊 Report: "Local vX.X.X vs Production vY.Y.Y - Drift detected"
    - 💾 Backup local version
    - ⬇️ Sync from production via SFTP
    - ✅ Commit synced version to Git
    - ▶️ Resume operation with correct base

16. **Common drift scenarios:**
    - Production hotfixes deployed directly (emergency fixes)
    - Team member pushed to production without Git commit
    - Multiple developers working on same plugin
    - Solution: Sync first, then modify

**Why this matters:**
- Prevents overwriting production hotfixes
- Ensures modifications start from correct base
- Avoids "lost work" incidents
- Maintains Git history accuracy

---

## 🔄 QUICK REFERENCE

**NOTE:** All scripts in `~/yoyaku-team-config/tools/01-core/`

**Deploy:**
```bash
# Themes/plugins deployment with backup
~/yoyaku-team-config/tools/01-core/deploy-with-backup.sh yoyaku
~/yoyaku-team-config/tools/01-core/deploy-with-backup.sh yyd
```

**Check drift:**
```bash
~/yoyaku-team-config/tools/01-core/check-theme-drift.sh yoyaku
```

**Sync production:**
```bash
~/yoyaku-team-config/tools/01-core/sync-theme-from-production.sh yoyaku
~/yoyaku-team-config/tools/01-core/sync-from-production.sh yyd
```

**Purge Cloudflare:**
```bash
~/yoyaku-team-config/tools/01-core/cloudflare-purge-cache.sh yoyaku api        # After API changes
~/yoyaku-team-config/tools/01-core/cloudflare-purge-cache.sh yoyaku assets     # After CSS/JS
~/yoyaku-team-config/tools/01-core/cloudflare-purge-cache.sh yoyaku everything # Full purge
```

**Debug:**
```bash
~/yoyaku-team-config/tools/01-core/debug-assist.sh yoyaku 1 "issue-description"
```

**Server access:**
```bash
ssh yoyaku-cloudways   # E-commerce (Cloudways)
ssh yoyaku-server      # Automation (Contabo)
```

**Git workflow:**
```bash
# After modifications, always:
git add [files]
git commit -m "Clear message - Benjamin Belaga"
git push origin main    # Direct push (trusted)
```

---

## 📝 NOTES FOR AI AGENTS

**🚨 MANDATORY PRE-ACTION CHECKS (NEVER SKIP!):**

Before ANY Cloudways operation (SSH/SFTP/WP-CLI/rsync):
1. ✅ READ "⚡ CLOUDWAYS QUICK REFERENCE" section (line 285)
2. ✅ VERIFY path pattern: `/home/870689.cloudwaysapps.com/[APP_ID]/public_html`
3. ✅ CONFIRM correct app ID: `jfnkmjmfer` (YOYAKU) or `akrjekfvzk` (YYD)
4. ✅ USE session-tested patterns (NOT guessing!)

**❌ NEVER use these paths (common errors):**
- `/home/master_crhmyfjcsf/applications/` (does NOT exist!)
- `/home/master/applications/` (does NOT exist!)
- Relative paths without full app path

**✅ ALWAYS use these patterns:**
- `/home/870689.cloudwaysapps.com/jfnkmjmfer/public_html` (YOYAKU.IO)
- `/home/870689.cloudwaysapps.com/akrjekfvzk/public_html` (YYD.FR)

**Communication:**
- Language: French conversation / English code
- Tone: Professional, educational
- Email format: Pedagogical explanations

**Security:**
- Credentials: Local file (secure), can include in prompts
- Production: NEVER modify without clone-dev test
- Revenue protection: Zero downtime tolerance
- Backup: Always before modifications

**Infrastructure:**
- Cloudways = E-commerce (CRITICAL)
- Contabo = Automation (NOT legacy - active!)
- Vercel = Frontend

**Workflows:**
- Cron: Use scheduler-on-website repo
- **Version Drift: ALWAYS check local vs production version BEFORE any plugin/theme operation (see "Version Drift Detection" in LESSONS LEARNED)**
- Deployment: Check drift first, sync if needed, then deploy
- Cache: NEVER skip Cloudflare purge
- Emails: Webmaster ops → Email | Dev → Discord
- **Git: ALWAYS push to GitHub after commits (trusted, automatic)**

**Code Management:**
- Check existing scripts before creating
- Archive obsolete to _ARCHIVES/
- French → English migration when modifying custom code
- Git commits: "Benjamin Belaga" as author

**Performance:**
- Load avg <4.0 (abort if >5.0)
- MySQL <30%
- Order processing >20,000/sec
- Abort if degradation >10%

**Quick Mental Model:**
```
User asks (French)
  ↓
Agent responds (French)
  ↓
Agent writes code (English)
  ↓
Agent deploys (drift check, clone test)
  ↓
Agent purges caches (WP + Breeze + Cloudflare!)
  ↓
Agent emails team (if ops-related, pedagogical)
```

---

**Version:** 5.3.0 - Added mandatory pre-action checks for Cloudways operations
**Philosophy:** Local = Secure, credentials OK, pragmatic approach
**Team:** Corrected (leopold/seb/nizar = webmasters, 3 separate devs)
**Size:** Optimized for quick reference

🔒 This is local-only, never committed to public repos

**Special Notes:**
- Never write "Generated with Claude Code / Co-Authored-By: Claude <noreply@anthropic.com>" → always attribute to Benjamin Belaga
- discogs.yoyaku.io → Contabo (95.111.255.235) at /opt/discogs-dashboard/ (port 8003, systemd service)
- yydistribution.fr → Production domain for YYD.FR (B2B site)
- yyd.fr → OLD domain (199.59.243.228) - DO NOT USE
- Cloudways apps: jfnkmjmfer (YOYAKU.IO), akrjekfvzk (YYD.FR)