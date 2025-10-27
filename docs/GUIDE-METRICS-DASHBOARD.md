# Smart Wrapper Metrics Dashboard - User Guide

> **Category:** Analytics / Dashboard / Google Sheets
> **Audience:** Webmasters & Developers
> **Last Updated:** 2025-10-27
> **Author:** Benjamin Belaga

---

## 🎯 Quick Start (30 seconds)

**Generate Dashboard:**
1. Open any YOYAKU Import sheet
2. Click menu: **Smart Wrapper** → **📊 Refresh Metrics Dashboard**
3. Wait 2-3 seconds
4. Check new sheet: **"Smart Wrapper Metrics"**

---

## 📊 Dashboard Overview

The metrics dashboard automatically generates:

### 1. **Data Table**
- All metrics from Script Properties
- Columns: Date, Strategy, Calls, Avg Time, Avg SKUs, Total Time, Total SKUs
- Sorted by date (most recent first)
- Alternating row colors for readability

### 2. **Summary Statistics**
- Total calls across all strategies
- Total time and SKUs processed
- Average time per call
- Average SKUs per call
- v2 vs v3 adoption rates
- Fallback trigger count
- Critical failure count

### 3. **Visual Charts**

**Chart 1: Strategy Adoption Rate** (Pie Chart)
- Shows percentage of each strategy used
- Colors:
  - Blue: v2_fetch_only
  - Green: v3_recalc_then_v2_fetch
  - Yellow: fallback_v2_only
  - Red: fallback_v3_then_v2
  - Gray: critical_failure

**Chart 2: Performance Over Time** (Line Chart)
- Average response time by strategy over days
- Helps identify performance trends
- Compare v2 vs v3 speeds

**Chart 3: Daily Call Volume** (Column Chart)
- Total calls per day
- Identify usage patterns
- Spot unusual activity

---

## 🚀 Usage Examples

### Daily Monitoring

```
1. Open Import 803 sheet
2. Smart Wrapper → 📊 Refresh Metrics Dashboard
3. Check "Smart Wrapper Metrics" sheet
4. Review summary statistics
5. Check if any critical failures
```

**Expected Results (Healthy System):**
- v2_fetch_only: 85-95% of calls
- v3_recalc_then_v2_fetch: 5-15% of calls
- Fallback triggers: <5%
- Critical failures: 0

### Weekly Performance Review

```javascript
// In Apps Script console
exportMetricsToDashboard();

// Then analyze:
// - Are response times increasing?
// - Is v3 being overused (should be <15%)?
// - Any new fallback patterns?
```

### Troubleshooting

**If you see high fallback rate (>10%):**
1. Check execution logs for errors
2. Verify API endpoints are accessible
3. Check bearer tokens validity
4. Review network issues

**If critical failures >0:**
1. Immediate investigation needed
2. Both v2 and v3 APIs may be down
3. Check YOYAKU.IO/YYD.FR site status

---

## ⚙️ Configuration

### Auto-Refresh on Open (Optional)

**Enable auto-refresh:**
1. Open `metrics-dashboard.js` in Apps Script
2. Uncomment `onOpen()` function at bottom of file
3. Save

**How it works:**
- Dashboard auto-refreshes if last update >1 hour ago
- Runs every time you open the spreadsheet
- Can be disabled by re-commenting the function

### Refresh Interval

**Default:** 1 hour (3600000ms)

**Change interval:**
```javascript
// In metrics-dashboard.js
const DASHBOARD_CONFIG = {
  sheetName: 'Smart Wrapper Metrics',
  refreshInterval: 1800000, // 30 minutes
  // ...
};
```

### Chart Colors

**Customize chart colors:**
```javascript
const DASHBOARD_CONFIG = {
  // ...
  chartColors: {
    v2_fetch_only: '#YOUR_COLOR',           // Hex color
    v3_recalc_then_v2_fetch: '#YOUR_COLOR',
    // ...
  }
};
```

---

## 📈 Interpreting Metrics

### Strategy Adoption

**Healthy Pattern:**
```
v2_fetch_only: 85-95%
  → Good! Most operations use fast read

v3_recalc_then_v2_fetch: 5-15%
  → Good! Maintenance and critical imports

fallback_*: <5%
  → Acceptable! Rare API failures handled

critical_failure: 0%
  → Perfect! No total outages
```

**Unhealthy Pattern:**
```
v2_fetch_only: <50%
  → Problem! v3 being overused (slow for daily ops)

v3_recalc_then_v2_fetch: >50%
  → Problem! Should use v2 for routine imports

fallback_*: >10%
  → Problem! Frequent API failures

critical_failure: >0%
  → CRITICAL! Both APIs failing
```

### Performance Trends

**Good Trend:**
- v2 avg time: Stable or decreasing
- v3 avg time: Stable around 1-2s
- Daily volume: Consistent or growing

**Bad Trend:**
- v2 avg time: Increasing (network issues?)
- v3 avg time: >3s consistently (backorder rate changed?)
- Daily volume: Sudden drop (usage problem?)

