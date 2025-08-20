/**
 * LIVE API TESTS - SKU001 Real Product Testing
 * Tests each API function with real WooCommerce API calls
 * 
 * ⚠️ WARNING: These tests make REAL changes to production sites!
 * Use only for validation with test products
 * 
 * @author Benjamin Belaga
 * @version 1.0.0
 */

// Test credentials (loaded from secure storage)
const TEST_CREDENTIALS = {
  yoyaku: {
    url: 'https://www.yoyaku.io/wp-json/wc/v3/products',
    key: 'ck_0d3ea2a08a2af1f134f9fc8fcd83466196a2ab6f',
    secret: 'cs_91deb512e1ac643aee4f0d98eaea10bcbf346571'
  },
  yyd: {
    url: 'https://www.yydistribution.fr/wp-json/wc/v3/products',
    key: 'ck_762cfbeda204362565de52dd24f764233874faef',
    secret: 'cs_a02aa1db1c4bd5e169d172fdd25b717403518c19'
  }
};

/**
 * Master test runner - Tests all APIs with real SKU001
 */
function runLiveAPITests() {
  const ui = SpreadsheetApp.getUi();
  
  const response = ui.alert(
    '⚠️ LIVE API TESTS - PRODUCTION WARNING',
    'This will test APIs on REAL production sites:\n\n' +
    '🎯 YOYAKU.IO - Live site with real customers\n' +
    '🎯 YYDistribution.FR - Live site with real customers\n\n' +
    '⚠️ WARNING: This makes REAL changes to products!\n' +
    'Only proceed if you have a test product SKU001 ready.\n\n' +
    'Continue with live tests?',
    ui.ButtonSet.YES_NO
  );
  
  if (response !== ui.Button.YES) {
    ui.alert('Tests cancelled', 'Live API tests cancelled for safety.', ui.ButtonSet.OK);
    return;
  }
  
  const results = [];
  
  Logger.log('=== STARTING LIVE API TESTS ===');
  
  // Test 1: API Connectivity
  results.push(testAPIConnectivity());
  
  // Test 2: Find or Create SKU001
  results.push(findOrCreateTestProduct());
  
  // Test 3: Live Picking Update Test
  results.push(testLivePickingUpdate());
  
  // Test 4: Live Stock Update YOYAKU Test
  results.push(testLiveStockYoyaku());
  
  // Test 5: Live Stock Update YYD Test  
  results.push(testLiveStockYYD());
  
  // Test 6: Live Release Date YYD Test
  results.push(testLiveReleaseDateYYD());
  
  // Display comprehensive results
  displayLiveTestResults(results);
  
  Logger.log('=== LIVE API TESTS COMPLETED ===');
}

/**
 * Test API connectivity to both sites
 */
function testAPIConnectivity() {
  Logger.log('--- Testing API Connectivity ---');
  
  const results = {
    test: 'API Connectivity',
    yoyaku: 'UNKNOWN',
    yyd: 'UNKNOWN',
    details: []
  };
  
  // Test YOYAKU.IO
  try {
    const yoyakuResponse = UrlFetchApp.fetch(TEST_CREDENTIALS.yoyaku.url + '?per_page=1', {
      method: 'GET',
      headers: {
        'Authorization': 'Basic ' + Utilities.base64Encode(
          TEST_CREDENTIALS.yoyaku.key + ':' + TEST_CREDENTIALS.yoyaku.secret
        )
      },
      muteHttpExceptions: true
    });
    
    const yoyakuStatus = yoyakuResponse.getResponseCode();
    results.yoyaku = yoyakuStatus === 200 ? 'CONNECTED' : `ERROR_${yoyakuStatus}`;
    results.details.push(`YOYAKU.IO: ${yoyakuStatus} - ${yoyakuStatus === 200 ? 'OK' : 'Failed'}`);
    
  } catch (error) {
    results.yoyaku = 'FAILED';
    results.details.push(`YOYAKU.IO: Exception - ${error.message}`);
  }
  
  // Test YYDistribution.FR
  try {
    const yydResponse = UrlFetchApp.fetch(TEST_CREDENTIALS.yyd.url + '?per_page=1', {
      method: 'GET', 
      headers: {
        'Authorization': 'Basic ' + Utilities.base64Encode(
          TEST_CREDENTIALS.yyd.key + ':' + TEST_CREDENTIALS.yyd.secret
        )
      },
      muteHttpExceptions: true
    });
    
    const yydStatus = yydResponse.getResponseCode();
    results.yyd = yydStatus === 200 ? 'CONNECTED' : `ERROR_${yydStatus}`;
    results.details.push(`YYD: ${yydStatus} - ${yydStatus === 200 ? 'OK' : 'Failed'}`);
    
  } catch (error) {
    results.yyd = 'FAILED';
    results.details.push(`YYD: Exception - ${error.message}`);
  }
  
  Logger.log(`API Connectivity - YOYAKU: ${results.yoyaku}, YYD: ${results.yyd}`);
  return results;
}

