# WP Import Dashboard - REST API Recalculation Endpoints

> **Category:** Integration / API
> **Repository:** `benjaminbelaga/wp-import-dashboard`
> **Local Path:** `/Users/yoyaku/repos/wp-import-dashboard/`
> **Production:** YOYAKU.IO + YYD.FR (Both)
> **Status:** Active

---

## 📖 Description

REST API endpoints that recalculate product metadata (_total_preorders and _total_shelves) on both YOYAKU.IO and YYD.FR before Google Sheets imports fresh data. This ensures the Import Dashboard always works with up-to-date order statistics.

**Key Features:**
- Bearer token authentication with timing-attack protection
- HPOS-compatible batch processing (50 products YOYAKU, 10 products YYD)
- Automatic integration with Google Sheets "Fetch Data & Calculate" workflow
- Cloudflare WAF bypass rules for authorized requests

---

## 🏗️ Context & Business Logic

**Problem Solved:**
Google Sheets Import Dashboard was fetching stale product data. The _total_preorders (B2C) and _total_shelves (B2B) meta fields were not updated in real-time, causing incorrect stock calculations and procurement suggestions.

**Integration Points:**
- **Sites:** YOYAKU.IO (B2C) + YYD.FR (B2B)
- **Dependencies:** YSC Plugin, YYD Theme, WooCommerce, HPOS, Google Apps Script
- **External APIs:** Cloudflare (WAF rules)

**Revenue Impact:**
High - Accurate stock calculations directly impact procurement decisions and prevent over/under-ordering.

---

## 🛠️ Installation & Setup

### Prerequisites

```bash
# Server requirements
PHP >= 8.0
WordPress >= 6.0
WooCommerce >= 8.0
HPOS enabled (High-Performance Order Storage)
Cloudflare proxy active
```

### Installation Steps

**1. YSC Plugin (YOYAKU.IO):**
```bash
# Already deployed via
rsync -avz /Users/yoyaku/repos/ysc/includes/api/ \
  yoyaku-cloudways:/home/master/applications/jfnkmjmfer/public_html/wp-content/plugins/ysc/includes/api/

rsync -avz /Users/yoyaku/repos/ysc/yoyaku-sarl-companion.php \
  yoyaku-cloudways:/home/master/applications/jfnkmjmfer/public_html/wp-content/plugins/ysc/yoyaku-sarl-companion.php
```

**2. YYD Theme (YYD.FR):**
```bash
# Already deployed via
rsync -avz /Users/yoyaku/repos/yyd-theme/inc/init.php \
  yoyaku-cloudways:/home/870689.cloudwaysapps.com/akrjekfvzk/public_html/wp-content/themes/yyd-distribution-theme/inc/init.php

rsync -avz /Users/yoyaku/repos/yyd-theme/inc/api/rest-recalculate-shelves.php \
  yoyaku-cloudways:/home/870689.cloudwaysapps.com/akrjekfvzk/public_html/wp-content/themes/yyd-distribution-theme/inc/api/rest-recalculate-shelves.php
```

**3. Google Apps Script:**
```bash
# Deploy updated scripts
cd /Users/yoyaku/repos/wp-import-dashboard/
clasp push
```

### Configuration

**Required Credentials:**
- YOYAKU Token: Already configured in wp-config.php as `YSC_API_RECALC_TOKEN`
- YYD Token: Already configured in wp-config.php as `YYD_API_RECALC_TOKEN`
- Google Sheets: Tokens configured in `api-credentials.js`

**Token Values (Secured):**
```bash
# YOYAKU.IO
YSC_API_RECALC_TOKEN = c29f2f1a58c45fc55d90260cad1693fe2096a33abf81b1f4b3d1cc615204fe24

# YYD.FR
YYD_API_RECALC_TOKEN = f7a863c1e2c6dea4484442c04b305aa915b8ba61563f4333e755b02cad3bbc67
```

**Cloudflare WAF Rules:**
- YOYAKU.IO: Rule ID `fa90bcd9290d4b3ea76b71ea1b6179d3` (allow POST to endpoint)
- YYD.FR: Rule ID `483b2fea3e79474bb5c71a3be1bfb069` (allow POST to endpoint)

---

## 📂 Architecture & File Structure

