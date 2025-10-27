# Smart API Wrapper - Complete Documentation

> **Category:** Integration / API / Google Apps Script
> **Repository:** `benjaminbelaga/wp-import-dashboard`
> **Local Path:** `/Users/yoyaku/repos/wp-import-dashboard/`
> **Production:** Google Apps Script (YOYAKU Import Dashboard)
> **Status:** Active

---

## 📖 Description

The Smart API Wrapper provides intelligent routing between v2 Connector (fast read) and v3 REST API (forced recalculation) for YOYAKU.IO and YYD.FR stock data fetching. It eliminates decision paralysis for webmasters by offering a single, intuitive interface with automatic strategy selection and robust fallback mechanisms.

**Key Features:**
- Intelligent Strategy Selection: Automatically chooses between fast read (v2) and forced recalculation (v3+v2) based on user preference
- Robust Fallback: Automatically tries alternative strategy when primary fails, ensuring maximum uptime
- Usage Metrics Tracking: Logs all operations for data-driven optimization decisions
- Zero Risk: Operates as a wrapper layer without modifying existing v2 Connector or v3 REST API
- Progressive Migration: Provides clear path to eventual unified API v4 based on real usage patterns

---

## 🏗️ Context & Business Logic

**Problem Solved:**

Before Smart Wrapper, webmasters had to manually choose between two APIs without clear guidance:
- v2 Connector: Ultra-fast read (~100ms) but data might be stale
- v3 REST API: Guaranteed fresh data (~1300ms) but slower due to recalculation

This led to:
- Confusion about which API to use for which scenario
- Risk of using wrong API (slow recalc for daily updates, or stale data for critical imports)
- Support requests asking "which API should I use?"

**Integration Points:**
- **Sites:** Both YOYAKU.IO (B2C) and YYD.FR (B2B)
- **Dependencies:**
  - v2 Connector (`api-stock-functions-v2-yoyaku-connector.js`)
  - v3 REST API (`api-stock-functions-v3.js`)
  - Google Apps Script PropertiesService (for metrics storage)
- **External APIs:**
  - YOYAKU.IO: `https://www.yoyaku.io/wp-json/wc/v3/products` (WooCommerce REST API)
  - YYD.FR: `https://www.yydistribution.fr/wp-json/wc/v3/products` (WooCommerce REST API)
  - YOYAKU.IO v3: `https://www.yoyaku.io/wp-json/ysc/v3/recalculate-preorders`
  - YYD.FR v3: `https://www.yydistribution.fr/wp-json/yyd/v3/recalculate-shelves`

**Revenue Impact:**
High - Optimizes webmaster workflow for daily product imports, reducing time spent on decision-making and ensuring optimal API usage for each scenario.

---

## 🛠️ Installation & Setup

### Prerequisites

```bash
# Required software
Google Apps Script environment (web-based, no local install)
Access to YOYAKU Import Dashboard Google Sheets
clasp CLI tool (for deployment from local)

# Installation of clasp (if deploying locally)
npm install -g @google/clasp
```

### Installation Steps

**Local Development:**
```bash
# Clone repository
cd /Users/yoyaku/repos/
git clone https://github.com/benjaminbelaga/wp-import-dashboard.git
cd wp-import-dashboard

# Smart Wrapper files
# - api-stock-functions-smart.js (main wrapper)
# - test-smart-fetch.js (test suite)

# No dependencies to install (pure JavaScript)
```

**Production Deployment:**
```bash
# Deploy to Google Apps Script
cd /Users/yoyaku/repos/wp-import-dashboard
clasp push

# Verify deployment
# Should see: "Pushed 36 files"
# Including: api-stock-functions-smart.js, test-smart-fetch.js

# Open in browser
open https://script.google.com/u/0/home/projects/1JkXMaf57gFb8XtmT1Bbaoo6goKlhTw2ie1eIQRlDfqra6OG0oOdDEdUy/edit
```

### Configuration

**Required Credentials:**
- WooCommerce API: `api-credentials.js` (already configured)
- v2 Connector endpoints: Pre-configured in `api-credentials.js`
- v3 REST API tokens: Pre-configured with bearer authentication

**Configuration Files:**
```javascript
// api-credentials.js (no changes needed)
// Smart Wrapper uses existing configuration

// Optional: Adjust metrics retention
function clearOldMetrics(daysToKeep = 30) {
  // Default: Keep 30 days of metrics
  // Adjust parameter if needed
}
```

---

## 📂 Architecture & File Structure

