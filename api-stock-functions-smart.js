/**
 * Smart API Wrapper - Intelligent routing between v2 Connector and v3 REST API
 *
 * Strategy:
 * - Default: v2 Connector (ultra-fast read, <100ms)
 * - Force recalc: v3 REST API + v2 Connector (guaranteed fresh, 195ms-2000ms)
 * - Auto mode: Future staleness detection
 *
 * @author Benjamin Belaga
 * @version 1.0.0
 * @date 2025-10-27
 */

/**
 * Smart Fetch: Choose best API automatically
 *
 * This is the ONE function webmasters should use. It intelligently chooses
 * between v2 Connector (fast read) and v3 REST API (force recalculation).
 *
 * @param {Array<string>} skus - SKUs to fetch
 * @param {string} site - 'yoyaku.io' or 'yydistribution.fr'
 * @param {boolean|string} forceRecalc - Force recalculation strategy:
 *   - false: Fast read only (v2 Connector)
 *   - true: Force recalculation (v3 REST API + v2 Connector)
 *   - 'auto': Auto-detect staleness (future feature)
 * @returns {Object} Stock data with performance metrics
 */
function fetchStockDataSmart(skus, site = 'yoyaku.io', forceRecalc = false) {
  if (!skus || skus.length === 0) {
    Logger.log('⚠️  No SKUs provided to fetchStockDataSmart');
    return {
      success: false,
      error: 'No SKUs provided',
      strategy: 'none',
      results: []
    };
  }

  const startTime = new Date().getTime();

  Logger.log(`\n🧠 Smart Fetch API`);
  Logger.log(`   SKUs: ${skus.length}`);
  Logger.log(`   Site: ${site}`);
  Logger.log(`   Force Recalc: ${forceRecalc}`);

  // Auto-detection mode (future feature)
  if (forceRecalc === 'auto') {
    Logger.log('   🔍 Auto-detection mode (checking staleness)...');
    forceRecalc = shouldAutoRecalculate(skus, site);
    Logger.log(`   → Decision: ${forceRecalc ? 'RECALCULATE' : 'FAST READ'}`);
  }

  try {
    if (forceRecalc) {
      // Strategy: Recalculate first (v3), then fetch (v2)
      return executeRecalculateThenFetchStrategy(skus, site, startTime);
    } else {
      // Strategy: Fast read only (v2)
      return executeFastReadStrategy(skus, site, startTime);
    }
  } catch (error) {
    Logger.log(`❌ Smart fetch failed: ${error.message}`);
    Logger.log(`   Attempting fallback strategy...`);

    // Fallback: Try opposite strategy
    return executeFallbackStrategy(skus, site, startTime, forceRecalc, error);
  }
}

/**
 * Execute "Recalculate then Fetch" strategy (v3 + v2)
 * Guarantees fresh data but slower (~195ms-2000ms)
 *
 * @private
 */
function executeRecalculateThenFetchStrategy(skus, site, startTime) {
  Logger.log('   📡 Strategy: v3 recalc + v2 fetch (guaranteed fresh)');

  // Step 1: Force recalculation with v3 REST API
  Logger.log('   📡 Step 1: Forcing recalculation with v3 API...');
  const recalcResult = recalculateSourceDataV3Targeted(skus);

  const siteKey = site === 'yoyaku.io' ? 'yoyaku' : 'yyd';
  const siteResult = recalcResult[siteKey];

  if (siteResult && siteResult.success) {
    Logger.log(`   ✅ v3 recalculation successful`);
    Logger.log(`      Time: ${siteResult.time_taken || 'N/A'}`);
    Logger.log(`      Processed: ${siteResult.products_processed || 0}`);
    Logger.log(`      Skipped: ${siteResult.products_skipped || 0}`);
  } else {
    Logger.log(`   ⚠️  v3 recalculation failed or incomplete`);
  }

  // Wait for DB write to complete
  Logger.log('   ⏳ Waiting for DB write (1s)...');
  Utilities.sleep(1000);

  // Step 2: Fetch fresh data with v2 Connector
  Logger.log('   📡 Step 2: Fetching fresh data with v2 Connector...');
  const fetchResult = fetchStockDataV2Connector(skus);

  const totalTime = new Date().getTime() - startTime;
  Logger.log(`\n✅ Smart Fetch complete: ${totalTime}ms total`);
  Logger.log(`   Strategy: v3_recalc_then_v2_fetch`);

  // Log usage metrics for future analysis
  logUsageMetrics('v3_recalc_then_v2_fetch', totalTime, skus.length);

  return {
    ...fetchResult,
    strategy: 'v3_recalc_then_v2_fetch',
    recalc_stats: {
      processed: siteResult?.products_processed || 0,
      skipped: siteResult?.products_skipped || 0,
      time_taken: siteResult?.time_taken || '0s'
    },
    total_time_ms: totalTime
  };
}

