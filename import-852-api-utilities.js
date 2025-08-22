/**
 * Import 852 API Utilities
 * Supporting functions for WooCommerce API calls and WordPress operations
 * 
 * @version 1.0.0
 * @date 2025-08-22
 */

// ========================================
// WOOCOMMERCE API FUNCTIONS
// ========================================

/**
 * Make WooCommerce API call
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
 * @param {string} endpoint - API endpoint
 * @param {Object} data - Request payload
 * @returns {Object} API response
 */
function callWooCommerceAPI(method, endpoint, data = null) {
  const credentials = getWooCommerceCredentials();
  
  const options = {
    method: method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${Utilities.base64Encode(credentials.consumerKey + ':' + credentials.consumerSecret)}`
    },
    muteHttpExceptions: true
  };
  
  if (data && (method === 'POST' || method === 'PUT')) {
    options.payload = JSON.stringify(data);
  }
  
  const url = `${IMPORT_852_CONFIG.api.baseUrl}${endpoint}`;
  
  try {
    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();
    
    console.log(`API ${method} ${endpoint}: ${responseCode}`);
    
    if (responseCode >= 200 && responseCode < 300) {
      return JSON.parse(responseText);
    } else {
      console.error(`API Error ${responseCode}:`, responseText);
      const errorData = JSON.parse(responseText);
      throw new Error(errorData.message || `API Error: ${responseCode}`);
    }
    
  } catch (error) {
    console.error('API call failed:', error);
    throw new Error(`API call failed: ${error.message}`);
  }
}

/**
 * Get WooCommerce API credentials
 * @returns {Object} Credentials object
 */
function getWooCommerceCredentials() {
  // Get from Google Apps Script properties or config
  const props = PropertiesService.getScriptProperties();
  
  const consumerKey = props.getProperty('YOYAKU_WC_CONSUMER_KEY');
  const consumerSecret = props.getProperty('YOYAKU_WC_CONSUMER_SECRET');
  
  if (!consumerKey || !consumerSecret) {
    throw new Error('WooCommerce API credentials not found. Please configure them in Script Properties.');
  }
  
  return {
    consumerKey: consumerKey,
    consumerSecret: consumerSecret
  };
}

/**
 * Test API connection
 * @returns {boolean} True if connection successful
 */
function testApiConnection() {
  try {
    const response = callWooCommerceAPI('GET', '/wp-json/wc/v3/system_status');
    return response && response.environment;
  } catch (error) {
    console.error('API connection test failed:', error);
    return false;
  }
}

/**
 * Find product by SKU
 * @param {string} sku - Product SKU
 * @returns {number|null} Product ID if found, null otherwise
 */
function findProductBySku(sku) {
  try {
    const response = callWooCommerceAPI('GET', `/wp-json/wc/v3/products?sku=${encodeURIComponent(sku)}`);
    
    if (response && response.length > 0) {
      return response[0].id;
    }
    
    return null;
    
  } catch (error) {
    console.error(`Error finding product by SKU ${sku}:`, error);
    return null;
  }
}

/**
 * Set product terms for a specific taxonomy
 * @param {number} productId - WooCommerce product ID
 * @param {string} taxonomy - Taxonomy name
 * @param {Array} terms - Array of term names
 */
function setProductTerms(productId, taxonomy, terms) {
  if (!terms || terms.length === 0) return;
  
  try {
    // First, ensure terms exist and get their IDs
    const termIds = [];
    
    for (const termName of terms) {
      if (!termName || termName.trim() === '') continue;
      
      const termId = ensureTermExists(taxonomy, termName.trim());
      if (termId) {
        termIds.push(termId);
      }
    }
    
    if (termIds.length === 0) return;
    
    // Set terms on product
    const endpoint = `/wp-json/wc/v3/products/${productId}`;
    const payload = {};
    
    // Map taxonomy to WooCommerce field
    switch (taxonomy) {
      case 'musicartist':
        payload.musicartist = termIds;
        break;
      case 'musiclabel':
        payload.musiclabel = termIds;
        break;
      case 'musicstyle':
        payload.musicstyle = termIds;
        break;
      case 'distributormusic':
        payload.distributormusic = termIds;
        break;
      case 'product_tag':
        payload.tags = termIds.map(id => ({ id: id }));
        break;
      default:
        console.log(`Unknown taxonomy: ${taxonomy}`);
        return;
    }
    
    const response = callWooCommerceAPI('PUT', endpoint, payload);
    console.log(`Set ${taxonomy} terms for product ${productId}:`, termIds);
    
  } catch (error) {
    console.error(`Failed to set ${taxonomy} terms for product ${productId}:`, error);
    // Don't throw - continue with product creation even if taxonomy fails
  }
}

/**
 * Ensure term exists in taxonomy, create if necessary
 * @param {string} taxonomy - Taxonomy name
 * @param {string} termName - Term name
 * @returns {number|null} Term ID
 */
function ensureTermExists(taxonomy, termName) {
  try {
    // First check if term exists
    const searchResponse = callWooCommerceAPI('GET', 
      `/wp-json/wc/v3/products/${taxonomy}?search=${encodeURIComponent(termName)}&per_page=10`);
    
    if (searchResponse && searchResponse.length > 0) {
      // Find exact match
      const exactMatch = searchResponse.find(term => 
        term.name.toLowerCase().trim() === termName.toLowerCase().trim());
      
      if (exactMatch) {
        return exactMatch.id;
      }
    }
    
    // Term doesn't exist, create it
    const createPayload = {
      name: termName,
      slug: termName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    };
    
    const createResponse = callWooCommerceAPI('POST', 
      `/wp-json/wc/v3/products/${taxonomy}`, createPayload);
    
    if (createResponse && createResponse.id) {
      console.log(`Created new ${taxonomy} term: ${termName} (ID: ${createResponse.id})`);
      return createResponse.id;
    }
    
    return null;
    
  } catch (error) {
    console.error(`Failed to ensure term exists: ${taxonomy}/${termName}:`, error);
    return null;
  }
}

// ========================================
// MENU INTEGRATION
// ========================================

/**
 * Add Import 852 to the custom menu
 * Call this from the main menu creation function
 */
function addImport852ToMenu() {
  const ui = SpreadsheetApp.getUi();
  
  // Get or create the main menu
  let menu = ui.getMenu('⚡ Update Tools (API Direct NEW)');
  
  if (!menu) {
    menu = ui.createMenu('⚡ Update Tools (API Direct NEW)');
  }
  
  // Add Import 852 options
  menu
    .addSubMenu(ui.createMenu('🚀 Create New Products (Import 852)')
      .addItem('📦 Create New Products (API Direct)', 'processImport852NewProductsAPI')
      .addSeparator()
      .addItem('🧪 Test Import 852 API', 'testImport852API')
      .addItem('🔍 Validate Configuration', 'validateImport852Config')
      .addSeparator()
      .addItem('📋 Legacy WP Import Instructions', 'showLegacyImport852Instructions')
    );
  
  return menu;
}

/**
 * Show legacy WP Import instructions
 * Preserves existing workflow knowledge
 */
function showLegacyImport852Instructions() {
  const ui = SpreadsheetApp.getUi();
  
  const message = `Legacy WP Import 852 Instructions:\n\n` +
    `1. Go to WordPress Admin (yoyaku.io/wp-admin)\n` +
    `2. Navigate to All Import > Manage Imports\n` +
    `3. Find Import #852 "regular new product 2025"\n` +
    `4. Click "Run Import"\n` +
    `5. Monitor progress and check for errors\n\n` +
    `📋 Import 852 Settings:\n` +
    `• Source: Google Sheets CSV\n` +
    `• Post Type: Products\n` +
    `• Processing: AJAX\n` +
    `• Batch Size: 1 product per request\n\n` +
    `⚠️ Known Issues:\n` +
    `• Timeouts with large batches\n` +
    `• Slow processing (2+ minutes per product)\n` +
    `• Limited error feedback\n\n` +
    `💡 Consider using API Direct for better performance!`;
  
  ui.alert('Legacy WP Import 852', message, ui.ButtonSet.OK);
}

// ========================================
// CONFIGURATION HELPERS
// ========================================

/**
 * Setup Import 852 configuration
 * One-time setup for credentials and settings
 */
function setupImport852Configuration() {
  const ui = SpreadsheetApp.getUi();
  
  // Check if already configured
  const props = PropertiesService.getScriptProperties();
  const existingKey = props.getProperty('YOYAKU_WC_CONSUMER_KEY');
  
  if (existingKey) {
    const response = ui.alert('Configuration Exists',
      'Import 852 API is already configured.\n\n' +
      'Do you want to update the configuration?',
      ui.ButtonSet.YES_NO);
    
    if (response !== ui.Button.YES) {
      return;
    }
  }
  
  // Get WooCommerce API credentials
  const consumerKeyResponse = ui.prompt('WooCommerce API Setup',
    'Enter your WooCommerce Consumer Key:\n\n' +
    '(Get this from WooCommerce > Settings > Advanced > REST API)',
    ui.ButtonSet.OK_CANCEL);
  
  if (consumerKeyResponse.getSelectedButton() !== ui.Button.OK) {
    return;
  }
  
  const consumerSecretResponse = ui.prompt('WooCommerce API Setup',
    'Enter your WooCommerce Consumer Secret:',
    ui.ButtonSet.OK_CANCEL);
  
  if (consumerSecretResponse.getSelectedButton() !== ui.Button.OK) {
    return;
  }
  
  // Save credentials
  props.setProperties({
    'YOYAKU_WC_CONSUMER_KEY': consumerKeyResponse.getResponseText().trim(),
    'YOYAKU_WC_CONSUMER_SECRET': consumerSecretResponse.getResponseText().trim()
  });
  
  // Test connection
  try {
    const connected = testApiConnection();
    
    if (connected) {
      ui.alert('Setup Complete',
        '✅ Import 852 API configured successfully!\n\n' +
        'You can now use the API Direct method for creating new products.\n\n' +
        'Find it in the menu: ⚡ Update Tools > 🚀 Create New Products',
        ui.ButtonSet.OK);
    } else {
      ui.alert('Setup Warning',
        '⚠️ Configuration saved but connection test failed.\n\n' +
        'Please verify your credentials and try again.',
        ui.ButtonSet.OK);
    }
    
  } catch (error) {
    ui.alert('Setup Error',
      `❌ Configuration failed: ${error.message}\n\n` +
      'Please check your credentials and try again.',
      ui.ButtonSet.OK);
  }
}

/**
 * Reset Import 852 configuration
 */
function resetImport852Configuration() {
  const ui = SpreadsheetApp.getUi();
  
  const response = ui.alert('Reset Configuration',
    'This will delete all Import 852 API configuration.\n\n' +
    'You will need to reconfigure credentials.\n\n' +
    'Continue?',
    ui.ButtonSet.YES_NO);
  
  if (response === ui.Button.YES) {
    const props = PropertiesService.getScriptProperties();
    props.deleteProperty('YOYAKU_WC_CONSUMER_KEY');
    props.deleteProperty('YOYAKU_WC_CONSUMER_SECRET');
    
    ui.alert('Reset Complete',
      'Import 852 configuration has been reset.\n\n' +
      'Run setup again to reconfigure.',
      ui.ButtonSet.OK);
  }
}

// ========================================
// DEBUGGING & MONITORING
// ========================================

/**
 * Get Import 852 status and statistics
 */
function getImport852Status() {
  const status = {
    configured: false,
    apiConnected: false,
    lastRun: null,
    totalProcessed: 0,
    successRate: 0,
    averageTime: 0
  };
  
  // Check configuration
  const props = PropertiesService.getScriptProperties();
  status.configured = !!(props.getProperty('YOYAKU_WC_CONSUMER_KEY'));
  
  // Check API connection
  if (status.configured) {
    try {
      status.apiConnected = testApiConnection();
    } catch (error) {
      status.apiConnected = false;
    }
  }
  
  // Get statistics from results sheet if it exists
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const resultsSheet = ss.getSheetByName('Import 852 Results');
    
    if (resultsSheet && resultsSheet.getLastRow() > 1) {
      const data = resultsSheet.getDataRange().getValues();
      
      // Calculate statistics
      const results = data.slice(1); // Skip header
      status.totalProcessed = results.length;
      
      const successful = results.filter(row => row[3] === 'created').length;
      status.successRate = Math.round((successful / status.totalProcessed) * 100);
      
      // Get last run time
      if (results.length > 0) {
        status.lastRun = results[results.length - 1][0]; // Timestamp column
      }
    }
    
  } catch (error) {
    console.log('Could not get statistics:', error);
  }
  
  return status;
}