```
wp-import-dashboard/
├── README.md                                # Project overview
├── .clasp.json                             # Apps Script deployment config
│
├── api-stock-functions-smart.js            # SMART WRAPPER (464 lines)
│   ├── fetchStockDataSmart()              # Main routing function
│   ├── fetchAndCalculateStockSmart()      # Menu integration
│   ├── executeRecalculateThenFetchStrategy() # v3+v2 workflow
│   ├── executeFastReadStrategy()          # v2 only workflow
│   ├── executeFallbackStrategy()          # Error recovery
│   ├── shouldAutoRecalculate()            # Future staleness detection
│   ├── logUsageMetrics()                  # Track usage
│   ├── generateUsageReport()              # View metrics
│   └── clearOldMetrics()                  # Cleanup
│
├── test-smart-fetch.js                     # TEST SUITE (376 lines)
│   ├── testSmartFetchPerformance()        # v2 vs v3+v2 comparison
│   ├── testSmartFetchEmptySKUs()          # Edge case: empty array
│   ├── testSmartFetchInvalidSKUs()        # Edge case: non-existent
│   ├── testSmartFetchMixedSKUs()          # Edge case: partial success
│   ├── testSmartFetchAutoMode()           # Auto-detection validation
│   ├── testSmartFetchFallbackBehavior()   # Fallback documentation
│   ├── runAllSmartFetchTests()            # Full test suite
│   └── quickSanityTest()                  # Fast validation
│
├── api-stock-functions-v2-yoyaku-connector.js # v2 Connector (unchanged)
├── api-stock-functions-v3.js              # v3 REST API caller (unchanged)
├── api-credentials.js                     # API configuration (unchanged)
│
└── docs/
    ├── GUIDE-API-YOYAKU-WHICH-ONE-TO-USE.md     # Decision guide
    ├── SMART-WRAPPER-DEPLOYMENT-2025-10-27.md   # Deployment report
    └── SMART-WRAPPER-COMPLETE-DOCUMENTATION.md  # This file
```

---

## 🚀 Usage

### Basic Usage

**Fast Read (Default Strategy):**
```javascript
// Webmaster wants daily dashboard update
const skus = ['0007AD', '006', '01201', '01202'];

// Fast read - v2 Connector only (~100ms)
const result = fetchStockDataSmart(skus, 'yoyaku.io', false);

// Response structure:
{
  success: true,
  strategy: 'v2_fetch_only',
  total_time_ms: 98,
  results: [
    {
      sku: '0007AD',
      product_id: 12345,
      preorder_count: 5,
      shelf_count: 3,
      stock_yoyaku: 10,
      image_url: 'https://...'
    },
    // ... more products
  ]
}
```

**Forced Recalculation (Fresh Data Guaranteed):**
```javascript
// Webmaster wants guaranteed fresh data (maintenance, debugging)
const skus = ['0007AD', '006', '01201', '01202'];

// Force recalculation - v3 REST API + v2 Connector (~1300ms)
const result = fetchStockDataSmart(skus, 'yoyaku.io', true);

// Response structure:
{
  success: true,
  strategy: 'v3_recalc_then_v2_fetch',
  total_time_ms: 1295,
  recalc_stats: {
    processed: 0,
    skipped: 4,
    time_taken: '0.195s'
  },
  results: [
    // ... fresh product data
  ]
}
```

**Auto-Detection Mode (Future Feature):**
```javascript
// Automatic staleness detection
const result = fetchStockDataSmart(skus, 'yoyaku.io', 'auto');

// Currently defaults to fast read
// Future: Will check _last_recalculated timestamp
// and auto-decide between fast read vs forced recalc
```

### Advanced Usage

**Menu Integration (Webmasters):**
```javascript
// Add to custom menu in Google Sheets
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('YOYAKU Import')
    .addItem('Fetch Data & Calculate (Smart)', 'fetchAndCalculateStockSmart')
    .addToUi();
}

// When webmaster clicks:
// 1. Prompt: "Force recalculation? YES/NO"
// 2. Smart Wrapper executes chosen strategy
// 3. Updates sheet rows automatically
// 4. Shows summary alert
```

**Programmatic Usage with Site Parameter:**
```javascript
// YOYAKU.IO (B2C)
const yoyakuData = fetchStockDataSmart(skus, 'yoyaku.io', false);

// YYD.FR (B2B)
const yydData = fetchStockDataSmart(skus, 'yydistribution.fr', true);

// Both sites with different strategies
const yoyakuFast = fetchStockDataSmart(skus, 'yoyaku.io', false);
const yydFresh = fetchStockDataSmart(skus, 'yydistribution.fr', true);
```

**Error Handling with Fallback:**
```javascript
try {
  // Primary strategy: Fast read
  const result = fetchStockDataSmart(skus, 'yoyaku.io', false);

  if (!result.success) {
    Logger.log(`Warning: ${result.warning || result.error}`);

    // Check if fallback was used
    if (result.strategy.startsWith('fallback_')) {
      Logger.log('Fallback strategy was triggered');
      Logger.log(`Original error: ${result.original_error}`);
    }
  }

  return result;
} catch (error) {
  Logger.log(`Critical error: ${error.message}`);
  // Handle critical failure
}
```

---

## 🔌 API Reference

### Main Functions

#### `fetchStockDataSmart(skus, site, forceRecalc)`

**Description:** Main smart routing function that intelligently chooses between v2 Connector (fast read) and v3 REST API + v2 Connector (forced recalculation) based on forceRecalc parameter.

**Parameters:**
- `skus` (Array<string>) - Array of product SKUs to fetch (e.g., `['0007AD', '006', '01201']`)
- `site` (string) - Site identifier: `'yoyaku.io'` or `'yydistribution.fr'` (default: `'yoyaku.io'`)
- `forceRecalc` (boolean|string) - Recalculation strategy:
  - `false`: Fast read only (v2 Connector)
  - `true`: Force recalculation (v3 REST API + v2 Connector)
  - `'auto'`: Auto-detect staleness (future feature, currently defaults to `false`)

**Returns:** `Object` - Result object with structure:
```javascript
{
  success: boolean,           // Operation success status
  strategy: string,           // Strategy used (e.g., 'v2_fetch_only', 'v3_recalc_then_v2_fetch')
  total_time_ms: number,      // Total execution time in milliseconds
  recalc_stats: {             // Only present if forceRecalc=true
    processed: number,        // Products recalculated
    skipped: number,          // Products skipped (no backorders)
    time_taken: string        // Server recalc time (e.g., '0.195s')
  },
  results: Array<Object>,     // Product data array
  warning: string,            // Optional warning message if fallback used
  original_error: string,     // Original error if fallback triggered
  error: string               // Error message if operation failed
}
```

