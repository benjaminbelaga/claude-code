# Google Apps Script - YOYAKU/YYD Import System

**Version:** 2.3.0 (Cleaned Architecture)
**Last Updated:** 2025-11-11
**Author:** Benjamin Belaga

---

## Project Overview

This Google Apps Script project manages product imports and stock updates for:
- **YOYAKU.IO** - B2C vinyl e-commerce
- **YYD.FR** - B2B distribution for record stores

**Key Features:**
- Automated product creation via REST API
- Cross-site image reuse (YOYAKU.IO → YYD.FR) for 70% faster imports
- Stock synchronization
- AI-powered metadata parsing
- Batch processing capabilities

---

## Quick Start

### 1. Open Google Sheets
URL: [Your Google Sheet URL]

### 2. Menu Structure

```
WP Import Dashboard
├── 📊 metadata
│   ├── 🤖 AI Parsing (OpenAI Direct)
│   └── Run metadata corrector
│
├── ⚡ Update Stock
│   ├── 🧹 Clear Calculated Data
│   ├── 📊 Fetch Data & Calculate
│   └── 📦 Update Stock YOYAKU v2.0
│
├── ⚡ New Product (API)
│   ├── ⚡ YOYAKU.IO
│   │   └── ⚡ Create New Products (NEW REST API)
│   └── ⚡ YYD.FR
│       └── ⚡ Create New Products (NEW YOYAKU API v2.3.0)
│
├── 🛒 YOYAKU.io Tools
└── 📦 YYDistribution Tools
```

### 3. Basic Workflow

**Creating New Products on YYD.FR:**
1. Fill product data in Google Sheet (SKU, title, price, etc.)
2. Menu: `⚡ New Product (API) > ⚡ YYD.FR > ⚡ Create New Products`
3. System automatically:
   - Checks if images exist on YOYAKU.IO (B2C)
   - Reuses B2C images via `attachment_ids` (70% faster)
   - Creates product with taxonomies and metadata

---

## Architecture

### Core Files

| File | Purpose | Status |
|------|---------|--------|
| `main.js` | Menu entry point and navigation | ✅ ACTIVE |
| `appsscript.json` | Project configuration | ✅ ACTIVE |

### Import Systems

| File | Purpose | Sites | Key Features |
|------|---------|-------|--------------|
| `import-852-new-products-api.js` | YOYAKU.IO import | B2C | REST API integration |
| `import-yyd-new-products-api.js` | YYD.FR import | B2B | Cross-site image copy, `checkB2CImagesExist()` |

**Important:** YYD import uses `processYYDNewProductsAPI()` which includes cross-site image optimization.

### Stock Management

| File | Purpose | Performance |
|------|---------|-------------|
| `api-stock-functions-v3-ultra-ultra.js` | Stock updates with shelf updates | Fastest version |

**Functions:**
- `fetchDataAndCalculateFromAPI_V3_UltraUltra()` - Fetch + calculate with shelf updates
- `updateYoyakuStockDirectAPI_V2_Webmaster()` - Direct stock update

### Metadata & Validation

| File | Purpose |
|------|---------|
| `metadata-parser-openai-direct-SAFE.js` | AI-powered metadata parsing with error handling |
| `cached-validators.js` | Data validation with caching |
| `taxonomy-resolver-v45.js` | Taxonomy resolution and mapping |
| `distributor-corrector.gs.js` | Distributor name corrections |
| `genres-corrector.js` | Genre taxonomy corrections |

### Utilities

| File | Purpose |
|------|---------|
| `config-unified.js` | Unified configuration management |
| `api-credentials.js` | API authentication |
| `logging-utils.js` | Centralized logging |
| `result-utils.js` | Result formatting and display |
| `Utils.js` | General utility functions |

### Image Management

| File | Purpose |
|------|---------|
| `cross-site-image-reuse.js` | Cross-site image optimization |
| `wordpress-image-reuse-functions.js` | WordPress image reuse helpers |
| `image-checker.js` | Image validation |
| `image-mapping-reader.js` | Image URL mapping |

### API Integration

| File | Purpose |
|------|---------|
| `api-direct-functions.js` | Direct API calls |
| `api-fetch-stock-data.js` | Stock data fetching |
| `api-release-date-functions.js` | Release date management |

### Import Handlers

| File | Purpose |
|------|---------|
| `complete-import-functions.js` | Complete import workflows |
| `complete-import-handler.js` | Import orchestration |
| `imports.js` | Legacy import functions |

### Other

| File | Purpose |
|------|---------|
| `auto-generate-columns.js` | Auto-generate missing columns |
| `metrics-dashboard.js` | Performance metrics display |
| `dkay-scraper-receiver.js` | DKAY scraper data receiver |
| `CorrectionDialog.html` | UI dialog for corrections |

---

## Key Functions Reference

### YYD Import (Main)

**File:** `import-yyd-new-products-api.js`

**Entry Point:**
```javascript
function processYYDNewProductsAPI()
```

**Key Features:**
- Cross-site image copy via `checkB2CImagesExist(sku)`
- Returns `{found: boolean, attachment_ids: Array, count: number}`
- 70% faster than re-downloading from DigitalOcean Spaces
- WordPress API v2.4.1+ handles actual image download