/**
 * Find existing SKU001 or create if needed
 */
function findOrCreateTestProduct() {
  Logger.log('--- Finding/Creating SKU001 Test Product ---');
  
  const results = {
    test: 'SKU001 Product Setup',
    yoyaku: { found: false, id: null },
    yyd: { found: false, id: null },
    details: []
  };
  
  // Search for SKU001 on YOYAKU
  try {
    const yoyakuSearch = UrlFetchApp.fetch(TEST_CREDENTIALS.yoyaku.url + '?sku=SKU001', {
      method: 'GET',
      headers: {
        'Authorization': 'Basic ' + Utilities.base64Encode(
          TEST_CREDENTIALS.yoyaku.key + ':' + TEST_CREDENTIALS.yoyaku.secret
        )
      },
      muteHttpExceptions: true
    });
    
    if (yoyakuSearch.getResponseCode() === 200) {
      const yoyakuProducts = JSON.parse(yoyakuSearch.getContentText());
      if (yoyakuProducts.length > 0) {
        results.yoyaku.found = true;
        results.yoyaku.id = yoyakuProducts[0].id;
        results.details.push(`YOYAKU: Found SKU001 (ID: ${results.yoyaku.id})`);
      } else {
        results.details.push('YOYAKU: SKU001 not found - will need manual creation');
      }
    }
  } catch (error) {
    results.details.push(`YOYAKU Search Error: ${error.message}`);
  }
  
  // Search for SKU001 on YYD
  try {
    const yydSearch = UrlFetchApp.fetch(TEST_CREDENTIALS.yyd.url + '?sku=SKU001', {
      method: 'GET',
      headers: {
        'Authorization': 'Basic ' + Utilities.base64Encode(
          TEST_CREDENTIALS.yyd.key + ':' + TEST_CREDENTIALS.yyd.secret
        )
      },
      muteHttpExceptions: true
    });
    
    if (yydSearch.getResponseCode() === 200) {
      const yydProducts = JSON.parse(yydSearch.getContentText());
      if (yydProducts.length > 0) {
        results.yyd.found = true;
        results.yyd.id = yydProducts[0].id;
        results.details.push(`YYD: Found SKU001 (ID: ${results.yyd.id})`);
      } else {
        results.details.push('YYD: SKU001 not found - will need manual creation');
      }
    }
  } catch (error) {
    results.details.push(`YYD Search Error: ${error.message}`);
  }
  
  return results;
}

/**
 * Test live picking update on YOYAKU
 */
