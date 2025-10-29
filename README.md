# YOYAKU Import Dashboard - Google Sheets Stock Management

**Version:** 3.0.0-update-shelves
**Author:** Benjamin Belaga
**Last Updated:** 2025-10-29
**License:** Proprietary - YOYAKU SARL
**Repository:** `benjaminbelaga/wp-import-dashboard`
**Local Path:** `/Users/yoyaku/repos/wp-import-dashboard/`
**Production:** YOYAKU.IO + YYD.FR
**Status:** ✅ Active & Optimized

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [Installation](#installation)
- [User Guide](#user-guide)
- [API Documentation](#api-documentation)
- [Performance](#performance)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Changelog](#changelog)

---

## 🎯 Overview

The **YOYAKU Import Dashboard** is a Google Sheets-based inventory management system that integrates directly with WooCommerce via REST API. It provides a fast, efficient, and user-friendly interface for updating product stock levels, managing metadata, and automating business workflows.

### What Makes This Special?

- **Zero Formulas Required**: Webmasters work with plain numbers, calculations happen automatically
- **3-Click Workflow**: Clear → Fetch → Update (complete stock update in 3 clicks)
- **Ultra-Fast Performance**: 7-9x faster with batch parallel fetch + smart skip logic
- **Smart Detection**: Automatically skips unnecessary queries based on product metadata
- **Automatic Metadata**: Release dates, categories, and calculations happen automatically
- **Real-Time Sync**: Direct WooCommerce API integration with bidirectional data flow
- **HPOS Compatible**: Works with WooCommerce High-Performance Order Storage

### Use Cases

- **Daily Stock Updates**: Update 10-100 products in seconds
- **New Arrivals**: Automatically set release dates and swap categories
- **Inventory Reconciliation**: Sync Google Sheets with WooCommerce reality
- **Multi-Site Management**: Supports YOYAKU.IO (B2C) and YYD.FR (B2B)
- **Preorder Tracking**: Real-time preorder calculations from HPOS

### Business Context

**Problem Solved:** Manual stock updates for 800+ products took hours and was error-prone. Google Sheets workflow with v1 API took 15-18 seconds for 3 SKUs due to full-catalog recalculation. V2 improved to 5 seconds for 3 SKUs, but V2 Ultra had sequential requests (60s for 42 SKUs). V3 solves this with batch parallel fetch + smart skip logic (7-9s for 42 SKUs = 7-9x faster).

**Revenue Impact:** Critical - Direct impact on inventory accuracy and order fulfillment

---

## ✨ Features

### Core Features

- **Dual-Mode API Fetching (V3)**
  - Standard Mode: 9 fields, no shelves/preorders (fast, simple)
  - Update Shelves Mode: 7 fields with batch parallel + smart skip (7-9x faster, complete)

- **Automatic Calculations**
  - Initial Quantity: `I = J + D`
  - Stock Quantity: `L = MAX(0, D+H-T-U-1)`
  - Status Text: Automatic "back in stock" vs "arrivals"
  - Date Stamps: Today's date automatic
  - Week Numbers: Calculated for imports/exclusives

- **Intelligent Recalculation**
  - Targeted Mode: Recalculate ONLY your SKUs (540x faster than full site)
  - Cache-Aware: Leverages server-side caching for instant responses
  - Dual-Site Sync: YOYAKU.IO preorders + YYD.FR shelf quantities

- **Stock Update Automation (V2.0)**
  - Automatic release date update to TODAY
  - Automatic category swap: Forthcoming → Arrivals
  - Negative stock protection
  - Backorder management
  - Initial quantity persistence

- **Performance Monitoring**
  - Built-in performance comparison tests
  - Real-time execution time tracking
  - Payload size measurement
  - Cache hit rate monitoring

### New in V3.0 Update Shelves (2025-10-29)

- ⚡ **Batch Parallel Fetch**: 7-9x faster with `UrlFetchApp.fetchAll()` (all SKUs simultaneously)
- 🧠 **Smart Skip Logic**: Analyzes column P, skips YYD recalc if 0 YYD products
- 🎯 **Smart Backend Detection**: Only queries preorders if backorders enabled, shelves if on YYD
- 📊 **7-Field Mode**: 4 numbers + image + distributor + stock_status (~350 bytes)
- 🖼️ **Image Formula**: Column A uses `=IMAGE()` formula for direct display
- 🏢 **Distributor Fix**: Corrected taxonomy name `distributormusic` (was broken)
- 📅 **Automatic Release Date**: Sets `_release_date` to TODAY on stock update
- 🏷️ **Automatic Category Swap**: Forthcoming (4044) → Arrivals (12538)

---

## 🚀 Quick Start

### For Webmasters (Using the System)

**3-Click Workflow:**

1. **Clear (Optional)**: Menu → ⚡ Update Stock → 🧹 Clear Calculated Data
2. **Fetch**: Menu → ⚡ Update Stock → ⚡ Fetch Data & Calculate (Update Shelves)
3. **Update**: Menu → ⚡ Update Stock → 📦 Update Stock YOYAKU v2.0

**Expected Time**: 10-20 products in 10 seconds, 42 products in 7-9 seconds

### For Developers (Deploying Changes)

```bash
# 1. Clone repository
git clone git@github.com:benjaminbelaga/wp-import-dashboard.git
cd wp-import-dashboard

# 2. Deploy backend (if modified)
./deploy-yio-plugin.sh

# 3. Deploy Google Sheets (if modified)
# Upload files via Apps Script editor
# Extensions > Apps Script > Upload files
```

### Test Performance

```bash
# Test REST API endpoint
curl 'https://www.yoyaku.io/wp-json/yoyaku/v1/product-stock-data/YOYAKU005?fields=numbers'

# Compare payload sizes
curl -s 'https://www.yoyaku.io/wp-json/yoyaku/v1/product-stock-data/YOYAKU005?fields=numbers' | wc -c
# Expected: ~220 bytes

curl -s 'https://www.yoyaku.io/wp-json/yoyaku/v1/product-stock-data/YOYAKU005' | wc -c
# Expected: ~407 bytes
```

---

## 🏗️ Architecture

### System Overview

```
Google Sheets (UI - Zero formulas)
      ↓
Google Apps Script (Server-Side JS)
      ├─> Standard Mode (9 fields, no T/U)
      └─> Update Shelves Mode (7 fields + batch parallel) ← V3!
      ↓
Smart Analysis (Column P - YYD detection)
      ├─> Skip YYD recalc if 0 YYD products
      └─> Skip YOYAKU recalc if 0 YOYAKU products
      ↓
Batch Parallel Fetch (UrlFetchApp.fetchAll)
      └─> All SKUs fetched simultaneously (7-9x faster)
      ↓
REST API Endpoint (YIO Plugin)
      GET /wp-json/yoyaku/v1/product-stock-data/{sku}
      ├─> ?fields=all (standard mode - 9 fields)
      └─> ?fields=numbers-plus&smart=true&on_yyd={P} ← V3!
          ├─> Smart: skip shelves if on_yyd=false
          └─> Smart: skip preorders if backorders=no
      ↓
WooCommerce Database (HPOS)
      ├─> wp_wc_orders (67,471+ orders)
      ├─> wp_wc_order_product_lookup (preorders - conditional)
      ├─> wp_posts (products, 21,000+)
      ├─> wp_postmeta (custom fields - conditional shelves)
      └─> wp_term_relationships (distributormusic taxonomy)
```

### File Structure

```
wp-import-dashboard/
├── README.md                                    # This file
├── CHANGELOG.md                                 # Version history
├── DEPLOYMENT-ULTRA-OPTIMIZED-V2.md            # Deployment guide
│
├── main.js                                      # Menu system
├── api-credentials.js                           # API config (gitignored)
│
├── api-stock-functions-v2-webmaster.js         # V2.0 Standard Mode
├── api-stock-functions-v2-ultra-optimized.js   # V2.0 Ultra Mode ← NEW!
├── api-stock-helpers.js                         # Shared utilities
│
└── docs/
    ├── API-DOCUMENTATION.md                    # REST API reference
    ├── USER-GUIDE.md                           # Webmaster guide
    └── ARCHITECTURE.md                         # Technical deep dive
```

### Data Flow (Ultra-Optimized)

```
1. User: Clear Calculated Data
   └─> Clears columns I, L, M, N, O, S (preserves manual inputs)

2. User: Fetch Data & Calculate (ULTRA)
   └─> Recalculate source data (YOUR SKUs only)
       ├─> YOYAKU.IO: Preorders
       └─> YYD.FR: Shelf quantities
   └─> Fetch NUMBERS ONLY (4 fields, ~220 bytes)
       GET /product-stock-data/{sku}?fields=numbers
   └─> Calculate automatically
       ├─> I = J + D (Initial Quantity)
       ├─> L = MAX(0, D+H-T-U-1) (Stock Quantity)
       ├─> M = Status text
       ├─> N = Today's date
       └─> S = Week number

3. User: Update Stock YOYAKU v2.0
   └─> POST /wp-json/wc/v3/products/{id}
       ├─> Update stock_quantity (from L)
       ├─> Set _release_date = TODAY ← NEW!
       ├─> Swap category Forthcoming → Arrivals ← NEW!
       ├─> Set date_on_sale_from = TODAY (if stock > 0)
       └─> Disable backorders
```

---

## 📦 Installation

### Prerequisites

- Google Account with Sheets access
- YOYAKU.IO WordPress admin access
- Google Apps Script editor access
- API credentials (contact ben@yoyaku.fr)

### Step 1: Create Google Sheet

1. Open Google Sheets
2. Create new spreadsheet: "YOYAKU Import Dashboard"
3. Create sheet named: **"update stock"**
4. Set up columns (see sheet structure below)

### Step 2: Deploy Google Apps Script

1. In Google Sheets: **Extensions > Apps Script**
2. Upload files in order:
   - `api-credentials.js` (configure first!)
   - `main.js`
   - `api-stock-helpers.js`
   - `api-stock-functions-v2-webmaster.js`
   - `api-stock-functions-v2-ultra-optimized.js`
3. Click: **Deploy > Test deployments**
4. Reload Google Sheets
5. Verify menu appears: **⚡ Update Stock**

### Step 3: Test Installation

1. Run: **🧪 Test Performance (V2 vs Ultra)**
2. Expected: Ultra mode 3x faster
3. Expected: Payload 45% smaller
4. Expected: Calculations 100% identical

---

## 📖 User Guide

### Sheet Structure

**Required Columns (update stock sheet):**

| Col | Name | Type | Description | Example |
|-----|------|------|-------------|---------|
| B | SKU | Manual | WooCommerce SKU | YOYAKU005 |
| D | New Order Quantity | Manual | Delta (+/-) | +50 |
| H | Current Stock | Auto | From API | 386 |
| I | Initial Quantity | Auto | Calculated: J + D | 150 |
| J | Initial Quantity Origin | Auto | From API | 100 |
| L | Stock Quantity | Auto | Calculated: D+H-T-U-1 | 435 |
| M | Status Text | Auto | back in stock / arrivals | back in stock |
| N | Date | Auto | Today's date | 2025-10-29 |
| T | Quantity Shelf | Auto | From API (YYD B2B) | 0 |
| U | Total Preorders | Auto | From API (HPOS) | 0 |
| S | Week Number | Auto | Calculated week | 44 |

### 3-Click Workflow

#### STEP 1: Clear Calculated Data (Optional)

Menu → ⚡ Update Stock → 🧹 Clear Calculated Data

**What it does:** Clears columns H-U, preserves manual inputs A-F

#### STEP 2: Fetch Data & Calculate

**Two Modes Available:**

**Option A: 📊 Fetch Data & Calculate (Standard)**
- Updates columns: A, B, C, E, F, G, H, J, K, M, N
- Does NOT update: T (Shelves), U (Preorders)
- Use case: Quick fetch without B2B shelf data
- Speed: Fast (no HPOS preorder queries)

**Option B: ⚡ Fetch Data & Calculate (Update Shelves)** ← **RECOMMENDED**
- Updates columns: ALL (A-U complete)
- Includes: T (Shelves), U (Preorders)
- Use case: Full stock update with B2B data
- Speed: Ultra-fast (7-9x faster with batch parallel + smart skip)

**What it does (Update Shelves mode):**
1. Smart analysis: Reads column P (YYD yes/no) to skip unnecessary queries
2. Batch parallel fetch: All SKUs fetched simultaneously (not sequential)
3. Smart recalculation: Skips YYD.FR if no YYD products, skips YOYAKU.IO if no YOYAKU products
4. Fetches 7 fields: 4 numbers + image + distributor + stock_status
5. Calculates I, L, M, N, S automatically

**Result:**
```
📊 Fetch & Calculate Complete (Update Shelves)!
✅ Successfully processed: 42 SKUs
⚡ Total time: 7.8 seconds (7-9x faster!)
📦 Payload: ~14.7 KB (smart optimization)
🧠 Smart skip: YYD recalc skipped (0 YYD products)
```

#### STEP 3: Update Stock YOYAKU v2.0

Menu → ⚡ Update Stock → **📦 Update Stock YOYAKU v2.0**

**What it does (NEW v2.0 features!):**
- Updates stock quantity (from column L)
- **NEW:** Sets release date to TODAY (automatic!)
- **NEW:** Swaps category Forthcoming → Arrivals (automatic!)
- Sets WooCommerce sale date (if stock > 0)
- Disables backorders

**Result:**
```
📦 Stock Update v2.0 Complete!
✅ Successfully updated: 10 products
🆕 V2.0 Features:
📅 Release dates updated to TODAY: 10  ← NEW!
🏷️ Categories swapped: 8  ← NEW!
```

### When to Use Each Mode

**✅ Use Ultra-Optimized (Recommended):**
- Updating 10+ SKUs
- Speed is critical
- Only need stock calculations

**✅ Use Standard V2:**
- Need product images
- Need taxonomy data
- Updating <5 SKUs (minimal difference)

---

## 🚀 API Documentation

### REST API Endpoint

**Base URL:** `https://www.yoyaku.io/wp-json/yoyaku/v1/product-stock-data`

#### Update Shelves Mode (V3 - Recommended)

**Request:**
```bash
GET /product-stock-data/{sku}?fields=numbers-plus&smart=true&on_yyd=false
```

**Response (~350 bytes - 7 fields with smart detection):**
```json
{
  "found": true,
  "sku": "YOYAKU005",
  "stock_quantity": 386,
  "initial_quantity": 100,
  "shelf_quantity": 0,
  "total_preorders": 0,
  "image_url": "https://yoyaku.io/wp-content/uploads/2022/11/YOYAKU005_sleeve.jpg",
  "distributor_music": "yydistribution",
  "stock_status": "instock",
  "_meta": {
    "mode": "numbers-plus",
    "execution_time": "8.34ms",
    "timestamp": "2025-10-29 15:00:00",
    "version": "1.0.0"
  }
}
```

**Smart Detection Features:**
- `on_yyd=false` → Backend skips `shelf_quantity` query (saves ~2ms)
- `smart=true` + backorders disabled → Backend skips `total_preorders` HPOS query (saves ~5ms)
- Returns 7 fields: 4 numbers + 3 essentials (image, distributor, stock_status)

#### Standard Mode (All Fields)

**Request:**
```bash
GET /product-stock-data/{sku}
# OR
GET /product-stock-data/{sku}?fields=all
```

**Response (407 bytes):**
```json
{
  "found": true,
  "sku": "YOYAKU005",
  "product_id": 535167,
  "image_url": "https://yoyaku.io/wp-content/uploads/2022/11/YOYAKU005_sleeve.jpg",
  "distributor_music": "",
  "stock_quantity": 386,
  "stock_status": "instock",
  "depot_vente": "no",
  "initial_quantity": 100,
  "shelf_quantity": 0,
  "total_preorders": 0,
  "is_online": true,
  "_meta": {
    "mode": "all",
    "execution_time": "6.93ms"
  }
}
```

### Field Comparison

| Field | Update Shelves (V3) | Standard Mode |
|-------|---------------------|---------------|
| stock_quantity | ✅ | ✅ |
| initial_quantity | ✅ | ✅ |
| shelf_quantity | ✅ (smart skip) | ✅ |
| total_preorders | ✅ (smart skip) | ✅ |
| image_url | ✅ | ✅ |
| distributor_music | ✅ | ✅ |
| stock_status | ✅ | ✅ |
| product_id | ❌ | ✅ |
| depot_vente | ❌ | ✅ |
| is_online | ❌ | ✅ |
| **Payload Size** | **~350 bytes** | **407 bytes** |
| **Fields Returned** | **7 optimized** | **9 complete** |
| **Smart Detection** | **✅ Yes** | **❌ No** |

---

## ⚡ Performance

### Real Production Benchmarks (2025-10-29)

**Single SKU:**
- Update Shelves (V3): ~350 bytes, 8.34ms
- Standard Mode: 407 bytes, 6.93ms
- **Smart Features:** Conditional queries (saves 2-7ms per SKU)

**Bulk Performance (42 SKUs - Real Test):**
- V3 Update Shelves (Batch Parallel): 7-9 seconds, ~14.7 KB
- V2 Ultra (Sequential): 60 seconds, ~9.2 KB
- **Speedup:** 7-9x faster with batch parallel `fetchAll()`

**Smart Recalculation:**
- V3 with smart skip (0 YYD products): Skips YYD recalc entirely (~2s saved)
- V3 with smart skip (0 YOYAKU products): Skips YOYAKU recalc entirely (~2s saved)
- **Benefit:** Only processes SKUs that need processing

**Expected Performance by SKU Count:**
- 10 SKUs: 2-3 seconds
- 42 SKUs: 7-9 seconds
- 100 SKUs: 15-18 seconds

### Expected Performance

- **10 SKUs:** 1-2s (ultra) vs 3-5s (standard)
- **50 SKUs:** 5-10s (ultra) vs 15-25s (standard)
- **100 SKUs:** 8-15s (ultra) vs 30-50s (standard)

---

## 🚀 Deployment

### Backend Deployment (YIO Plugin)

**File:** `/wp-content/plugins/yio/features/rest-api-product-stock.php`

**Method:** SFTP (recommended for production)
```bash
source ~/.credentials/yoyaku/passwords/sftp.env
sshpass -p "$SFTP_YOYAKU_PASSWORD" scp \
  rest-api-product-stock.php \
  yoyakudev@134.122.80.6:public_html/wp-content/plugins/yio/features/
```

**Verification:**
```bash
curl 'https://www.yoyaku.io/wp-json/yoyaku/v1/product-stock-data/YOYAKU005?fields=numbers'
```

### Google Sheets Deployment

1. Open: **Extensions > Apps Script**
2. Upload files (in order):
   - `api-credentials.js`
   - `main.js`
   - `api-stock-helpers.js`
   - `api-stock-functions-v2-webmaster.js`
   - `api-stock-functions-v2-ultra-optimized.js`
3. Deploy: **Deploy > Test deployments**
4. Test: Run performance comparison

---

## 🔧 Troubleshooting

### Common Issues

**Menu Items Don't Appear:**
- Hard reload: Ctrl+R or Cmd+R
- Check Apps Script deployment
- Verify function names match

**Ultra Mode Returns All Fields:**
- Verify URL: `?fields=numbers` (not `&fields=numbers`)
- Test with curl: `curl 'URL?fields=numbers'`
- Check backend deployed

**Calculations Don't Match:**
- Compare formulas: I = J + D, L = MAX(0, D+H-T-U-1)
- Verify data types (parseInt where needed)

**Release Date Not Updating:**
- Check Apps Script logs
- Verify code around line 941 in webmaster.js
- Test with single SKU first

**Performance Not 3x Faster:**
- Run during low-traffic hours
- Check server load: `ssh yoyaku-cloudways "uptime"`
- Verify cache hits in logs

### Debugging

**Apps Script Logs:**
```
Extensions > Apps Script > View > Logs
```

**WordPress Logs:**
```bash
ssh yoyaku-cloudways
tail -f /home/.../public_html/wp-content/debug.log
```

**Network:**
```bash
curl -s 'URL?fields=numbers' | wc -c  # Check payload
time curl -s 'URL?fields=numbers' > /dev/null  # Check time
```

---

## 📜 Changelog

### Version 2.0.0-ultra-optimized (2025-10-29)

**Added:**
- ⚡ Ultra-Optimized mode (3x faster, 45% smaller)
- 📅 Automatic release date to TODAY
- 🧪 Performance comparison test
- 🏷️ Automatic category swap

**Performance:**
- 67% faster fetch time
- 45% smaller payload
- Zero additional API calls

### Version 1.5.0 (2025-10-18)

- Initial V2 Standard mode
- Recalculation API v2 Targeted
- Category swap automation

---

## 🤝 Contributing

### Development

1. Clone repository
2. Create feature branch
3. Test on clone-dev
4. Performance validation required
5. Update documentation

### Standards

- Language: English
- Style: Google JavaScript Style Guide
- Comments: JSDoc format
- Testing: Zero breaking changes

---

## 📄 License

**Proprietary - YOYAKU SARL**

Unauthorized copying, modification, or distribution prohibited.

**Copyright © 2024-2025 YOYAKU SARL. All rights reserved.**

---

## 🎯 Quick Links

- **Production:** https://yoyaku.io
- **GitHub:** https://github.com/benjaminbelaga/wp-import-dashboard
- **Contact:** ben@yoyaku.fr
- **Team:** leopold@yoyaku.fr, seb@yoyaku.fr

---

**Maintained by:** Benjamin Belaga
**Last Updated:** 2025-10-29
**Version:** 2.0.0-ultra-optimized
