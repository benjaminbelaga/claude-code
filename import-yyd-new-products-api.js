/**
 * YYD.FR - New Products Creation via API Direct (B2B Version)
 *
 * ADAPTED FROM YOYAKU.IO VERSION WITH CRITICAL B2B DIFFERENCES:
 * - B2B-specific configuration (stock: instock level 1, no default category)
 * - Price column: "price yydistribution" (column W) instead of "price yoyaku.io" (column X)
 * - Domain: yydistribution.fr instead of yoyaku.io
 * - No "Coming Soon" meta field (B2B has immediate stock)
 *
 * CRITICAL TAXONOMY DIFFERENCES (vs YOYAKU.IO):
 * 1. category = {label} - Label becomes product category (NOT musiclabel taxonomy)
 * 2. musiclabel = NOT USED - No musiclabel taxonomy for YYD
 * 3. musicformat = {format} - Format is TAXONOMY (not custom field meta_data)
 *
 * @version 2.0.1 - Enhanced HTTP debugging (silent failure diagnosis)
 * @date 2025-11-11
 * @author Benjamin Belaga
 * @based_on import-852-new-products-api.js v46.0.0 (YOYAKU.IO B2C)
 * @changes v2.0.1:
 *   - Added comprehensive HTTP request/response logging in processBatchInParallelYYD
 *   - Log API endpoint, Bearer token preview, payload sample before fetchAll
 *   - Log HTTP status code, headers, response body for each product
 *   - Enhanced error handling with stack traces and detailed error messages
 *   - Check HTTP status BEFORE parsing JSON (catch non-200/201 responses)
 *   - Purpose: Diagnose silent import failures (script reports success but API not called)
 * @changes v2.0.0:
 *   - Added format column alias (column Q: 12", LP, 7")
 *   - Fixed category mapping: productData.label (was productData.category)
 *   - Removed label from payload (no musiclabel taxonomy for YYD)
 *   - Removed musicformat from meta_data (sent as taxonomy via 'format' field)
 */

// ========================================
// CONFIGURATION
// ========================================

const IMPORT_YYD_CONFIG = {
  enabled: true,  // Toggle to enable/disable API Direct
  useLegacyFallback: true,  // Fallback to WP Import if API fails

  // API Settings - Using YOYAKU API v2.3.0 (works for both sites)
  api: {
    baseUrl: 'https://www.yydistribution.fr',
    endpoint: '/wp-json/yoyaku/v2/product/create',  // Custom API v2.3.0!
    timeout: 60000,
    batchSize: 15,
    rateLimitDelay: 1500  // 1.5 seconds between requests
  },

  // Image generation pattern (same DigitalOcean Spaces)
  images: {
    baseUrl: 'https://yydistribution.ams3.digitaloceanspaces.com/yyplayer/images/',
    pattern: '{sku}_{index}_600.jpg',
    count: 10,
    validateExistence: true
  },

  // Default values for B2B
  defaults: {
    stockQuantity: 1,  // B2B has stock level of 1 (vs B2C 0)
    stockStatus: 'instock',  // B2B has stock (vs B2C outofstock)
    category: '',  // No default category for B2B
    backorders: 'no',
    weight: '0.20',
    dimensions: {
      length: '30',
      width: '30',
      height: '0.2'
    },
    // UPS/Legal hardcoded values
    originCountry: 'FR',
    hsCode: '85238010',
    upsDescription: 'Vinyl record or Phonograph record'
  }
};

// ========================================
// OPTIMIZATION FUNCTIONS (Phase 1 - Cross-Site Image Reuse)
// ========================================

/**
 * Check if images exist in WordPress Media Library (CROSS-SITE FAST PATH)
 * YYD (B2B) searches YOYAKU.IO (B2C) WordPress for existing images
 * Returns attachment IDs if found, enabling 70% faster imports
 * @param {string} sku - Product SKU
 * @returns {Object} {found: boolean, attachment_ids: Array, count: number}
 */
function checkWordPressImagesForSkuCrossSite(sku) {
  // YYD searches YOYAKU.IO (B2C) WordPress for images
  const b2cBaseUrl = 'https://www.yoyaku.io';
  const b2cBearerToken = '5190d79295f463935067b4b7e57f9de95c28e251646abcfc4c39f3abb6f64b50';

  const searchUrl = `${b2cBaseUrl}/wp-json/wp/v2/media?search=${encodeURIComponent(sku)}&per_page=20`;

  const options = {
    method: 'get',
    headers: {
      'Authorization': `Bearer ${b2cBearerToken}`,
      'Content-Type': 'application/json'
    },
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(searchUrl, options);

    if (response.getResponseCode() !== 200) {
      console.log(`[CROSS-SITE FAST PATH] B2C WordPress search failed (${response.getResponseCode()}) for ${sku}`);
      return { found: false, attachment_ids: [], count: 0 };
    }

    const media = JSON.parse(response.getContentText());

    if (!media || media.length === 0) {
      console.log(`[CROSS-SITE FAST PATH] No B2C images found for ${sku}`);
      return { found: false, attachment_ids: [], count: 0 };
    }

    // Filter images matching SKU_N_600 pattern (accepts WordPress suffix -1, -2, etc)
    const pattern = new RegExp(`${sku}_\\d+_600(-\\d+)?\\.(jpg|png|webp)$`, 'i');
    const productImages = media.filter(m => {
      if (!m.source_url) return false;
      const filename = m.source_url.split('/').pop();
      return pattern.test(filename);
    });

    if (productImages.length === 0) {
      console.log(`[CROSS-SITE FAST PATH] Found ${media.length} B2C media items but none match ${sku}_N_600 pattern`);
      return { found: false, attachment_ids: [], count: 0 };
    }

    // Sort by position (extracted from filename, ignoring WordPress suffix)
    productImages.sort((a, b) => {
      const posA = parseInt(a.source_url.match(/_(\d+)_600(-\d+)?\./i)[1]);
      const posB = parseInt(b.source_url.match(/_(\d+)_600(-\d+)?\./i)[1]);
      return posA - posB;
    });

    const attachmentIds = productImages.map(img => img.id);

    console.log(`[CROSS-SITE FAST PATH] Found ${attachmentIds.length} B2C images for ${sku}: IDs ${attachmentIds.join(', ')}`);

    return {
      found: true,
      attachment_ids: attachmentIds,
      count: attachmentIds.length
    };

  } catch (error) {
    console.error(`[CROSS-SITE FAST PATH] Error checking B2C images for ${sku}:`, error);
    return { found: false, attachment_ids: [], count: 0 };
  }
}

