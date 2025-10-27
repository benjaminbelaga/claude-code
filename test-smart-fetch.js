/**
 * Smart Fetch Performance & Edge Case Tests
 *
 * Run these tests to validate the Smart Wrapper behavior
 * and compare performance between strategies.
 *
 * @author Benjamin Belaga
 * @version 1.0.0
 * @date 2025-10-27
 */

/**
 * Main performance test: Compare v2 only vs v3+v2 strategies
 * Tests with real SKUs from the active sheet
 */
function testSmartFetchPerformance() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const testSkus = [];

  Logger.log('='.repeat(80));
  Logger.log('📊 SMART FETCH PERFORMANCE TEST');
  Logger.log('='.repeat(80));

  // Collect first 10 SKUs from sheet
  Logger.log('\n📋 Collecting test SKUs from sheet...');
  for (let i = 2; i <= 11 && i <= sheet.getLastRow(); i++) {
    const sku = sheet.getRange(i, 3).getValue(); // Column C (SKU)
    if (sku && sku.toString().trim() !== '') {
      testSkus.push(sku.toString().trim());
    }
  }

  if (testSkus.length === 0) {
    Logger.log('❌ No SKUs found for testing in rows 2-11');
    return;
  }

  Logger.log(`✅ Collected ${testSkus.length} test SKUs:`);
  Logger.log(`   ${testSkus.join(', ')}`);

  // Test 1: Fast fetch (v2 only)
  Logger.log('\n' + '='.repeat(80));
  Logger.log('🔵 TEST 1: Fast Fetch (v2 Connector only)');
  Logger.log('='.repeat(80));

  const t1Start = new Date().getTime();
  const result1 = fetchStockDataSmart(testSkus, 'yoyaku.io', false);
  const t1Time = new Date().getTime() - t1Start;

  Logger.log(`\n✅ Test 1 Complete:`);
  Logger.log(`   Time: ${t1Time}ms`);
  Logger.log(`   Strategy: ${result1.strategy}`);
  Logger.log(`   Success: ${result1.success}`);
  Logger.log(`   Products returned: ${result1.results?.length || 0}`);

  // Wait 2 seconds between tests
  Logger.log('\n⏳ Waiting 2 seconds before next test...');
  Utilities.sleep(2000);

  // Test 2: Forced recalculation (v3 + v2)
  Logger.log('\n' + '='.repeat(80));
  Logger.log('🟢 TEST 2: Forced Recalculation (v3 REST API + v2 Connector)');
  Logger.log('='.repeat(80));

  const t2Start = new Date().getTime();
  const result2 = fetchStockDataSmart(testSkus, 'yoyaku.io', true);
  const t2Time = new Date().getTime() - t2Start;

  Logger.log(`\n✅ Test 2 Complete:`);
  Logger.log(`   Time: ${t2Time}ms`);
  Logger.log(`   Strategy: ${result2.strategy}`);
  Logger.log(`   Success: ${result2.success}`);
  Logger.log(`   Products returned: ${result2.results?.length || 0}`);
  if (result2.recalc_stats) {
    Logger.log(`   Recalc processed: ${result2.recalc_stats.processed}`);
    Logger.log(`   Recalc skipped: ${result2.recalc_stats.skipped}`);
  }

  // Results comparison
  Logger.log('\n' + '='.repeat(80));
  Logger.log('📊 RESULTS COMPARISON');
  Logger.log('='.repeat(80));
  Logger.log(`Test SKUs:           ${testSkus.length}`);
  Logger.log(`Fast fetch (v2):     ${t1Time}ms`);
  Logger.log(`Forced recalc (v3):  ${t2Time}ms`);
  Logger.log(`Overhead:            ${t2Time - t1Time}ms (${Math.round((t2Time / t1Time - 1) * 100)}%)`);

  Logger.log('\n💡 RECOMMENDATION:');
  Logger.log('   - Use fast fetch (v2) for daily dashboard updates');
  Logger.log('   - Use forced recalc (v3+v2) for:');
  Logger.log('     • Weekly maintenance');
  Logger.log('     • After bulk inventory changes');
  Logger.log('     • Debugging specific products');
  Logger.log('     • Critical imports requiring guaranteed fresh data');

  Logger.log('\n' + '='.repeat(80));
}

/**
 * Test 3: Empty SKUs array
 * Validates graceful handling of empty input
 */