**Example:**
```javascript
// Fast read example
const result = fetchStockDataSmart(['0007AD', '006'], 'yoyaku.io', false);
// Returns: { success: true, strategy: 'v2_fetch_only', total_time_ms: 102, results: [...] }

// Forced recalc example
const result = fetchStockDataSmart(['0007AD'], 'yoyaku.io', true);
// Returns: { success: true, strategy: 'v3_recalc_then_v2_fetch', total_time_ms: 1295, recalc_stats: {...}, results: [...] }
```

**Errors:**
- `No SKUs provided` - Empty skus array
- `Both primary and fallback strategies failed` - Critical failure (both v2 and v3 APIs down)
- `Invalid site: [site]` - Unknown site identifier

---

#### `fetchAndCalculateStockSmart(selectedRange, forceRecalc)`

**Description:** Menu integration function for webmasters. Prompts user for recalculation choice, detects rows needing updates (SKU present, image empty), fetches data, and updates sheet.

**Parameters:**
- `selectedRange` (Range) - Google Sheets range object (optional, will use active range if not provided)
- `forceRecalc` (boolean) - Force recalculation strategy (optional, will prompt user if not provided)

**Returns:** `void` - Displays alert dialog with results summary

**Example:**
```javascript
// Called from menu (user will be prompted)
fetchAndCalculateStockSmart();

// Programmatic call with forced recalc
fetchAndCalculateStockSmart(null, true);
```

**Sheet Updates:**
- Column A (1): Image formula `=IMAGE(Z{row})`
- Column T (20): Shelf count (`_yyd_total_shelf`)
- Column U (21): Preorder count (`_total_preorders`)
- Column Z (26): Image URL

**Alert Message Format:**
```
✅ Completed!

Success: 42 rows
Errors: 0 rows
Strategy: v3_recalc_then_v2_fetch
Total time: 1834ms

Recalculation:
  Processed: 2
  Skipped: 40
  Time: 0.205s
```

---

#### `generateUsageReport()`

**Description:** Generates aggregated usage metrics report from Script Properties, showing daily statistics for each strategy.

**Parameters:** None

**Returns:** `Array<Object>` - Array of metric objects:
```javascript
[
  {
    date: '2025-10-27',
    strategy: 'v2_fetch_only',
    calls: 42,
    avgTime: 105,          // milliseconds
    avgSkus: 12,
    totalTime: 4410,       // milliseconds
    totalSkus: 504
  },
  // ... more entries
]
```

**Example:**
```javascript
const report = generateUsageReport();

// Console output:
// Date       | Strategy                  | Calls | Avg Time | Avg SKUs
// -----------|---------------------------|-------|----------|----------
// 2025-10-27 | v2_fetch_only             |    42 |    105ms |       12
// 2025-10-27 | v3_recalc_then_v2_fetch   |     8 |   1342ms |       15
```

**Use Cases:**
- Weekly performance review
- Strategy adoption analysis
- Optimization decision-making
- ROI calculation for v4 unified API

---

#### `clearOldMetrics(daysToKeep)`

**Description:** Cleanup function that removes metrics older than specified days from Script Properties.

**Parameters:**
- `daysToKeep` (number) - Number of days to retain metrics (default: 30)

**Returns:** `void` - Logs cleanup summary to console

**Example:**
```javascript
// Remove metrics older than 30 days (default)
clearOldMetrics();

// Custom retention: keep 90 days
clearOldMetrics(90);

// Console output:
// 🧹 Cleaning metrics older than 30 days...
//    🗑️  Deleted: metrics_v2_fetch_only_2025-09-20
//    🗑️  Deleted: metrics_v3_recalc_then_v2_fetch_2025-09-18
// ✅ Cleanup complete: 15 old metrics deleted
```

---

### Private Helper Functions

#### `executeRecalculateThenFetchStrategy(skus, site, startTime)`

**Description:** Internal function that executes v3 REST API recalculation followed by v2 Connector fetch.

**Flow:**
1. Call v3 REST API to recalculate preorders/shelves
2. Wait 1 second for database write
3. Call v2 Connector to fetch fresh data
4. Log metrics
5. Return combined result

**Performance:** ~1300ms for typical catalog (95% backorder skip rate)

---

#### `executeFastReadStrategy(skus, site, startTime)`

**Description:** Internal function that executes v2 Connector read-only fetch.

**Flow:**
1. Call v2 Connector API
2. Log metrics
3. Return result

**Performance:** ~100ms for typical catalog

---

#### `executeFallbackStrategy(skus, site, startTime, originalForceRecalc, originalError)`

**Description:** Internal error recovery function that tries alternative strategy when primary fails.

**Fallback Logic:**
- If primary was v3+v2 → Fallback to v2 only (skip recalc)
- If primary was v2 only → Fallback to v3+v2 (force recalc)
- If both fail → Return critical failure error

**Use Cases:**
- v3 REST API temporarily down → Use cached v2 data
- v2 Connector fails → Force recalc with v3 then v2
- Network issues → Maximize uptime with alternative approach

---

#### `shouldAutoRecalculate(skus, site)`

**Description:** Future feature stub for automatic staleness detection.