### Call Volume Analysis

**Normal Patterns:**
- **Weekdays:** Higher volume (webmasters importing)
- **Weekends:** Lower volume
- **Monday peaks:** Weekly maintenance imports

**Abnormal Patterns:**
- **Sudden spike:** Check for automation errors
- **Zero calls:** Dashboard/menu issue
- **Huge variance:** Inconsistent usage (train team)

---

## 🐛 Troubleshooting

### Dashboard Not Created

**Error:** "No metrics data available yet"

**Cause:** No Smart Wrapper calls have been made

**Solution:**
```javascript
// Run a test to generate metrics
quickSanityTest();

// Then refresh dashboard
exportMetricsToDashboard();
```

### Charts Not Showing

**Cause:** Not enough data points (need ≥2 dates for charts)

**Solution:** Wait for more usage data, or run multiple tests on different days

### Metrics Missing Days

**Cause:** No calls made on those days

**Normal:** Weekends, holidays, or low-usage periods

### Dashboard Update Failed

**Error:** "Exception: Service invoked too many times..."

**Cause:** Google Apps Script quota exceeded

**Solution:**
- Wait 24 hours (quotas reset daily)
- Or run cleanup: `clearOldMetrics(7)` to reduce data

---

## 🧹 Maintenance

### Clean Old Metrics

**Automatic (Recommended):**
```javascript
// Keeps last 30 days by default
clearOldMetrics();
```

**Custom Retention:**
```javascript
// Keep 90 days
clearOldMetrics(90);

// Keep 7 days (GDPR compliance)
clearOldMetrics(7);
```

**When to clean:**
- Monthly (automatic with 30-day retention)
- Before exporting metrics to external system
- If approaching Script Properties size limit

### Export Metrics to External System

**To Google Sheets (for long-term storage):**
1. Refresh dashboard
2. Copy data table (rows 6+)
3. Paste to separate "Historical Metrics" sheet
4. Repeat monthly

**To CSV:**
1. Open "Smart Wrapper Metrics" sheet
2. File → Download → CSV
3. Save with date: `metrics-2025-10-27.csv`

### Delete Dashboard

**If needed:**
1. Right-click sheet tab "Smart Wrapper Metrics"
2. Delete
3. Re-create anytime with `exportMetricsToDashboard()`

---

## 📊 Sample Dashboard

**What you should see:**

```
Smart Wrapper Metrics Dashboard
Last Updated: 2025-10-27 22:00:00

                                                    📊 Summary Statistics
Date       | Strategy              | Calls | Avg Time | Avg SKUs  ┌─────────────────────────────┐
-----------|-----------------------|-------|----------|----------- │ Total Calls: 156            │
2025-10-27 | v2_fetch_only         | 42    | 105ms    | 12        │ Total Time: 180s            │
2025-10-27 | v3_recalc_then_v2_fch | 8     | 1342ms   | 15        │ Total SKUs: 1920            │
2025-10-26 | v2_fetch_only         | 38    | 98ms     | 10        │                             │
2025-10-26 | v3_recalc_then_v2_fch | 6     | 1398ms   | 18        │ Avg Time/Call: 1154ms       │
...                                                                 │ Avg SKUs/Call: 12.3         │
                                                                   │                             │
[Chart 1: Pie - Strategy Adoption]  [Chart 2: Line - Performance] │ v2 Fast Read: 142 (91%)     │
                                                                   │ v3 Forced Recalc: 14 (9%)   │
[Chart 3: Column - Daily Volume]                                   │                             │
                                                                   │ Fallback Triggers: 0        │
                                                                   │ Critical Failures: 0        │
                                                                   └─────────────────────────────┘
```

---

## 🎯 Best Practices

### Daily Monitoring

**For Webmasters:**
- Check dashboard once per day
- Look for critical failures (should be 0)
- Verify v2 is being used for routine imports

### Weekly Review

**For Developers:**
- Analyze performance trends
- Check if v3 is overused
- Review fallback patterns
- Clean old metrics (if needed)

### Monthly Analysis

**For Team Lead:**
- Export metrics to long-term storage
- Calculate cost savings (v2 vs v3 usage)
- Identify optimization opportunities
- Plan infrastructure improvements

---

## 📚 Related Documentation

- **Smart Wrapper Documentation:** `/docs/SMART-WRAPPER-COMPLETE-DOCUMENTATION.md`
- **API Decision Guide:** `/docs/GUIDE-API-YOYAKU-WHICH-ONE-TO-USE.md`
- **Deployment Report:** `/docs/SMART-WRAPPER-DEPLOYMENT-2025-10-27.md`

---

## 🆘 Support

**Issues with Dashboard:**
- Check execution logs (Ctrl+Enter)
- Verify metrics exist: `generateUsageReport()`
- Contact: ben@yoyaku.fr

**Feature Requests:**
- Open GitHub issue
- Describe desired visualization
- Provide use case

---

**Last Updated:** 2025-10-27
**Version:** 1.0.0
**Maintainer:** Benjamin Belaga