/**
 * Execute "Fast Read" strategy (v2 only)
 * Ultra-fast but data might be stale (~100ms)
 *
 * @private
 */
function executeFastReadStrategy(skus, site, startTime) {
  Logger.log('   📡 Strategy: v2 fetch only (ultra-fast read)');

  const fetchResult = fetchStockDataV2Connector(skus);

  const totalTime = new Date().getTime() - startTime;
  Logger.log(`\n✅ Smart Fetch complete: ${totalTime}ms total`);
  Logger.log(`   Strategy: v2_fetch_only`);

  // Log usage metrics for future analysis
  logUsageMetrics('v2_fetch_only', totalTime, skus.length);

  return {
    ...fetchResult,
    strategy: 'v2_fetch_only',
    total_time_ms: totalTime
  };
}

/**
 * Execute fallback strategy when primary strategy fails
 *
 * @private
 */
function executeFallbackStrategy(skus, site, startTime, originalForceRecalc, originalError) {
  Logger.log(`   🔄 Fallback: Trying opposite strategy...`);

  try {
    if (originalForceRecalc) {
      // Original strategy was v3+v2, fallback to v2 only
      Logger.log(`   → Fallback to fast read only (skip recalc)`);
      const fetchResult = fetchStockDataV2Connector(skus);

      const totalTime = new Date().getTime() - startTime;
      Logger.log(`\n⚠️  Smart Fetch completed with fallback: ${totalTime}ms`);

      logUsageMetrics('fallback_v2_only', totalTime, skus.length);

      return {
        ...fetchResult,
        strategy: 'fallback_v2_only',
        warning: 'Recalculation failed, returned cached data',
        original_error: originalError.message,
        total_time_ms: totalTime
      };
    } else {
      // Original strategy was v2 only, fallback to v3+v2
      Logger.log(`   → Fallback to force recalculation (v3+v2)`);

      const recalcResult = recalculateSourceDataV3Targeted(skus);
      Utilities.sleep(1000);
      const fetchResult = fetchStockDataV2Connector(skus);

      const totalTime = new Date().getTime() - startTime;
      Logger.log(`\n⚠️  Smart Fetch completed with fallback: ${totalTime}ms`);

      logUsageMetrics('fallback_v3_then_v2', totalTime, skus.length);

      return {
        ...fetchResult,
        strategy: 'fallback_v3_then_v2',
        warning: 'Fast read failed, forced recalculation',
        original_error: originalError.message,
        total_time_ms: totalTime
      };
    }
  } catch (fallbackError) {
    // Both strategies failed - critical error
    Logger.log(`❌ CRITICAL: Both primary and fallback strategies failed`);
    Logger.log(`   Original error: ${originalError.message}`);
    Logger.log(`   Fallback error: ${fallbackError.message}`);

    const totalTime = new Date().getTime() - startTime;
    logUsageMetrics('critical_failure', totalTime, skus.length);

    return {
      success: false,
      strategy: 'critical_failure',
      error: 'Both primary and fallback strategies failed',
      original_error: originalError.message,
      fallback_error: fallbackError.message,
      total_time_ms: totalTime,
      results: []
    };
  }
}

/**
 * Auto-detect if recalculation is necessary
 *
 * Future feature: Check _last_recalculated timestamp to detect stale data
 * For now: Always returns false (fast read by default)
 *
 * @param {Array<string>} skus - SKUs to check
 * @param {string} site - Site identifier
 * @returns {boolean} True if recalculation recommended
 * @private
 */
function shouldAutoRecalculate(skus, site) {
  // Future implementation:
  // 1. Fetch _last_recalculated timestamp from backend
  // 2. Check if data is >5min old
  // 3. Check if recent errors occurred
  // 4. Return true if recalc recommended

  // For now: Always use fast read (conservative approach)
  return false;
}