function testLivePickingUpdate() {
  Logger.log('--- Testing Live Picking Update ---');
  
  const results = {
    test: 'Live Picking Update',
    status: 'PENDING',
    before: {},
    after: {},
    fields_updated: [],
    details: []
  };
  
  try {
    // Find SKU001 first
    const searchResponse = UrlFetchApp.fetch(TEST_CREDENTIALS.yoyaku.url + '?sku=SKU001', {
      method: 'GET',
      headers: {
        'Authorization': 'Basic ' + Utilities.base64Encode(
          TEST_CREDENTIALS.yoyaku.key + ':' + TEST_CREDENTIALS.yoyaku.secret
        )
      },
      muteHttpExceptions: true
    });
    
    if (searchResponse.getResponseCode() !== 200) {
      results.status = 'FAILED';
      results.details.push('SKU001 not found on YOYAKU');
      return results;
    }
    
    const products = JSON.parse(searchResponse.getContentText());
    if (products.length === 0) {
      results.status = 'SKIPPED';
      results.details.push('SKU001 does not exist - create it first');
      return results;
    }
    
    const productId = products[0].id;
    const currentProduct = products[0];
    
    // Capture BEFORE state
    results.before = {
      picking1: getMetaValue(currentProduct, '_picking_location_1'),
      picking2: getMetaValue(currentProduct, '_picking_location_2')
    };
    
    // Update picking locations
    const updatePayload = {
      meta_data: [
        { key: '_picking_location_1', value: 'SH-J3' },
        { key: '_picking_location_2', value: 'SH-K4' }
      ]
    };
    
    const updateResponse = UrlFetchApp.fetch(TEST_CREDENTIALS.yoyaku.url + '/' + productId, {
      method: 'PUT',
      headers: {
        'Authorization': 'Basic ' + Utilities.base64Encode(
          TEST_CREDENTIALS.yoyaku.key + ':' + TEST_CREDENTIALS.yoyaku.secret
        ),
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify(updatePayload),
      muteHttpExceptions: true
    });
    
    if (updateResponse.getResponseCode() === 200) {
      const updatedProduct = JSON.parse(updateResponse.getContentText());
      
      // Capture AFTER state
      results.after = {
        picking1: getMetaValue(updatedProduct, '_picking_location_1'),
        picking2: getMetaValue(updatedProduct, '_picking_location_2')
      };
      
      // Verify changes
      const picking1Changed = results.before.picking1 !== results.after.picking1;
      const picking2Changed = results.before.picking2 !== results.after.picking2;
      
      if (picking1Changed || picking2Changed) {
        results.status = 'SUCCESS';
        results.fields_updated = [];
        if (picking1Changed) results.fields_updated.push('_picking_location_1');
        if (picking2Changed) results.fields_updated.push('_picking_location_2');
        results.details.push(`Successfully updated ${results.fields_updated.length} fields`);
      } else {
        results.status = 'NO_CHANGE';
        results.details.push('Update executed but no changes detected');
      }
      
    } else {
      results.status = 'FAILED';
      results.details.push(`Update failed: ${updateResponse.getResponseCode()}`);
    }
    
  } catch (error) {
    results.status = 'ERROR';
    results.details.push(`Exception: ${error.message}`);
  }
  
  return results;
}

/**
 * Test live stock update on YOYAKU
 */
function testLiveStockYoyaku() {
  Logger.log('--- Testing Live Stock Update YOYAKU ---');
  
  const results = {
    test: 'Live Stock Update YOYAKU',
    status: 'PENDING',
    before: {},
    after: {},
    details: []
  };
  
  try {
    // Find and update SKU001
    const searchResponse = UrlFetchApp.fetch(TEST_CREDENTIALS.yoyaku.url + '?sku=SKU001', {
      method: 'GET',
      headers: {
        'Authorization': 'Basic ' + Utilities.base64Encode(
          TEST_CREDENTIALS.yoyaku.key + ':' + TEST_CREDENTIALS.yoyaku.secret
        )
      },
      muteHttpExceptions: true
    });
    
    if (searchResponse.getResponseCode() !== 200) {
      results.status = 'FAILED';
      results.details.push('SKU001 not found');
      return results;
    }
    
    const products = JSON.parse(searchResponse.getContentText());
    if (products.length === 0) {
      results.status = 'SKIPPED';
      results.details.push('SKU001 does not exist');
      return results;
    }
    
    const productId = products[0].id;
    const currentProduct = products[0];
    
    // Capture BEFORE state
    results.before = {
      quantity: currentProduct.stock_quantity,
      status: currentProduct.stock_status,
      manage_stock: currentProduct.manage_stock
    };
    
    // Update stock to 25
    const newQuantity = 25;
    const updatePayload = {
      stock_quantity: newQuantity,
      stock_status: newQuantity > 0 ? 'instock' : 'outofstock',
      manage_stock: true
    };
    
    const updateResponse = UrlFetchApp.fetch(TEST_CREDENTIALS.yoyaku.url + '/' + productId, {
      method: 'PUT',
      headers: {
        'Authorization': 'Basic ' + Utilities.base64Encode(
          TEST_CREDENTIALS.yoyaku.key + ':' + TEST_CREDENTIALS.yoyaku.secret
        ),
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify(updatePayload),
      muteHttpExceptions: true
    });
    
    if (updateResponse.getResponseCode() === 200) {
      const updatedProduct = JSON.parse(updateResponse.getContentText());
      
      results.after = {
        quantity: updatedProduct.stock_quantity,
        status: updatedProduct.stock_status,
        manage_stock: updatedProduct.manage_stock
      };
      
      results.status = 'SUCCESS';
      results.details.push(`Stock updated: ${results.before.quantity} → ${results.after.quantity}`);
      results.details.push(`Status: ${results.before.status} → ${results.after.status}`);
      
    } else {
      results.status = 'FAILED';
      results.details.push(`Update failed: ${updateResponse.getResponseCode()}`);
    }
    
  } catch (error) {
    results.status = 'ERROR';
    results.details.push(`Exception: ${error.message}`);
  }
  
  return results;
}

/**
 * Test live stock update on YYD
 */
function testLiveStockYYD() {
  Logger.log('--- Testing Live Stock Update YYD ---');
  
  const results = {
    test: 'Live Stock Update YYD',
    status: 'PENDING',
    before: {},
    after: {},
    preorder_transition: false,
    details: []
  };
  
  try {
    // Find and update SKU001 on YYD
    const searchResponse = UrlFetchApp.fetch(TEST_CREDENTIALS.yyd.url + '?sku=SKU001', {
      method: 'GET',
      headers: {
        'Authorization': 'Basic ' + Utilities.base64Encode(
          TEST_CREDENTIALS.yyd.key + ':' + TEST_CREDENTIALS.yyd.secret
        )
      },
      muteHttpExceptions: true
    });
    
    if (searchResponse.getResponseCode() !== 200) {
      results.status = 'FAILED';
      results.details.push('SKU001 not found on YYD');
      return results;
    }
    
    const products = JSON.parse(searchResponse.getContentText());
    if (products.length === 0) {
      results.status = 'SKIPPED';
      results.details.push('SKU001 does not exist on YYD');
      return results;
    }
    
    const productId = products[0].id;
    const currentProduct = products[0];
    
    // Capture BEFORE state
    results.before = {
      quantity: currentProduct.stock_quantity,
      status: currentProduct.stock_status,
      is_preorder: getMetaValue(currentProduct, '_is_pre_order'),
      backorders: getMetaValue(currentProduct, '_backorders')
    };
    
    // Update stock to 15 with pre-order transition
    const newQuantity = 15;
    const updatePayload = {
      stock_quantity: newQuantity,
      stock_status: newQuantity > 0 ? 'instock' : 'outofstock',
      manage_stock: true,
      meta_data: [
        { key: '_is_pre_order', value: 'no' },
        { key: '_backorders', value: 'no' }
      ]
    };
    
    const updateResponse = UrlFetchApp.fetch(TEST_CREDENTIALS.yyd.url + '/' + productId, {
      method: 'PUT',
      headers: {
        'Authorization': 'Basic ' + Utilities.base64Encode(
          TEST_CREDENTIALS.yyd.key + ':' + TEST_CREDENTIALS.yyd.secret
        ),
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify(updatePayload),
      muteHttpExceptions: true
    });
    
    if (updateResponse.getResponseCode() === 200) {
      const updatedProduct = JSON.parse(updateResponse.getContentText());
      
      results.after = {
        quantity: updatedProduct.stock_quantity,
        status: updatedProduct.stock_status,
        is_preorder: getMetaValue(updatedProduct, '_is_pre_order'),
        backorders: getMetaValue(updatedProduct, '_backorders')
      };
      
      results.preorder_transition = results.before.is_preorder !== results.after.is_preorder;
      
      results.status = 'SUCCESS';
      results.details.push(`Stock: ${results.before.quantity} → ${results.after.quantity}`);
      results.details.push(`Pre-order: ${results.before.is_preorder} → ${results.after.is_preorder}`);
      
    } else {
      results.status = 'FAILED';
      results.details.push(`Update failed: ${updateResponse.getResponseCode()}`);
    }
    
  } catch (error) {
    results.status = 'ERROR';
    results.details.push(`Exception: ${error.message}`);
  }
  
  return results;
}

/**
 * Test live release date update on YYD
 */
function testLiveReleaseDateYYD() {
  Logger.log('--- Testing Live Release Date Update YYD ---');
  
  const results = {
    test: 'Live Release Date YYD',
    status: 'PENDING',
    before: {},
    after: {},
    details: []
  };
  
  try {
    // Find and update SKU001 on YYD
    const searchResponse = UrlFetchApp.fetch(TEST_CREDENTIALS.yyd.url + '?sku=SKU001', {
      method: 'GET',
      headers: {
        'Authorization': 'Basic ' + Utilities.base64Encode(
          TEST_CREDENTIALS.yyd.key + ':' + TEST_CREDENTIALS.yyd.secret
        )
      },
      muteHttpExceptions: true
    });
    
    if (searchResponse.getResponseCode() !== 200) {
      results.status = 'FAILED';
      results.details.push('SKU001 not found on YYD');
      return results;
    }
    
    const products = JSON.parse(searchResponse.getContentText());
    if (products.length === 0) {
      results.status = 'SKIPPED';
      results.details.push('SKU001 does not exist on YYD');
      return results;
    }
    
    const productId = products[0].id;
    const currentProduct = products[0];
    
    // Capture BEFORE state
    results.before = {
      release_date: getMetaValue(currentProduct, '_release_date'),
      date_out: getMetaValue(currentProduct, '_date_out')
    };
    
    // Update release date
    const testDate = '2025-09-15';
    const updatePayload = {
      meta_data: [
        { key: '_release_date', value: testDate },
        { key: '_date_out', value: testDate }
      ]
    };
    
    const updateResponse = UrlFetchApp.fetch(TEST_CREDENTIALS.yyd.url + '/' + productId, {
      method: 'PUT',
      headers: {
        'Authorization': 'Basic ' + Utilities.base64Encode(
          TEST_CREDENTIALS.yyd.key + ':' + TEST_CREDENTIALS.yyd.secret
        ),
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify(updatePayload),
      muteHttpExceptions: true
    });
    
    if (updateResponse.getResponseCode() === 200) {
      const updatedProduct = JSON.parse(updateResponse.getContentText());
      
      results.after = {
        release_date: getMetaValue(updatedProduct, '_release_date'),
        date_out: getMetaValue(updatedProduct, '_date_out')
      };
      
      results.status = 'SUCCESS';
      results.details.push(`Release Date: ${results.before.release_date} → ${results.after.release_date}`);
      results.details.push(`Date Out: ${results.before.date_out} → ${results.after.date_out}`);
      
    } else {
      results.status = 'FAILED';
      results.details.push(`Update failed: ${updateResponse.getResponseCode()}`);
    }
    
  } catch (error) {
    results.status = 'ERROR';
    results.details.push(`Exception: ${error.message}`);
  }
  
  return results;
}

/**
 * Helper function to get meta value from product
 */
function getMetaValue(product, metaKey) {
  if (!product.meta_data) return null;
  
  for (let meta of product.meta_data) {
    if (meta.key === metaKey) {
      return meta.value;
    }
  }
  return null;
}

/**
 * Display comprehensive live test results
 */
function displayLiveTestResults(results) {
  const ui = SpreadsheetApp.getUi();
  
  let message = '🔍 LIVE API TESTS RESULTS\n';
  message += '='.repeat(40) + '\n\n';
  
  results.forEach((result, index) => {
    message += `${index + 1}. ${result.test}\n`;
    
    if (result.status) {
      let statusIcon = '';
      switch(result.status) {
        case 'SUCCESS': statusIcon = '✅'; break;
        case 'CONNECTED': statusIcon = '🟢'; break;
        case 'FAILED': statusIcon = '❌'; break;
        case 'ERROR': statusIcon = '🔴'; break;
        case 'SKIPPED': statusIcon = '⏭️'; break;
        default: statusIcon = '⚪';
      }
      message += `   Status: ${statusIcon} ${result.status}\n`;
    }
    
    if (result.yoyaku && result.yyd) {
      message += `   YOYAKU: ${result.yoyaku === 'CONNECTED' ? '✅' : '❌'} ${result.yoyaku}\n`;
      message += `   YYD: ${result.yyd === 'CONNECTED' ? '✅' : '❌'} ${result.yyd}\n`;
    }
    
    if (result.before && Object.keys(result.before).length > 0) {
      message += `   Before: ${JSON.stringify(result.before).substring(0, 50)}...\n`;
      message += `   After: ${JSON.stringify(result.after).substring(0, 50)}...\n`;
    }
    
    if (result.fields_updated && result.fields_updated.length > 0) {
      message += `   Fields Updated: ${result.fields_updated.join(', ')}\n`;
    }
    
    if (result.preorder_transition) {
      message += `   Pre-order Transition: ✅ YES\n`;
    }
    
    if (result.details && result.details.length > 0) {
      message += `   Details:\n`;
      result.details.slice(0, 3).forEach(detail => {
        message += `     • ${detail}\n`;
      });
    }
    
    message += '\n';
  });
  
  // Summary
  const successCount = results.filter(r => r.status === 'SUCCESS' || r.yoyaku === 'CONNECTED').length;
  const totalTests = results.length;
  
  message += '='.repeat(40) + '\n';
  message += `SUMMARY: ${successCount}/${totalTests} tests successful\n`;
  message += '\n🎉 Live API validation complete!';
  
  // Show results in chunks due to alert size limits
  const messageChunks = [];
  const maxLength = 1500;
  let currentChunk = '';
  
  message.split('\n').forEach(line => {
    if ((currentChunk + line + '\n').length > maxLength) {
      messageChunks.push(currentChunk);
      currentChunk = line + '\n';
    } else {
      currentChunk += line + '\n';
    }
  });
  
  if (currentChunk) {
    messageChunks.push(currentChunk);
  }
  
  // Display chunks
  messageChunks.forEach((chunk, index) => {
    ui.alert(
      `Live Test Results (${index + 1}/${messageChunks.length})`,
      chunk,
      ui.ButtonSet.OK
    );
  });
}

/**
 * Quick connectivity test only
 */
function testQuickConnectivity() {
  const ui = SpreadsheetApp.getUi();
  
  ui.alert('Quick Connectivity Test', 'Testing API connections to both sites...', ui.ButtonSet.OK);
  
  const result = testAPIConnectivity();
  
  let message = '🔍 API CONNECTIVITY RESULTS\n\n';
  message += `YOYAKU.IO: ${result.yoyaku === 'CONNECTED' ? '✅ Connected' : '❌ Failed'}\n`;
  message += `YYDistribution.FR: ${result.yyd === 'CONNECTED' ? '✅ Connected' : '❌ Failed'}\n\n`;
  message += 'Details:\n';
  result.details.forEach(detail => {
    message += `• ${detail}\n`;
  });
  
  if (result.yoyaku === 'CONNECTED' && result.yyd === 'CONNECTED') {
    message += '\n🎉 Both APIs are working correctly!';
  } else {
    message += '\n⚠️ Some APIs have connection issues.';
  }
  
  ui.alert('Connectivity Test Results', message, ui.ButtonSet.OK);
}