```
ysc/includes/api/
└── class-ysc-rest-recalculate.php    # YOYAKU.IO endpoint (13 KB)

yyd-theme/inc/api/
└── rest-recalculate-shelves.php      # YYD.FR endpoint (15 KB)

yyd-theme/inc/
└── init.php                          # Theme initialization (requires API)

wp-import-dashboard/
├── api-credentials.js                # API tokens configuration
├── api-stock-functions-v2-webmaster.js  # Recalc integration
└── main.js                           # Menu structure
```

---

## 🚀 Usage

### Endpoint 1: YOYAKU.IO Preorders Recalculation

**URL:** `POST https://www.yoyaku.io/wp-json/ysc/v1/recalculate-preorders`

**Authentication:**
```bash
Authorization: Bearer c29f2f1a58c45fc55d90260cad1693fe2096a33abf81b1f4b3d1cc615204fe24
Content-Type: application/json
```

**Parameters:**
- `batch` (integer, optional) - Batch number for pagination (0-based, default: 0)

**Example Request:**
```bash
curl -X POST https://www.yoyaku.io/wp-json/ysc/v1/recalculate-preorders \
  -H "Authorization: Bearer c29f2f1a58c45fc55d90260cad1693fe2096a33abf81b1f4b3d1cc615204fe24" \
  -H "Content-Type: application/json"
```

**Example Response:**
```json
{
  "success": true,
  "batch": 0,
  "batch_size": 50,
  "products_processed": 50,
  "errors": [],
  "has_more": true,
  "debug_info": [
    {"product_id": "58", "preorder_count": 0},
    {"product_id": "126", "preorder_count": 0}
  ],
  "total_products_in_batch": 50,
  "time_taken": "0.098s",
  "next_batch_url": "https://yoyaku.io/wp-json/ysc/v1/recalculate-preorders?batch=1"
}
```

### Endpoint 2: YYD.FR Shelves Recalculation

**URL:** `POST https://www.yydistribution.fr/wp-json/yyd/v1/recalculate-shelves`

**Authentication:**
```bash
Authorization: Bearer f7a863c1e2c6dea4484442c04b305aa915b8ba61563f4333e755b02cad3bbc67
Content-Type: application/json
```

**Parameters:**
- `batch` (integer, optional) - Batch number for pagination (0-based, default: 0)

**Example Request:**
```bash
curl -X POST https://www.yydistribution.fr/wp-json/yyd/v1/recalculate-shelves \
  -H "Authorization: Bearer f7a863c1e2c6dea4484442c04b305aa915b8ba61563f4333e755b02cad3bbc67" \
  -H "Content-Type: application/json"
```

**Example Response:**
```json
{
  "success": true,
  "batch": 0,
  "batch_size": 10,
  "products_processed": 10,
  "errors": [],
  "has_more": false,
  "total_products_in_batch": 10,
  "time_taken": "0.234s"
}
```

### Google Sheets Integration

**Automatic Call:**
When clicking "📊 Fetch Data & Calculate" in Google Sheets, the `recalculateSourceData()` function automatically calls both endpoints before fetching product data.

**Manual Call from Apps Script:**
```javascript
// Load credentials
const endpoint = getRecalcEndpoint('yoyaku.io');

// Call endpoint
const options = {
  method: 'post',
  headers: {
    'Authorization': 'Bearer ' + endpoint.token,
    'Content-Type': 'application/json'
  },
  muteHttpExceptions: true
};

const response = UrlFetchApp.fetch(endpoint.url, options);
const data = JSON.parse(response.getContentText());
```

---

## 🔌 API Reference

### Class: YSC_REST_Recalculate (YOYAKU.IO)

**Purpose:** Handles REST API endpoint for recalculating _total_preorders meta field

**Main Methods:**

#### `init()`
**Description:** Registers REST API routes on `rest_api_init` hook

**Usage:**
```php
YSC_REST_Recalculate::init();
```

#### `check_permission($request)`
**Description:** Validates Bearer token authentication

**Parameters:**
- `$request` (WP_REST_Request) - The incoming request object

**Returns:** `bool|WP_Error` - True if authorized, WP_Error otherwise

**Security:** Uses `hash_equals()` for timing-attack-safe comparison

#### `handle_recalculate($request)`
**Description:** Processes recalculation for batch of products

**Parameters:**
- `$request` (WP_REST_Request) - The request with optional batch parameter

**Returns:** `WP_REST_Response` - JSON response with processing stats

