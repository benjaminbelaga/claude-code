# Architecture - YOYAKU Stock Management System

Complete architecture documentation for the integration between Google Sheets (wp-import-dashboard) and WordPress API (yoyaku-api-connector).

**Version**: 1.2.0
**Last Updated**: 2025-10-23
**Author**: Benjamin Belaga (YOYAKU SARL)

---

## Table of Contents

- [System Overview](#system-overview)
- [Architecture Diagram](#architecture-diagram)
- [Component Details](#component-details)
- [Data Flow](#data-flow)
- [API Integration](#api-integration)
- [Column Mapping](#column-mapping)
- [Deployment Pipeline](#deployment-pipeline)
- [Performance Optimization](#performance-optimization)
- [Security Architecture](#security-architecture)

---

## System Overview

The YOYAKU Stock Management System consists of two main components:

1. **yoyaku-api-connector** (WordPress Plugin)
   - Location: `/wp-content/plugins/yoyaku-api-connector/`
   - Purpose: Ultra-fast REST API for product data
   - Technology: PHP 8.1+, WordPress 6.0+, WooCommerce 8.0+

2. **wp-import-dashboard** (Google Apps Script)
   - Location: Google Sheets (Apps Script container-bound)
   - Purpose: Stock management dashboard and automation
   - Technology: JavaScript ES6+, Google Apps Script API

### Integration Points

```
Google Sheets (wp-import-dashboard)
         ↓
   HTTPS REST API Call
         ↓
Cloudflare CDN (Edge Cache)
         ↓
WordPress Server (yoyaku-api-connector)
         ↓
MySQL Database (Direct Queries)
         ↓
JSON Response
         ↓
Google Sheets (Data Display)
```

---

## Architecture Diagram

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  GOOGLE WORKSPACE                        │
│  ┌───────────────────────────────────────────────────┐  │
│  │         Google Sheets (User Interface)            │  │
│  │   - SKU input (Column C)                          │  │
│  │   - Order quantity input (Column D)               │  │
│  │   - Auto-calculated fields (I, L, M, N, S)        │  │
│  └────────────────┬──────────────────────────────────┘  │
│                   │                                      │
│  ┌────────────────▼──────────────────────────────────┐  │
│  │     Google Apps Script (wp-import-dashboard)      │  │
│  │   - fetchDataAndCalculateFromAPI()                │  │
│  │   - clearCalculatedData()                         │  │
│  │   - updateYoyakuStockDirectAPI_V2_Webmaster()     │  │
│  └────────────────┬──────────────────────────────────┘  │
└───────────────────┼──────────────────────────────────────┘
                    │ HTTPS GET/POST
                    │ (UrlFetchApp.fetch)
                    ▼
┌─────────────────────────────────────────────────────────┐
│                  CLOUDFLARE CDN                          │
│  - Edge caching (31 days for API endpoints)             │
│  - SSL/TLS termination                                   │
│  - DDoS protection                                       │
│  - Zone: e82d23369a6c54d56106adb947fc069d (yoyaku.io)  │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│         WORDPRESS SERVER (Cloudways)                     │
│  Server: 134.122.80.6                                    │
│  App: jfnkmjmfer (yoyaku.io production)                 │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │  WordPress Core + WooCommerce 8.x                  │ │
│  │  - REST API routing (/wp-json/*)                   │ │
│  │  - Authentication layer (bypassed for public API)  │ │
│  └────────────────┬───────────────────────────────────┘ │
│                   │                                      │
│  ┌────────────────▼───────────────────────────────────┐ │
│  │  yoyaku-api-connector Plugin v1.4.2                │ │
│  │                                                     │ │
│  │  📁 includes/                                      │ │
│  │    ├── class-base-endpoint.php                    │ │
│  │    │   └── get_complete_product_data_by_sku()     │ │
│  │    │       (Single mega-query optimization)       │ │
│  │    │                                               │ │
│  │    └── class-product-stock-endpoint.php           │ │
│  │        ├── get_product_by_sku()                   │ │
│  │        ├── get_products_batch()                   │ │
│  │        └── fetch_product_stock_data()             │ │
│  │                                                     │ │
│  │  🔗 Registered Routes:                            │ │
│  │    - GET  /yoyaku/v1/product-stock-data/{SKU}    │ │
│  │    - POST /yoyaku/v1/product-stock-data/batch    │ │
│  └────────────────┬───────────────────────────────────┘ │
│                   │                                      │
│  ┌────────────────▼───────────────────────────────────┐ │
│  │  MySQL 8.0 Database (Direct Queries)              │ │
│  │                                                     │ │
│  │  Tables accessed:                                  │ │
│  │    - wp_posts (product data)                      │ │
│  │    - wp_postmeta (custom fields, stock)           │ │
│  │    - wp_terms (taxonomy terms)                    │ │
│  │    - wp_term_taxonomy (taxonomy definitions)      │ │
│  │    - wp_term_relationships (term assignments)     │ │
│  │                                                     │ │
│  │  Indexes used:                                     │ │
│  │    - wp_postmeta(meta_key='_sku', meta_value)    │ │
│  │    - wp_posts(ID, post_type='product')           │ │
│  │    - wp_term_relationships(object_id)             │ │
│  └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## Component Details

### 1. Google Apps Script (wp-import-dashboard)

**Repository**: `https://github.com/benjaminbelaga/wp-import-dashboard`
**Language**: JavaScript ES6+
**Deployment**: CLASP CLI (`clasp push`)

#### Core Files

```
wp-import-dashboard/
├── api-stock-functions-v2-webmaster.js  ← Main logic (Webmaster v2.0)
│   ├── clearCalculatedData()             ← Clears columns (preserves C, D)
│   ├── fetchDataAndCalculateFromAPI()    ← Fetches + calculates
│   └── updateYoyakuStockDirectAPI_V2()   ← Pushes to WooCommerce
│
├── main.js                                ← Menu structure
│   └── onOpen()                           ← Creates ⚡ Update Stock menu
│
├── api-credentials.js                     ← WooCommerce API credentials
├── config.js                              ← API endpoints configuration
└── appsscript.json                        ← Apps Script manifest
```

#### Key Functions

**fetchDataAndCalculateFromAPI()** - Main data retrieval function

```javascript
// Column constants (0-based indexing)
const COLUMN_A = 0;   // Image formula =IMAGE(Z)
const COLUMN_B = 1;   // Distributor Music (from API)
const COLUMN_C = 2;   // SKU (manual input)
const COLUMN_D = 3;   // New Order Quantity (manual input)
const COLUMN_G = 6;   // Depot Vente (from API)
const COLUMN_H = 7;   // Current Stock (from API)
const COLUMN_J = 9;   // Initial Quantity Origin (from API)
const COLUMN_K = 10;  // Stock Status (from API)
const COLUMN_O = 14;  // Online Status (from API)
const COLUMN_T = 19;  // Quantity Shelf (from API: _total_shelves)
const COLUMN_U = 20;  // Total Preorders (from API: _total_preorders)
const COLUMN_Z = 25;  // Image URL raw (from API)

// Calculated columns
const COLUMN_I = 8;   // Initial Quantity (calculated: J + D)
const COLUMN_L = 11;  // Stock Quantity (calculated: D + H - T - U - 1)
const COLUMN_M = 12;  // Status Text (calculated)
const COLUMN_N = 13;  // Date (calculated: now)
const COLUMN_S = 18;  // Week Number (calculated)
```

**Data Flow in fetchDataAndCalculateFromAPI():**

```javascript
1. Read SKU from column C
2. Call API: GET /yoyaku/v1/product-stock-data/{SKU}
3. Extract API data:
   - distributor_music (NEW v1.4.2)
   - stock_quantity, stock_status
   - depot_vente, initial_quantity
   - is_online, image_url
   - shelf_quantity (_total_shelves)
   - total_preorders
4. Apply negative stock protection: H = Math.max(0, stock_quantity)
5. Calculate derived values:
   - I = J + D (Initial Quantity)
   - L = D + H - T - U - 1 (Stock Quantity)
   - M = Status text (arrivals, back in stock)
   - S = Week number (if imports/exclusives)
6. Write to sheet:
   - API data → Columns A, B, G, H, J, K, O, T, U, Z
   - Calculated → Columns I, L, M, N, S
```

---

### 2. WordPress Plugin (yoyaku-api-connector)

**Repository**: `https://github.com/benjaminbelaga/yoyaku-api-connector`
**Language**: PHP 8.1+
**Version**: 1.4.2

#### Directory Structure

```
yoyaku-api-connector/
├── yoyaku-api-connector.php              ← Main plugin file
│   ├── Plugin constants
│   ├── Autoloader (PSR-4 style)
│   └── Endpoint initialization
│
├── includes/
│   ├── class-base-endpoint.php           ← Abstract base class
│   │   ├── get_complete_product_data_by_sku()  ← MEGA-QUERY
│   │   ├── get_product_id_by_sku()
│   │   ├── get_terms_direct()
│   │   └── add_cors_headers()
│   │
│   └── class-product-stock-endpoint.php  ← Stock endpoint
│       ├── register_routes()
│       ├── get_product_by_sku()
│       ├── get_products_batch()
│       └── fetch_product_stock_data()
│
├── CHANGELOG.md                           ← Version history
├── README.md                              ← Setup guide
└── API-REFERENCE.md                       ← Complete API docs
```

#### Single Mega-Query Optimization (v1.3.0+)

**Before v1.3.0** (9 queries per product):
```sql
1. SELECT post_id FROM wp_postmeta WHERE meta_key='_sku' AND meta_value='YOYAKU012'
2. SELECT post_title FROM wp_posts WHERE ID=626423
3. SELECT meta_value FROM wp_postmeta WHERE post_id=626423 AND meta_key='_stock'
4. SELECT meta_value FROM wp_postmeta WHERE post_id=626423 AND meta_key='_stock_status'
5. SELECT meta_value FROM wp_postmeta WHERE post_id=626423 AND meta_key='_thumbnail_id'
6. SELECT meta_value FROM wp_postmeta WHERE post_id=626423 AND meta_key='_depot_vente'
7. SELECT meta_value FROM wp_postmeta WHERE post_id=626423 AND meta_key='_initial_quantity'
8. SELECT meta_value FROM wp_postmeta WHERE post_id=626423 AND meta_key='_total_shelves'
9. SELECT meta_value FROM wp_postmeta WHERE post_id=626423 AND meta_key='_total_preorders'
```

**After v1.3.0** (1 query per product):
```sql
SELECT
    p.ID as product_id,
    p.post_title,
    p.post_status,
    MAX(CASE WHEN pm.meta_key = '_stock' THEN pm.meta_value END) as `_stock`,
    MAX(CASE WHEN pm.meta_key = '_stock_status' THEN pm.meta_value END) as `_stock_status`,
    MAX(CASE WHEN pm.meta_key = '_thumbnail_id' THEN pm.meta_value END) as `_thumbnail_id`,
    MAX(CASE WHEN pm.meta_key = '_depot_vente' THEN pm.meta_value END) as `_depot_vente`,
    MAX(CASE WHEN pm.meta_key = '_initial_quantity' THEN pm.meta_value END) as `_initial_quantity`,
    MAX(CASE WHEN pm.meta_key = '_total_shelves' THEN pm.meta_value END) as `_total_shelves`,
    MAX(CASE WHEN pm.meta_key = '_total_preorders' THEN pm.meta_value END) as `_total_preorders`
FROM wp_postmeta pm_sku
INNER JOIN wp_posts p ON pm_sku.post_id = p.ID
LEFT JOIN wp_postmeta pm ON p.ID = pm.post_id
WHERE pm_sku.meta_key = '_sku'
  AND pm_sku.meta_value = 'YOYAKU012'
  AND p.post_type = 'product'
GROUP BY p.ID
LIMIT 1
```

**Performance Gain:** 89% query reduction!

#### Taxonomy Fetch (v1.4.2+)

```php
// After main query, fetch taxonomy term
$distributor_music = '';
$product_id = (int)$data->product_id;
$terms = wp_get_object_terms($product_id, 'distributormusic', array('fields' => 'names'));
if (!is_wp_error($terms) && !empty($terms)) {
    $distributor_music = $terms[0]; // First term name
}
```

**SQL (internal wp_get_object_terms):**
```sql
SELECT t.name
FROM wp_terms t
INNER JOIN wp_term_taxonomy tt ON t.term_id = tt.term_id
INNER JOIN wp_term_relationships tr ON tt.term_taxonomy_id = tr.term_taxonomy_id
WHERE tr.object_id = 626423 AND tt.taxonomy = 'distributormusic'
ORDER BY t.name ASC
```

---

## Data Flow

### Complete Request-Response Cycle

```
1. USER INPUT (Google Sheets)
   └─ Column C: SKU = "YOYAKU012"
   └─ Column D: New Order = 50

2. GOOGLE APPS SCRIPT (fetchDataAndCalculateFromAPI)
   └─ Construct URL: https://www.yoyaku.io/wp-json/yoyaku/v1/product-stock-data/YOYAKU012
   └─ Execute: UrlFetchApp.fetch(url, {method: 'get'})

3. CLOUDFLARE CDN
   └─ Check edge cache (TTL: 31 days for /wp-json/*)
   └─ Cache HIT → Return cached response (5-10ms)
   └─ Cache MISS → Forward to origin server

4. WORDPRESS SERVER
   └─ REST API Router (/wp-json/yoyaku/v1/*)
   └─ Load yoyaku-api-connector plugin
   └─ Execute: YOYAKU_Product_Stock_Endpoint::get_product_by_sku()

5. DATABASE QUERY
   └─ Execute single mega-query (see above)
   └─ Query time: ~2-5ms
   └─ Execute taxonomy query (distributormusic)
   └─ Query time: ~1-2ms
   └─ Total: ~10-20ms

6. API RESPONSE (JSON)
   {
     "sku": "YOYAKU012",
     "product_id": 626423,
     "distributor_music": "yydistribution",
     "stock_quantity": -67,
     "shelf_quantity": "24",
     "total_preorders": "28",
     ...
   }

7. GOOGLE APPS SCRIPT (Processing)
   └─ Parse JSON response
   └─ Extract: distributorMusic = "yydistribution"
   └─ Apply negative protection: H = Math.max(0, -67) = 0
   └─ Calculate: I = 0 + 50 = 50 (Initial Quantity)
   └─ Calculate: L = 50 + 0 - 24 - 28 - 1 = -3 → 0 (Stock Quantity)
   └─ Calculate: M = "back in stock" (J > 0)

8. GOOGLE SHEETS (Output)
   ├─ Column A: =IMAGE(Z25) ← Image formula
   ├─ Column B: "yydistribution" ← Distributor Music (NEW!)
   ├─ Column C: "YOYAKU012" ← SKU (preserved)
   ├─ Column D: 50 ← New Order (preserved)
   ├─ Column H: 0 ← Current Stock (negative protected)
   ├─ Column I: 50 ← Initial Quantity (calculated)
   ├─ Column L: 0 ← Stock Quantity (calculated)
   ├─ Column T: 24 ← Quantity Shelf (from _total_shelves)
   └─ Column U: 28 ← Total Preorders
```

**Total time:** ~50-100ms (with Cloudflare cache hit: ~10-20ms)

---

## API Integration

### Endpoint Specification

**Base URL**: `https://www.yoyaku.io/wp-json/yoyaku/v1/`

#### Single Product Endpoint

```http
GET /product-stock-data/{SKU}
```

**Response Format:**
```json
{
  "sku": string,
  "product_id": integer,
  "title": string,
  "found": boolean,
  "is_online": boolean,
  "post_status": string,
  "image_url": string,
  "stock_quantity": integer,
  "stock_status": string,
  "depot_vente": string,
  "initial_quantity": string,
  "shelf_quantity": string,
  "total_preorders": string,
  "distributor_music": string
}
```

#### Batch Endpoint

```http
POST /product-stock-data/batch
Content-Type: application/json

{
  "skus": ["SKU1", "SKU2", "SKU3"]
}
```

**Response**: Array of product objects (max 50 SKUs)

### Google Apps Script Integration Code

```javascript
const API_BASE = 'https://www.yoyaku.io/wp-json/yoyaku/v1/product-stock-data';

function fetchProductData(sku) {
  const searchUrl = `${API_BASE}/${encodeURIComponent(sku.toString().trim())}`;
  const searchOptions = {
    method: 'get',
    headers: {
      'Content-Type': 'application/json'
    },
    muteHttpExceptions: true
  };

  const searchResponse = UrlFetchApp.fetch(searchUrl, searchOptions);
  const product = JSON.parse(searchResponse.getContentText());

  if (!product || product.found === false) {
    return null;
  }

  return product;
}
```

---

## Column Mapping

### Sheet: "update stock"

| Column | Name | Type | Source | WooCommerce Field | API Response Key |
|--------|------|------|--------|-------------------|------------------|
| A | Image | Formula | API | _thumbnail_id | image_url |
| B | Distributor Music | Auto | API (taxonomy) | distributormusic | distributor_music |
| C | SKU | Manual | User Input | _sku | - |
| D | New Order Quantity | Manual | User Input | - | - |
| E | - | - | - | - | - |
| F | - | - | - | - | - |
| G | Depot Vente | Auto | API | _depot_vente | depot_vente |
| H | Current Stock | Auto | API | _stock | stock_quantity |
| I | Initial Quantity | Calculated | I = J + D | - | - |
| J | Initial Quantity Origin | Auto | API | _initial_quantity | initial_quantity |
| K | Stock Status | Auto | API | _stock_status | stock_status |
| L | Stock Quantity | Calculated | L = D + H - T - U - 1 | - | - |
| M | Status Text | Calculated | M = "arrivals" or "back in stock" | - | - |
| N | Date | Calculated | N = NOW() | - | - |
| O | Online Status | Auto | API | post_status | is_online |
| P-Q | - | - | - | - | - |
| R | Category | Manual | User Input | - | - |
| S | Week Number | Calculated | S = WEEKNUM(O) | - | - |
| T | Quantity Shelf | Auto | API | _total_shelves | shelf_quantity |
| U | Total Preorders | Auto | API | _total_preorders | total_preorders |
| V-Y | - | - | - | - | - |
| Z | Image URL | Auto | API | _thumbnail_id | image_url |

### Data Preservation on Clear

**clearCalculatedData()** preserves:
- ✅ Column C (SKU) - Manual input
- ✅ Column D (New Order Quantity) - Manual input
- ❌ All other columns cleared (including B which is re-fetched from API)

---

## Deployment Pipeline

### WordPress Plugin (yoyaku-api-connector)

#### Local Development
```bash
# Location
cd /Users/yoyaku/repos/yoyaku-api-connector/

# Edit files
vim includes/class-product-stock-endpoint.php

# Git commit
git add .
git commit -m "feat: Add distributor_music to API response"
git push origin main
```

#### Production Deployment
```bash
# Method 1: SFTP (Recommended - works with all file permissions)
sshpass -p 'PPH#vijayftp#258' scp -r \
  /Users/yoyaku/repos/yoyaku-api-connector/* \
  yoyakudev@134.122.80.6:public_html/wp-content/plugins/yoyaku-api-connector/

# Method 2: SSH + rsync (for 664 files only)
rsync -avz --progress \
  /Users/yoyaku/repos/yoyaku-api-connector/ \
  yoyaku-cloudways:/home/master/applications/jfnkmjmfer/public_html/wp-content/plugins/yoyaku-api-connector/

# Clear caches
ssh yoyaku-cloudways "cd /home/master/applications/jfnkmjmfer/public_html && \
  wp cache flush && wp breeze purge --cache=all"

# Purge Cloudflare (CRITICAL!)
~/tools/01-core/cloudflare-purge-cache.sh yoyaku api
```

### Google Apps Script (wp-import-dashboard)

#### Local Development
```bash
# Location
cd /Users/yoyaku/repos/wp-import-dashboard/

# Edit files
vim api-stock-functions-v2-webmaster.js

# Git commit
git add .
git commit -m "feat: Add distributor_music to column B"
git push origin main
```

#### Production Deployment (CLASP)
```bash
# Login (if needed)
clasp login

# Push to Google Apps Script
clasp push --force

# Create version
clasp version "Add distributor_music to column B (API v1.4.2)"

# Users must refresh browser (Cmd+Shift+R) to get new code
```

---

## Performance Optimization

### Query Optimization

**Before v1.3.0:**
- 9 queries × 100 products = 900 queries
- Total time: ~5,000-10,000ms

**After v1.3.0:**
- 1 query × 100 products = 100 queries
- Total time: ~500-1,000ms
- **Improvement:** 89% reduction!

### Caching Strategy

**Database Level:**
- MySQL query cache: Enabled
- InnoDB buffer pool: 1GB

**Application Level:**
- WordPress object cache: Enabled
- Breeze page cache: Enabled

**CDN Level:**
- Cloudflare edge cache: 31 days TTL
- **CRITICAL:** Must purge after API updates

### Cache Purge Workflow

```bash
# After ANY API plugin deployment:
~/tools/01-core/cloudflare-purge-cache.sh yoyaku api

# Verification (wait 10 seconds):
curl -s "https://yoyaku.io/wp-json/yoyaku/v1/product-stock-data/YOYAKU012" | jq '.distributor_music'
# Expected: "yydistribution"
```

---

## Security Architecture

### API Authentication

**Current:** None required (public read-only endpoint)

**Reasoning:**
- Data is non-sensitive (product stock info)
- Public product catalog
- No customer data exposed
- No write operations

**Future:** If needed, can add:
- API key authentication
- Rate limiting (per IP)
- OAuth 2.0

### Input Sanitization

**WordPress Plugin:**
```php
// SKU parameter sanitized
$sku = strtoupper($request['sku']);  // Convert to uppercase
$sku = sanitize_text_field($sku);     // Remove HTML/PHP

// SQL injection protection
$wpdb->prepare($query, $sku);         // Prepared statement
```

**Google Apps Script:**
```javascript
// URL encoding
const url = `${API_BASE}/${encodeURIComponent(sku)}`;

// Empty SKU validation
if (!sku || sku === '' || sku.toString().trim() === '') {
  continue; // Skip empty SKUs
}
```

### CORS Headers

```http
Access-Control-Allow-Origin: *
Cache-Control: no-cache, must-revalidate, max-age=0
```

**Purpose:** Allow Google Apps Script to fetch from WordPress API

---

## Changelog

### v1.2.0 - 2025-10-23
- ✅ Added `distributor_music` taxonomy to column B
- ✅ API v1.4.2 integration
- ✅ Updated clearCalculatedData() (preserves C, D only)

### v1.1.1 - 2025-10-08
- ✅ OpenAI direct metadata parser
- ✅ Eliminated Make.com dependency

### v1.0.0 - 2025-08-21
- ✅ Initial API Direct migration
- ✅ Phase 1 complete (4/11 imports)

---

**Documentation Complete**
**Author**: Benjamin Belaga (ben@yoyaku.fr)
**Company**: YOYAKU SARL
**Last Updated**: 2025-10-23