/**
 * Show Import 852 dashboard
 */
function showImport852Dashboard() {
  const ui = SpreadsheetApp.getUi();
  const status = getImport852Status();
  
  let message = `Import 852 API Direct Dashboard\n\n`;
  
  message += `🔧 Configuration:\n`;
  message += `• Configured: ${status.configured ? '✅ Yes' : '❌ No'}\n`;
  message += `• API Connected: ${status.apiConnected ? '✅ Yes' : '❌ No'}\n\n`;
  
  message += `📊 Statistics:\n`;
  message += `• Total Processed: ${status.totalProcessed}\n`;
  message += `• Success Rate: ${status.successRate}%\n`;
  message += `• Last Run: ${status.lastRun || 'Never'}\n\n`;
  
  if (!status.configured) {
    message += `⚙️ Setup Required:\n`;
    message += `Run "Setup Configuration" to get started.\n\n`;
  }
  
  if (status.configured && !status.apiConnected) {
    message += `⚠️ Connection Issue:\n`;
    message += `Check credentials and network connectivity.\n\n`;
  }
  
  message += `🚀 Ready to process new products!`;
  
  ui.alert('Import 852 Dashboard', message, ui.ButtonSet.OK);
}

/**
 * Log Import 852 activity
 * @param {string} action - Action performed
 * @param {Object} data - Action data
 */