**Current Behavior:** Always returns `false` (defaults to fast read)

**Planned Implementation:**
1. Fetch `_last_recalculated` timestamp from backend
2. Calculate data age in milliseconds
3. Compare against threshold (e.g., 5 minutes)
4. Return `true` if stale, `false` if fresh

**Target Release:** Q1 2026 (pending backend timestamp support)

---

#### `logUsageMetrics(strategy, timeMs, skuCount)`

**Description:** Internal function that logs operation metrics to Script Properties for future analysis.

**Storage Format:**
```javascript
// Key: metrics_{strategy}_{YYYY-MM-DD}
// Value: {"calls": 42, "totalTime": 4410, "totalSkus": 504}
```

**Retention:** 30 days (auto-cleanup via `clearOldMetrics()`)

---

## 🔄 Workflow & Integration

### Development Workflow

1. **Local Development:**
   ```bash
   # Work in local repo
   cd /Users/yoyaku/repos/wp-import-dashboard/

   # Edit Smart Wrapper
   nano api-stock-functions-smart.js

   # Edit tests
   nano test-smart-fetch.js

   # Commit changes
   git add .
   git commit -m "feat: Improve Smart Wrapper fallback logic"
   git push origin main
   ```

2. **Deploy to Google Apps Script:**
   ```bash
   # Push all files
   clasp push

   # Verify deployment
   # Check: "Pushed 36 files"
   ```

3. **Test in Production:**
   ```javascript
   // Open Google Sheets Import Dashboard
   // Extensions → Apps Script
   // Run: quickSanityTest()
   // Verify: Both strategies work
   ```

### Integration with YOYAKU Ecosystem

**Required Dependencies:**
- `api-credentials.js` - WooCommerce API credentials and v3 bearer tokens
- `api-stock-functions-v2-yoyaku-connector.js` - v2 Connector implementation
- `api-stock-functions-v3.js` - v3 REST API caller

**Hooks into:**
- Google Sheets custom menu system (via `onOpen()` trigger)
- Script Properties service (for metrics storage)
- UrlFetchApp service (for API calls)

**Provides to other components:**
- Simplified API choice for webmasters (single function interface)
- Usage metrics for ecosystem optimization decisions
- Foundation for eventual unified API v4

**Used by:**
- Import Dashboard sheets (803, 852, etc.)
- Webmaster daily workflows
- Automated import processes

---

## 🧪 Testing

### Unit Tests

**Edge Case Tests:**
```javascript
// Test empty SKUs
testSmartFetchEmptySKUs();
// Expected: Graceful error with clear message

// Test invalid SKUs
testSmartFetchInvalidSKUs();
// Expected: Returns results with not_found status

// Test mixed valid/invalid SKUs
testSmartFetchMixedSKUs();
// Expected: Partial success with clear indication
```

### Integration Tests

**Performance Tests:**
```javascript
// Compare v2 vs v3+v2 strategies
testSmartFetchPerformance();

// Expected output:
// v2 only:  ~100ms
// v3+v2:    ~1300ms
// Overhead: ~1200ms (13x slower but fresh data guaranteed)
```

**Auto-Mode Tests:**
```javascript
// Validate auto-detection mode
testSmartFetchAutoMode();

// Expected: Defaults to v2_fetch_only (until staleness detection implemented)
```

### Manual Testing Checklist

**Before Deployment:**
- [ ] Run `quickSanityTest()` - Both strategies work
- [ ] Run `runAllSmartFetchTests()` - All tests pass
- [ ] Test with 1 SKU - Fast response
- [ ] Test with 100 SKUs - No timeout
- [ ] Test with invalid SKUs - Graceful error
- [ ] Test fallback logic - Simulated API failure

**Post-Deployment:**
- [ ] Menu integration works in Google Sheets
- [ ] User prompt appears correctly
- [ ] Sheet rows update successfully
- [ ] Alert message shows correct summary
- [ ] Metrics logged to Script Properties
- [ ] `generateUsageReport()` returns data

**Weekly Monitoring:**
- [ ] Check `generateUsageReport()` for patterns
- [ ] Verify no critical failures in logs
- [ ] Monitor average response times
- [ ] Review strategy adoption rates

---

## ⚙️ Configuration Options

### Strategy Selection

**Default Behavior:**
```javascript
// Fast read by default (conservative approach)
const result = fetchStockDataSmart(skus, 'yoyaku.io');
// Same as: fetchStockDataSmart(skus, 'yoyaku.io', false);
```

**Forced Recalculation:**
```javascript
// Explicitly request fresh data
const result = fetchStockDataSmart(skus, 'yoyaku.io', true);
```

**Auto-Detection (Future):**
```javascript
// Let Smart Wrapper decide based on staleness
const result = fetchStockDataSmart(skus, 'yoyaku.io', 'auto');
// Currently defaults to fast read
```

### Metrics Configuration

**Retention Period:**
```javascript
// Default: 30 days
clearOldMetrics();

// Custom: 90 days for quarterly reports
clearOldMetrics(90);

// Aggressive: 7 days for GDPR compliance
clearOldMetrics(7);
```

**Disable Metrics (if needed):**
```javascript
// Edit logUsageMetrics() function
function logUsageMetrics(strategy, timeMs, skuCount) {
  // Comment out the entire function body
  // Metrics will no longer be logged
  return;
}
```

---

## 🐛 Debugging

### Enable Debug Mode