/**
 * Log usage metrics for future analysis
 * Stores daily aggregated metrics in Script Properties
 *
 * @param {string} strategy - Strategy used (v2_fetch_only, v3_recalc_then_v2_fetch, etc.)
 * @param {number} timeMs - Time taken in milliseconds
 * @param {number} skuCount - Number of SKUs processed
 * @private
 */
function logUsageMetrics(strategy, timeMs, skuCount) {
  try {
    const scriptProperties = PropertiesService.getScriptProperties();

    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const key = `metrics_${strategy}_${today}`;

    const current = JSON.parse(
      scriptProperties.getProperty(key) || '{"calls":0,"totalTime":0,"totalSkus":0}'
    );

    current.calls++;
    current.totalTime += timeMs;
    current.totalSkus += skuCount;

    scriptProperties.setProperty(key, JSON.stringify(current));

    Logger.log(`   📊 Metrics logged: ${strategy} (${timeMs}ms, ${skuCount} SKUs)`);
  } catch (error) {
    // Non-critical error - don't fail the main operation
    Logger.log(`   ⚠️  Failed to log metrics: ${error.message}`);
  }
}

/**
 * Menu integration for webmasters
 * Replaces the old fetchAndCalculateStockV2Connector
 *
 * This function:
 * 1. Asks user if they want to force recalculation
 * 2. Detects all rows with SKU but empty image
 * 3. Fetches data with smart strategy
 * 4. Updates sheet with results
 *
 * @param {Range} selectedRange - Selected range (optional)
 * @param {boolean} forceRecalc - Force recalculation (optional, will ask user if not provided)
 */
function fetchAndCalculateStockSmart(selectedRange, forceRecalc = null) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  // Ask user if they want to force recalculation (if not specified)
  if (forceRecalc === null) {
    const ui = SpreadsheetApp.getUi();
    const response = ui.alert(
      '🧠 Smart Fetch - Quelle stratégie?',
      'Voulez-vous forcer un recalcul avant de récupérer les données?\n\n' +
      '✅ OUI: Recalcul v3 + fetch v2 (2-3 secondes, données garanties fraîches)\n' +
      '⚡ NON: Fetch v2 uniquement (ultra-rapide <1 seconde, données as-is)',
      ui.ButtonSet.YES_NO
    );

    forceRecalc = (response === ui.Button.YES);
  }

  Logger.log(`\n🚀 Smart Fetch & Calculate`);
  Logger.log(`   Force Recalc: ${forceRecalc}`);

  // Smart detection: Find all rows with SKU but empty image
  const lastRow = sheet.getLastRow();
  const skus = [];
  const rowMap = {};

  Logger.log(`   Scanning sheet for rows to process...`);

  for (let row = 2; row <= lastRow; row++) {
    const skuValue = sheet.getRange(row, 3).getValue(); // Column C (SKU)
    const imageValue = sheet.getRange(row, 1).getValue(); // Column A (Image)

    if (skuValue && !imageValue) {
      const skuStr = skuValue.toString().trim();
      skus.push(skuStr);
      rowMap[skuStr] = row;
    }
  }

  if (skus.length === 0) {
    Logger.log(`   ⚠️  No rows to process (all rows have images or no SKUs found)`);
    SpreadsheetApp.getUi().alert(
      'No rows to process!\n\n' +
      'All rows either have images or no SKUs found.'
    );
    return;
  }

  Logger.log(`   Found ${skus.length} rows to process`);

  // Fetch data with smart strategy
  const result = fetchStockDataSmart(skus, 'yoyaku.io', forceRecalc);

  if (!result.success) {
    Logger.log(`❌ Smart fetch failed: ${result.error}`);
    SpreadsheetApp.getUi().alert(
      'Error!\n\n' +
      `Smart fetch failed: ${result.error}\n\n` +
      'Check execution log for details.'
    );
    return;
  }

  // Update sheet rows
  Logger.log(`\n📝 Updating sheet rows...`);
  let successCount = 0;
  let errorCount = 0;

  result.results.forEach(productData => {
    const row = rowMap[productData.sku];
    if (!row) {
      Logger.log(`   ⚠️  SKU ${productData.sku} not found in row map`);
      return;
    }

    try {
      // Update preorders (U/21), shelf (T/20), image (A/1 + Z/26)
      if (productData.preorder_count !== undefined) {
        sheet.getRange(row, 21).setValue(productData.preorder_count);
      }
      if (productData.shelf_count !== undefined) {
        sheet.getRange(row, 20).setValue(productData.shelf_count);
      }

      if (productData.image_url) {
        sheet.getRange(row, 26).setValue(productData.image_url);
        sheet.getRange(row, 1).setFormula(`=IMAGE(Z${row})`);
      }

      Logger.log(`   ✅ Row ${row}: ${productData.sku} updated`);
      successCount++;
    } catch (error) {
      Logger.log(`   ❌ Row ${row}: Error updating ${productData.sku} - ${error.message}`);
      errorCount++;
    }
  });

  // Show summary
  Logger.log(`\n✅ Update complete: ${successCount} success, ${errorCount} errors`);

  const summary =
    `✅ Completed!\n\n` +
    `Success: ${successCount} rows\n` +
    `Errors: ${errorCount} rows\n` +
    `Strategy: ${result.strategy}\n` +
    `Total time: ${result.total_time_ms}ms\n` +
    (result.recalc_stats ? `\nRecalculation:\n` : '') +
    (result.recalc_stats ? `  Processed: ${result.recalc_stats.processed}\n` : '') +
    (result.recalc_stats ? `  Skipped: ${result.recalc_stats.skipped}\n` : '') +
    (result.recalc_stats ? `  Time: ${result.recalc_stats.time_taken}\n` : '') +
    (result.warning ? `\n⚠️  ${result.warning}` : '');

  SpreadsheetApp.getUi().alert(summary);
}