function logImport852Activity(action, data = {}) {
  try {
    console.log(`Import 852 - ${action}:`, data);
    
    // Could also write to a log sheet for audit trail
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let logSheet = ss.getSheetByName('Import 852 Logs');
    
    if (!logSheet) {
      logSheet = ss.insertSheet('Import 852 Logs');
      logSheet.getRange(1, 1, 1, 4).setValues([
        ['Timestamp', 'Action', 'Data', 'User']
      ]);
    }
    
    const timestamp = new Date().toISOString();
    const user = Session.getActiveUser().getEmail();
    const dataString = JSON.stringify(data);
    
    logSheet.appendRow([timestamp, action, dataString, user]);
    
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Show toast notification
 * @param {string} message - Message to show
 * @param {string} title - Toast title
 */
function showToast(message, title = 'Import 852') {
  try {
    SpreadsheetApp.getActiveSpreadsheet().toast(message, title, 3);
  } catch (error) {
    console.log('Toast notification:', message);
  }
}

/**
 * Format duration for display
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration
 */
function formatDuration(seconds) {
  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }
}

/**
 * Validate URL accessibility
 * @param {string} url - URL to check
 * @returns {boolean} True if accessible
 */
function isUrlAccessible(url) {
  try {
    const response = UrlFetchApp.fetch(url, {
      method: 'HEAD',
      muteHttpExceptions: true,
      followRedirects: false
    });
    
    return response.getResponseCode() === 200;
    
  } catch (error) {
    return false;
  }
}

/**
 * Batch process with rate limiting
 * @param {Array} items - Items to process
 * @param {Function} processor - Processing function
 * @param {number} batchSize - Batch size
 * @param {number} delay - Delay between batches in ms
 * @returns {Array} Results
 */
function batchProcess(items, processor, batchSize = 10, delay = 1000) {
  const results = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    
    for (const item of batch) {
      try {
        const result = processor(item);
        results.push(result);
      } catch (error) {
        console.error(`Batch processing error for item ${i}:`, error);
        results.push({ error: error.message });
      }
    }
    
    // Rate limiting delay
    if (i + batchSize < items.length) {
      Utilities.sleep(delay);
    }
  }
  
  return results;
}