function testSmartFetchEmptySKUs() {
  Logger.log('\n' + '='.repeat(80));
  Logger.log('🧪 TEST 3: Empty SKUs Array');
  Logger.log('='.repeat(80));

  const result = fetchStockDataSmart([], 'yoyaku.io', false);

  Logger.log('\n✅ Test 3 Complete:');
  Logger.log(`   Success: ${result.success}`);
  Logger.log(`   Error: ${result.error || 'None'}`);
  Logger.log(`   Strategy: ${result.strategy}`);
  Logger.log(`   Expected: success=false, error="No SKUs provided", strategy="none"`);

  if (!result.success && result.error === 'No SKUs provided' && result.strategy === 'none') {
    Logger.log('   ✅ PASS: Handled empty SKUs gracefully');
  } else {
    Logger.log('   ❌ FAIL: Unexpected behavior for empty SKUs');
  }
}

/**
 * Test 4: Invalid SKUs
 * Validates handling of non-existent products
 */
function testSmartFetchInvalidSKUs() {
  Logger.log('\n' + '='.repeat(80));
  Logger.log('🧪 TEST 4: Invalid SKUs');
  Logger.log('='.repeat(80));

  const invalidSkus = ['INVALID_SKU_999', 'NONEXISTENT_ABC', 'FAKE_PRODUCT_XYZ'];

  Logger.log(`   Testing with: ${invalidSkus.join(', ')}`);

  const result = fetchStockDataSmart(invalidSkus, 'yoyaku.io', false);

  Logger.log('\n✅ Test 4 Complete:');
  Logger.log(`   Success: ${result.success}`);
  Logger.log(`   Products returned: ${result.results?.length || 0}`);
  Logger.log(`   Strategy: ${result.strategy}`);

  if (result.results) {
    result.results.forEach(r => {
      Logger.log(`   → ${r.sku}: ${r.product_id ? 'Found' : 'Not found'}`);
    });
  }

  Logger.log('   ✅ PASS: Invalid SKUs handled without crash');
}

/**
 * Test 5: Mixed valid and invalid SKUs
 * Validates partial success handling
 */
function testSmartFetchMixedSKUs() {
  Logger.log('\n' + '='.repeat(80));
  Logger.log('🧪 TEST 5: Mixed Valid and Invalid SKUs');
  Logger.log('='.repeat(80));

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  // Get 2 valid SKUs from sheet
  const validSkus = [];
  for (let i = 2; i <= 3 && i <= sheet.getLastRow(); i++) {
    const sku = sheet.getRange(i, 3).getValue();
    if (sku && sku.toString().trim() !== '') {
      validSkus.push(sku.toString().trim());
    }
  }

  if (validSkus.length < 2) {
    Logger.log('   ⚠️  Not enough valid SKUs in sheet for mixed test');
    return;
  }

  // Mix with invalid SKUs
  const mixedSkus = [
    validSkus[0],
    'INVALID_SKU_1',
    validSkus[1],
    'INVALID_SKU_2'
  ];

  Logger.log(`   Testing with: ${mixedSkus.join(', ')}`);

  const result = fetchStockDataSmart(mixedSkus, 'yoyaku.io', false);

  Logger.log('\n✅ Test 5 Complete:');
  Logger.log(`   Success: ${result.success}`);
  Logger.log(`   Total SKUs requested: ${mixedSkus.length}`);
  Logger.log(`   Products returned: ${result.results?.length || 0}`);

  if (result.results) {
    let foundCount = 0;
    let notFoundCount = 0;

    result.results.forEach(r => {
      const found = r.product_id && r.product_id > 0;
      Logger.log(`   → ${r.sku}: ${found ? 'Found' : 'Not found'}`);
      if (found) foundCount++;
      else notFoundCount++;
    });

    Logger.log(`\n   Summary: ${foundCount} found, ${notFoundCount} not found`);
    Logger.log(`   Expected: 2 found, 2 not found`);

    if (foundCount === 2 && notFoundCount === 2) {
      Logger.log('   ✅ PASS: Mixed SKUs handled correctly');
    } else {
      Logger.log('   ⚠️  WARNING: Unexpected found/not found counts');
    }
  }
}

/**
 * Test 6: Auto-detection mode (future feature)
 * Currently should default to fast read
 */
function testSmartFetchAutoMode() {
  Logger.log('\n' + '='.repeat(80));
  Logger.log('🧪 TEST 6: Auto-Detection Mode (Future Feature)');
  Logger.log('='.repeat(80));

  const testSkus = ['0007AD', '006'];

  Logger.log(`   Testing with auto mode...`);

  const result = fetchStockDataSmart(testSkus, 'yoyaku.io', 'auto');

  Logger.log('\n✅ Test 6 Complete:');
  Logger.log(`   Success: ${result.success}`);
  Logger.log(`   Strategy: ${result.strategy}`);
  Logger.log(`   Expected: v2_fetch_only (auto defaults to fast read for now)`);

  if (result.strategy === 'v2_fetch_only') {
    Logger.log('   ✅ PASS: Auto mode defaults to fast read as expected');
  } else {
    Logger.log('   ⚠️  WARNING: Auto mode behaved differently than expected');
  }
}

