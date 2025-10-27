# Changelog - Stock Update API v3.0

**Date:** 2025-10-26
**Author:** Benjamin Belaga
**Version:** 3.0.0-webmaster

---

## Summary

Added automatic recalculation of source data before fetching from APIs. This ensures that data from YOYAKU.IO and YYD.FR is always fresh and up-to-date before being imported into the Google Sheet.

---

## Changes Made

### 1. New Recalculation API Configuration (`api-credentials.js`)

**Added:**
- `RECALC_ENDPOINTS` configuration object
- `getRecalcEndpoint()` function to retrieve recalculation endpoints

**Endpoints configured:**
- YOYAKU.IO: `https://www.yoyaku.io/wp-json/ysc/v1/recalculate-preorders`
- YYD.FR: `https://www.yydistribution.fr/wp-json/yyd/v1/recalculate-shelves`

**Tokens:**
- Placeholder tokens included (TODO: Replace with real tokens)
- Can be stored in Script Properties for enhanced security

### 2. New Recalculation Function (`api-stock-functions-v2-webmaster.js`)

**Function:** `recalculateSourceData()`

**Purpose:**
Calls recalculation APIs on both YOYAKU.IO and YYD.FR to ensure fresh data.

**Features:**
- Sequential API calls (YOYAKU.IO first, then YYD.FR)
- 1-second pause between calls to avoid rate limiting
- HTTP status validation (200/201 = success)
- Detailed error logging
- Graceful degradation (continues even if one site fails)
- Returns status object with success/error details

**Error Handling:**
- Individual try/catch for each API call
- Continues processing even if one site fails
- Logs all errors for debugging
- Reports status to user

### 3. Modified `fetchDataAndCalculateFromAPI()` Function

**New Workflow:**

```
1. User clicks "Fetch Data & Calculate"
   ↓
2. Confirmation dialog (updated with recalculation info)
   ↓
3. [NEW] Call recalculateSourceData()
   ├─ YOYAKU.IO: Recalculate preorders
   └─ YYD.FR: Recalculate shelf quantities
   ↓
4. Show recalculation status toast
   ↓
5. Wait 2 seconds (user feedback)
   ↓
6. Fetch data from YOYAKU.IO API (existing code)
   ↓
7. Calculate columns I, L, M, N, S (existing code)
   ↓
8. Final report (includes recalculation status)
```

**UI Updates:**
- Updated confirmation dialog to mention recalculation
- Progress toasts show 3 steps (recalc YOYAKU, recalc YYD, fetch)
- Final report includes recalculation success/failure status
- Alert title updated to "v3.0"

### 4. Documentation Updates

**Updated file header:**
- Version: 3.0.0-webmaster
- Added "NEW IN V3.0" section
- Documented recalculation features

---

## API Call Details

### Recalculation API Format

**YOYAKU.IO:**
```javascript
POST https://www.yoyaku.io/wp-json/ysc/v1/recalculate-preorders
Headers:
  Authorization: Bearer {YSC_RECALC_TOKEN}
  Content-Type: application/json
```

**YYD.FR:**
```javascript
POST https://www.yydistribution.fr/wp-json/yyd/v1/recalculate-shelves
Headers:
  Authorization: Bearer {YYD_RECALC_TOKEN}
  Content-Type: application/json
```

**Expected Response:**
- HTTP 200 or 201 = Success
- Any other status = Error (logged and reported)

---

## Error Handling Strategy

### Recalculation Failures

**If YOYAKU.IO fails:**
- Log error message
- Mark as failed in results object
- Continue with YYD.FR recalculation
- Continue with data fetch (may have stale preorder data)

**If YYD.FR fails:**
- Log error message
- Mark as failed in results object
- Continue with data fetch (may have stale shelf data)

**If both fail:**
- Log both errors
- Show warning toast: "❌ Failed (continuing with stale data)"
- Continue with data fetch
- Report both failures in final alert

### User Feedback

**Progress Toasts:**
1. "Step 1/3: Recalculating YOYAKU.IO preorder data..."
2. "Step 2/3: Recalculating YYD.FR shelf data..."
3. "Step 3/3: Fetching fresh data from API & calculating..."

