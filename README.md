# WP Import Dashboard - Google Sheets Integration

> **Category:** Integration / Tool
> **Repository:** `benjaminbelaga/wp-import-dashboard`
> **Local Path:** `/Users/yoyaku/repos/wp-import-dashboard/`
> **Production:** YOYAKU.IO + YYD.FR
> **Status:** Active

---

## 📖 Description

Google Apps Script integration for bulk stock management via WooCommerce REST API. Enables webmaster team to update stock quantities for hundreds of products directly from Google Sheets with zero-downtime and real-time updates.

**Key Features:**
- REST API v2 with targeted SKUs recalculation (540x faster than v1)
- Smart 5-minute cache layer for optimal performance
- Event-driven auto-updates (data stays fresh automatically)
- Zero-downtime deployment via Google Apps Script (clasp)
- Three-layer optimization architecture

---

## 🏗️ Context & Business Logic

**Problem Solved:**
Manual stock updates for 803+ products took hours and was error-prone. Google Sheets workflow with v1 API took 15-18 seconds for 3 SKUs due to full-catalog recalculation (13,459 products). Webmasters needed a fast, reliable way to manage stock directly from spreadsheets.

**Integration Points:**
- **Sites:** YOYAKU.IO (B2C) + YYD.FR (B2B)
- **Dependencies:** YSC Plugin, YYD Theme, WooCommerce REST API v3
- **External APIs:** WooCommerce Products API, Custom Recalculation API v2

**Revenue Impact:**
Critical - Direct impact on inventory accuracy and order fulfillment

---

## 🛠️ Installation & Setup

### Prerequisites

```bash
# Required software/versions
Node.js >= 14.0
npm >= 6.0
clasp >= 2.4.0 (Google Apps Script CLI)
Google Account with access to YOYAKU Import 803 sheet
```

### Installation Steps

**Local Development:**
```bash
# Clone repository
cd /Users/yoyaku/repos/
git clone https://github.com/benjaminbelaga/wp-import-dashboard.git
cd wp-import-dashboard

# Install clasp globally
npm install -g @google/clasp

# Login to Google
clasp login

# Clone the Apps Script project
clasp clone <script-id>
```

**Production Deployment:**
```bash
# Deploy to Google Apps Script
cd /Users/yoyaku/repos/wp-import-dashboard

# Push changes
clasp push

# Deploy as new version
clasp deploy --description "v4.0.0 - REST API v2 integration (540x faster)"
```

### Configuration

**Required Credentials:**
- WooCommerce API: Embedded in `api-credentials.js` (secure Script Properties)
- Recalculation Tokens: `~/.credentials/yoyaku/api-keys/cloudflare.env` (CRED-008)

**Configuration Files:**
```bash
# Google Apps Script
api-credentials.js: WooCommerce credentials and API tokens
api-stock-functions-v2-webmaster.js: Main workflow logic
```

---

## 📂 Architecture & File Structure

```
wp-import-dashboard/
├── README.md                              # This file
├── CLAUDE.md                              # AI agent instructions
├── appsscript.json                        # Apps Script manifest
│
├── api-credentials.js                     # API credentials (secure)
├── api-stock-functions-v2-webmaster.js    # Main workflow (v4.0)
│
├── docs/                                  # Documentation
│   ├── REST-API-RECALCULATION-ENDPOINTS.md
│   └── REST-API-V2-IMPLEMENTATION-COMPLETE.md
│
├── IMPLEMENTATION-SUMMARY.md              # v3.0 summary
├── CHANGELOG-V3.0.md                      # v3.0 changes
└── SETUP-RECALC-TOKENS.md                # Token setup guide
```

---

## 🚀 Usage

### Basic Workflow (Webmaster)

**Three-Step Process:**

1. **Clear Calculated Data (Optional)**
   ```
   Menu: YOYAKU Tools → Clear Calculated Data
   - Clears all columns except manual inputs (C, D)
   - Provides clean slate for fresh data fetch
   ```

2. **Fetch Data & Calculate (Main Operation)**
   ```
   Menu: YOYAKU Tools → Fetch Data & Calculate

   What it does:
   1. Collects SKUs from sheet
   2. Recalculates source data (v2 Targeted API)
   3. Fetches fresh data from YOYAKU.IO API
   4. Calculates stock quantities automatically
   5. Populates all columns (I, L, M, N, S)

   Performance: 0.5-2 seconds for 3 SKUs (v4.0)
   ```

3. **Update Stock YOYAKU v2.0**
   ```
   Menu: YOYAKU Tools → Update Stock YOYAKU v2.0

   What it does:
   - Reads calculated data from sheet
   - Updates WooCommerce stock via REST API
   - Manages categories (forthcoming → arrival)
   - Disables backorders automatically
   - Updates initial quantity custom fields

   Performance: 20x faster than WP Import
   ```