**Google Apps Script Console:**
```javascript
// Add detailed logging to Smart Wrapper
function fetchStockDataSmart(skus, site, forceRecalc) {
  Logger.log('='.repeat(60));
  Logger.log('DEBUG: Smart Fetch Called');
  Logger.log(`  SKUs: ${JSON.stringify(skus)}`);
  Logger.log(`  Site: ${site}`);
  Logger.log(`  Force Recalc: ${forceRecalc}`);
  Logger.log('='.repeat(60));

  // ... rest of function
}

// View logs: Ctrl+Enter or View → Logs
```

**Execution Transcript:**
```javascript
// Run function
fetchStockDataSmart(['0007AD'], 'yoyaku.io', false);

// View execution log (not console log)
// Click: View → Execution log
// Shows: API calls, timing, errors
```

### Common Issues

**Issue: "fetchStockDataSmart is not defined"**
- **Cause:** Smart Wrapper not deployed to Google Apps Script
- **Solution:**
  ```bash
  cd /Users/yoyaku/repos/wp-import-dashboard
  clasp push
  # Refresh Google Sheets
  ```
- **Prevention:** Always run `clasp push` after local changes

**Issue: "Both primary and fallback strategies failed"**
- **Cause:** Both v2 Connector and v3 REST API are down or unreachable
- **Solution:**
  1. Check YOYAKU.IO site status (should be accessible)
  2. Test v2 Connector directly: `fetchStockDataV2Connector(['0007AD'])`
  3. Test v3 REST API directly: `recalculateSourceDataV3Targeted(['0007AD'])`
  4. Check network connectivity from Google Apps Script
  5. Review execution logs for specific error messages
- **Prevention:** Monitor site uptime, set up alerts for API failures

**Issue: Metrics not logging**
- **Cause:** Script Properties permission issue (rare)
- **Solution:**
  ```javascript
  // Test Script Properties access
  const props = PropertiesService.getScriptProperties();
  props.setProperty('test_key', 'test_value');
  const value = props.getProperty('test_key');
  Logger.log(`Test value: ${value}`); // Should log: test_value
  ```
- **Prevention:** Ensure script has proper authorization

**Issue: Slow performance (>5 seconds)**
- **Cause:** Too many SKUs in single request, or network latency
- **Solution:**
  ```javascript
  // Batch requests into smaller chunks
  const batchSize = 50;
  for (let i = 0; i < allSkus.length; i += batchSize) {
    const batch = allSkus.slice(i, i + batchSize);
    const result = fetchStockDataSmart(batch, 'yoyaku.io', false);
    Utilities.sleep(500); // Rate limiting
  }
  ```
- **Prevention:** Limit to 50-100 SKUs per request

**Issue: Fallback always triggered**
- **Cause:** Primary API consistently failing
- **Solution:**
  1. Check which strategy is primary (v2 or v3+v2)
  2. Test that API directly to isolate issue
  3. Review execution logs for original error
  4. Check bearer tokens are valid (v3 REST API)
  5. Verify WooCommerce API credentials (v2 Connector)
- **Prevention:** Set up monitoring for API endpoints

### Debug Logging

**Add Detailed Logs:**
```javascript
// In fetchStockDataSmart()
Logger.log(`\n🧠 Smart Fetch API - DEBUG MODE`);
Logger.log(`   Input SKUs: ${JSON.stringify(skus)}`);
Logger.log(`   Site: ${site}`);
Logger.log(`   Force Recalc: ${forceRecalc}`);
Logger.log(`   Timestamp: ${new Date().toISOString()}`);

// Before API call
Logger.log(`\n📡 Calling strategy: ${strategy}`);

// After API call
Logger.log(`\n✅ Strategy complete`);
Logger.log(`   Success: ${result.success}`);
Logger.log(`   Time: ${result.total_time_ms}ms`);
Logger.log(`   Products: ${result.results?.length || 0}`);

// On error
Logger.log(`\n❌ Error occurred`);
Logger.log(`   Message: ${error.message}`);
Logger.log(`   Stack: ${error.stack}`);
```

**View All Logs:**
```
1. Run function from Apps Script editor
2. Click: View → Execution log (full transcript)
3. Or: Ctrl+Enter (keyboard shortcut)
```

---

## 🚨 Known Limitations

1. **Auto-Detection Not Yet Implemented:** The `'auto'` mode currently defaults to fast read. Staleness detection requires backend support for `_last_recalculated` timestamp field (planned Q1 2026).

2. **Metrics Retention Limited to Script Properties:** Google Apps Script Script Properties has size limits (~524KB total). With current implementation, this allows ~1 year of metrics before cleanup needed. For longer retention, consider exporting to Google Sheets or external database.

3. **No Real-Time Sync Between Strategies:** When v3 REST API recalculates data, there's a 1-second wait for database write. In rare cases with high server load, this might not be sufficient. Consider increasing wait time if data inconsistency observed.

4. **Fallback Strategy is Last Resort:** If both v2 and v3 APIs fail, Smart Wrapper returns error. There's no third fallback option. Consider implementing cache layer for critical scenarios.

5. **Single Site per Call:** Each `fetchStockDataSmart()` call targets one site (YOYAKU.IO or YYD.FR). For cross-site operations, make separate calls.

6. **Performance Depends on Network:** Google Apps Script execution time includes network latency. Actual API response times may vary based on user's network and server load.

---

## 🔒 Security Considerations