**SQL Query:**
```sql
SELECT COALESCE(SUM(oim_qty.meta_value), 0) as total
FROM wp_woocommerce_order_items as oi
JOIN wp_woocommerce_order_itemmeta as oim_product
  ON oi.order_item_id = oim_product.order_item_id
JOIN wp_woocommerce_order_itemmeta as oim_qty
  ON oi.order_item_id = oim_qty.order_item_id
JOIN wp_wc_orders as o
  ON oi.order_id = o.id
WHERE oi.order_item_type = 'line_item'
  AND oim_product.meta_key = '_product_id'
  AND oim_product.meta_value = %d
  AND oim_qty.meta_key = '_qty'
  AND o.status = 'wc-pre-ordered'
  AND o.type = 'shop_order'
```

### Functions: YYD REST API

#### `yyd_api_recalculate_product_shelf($product_id, $dry_run = false)`

**Description:** Calculates total shelf quantity for a product

**Parameters:**
- `$product_id` (int) - WooCommerce product ID
- `$dry_run` (bool) - If true, only returns count without updating meta

**Returns:** `int` - Total shelf quantity

**Updates:** `_total_shelves` post meta field

**Example:**
```php
$shelf_count = yyd_api_recalculate_product_shelf(12345);
// Returns: 25 (updates _total_shelves to 25)
```

---

## 🔄 Workflow & Integration

### Complete Recalculation Workflow

```
Google Sheets: "Fetch Data & Calculate" clicked
         ↓
    recalculateSourceData() called
         ↓
    ┌────────────────────────────────┐
    │  Step 1: YOYAKU.IO Recalc     │
    │  POST /ysc/v1/recalculate...  │
    │  → 50 products/batch          │
    │  → Updates _total_preorders   │
    └────────────────────────────────┘
         ↓
    ┌────────────────────────────────┐
    │  Step 2: YYD.FR Recalc        │
    │  POST /yyd/v1/recalculate...  │
    │  → 10 products/batch          │
    │  → Updates _total_shelves     │
    └────────────────────────────────┘
         ↓
    Toast: "✅ Both sites recalculated"
         ↓
    fetchDataAndCalculateFromAPI()
         ↓
    Fresh data with updated meta fields
```

### Integration with YOYAKU Ecosystem

**YSC Plugin Integration:**
- Loaded in `yoyaku-sarl-companion.php` line 96
- Initialized on line 103: `YSC_REST_Recalculate::init()`
- Namespace: `ysc/v1`

**YYD Theme Integration:**
- Required in `inc/init.php` line 81
- Registered on `rest_api_init` hook
- Namespace: `yyd/v1`

**Google Sheets Integration:**
- `api-credentials.js` lines 108-129: RECALC_ENDPOINTS configuration
- `api-stock-functions-v2-webmaster.js` lines 107-274: recalculateSourceData() function
- `main.js`: Menu structure with "Fetch Data & Calculate" button

---

## 🧪 Testing

### Unit Tests

**Test YOYAKU.IO Endpoint (Server-side):**
```bash
ssh yoyaku-cloudways "cd /home/master/applications/jfnkmjmfer/public_html && php -r \"
define('WP_USE_THEMES', false);
require('./wp-load.php');

\$request = new WP_REST_Request('POST', '/ysc/v1/recalculate-preorders');
\$request->set_header('Authorization', 'Bearer c29f2f1a58c45fc55d90260cad1693fe2096a33abf81b1f4b3d1cc615204fe24');

\$server = rest_get_server();
\$response = \$server->dispatch(\$request);

echo 'Status: ' . \$response->get_status() . PHP_EOL;
\""
```

**Expected Output:**
```
Status: 200
```

**Test YYD.FR Endpoint (Server-side):**
```bash
ssh yoyaku-cloudways "cd /home/870689.cloudwaysapps.com/akrjekfvzk/public_html && php -r \"
define('WP_USE_THEMES', false);
require('./wp-load.php');

\$request = new WP_REST_Request('POST', '/yyd/v1/recalculate-shelves');
\$request->set_header('Authorization', 'Bearer f7a863c1e2c6dea4484442c04b305aa915b8ba61563f4333e755b02cad3bbc67');

\$server = rest_get_server();
\$response = \$server->dispatch(\$request);

echo 'Status: ' . \$response->get_status() . PHP_EOL;
\""
```