**Image Optimization Logic:**
```javascript
// Check if images exist on YOYAKU.IO (B2C)
const b2cImages = checkB2CImagesExist(sku);

if (b2cImages.found && b2cImages.attachment_ids.length > 0) {
  // FAST PATH: Reuse B2C images via attachment_ids
  console.log(`Using B2C attachment_ids for ${sku} (${b2cImages.count} images)`);
  return { attachment_ids: b2cImages.attachment_ids };
} else {
  // FALLBACK: Download from DigitalOcean Spaces
  console.log(`No B2C images found, downloading from DigitalOcean`);
  return { image_urls: digitalOceanUrls };
}
```

### YOYAKU.IO Import

**File:** `import-852-new-products-api.js`

**Entry Point:**
```javascript
function processImport852NewProductsAPI()
```

### Stock Update

**File:** `api-stock-functions-v3-ultra-ultra.js`

**Entry Point:**
```javascript
function fetchDataAndCalculateFromAPI_V3_UltraUltra()
```

---

## Recent Changes (2025-11-11)

### 1. Architecture Cleanup
**Action:** Archived 23 obsolete files

**Removed:**
- 2 old import versions (including wrong `import-935-new-products-api-v2.js`)
- 3 old main backups
- 7 old stock API versions
- 1 old metadata parser
- 8 test files
- 2 setup files

**Result:** Reduced from 54 files to 31 active files

### 2. Menu Function Fix
**File:** `main.js` (lines 74, 117)

**Before:**
```javascript
// WRONG - No cross-site copy
yydAPIMenu.addItem('...', 'processImport935NewProductsAPI');
```

**After:**
```javascript
// CORRECT - Has cross-site copy
yydAPIMenu.addItem('...', 'processYYDNewProductsAPI');
```

**Impact:** YYD imports now correctly use cross-site image optimization

---

## Finding Files (2-Second Rule)

**Need to find something? Use this map:**

| Task | File |
|------|------|
| Menu structure | `main.js` |
| YYD import | `import-yyd-new-products-api.js` |
| YOYAKU.IO import | `import-852-new-products-api.js` |
| Stock updates | `api-stock-functions-v3-ultra-ultra.js` |
| Metadata parsing | `metadata-parser-openai-direct-SAFE.js` |
| Image optimization | `cross-site-image-reuse.js`, `wordpress-image-reuse-functions.js` |
| Configuration | `config-unified.js` |
| Credentials | `api-credentials.js` |
| Logging | `logging-utils.js` |
| Utilities | `Utils.js` |

---

## Development Workflow

### 1. Local Development
```bash
cd /Users/yoyaku/repos/google-apps-script-yoyaku

# Pull latest from Google Apps Script
clasp pull

# Make changes to files
# ...

# Push to Google Apps Script
clasp push
```

### 2. Git Workflow
```bash
# Stage changes
git add .

# Commit
git commit -m "[CATEGORY] Brief description

- Change 1
- Change 2

Author: Benjamin Belaga"

# Push to GitHub
git push origin main
```

### 3. Testing
1. Test on clone/staging environment first
2. Verify cross-site image copy works
3. Check logs for errors
4. Monitor performance

---

## Common Issues & Solutions

### Issue: Product created without images

**Symptom:** Product has stock but no thumbnail or gallery

**Root Cause:** Wrong import function called (missing cross-site copy)

**Solution:**
1. Check main.js calls `processYYDNewProductsAPI` (not `processImport935NewProductsAPI`)
2. Verify `checkB2CImagesExist()` returns attachment_ids
3. Check YOYAKU.IO WordPress has images for that SKU

### Issue: "Invalid taxonomy" error

**Symptom:** `Error: Invalid taxonomy musiclabel`

**Root Cause:** Taxonomy doesn't exist on target site

**Solution:**
1. Verify taxonomy registered in WordPress
2. Check taxonomy-resolver-v45.js mapping
3. Ensure term exists before assigning

### Issue: Slow import performance

**Symptom:** Imports take >5 minutes

**Root Cause:** Not using cross-site image optimization

**Solution:**
1. Verify `checkB2CImagesExist()` is called
2. Check B2C WordPress Media API responds quickly
3. Use attachment_ids instead of re-downloading images

---

## Performance Metrics

### Cross-Site Image Copy
- **With optimization:** 70% faster (uses existing B2C images)
- **Without optimization:** Re-downloads from DigitalOcean Spaces

### Stock Updates
- **V3 Ultra Ultra:** Fastest, includes shelf updates
- **V2 Webmaster:** Direct stock update only

---

## Archive Information

**Date:** 2025-11-11
**Location:** `~/Desktop/ARCHIVE-GoogleAppsScript-ObsoleteFiles-2025-11-11/`
**Contents:** 23 obsolete files organized by category
**Documentation:** See `README-ARCHIVE.md` in archive folder

---

## Support & Documentation

**GitHub Repository:** `benjaminbelaga/yoyaku-team-config`
**Local Path:** `/Users/yoyaku/repos/google-apps-script-yoyaku/`
**Google Apps Script ID:** `1JkXMaf57gFb8XtmT1Bbaoo6goKlhTw2ie1eIQRlDfqra6OG0oOdDEdUy`

**Contact:** Benjamin Belaga (ben@yoyaku.fr)

---

**Last Updated:** 2025-11-11 - Architecture cleanup and documentation overhaul
**Maintained by:** YOYAKU Technical Team
