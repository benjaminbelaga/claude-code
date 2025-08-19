/**
 * Configuration and Secrets Management
 * WP Import Dashboard - Modular Architecture v2.0
 * Uses PropertiesService for sensitive data
 */

/**
 * Configuration centralisée pour WP Import Dashboard
 */
class Config {
  
  // ======================= MÉTA-CONFIGURATION ======================= //
  static get VERSION() { return '2.0.0'; }
  static get PROJECT_NAME() { return 'WP Import Dashboard'; }
  static get AUTHOR() { return 'YOYAKU Team'; }
  
  // ======================= SITES CONFIGURATION ======================= //
  static get SITES() {
    return {
    YOYAKU_IO: {
      name: 'yoyaku.io',
      domain: 'www.yoyaku.io',
      wpLoadUrl: 'https://www.yoyaku.io/wp-load.php',
      importIds: { 
        new: '852', 
        preorder: '717',
        stock: '803',
        picking: '775',
        export: '526',
        delete: '810'
      },
      isCloudflareProtected: true
    },
    YYD: {
      name: 'yydistribution.fr',
      domain: 'www.yydistribution.fr',
      wpLoadUrl: 'https://www.yydistribution.fr/wp-load.php',
      importIds: { 
        new: '935',
        stock: '953',
        releaseDate: '941'
      },
      isCloudflareProtected: false
    },
    BARCELONA: {
      name: 'barcelona.yoyaku.io',
      domain: 'barcelona.yoyaku.io',
      wpLoadUrl: 'https://barcelona.yoyaku.io/wp-load.php',
      importIds: { 
        new: '852'
      },
      isCloudflareProtected: true
    }
    };
  }

  // ======================= TAXONOMIES ======================= //
  /**
   * Returns the list of official YOYAKU genres.
   * This serves as the single source of truth for genre validation.
   * @returns {string[]} An array of official genre names.
   */
  static getGenres() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('metadata');
    if (!sheet) {
      Logger.log('Warning: "metadata" sheet not found for dynamic genre list. Returning fallback list.');
      // Fallback to a static list if the sheet doesn't exist.
      return [
        'Techno', 'House', 'Ambient', 'Electro', 'Minimal', 'Deep House', 
        'Tech House', 'Electronica', 'Downtempo', 'IDM', 'Acid House', 'Bass', 
        'Classics', "Drum'n'Bass", 'Dub Techno', 'Experimental Techno', 'Hip Hop', 
        'Jazz', 'Jazz Pop', 'Krautrock', 'Leftfield', 'Lo-Fi', 'Modern Classical', 
        'Progressive House', 'R&B', 'Reggae', 'Trip Hop', 'Minimal / Deep Tech'
      ].sort();
    }
    
    const data = sheet.getRange("B:B").getValues(); // Read only column B
    const genres = new Set(); // Use a Set to automatically handle duplicates
    
    // Start from 1 to skip header row
    for (let i = 1; i < data.length; i++) {
      const genre = data[i][0];
      if (genre && String(genre).trim() !== '') {
        genres.add(String(genre).trim());
      }
    }
    
