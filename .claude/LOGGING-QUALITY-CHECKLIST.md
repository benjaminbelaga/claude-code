# ✅ LOGGING QUALITY CHECKLIST

**Purpose:** Ensure intervention logs meet professional standards
**Version:** 1.0.0
**Date:** 2025-11-21

---

## 📋 PRE-LOGGING CHECKLIST

**Before creating intervention log, verify:**

- [ ] All code changes are committed in source repos (yyd-theme, yoyaku-theme, plugins)
- [ ] Production deployment completed successfully
- [ ] All caches purged (WP + Breeze + Cloudflare)
- [ ] Testing completed in production
- [ ] No pending Git changes in modified repos

---

## 📝 INTERVENTION LOG QUALITY

### ✅ CONTEXT Section
- [ ] Clear problem statement (what was broken/needed)
- [ ] User impact described (who was affected, how)
- [ ] Environment details (theme, plugin versions, browser)
- [ ] Detection method (how was problem discovered)

**Example:**
```markdown
**Initial Problem:**
- Les champs "Include products" dans Newsletter plugin ne fonctionnaient pas
- Impossible de sélectionner des produits pour newsletters
- Impact: 100% des campagnes marketing bloquées

**Environment:**
- Theme YYD v2.1.5
- Plugin: Newsletter v8.9.4
- Detection: User report during WEEK 48 campaign creation
```

### ✅ ROOT CAUSE Section
- [ ] Investigation steps documented
- [ ] Technical cause identified (not just symptoms)
- [ ] Why it failed explained (1-2 sentences)
- [ ] Related code/config referenced

**Example:**
```markdown
**Investigation:**
1. Browser console: Found JavaScript errors
2. Code review: Missing AJAX endpoint
3. Git history: Feature never implemented

**Root Cause:**
Custom nonce bypass code only handled taxonomies, not product search fields.
```

### ✅ SOLUTION Section
- [ ] All code changes documented with line numbers
- [ ] Complete code snippets (not just fragments)
- [ ] Version numbers updated (vX.X.X → vY.Y.Y)
- [ ] Senior dev fixes mentioned if applicable

**Example:**
```markdown
**Version:** newsletter-admin.php v3.0.0 → v4.0.1

### Code Changes

**File:** `/wp-content/themes/yyd/inc/woocommerce/newsletter-admin.php`

**Added lines 98-191:**
```php
add_action('wp_ajax_yyd_search_products_bypass', function() {
    // Complete implementation here
});
```

**Updated lines 396-409:**
```javascript
jQuery(document.body).on('newsletter-enhanced-select-init', function() {
    // Event listener implementation
});
```
```

### ✅ TESTING Section
- [ ] Minimum 3 test scenarios documented
- [ ] Each scenario has expected result
- [ ] All scenarios passed
- [ ] Production verification included

**Example:**
```markdown
**Test Scenarios:**
1. **Search by Title:** "Jupiter" → ✅ Found 15 products
2. **Search by SKU:** "SKT1018" → ✅ Found 1 product (exact match)
3. **Search by ID:** "612619" → ✅ Instant direct match
4. **No Results:** "ZZZZZZ" → ✅ Empty array (graceful)
5. **Reopen tab:** Close/reopen → ✅ Fields persist correctly

**Production Verification:**
- Console logs show: `[YYD V4] ✅ Select2 initialized`
- Fields styled correctly on all browsers
- AJAX requests return valid JSON
```

### ✅ DEPLOYMENT Section
- [ ] Exact deployment method documented
- [ ] All modified files listed with paths
- [ ] Backup location specified
- [ ] Complete cache purge commands
- [ ] Verification commands with expected output

**Example:**
```markdown
**Method:** SFTP two-step deployment
**Date:** 2025-11-21 16:30

**Files Modified:**
- `/wp-content/themes/yyd/inc/woocommerce/newsletter-admin.php` (v3.0.0 → v4.0.1)

**Backup:**
- `/tmp/newsletter-admin.php.backup-20251121-162339`

**Deployment Commands:**
```bash
# Full commands with all steps
sshpass -p "$SFTP_YYD_PASSWORD" sftp yydistributiondev@134.122.80.6 <<'EOF'
cd public_html/wp-content/themes/yyd/inc/woocommerce
put /local/path/newsletter-admin.php
quit
EOF
```

**Cache Purge:**
```bash
ssh yoyaku-cloudways "cd /home/.../public_html && wp cache flush"
ssh yoyaku-cloudways "cd /home/.../public_html && wp breeze purge --cache=all"
~/tools/cloudflare-purge-cache.sh yyd everything
```

**Verification:**
```bash
# Check version
ssh yoyaku-cloudways "head -25 /path/file.php | grep '@version'"
# Output: @version 4.0.1