/**
 * Generate usage metrics report
 * Shows aggregated statistics for all strategies
 *
 * @returns {Array<Object>} Usage report data
 */
function generateUsageReport() {
  Logger.log('\n📊 USAGE METRICS REPORT');
  Logger.log('='.repeat(60));

  try {
    const scriptProperties = PropertiesService.getScriptProperties();
    const allKeys = scriptProperties.getKeys();

    const metricsKeys = allKeys.filter(k => k.startsWith('metrics_'));

    if (metricsKeys.length === 0) {
      Logger.log('No metrics data available yet.');
      return [];
    }

    // Créer tableau récapitulatif
    const report = [];
    metricsKeys.forEach(key => {
      const data = JSON.parse(scriptProperties.getProperty(key));
      const parts = key.split('_');
      const date = parts[parts.length - 1]; // Last part is date
      const strategy = parts.slice(1, -1).join('_'); // Middle parts are strategy

      report.push({
        date: date,
        strategy: strategy,
        calls: data.calls,
        avgTime: Math.round(data.totalTime / data.calls),
        avgSkus: Math.round(data.totalSkus / data.calls),
        totalTime: data.totalTime,
        totalSkus: data.totalSkus
      });
    });

    // Sort by date descending
    report.sort((a, b) => b.date.localeCompare(a.date));

    // Display report
    Logger.log('\nDate       | Strategy                  | Calls | Avg Time | Avg SKUs');
    Logger.log('-'.repeat(75));
    report.forEach(r => {
      Logger.log(
        `${r.date} | ${r.strategy.padEnd(25)} | ${String(r.calls).padStart(5)} | ` +
        `${String(r.avgTime).padStart(8)}ms | ${String(r.avgSkus).padStart(8)}`
      );
    });

    Logger.log('\n' + '='.repeat(60));
    Logger.log(`Total entries: ${report.length}`);

    return report;
  } catch (error) {
    Logger.log(`❌ Error generating report: ${error.message}`);
    return [];
  }
}

/**
 * Clear old metrics (cleanup function)
 * Removes metrics older than specified days
 *
 * @param {number} daysToKeep - Keep metrics for last N days (default 30)
 */
function clearOldMetrics(daysToKeep = 30) {
  Logger.log(`\n🧹 Cleaning metrics older than ${daysToKeep} days...`);

  try {
    const scriptProperties = PropertiesService.getScriptProperties();
    const allKeys = scriptProperties.getKeys();
    const metricsKeys = allKeys.filter(k => k.startsWith('metrics_'));

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    const cutoffStr = cutoffDate.toISOString().slice(0, 10);

    let deletedCount = 0;
    metricsKeys.forEach(key => {
      const parts = key.split('_');
      const date = parts[parts.length - 1];

      if (date < cutoffStr) {
        scriptProperties.deleteProperty(key);
        deletedCount++;
        Logger.log(`   🗑️  Deleted: ${key}`);
      }
    });

    Logger.log(`\n✅ Cleanup complete: ${deletedCount} old metrics deleted`);
  } catch (error) {
    Logger.log(`❌ Error cleaning metrics: ${error.message}`);
  }
}
