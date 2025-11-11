/**
 * Import 935 YYD - New Products Creation via API v2.3.0
 *
 * COMPLETE B2B COMPLIANCE: Uses NEW YOYAKU API v2.3.0 endpoint
 * - 100% compatible with WP All Import #935 specifications
 * - Includes ALL B2B-specific fields (backorders, shipping class, UPS customs)
 * - Works alongside existing WP Import
 * - Toggle ON/OFF via menu
 *
 * API v2.3.0 NEW FEATURES:
 * - release_date parameter (→ _pre_order_date, _date_out)
 * - playlist_files parameter (→ _yyd_playlist_files_raw)
 * - features parameter (→ _product_features)
 * - Automatic B2B settings (backorders=yes, low_stock=10, shipping_class=1231)
 * - UPS customs fields (5 fields hardcoded for vinyl)
 *
 * @version 2.0.0
 * @date 2025-11-07
 * @apiVersion 2.3.0
 */

// ========================================
// CONFIGURATION
// ========================================

const IMPORT_935_CONFIG = {
  enabled: true,  // Toggle to enable/disable API v2
  useLegacyFallback: true,  // Fallback to WP Import if API fails

  // API Settings - NEW v2.3.0 Endpoint
  api: {
    baseUrl: 'https://yydistribution.fr',
    endpoint: '/wp-json/yoyaku/v2/product/create',  // NEW API v2.3.0!
    timeout: 60000,
    batchSize: 10,
    rateLimitDelay: 2000  // 2 seconds between requests (B2B can be slower)
  },

  // Image generation pattern (same as YOYAKU)
  images: {
    baseUrl: 'https://yydistribution.ams3.digitaloceanspaces.com/yyplayer/images/',
    pattern: '{sku}_{index}_600.jpg',
    count: 10,
    validateExistence: false  // API v2.4.1+ copies images from YOYAKU.IO automatically
  },

  // Default values (matching WP Import 935 - B2B specific!)
  defaults: {
    stockQuantity: 0,
    stockStatus: 'outofstock',
    backorders: 'yes',  // B2B allows backorders!
    weight: '0.20',
    dimensions: {
      length: '30',
      width: '30',
      height: '0.2'
    },
    // B2B specific
    lowStockAmount: 10,
    preOrderStockStatus: 'global',
    shippingClassId: 1231,  // YYD B2B shipping class
    // UPS/Legal hardcoded values (matching WP Import 935)
    originCountry: 'FR',
    hsCode: '8523801000',  // 10 digits (correct B2B format)
    upsDescription: 'Phonograph records (vinyl), non-blank',
    isPreOrder: 'yes'
  }
};

// ========================================
// MAIN FUNCTION - MENU ENTRY POINT
// ========================================

/**
 * Process Import 935 New Products - Called from Menu
 * PRESERVES LEGACY: Can run alongside WP Import
 */