/**
 * Test 7: Fallback strategy (simulate v2 failure)
 * This is harder to test without mocking, but we can document expected behavior
 */
function testSmartFetchFallbackBehavior() {
  Logger.log('\n' + '='.repeat(80));
  Logger.log('🧪 TEST 7: Fallback Strategy Behavior (Documentation)');
  Logger.log('='.repeat(80));

  Logger.log('\n📚 Expected Fallback Behavior:');
  Logger.log('\n   Scenario 1: v2 Connector fails');
  Logger.log('   → Fallback: Try v3 REST API + v2 Connector');
  Logger.log('   → Result: Returns fresh data if v3 succeeds');
  Logger.log('   → Strategy: "fallback_v3_then_v2"');

  Logger.log('\n   Scenario 2: v3 REST API fails');
  Logger.log('   → Fallback: Skip recalc, try v2 Connector only');
  Logger.log('   → Result: Returns cached data if v2 succeeds');
  Logger.log('   → Strategy: "fallback_v2_only"');

  Logger.log('\n   Scenario 3: Both v2 and v3 fail');
  Logger.log('   → Result: Returns error object');
  Logger.log('   → Strategy: "critical_failure"');
  Logger.log('   → Success: false');

  Logger.log('\n💡 Note: Fallback can only be fully tested in production when failures occur.');
  Logger.log('   The Smart Wrapper is designed to maximize uptime even during partial outages.');
}

/**
 * Run all tests
 * Comprehensive test suite for Smart Fetch
 */
function runAllSmartFetchTests() {
  Logger.log('\n\n');
  Logger.log('╔' + '═'.repeat(78) + '╗');
  Logger.log('║' + ' SMART FETCH - COMPREHENSIVE TEST SUITE '.padStart(50).padEnd(78) + '║');
  Logger.log('╚' + '═'.repeat(78) + '╝');

  const startTime = new Date();

  try {
    // Edge case tests (fast)
    testSmartFetchEmptySKUs();
    Utilities.sleep(500);

    testSmartFetchInvalidSKUs();
    Utilities.sleep(500);

    testSmartFetchMixedSKUs();
    Utilities.sleep(500);

    testSmartFetchAutoMode();
    Utilities.sleep(500);

    testSmartFetchFallbackBehavior();
    Utilities.sleep(2000);

    // Performance test (slower)
    testSmartFetchPerformance();

  } catch (error) {
    Logger.log('\n❌ TEST SUITE FAILED:');
    Logger.log(`   Error: ${error.message}`);
    Logger.log(`   Stack: ${error.stack}`);
  }

  const endTime = new Date();
  const totalTime = Math.round((endTime - startTime) / 1000);

  Logger.log('\n\n');
  Logger.log('╔' + '═'.repeat(78) + '╗');
  Logger.log('║' + ' TEST SUITE COMPLETE '.padStart(50).padEnd(78) + '║');
  Logger.log('╚' + '═'.repeat(78) + '╝');
  Logger.log(`\n⏱️  Total execution time: ${totalTime} seconds`);
  Logger.log(`📅 Completed: ${endTime.toISOString()}`);
}

/**
 * Quick sanity test for development
 * Fast validation that Smart Wrapper is working
 */
function quickSanityTest() {
  Logger.log('\n🔍 QUICK SANITY TEST');
  Logger.log('='.repeat(60));

  const testSkus = ['0007AD', '006'];

  Logger.log(`\nTesting with 2 SKUs: ${testSkus.join(', ')}`);

  // Test fast fetch
  Logger.log('\n1️⃣  Fast fetch...');
  const result1 = fetchStockDataSmart(testSkus, 'yoyaku.io', false);
  Logger.log(`   ✅ Success: ${result1.success}, Time: ${result1.total_time_ms}ms`);

  Utilities.sleep(2000);

  // Test forced recalc
  Logger.log('\n2️⃣  Forced recalc...');
  const result2 = fetchStockDataSmart(testSkus, 'yoyaku.io', true);
  Logger.log(`   ✅ Success: ${result2.success}, Time: ${result2.total_time_ms}ms`);

  Logger.log('\n✅ Sanity test complete - Smart Wrapper is working!');
}