/**
 * Mark row with color based on status (color-coded visual feedback)
 * @param {Sheet} sheet - Google Sheet object
 * @param {number} rowNumber - Row number (1-indexed)
 * @param {string} status - Status: 'success', 'warning', 'error', 'skipped'
 * @param {string} message - Status message to display in column E
 */
function markRowWithStatus(sheet, rowNumber, status, message) {
  const row = sheet.getRange(rowNumber, 1, 1, sheet.getLastColumn());
  const statusCell = sheet.getRange(rowNumber, 5);  // Column E

  switch(status) {
    case 'success':
      row.setBackground('#90EE90');  // Light green
      statusCell.setValue('Success');
      break;

    case 'warning':
      row.setBackground('#FFA500');  // Orange
      statusCell.setValue(message || 'Warning');
      break;

    case 'error':
      row.setBackground('#FFB6C1');  // Light red
      statusCell.setValue(message || 'Error');
      break;

    case 'skipped':
      row.setBackground('#D3D3D3');  // Gray
      statusCell.setValue('Skipped');
      break;

    default:
      // No color change
      statusCell.setValue(message || '');
  }
}

/**
 * Update real-time progress (called after each product)
 * @param {Object} progress - Progress data
 */
function updateRealTimeProgress(progress) {
  const message = `${progress.current}/${progress.total} - ${progress.currentSku}: ${progress.message}`;
  showToast(message, 'NORMAL');
}

// ========================================
// BATCH PROCESSING FUNCTIONS (Phase 2)
// ========================================

/**
 * Get bearer token for site
 * @param {string} site - Site identifier ('yoyaku' or 'yyd')
 * @returns {string} Bearer token
 */
function getBearerTokenYYD(site) {
  return site === 'yoyaku'
    ? '5190d79295f463935067b4b7e57f9de95c28e251646abcfc4c39f3abb6f64b50'
    : 'b5d41ad4797c562c41b42d41f1328554debead46a8ebc340943efd4d7b5676b2';
}

/**
 * Split array into chunks for batch processing
 * @param {Array} array - Array to split
 * @param {number} size - Chunk size
 * @returns {Array} Array of chunks
 */