- **API Credentials:** All WooCommerce API keys and v3 bearer tokens are stored in `api-credentials.js`. This file is deployed to Google Apps Script (secured by Google account authentication). Never expose in client-side code.

- **Bearer Token Security:** v3 REST API uses bearer token authentication. Tokens are compared using timing-attack-safe `hash_equals()` on backend. Never log tokens to console.

- **Rate Limiting:** v3 REST API enforces 10 requests/minute per token. Smart Wrapper respects this by default. Implement additional throttling if needed for batch operations.

- **Input Sanitization:** SKUs are sent as-is to APIs. Backend handles sanitization and validation. Smart Wrapper does basic type checking (array, string) but trusts backend for security.

- **Script Permissions:** Google Apps Script requires explicit authorization for:
  - UrlFetchApp (external API calls)
  - PropertiesService (metrics storage)
  - SpreadsheetApp (sheet access)

  Users see OAuth consent screen on first run. This is normal and expected.

- **Data Privacy:** Metrics logged to Script Properties contain only aggregated statistics (counts, averages). No SKU data or product details are stored in metrics.

---

## 📊 Performance Impact

**Benchmarks:**

| Operation | Fast Read (v2) | Forced Recalc (v3+v2) | Overhead |
|-----------|----------------|----------------------|----------|
| **10 SKUs** | 102ms | 1295ms | 12.7x slower |
| **50 SKUs** | 385ms | 1850ms | 4.8x slower |
| **100 SKUs** | 750ms | 2500ms | 3.3x slower |

**Factors Affecting Performance:**
- Network latency (Google Apps Script → YOYAKU servers)
- Server load on YOYAKU.IO or YYD.FR
- Backorder rate (v3 skips 95% of products without backorders)
- WooCommerce cache status

**Memory Usage:**
- Smart Wrapper code: ~15KB (minified)
- Runtime memory: <1MB per execution
- Script Properties metrics: ~1KB per day

**Optimization Tips:**
1. **Use Fast Read for Daily Updates:** Default to `forceRecalc=false` for routine operations
2. **Batch Large Imports:** Split 500+ SKUs into chunks of 50-100
3. **Schedule Forced Recalc:** Run `forceRecalc=true` weekly during off-peak hours
4. **Monitor Metrics:** Review `generateUsageReport()` to identify optimization opportunities
5. **Cache at Application Level:** Consider implementing local cache for frequently accessed SKUs

---

## 🔄 Maintenance

### Regular Tasks

**Daily:**
- No daily maintenance required (automatic operation)
- Smart Wrapper self-manages via fallback mechanisms

**Weekly:**
- Review usage metrics: `generateUsageReport()`
- Check for critical failures in execution logs
- Verify both v2 and v3 APIs operational

**Monthly:**
- Clean old metrics: `clearOldMetrics(30)` (runs automatically)
- Review average response times (should be <150ms for v2, <2000ms for v3+v2)
- Analyze strategy adoption rates (target: 90%+ using v2 for daily, 10% using v3 for maintenance)

**Quarterly:**
- Evaluate ROI for v4 unified API based on metrics
- Review fallback trigger frequency (target: <5% of requests)
- Update documentation with new patterns/insights

### Update Procedure

**When Updating Smart Wrapper:**

```bash
# 1. Work in local repo
cd /Users/yoyaku/repos/wp-import-dashboard/
nano api-stock-functions-smart.js

# 2. Test locally (if possible)
# Google Apps Script doesn't support local testing
# Review code changes carefully

# 3. Commit to Git
git add api-stock-functions-smart.js
git commit -m "feat: Improve fallback strategy for network errors"
git push origin main

# 4. Deploy to production
clasp push

# 5. Test in production
# Open Google Sheets → Extensions → Apps Script
# Run: quickSanityTest()
# Verify: All tests pass

# 6. Monitor for 24 hours
# Check execution logs for errors
# Review metrics for anomalies
```

**Rollback Procedure:**

```bash
# 1. Find last working commit
git log --oneline -10

# 2. Revert to previous version
git checkout [commit-hash] api-stock-functions-smart.js

# 3. Deploy old version
clasp push

# 4. Verify functionality
# Run: quickSanityTest()

# 5. Document issue
# Create GitHub issue with error details
# Plan fix for next update
```

---

## 🤝 Contributing

### Code Standards

- **Language Policy:** ALL code, comments, and documentation in English
- **Naming Conventions:**
  - Functions: camelCase (e.g., `fetchStockDataSmart`)
  - Variables: camelCase (e.g., `forceRecalc`)
  - Constants: UPPER_SNAKE_CASE (e.g., `MAX_RETRIES`)
- **Comments:** JSDoc format for all public functions
  ```javascript
  /**
   * Brief description
   *
   * @param {type} paramName - Description
   * @returns {type} Description
   */
  ```
- **Formatting:**
  - 2 spaces indentation
  - Single quotes for strings
  - Semicolons required
  - Max line length: 100 characters

### Commit Convention

```bash
# Format
[type]: [concise description]

# Types
feat:     New feature or enhancement
fix:      Bug fix
refactor: Code restructure (no behavior change)
docs:     Documentation update
perf:     Performance improvement
test:     Test addition/modification

# Examples
git commit -m "feat: Add staleness detection to auto mode"
git commit -m "fix: Handle null SKUs gracefully in fallback strategy"
git commit -m "perf: Reduce wait time for v3 recalc to 500ms"
git commit -m "docs: Update API reference with new parameters"
```

### Pull Request Process