# Check endpoints
ssh yoyaku-cloudways "cd /path && wp eval '...'"
# Output: ✅ YES
```
```

### ✅ ROLLBACK Section
- [ ] Complete step-by-step procedure
- [ ] All commands provided (copy/paste ready)
- [ ] Verification commands included
- [ ] Expected rollback state defined

**Example:**
```markdown
**If issues arise:**

```bash
# Step 1: Restore backup
ssh yoyaku-cloudways "cp /tmp/backup.php /production/path/file.php"

# Step 2: Purge caches
ssh yoyaku-cloudways "cd /path && wp cache flush && wp breeze purge"
~/tools/cloudflare-purge-cache.sh yyd everything

# Step 3: Verify rollback
ssh yoyaku-cloudways "head -25 /path/file.php | grep '@version'"
# Should show: @version 3.0.0 (previous version)

# Step 4: Test in browser
# Expected: Previous behavior restored
```

**Recovery time:** < 5 minutes
```

### ✅ LESSONS LEARNED Section
- [ ] "What went well" (minimum 2 points)
- [ ] "What could be improved" (minimum 1 point)
- [ ] "Prevention" strategies (minimum 1 point)
- [ ] Knowledge base updates mentioned

**Example:**
```markdown
**What went well:**
- Senior dev review caught 3 bugs before deployment
- 3-strategy search provides comprehensive coverage
- Proper logging enabled quick debugging

**What could be improved:**
- Should add automated tests for Select2 initialization
- Consider MU-plugin for shared customizations
- Earlier detection through monitoring

**Prevention:**
- Add pre-deployment checklist: Verify ALL Select2 field types
- Document Newsletter plugin integration patterns
- Set up automated E2E tests for critical UI components

**Knowledge Base:**
- Added to ~/.claude/CLAUDE.md (Lesson #XX)
- Pattern documented: "Newsletter Select2 bypass without nonce"
```

### ✅ RELATED Section
- [ ] Related files listed with paths
- [ ] Related issues/interventions linked
- [ ] Follow-up tasks documented
- [ ] Task status tracked ([ ] pending, [x] completed)

**Example:**
```markdown
**Related Files:**
- `/wp-content/themes/yyd/newsletter-blocks/woocommerce/options.php` (defines UI)
- `/wp-content/themes/yyd/inc/woocommerce/newsletter-admin.php` (v4.0.1)

**Related Issues:**
- Initial nonce corruption (solved in v3.0.0 - Oct 2025)
- YOYAKU.IO same issue → [Link to logs-yoyaku-io intervention]

**Follow-up Tasks:**
- [x] Apply fix to YOYAKU.IO (completed 2025-11-21)
- [ ] Monitor error logs for 24h
- [ ] Consider MU-plugin extraction (low priority)

**Status:** ✅ Resolved
**Monitoring:** 24h (until 2025-11-22 17:00)
```

---

## 📋 CHANGELOG QUALITY

### ✅ Format Validation
- [ ] Date header present (`## YYYY-MM-DD`)
- [ ] Category prefix (`[THEME]`, `[PLUGIN]`, etc.)
- [ ] Priority emoji (🔴/🟡/🟢/🔵)
- [ ] File path with version transition
- [ ] Problem one-liner
- [ ] Solution bullet points (minimum 3)
- [ ] Deployment details
- [ ] Link to full intervention log
- [ ] Separator line (`---`)

### ✅ Content Validation
- [ ] Brief title describes the fix clearly
- [ ] File path is complete and accurate
- [ ] Version numbers are correct (before → after)
- [ ] Solution bullets explain what changed (not how)
- [ ] Git commit hash included
- [ ] All critical information present

---

## 📋 README QUALITY

### ✅ "Dernières Interventions" Section
- [ ] New entry added at position #1
- [ ] Date in format `**YYYY-MM-DD**`
- [ ] Title matches intervention log
- [ ] Link path is correct (relative)
- [ ] Status emoji (⭐ NEW/Complete, 🐛 Bugfix, 🏗️ Architecture)
- [ ] Maximum 5 entries (remove old if needed)

---

## 📋 SYMLINK QUALITY