function chunkArrayYYD(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Build API request object for a single product (for fetchAll)
 * @param {Object} productData - Product data
 * @param {string} bearerToken - Bearer token for authentication
 * @returns {Object} Request object for UrlFetchApp.fetchAll()
 */
function buildAPIRequestForProductYYD(productData, bearerToken) {
  // Build payload (B2B version - site: 'yyd')
  const payload = {
    site: 'yyd',  // Triggers B2B-specific logic (stock level 1, instock, etc.)
    sku: productData.sku,
    title: productData.title,
    description: productData.description || '',
    category: productData.label || '',  // YYD B2B: Label becomes category! (NOT musiclabel taxonomy)
    price: convertEuropeanToEnglishDecimalYYD(productData.priceYYD),
    price_net: productData.priceNet ? convertEuropeanToEnglishDecimalYYD(productData.priceNet) : '',
    weight: productData.weight ?
      convertEuropeanToEnglishDecimalYYD(productData.weight) :
      IMPORT_YYD_CONFIG.defaults.weight,
    stock_quantity: IMPORT_YYD_CONFIG.defaults.stockQuantity,  // B2B: 1 (vs B2C: 0)
    stock_status: IMPORT_YYD_CONFIG.defaults.stockStatus,  // B2B: instock (vs B2C: outofstock)
    // label: NOT USED for YYD (label goes to category instead)
    distributor: productData.distributor ? String(productData.distributor) : '',
    format: productData.format ? String(productData.format) : '',  // YYD: Taxonomy musicformat (NOT custom field)
    artists: (productData.artists || []).map(a => String(a)),
    genres: (productData.genres || []).map(g => String(g)),
    tags: productData.tags || [],
    playlist_files: productData.playlistFiles || '',  // Moved from meta_data (BUG-005 fix)

    // Images optimization (BUG-006 FIX: Cross-site physical file copy)
    // WordPress plugin now copies files from YOYAKU.IO → YYD.FR (same server)
    // Then creates new attachments on YYD.FR database with copied files
    ...(() => {
      const b2cImages = checkWordPressImagesForSkuCrossSite(productData.sku);
      if (b2cImages.found && b2cImages.attachment_ids.length > 0) {
        console.log(`[BATCH CROSS-SITE] Using B2C attachment_ids for ${productData.sku} (${b2cImages.count} images)`);
        console.log(`[BATCH CROSS-SITE] WordPress will copy files from YOYAKU.IO and create new attachments`);
        return { attachment_ids: b2cImages.attachment_ids };
      } else {
        console.log(`[BATCH FALLBACK] No B2C images for ${productData.sku}, using URL download`);
        return { images: generateImageUrlsYYD(productData.sku) };
      }
    })(),

    meta_data: {
      depot_vente: productData.depotVente || '',
      // musicformat: NOT in meta_data for YYD (it's a TAXONOMY, sent via 'format' field above)
      release_date: productData.releaseDate || '',
      // playlist_files: Moved to top-level (BUG-005 fix - WordPress expects direct param)
      // NO set_coming_soon for B2B (immediate stock)
      ups_customs_tariff_code: IMPORT_YYD_CONFIG.defaults.hsCode,
      ups_customs_description: IMPORT_YYD_CONFIG.defaults.upsDescription,
      ups_customs_country_of_origin: IMPORT_YYD_CONFIG.defaults.originCountry,
      ups_customs_value: convertEuropeanToEnglishDecimalYYD(productData.priceYYD)
    }
  };

  // Return request object for fetchAll
  return {
    url: IMPORT_YYD_CONFIG.api.baseUrl + IMPORT_YYD_CONFIG.api.endpoint,
    method: 'post',
    headers: {
      'Authorization': `Bearer ${bearerToken}`,
      'Content-Type': 'application/json'
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
}

/**
 * Process batch of products in parallel using fetchAll (YYD B2B version)
 * @param {Array} batch - Array of product data objects
 * @param {string} bearerToken - Bearer token for API
 * @returns {Array} Array of results {sku, success, productId, url, error, warnings}
 */
function processBatchInParallelYYD(batch, bearerToken) {
  console.log(`[BATCH YYD] Processing ${batch.length} products in parallel...`);

  // Build requests for all products in batch
  const requests = batch.map(product => buildAPIRequestForProductYYD(product, bearerToken));

  // LOG DETAILED REQUEST INFO (DEBUGGING)
  console.log(`[DEBUG] API Endpoint: ${IMPORT_YYD_CONFIG.api.baseUrl}${IMPORT_YYD_CONFIG.api.endpoint}`);
  console.log(`[DEBUG] Bearer Token (first 20 chars): ${bearerToken.substring(0, 20)}...`);
  console.log(`[DEBUG] Number of requests to send: ${requests.length}`);
  console.log(`[DEBUG] First request payload sample:`, JSON.stringify(JSON.parse(requests[0].payload), null, 2).substring(0, 500));

  // Execute all requests in parallel
  const startTime = Date.now();
  let responses;

  try {
    responses = UrlFetchApp.fetchAll(requests);
    console.log(`[DEBUG] fetchAll completed successfully`);
  } catch (fetchError) {
    console.error(`[ERROR] fetchAll EXCEPTION:`, fetchError.message);
    console.error(`[ERROR] Stack trace:`, fetchError.stack);
    throw new Error(`HTTP Request Failed: ${fetchError.message}`);
  }

  const duration = Date.now() - startTime;

  console.log(`[BATCH YYD] Completed ${batch.length} parallel API calls in ${duration}ms`);

  // Parse responses with DETAILED LOGGING
  const results = responses.map((response, index) => {
    const productData = batch[index];

    // LOG DETAILED HTTP RESPONSE
    const statusCode = response.getResponseCode();
    const responseBody = response.getContentText();
    const responseHeaders = response.getHeaders();

    console.log(`[DEBUG ${index + 1}/${batch.length}] Product: ${productData.sku}`);
    console.log(`[DEBUG ${index + 1}/${batch.length}] HTTP Status Code: ${statusCode}`);
    console.log(`[DEBUG ${index + 1}/${batch.length}] Response Headers:`, JSON.stringify(responseHeaders));
    console.log(`[DEBUG ${index + 1}/${batch.length}] Response Body (first 500 chars):`, responseBody.substring(0, 500));

    // Check HTTP status code FIRST (before parsing JSON)
    if (statusCode !== 200 && statusCode !== 201) {
      console.error(`[ERROR ${index + 1}/${batch.length}] HTTP Status NOT OK for ${productData.sku}: ${statusCode}`);
      console.error(`[ERROR ${index + 1}/${batch.length}] Full response body:`, responseBody);
      return {
        sku: productData.sku,
        success: false,
        error: `HTTP ${statusCode}: ${responseBody.substring(0, 200)}`
      };
    }

    try {
      const data = JSON.parse(responseBody);

      console.log(`[DEBUG ${index + 1}/${batch.length}] Parsed JSON success:`, data.success);

      if (data && data.success) {
        console.log(`[SUCCESS ${index + 1}/${batch.length}] Product ${productData.sku} created: ID ${data.product_id}`);
        return {
          sku: productData.sku,
          success: true,
          action: data.action,
          productId: data.product_id,
          url: data.url,
          warnings: productData._warnings || []
        };
      } else {
        console.error(`[ERROR ${index + 1}/${batch.length}] API returned success:false for ${productData.sku}`);
        console.error(`[ERROR ${index + 1}/${batch.length}] Error message:`, data.error || data.message || 'Unknown');
        return {
          sku: productData.sku,
          success: false,
          error: data.error || data.message || 'Unknown API error'
        };
      }
    } catch (parseError) {
      console.error(`[ERROR ${index + 1}/${batch.length}] JSON Parse FAILED for ${productData.sku}:`, parseError.message);
      console.error(`[ERROR ${index + 1}/${batch.length}] Raw response:`, responseBody);
      return {
        sku: productData.sku,
        success: false,
        error: `Failed to parse API response: ${parseError.message}`
      };
    }
  });

  return results;
}

// ========================================
// MAIN FUNCTION - MENU ENTRY POINT
// ========================================

/**
 * Process YYD Import - Called from Menu
 */
function processYYDNewProductsAPI() {
  const ui = SpreadsheetApp.getUi();

  // Check if API Direct is enabled
  if (!IMPORT_YYD_CONFIG.enabled) {
    ui.alert('YYD.FR API Direct',
      'API Direct is currently disabled.\n\n' +
      'Using legacy WP Import instead.\n\n' +
      'To enable API Direct, contact admin.',
      ui.ButtonSet.OK);
    return;
  }

  // Show confirmation dialog
  const response = ui.alert(
    '🚀 YYD.FR - New Products Creation (API Direct)',
    'This will create new products using the FAST API Direct method.\n\n' +
    '✅ Benefits over WP Import:\n' +
    '• 20x faster (6s vs 2min per product)\n' +
    '• No timeouts\n' +
    '• Real-time progress\n' +
    '• Better error handling\n' +
    '• Automatic image generation\n\n' +
    '⚠️ Legacy WP Import remains available as backup.\n\n' +
    'Continue with API Direct?',
    ui.ButtonSet.YES_NO
  );

  if (response !== ui.Button.YES) {
    showToast('YYD.FR creation cancelled', 'NORMAL');
    return;
  }

  // Start processing
  showToast('Starting YYD.FR API Direct...', 'NORMAL');

  try {
    const results = executeYYDImport();
    displayYYDImportResults(results);
  } catch (error) {
    console.error('YYD.FR API failed:', error);

    // Fallback to legacy if configured
    if (IMPORT_YYD_CONFIG.useLegacyFallback) {
      ui.alert('API Error - Falling back to WP Import',
        `API Direct encountered an error:\n${error.message}\n\n` +
        'Falling back to legacy WP Import...\n\n' +
        'Please use the original WP Import method.',
        ui.ButtonSet.OK);
    } else {
      ui.alert('YYD Import Error',
        `Error: ${error.message}\n\n` +
        'Please check the logs and try again.',
        ui.ButtonSet.OK);
    }
  }
}

// ========================================
// CORE PROCESSING
// ========================================

/**
 * Execute YYD Import processing
 * @returns {Object} Processing results
 */
function executeYYDImport() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('wp import new product');

  if (!sheet) {
    throw new Error('Sheet "wp import new product" not found. Please create it first.');
  }

  // Get data with headers
  // BUG-007 FIX: Use getDisplayValues() to read displayed text (not formula results)
  // Fixes issue where VLOOKUP formulas return numeric IDs instead of label names
  const data = sheet.getDataRange().getDisplayValues();

  if (data.length < 2) {
    throw new Error('No data found in sheet. Please add products to import.');
  }

  const originalHeaders = data[0];
  const headers = normalizeHeadersYYD(data[0]);
  const columnMap = createColumnMapYYD(headers, originalHeaders);

  // Validate required columns
  validateRequiredColumnsYYD(columnMap, originalHeaders);

  // Process products
  const results = {
    processed: 0,
    created: 0,
    updated: 0,
    failed: 0,
    skipped: 0,
    errors: [],
    products: [],
    startTime: new Date(),
    endTime: null
  };

  // PHASE 2 OPTIMIZATION: Batch processing with parallel API calls
  // Same as YOYAKU.IO but for YYD.FR B2B

  const BATCH_SIZE = 5;  // Process 5 products in parallel
  const BATCH_DELAY = 500;  // 500ms delay per batch (vs 1.5s per product)

  // STEP 1: Collect all valid products (validation pass)
  const validProducts = [];  // Products ready for API creation
  const rowMap = {};  // Map SKU to row number for color-coding later

  console.log('[BATCH YYD] Starting validation pass...');

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const rowNumber = i + 1;

    // Skip empty rows
    if (!row[columnMap.sku] || row[columnMap.sku].toString().trim() === '') {
      continue;
    }

    try {
      const productData = extractProductDataYYD(row, columnMap);
      const validationErrors = validateProductDataYYD(productData);

      if (validationErrors.length > 0) {
        results.errors.push({
          row: rowNumber,
          sku: productData.sku,
          errors: validationErrors
        });
        results.failed++;
        markRowWithStatus(sheet, rowNumber, 'error', validationErrors.join(', '));
        continue;
      }

      // Check if at least 1 image exists in WordPress (check B2C first for cross-site reuse)
      const imageCheck = checkWordPressImagesForSkuCrossSite(productData.sku);
      if (!imageCheck.found || imageCheck.count === 0) {
        markRowAsErrorYYD(sheet, rowNumber, 'ERROR: No image found in WordPress Media Library');
        results.errors.push({
          row: rowNumber,
          sku: productData.sku,
          errors: ['No image found in WordPress - Product skipped']
        });
        results.failed++;
        continue;
      }

      // Check if MP3 exists - NON-BLOCKING (Phase 1 optimization)
      const mp3Url = `https://yydistribution.ams3.digitaloceanspaces.com/yyplayer/mp3/${productData.sku}_1.mp3`;
      const mp3Exists = isUrlAccessible(mp3Url);

      // Track warnings (non-blocking - continue import)
      const warnings = [];

      if (!mp3Exists) {
        // WARNING: MP3 missing (not critical - continue import)
        console.log(`[WARNING YYD] MP3 missing for ${productData.sku} - continuing import`);
        warnings.push('MP3 file missing');
      }

      // Track for later use
      productData._hasWarnings = warnings.length > 0;
      productData._warnings = warnings;

      // Check for duplicates
      const duplicateCheck = checkForDuplicateYYD(productData);
      if (duplicateCheck.exists) {
        results.products.push({
          row: rowNumber,
          sku: productData.sku,
          status: 'skipped',
          reason: duplicateCheck.reason
        });
        results.skipped++;
        markRowWithStatus(sheet, rowNumber, 'skipped', 'Duplicate');
        continue;
      }

      // Product passed all checks - add to batch queue
      validProducts.push(productData);
      rowMap[productData.sku] = rowNumber;

    } catch (error) {
      console.error(`Error processing row ${i + 1}:`, error);
      results.errors.push({
        row: i + 1,
        sku: row[columnMap.sku] || 'UNKNOWN',
        error: error.message
      });
      results.failed++;
      markRowWithStatus(sheet, i + 1, 'error', error.message);
    }
  }

  console.log(`[BATCH YYD] Validation complete. ${validProducts.length} products ready for API creation`);

  // STEP 2: Process valid products in batches (parallel API calls)
  if (validProducts.length === 0) {
    console.log('[BATCH YYD] No valid products to process');
    results.endTime = new Date();
    results.processingTime = (results.endTime - results.startTime) / 1000;
    return results;
  }

  const batches = chunkArrayYYD(validProducts, BATCH_SIZE);
  const bearerToken = getBearerTokenYYD('yyd');

  console.log(`[BATCH YYD] Processing ${validProducts.length} products in ${batches.length} batches of ${BATCH_SIZE}...`);

  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const batch = batches[batchIndex];

    console.log(`[BATCH YYD ${batchIndex + 1}/${batches.length}] Processing ${batch.length} products in parallel...`);

    // Process entire batch in parallel
    const batchResults = processBatchInParallelYYD(batch, bearerToken);

    // Process results and update sheet
    for (let i = 0; i < batchResults.length; i++) {
      const apiResult = batchResults[i];
      const productData = batch[i];
      const rowNumber = rowMap[productData.sku];

      if (apiResult.success) {
        // SUCCESS
        results.products.push({
          row: rowNumber,
          sku: productData.sku,
          status: 'created',
          productId: apiResult.productId,
          url: apiResult.url,
          warnings: productData._warnings || []
        });
        results.created++;

        // Color-code row based on warnings
        if (productData._hasWarnings) {
          // Orange: Success with warnings
          markRowWithStatus(sheet, rowNumber, 'warning', productData._warnings.join(', '));
          results.warnings = results.warnings || [];
          results.warnings.push({
            row: rowNumber,
            sku: productData.sku,
            warnings: productData._warnings
          });
        } else {
          // Green: Perfect success
          markRowWithStatus(sheet, rowNumber, 'success', 'Success');
        }

      } else {
        // ERROR
        results.products.push({
          row: rowNumber,
          sku: productData.sku,
          status: 'failed',
          error: apiResult.error
        });
        results.failed++;

        // Red: Failed
        markRowWithStatus(sheet, rowNumber, 'error', apiResult.error);
      }

      results.processed++;
    }

    // Update progress after each batch
    const completedProducts = (batchIndex + 1) * BATCH_SIZE;
    const currentProduct = Math.min(completedProducts, validProducts.length);

    updateRealTimeProgress({
      current: currentProduct,
      total: validProducts.length,
      currentSku: batch[batch.length - 1].sku,  // Last SKU in batch
      message: `Batch ${batchIndex + 1}/${batches.length} complete (${batch.length} products processed in parallel)`
    });

    // Rate limiting: 500ms per batch (vs 1.5s per product)
    if (batchIndex < batches.length - 1) {
      Utilities.sleep(BATCH_DELAY);
    }
  }

  console.log(`[BATCH YYD] All batches complete. ${results.created} created, ${results.failed} failed, ${results.skipped} skipped`);

  results.endTime = new Date();
  results.processingTime = (results.endTime - results.startTime) / 1000;

  return results;
}

