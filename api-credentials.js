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