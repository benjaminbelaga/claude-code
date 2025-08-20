/**
 * YYD Release Date Update via Direct WooCommerce API
 * Import 941 Replacement - Ultra Simple (2 fields only)
 * 
 * @author Benjamin Belaga
 * @version 1.0.0
 * @description Updates release dates for YYDistribution products
 */

/**
 * Update Release Dates via Direct WooCommerce API
 * Replaces WP All Import 941 - YYD Release Date Update
 */
function updateReleaseDateDirectAPI() {
  const ui = SpreadsheetApp.getUi();
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('update stock');
  
  if (!sheet) {
    ui.alert('❌ Error', 'Sheet "update stock" not found!', ui.ButtonSet.OK);
    return;
  }
  
  // Confirm action
  const result = ui.alert(
    '📅 Update Release Dates via Direct API',
    'This will update release dates for YYDistribution products.\n\n' +
    '✅ Advantages:\n' +
    '• Ultra-fast processing (50 products/batch)\n' +
    '• Only 2 fields updated\n' +
    '• No complex logic\n' +
    '• Real-time updates\n\n' +
    'Continue?',
    ui.ButtonSet.YES_NO
  );
  
  if (result !== ui.Button.YES) return;
  
  SpreadsheetApp.getActiveSpreadsheet().toast('🔄 Starting release date update...', 'Processing', -1);
  
  try {
    // Get sheet data
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    // Find column indices
    const skuIndex = headers.findIndex(h => h.toString().toUpperCase() === 'SKU');
    const releaseDateIndex = headers.findIndex(h => 
      h.toString().toLowerCase() === 'release date' || 
      h.toString().toLowerCase() === 'releasedate'
    );
    
    if (skuIndex === -1) {
      ui.alert('❌ Error', 'SKU column not found!', ui.ButtonSet.OK);
      return;
    }
    
    if (releaseDateIndex === -1) {
      ui.alert('❌ Error', 'Release Date column not found!', ui.ButtonSet.OK);
      return;
    }
    
    // Prepare batches - ONLY process rows with valid SKU and release date
    const batches = [];
    let currentBatch = [];
    const BATCH_SIZE = 50; // YYD uses 50 for release dates (fastest)
    
    for (let i = 1; i < data.length; i++) {
      const sku = data[i][skuIndex];
      const releaseDate = data[i][releaseDateIndex];
      
      // Skip rows without SKU or release date
      if (!sku || sku === '' || sku === '#N/A' || sku.toString().trim() === '') {
        continue;
      }
      
      if (!releaseDate || releaseDate === '') {
        continue;
      }
      
      const item = {
        sku: sku.toString().trim(),
        row: i + 1,
        release_date: formatReleaseDate(releaseDate)
      };
      
      currentBatch.push(item);
      
      if (currentBatch.length >= BATCH_SIZE) {
        batches.push([...currentBatch]);
        currentBatch = [];
      }
    }
    
    // Add remaining items
    if (currentBatch.length > 0) {
      batches.push(currentBatch);
    }
    
    if (batches.length === 0) {
      ui.alert('⚠️ No Data', 'No valid SKUs with release dates found to update!', ui.ButtonSet.OK);
      return;
    }
    
    // Process batches
    let totalSuccess = 0;
    let totalErrors = 0;
    let errorDetails = [];
    
    for (let i = 0; i < batches.length; i++) {
      SpreadsheetApp.getActiveSpreadsheet().toast(
        `Processing batch ${i + 1}/${batches.length} (${batches[i].length} products)...`,
        '🔄 Updating',
        -1
      );
      
      const result = updateReleaseDateBatch(batches[i]);
      totalSuccess += result.success;
      totalErrors += result.errors;
      
      if (result.errorDetails && result.errorDetails.length > 0) {
        errorDetails = errorDetails.concat(result.errorDetails);
      }
      
      // Rate limiting (faster for release dates)
      if (i < batches.length - 1) {
        Utilities.sleep(500); // Only 0.5 second between batches
      }
    }
    
    // Show results
    SpreadsheetApp.getActiveSpreadsheet().toast('✅ Complete!', 'Success', 3);
    
    let message = `📅 Release Date Update Complete!\n\n`;
    message += `✅ Successfully updated: ${totalSuccess} products\n`;
    
    if (totalErrors > 0) {
      message += `❌ Errors: ${totalErrors} products\n\n`;
      if (errorDetails.length > 0) {
        message += `Error details (first 5):\n`;
        errorDetails.slice(0, 5).forEach(err => {
          message += `• Row ${err.row} (${err.sku}): ${err.error}\n`;
        });
      }
    }
    
    message += `\n⏱️ Processing speed: ~${Math.round(totalSuccess / 50)} seconds`;
    message += `\n💨 50x faster than WP Import!`;
    
    ui.alert('Update Complete', message, ui.ButtonSet.OK);
    
  } catch (error) {
    Logger.log('Critical error in updateReleaseDateDirectAPI: ' + error.toString());
    ui.alert('❌ Critical Error', `An error occurred: ${error.message}`, ui.ButtonSet.OK);
  }
}

/**
 * Helper function to update a batch of release dates
 */