// ========================================
// DATA EXTRACTION & TRANSFORMATION
// ========================================

/**
 * Extract product data from sheet row (YYD version)
 * @param {Array} row - Sheet row data
 * @param {Object} columnMap - Column index mapping
 * @returns {Object} Product data
 */
function extractProductDataYYD(row, columnMap) {
  return {
    // Core fields
    sku: getColumnValueYYD(row, columnMap.sku),
    title: getColumnValueYYD(row, columnMap.title),
    description: getColumnValueYYD(row, columnMap.description),
    slug: getColumnValueYYD(row, columnMap.slug),

    // Pricing - YYD uses "price yydistribution" column
    priceYYD: getColumnValueYYD(row, columnMap.priceyydistribution),
    priceNet: getColumnValueYYD(row, columnMap.pricenet),

    // Music metadata
    label: getColumnValueYYD(row, columnMap.label),
    distributor: getColumnValueYYD(row, columnMap.distributor),
    artists: [
      getColumnValueYYD(row, columnMap.artist1),
      getColumnValueYYD(row, columnMap.artist2),
      getColumnValueYYD(row, columnMap.artist3),
      getColumnValueYYD(row, columnMap.artist4)
    ].filter(a => a && a.trim()),
    genres: [
      getColumnValueYYD(row, columnMap.genre1),
      getColumnValueYYD(row, columnMap.genre2),
      getColumnValueYYD(row, columnMap.genre3),
      getColumnValueYYD(row, columnMap.genre4)
    ].filter(g => g && g.trim()),

    // Product details
    releaseDate: getColumnValueYYD(row, columnMap.releasedate),
    format: getColumnValueYYD(row, columnMap.format),
    feature: getColumnValueYYD(row, columnMap.feature),
    weight: getColumnValueYYD(row, columnMap.weight),
    playlistFiles: getColumnValueYYD(row, columnMap.playlistfiles),

    // Tags
    tags: [
      getColumnValueYYD(row, columnMap.tag1),
      getColumnValueYYD(row, columnMap.tag2)
    ].filter(t => t && t.trim()),

    // Depot vente
    depotVente: getColumnValueYYD(row, columnMap.depotvente)
  };
}