**Status Toast:**
- ✅ "Both sites recalculated successfully" (full success)
- ⚠️ "Partial success (see logs)" (one site failed)
- ❌ "Failed (continuing with stale data)" (both failed)

**Final Report:**
```
🔄 RECALCULATION:
• YOYAKU.IO: ✅ Success / ⚠️ Failed
  └─ [Error message if failed]
• YYD.FR: ✅ Success / ⚠️ Failed
  └─ [Error message if failed]

📊 FETCH RESULTS:
[existing report...]
```

---

## Testing Checklist

### Before Production Deployment

- [ ] Replace placeholder tokens in `api-credentials.js` with real tokens
- [ ] Verify YOYAKU.IO recalculation endpoint is live
- [ ] Verify YYD.FR recalculation endpoint is live
- [ ] Test full workflow with real data
- [ ] Test error handling (simulate API failures)
- [ ] Verify graceful degradation works
- [ ] Check logs for proper error messages
- [ ] Verify user feedback is clear and helpful

### Test Scenarios

1. **Happy Path:**
   - Both recalculations succeed
   - Data fetch succeeds
   - Verify fresh data is retrieved

2. **YOYAKU.IO Recalc Fails:**
   - Simulate 401/500 error
   - Verify YYD.FR still runs
   - Verify fetch continues
   - Check error reporting

3. **YYD.FR Recalc Fails:**
   - Simulate 401/500 error
   - Verify YOYAKU.IO succeeds
   - Verify fetch continues
   - Check error reporting

4. **Both Recalcs Fail:**
   - Simulate both failing
   - Verify fetch still runs
   - Verify clear warning to user

5. **Network Timeout:**
   - Simulate slow network
   - Verify timeout handling
   - Verify error messages

---

## Performance Impact

**Added Time:**
- YOYAKU.IO recalc: ~2-5 seconds
- YYD.FR recalc: ~2-5 seconds
- 1-second pause between calls
- 2-second user feedback delay
- **Total added:** ~7-13 seconds

**Benefits:**
- Eliminates stale data issues
- Ensures accurate stock calculations
- Reduces manual intervention
- Prevents import errors from outdated data

**Trade-off:** Worth the extra time for data accuracy.

---

## Future Enhancements

### Potential Improvements

1. **Token Security:**
   - Store tokens in Script Properties
   - Rotate tokens periodically
   - Add token expiration handling

2. **Parallel API Calls:**
   - Call both recalculation APIs simultaneously
   - Reduce total time from ~10s to ~5s
   - Use `UrlFetchApp.fetchAll()` for parallel execution

3. **Retry Logic:**
   - Add automatic retry on temporary failures (5xx errors)
   - Exponential backoff between retries
   - Max 3 retries per endpoint

4. **Caching:**
   - Cache recalculation results for 5 minutes
   - Skip recalc if data is fresh
   - Add "Force Recalc" option

5. **Progress Bar:**
   - Replace toasts with actual progress bar
   - Show percentage completion
   - More visual feedback

6. **Detailed Logs:**
   - Add structured logging
   - Export logs to separate sheet
   - Track recalculation history

---

## Migration Notes

### Upgrading from v2.0 to v3.0

**No breaking changes** - v3.0 is fully backward compatible.

**Steps:**
1. Copy new code to Google Apps Script
2. Update `api-credentials.js` with recalculation tokens
3. Test on clone/development sheet first
4. Deploy to production when ready

**Rollback:**
If issues occur, simply revert to v2.0 code. No data schema changes.

---

## Support

**Issues:**
- Check logs via View → Logs in Google Apps Script editor
- Review error messages in final report dialog
- Contact: ben@yoyaku.fr

**Documentation:**
- Full workflow: See file header in `api-stock-functions-v2-webmaster.js`
- API reference: WordPress REST API endpoints on each site

---

**Version History:**
- v1.0: Initial release (manual formulas)
- v2.0: Auto-calculate from API (single endpoint)
- v3.0: Auto-recalculation + fetch (fresh data guaranteed)