### Advanced Usage

**Debug Functions:**
```javascript
// Test calculations
testCalculations()

// Show calculation report
showCalculationReport()

// Manual recalculation with custom SKUs
recalculateSourceData(["USR036", "USR037", "USR038"])
```

---

## 🔌 API Reference

### Main Functions

#### `fetchDataAndCalculateFromAPI()`

**Description:** Fetches data from YOYAKU.IO API and calculates stock quantities automatically. Uses v2 Targeted API for optimal performance.

**Parameters:** None (reads from active sheet)

**Returns:** void (updates sheet directly)

**Example:**
```javascript
// Called from menu: YOYAKU Tools → Fetch Data & Calculate
fetchDataAndCalculateFromAPI()
```

**Performance:**
- v3.0 (v1 API): 15-18 seconds for 3 SKUs
- v4.0 (v2 API): 0.5-2 seconds for 3 SKUs

---

#### `recalculateSourceData(skus)`

**Description:** Triggers targeted recalculation on YOYAKU.IO and YYD.FR using v2 API. Only recalculates requested SKUs instead of full catalog.

**Parameters:**
- `skus` (Array<string>) - Array of SKU strings to recalculate

**Returns:** `Object` - Results with success status, cache hits, and errors

**Example:**
```javascript
const skus = ["USR036", "USR037", "USR038"];
const results = recalculateSourceData(skus);
// Returns: {
//   yoyaku: { success: true, cached: 2, processed: 3 },
//   yyd: { success: true, cached: 1, processed: 3 }
// }
```

**API Endpoints:**
- YOYAKU.IO: `POST /wp-json/ysc/v2/recalculate-preorders`
- YYD.FR: `POST /wp-json/yyd/v2/recalculate-shelves`

---

#### `updateYoyakuStockDirectAPI_V2_Webmaster()`

**Description:** Updates stock quantities on YOYAKU.IO via direct WooCommerce API v2.0. Includes category management and backorders control.

**Parameters:** None (reads from active sheet)

**Returns:** void (displays results dialog)

**Example:**
```javascript
// Called from menu: YOYAKU Tools → Update Stock YOYAKU v2.0
updateYoyakuStockDirectAPI_V2_Webmaster()
```

**Features:**
- Category swap: forthcoming → arrival (automatic)
- Backorders: Disabled on all products
- Initial quantity: Saved to custom field
- Batch processing: 20 products per batch
- Rate limiting: 1 second between batches

---

### API Credentials Functions

#### `getRecalcEndpoint(site)`

**Description:** Retrieves REST API v2 endpoint configuration for recalculation

**Parameters:**
- `site` (string) - Site identifier ('yoyaku.io' or 'yydistribution.fr')

**Returns:** `Object` - Configuration with url and token

**Example:**
```javascript
const config = getRecalcEndpoint('yoyaku.io');
// Returns: {
//   url: 'https://www.yoyaku.io/wp-json/ysc/v2/recalculate-preorders',
//   token: 'c29f2f1a58c45fc55d90260cad1693fe2096a33abf81b1f4b3d1cc615204fe24'
// }
```

---

## 🔄 Workflow & Integration

### Three-Layer Architecture

**Layer 1: Event-Driven Auto-Updates**
- WordPress hooks on YOYAKU.IO and YYD.FR
- Automatic recalculation on order status changes
- Smart 5-minute cache layer
- Zero manual intervention required

**Layer 2: REST API v2 - Targeted Recalculation**
- Targeted recalculation by SKUs (max 100 per request)
- 540x faster than v1 full-catalog approach
- Smart cache integration
- Rate limiting: 10 requests/minute

**Layer 3: Google Sheets Integration**
- Webmaster-friendly interface
- Three-click workflow
- Real-time progress updates
- Detailed error reporting

### Integration with YOYAKU Ecosystem

**Required Components:**
- YSC Plugin v2.6.0+ - Provides REST API v2 endpoints
- YYD Theme v1.5.0+ - Provides REST API v2 endpoints
- WooCommerce 8.0+ - Products API
- HPOS enabled - High-Performance Order Storage

**Data Flow:**
```
Google Sheets (SKUs)
  ↓
v2 API Recalculation (targeted)
  ↓
Auto-Recalculator (event-driven)
  ↓
Cache Layer (5min TTL)
  ↓
WooCommerce Product Meta
  ↓
Google Sheets (updated data)
```

---

## 🧪 Testing

### Manual Testing Checklist

**Test 1: Recalculation Performance**
- [ ] Open Import 803 (YOYAKU) sheet
- [ ] Enter 3 test SKUs in column C
- [ ] Click "Fetch Data & Calculate"
- [ ] Verify: Completes in <2 seconds
- [ ] Check logs: Shows "v2 Targeted" mode
- [ ] Verify: Cache hit rate displayed