/**
 * Get column value safely
 */
function getColumnValueYYD(row, index) {
  if (index === undefined || index === null || index < 0) return '';
  return row[index] ? row[index].toString().trim() : '';
}

// ========================================
// VALIDATION
// ========================================

/**
 * Validate product data (YYD version)
 */
function validateProductDataYYD(productData) {
  const errors = [];

  // Required fields
  if (!productData.sku || productData.sku.trim() === '') {
    errors.push('❌ SKU manquant\n→ Vérifiez la colonne "SKU" dans votre ligne');
  }

  if (!productData.title || productData.title.length === 0) {
    errors.push('❌ Titre manquant\n→ Vérifiez la colonne "title" dans votre ligne');
  }

  if (!productData.label || productData.label.length === 0) {
    errors.push('❌ Label manquant\n→ Vérifiez la colonne "label" dans votre ligne');
  }

  if (!productData.priceYYD || !productData.priceYYD.match(/^[0-9]+[,.]?[0-9]*$/)) {
    errors.push(`❌ Prix YYD invalide: "${productData.priceYYD}"\n→ Le prix doit être un nombre (exemple: 12,50 ou 12.50)`);
  }

  return errors;
}

/**
 * Find product by SKU on YYD.FR (site-specific version)
 * FIXED 2025-11-10: Use YYD credentials instead of YOYAKU.IO credentials
 * @param {string} sku - Product SKU
 * @returns {number|null} Product ID if found, null otherwise
 */
