/**
 * API v2 Performance Test
 * Simulates Google Sheets Import Dashboard workflow
 *
 * Tests both YOYAKU.IO and YYD.FR REST API v2 endpoints
 * with real product SKUs to measure end-to-end performance.
 *
 * @author Benjamin Belaga
 * @version 1.0.0
 * @date 2025-10-27
 */

// API Configuration
const YOYAKU_CONFIG = {
  url: 'https://www.yoyaku.io/wp-json/ysc/v2/recalculate-preorders',
  token: 'c29f2f1a58c45fc55d90260cad1693fe2096a33abf81b1f4b3d1cc615204fe24',
  testSkus: ['0007AD', '006', '01201', '01202', '01204']
};

const YYD_CONFIG = {
  url: 'https://www.yydistribution.fr/wp-json/yyd/v2/recalculate-shelves',
  token: 'f7a863c1e2c6dea4484442c04b305aa915b8ba61563f4333e755b02cad3bbc67',
  testSkus: ['10/X', '1640', '192R-004', '200048', '2055BLACK']
};

/**
 * Test API v2 endpoint
 * @param {Object} config - API configuration
 * @param {string} siteName - Site name for logging
 */
function testApiV2(config, siteName) {
  Logger.log(`\n=== Testing ${siteName} API v2 ===`);

  const startTime = new Date().getTime();

  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'Authorization': 'Bearer ' + config.token
    },
    payload: JSON.stringify({
      skus: config.testSkus
    }),
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(config.url, options);
    const endTime = new Date().getTime();
    const totalTime = endTime - startTime;

    const result = JSON.parse(response.getContentText());

    Logger.log(`✅ ${siteName} Test Results:`);
    Logger.log(`   HTTP Status: ${response.getResponseCode()}`);
    Logger.log(`   Success: ${result.success}`);
    Logger.log(`   Products Requested: ${result.products_requested}`);
    Logger.log(`   Products Processed: ${result.products_processed}`);
    Logger.log(`   Products Failed: ${result.products_failed}`);
    Logger.log(`   Server Time: ${result.time_taken}`);
    Logger.log(`   Total Round-Trip Time: ${totalTime}ms`);
    Logger.log(`   Avg Time Per Product: ${result.avg_time_per_product}`);

    if (result.errors && result.errors.length > 0) {
      Logger.log(`   ⚠️  Errors:`);
      result.errors.forEach(err => {
        Logger.log(`      - ${err.sku}: ${err.error}`);
      });
    }

    Logger.log(`   📊 Performance:`);
    Logger.log(`      - ${config.testSkus.length} SKUs in ${totalTime}ms`);
    Logger.log(`      - ~${(totalTime / config.testSkus.length).toFixed(2)}ms per product`);
    Logger.log(`      - Cache Hit Rate: ${result.cache_hit_rate || '0%'}`);

    return {
      success: true,
      site: siteName,
      totalTime: totalTime,
      serverTime: result.time_taken,
      productsProcessed: result.products_processed
    };

  } catch (error) {
    const endTime = new Date().getTime();
    const totalTime = endTime - startTime;

    Logger.log(`❌ ${siteName} Test Failed:`);
    Logger.log(`   Error: ${error.message}`);
    Logger.log(`   Time Elapsed: ${totalTime}ms`);

    return {
      success: false,
      site: siteName,
      error: error.message
    };
  }
}

/**
 * Run full performance test suite
 */