    Logger.log(`Dynamically loaded ${genres.size} official genres from the "metadata" sheet.`);
    return Array.from(genres).sort();
  }

  /**
   * Returns the list of official YOYAKU distributors (target values from column A).
   * This serves as the single source of truth for distributor validation.
   * Reads from the "distributor" sheet, column A (short identifiers - final values).
   * @returns {string[]} An array of official distributor identifiers.
   */
  static getDistributors() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('metadata');
    if (!sheet) {
      Logger.log('Warning: "metadata" sheet not found for dynamic distributor list. Returning fallback list.');
      // Fallback to a static list if the sheet doesn't exist.
      return [
        '324 records', '777 distribution', '777hz', 'above board', 'abstract architecture',
        'Acting press', 'albeit records', 'albums', 'Alien Communication', 'all ears'
      ].sort();
    }
    
    const data = sheet.getRange("A:A").getValues(); // Read column A (distributors)
    const distributors = new Set(); // Use a Set to automatically handle duplicates
    
    // Start from 1 to skip header row
    for (let i = 1; i < data.length; i++) {
      const distributor = data[i][0];
      if (distributor && String(distributor).trim() !== '') {
        distributors.add(String(distributor).trim());
      }
    }
    
        Logger.log(`Dynamically loaded ${distributors.size} official distributors from the "metadata" sheet column A.`);
    return Array.from(distributors).sort();
  }

  /**
   * Returns the distributor mapping from "taxonomy" sheet (B->A mapping).
   * This maps full company names (column B) to short identifiers (column A).
   * @returns {Object} Mapping object {fullName: shortId}
   */
  static getDistributorMapping() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('distributor');
    if (!sheet) {
      Logger.log('Warning: "distributor" sheet not found for mapping.');
      return {};
    }
    
    const data = sheet.getDataRange().getValues();
    const mapping = {};
    
    // Start from 1 to skip header row
    for (let i = 1; i < data.length; i++) {
      const shortId = data[i][0]; // Column A
      const fullName = data[i][1]; // Column B
      if (shortId && fullName) {
        const key = String(fullName).trim().toLowerCase();
        const value = String(shortId).trim();
        mapping[key] = value;
        Logger.log(`[getDistributorMapping] Mapping: '${fullName}' -> '${shortId}'`);
      }
    }
    
    Logger.log(`[getDistributorMapping] Loaded ${Object.keys(mapping).length} distributor mappings from distributor sheet.`);
    return mapping;
  }
  
  // ======================= SYSTÈME CONFIGURATION ======================= //
  static get TIMEOUTS() {
    return {
    SCRIPT_TIMEOUT_MARGIN: 330000, // 5.5 minutes (Google limit)
    MAX_IMPORT_TIMEOUT: 21600000,  // 6 hours
    INITIAL_DELAY: 30000,          // 30 seconds
    PROCESSING_INTERVAL: 5000,     // 5 seconds
    BETWEEN_RETRIES: 20000         // 20 seconds
    };
  }
  
  static get RETRY_CONFIG() {
    return {
    MAX_RETRIES: 5,
    MAX_PROCESSING_ATTEMPTS: 60,
    EXPONENTIAL_BACKOFF_BASE: 2
    };
  }
  
  // ======================= DRIVE CONFIGURATION ======================= //
  static get DRIVE() {
    return {
    FOLDER_ID: '1U40yqW27D9QdAD7oFqbSmxVaBFZ4pGtI',
    DATE_FORMAT: 'DD-MM-YYYY',
    FILE_NAMING: '{site}-{date}',
    MAX_FILE_SIZE: 10485760 // 10MB
    };
  }
  
  // ======================= SHEETS CONFIGURATION ======================= //
  static get SHEETS() {
    return {
    WP_IMPORT_NEW_PRODUCT: 'wp import new product',
    METADATA_CREATOR: 'metadata creator',
    METADATA: 'metadata',
    UPDATE_STOCK: 'update stock',
    SYSTEM_LOGS: 'System Logs'
    };
  }
  
  // ======================= CLOUDFLARE CONFIGURATION ======================= //
  static get CLOUDFLARE() {
    return {
    DASHBOARD_URL: 'https://dash.cloudflare.com/cbb7ae5bd746e79b573a3eb09b9f0b02/yoyaku.io',
    IP_SERVICES: [
      'https://api.ipify.org?format=text',
      'https://ipinfo.io/ip',
      'https://ifconfig.me/ip',
      'https://icanhazip.com'
    ]
    };
  }
  
  // ======================= USER AGENTS ROTATION ======================= //
  static get USER_AGENTS() {
    return [
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0'
    ];
  }
  
  // ======================= SECRETS MANAGEMENT ======================= //
  
  /**
   * Récupère la clé d'import WP depuis PropertiesService
   */
  static getImportKey() {
    return PropertiesService.getScriptProperties().getProperty('WP_IMPORT_KEY') || 'VXAf_v-w';
  }
  
  /**
   * Récupère l'URL du webhook Make.com
   */
  static getMakeWebhookUrl() {
    return PropertiesService.getScriptProperties().getProperty('MAKE_WEBHOOK_URL') || 
           'https://hook.eu2.make.com/vfl6tgunr9djqfy4aum2vzjm3fugu90j';
  }
  
  /**
   * Récupère les URLs des webhooks Pabbly
   */
  static getPabblyUrls() {
    return {
      stock: PropertiesService.getScriptProperties().getProperty('PABBLY_STOCK_URL') || 
             'https://connect.pabbly.com/workflow/sendwebhookdata/IjU3NjUwNTY1MDYzMDA0MzI1MjZlNTUzNjUxMzYi_pc',
      yyd: PropertiesService.getScriptProperties().getProperty('PABBLY_YYD_URL') || 
           'https://connect.pabbly.com/workflow/sendwebhookdata/IjU3NjUwNTY1MDYzMDA0MzI1MjY1NTUzNDUxM2Ii_pc',
      newProduct: PropertiesService.getScriptProperties().getProperty('PABBLY_NEW_PRODUCT_URL') || 
                  'https://connect.pabbly.com/workflow/sendwebhookdata/IjU3NjUwNTY1MDYzMDA0MzI1MjY1NTUzNDUxM2Ii_pc'
    };
  }
  
  /**
   * Récupère le token Cloudflare (si stocké)
   */
  static getCloudflareToken() {
    return PropertiesService.getScriptProperties().getProperty('CLOUDFLARE_TOKEN') || '';
  }
  
  // ======================= HELPERS POUR CONFIGURATION ======================= //
  
  /**
   * Récupère la configuration d'un site par nom
   */
  static getSiteConfig(siteName) {
    const siteKey = siteName.toUpperCase().replace(/[.-]/g, '_');
    return Config.SITES[siteKey] || null;
  }
  
  /**
   * Récupère l'URL WP-Load d'un site
   */
  static getSiteWpLoadUrl(siteName) {
    const config = Config.getSiteConfig(siteName);
    return config ? config.wpLoadUrl : null;
  }
  
  /**
   * Récupère un Import ID pour un site et type donnés
   */
  static getImportId(siteName, importType) {
    const config = Config.getSiteConfig(siteName);
    return config ? config.importIds[importType] : null;
  }
  
  /**
   * Vérifie si un site est protégé par Cloudflare
   */
  static isCloudflareProtected(siteName) {
    const config = Config.getSiteConfig(siteName);
    return config ? config.isCloudflareProtected : false;
  }
  
  /**
   * Récupère un User-Agent aléatoire
   */
  static getRandomUserAgent() {
    return Config.USER_AGENTS[Math.floor(Math.random() * Config.USER_AGENTS.length)];
  }
  
  // ======================= SETUP INITIAL DES SECRETS ======================= //
  
  /**
   * Configuration initiale des secrets (à exécuter une seule fois)
   * Cette fonction doit être exécutée manuellement depuis l'éditeur Google Apps Script
   */
  static setupSecrets() {
    const properties = PropertiesService.getScriptProperties();
    
    // Définir tous les secrets
    const secrets = {
      'WP_IMPORT_KEY': 'VXAf_v-w',
      'MAKE_WEBHOOK_URL': 'https://hook.eu2.make.com/vfl6tgunr9djqfy4aum2vzjm3fugu90j',
      'PABBLY_STOCK_URL': 'https://connect.pabbly.com/workflow/sendwebhookdata/IjU3NjUwNTY1MDYzMDA0MzI1MjZlNTUzNjUxMzYi_pc',
      'PABBLY_YYD_URL': 'https://connect.pabbly.com/workflow/sendwebhookdata/IjU3NjUwNTY1MDYzMDA0MzI1MjY1NTUzNDUxM2Ii_pc',
      'PABBLY_NEW_PRODUCT_URL': 'https://connect.pabbly.com/workflow/sendwebhookdata/IjU3NjUwNTY1MDYzMDA0MzI1MjY1NTUzNDUxM2Ii_pc',
      'CLOUDFLARE_TOKEN': '' // À remplir si nécessaire
    };
    
    properties.setProperties(secrets);
    
    Logger.log('[Config] Secrets configurés avec succès dans PropertiesService');
    console.log('✅ Configuration des secrets terminée');
  }
  
  /**
   * Affiche la configuration actuelle (pour debugging)
   */
  static showCurrentConfig() {
    const config = {
      version: Config.VERSION,
      importKey: Config.getImportKey(),
      makeUrl: Config.getMakeWebhookUrl(),
      pabblyUrls: Config.getPabblyUrls(),
      cloudflareToken: Config.getCloudflareToken(),
      allSites: Config.SITES,
      allTimeouts: Config.TIMEOUTS
    };
    Logger.log('[Config] Configuration actuelle: ' + JSON.stringify(config, null, 2));
    return config;
  }
  
  /**
   * Teste la validité de la configuration
   */
  static validateConfig() {
    const issues = [];
    
    // Vérifier les secrets
    if (!Config.getImportKey() || Config.getImportKey() === '') {
      issues.push('WP_IMPORT_KEY manquant');
    }
    
    if (!Config.getMakeWebhookUrl() || !Config.getMakeWebhookUrl().startsWith('https://')) {
      issues.push('MAKE_WEBHOOK_URL invalide');
    }
    
    // Vérifier les sites
    Object.keys(Config.SITES).forEach(siteKey => {
      const site = Config.SITES[siteKey];
      if (!site.wpLoadUrl || !site.wpLoadUrl.startsWith('https://')) {
        issues.push(`URL invalide pour le site ${site.name}`);
      }
    });
    
    if (issues.length > 0) {
      Logger.logError('[Config] Problèmes de configuration détectés: ' + issues.join(', '));
      console.error('❌ Problèmes de configuration:', issues);
      return { valid: false, issues: issues };
    }
    
    Logger.log('[Config] Configuration valide ✅');
    console.log('✅ Configuration valide');
    return { valid: true, issues: [] };
  }

  /**
   * Initialisation de la configuration (appelée au démarrage si nécessaire)
   */
  static init() {
    Logger.log('[Config] Initialisation de la configuration...');
    if (!PropertiesService.getScriptProperties().getProperty('WP_IMPORT_KEY')) {
      Config.setupSecrets();
    }
    Logger.log('[Config] Configuration initialisée avec succès');
  }
}