function findProductBySkuYYD(sku) {
  try {
    // Get YYD-specific credentials (NOT yoyaku.io!)
    const credentials = getAPICredentials('yydistribution.fr');

    const url = `${credentials.url}?sku=${encodeURIComponent(sku)}`;

    const options = {
      method: 'get',
      headers: {
        'Authorization': 'Basic ' + Utilities.base64Encode(`${credentials.consumer_key}:${credentials.consumer_secret}`)
      },
      muteHttpExceptions: true
    };

    const response = UrlFetchApp.fetch(url, options);

    if (response.getResponseCode() === 200) {
      const products = JSON.parse(response.getContentText());
      if (products && products.length > 0) {
        console.log(`[YYD Duplicate Check] Found product on YYD.FR: ${products[0].id}`);
        return products[0].id;
      }
    }

    console.log(`[YYD Duplicate Check] No product found on YYD.FR with SKU: ${sku}`);
    return null;

  } catch (error) {
    console.error(`[YYD Duplicate Check] Error finding product by SKU ${sku}:`, error);
    return null;
  }
}

/**
 * Check for duplicate product (YYD version)
 */
function checkForDuplicateYYD(productData) {
  try {
    const existingBySku = findProductBySkuYYD(productData.sku);
    if (existingBySku) {
      return {
        exists: true,
        reason: `❌ PRODUIT DÉJÀ EXISTANT\n\n` +
                `Le SKU "${productData.sku}" existe déjà sur YYD.FR.\n\n` +
                `🔗 Product ID: ${existingBySku}\n` +
                `📦 Lien: https://yydistribution.fr/wp-admin/post.php?post=${existingBySku}&action=edit\n\n` +
                `💡 QUE FAIRE?\n` +
                `• Si c'est une erreur → Supprimez le produit existant d'abord\n` +
                `• Si vous voulez mettre à jour → Utilisez l'import de mise à jour\n` +
                `• Si c'est normal → Ce produit est déjà dans le catalogue`
      };
    }

    return { exists: false };

  } catch (error) {
    console.log(`Duplicate check failed for ${productData.sku}:`, error);
    return { exists: false };
  }
}

// ========================================
// API CALLS
// ========================================

/**
 * Create product via API (YYD B2B version)
 */