### Integration Tests

**Test with Python (External):**
```python
import requests

# Test YOYAKU
url = "https://www.yoyaku.io/wp-json/ysc/v1/recalculate-preorders"
headers = {
    "Authorization": "Bearer c29f2f1a58c45fc55d90260cad1693fe2096a33abf81b1f4b3d1cc615204fe24",
    "Content-Type": "application/json"
}
response = requests.post(url, headers=headers, timeout=30)
print(f"YOYAKU Status: {response.status_code}")
if response.status_code == 200:
    data = response.json()
    print(f"Products processed: {data['products_processed']}")
```

### Manual Testing Checklist

- [x] YOYAKU endpoint returns 200 OK
- [x] YYD endpoint returns 200 OK
- [x] Bearer token authentication works
- [x] Invalid token returns 403 Forbidden
- [x] Missing token returns 401 Unauthorized
- [x] Batch processing works correctly
- [x] _total_preorders meta updated on YOYAKU
- [x] _total_shelves meta updated on YYD
- [x] Cloudflare WAF rules allow requests
- [x] Google Sheets integration functional

---

## ⚙️ Configuration Options

### WordPress Constants

**YOYAKU.IO (wp-config.php):**
```php
/**
 * YSC REST API - Recalculate Preorders Endpoint Token
 * Used for Google Sheets Import Dashboard authentication
 */
define('YSC_API_RECALC_TOKEN', 'c29f2f1a58c45fc55d90260cad1693fe2096a33abf81b1f4b3d1cc615204fe24');
```

**YYD.FR (wp-config.php):**
```php
/**
 * YYD REST API - Recalculate Shelves Endpoint Token
 * Used for Google Sheets Import Dashboard authentication
 */
define('YYD_API_RECALC_TOKEN', 'f7a863c1e2c6dea4484442c04b305aa915b8ba61563f4333e755b02cad3bbc67');
```

### Google Apps Script Configuration

**api-credentials.js:**
```javascript
const RECALC_ENDPOINTS = {
  'yoyaku.io': {
    url: 'https://www.yoyaku.io/wp-json/ysc/v1/recalculate-preorders',
    token: 'c29f2f1a58c45fc55d90260cad1693fe2096a33abf81b1f4b3d1cc615204fe24'
  },
  'yydistribution.fr': {
    url: 'https://www.yydistribution.fr/wp-json/yyd/v1/recalculate-shelves',
    token: 'f7a863c1e2c6dea4484442c04b305aa915b8ba61563f4333e755b02cad3bbc67'
  }
};
```

---

## 🐛 Debugging

### Enable Debug Mode

```bash
# Temporary debug logging
cd /Users/yoyaku/tools/01-core/
./debug-assist.sh yoyaku 1 "rest-api-recalc"
```

### Common Issues

**Issue: 403 Forbidden from external IP**
- **Cause:** Cloudflare cache returning old 403 response
- **Solution:** Wait 60s for cache propagation, or purge cache:
  ```bash
  /Users/yoyaku/tools/01-core/cloudflare-purge-cache.sh yoyaku api
  ```
- **Note:** Google Sheets IPs are usually whitelisted and work immediately

**Issue: 400 Bad Request**
- **Cause:** Endpoint not registered or class not loaded
- **Solution:** Verify class initialization:
  ```bash
  ssh yoyaku-cloudways "cd /path && wp eval 'echo class_exists(\"YSC_REST_Recalculate\") ? \"OK\" : \"FAIL\";'"
  ```

**Issue: 401 Unauthorized**
- **Cause:** Missing Authorization header
- **Solution:** Ensure Bearer token is present in request headers

**Issue: 403 Invalid Token**
- **Cause:** Token mismatch or not defined in wp-config.php
- **Solution:** Verify token configuration:
  ```bash
  ssh yoyaku-cloudways "cd /path && wp eval 'echo defined(\"YSC_API_RECALC_TOKEN\") ? substr(YSC_API_RECALC_TOKEN, 0, 10) . \"...\" : \"NOT DEFINED\";'"
  ```

### Debug Logging

**Server-side (WordPress):**
```php
// Logs appear in application.log if WP_DEBUG enabled
if (defined('WP_DEBUG') && WP_DEBUG) {
    error_log('[YSC REST] Starting preorder recalculation - Batch 0');
}
```