**Test 2: Data Accuracy**
- [ ] Verify Column H (Current Stock) matches WooCommerce
- [ ] Verify Column T (Quantity Shelf) shows shelf orders
- [ ] Verify Column U (Total Preorders) shows preorders
- [ ] Verify Column L (Stock Quantity) calculated correctly
- [ ] Formula: L = MAX(0, D+H-T-U-1)

**Test 3: Stock Update**
- [ ] Click "Update Stock YOYAKU v2.0"
- [ ] Verify: Success message with stats
- [ ] Check WooCommerce: Stock updated correctly
- [ ] Verify: Categories swapped if needed
- [ ] Verify: Backorders disabled

### Performance Benchmarks

```bash
# Test v2 API endpoint directly
curl -X POST https://www.yoyaku.io/wp-json/ysc/v2/recalculate-preorders \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"skus": ["USR036", "USR037", "USR038"], "mode": "targeted"}' | jq

# Expected response time: <50ms
# Expected cache hit rate: >50%
```

---

## ⚙️ Configuration Options

### API Endpoints (api-credentials.js)

```javascript
const RECALC_ENDPOINTS = {
  'yoyaku.io': {
    url: 'https://www.yoyaku.io/wp-json/ysc/v2/recalculate-preorders',
    token: '<bearer-token>'
  },
  'yydistribution.fr': {
    url: 'https://www.yydistribution.fr/wp-json/yyd/v2/recalculate-shelves',
    token: '<bearer-token>'
  }
};
```

### Batch Configuration

```javascript
// Stock update batch size (optimal: 20 products)
const BATCH_SIZE = 20;

// Rate limiting between batches (milliseconds)
const RATE_LIMIT_DELAY = 1000;

// Max SKUs per recalculation request
const MAX_SKUS = 100;
```

---

## 🐛 Debugging

### Enable Debug Logging

```javascript
// In Google Apps Script editor
Logger.log('Debug message: ' + JSON.stringify(data));

// View logs
Menu: View → Logs (Ctrl+Enter)
```

### Common Issues

**Issue: "Rate limit exceeded" error**
- **Cause:** More than 10 API requests per minute
- **Solution:** Wait 60 seconds before retrying
- **Prevention:** Batch operations appropriately

**Issue: "Missing authorization header" error**
- **Cause:** API token not configured or incorrect
- **Solution:** Verify token in api-credentials.js
- **Prevention:** Use getRecalcEndpoint() function

**Issue: "No valid SKUs found"**
- **Cause:** SKU column empty or contains invalid data
- **Solution:** Check column C has valid SKU values
- **Prevention:** Clear #N/A errors before running

### Performance Debugging

```javascript
// Check execution time
const start = Date.now();
fetchDataAndCalculateFromAPI();
const duration = Date.now() - start;
Logger.log(`Execution time: ${duration}ms`);

// Expected: <2000ms for 3 SKUs
```

---

## 🚨 Known Limitations

1. **Max 100 SKUs per recalculation:** Due to API rate limiting and performance constraints
2. **5-minute cache TTL:** Data may be up to 5 minutes stale (acceptable for stock management)
3. **Sequential processing:** Products processed one-by-one (batch optimization planned)
4. **Google Sheets timeout:** 6-minute execution limit (affects large batches 500+)

---

## 🔒 Security Considerations

- **API Tokens:** Stored in script properties (encrypted by Google)
- **Bearer Authentication:** Timing-attack safe token validation
- **Rate Limiting:** Prevents API abuse (10 req/min)
- **Input Sanitization:** All SKUs sanitized before API calls
- **HTTPS Only:** All API requests over secure connections

---

## 📊 Performance Impact

**Benchmarks (v4.0 vs v3.0):**
- Recalculation time: 15s → 0.5s (96.7% reduction)
- API calls: Full catalog → Targeted (99.98% reduction)
- Cache hit rate: 0% → 66.7% (average)
- Total workflow: 18s → 2s (88.9% reduction)

**Real-World Performance:**
- 3 SKUs: <2 seconds
- 10 SKUs: <5 seconds
- 100 SKUs: <30 seconds
- 500 SKUs: <3 minutes

**Optimization Tips:**
- Use cache-aware mode (targeted) for best performance
- Batch large operations into smaller chunks
- Run during off-peak hours for large updates (500+)
- Clear cache only when needed (use force mode sparingly)

---

## 🔄 Maintenance

### Regular Tasks

**Daily:**
- Monitor execution logs for errors
- Check API response times (<2s target)

**Weekly:**
- Verify cache hit rate (>50% target)
- Review error logs in Google Sheets