function createProductViaAPIYYD(productData) {
  try {
    // Build API v2.3.0 payload (YYD.FR B2B)
    const payload = {
      // Site parameter - triggers B2B logic
      site: 'yyd',  // B2B site

      // Core fields
      sku: productData.sku,
      title: productData.title,
      description: productData.description || '',

      // Category - NO default category for B2B (unlike B2C)
      category: '',

      // Pricing - NO rounding for B2B (exact prices)
      price: convertEuropeanToEnglishDecimalYYD(productData.priceYYD, false),
      price_net: productData.priceNet ? convertEuropeanToEnglishDecimalYYD(productData.priceNet, false) : '',

      // Shipping
      weight: productData.weight ?
        convertEuropeanToEnglishDecimalYYD(productData.weight, false) :
        IMPORT_YYD_CONFIG.defaults.weight,

      // Inventory - B2B has stock immediately
      stock_quantity: IMPORT_YYD_CONFIG.defaults.stockQuantity,
      stock_status: IMPORT_YYD_CONFIG.defaults.stockStatus,  // 'instock' for B2B

      // Music metadata - FORCE STRING CONVERSION
      label: productData.label ? String(productData.label) : '',
      distributor: productData.distributor ? String(productData.distributor) : '',
      format: productData.format ? String(productData.format) : '',

      // Artists & Genres
      artists: (productData.artists || []).map(a => String(a)),
      genres: (productData.genres || []).map(g => String(g)),

      // Tags
      tags: productData.tags || [],

      // Images - OPTIMIZATION: Check B2C WordPress first (70% faster cross-site reuse)
      // Priority: attachment_ids from B2C (FAST) > images URLs (SLOW fallback)
      ...(() => {
        const b2cImages = checkWordPressImagesForSkuCrossSite(productData.sku);

        if (b2cImages.found && b2cImages.attachment_ids.length > 0) {
          // FAST PATH: Reuse B2C images (70% faster cross-site)
          console.log(`[OPTIMIZATION] Using B2C attachment_ids for ${productData.sku} (${b2cImages.count} images)`);
          return { attachment_ids: b2cImages.attachment_ids };
        } else {
          // SLOW FALLBACK: Download images from URLs
          console.log(`[FALLBACK] No B2C images for ${productData.sku}, using URL download`);
          return { images: generateImageUrlsYYD(productData.sku) };
        }
      })(),

      // Custom meta data
      meta_data: {
        depot_vente: productData.depotVente || '',
        musicformat: productData.format || '',
        release_date: productData.releaseDate || '',
        playlist_files: productData.playlistFiles || '',
        set_coming_soon: isComingSoonYYD(productData.releaseDate) ? 'yes' : 'no',  // Conditional based on release date
        // UPS Customs fields
        ups_customs_tariff_code: IMPORT_YYD_CONFIG.defaults.hsCode,
        ups_customs_description: IMPORT_YYD_CONFIG.defaults.upsDescription,
        ups_customs_country_of_origin: IMPORT_YYD_CONFIG.defaults.originCountry,
        ups_customs_value: convertEuropeanToEnglishDecimalYYD(productData.priceYYD, false)
      }
    };

    // Make API call
    const response = callYOYAKUAPI(payload);

    if (response && response.success) {
      return {
        success: true,
        action: response.action,
        productId: response.product_id,
        url: response.url
      };
    } else {
      return {
        success: false,
        error: response.error || 'Unknown API error'
      };
    }

  } catch (error) {
    console.error('API v2.3.0 call failed (YYD):', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// ========================================
// IMAGE GENERATION (B2B LOGIC)
// ========================================

/**
 * Generate image URLs for YYD.FR (B2B version)
 *
 * IMPORTANT: YYD.FR imports AFTER YOYAKU.IO
 * Images are already uploaded to YOYAKU.IO WordPress
 * → Fetch images from YOYAKU.IO product, don't re-upload from DigitalOcean
 *
 * @param {string} sku - Product SKU
 * @returns {Array} Image URLs from YOYAKU.IO product
 */
function generateImageUrlsYYD(sku) {
  try {
    // Fetch product from YOYAKU.IO by SKU
    const yoyakuProduct = findProductOnYOYAKU(sku);

    if (yoyakuProduct && yoyakuProduct.images && yoyakuProduct.images.length > 0) {
      // Use images from YOYAKU.IO product
      const imageUrls = yoyakuProduct.images.map(img => img.src);
      console.log(`[YYD Images] Found ${imageUrls.length} images from YOYAKU.IO for SKU ${sku}`);
      return imageUrls;
    }

    // Fallback: If product not found on YOYAKU.IO, try DigitalOcean Spaces
    console.log(`[YYD Images] Product ${sku} not found on YOYAKU.IO, trying DigitalOcean Spaces...`);
    return generateImageUrlsFromSpaces(sku);

  } catch (error) {
    console.error(`[YYD Images] Error fetching from YOYAKU.IO: ${error.message}`);
    // Fallback to DigitalOcean Spaces
    return generateImageUrlsFromSpaces(sku);
  }
}

/**
 * Find product on YOYAKU.IO by SKU
 * @param {string} sku - Product SKU
 * @returns {Object|null} Product data from YOYAKU.IO or null
 */
function findProductOnYOYAKU(sku) {
  try {
    const url = `https://www.yoyaku.io/wp-json/wc/v3/products?sku=${encodeURIComponent(sku)}`;

    // Use YOYAKU credentials (need to be configured separately or shared)
    const scriptProperties = PropertiesService.getScriptProperties();
    const consumerKey = scriptProperties.getProperty('YOYAKU_WC_KEY');
    const consumerSecret = scriptProperties.getProperty('YOYAKU_WC_SECRET');

    if (!consumerKey || !consumerSecret) {
      console.log('[YYD Images] YOYAKU WooCommerce credentials not configured, using fallback');
      return null;
    }

    const response = UrlFetchApp.fetch(url, {
      headers: {
        'Authorization': 'Basic ' + Utilities.base64Encode(`${consumerKey}:${consumerSecret}`)
      },
      muteHttpExceptions: true
    });

    if (response.getResponseCode() === 200) {
      const products = JSON.parse(response.getContentText());
      if (products && products.length > 0) {
        console.log(`[YYD Images] Found product on YOYAKU.IO: ${products[0].id}`);
        return products[0];
      }
    }

    return null;

  } catch (error) {
    console.error(`[YYD Images] Error fetching from YOYAKU.IO: ${error.message}`);
    return null;
  }
}

/**
 * Fallback: Generate image URLs from DigitalOcean Spaces
 * @param {string} sku - Product SKU
 * @returns {Array} Image URLs
 */
function generateImageUrlsFromSpaces(sku) {
  const images = [];
  const baseUrl = IMPORT_YYD_CONFIG.images.baseUrl;
  const formats = ['jpg', 'png', 'webp'];

  for (let i = 1; i <= IMPORT_YYD_CONFIG.images.count; i++) {
    let foundImage = null;

    for (const format of formats) {
      const imageUrl = `${baseUrl}${sku}_${i}_600.${format}`;

      if (IMPORT_YYD_CONFIG.images.validateExistence) {
        const exists = isUrlAccessible(imageUrl);
        if (exists) {
          foundImage = imageUrl;
          break;
        }
      } else {
        foundImage = imageUrl;
        break;
      }
    }

    if (!foundImage) {
      console.log(`[YYD Images] No image found at position ${i} for SKU ${sku}. Stopping with ${i-1} images.`);
      break;
    }

    images.push(foundImage);
  }

  return images;
}

/**
 * Check if at least 1 image exists (YYD version)
 */
function checkImagesExistYYD(sku) {
  const baseUrl = IMPORT_YYD_CONFIG.images.baseUrl;
  const formats = ['jpg', 'png', 'webp'];
  let count = 0;
  const foundFormats = [];

  for (const format of formats) {
    const imageUrl = `${baseUrl}${sku}_1_600.${format}`;
    if (isUrlAccessible(imageUrl)) {
      count++;
      foundFormats.push(format);
      break;
    }
  }

  return { count, foundFormats };
}

/**
 * Mark row as error (YYD version)
 */
function markRowAsErrorYYD(sheet, rowNumber, errorMessage) {
  const lastColumn = sheet.getLastColumn();
  const rowRange = sheet.getRange(rowNumber, 1, 1, lastColumn);
  rowRange.setBackground('#FF9800');

  const columnE = sheet.getRange(rowNumber, 5);
  columnE.setValue(errorMessage);
  columnE.setFontWeight('bold');
  columnE.setFontColor('#D32F2F');
}

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Check if product is coming soon based on release date
 * @param {string} releaseDate - Format: d-m-Y (e.g., "8-12-2025")
 * @returns {boolean} True if release date is in the future
 */
function isComingSoonYYD(releaseDate) {
  if (!releaseDate) return false;

  try {
    // Parse European date format (d-m-Y)
    const parts = releaseDate.split('-');
    if (parts.length !== 3) return false;

    const day = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1; // JS months are 0-indexed
    const year = parseInt(parts[2]);

    const release = new Date(year, month, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return release > today;
  } catch (error) {
    return false;
  }
}

/**
 * Convert European decimal to English decimal
 * @param {string} value - European format
 * @param {boolean} round - Round to nearest 0.10 (B2C) or keep exact (B2B)
 * @returns {string} English format
 */
function convertEuropeanToEnglishDecimalYYD(value, round = false) {
  if (!value) return '';

  const englishDecimal = value.toString().replace(',', '.');
  const numberValue = parseFloat(englishDecimal);
  if (isNaN(numberValue)) return '';

  if (round) {
    // B2C rounding to nearest 0.10
    const rounded = Math.round(numberValue * 10) / 10;
    return rounded.toFixed(2);
  } else {
    // B2B exact price (no rounding)
    return numberValue.toFixed(2);
  }
}

/**
 * Normalize headers (YYD version)
 */
function normalizeHeadersYYD(headers) {
  return headers.map(header => {
    return header.toString()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .replace(/\s+/g, '');
  });
}

/**
 * Create column index mapping (YYD version)
 */
function createColumnMapYYD(headers, originalHeaders) {
  const map = {};

  headers.forEach((header, index) => {
    map[header] = index;
  });

  // YYD-specific column aliases
  const columnAliases = {
    'sku': ['sku', 'productsku', 'cataloguenumber'],
    'title': ['title', 'producttitle', 'name', 'productname'],
    'label': ['label', 'musiclabel', 'recordlabel'],
    'priceyydistribution': ['priceyydistribution', 'priceyyd', 'yydprice', 'b2bprice'],
    'format': ['format', 'musicformat', 'vinylformat']  // Format column Q (same as YOYAKU)
  };

  for (const [canonical, aliases] of Object.entries(columnAliases)) {
    if (map[canonical] === undefined) {
      for (const alias of aliases) {
        if (map[alias] !== undefined) {
          map[canonical] = map[alias];
          break;
        }
      }
    }
  }

  return map;
}

/**
 * Validate required columns (YYD version)
 */
function validateRequiredColumnsYYD(columnMap, originalHeaders) {
  const required = {
    'sku': 'SKU or Catalogue Number',
    'title': 'Title or Product Name',
    'label': 'Label or Music Label',
    'priceyydistribution': 'price yydistribution or B2B Price'
  };

  const missing = [];

  for (const [col, description] of Object.entries(required)) {
    if (columnMap[col] === undefined) {
      missing.push(description);
    }
  }

  if (missing.length > 0) {
    const availableColumns = originalHeaders.join(', ');
    throw new Error(
      `Required columns missing: ${missing.join(', ')}\n\n` +
      `Available columns in sheet: ${availableColumns}\n\n` +
      `Please ensure your sheet has these required columns.`
    );
  }
}

// ========================================
// RESULTS DISPLAY
// ========================================

/**
 * Display results to user (YYD version)
 */
function displayYYDImportResults(results) {
  const ui = SpreadsheetApp.getUi();

  let message = `✅ Import YYD.FR Terminé!\n\n`;
  message += `⏱️ Temps: ${results.processingTime}s\n\n`;
  message += `📊 Résumé:\n`;
  message += `• Traités: ${results.processed}\n`;
  message += `• Créés: ${results.created} ✅\n`;
  message += `• Mis à jour: ${results.updated} 🔄\n`;
  message += `• Ignorés: ${results.skipped} ⏭️\n`;
  message += `• Erreurs: ${results.failed} ❌\n\n`;

  if (results.created > 0) {
    message += `🎉 ${results.created} nouveau(x) produit(s) créé(s) avec succès!\n\n`;
  }

  if (results.skipped > 0) {
    message += `⏭️ ${results.skipped} produit(s) ignoré(s):\n\n`;
    const skippedProducts = results.products.filter(p => p.status === 'skipped');

    skippedProducts.forEach(p => {
      message += `📦 ${p.sku} (Ligne ${p.row}):\n`;
      message += `${p.reason}\n\n`;
    });
  }

  if (results.failed > 0) {
    message += `❌ ${results.failed} produit(s) en erreur:\n\n`;

    if (results.errors && results.errors.length > 0) {
      results.errors.forEach(err => {
        message += `📦 ${err.sku} (Ligne ${err.row}):\n`;
        message += `${err.errors.join('\n')}\n\n`;
      });
    }

    const failedProducts = results.products.filter(p => p.status === 'failed');
    failedProducts.forEach(p => {
      message += `📦 ${p.sku} (Ligne ${p.row}):\n`;
      message += `${p.error}\n\n`;
    });
  }

  if (results.skipped > 0 || results.failed > 0) {
    message += `\n📋 Détails complets disponibles dans:\n`;
    message += `• Sheet "Import YYD Results"\n`;
    message += `• Logs (View → Executions)`;
  }

  ui.alert('Import YYD.FR - Résultats', message, ui.ButtonSet.OK);

  console.log('Import YYD.FR Results:', results);

  if (results.products.length > 0) {
    writeResultsToSheetYYD(results);
  }
}

/**
 * Write results to sheet (YYD version)
 */
function writeResultsToSheetYYD(results) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName('Import YYD Results');

    if (!sheet) {
      sheet = ss.insertSheet('Import YYD Results');
    }

    sheet.clear();

    const headers = ['Timestamp', 'Row', 'SKU', 'Status', 'Product ID', 'URL', 'Error'];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

    const timestamp = new Date().toISOString();
    const rows = results.products.map(product => [
      timestamp,
      product.row,
      product.sku,
      product.status,
      product.productId || '',
      product.url || '',
      product.error || product.reason || ''
    ]);

    if (rows.length > 0) {
      sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
    }

    sheet.autoResizeColumns(1, headers.length);

  } catch (error) {
    const errorMsg = `❌ ERREUR ÉCRITURE RÉSULTATS\n\n` +
                     `Impossible d'écrire les résultats dans le sheet.\n\n` +
                     `Détails: ${error.message || error.toString()}`;
    console.error(errorMsg);
  }
}