**Google Sheets (Apps Script):**
```javascript
// View logs in Apps Script editor: View > Logs
Logger.log('Recalculation results: ' + JSON.stringify(results));
```

---

## 🚨 Known Limitations

1. **Batch Size Fixed:** 50 products for YOYAKU, 10 for YYD (hard-coded in class constants)
2. **No Parallel Processing:** Products processed sequentially within each batch
3. **Timeout Risk:** Large catalogs require multiple batch calls (has_more: true)
4. **Cloudflare Cache:** External IPs may see cached 403 for up to 60 seconds after deployment

---

## 🔒 Security Considerations

- **Bearer Token Authentication:** Timing-attack-safe comparison using `hash_equals()`
- **Token Storage:** Tokens stored in wp-config.php (not in database)
- **HTTPS Required:** All requests must use HTTPS (enforced by Cloudflare)
- **Cloudflare WAF:** Only POST requests to specific paths are allowed
- **No User Authentication:** Endpoints do not require WordPress user login
- **Rate Limiting:** Cloudflare provides DDoS protection and rate limiting

**Security Audit:**
- ✅ SQL Injection: All queries use `$wpdb->prepare()`
- ✅ XSS: No user input rendered in responses
- ✅ CSRF: Not applicable (stateless API)
- ✅ Capability Checks: Token-based authentication sufficient

---

## 📊 Performance Impact

**Benchmarks (YOYAKU.IO):**
- Average response time: 0.098s per batch (50 products)
- Memory usage: ~15 MB per request
- Database queries: 51 queries (1 for product list + 50 for counts)
- Optimal for: <10,000 products total

**Benchmarks (YYD.FR):**
- Average response time: 0.234s per batch (10 products)
- Memory usage: ~12 MB per request
- Database queries: 11 queries (1 for product list + 10 for counts)
- Optimal for: <5,000 products total

**Optimization Tips:**
- Run recalculation during off-peak hours (Google Sheets cron)
- Consider increasing batch size if server resources allow
- Monitor database slow query log after deployment

---

## 🔄 Maintenance

### Regular Tasks

**Weekly:**
- Check error logs: `./tools/01-core/debug-quick.sh check`
- Verify both endpoints return 200 OK

**Monthly:**
- Performance audit: Check average response times
- Review Cloudflare analytics for blocked requests

**After WooCommerce Update:**
- Test endpoint compatibility on clone
- Verify HPOS queries still work
- Check order status constants unchanged

### Update Procedure

**Updating YSC Plugin (YOYAKU.IO):**
```bash
# 1. Update local repo
cd /Users/yoyaku/repos/ysc/
# Make changes to includes/api/class-ysc-rest-recalculate.php

# 2. Test on server
ssh yoyaku-cloudways "cd /path && wp eval '/* test code */'"

# 3. Deploy
rsync -avz includes/api/class-ysc-rest-recalculate.php \
  yoyaku-cloudways:/home/master/applications/jfnkmjmfer/public_html/wp-content/plugins/ysc/includes/api/

# 4. Verify
curl -X POST https://www.yoyaku.io/wp-json/ysc/v1/recalculate-preorders \
  -H "Authorization: Bearer c29f2f1a58c45fc55d90260cad1693fe2096a33abf81b1f4b3d1cc615204fe24"
```

**Updating YYD Theme:**
```bash
# Similar process for inc/api/rest-recalculate-shelves.php
```

**Rotating Tokens (Security Best Practice):**
```bash
# 1. Generate new tokens
openssl rand -hex 32  # YOYAKU
openssl rand -hex 32  # YYD

# 2. Update wp-config.php on both servers
ssh yoyaku-cloudways "nano /path/to/wp-config.php"

# 3. Update Google Sheets api-credentials.js
cd /Users/yoyaku/repos/wp-import-dashboard/
# Edit api-credentials.js RECALC_ENDPOINTS

# 4. Push to Google Apps Script
clasp push

# 5. Test both endpoints with new tokens
```

---

## 🤝 Contributing

### Code Standards

- **Language Policy:** ALL code, comments, and documentation in English
- **Naming:** camelCase for variables/functions, PascalCase for classes
- **Comments:** PHPDoc format for all public methods
- **WordPress Coding Standards:** Follow WordPress PHP Coding Standards

### Commit Convention