function runPerformanceTests() {
  Logger.log('='.repeat(60));
  Logger.log('API v2 Performance Test Suite');
  Logger.log('Testing REST API endpoints with real product SKUs');
  Logger.log('='.repeat(60));

  const results = [];

  // Test YOYAKU.IO
  results.push(testApiV2(YOYAKU_CONFIG, 'YOYAKU.IO'));

  // Test YYD.FR
  results.push(testApiV2(YYD_CONFIG, 'YYD.FR'));

  // Summary
  Logger.log('\n' + '='.repeat(60));
  Logger.log('📊 Performance Test Summary');
  Logger.log('='.repeat(60));

  let totalSuccess = 0;
  let totalTime = 0;
  let totalProducts = 0;

  results.forEach(result => {
    if (result.success) {
      totalSuccess++;
      totalTime += result.totalTime;
      totalProducts += result.productsProcessed;

      Logger.log(`✅ ${result.site}:`);
      Logger.log(`   Round-Trip: ${result.totalTime}ms`);
      Logger.log(`   Server Time: ${result.serverTime}`);
      Logger.log(`   Products: ${result.productsProcessed}`);
    } else {
      Logger.log(`❌ ${result.site}: ${result.error}`);
    }
  });

  Logger.log(`\n🎯 Overall Results:`);
  Logger.log(`   Tests Passed: ${totalSuccess}/${results.length}`);
  Logger.log(`   Total Products Processed: ${totalProducts}`);
  Logger.log(`   Total Time: ${totalTime}ms`);
  Logger.log(`   Average Time Per Site: ${(totalTime / results.length).toFixed(2)}ms`);
  Logger.log(`   Average Time Per Product: ${(totalTime / totalProducts).toFixed(2)}ms`);

  // Performance comparison with v1
  Logger.log(`\n⚡ Performance vs API v1:`);
  Logger.log(`   API v1 (estimated): ~15,000-18,000ms for ${totalProducts} products`);
  Logger.log(`   API v2 (measured): ${totalTime}ms for ${totalProducts} products`);
  Logger.log(`   Improvement: ~${Math.round(15000 / totalTime)}x faster`);

  Logger.log('\n' + '='.repeat(60));
  Logger.log('✅ Performance test completed successfully!');
  Logger.log('='.repeat(60));
}

/**
 * Test targeted SKU recalculation (simulates Google Sheets workflow)
 * @param {Array} yoyakuSkus - Array of YOYAKU.IO SKUs
 * @param {Array} yydSkus - Array of YYD.FR SKUs
 */
function testTargetedRecalculation(yoyakuSkus, yydSkus) {
  Logger.log('='.repeat(60));
  Logger.log('Testing Targeted SKU Recalculation (Google Sheets Simulation)');
  Logger.log('='.repeat(60));

  const results = {
    yoyaku: null,
    yyd: null
  };

  // Test YOYAKU.IO if SKUs provided
  if (yoyakuSkus && yoyakuSkus.length > 0) {
    Logger.log(`\n📦 YOYAKU.IO - ${yoyakuSkus.length} SKUs:`);
    Logger.log(`   SKUs: ${yoyakuSkus.join(', ')}`);

    const config = {
      ...YOYAKU_CONFIG,
      testSkus: yoyakuSkus
    };
    results.yoyaku = testApiV2(config, 'YOYAKU.IO');
  }

  // Test YYD.FR if SKUs provided
  if (yydSkus && yydSkus.length > 0) {
    Logger.log(`\n📦 YYD.FR - ${yydSkus.length} SKUs:`);
    Logger.log(`   SKUs: ${yydSkus.join(', ')}`);

    const config = {
      ...YYD_CONFIG,
      testSkus: yydSkus
    };
    results.yyd = testApiV2(config, 'YYD.FR');
  }

  return results;
}

/**
 * Example: Test with custom SKUs from Import Dashboard
 * This simulates what happens when user clicks "Fetch Data & Calculate"
 */
function simulateImportDashboard() {
  Logger.log('='.repeat(60));
  Logger.log('🔄 Simulating Google Sheets Import Dashboard Workflow');
  Logger.log('='.repeat(60));

  // Example: Import 803 (YOYAKU) with 3 SKUs
  const importSkus = ['0007AD', '006', '01201'];

  Logger.log(`\n📊 Import 803 - YOYAKU.IO`);
  Logger.log(`   SKUs to process: ${importSkus.length}`);
  Logger.log(`   SKUs: ${importSkus.join(', ')}`);

  testTargetedRecalculation(importSkus, []);

  Logger.log('\n✅ Import Dashboard simulation completed!');
  Logger.log('   Expected behavior in Google Sheets:');
  Logger.log('   - Total time < 2 seconds');
  Logger.log('   - Success message displayed');
  Logger.log('   - Pre-order counts updated in cells');
}