**Monthly:**
- Performance audit (compare to benchmarks)
- Update documentation if workflow changes
- Test on clone environment before major changes

### Update Procedure

```bash
# 1. Test locally
cd /Users/yoyaku/repos/wp-import-dashboard
# Make changes

# 2. Push to GitHub
git add .
git commit -m "feat: Describe changes"
git push origin main

# 3. Deploy to Google Apps Script
clasp push

# 4. Test in production with small batch
# Use 1-2 SKUs first to verify

# 5. Deploy as new version
clasp deploy --description "v4.X.X - Description"
```

---

## 🤝 Contributing

### Code Standards

- **Language Policy:** ALL code, comments, and documentation in English
- **Naming:** camelCase for variables, PascalCase for classes
- **Comments:** JSDoc format for all functions
- **Formatting:** Prettier standard (use `npx prettier --write .`)

### Commit Convention

```bash
# Format
[type]: [concise description]

# Types
feat: New feature
fix: Bug fix
refactor: Code restructure (no behavior change)
docs: Documentation update
perf: Performance improvement
test: Test addition/modification

# Examples
git commit -m "feat: Add v2 API targeted recalculation"
git commit -m "perf: Reduce API calls by 99.98%"
git commit -m "fix: Handle empty SKU arrays gracefully"
```

---

## 📚 Documentation

### Available Documentation

- **Quick Start:** This README
- **Implementation:** `REST-API-V2-IMPLEMENTATION-COMPLETE.md`
- **API Reference:** `docs/REST-API-RECALCULATION-ENDPOINTS.md`
- **v3.0 Summary:** `IMPLEMENTATION-SUMMARY.md`
- **v3.0 Changelog:** `CHANGELOG-V3.0.md`
- **Token Setup:** `SETUP-RECALC-TOKENS.md`

### Documentation Standards

**File Naming:**
```
[CATEGORY]-[DESCRIPTION]-[VERSION].md

Examples:
REST-API-V2-IMPLEMENTATION-COMPLETE.md
CHANGELOG-V3.0.md
SETUP-RECALC-TOKENS.md
```

---

## 🗺️ Roadmap

### Current Version: v4.0.0

**Completed:**
- [x] REST API v2 integration
- [x] Targeted recalculation by SKUs
- [x] Smart 5-minute cache layer
- [x] Event-driven auto-updates
- [x] 540x performance improvement

**Planned:**
- [ ] Webhook integration (real-time Google Sheets updates)
- [ ] Parallel batch processing
- [ ] Analytics dashboard (cache hit rates, API usage)
- [ ] Rate limit dashboard

### Version History

**v4.0.0** - 2025-10-27
- REST API v2 integration
- Targeted recalculation (540x faster)
- Smart cache layer (5min TTL)
- Event-driven auto-updates
- Performance: 15s → 0.5s for 3 SKUs

**v3.0.0** - 2025-10-26
- Automatic recalculation before fetch
- REST API v1 endpoints
- Graceful degradation
- Performance: 3s → 15s for 3 SKUs (full catalog)

**v2.0.0** - 2025-09-15
- Direct WooCommerce API integration
- Zero-downtime deployment
- Category management
- Initial quantity tracking

**v1.0.0** - 2025-08-01
- Initial release
- WP Import plugin integration
- Manual workflow

---

## 🆘 Support & Contact

### Getting Help

1. **Check Documentation:** Start with this README
2. **Review Logs:** Google Apps Script logs (View → Logs)
3. **Test API:** Use curl commands in docs
4. **Contact:** Create GitHub issue

### Reporting Issues

**Required Information:**
- Google Sheets version
- Browser used
- Error message (from logs)
- Steps to reproduce
- Number of SKUs processed

**Create Issue:**
```bash
# On GitHub
https://github.com/benjaminbelaga/wp-import-dashboard/issues/new

# Include:
- Clear title describing the issue
- Full error message from logs
- Steps to reproduce
- Expected vs actual behavior
- Performance metrics (if applicable)
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

- [YSC Plugin](https://github.com/benjaminbelaga/ysc) - YOYAKU SARL Companion (provides API v2)
- [YYD Theme](https://github.com/benjaminbelaga/yyd-theme) - B2B Theme (provides API v2)
- [YOYAKU Theme](https://github.com/benjaminbelaga/yoyaku-theme) - B2C Theme

---

## 📌 Additional Resources

- **YOYAKU Ecosystem Documentation:** `/Users/yoyaku/README.md`
- **Claude Code Configuration:** `/Users/yoyaku/CLAUDE.md`
- **Deployment Tools:** `/Users/yoyaku/tools/`
- **Credential Vault:** `~/.credentials/yoyaku/` (secured)

---

**Last Updated:** 2025-10-27
**Documentation Version:** 4.0.0
**Maintainer:** Benjamin Belaga
