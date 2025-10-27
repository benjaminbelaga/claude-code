/**
 * WooCommerce API Credentials
 * SECURITY: These should be stored in Google Apps Script Properties in production
 * 
 * @author Benjamin Belaga
 * @version 1.0.0
 */

// API Credentials Configuration
const API_CREDENTIALS = {
  // YOYAKU.IO Production
  'yoyaku.io': {
    url: 'https://www.yoyaku.io/wp-json/wc/v3/products',
    consumer_key: 'ck_0d3ea2a08a2af1f134f9fc8fcd83466196a2ab6f',
    consumer_secret: 'cs_91deb512e1ac643aee4f0d98eaea10bcbf346571'
  },
  
  // YYDistribution.fr Production
  'yydistribution.fr': {
    url: 'https://www.yydistribution.fr/wp-json/wc/v3/products',
    consumer_key: 'ck_762cfbeda204362565de52dd24f764233874faef',
    consumer_secret: 'cs_a02aa1db1c4bd5e169d172fdd25b717403518c19'
  },
  
  // Barcelona (if needed)
  'barcelona': {
    url: 'https://barcelona.yoyaku.io/wp-json/wc/v3/products',
    consumer_key: 'ck_YOUR_BARCELONA_KEY', // TODO: Add if needed
    consumer_secret: 'cs_YOUR_BARCELONA_SECRET' // TODO: Add if needed
  }
};

/**
 * Get API credentials for a specific site
 * @param {string} site - Site identifier ('yoyaku.io', 'yydistribution.fr', 'barcelona')
 * @returns {Object} API credentials
 */
function getAPICredentials(site) {
  if (!API_CREDENTIALS[site]) {
    throw new Error(`No credentials found for site: ${site}`);
  }
  return API_CREDENTIALS[site];
}

/**
 * Check if credentials are configured for a site
 * @param {string} site - Site identifier
 * @returns {boolean} True if credentials are real (not placeholders)
 */
function hasValidCredentials(site) {
  const creds = API_CREDENTIALS[site];
  if (!creds) return false;
  
  return !creds.consumer_key.includes('YOUR_') && 
         !creds.consumer_secret.includes('YOUR_');
}

/**
 * Store credentials in Script Properties (more secure)
 * This is the recommended way to store sensitive data
 */
function storeCredentialsSecurely() {
  const scriptProperties = PropertiesService.getScriptProperties();
  
  // Store YOYAKU credentials
  scriptProperties.setProperty('YOYAKU_API_KEY', 'ck_0d3ea2a08a2af1f134f9fc8fcd83466196a2ab6f');
  scriptProperties.setProperty('YOYAKU_API_SECRET', 'cs_91deb512e1ac643aee4f0d98eaea10bcbf346571');
  
  // Store YYD credentials (when available)
  // scriptProperties.setProperty('YYD_API_KEY', 'ck_real_yyd_key');
  // scriptProperties.setProperty('YYD_API_SECRET', 'cs_real_yyd_secret');
  
  Logger.log('Credentials stored securely in Script Properties');
}

/**
 * Retrieve credentials from Script Properties
 * @param {string} site - Site identifier
 * @returns {Object} API credentials from secure storage
 */
function getSecureCredentials(site) {
  const scriptProperties = PropertiesService.getScriptProperties();

  switch(site) {
    case 'yoyaku.io':
      return {
        url: 'https://www.yoyaku.io/wp-json/wc/v3/products',
        consumer_key: scriptProperties.getProperty('YOYAKU_API_KEY') || API_CREDENTIALS['yoyaku.io'].consumer_key,
        consumer_secret: scriptProperties.getProperty('YOYAKU_API_SECRET') || API_CREDENTIALS['yoyaku.io'].consumer_secret
      };

    case 'yydistribution.fr':
      return {
        url: 'https://www.yydistribution.fr/wp-json/wc/v3/products',
        consumer_key: scriptProperties.getProperty('YYD_API_KEY') || API_CREDENTIALS['yydistribution.fr'].consumer_key,
        consumer_secret: scriptProperties.getProperty('YYD_API_SECRET') || API_CREDENTIALS['yydistribution.fr'].consumer_secret
      };

    default:
      throw new Error(`Unknown site: ${site}`);
  }
}

/**
 * Recalculation API Endpoints and Tokens
 * These endpoints trigger fresh data recalculation on source systems
 *
 * v2 API Features:
 * - Targeted recalculation by SKUs (faster)
 * - Smart 5-minute cache layer
 * - Event-driven auto-updates
 * - Rate limiting (10 req/min)
 *
 * v3 API Features (NEW - Backorder-Optimized):
 * - Backorder-aware smart skipping (10-20x faster)
 * - Only processes products with backorders enabled
 * - ~95% of products skipped instantly (<1ms vs 20ms)
 * - Same cache + rate limiting as v2
 * - Backward compatible (v2 endpoints still work)
 */
const RECALC_ENDPOINTS = {
  'yoyaku.io': {
    url: 'https://www.yoyaku.io/wp-json/ysc/v2/recalculate-preorders',
    urlV3: 'https://www.yoyaku.io/wp-json/ysc/v3/recalculate-preorders',  // NEW: v3 endpoint
    token: 'c29f2f1a58c45fc55d90260cad1693fe2096a33abf81b1f4b3d1cc615204fe24'
  },
  'yydistribution.fr': {
    url: 'https://www.yydistribution.fr/wp-json/yyd/v2/recalculate-shelves',
    urlV3: 'https://www.yydistribution.fr/wp-json/yyd/v3/recalculate-shelves',  // NEW: v3 endpoint
    token: 'f7a863c1e2c6dea4484442c04b305aa915b8ba61563f4333e755b02cad3bbc67'
  }
};

/**
 * Get recalculation endpoint configuration for a site
 * @param {string} site - Site identifier ('yoyaku.io', 'yydistribution.fr')
 * @param {string} version - API version ('v2' or 'v3', default 'v3')
 * @returns {Object} Recalculation endpoint configuration
 */
function getRecalcEndpoint(site, version = 'v3') {
  if (!RECALC_ENDPOINTS[site]) {
    throw new Error(`No recalculation endpoint configured for site: ${site}`);
  }

  const config = RECALC_ENDPOINTS[site];

  // Use v3 endpoint if available and requested
  if (version === 'v3' && config.urlV3) {
    return {
      url: config.urlV3,
      token: config.token
    };
  }

  // Fallback to v2
  return {
    url: config.url,
    token: config.token
  };
}