1. **Create Feature Branch:**
   ```bash
   git checkout -b feature/smart-wrapper-staleness-detection
   ```

2. **Implement Changes:**
   - Follow code standards
   - Add JSDoc comments
   - Update relevant documentation
   - Add tests if applicable

3. **Test Thoroughly:**
   ```javascript
   // Run all tests
   runAllSmartFetchTests();

   // Manual testing
   quickSanityTest();
   ```

4. **Commit with Clear Message:**
   ```bash
   git add .
   git commit -m "feat: Implement staleness detection for auto mode"
   ```

5. **Push to GitHub:**
   ```bash
   git push origin feature/smart-wrapper-staleness-detection
   ```

6. **Open Pull Request:**
   - Title: Clear, concise description
   - Description:
     - What changed
     - Why changed
     - How tested
     - Breaking changes (if any)
   - Request review from Benjamin Belaga

7. **Address Review Comments:**
   - Make requested changes
   - Push updates to same branch
   - Re-request review

8. **Merge After Approval:**
   - Squash commits if needed
   - Merge to main branch
   - Delete feature branch
   - Deploy with `clasp push`

---

## 📚 Documentation

### Available Documentation

**Quick Reference:**
- `/docs/RUN-SMART-WRAPPER-TEST.md` - Test execution guide

**Comprehensive Guides:**
- `/docs/GUIDE-API-YOYAKU-WHICH-ONE-TO-USE.md` - Decision tree for API selection (521 lines)
- `/docs/SMART-WRAPPER-DEPLOYMENT-2025-10-27.md` - Deployment report (618 lines)
- `/docs/SMART-WRAPPER-COMPLETE-DOCUMENTATION.md` - This file (complete reference)

**Related Documentation:**
- `/docs/DEPLOYMENT-REPORT-API-V2-2025-10-27.md` - v2 Connector deployment
- `/docs/DEPLOYMENT-REPORT-API-V3-2025-10-27.md` - v3 REST API deployment
- `/docs/REST-API-V3-COMPLETE-DOCUMENTATION.md` - v3 API technical reference

### Documentation Standards

**File Naming:**
```
[CATEGORY]-[DESCRIPTION].md

Examples:
GUIDE-SMART-WRAPPER-USAGE.md
REFERENCE-SMART-WRAPPER-API.md
PROTOCOL-SMART-WRAPPER-TESTING.md
```

**Location:**
```
/docs/                              # All documentation
/docs/SMART-WRAPPER-*.md           # Smart Wrapper specific
/docs/GUIDE-*.md                   # User guides
/docs/REFERENCE-*.md               # Technical references
```

**Update Frequency:**
- Update after each feature addition
- Update after bug fixes if behavior changes
- Quarterly review for accuracy
- Annual comprehensive review

---

## 🗺️ Roadmap

### Current Version: 1.0.0 (2025-10-27)

**Completed:**
- [x] Intelligent routing between v2 and v3 APIs
- [x] Robust fallback strategy
- [x] Usage metrics tracking
- [x] Menu integration for webmasters
- [x] Comprehensive test suite
- [x] Full documentation

**In Progress:**
- [ ] Gather usage data for 1 month (ETA: 2025-11-27)
- [ ] Analyze strategy adoption patterns
- [ ] Identify optimization opportunities

**Planned - Phase 4 (Q1 2026):**
- [ ] Implement staleness detection
  - Add backend support for `_last_recalculated` timestamp
  - Implement `shouldAutoRecalculate()` logic
  - Default to `'auto'` mode for all calls
- [ ] Enhanced metrics dashboard
  - Export metrics to Google Sheets for visualization
  - Weekly automated reports
  - Anomaly detection

**Planned - Phase 5 (Q2 2026):**
- [ ] Unified API v4 evaluation
  - Review usage metrics
  - Calculate ROI for unification
  - Decide: Keep separate vs unified
- [ ] If unified:
  - Create backend v4 endpoint
  - Migrate Smart Wrapper to v4 caller
  - Deprecate v2 and v3 (with 6-month sunset)

**Future Considerations:**
- GraphQL support for complex queries
- Real-time WebSocket updates
- Machine learning for optimal strategy selection
- Multi-site batch operations

### Version History

**v1.0.0** - 2025-10-27
- Initial release
- Smart routing with v2/v3 strategy selection
- Fallback mechanisms
- Usage metrics tracking
- Menu integration
- Complete test suite
- Full documentation

---

## 🆘 Support & Contact

### Getting Help

**Step 1: Check Documentation**
- Read this file (SMART-WRAPPER-COMPLETE-DOCUMENTATION.md)
- Check decision guide: `GUIDE-API-YOYAKU-WHICH-ONE-TO-USE.md`
- Review deployment report: `SMART-WRAPPER-DEPLOYMENT-2025-10-27.md`

**Step 2: Run Tests**
```javascript
// Quick validation
quickSanityTest();

// Full test suite
runAllSmartFetchTests();
```

**Step 3: Check Execution Logs**
```
1. Extensions → Apps Script
2. View → Execution log
3. Look for error messages
4. Check timestamps for failures
```

**Step 4: Test Individual APIs**
```javascript
// Test v2 Connector
const v2Result = fetchStockDataV2Connector(['0007AD']);
Logger.log(v2Result);

// Test v3 REST API
const v3Result = recalculateSourceDataV3Targeted(['0007AD']);
Logger.log(v3Result);
```