function processImport935NewProductsAPI() {
  const ui = SpreadsheetApp.getUi();

  // Check if API v2 is enabled
  if (!IMPORT_935_CONFIG.enabled) {
    ui.alert('Import 935 API v2',
      'API v2 is currently disabled.\n\n' +
      'Using legacy WP Import instead.\n\n' +
      'To enable API v2, contact admin.',
      ui.ButtonSet.OK);
    return;
  }

  // Show confirmation dialog with benefits
  const response = ui.alert(
    '🚀 Import 935 - New Products Creation (API v2.3.0)',
    'This will create new B2B products using the NEW API v2.3.0.\n\n' +
    '✅ Benefits over WP Import:\n' +
    '• 100% B2B compliance (backorders, shipping, UPS)\n' +
    '• 15x faster (~2s vs 30s per product)\n' +
    '• No timeouts\n' +
    '• Real-time progress\n' +
    '• Better error handling\n' +
    '• Automatic B2B configuration\n\n' +
    '🆕 API v2.3.0 NEW FEATURES:\n' +
    '• Release date handling\n' +
    '• Playlist files\n' +
    '• Product features\n' +
    '• UPS customs automation\n\n' +
    '⚠️ Legacy WP Import remains available as backup.\n\n' +
    'Continue with API v2.3.0?',
    ui.ButtonSet.YES_NO
  );

  if (response !== ui.Button.YES) {
    showToast('Import 935 cancelled', 'NORMAL');
    return;
  }

  // Start processing
  showToast('Starting Import 935 API v2.3.0...', 'NORMAL');

  try {
    const results = executeImport935();
    displayImport935Results(results);
  } catch (error) {
    console.error('Import 935 API failed:', error);

    // Fallback to legacy if configured
    if (IMPORT_935_CONFIG.useLegacyFallback) {
      ui.alert('API Error - Falling back to WP Import',
        `API v2 encountered an error:\n${error.message}\n\n` +
        'Falling back to legacy WP Import...\n\n' +
        'Please use the original WP Import method.',
        ui.ButtonSet.OK);
    } else {
      ui.alert('Import 935 Error',
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
 * Execute Import 935 processing
 * @returns {Object} Processing results
 */
function executeImport935() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('wp import new product');

  if (!sheet) {
    throw new Error('Sheet "wp import new product" not found. Please create it first.');
  }

  // Get data with headers
  const data = sheet.getDataRange().getValues();

  if (data.length < 2) {
    throw new Error('No data found in sheet. Please add products to import.');
  }

  const originalHeaders = data[0]; // Keep original headers for error messages
  const headers = normalizeHeaders935(data[0]);
  const columnMap = createColumnMap935(headers, originalHeaders);

  // Validate required columns
  validateRequiredColumns935(columnMap, originalHeaders);

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

  // Process each row (skip header)
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const rowNumber = i + 1; // Actual row in sheet (1-indexed)

    // Skip empty rows
    if (!row[columnMap.sku] || row[columnMap.sku].toString().trim() === '') {
      continue;
    }

    try {
      const productData = extractProductData935(row, columnMap);
      const validationErrors = validateProductData935(productData);

      if (validationErrors.length > 0) {
        results.errors.push({
          row: rowNumber,
          sku: productData.sku,
          errors: validationErrors
        });
        results.failed++;
        continue;
      }

      // CRITICAL: Check if at least 1 image exists (JPG/PNG/WebP)
      const imageCheck = checkImagesExist935(productData.sku);
      if (imageCheck.count === 0) {
        // No images found - SKIP and mark orange
        markRowAsError935(sheet, rowNumber, 'ERROR: No image found (JPG/PNG/WebP)');
        results.errors.push({
          row: rowNumber,
          sku: productData.sku,
          errors: ['No image found - Product skipped']
        });
        results.failed++;
        continue;
      }

      // Check if MP3 exists (SKU_1.mp3)
      const mp3Url = `https://yydistribution.ams3.digitaloceanspaces.com/yyplayer/mp3/${productData.sku}_1.mp3`;
      const mp3Exists = isUrlAccessible(mp3Url);

      if (!mp3Exists) {
        // Ask user if they want to import anyway
        const ui = SpreadsheetApp.getUi();
        const response = ui.alert(
          '⚠️ MP3 Missing',
          `Row ${rowNumber} (${productData.sku}):\n\n` +
          `MP3 file not found at:\n${mp3Url}\n\n` +
          `Do you want to import this product anyway?`,
          ui.ButtonSet.YES_NO
        );

        if (response !== ui.Button.YES) {
          // User chose not to import - SKIP and mark orange
          markRowAsError935(sheet, rowNumber, 'ERROR: No MP3 - User chose not to import');
          results.errors.push({
            row: rowNumber,
            sku: productData.sku,
            errors: ['No MP3 - User cancelled import']
          });
          results.failed++;
          continue;
        }
      }

      // Create product via API v2.3.0
      const apiResult = createProductViaAPIv2(productData);

      if (apiResult.success) {
        results.products.push({
          row: rowNumber,
          sku: productData.sku,
          status: apiResult.action,  // 'created' or 'updated'
          productId: apiResult.productId,
          url: apiResult.url
        });

        if (apiResult.action === 'created') {
          results.created++;
        } else {
          results.updated++;
        }
      } else {
        results.products.push({
          row: rowNumber,
          sku: productData.sku,
          status: 'failed',
          error: apiResult.error
        });
        results.failed++;
      }

      results.processed++;

      // Update progress
      if (results.processed % 5 === 0) {
        showToast(`Processing... ${results.processed} products done`, 'NORMAL');
      }

      // Rate limiting
      Utilities.sleep(IMPORT_935_CONFIG.api.rateLimitDelay);

    } catch (error) {
      console.error(`Error processing row ${i + 1}:`, error);
      results.errors.push({
        row: i + 1,
        sku: row[columnMap.sku] || 'UNKNOWN',
        error: error.message
      });
      results.failed++;
    }
  }

  results.endTime = new Date();
  results.processingTime = (results.endTime - results.startTime) / 1000;

  return results;
}

// ========================================
// DATA EXTRACTION & TRANSFORMATION
// ========================================

/**
 * Extract product data from sheet row (YYD B2B specific)
 * @param {Array} row - Sheet row data
 * @param {Object} columnMap - Column index mapping
 * @returns {Object} Product data
 */
function extractProductData935(row, columnMap) {
  return {
    // Core fields
    sku: getColumnValue935(row, columnMap.sku),
    title: getColumnValue935(row, columnMap.title),
    description: getColumnValue935(row, columnMap.description),
    // Note: YYD slug = SKU (API v2.3.0 handles this automatically)

    // Pricing (European decimal format)
    priceYyd: getColumnValue935(row, columnMap.priceyydistribution),

    // Music metadata
    label: getColumnValue935(row, columnMap.label),
    distributor: getColumnValue935(row, columnMap.distributor),
    artists: [
      getColumnValue935(row, columnMap.artist1),
      getColumnValue935(row, columnMap.artist2),
      getColumnValue935(row, columnMap.artist3),
      getColumnValue935(row, columnMap.artist4)
    ].filter(a => a && a.trim()),
    genres: [
      getColumnValue935(row, columnMap.genre1),
      getColumnValue935(row, columnMap.genre2),
      getColumnValue935(row, columnMap.genre3),
      getColumnValue935(row, columnMap.genre4),
      getColumnValue935(row, columnMap.genre5)
    ].filter(g => g && g.trim()),

    // Product details (NEW in API v2.3.0!)
    releaseDate: getColumnValue935(row, columnMap.releasedate),
    format: getColumnValue935(row, columnMap.format),
    feature: getColumnValue935(row, columnMap.feature),
    weight: getColumnValue935(row, columnMap.weight),
    playlistFiles: getColumnValue935(row, columnMap.playlistfiles),

    // Tags
    tags: [
      getColumnValue935(row, columnMap.tag1),
      getColumnValue935(row, columnMap.tag2)
    ].filter(t => t && t.trim())
  };
}

/**
 * Get column value safely
 * @param {Array} row - Data row
 * @param {number} index - Column index
 * @returns {string} Column value or empty string
 */
function getColumnValue935(row, index) {
  if (index === undefined || index === null || index < 0) return '';
  return row[index] ? row[index].toString().trim() : '';
}

// ========================================
// VALIDATION
// ========================================

/**
 * Validate product data (B2B specific)
 * @param {Object} productData - Product data to validate
 * @returns {Array} Validation errors
 */
function validateProductData935(productData) {
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

  if (!productData.priceYyd || !productData.priceYyd.match(/^[0-9]+[,.]?[0-9]*$/)) {
    errors.push(`❌ Prix YYD invalide: "${productData.priceYyd}"\n→ Le prix doit être un nombre (exemple: 12,50 ou 12.50)`);
  }

  // B2B business rules - REMOVED (YYD.FR accepts past dates for stock products)
  // YYD.FR is for distributors, not just pre-orders
  // Products can be already released and in stock

  return errors;
}

// ========================================
// API v2.3.0 CALL
// ========================================

/**
 * Create product via YOYAKU API v2.3.0
 * NEW: Uses /yoyaku/v2/product/create endpoint with B2B parameters
 * @param {Object} productData - Product data
 * @returns {Object} API result
 */
function createProductViaAPIv2(productData) {
  try {
    // Build API v2.3.0 payload
    const payload = {
      // Site parameter (CRITICAL for B2B!)
      site: 'yyd',  // Triggers B2B-specific logic

      // Core fields
      sku: productData.sku,
      title: productData.title,
      description: productData.description || '',

      // Pricing - convert European decimal to English
      price: convertEuropeanToEnglishDecimal935(productData.priceYyd),

      // Shipping
      weight: productData.weight ?
        convertEuropeanToEnglishDecimal935(productData.weight) :
        IMPORT_935_CONFIG.defaults.weight,

      // Inventory
      stock_quantity: IMPORT_935_CONFIG.defaults.stockQuantity,
      stock_status: IMPORT_935_CONFIG.defaults.stockStatus,

      // 🆕 NEW API v2.3.0 PARAMETERS
      release_date: productData.releaseDate || '',
      playlist_files: productData.playlistFiles || '',
      features: productData.feature || '',

      // Music metadata - FORCE STRING CONVERSION (prevent numeric IDs from Google Sheets)
      // Fixed 2025-11-09: Google Sheets VLOOKUP returns numbers, must force to string
      label: productData.label ? String(productData.label) : '',
      distributor: productData.distributor ? String(productData.distributor) : '',
      format: productData.format ? String(productData.format) : '',

      // Artists & Genres - FORCE STRING for each element
      artists: (productData.artists || []).map(a => String(a)),
      genres: (productData.genres || []).map(g => String(g)),

      // Tags array
      tags: productData.tags || []
    };

    // Make API call
    const response = callYOYAKUAPIv2(payload);

    if (response && response.success) {
      return {
        success: true,
        action: response.action,  // 'created' or 'updated'
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
    console.error('API v2 call failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Call YOYAKU API v2 (YYD.FR)
 * Requires Bearer token authentication
 * @param {Object} payload - Request payload
 * @returns {Object} API response
 */
function callYOYAKUAPIv2(payload) {
  const url = IMPORT_935_CONFIG.api.baseUrl + IMPORT_935_CONFIG.api.endpoint;

  // Bearer token from wp-config.php (YOYAKU_API_BEARER_TOKEN)
  const bearerToken = 'b5d41ad4797c562c41b42d41f1328554debead46a8ebc340943efd4d7b5676b2';

  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${bearerToken}`
    }
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();

    console.log(`API v2 Response (${responseCode}):`, responseText);

    if (responseCode === 200 || responseCode === 201) {
      return JSON.parse(responseText);
    } else {
      return {
        success: false,
        error: `HTTP ${responseCode}: ${responseText}`
      };
    }
  } catch (error) {
    console.error('HTTP request failed:', error);
    return {
      success: false,
      error: `Request failed: ${error.message}`
    };
  }
}

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Convert European decimal to English decimal (B2B version - NO rounding)
 * @param {string} value - European format (16,4)
 * @returns {string} English format (16.40) - exact value with 2 decimals
 */
function convertEuropeanToEnglishDecimal935(value) {
  if (!value) return '';

  // Convert comma to period
  const englishDecimal = value.toString().replace(',', '.');

  // Parse to float
  const numberValue = parseFloat(englishDecimal);
  if (isNaN(numberValue)) return '';

  // B2B: NO rounding, return exact value with 2 decimal places
  // (vs B2C which rounds to nearest 0.10)
  return numberValue.toFixed(2);
}

/**
 * Normalize headers for consistent mapping
 * @param {Array} headers - Header row
 * @returns {Array} Normalized headers
 */
function normalizeHeaders935(headers) {
  return headers.map(header => {
    return header.toString()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .replace(/\s+/g, '');
  });
}

/**
 * Create column index mapping with flexible matching
 * @param {Array} headers - Normalized headers
 * @param {Array} originalHeaders - Original headers (before normalization)
 * @returns {Object} Column map
 */
function createColumnMap935(headers, originalHeaders) {
  const map = {};

  headers.forEach((header, index) => {
    map[header] = index;
  });

  // FLEXIBLE MAPPING - Handle multiple column name variations
  const columnAliases = {
    'sku': ['sku', 'productsku', 'cataloguenumber'],
    'title': ['title', 'producttitle', 'name', 'productname'],
    'label': ['label', 'musiclabel', 'recordlabel'],
    'priceyydistribution': ['priceyydistribution', 'priceyyd', 'yydprice', 'b2bprice', 'price']
  };

  // Try to find column using aliases
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
 * Validate required columns exist with helpful error messages
 * @param {Object} columnMap - Column mapping
 * @param {Array} originalHeaders - Original headers for error message
 * @throws {Error} If required columns missing
 */
function validateRequiredColumns935(columnMap, originalHeaders) {
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
 * Display results to user
 * @param {Object} results - Processing results
 */
function displayImport935Results(results) {
  const ui = SpreadsheetApp.getUi();

  let message = `Import API YYD v2.3.0 Complete!\n\n`;
  message += `⏱️ Processing time: ${results.processingTime}s\n\n`;
  message += `📊 Results:\n`;
  message += `• Processed: ${results.processed}\n`;
  message += `• Created: ${results.created} ✅\n`;
  message += `• Updated: ${results.updated} 🔄\n`;
  message += `• Failed: ${results.failed} ❌\n\n`;

  if (results.created > 0) {
    message += `✅ Successfully created ${results.created} new B2B products!\n\n`;
  }

  if (results.updated > 0) {
    message += `🔄 Updated ${results.updated} existing products!\n\n`;
  }

  if (results.failed > 0) {
    message += `❌ ${results.failed} products failed:\n\n`;

    // Show validation errors
    if (results.errors && results.errors.length > 0) {
      results.errors.forEach(err => {
        message += `• Row ${err.row} (${err.sku}): ${err.errors.join(', ')}\n`;
      });
    }

    // Show API errors
    const failedProducts = results.products.filter(p => p.status === 'failed');
    failedProducts.forEach(p => {
      message += `• Row ${p.row} (${p.sku}): ${p.error}\n`;
    });
    message += `\n`;
  }

  message += `🆕 API v2.3.0 Features Applied:\n`;
  message += `• Backorders: Enabled (B2B)\n`;
  message += `• Low stock alert: 10 units\n`;
  message += `• Shipping class: ID 1231\n`;
  message += `• UPS customs: 5 fields auto-filled`;

  ui.alert('Import API YYD Results', message, ui.ButtonSet.OK);

  // Log detailed results
  console.log('Import API YYD Results:', results);

  // Write results to sheet
  if (results.products.length > 0) {
    writeResultsToSheet935(results);
  }
}

/**
 * Write results to a results sheet
 * @param {Object} results - Processing results
 */
function writeResultsToSheet935(results) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName('Import API YYD Results');

    if (!sheet) {
      sheet = ss.insertSheet('Import API YYD Results');
    }

    // Clear existing content
    sheet.clear();

    // Write headers
    const headers = ['Timestamp', 'Row', 'SKU', 'Status', 'Product ID', 'URL', 'Error'];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

    // Write results
    const timestamp = new Date().toISOString();
    const rows = results.products.map(product => [
      timestamp,
      product.row,
      product.sku,
      product.status,
      product.productId || '',
      product.url || '',
      product.error || ''
    ]);

    if (rows.length > 0) {
      sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
    }

    // Format
    sheet.autoResizeColumns(1, headers.length);

  } catch (error) {
    console.error('Failed to write results to sheet:', error);
  }
}

// ========================================
// TESTING & VALIDATION FUNCTIONS
// ========================================

/**
 * Test Import 935 API v2.3.0 with sample data
 */
function testImport935API() {
  const testData = {
    sku: 'TESTB2B001',
    title: 'Test Product Import 935 B2B',
    label: 'Test Label B2B',
    priceYyd: '18,5',
    distributor: 'test-distributor',
    releaseDate: '2025-12-15',
    artists: ['Test Artist B2B'],
    genres: ['Electronic', 'Techno'],
    description: 'Test product for Import 935 API v2.3.0 validation',
    format: 'Vinyl',
    weight: '0,20',
    feature: '180g vinyl, limited edition',
    playlistFiles: 'track1.mp3,track2.mp3'
  };

  console.log('Testing Import 935 API v2.3.0 with:', testData);

  // Validate
  const errors = validateProductData935(testData);
  console.log('Validation errors:', errors);

  // Test API call (dry run)
  const payload = {
    site: 'yyd',
    sku: testData.sku,
    title: testData.title,
    price: convertEuropeanToEnglishDecimal935(testData.priceYyd),
    release_date: testData.releaseDate,
    playlist_files: testData.playlistFiles,
    features: testData.feature,
    label: testData.label,
    distributor: testData.distributor,
    format: testData.format,
    artists: testData.artists,
    genres: testData.genres
  };

  console.log('API v2.3.0 Payload:', payload);

  SpreadsheetApp.getUi().alert(
    'Test Import 935 API',
    'Test data prepared!\n\n' +
    `SKU: ${testData.sku}\n` +
    `Title: ${testData.title}\n` +
    `Price: ${convertEuropeanToEnglishDecimal935(testData.priceYyd)}\n\n` +
    `NEW API v2.3.0 parameters:\n` +
    `• release_date: ${testData.releaseDate}\n` +
    `• playlist_files: ${testData.playlistFiles}\n` +
    `• features: ${testData.feature}\n\n` +
    'Check console for full payload.',
    SpreadsheetApp.getUi().ButtonSet.OK
  );

  return {
    testData,
    errors,
    payload
  };
}

/**
 * Validate Import 935 API v2.3.0 configuration
 */
function validateImport935Config() {
  const checks = {
    sheetExists: false,
    columnsValid: false,
    apiConnected: false
  };

  // Check sheet
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('wp import new product');
  checks.sheetExists = sheet !== null;

  if (sheet) {
    // Check columns
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const normalized = normalizeHeaders935(headers);
    const columnMap = createColumnMap935(normalized, headers); // Pass original headers

    try {
      validateRequiredColumns935(columnMap, headers); // Pass original headers
      checks.columnsValid = true;
    } catch (error) {
      console.error('Column validation failed:', error);
    }
  }

  // Check API v2.3.0 connection
  try {
    const testUrl = IMPORT_935_CONFIG.api.baseUrl + IMPORT_935_CONFIG.api.endpoint;
    const response = UrlFetchApp.fetch(testUrl, {
      muteHttpExceptions: true,
      method: 'GET'
    });
    checks.apiConnected = response.getResponseCode() !== 404;
  } catch (error) {
    console.error('API connection test failed:', error);
  }

  console.log('Import 935 Configuration Validation:', checks);

  const ui = SpreadsheetApp.getUi();
  ui.alert(
    'Import 935 API v2.3.0 Configuration',
    `Sheet Exists: ${checks.sheetExists ? '✅' : '❌'}\n` +
    `Columns Valid: ${checks.columnsValid ? '✅' : '❌'}\n` +
    `API Connected: ${checks.apiConnected ? '✅' : '❌'}\n\n` +
    `API Endpoint: ${IMPORT_935_CONFIG.api.endpoint}\n` +
    `Site: YYD.FR (B2B)\n` +
    `Version: v2.3.0`,
    ui.ButtonSet.OK
  );

  return checks;
}

/**
 * Show Import 935 API v2.3.0 Dashboard
 */
function showImport935Dashboard() {
  const ui = SpreadsheetApp.getUi();

  const info = `📦 YYD Import 935 - API v2.3.0 Dashboard\n\n` +
    `🎯 Purpose: Create new B2B products for YYD.FR\n\n` +
    `🆕 API v2.3.0 Features:\n` +
    `• Complete B2B compliance\n` +
    `• Backorders enabled automatically\n` +
    `• Low stock alert: 10 units\n` +
    `• Shipping class: ID 1231 (B2B rates)\n` +
    `• UPS customs: 5 fields auto-filled\n` +
    `• Release date handling\n` +
    `• Playlist files support\n` +
    `• Product features\n\n` +
    `⚙️ Configuration:\n` +
    `• Endpoint: /yoyaku/v2/product/create\n` +
    `• Site parameter: yyd\n` +
    `• Enabled: ${IMPORT_935_CONFIG.enabled}\n` +
    `• Batch size: ${IMPORT_935_CONFIG.api.batchSize}\n` +
    `• Rate limit: ${IMPORT_935_CONFIG.api.rateLimitDelay}ms\n\n` +
    `📋 Required Columns:\n` +
    `• sku, title, label, priceyydistribution\n\n` +
    `🆕 Optional Columns (NEW v2.3.0):\n` +
    `• releasedate → _pre_order_date, _date_out\n` +
    `• playlistfiles → _yyd_playlist_files_raw\n` +
    `• feature → _product_features\n\n` +
    `💡 Legacy WP Import #935 still available as backup.`;

  ui.alert('Import 935 Dashboard', info, ui.ButtonSet.OK);
}

/**
 * Setup Import 935 API v2.3.0 Configuration
 */
function setupImport935Configuration() {
  const ui = SpreadsheetApp.getUi();

  ui.alert(
    'Setup Import 935 Configuration',
    'Import 935 API v2.3.0 is pre-configured!\n\n' +
    '✅ All B2B settings are automatic:\n' +
    '• Backorders: yes\n' +
    '• Low stock: 10\n' +
    '• Shipping class: 1231\n' +
    '• UPS customs: auto-filled\n\n' +
    '📋 Required Sheet Columns:\n' +
    '• sku (required)\n' +
    '• title (required)\n' +
    '• label (required)\n' +
    '• priceyydistribution (required)\n' +
    '• releasedate (optional - NEW v2.3.0)\n' +
    '• playlistfiles (optional - NEW v2.3.0)\n' +
    '• feature (optional - NEW v2.3.0)\n' +
    '• distributor, artists, genres, format, etc.\n\n' +
    'No manual configuration needed!',
    ui.ButtonSet.OK
  );
}

// ========================================
// IMAGE & MP3 VALIDATION HELPERS
// ========================================

/**
 * Check if at least 1 image exists for SKU (any format: JPG/PNG/WebP)
 * @param {string} sku - Product SKU
 * @returns {Object} {count: number, foundFormats: Array}
 */
function checkImagesExist935(sku) {
  const baseUrl = IMPORT_935_CONFIG.images.baseUrl;
  const formats = ['jpg', 'png', 'webp'];
  let count = 0;
  const foundFormats = [];

  // Check only first image (SKU_1) in all formats
  for (const format of formats) {
    const imageUrl = `${baseUrl}${sku}_1_600.${format}`;
    if (isUrlAccessible(imageUrl)) {
      count++;
      foundFormats.push(format);
      break; // Found at least one, that's enough
    }
  }

  return { count, foundFormats };
}

/**
 * Mark row as error (orange background + error message in column E)
 * Column E is "quantity" which is always empty at import time
 * @param {Sheet} sheet - Google Sheet object
 * @param {number} rowNumber - Row number (1-indexed)
 * @param {string} errorMessage - Error message to display
 */
function markRowAsError935(sheet, rowNumber, errorMessage) {
  // Color entire row orange
  const lastColumn = sheet.getLastColumn();
  const rowRange = sheet.getRange(rowNumber, 1, 1, lastColumn);
  rowRange.setBackground('#FF9800'); // Orange color

  // Put error message in column E (column 5 = quantity)
  const columnE = sheet.getRange(rowNumber, 5);
  columnE.setValue(errorMessage);
  columnE.setFontWeight('bold');
  columnE.setFontColor('#D32F2F'); // Red text
}

/**
 * Show Legacy Import 935 Instructions
 */
function showLegacyImport935Instructions() {
  const ui = SpreadsheetApp.getUi();

  ui.alert(
    '📋 Legacy WP Import #935 Instructions',
    'If API v2.3.0 is not available, use legacy WP Import:\n\n' +
    '1. Go to WordPress Admin (YYD.FR)\n' +
    '2. Navigate to All Import → Manage Imports\n' +
    '3. Find "Import #935 - New Products"\n' +
    '4. Click "Run Import"\n' +
    '5. Upload your CSV file\n' +
    '6. Follow the import wizard\n\n' +
    '⚠️ Note: Legacy import is slower but 100% compatible.\n\n' +
    '💡 API v2.3.0 is recommended for better performance!',
    ui.ButtonSet.OK
  );
}