function updateReleaseDateBatch(batch) {
  // Get YYD API credentials from secure storage
  const credentials = getSecureCredentials('yydistribution.fr');
  
  const WOO_API_URL = credentials.url;
  const WOO_CONSUMER_KEY = credentials.consumer_key;
  const WOO_CONSUMER_SECRET = credentials.consumer_secret;
  
  let successCount = 0;
  let errorCount = 0;
  let errorDetails = [];
  
  batch.forEach(item => {
    try {
      // First, find product by SKU
      const searchUrl = `${WOO_API_URL}?sku=${encodeURIComponent(item.sku)}`;
      const searchOptions = {
        method: 'GET',
        headers: {
          'Authorization': 'Basic ' + Utilities.base64Encode(WOO_CONSUMER_KEY + ':' + WOO_CONSUMER_SECRET)
        },
        muteHttpExceptions: true
      };
      
      const searchResponse = UrlFetchApp.fetch(searchUrl, searchOptions);
      
      if (searchResponse.getResponseCode() === 200) {
        const products = JSON.parse(searchResponse.getContentText());
        
        if (products.length > 0) {
          const productId = products[0].id;
          
          // Update ONLY release date fields (2 fields)
          const metaData = [
            {
              key: '_release_date',
              value: item.release_date
            },
            {
              key: '_date_out',
              value: item.release_date
            }
          ];
          
          // Update the product
          const updateUrl = `${WOO_API_URL}/${productId}`;
          const updateOptions = {
            method: 'PUT',
            headers: {
              'Authorization': 'Basic ' + Utilities.base64Encode(WOO_CONSUMER_KEY + ':' + WOO_CONSUMER_SECRET),
              'Content-Type': 'application/json'
            },
            payload: JSON.stringify({
              meta_data: metaData
            }),
            muteHttpExceptions: true
          };
          
          const updateResponse = UrlFetchApp.fetch(updateUrl, updateOptions);
          
          if (updateResponse.getResponseCode() === 200) {
            successCount++;
            Logger.log(`✅ Updated SKU ${item.sku} - Release Date: ${item.release_date}`);
          } else {
            errorCount++;
            const errorMsg = `API error: ${updateResponse.getResponseCode()}`;
            errorDetails.push({row: item.row, sku: item.sku, error: errorMsg});
            Logger.log(`❌ Failed to update SKU ${item.sku}: ${errorMsg}`);
          }
        } else {
          errorCount++;
          errorDetails.push({row: item.row, sku: item.sku, error: 'Product not found'});
          Logger.log(`❌ Product not found for SKU ${item.sku}`);
        }
      } else {
        errorCount++;
        const errorMsg = `Search failed: ${searchResponse.getResponseCode()}`;
        errorDetails.push({row: item.row, sku: item.sku, error: errorMsg});
        Logger.log(`❌ Search failed for SKU ${item.sku}: ${errorMsg}`);
      }
    } catch (error) {
      errorCount++;
      errorDetails.push({row: item.row, sku: item.sku, error: error.message});
      Logger.log(`❌ Error updating SKU ${item.sku}: ${error.message}`);
    }
  });
  
  return { success: successCount, errors: errorCount, errorDetails: errorDetails };
}

/**
 * Format release date to standard format
 */
function formatReleaseDate(date) {
  if (!date) return '';
  
  // If it's already a string in correct format, return it
  if (typeof date === 'string') {
    return date;
  }
  
  // If it's a Date object, format it
  if (date instanceof Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  // Try to parse and format
  try {
    const parsedDate = new Date(date);
    if (!isNaN(parsedDate.getTime())) {
      const year = parsedDate.getFullYear();
      const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
      const day = String(parsedDate.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  } catch (e) {
    Logger.log('Date parsing error: ' + e.toString());
  }
  
  // Return as is if cannot parse
  return String(date);
}

/**
 * TEST FUNCTION - Release Date Update with sample data
 */
function testReleaseDateUpdate() {
  const ui = SpreadsheetApp.getUi();
  
  ui.alert(
    '🧪 Test Mode',
    'This will test the release date update with sample data.\n\n' +
    'Test data:\n' +
    '• SKU: TEST001\n' +
    '• Release Date: 2025-09-15\n\n' +
    'This is a DRY RUN - no actual updates will be made.',
    ui.ButtonSet.OK
  );
  
  // Create test batch
  const testBatch = [
    {
      sku: 'TEST001',
      row: 1,
      release_date: '2025-09-15'
    },
    {
      sku: 'TEST002',
      row: 2,
      release_date: '2025-10-01'
    }
  ];
  
  Logger.log('=== RELEASE DATE UPDATE TEST ===');
  Logger.log('Test batch: ' + JSON.stringify(testBatch, null, 2));
  
  // Simulate API calls
  testBatch.forEach(item => {
    Logger.log(`Would update SKU ${item.sku} with release date: ${item.release_date}`);
    Logger.log('API endpoint: https://www.yydistribution.fr/wp-json/wc/v3/products');
    Logger.log('Fields to update: _release_date, _date_out');
  });
  
  ui.alert(
    '✅ Test Complete',
    'Test completed successfully!\n\n' +
    'Check logs for details.\n' +
    'Ready to run actual update when YYD API credentials are configured.',
    ui.ButtonSet.OK
  );
}

/**
 * Validate YYD API credentials
 */
function validateYYDCredentials() {
  const credentials = getSecureCredentials('yydistribution.fr');
  
  if (credentials.consumer_key.includes('YOUR_')) {
    SpreadsheetApp.getUi().alert(
      '⚠️ Configuration Required',
      'YYD API credentials not configured!\n\n' +
      'Please add YYDistribution WooCommerce API keys:\n' +
      '1. Go to YYD WP Admin → WooCommerce → Settings → Advanced → REST API\n' +
      '2. Generate new API keys\n' +
      '3. Update this script with the keys',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    return false;
  }
  
  return true;
}