**Step 5: Contact Support**
- Email: ben@yoyaku.fr
- GitHub Issues: https://github.com/benjaminbelaga/wp-import-dashboard/issues
- Provide: Error message, execution logs, steps to reproduce

### Reporting Issues

**Required Information:**
- Google Apps Script environment (always cloud-based)
- SKUs tested (examples)
- Strategy used (fast read / forced recalc / auto)
- Error message (exact text from logs)
- Expected behavior vs actual behavior
- Screenshot of execution log (if helpful)

**Create GitHub Issue:**

```markdown
Title: [BUG] Smart Wrapper fallback fails with network error

Description:
**Environment:**
- Smart Wrapper version: 1.0.0
- Test date: 2025-10-27

**Steps to Reproduce:**
1. Call fetchStockDataSmart(['0007AD'], 'yoyaku.io', false)
2. Observe error in execution log

**Expected Behavior:**
Should fetch data successfully or fallback to v3+v2 strategy

**Actual Behavior:**
Returns critical_failure error even though APIs are accessible

**Error Message:**
```
Both primary and fallback strategies failed
Original error: Network timeout after 30s
Fallback error: Network timeout after 30s
```

**Additional Context:**
- Happens consistently for specific SKUs
- Other SKUs work fine
- Both v2 and v3 tested individually and work
```

**Response Time:**
- Critical issues (production down): <4 hours
- High priority (affects workflow): <24 hours
- Medium priority (minor bugs): <1 week
- Low priority (enhancements): Backlog review

---

## 📝 License

This project is proprietary software developed by Benjamin Belaga for YOYAKU SARL.

**© 2024-2025 YOYAKU SARL - All Rights Reserved**

Unauthorized copying, modification, distribution, or use of this software, via any medium, is strictly prohibited without explicit written permission from YOYAKU SARL.

---

## 👤 Author

**Benjamin Belaga**
- GitHub: [@benjaminbelaga](https://github.com/benjaminbelaga)
- Email: ben@yoyaku.fr
- Company: YOYAKU SARL
- Role: Lead Developer & CTO

**Contributors:**
- Claude (AI Assistant) - Code implementation support and documentation assistance

---

## 🔗 Related Projects

**YOYAKU Ecosystem Plugins:**
- [YSC Plugin](https://github.com/benjaminbelaga/ysc) - YOYAKU SARL Companion (Core shared features)
- [YIO Plugin](https://github.com/benjaminbelaga/yio) - Integration & Optimization (B2C)
- [YID Plugin](https://github.com/benjaminbelaga/yid) - Integration Distribution (B2B)
- [YOFR Plugin](https://github.com/benjaminbelaga/yofr) - Order Fulfillment Rules

**YOYAKU Themes:**
- [YOYAKU Theme](https://github.com/benjaminbelaga/yoyaku-theme) - B2C Theme (YOYAKU.IO)
- [YYD Theme](https://github.com/benjaminbelaga/yyd-theme) - B2B Theme (YYD.FR)

**Infrastructure & Tools:**
- [WP Import Dashboard](https://github.com/benjaminbelaga/wp-import-dashboard) - This repository
- [Scheduler on Website](https://github.com/benjaminbelaga/scheduler-on-website) - Centralized cron management

**Documentation:**
- Main CLAUDE.md: `/Users/yoyaku/CLAUDE.md` (Global configuration)
- Ecosystem README: `/Users/yoyaku/README.md` (Navigation guide)

---

## 📌 Additional Resources

**Google Apps Script:**
- Script URL: https://script.google.com/u/0/home/projects/1JkXMaf57gFb8XtmT1Bbaoo6goKlhTw2ie1eIQRlDfqra6OG0oOdDEdUy/edit
- Documentation: https://developers.google.com/apps-script

**APIs Used:**
- WooCommerce REST API: https://woocommerce.github.io/woocommerce-rest-api-docs/
- v2 Connector: Custom implementation (YOYAKU specific)
- v3 REST API: Custom implementation with backorder optimization

**Performance Resources:**
- v2 Deployment Report: `/docs/DEPLOYMENT-REPORT-API-V2-2025-10-27.md`
- v3 Deployment Report: `/docs/DEPLOYMENT-REPORT-API-V3-2025-10-27.md`
- v3 Complete Documentation: `/docs/REST-API-V3-COMPLETE-DOCUMENTATION.md`

**Metrics & Analytics:**
- Usage Report Function: `generateUsageReport()`
- Metrics Cleanup: `clearOldMetrics(daysToKeep)`
- Storage Location: Google Apps Script Properties Service

---

**Last Updated:** 2025-10-27
**Documentation Version:** 1.0.0
**Maintainer:** Benjamin Belaga

---

## 📞 Quick Links

| Resource | Link |
|----------|------|
| **Live Script** | [Open in Apps Script](https://script.google.com/u/0/home/projects/1JkXMaf57gFb8XtmT1Bbaoo6goKlhTw2ie1eIQRlDfqra6OG0oOdDEdUy/edit) |
| **GitHub Repo** | [benjaminbelaga/wp-import-dashboard](https://github.com/benjaminbelaga/wp-import-dashboard) |
| **Test Guide** | `/docs/RUN-SMART-WRAPPER-TEST.md` |
| **Decision Guide** | `/docs/GUIDE-API-YOYAKU-WHICH-ONE-TO-USE.md` |
| **Support Email** | ben@yoyaku.fr |

---

**🎯 Mission:** Simplify API selection for webmasters, maximize performance for each use case, ensure data quality across YOYAKU ecosystem.