// ======================= FONCTIONS GLOBALES DE CONFIGURATION ======================= //

/**
 * Fonction d'initialisation de la configuration (à appeler au démarrage)
 */
function initializeConfig() {
  Logger.log('[Config] Initialisation de la configuration...');
  
  const validation = Config.validateConfig();
  if (!validation.valid) {
    const message = 'Configuration invalide: ' + validation.issues.join(', ');
    Logger.logError('[Config] ' + message);
    throw new Error(message);
  }
  
  Logger.log('[Config] Configuration initialisée avec succès');
  return true;
}

/**
 * Fonction utilitaire pour récupérer rapidement une configuration de site
 */
function getSiteConfig(siteName) {
  return Config.getSiteConfig(siteName);
}

/**
 * Fonction utilitaire pour construire une URL d'import complète
 */
function buildImportUrl(siteName, importType, action = 'trigger') {
  Logger.log(`[buildImportUrl] DEBUG: siteName='${siteName}', importType='${importType}', action='${action}'`);
  
  const config = Config.getSiteConfig(siteName);
  Logger.log(`[buildImportUrl] DEBUG: config found = ${config ? 'YES' : 'NO'}`);
  if (config) {
    Logger.log(`[buildImportUrl] DEBUG: config.wpLoadUrl='${config.wpLoadUrl}'`);
    Logger.log(`[buildImportUrl] DEBUG: config.importIds=${JSON.stringify(config.importIds)}`);
  }
  
  if (!config) {
    throw new Error(`Configuration introuvable pour le site: ${siteName}`);
  }
  
  const importId = config.importIds[importType];
  Logger.log(`[buildImportUrl] DEBUG: importId for '${importType}' = '${importId}'`);
  if (!importId) {
    throw new Error(`Import ID introuvable pour ${siteName} - ${importType}`);
  }
  
  const importKey = Config.getImportKey();
  Logger.log(`[buildImportUrl] DEBUG: importKey='${importKey}'`);
  const timestamp = Date.now();
  const random = Math.random();
  
  const finalUrl = `${config.wpLoadUrl}?import_key=${importKey}&import_id=${importId}&action=${action}&hpos=1&nocache=${timestamp}&rand=${random}`;
  Logger.log(`[buildImportUrl] DEBUG: Final URL='${finalUrl}'`);
  
  return finalUrl;
} 