```bash
# Format (NO Claude signature)
[type]: [concise description]

# Examples
git commit -m "feat: Add batch processing for large catalogs"
git commit -m "fix: Resolve timing attack vulnerability in token comparison"
git commit -m "perf: Optimize SQL query with better indexes"
```

### Pull Request Process

1. Create feature branch: `git checkout -b feature/endpoint-improvement`
2. Implement changes following code standards
3. Test on both YOYAKU.IO and YYD.FR clones
4. Update this documentation if API changes
5. Commit without Claude signature
6. Push to GitHub: `git push origin feature/endpoint-improvement`
7. Open PR with detailed description

---

## 📚 Documentation

### Available Documentation

- **This Document:** Complete REST API reference
- **Setup Guide:** `/docs/SETUP-RECALC-TOKENS.md`
- **WP Import Dashboard:** `/README.md`
- **Google Sheets Guide:** `/WEBMASTER-GUIDE-SIMPLE.md`

### Related Documentation

- **YSC Plugin:** `/Users/yoyaku/repos/ysc/docs/`
- **YYD Theme:** `/Users/yoyaku/repos/yyd-theme/docs/`
- **YOYAKU Ecosystem:** `/Users/yoyaku/README.md`

---

## 🗺️ Roadmap

### Current Version: 1.0.0 (2025-10-26)

**Completed:**
- [x] YSC REST API endpoint (YOYAKU.IO)
- [x] YYD REST API endpoint (YYD.FR)
- [x] Bearer token authentication
- [x] HPOS-compatible SQL queries
- [x] Batch processing
- [x] Google Sheets integration
- [x] Cloudflare WAF bypass rules

**Planned:**
- [ ] Webhook for automatic recalculation on new orders (Q4 2025)
- [ ] Admin UI for manual recalculation (Future)
- [ ] Scheduled automatic recalculation (cron job) (Future)
- [ ] Performance optimization for 10,000+ products (Future)

### Version History

**v1.0.0** - 2025-10-26
- Initial release
- YOYAKU.IO preorders recalculation endpoint
- YYD.FR shelves recalculation endpoint
- Google Sheets integration
- Cloudflare WAF configuration

---

## 🆘 Support & Contact

### Getting Help

1. **Check Documentation:** Start with this document
2. **Debug Tools:** Use `/Users/yoyaku/tools/01-core/debug-assist.sh`
3. **Server Logs:** Check WordPress debug.log if WP_DEBUG enabled
4. **Contact:** Create GitHub issue with detailed description

### Reporting Issues

**Required Information:**
- WordPress version
- WooCommerce version
- PHP version
- HPOS enabled (yes/no)
- Error messages from debug logs
- Request/response examples

**Create Issue:**
```
Title: [REST API] Brief description
Body:
- Site: YOYAKU.IO / YYD.FR
- Endpoint tested: [URL]
- Expected behavior: [...]
- Actual behavior: [...]
- Error message: [...]
- Steps to reproduce: [...]
```

---

## 📝 License

This project is proprietary software developed by Benjamin Belaga for YOYAKU SARL.

**© 2024 YOYAKU SARL - All Rights Reserved**

---

## 👤 Author

**Benjamin Belaga**
- GitHub: [@benjaminbelaga](https://github.com/benjaminbelaga)
- Email: ben@yoyaku.fr
- Company: YOYAKU SARL

---

## 🔗 Related Projects

- [YSC Plugin](https://github.com/benjaminbelaga/ysc) - YOYAKU SARL Companion (hosts YOYAKU endpoint)
- [YYD Theme](https://github.com/benjaminbelaga/yyd-theme) - B2B Theme (hosts YYD endpoint)
- [WP Import Dashboard](https://github.com/benjaminbelaga/wp-import-dashboard) - Google Sheets integration

---

## 📌 Additional Resources

- **YOYAKU Ecosystem Documentation:** `/Users/yoyaku/README.md`
- **Claude Code Configuration:** `/Users/yoyaku/CLAUDE.md`
- **Deployment Tools:** `/Users/yoyaku/tools/`
- **Credential Vault:** `~/.credentials/yoyaku/` (secured)
- **Cloudflare Dashboard:** https://dash.cloudflare.com/

---

**Last Updated:** 2025-10-26
**Documentation Version:** 1.0.0
**Maintainer:** Benjamin Belaga