### ✅ Category Symlinks
- [ ] Correct category determined (theme/plugins/config/etc.)
- [ ] Symlink created in `/by-category/[category]/`
- [ ] Symlink points to correct log file (relative path)
- [ ] Symlink filename matches log filename
- [ ] Symlink is committed to Git

**Command:**
```bash
cd ~/repos/logs-$SITE/by-category/theme/
ln -sf ../../2025/11-november/2025-11-21-file.md 2025-11-21-file.md
```

---

## 📋 GIT COMMIT QUALITY

### ✅ Commit Message Format
- [ ] Category prefix (`[LOGS]`)
- [ ] Subcategory prefix (`[THEME]`, `[PLUGIN]`, etc.)
- [ ] Brief descriptive title
- [ ] Empty line after title
- [ ] Bullet points describing changes (minimum 2)
- [ ] Status line (`Status: ✅ Resolved`)
- [ ] Empty line before author
- [ ] Author: `Benjamin Belaga` (ONLY)

**Example:**
```
[LOGS] [THEME] Newsletter product search fix v4.0.1

- Added yyd_search_products_bypass AJAX endpoint
- Added newsletter-enhanced-select-init event listener
- Fixed "fields disappear on reopen" bug
- Updated CHANGELOG and README
- Status: ✅ Resolved

Benjamin Belaga
```

### ✅ Git Operations
- [ ] All modified files staged (`git add .`)
- [ ] Commit created with proper message
- [ ] Push successful to origin/main
- [ ] GitHub shows commit online
- [ ] No uncommitted changes remaining

---

## 📋 FINAL VERIFICATION

### ✅ Before Confirming to User
- [ ] Run: `cd ~/repos/logs-$SITE && git status` → Clean
- [ ] Run: `git log --oneline -1` → Correct message
- [ ] Visit: `https://github.com/benjaminbelaga/logs-$SITE` → Commit visible
- [ ] Check: All 4 files updated (log, CHANGELOG, README, symlink)
- [ ] Check: Intervention log is complete (no TODOs/placeholders)
- [ ] Check: Code repos are committed and pushed

### ✅ User Confirmation Message
```
✅ LOGS CRÉÉS ET PUSHÉS

📦 Site: [YYD.FR (B2B) / YOYAKU.IO (B2C)]
📂 Catégorie: [CATEGORY]
📝 Intervention: [TITLE]
📅 Date: YYYY-MM-DD
🔗 GitHub: https://github.com/benjaminbelaga/logs-[site]

📋 Fichiers mis à jour:
  ✅ Intervention log (467 lignes)
  ✅ CHANGELOG.md
  ✅ README.md
  ✅ Symlink: by-category/[category]/

💾 Git:
  Commit: abc1234
  Status: Pushed to origin/main

🎯 Status: Documentation complète et accessible publiquement
```

---

## 🚨 COMMON MISTAKES TO AVOID

### ❌ DON'T
1. ❌ Leave sections empty or with "TODO"
2. ❌ Copy/paste without adapting (YYD → YOYAKU)
3. ❌ Forget to update version numbers
4. ❌ Skip cache purge commands
5. ❌ Omit verification commands
6. ❌ Miss CHANGELOG or README updates
7. ❌ Forget symlink creation
8. ❌ Use AI attribution in commits
9. ❌ Leave repos with uncommitted changes
10. ❌ Skip final GitHub verification

### ✅ DO
1. ✅ Fill every section with real content
2. ✅ Adapt all site-specific details
3. ✅ Update all version references
4. ✅ Include complete deployment commands
5. ✅ Provide verification with expected output
6. ✅ Update all 4 files (log, CHANGELOG, README, symlink)
7. ✅ Use Benjamin Belaga author ONLY
8. ✅ Commit everything before confirming
9. ✅ Verify GitHub accessibility
10. ✅ Give user complete confirmation summary

---

## 📊 QUALITY SCORE

**Perfect log entry = 100 points:**
- Intervention log complete (40 pts)
- CHANGELOG updated (15 pts)
- README updated (15 pts)
- Symlink created (10 pts)
- Git committed (10 pts)
- Git pushed (10 pts)

**Minimum acceptable: 90/100** (professional standard)

---

**Related:**
- Auto-logging protocol: `~/.claude/AUTO-LOGGING-PROTOCOL.md`
- CLAUDE.md specification: `~/.claude/CLAUDE.md` (v5.8.0)
- Templates: `~/repos/logs-*/templates/intervention-template.md`
