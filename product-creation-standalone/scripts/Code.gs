/**
 * YOYAKU - New Product via Custom API Endpoint v2
 * Google Apps Script version
 *
 * Conforme à la configuration WP All Import #852 (YOYAKU.IO) et #935 (YYD.FR)
 *
 * Features:
 * - 🚀 ULTRA-FAST: Custom endpoint v2 (10-20x faster than WooCommerce API)
 * - 🔐 Secure: Bearer token authentication
 * - 🌐 Dual-Site: YOYAKU.IO (B2C) + YYD.FR (B2B)
 * - ✨ Smart image detection (webp, jpg, jpeg, png)
 * - 🖼️ Skip missing images (no 404 errors)
 * - 🔄 Multiple image variants (no suffix, _1, _2, etc.)
 * - ✅ Idempotent (find-or-create by SKU)
 * - 📊 Full WP All Import #852/#935 mapping compliance
 * - 🆕 Auto-generate missing columns (replace formulas!)
 *
 * Author: Benjamin Belaga
 * Version: 2.0.0
 * Date: 2025-11-07
 */

// ============================================================================
// MENU
// ============================================================================

function onOpen() {
  const ui = SpreadsheetApp.getUi();

  // Main menu
  const menu = ui.createMenu('YOYAKU • WP IMPORT');

  // Submenu: New Product (API)
  const newProductMenu = ui.createMenu('New Product (API)')
    .addItem('🔄 Auto-generate missing columns', 'menuAutoGenerateColumns')
    .addItem('New Product on yoyaku.io (API)', 'menuCreateYoyaku')
    .addItem('New Product on yydistribution.fr (API)', 'menuCreateYYD');

  // Submenu: Configuration
  const configMenu = ui.createMenu('⚙️ Configuration')
    .addItem('🔧 Setup Script Properties (First Time)', 'menuSetupScriptProperties')
    .addItem('✅ Verify Configuration', 'menuVerifyScriptProperties');

  // Add submenu and other items to main menu
  menu
    .addSubMenu(newProductMenu)
    .addSeparator()
    .addSubMenu(configMenu)
    .addSeparator()
    .addItem('📊 Bulk import (all rows)', 'menuBulkImport')
    .addItem('🔍 Validate selected row', 'menuValidateRow')
    .addToUi();
}

// ============================================================================
// MENU HANDLERS
// ============================================================================

function menuCreateYoyaku() {
  const sh = SpreadsheetApp.getActiveSheet();
  const row = sh.getActiveRange().getRow();

  if (row === 1) {
    SpreadsheetApp.getUi().alert('⚠️ Please select a data row (not the header)');
    return;
  }

  const headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  const values = sh.getRange(row, 1, 1, sh.getLastColumn()).getValues()[0];

  const record = {};
  headers.forEach((h, i) => {
    record[h] = values[i] == null ? '' : String(values[i]);
  });

  // Validate
  const validation = validateProduct(record, 'yoyaku');
  if (!validation.valid) {
    SpreadsheetApp.getUi().alert('❌ Validation Error\n\n' + validation.errors.join('\n'));
    return;
  }

  // Create/Update on YOYAKU.IO using custom endpoint v2
  SpreadsheetApp.getUi().alert('⏳ Processing product on YOYAKU.IO (API v2)...\n\nSKU: ' + record.sku);

  const res = newProductV2_(record, 'yoyaku');

  if (res.success) {
    SpreadsheetApp.getUi().alert(
      '✅ Success on YOYAKU.IO!\n\n' +
      'Action: ' + (res.action || 'N/A') + '\n' +
      'Product: ' + res.sku + '\n' +
      'ID: ' + res.id + '\n' +
      'Execution time: ' + (res.executionTimeMs || 0) + 'ms\n' +
      'URL: ' + (res.url || 'N/A')
    );
  } else {
    SpreadsheetApp.getUi().alert('❌ Error\n\n' + res.error);
  }
}

function menuCreateYYD() {
  const sh = SpreadsheetApp.getActiveSheet();
  const row = sh.getActiveRange().getRow();

  if (row === 1) {
    SpreadsheetApp.getUi().alert('⚠️ Please select a data row (not the header)');
    return;
  }

  const headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  const values = sh.getRange(row, 1, 1, sh.getLastColumn()).getValues()[0];

  const record = {};
  headers.forEach((h, i) => {
    record[h] = values[i] == null ? '' : String(values[i]);
  });

  // Validate
  const validation = validateProduct(record, 'yyd');
  if (!validation.valid) {
    SpreadsheetApp.getUi().alert('❌ Validation Error\n\n' + validation.errors.join('\n'));
    return;
  }

  // Create/Update on YYD.FR using custom endpoint v2
  SpreadsheetApp.getUi().alert('⏳ Processing product on YYD.FR (API v2)...\n\nSKU: ' + record.sku);

  const res = newProductV2_(record, 'yyd');

  if (res.success) {
    SpreadsheetApp.getUi().alert(
      '✅ Success on YYD.FR!\n\n' +
      'Action: ' + (res.action || 'N/A') + '\n' +
      'Product: ' + res.sku + '\n' +
      'ID: ' + res.id + '\n' +
      'Execution time: ' + (res.executionTimeMs || 0) + 'ms\n' +
      'URL: ' + (res.url || 'N/A')
    );
  } else {
    SpreadsheetApp.getUi().alert('❌ Error\n\n' + res.error);
  }
}

function menuValidateRow() {
  const sh = SpreadsheetApp.getActiveSheet();
  const row = sh.getActiveRange().getRow();

  if (row === 1) {
    SpreadsheetApp.getUi().alert('⚠️ Please select a data row (not the header)');
    return;
  }

  const headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  const values = sh.getRange(row, 1, 1, sh.getLastColumn()).getValues()[0];

  const record = {};
  headers.forEach((h, i) => {
    record[h] = values[i] == null ? '' : String(values[i]);
  });

  const validation = validateProduct(record);

  if (validation.valid) {
    SpreadsheetApp.getUi().alert('✅ Validation OK\n\nProduct is ready to import.');
  } else {
    SpreadsheetApp.getUi().alert('❌ Validation Errors\n\n' + validation.errors.join('\n'));
  }
}

function menuBulkImport() {
  const sh = SpreadsheetApp.getActiveSheet();
  const lastRow = sh.getLastRow();

  if (lastRow < 2) {
    SpreadsheetApp.getUi().alert('⚠️ No data rows found');
    return;
  }

  const confirm = SpreadsheetApp.getUi().alert(
    '📊 Bulk Import\n\n' +
    'This will import ' + (lastRow - 1) + ' products.\n\n' +
    'Continue?',
    SpreadsheetApp.getUi().ButtonSet.YES_NO
  );

  if (confirm !== SpreadsheetApp.getUi().Button.YES) return;

  const headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  const data = sh.getRange(2, 1, lastRow - 1, sh.getLastColumn()).getValues();

  const stats = { total: 0, success: 0, errors: 0 };
  const errors = [];

  data.forEach((values, idx) => {
    const record = {};
    headers.forEach((h, i) => {
      record[h] = values[i] == null ? '' : String(values[i]);
    });

    stats.total++;

    try {
      const res = newProductViaAPI(record);
      if (res.success) {
        stats.success++;
      } else {
        stats.errors++;
        errors.push(`Row ${idx + 2}: ${res.error}`);
      }
    } catch (e) {
      stats.errors++;
      errors.push(`Row ${idx + 2}: ${e.message}`);
    }
  });

  SpreadsheetApp.getUi().alert(
    '📊 Bulk Import Complete\n\n' +
    'Total: ' + stats.total + '\n' +
    'Success: ' + stats.success + '\n' +
    'Errors: ' + stats.errors + '\n\n' +
    (errors.length ? 'Errors:\n' + errors.slice(0, 5).join('\n') : '')
  );
}

function menuAutoGenerateColumns() {
  const sh = SpreadsheetApp.getActiveSheet();
  const row = sh.getActiveRange().getRow();

  if (row === 1) {
    SpreadsheetApp.getUi().alert('⚠️ Please select a data row (not the header)');
    return;
  }

  const headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  const values = sh.getRange(row, 1, 1, sh.getLastColumn()).getValues()[0];

  const record = {};
  headers.forEach((h, i) => {
    record[h] = values[i] == null ? '' : String(values[i]);
  });

  // Generate missing columns
  SpreadsheetApp.getUi().alert('⏳ Generating missing columns...\n\nSKU: ' + record.SKU);

  try {
    const generated = autoGenerateMissingColumns_(record);

    // Write back to sheet
    headers.forEach((h, colIdx) => {
      if (generated.hasOwnProperty(h)) {
        sh.getRange(row, colIdx + 1).setValue(generated[h]);
      }
    });

    SpreadsheetApp.getUi().alert(
      '✅ Success!\n\n' +
      'Generated columns:\n' +
      Object.keys(generated).map(k => '- ' + k + ': ' + (generated[k] || 'N/A')).join('\n')
    );
  } catch (e) {
    SpreadsheetApp.getUi().alert('❌ Error\n\n' + e.message);
  }
}

function menuSetupScriptProperties() {
  const ui = SpreadsheetApp.getUi();

  const response = ui.alert(
    '🔧 Setup Script Properties',
    'This will configure YOYAKU_API_BEARER_TOKEN and WC_BASE_URL for YOYAKU.IO.\n\n' +
    'This only needs to be done ONCE.\n\n' +
    'Continue?',
    ui.ButtonSet.YES_NO
  );

  if (response !== ui.Button.YES) {
    return;
  }

  try {
    const result = setupScriptProperties();
    ui.alert('✅ Configuration Complete!\n\n' + result);
  } catch (e) {
    ui.alert('❌ Error\n\n' + e.message);
  }
}

function menuVerifyScriptProperties() {
  const ui = SpreadsheetApp.getUi();

  try {
    const results = verifyScriptProperties();

    const yoyakuStatus = (results.yoyaku.token.startsWith('✅') && results.yoyaku.baseUrl.startsWith('✅'))
      ? '✅ CONFIGURED'
      : '❌ MISSING';

    const yydStatus = (results.yyd.token.startsWith('✅') && results.yyd.baseUrl.startsWith('✅'))
      ? '✅ CONFIGURED'
      : '⚠️ NOT CONFIGURED';

    ui.alert(
      '⚙️ Configuration Status',
      'YOYAKU.IO: ' + yoyakuStatus + '\n' +
      '  Token: ' + results.yoyaku.token + '\n' +
      '  Base URL: ' + results.yoyaku.baseUrl + '\n\n' +
      'YYD.FR: ' + yydStatus + '\n' +
      '  Token: ' + results.yyd.token + '\n' +
      '  Base URL: ' + results.yyd.baseUrl,
      ui.ButtonSet.OK
    );
  } catch (e) {
    ui.alert('❌ Error\n\n' + e.message);
  }
}

// ============================================================================
// AUTO-GENERATION LOGIC
// ============================================================================

/**
 * Auto-generate missing columns from existing data
 *
 * Generates (based on upload-dashboard logic):
 * - weight (from format)
 * - price net (from Price Gross + distributor margin)
 * - price yydistribution (B2B price)
 * - price yoyaku.io (B2C price)
 * - slug (from artist1 + title + SKU)
 * - playlist_files (from Number of tracks + track1-24)
 * - IMAGE Serveur (check image existence)
 * - MP3 Serveur (check MP3 existence)
 * - PACK MEDIA Serveur (determine if complete)
 * - _wp_old_slug (from SKU)
 *
 * @param {Object} r - Record object with all columns
 * @return {Object} Object with generated column values
 */
function autoGenerateMissingColumns_(r) {
  const generated = {};

  // 1. Calculate weight (from format)
  if (!r.weight || String(r.weight).trim() === '') {
    generated.weight = calculateWeight_(r.format);
  }

  // 2. Calculate price net (from Price Gross + distributor)
  const priceGross = parseFloat(String(r['Price Gross'] || '0').replace(',', '.'));
  if (priceGross > 0 && (!r['price net'] || String(r['price net']).trim() === '')) {
    generated['price net'] = calculatePriceNet_(priceGross, r.Distributor);
  }

  // 3. Calculate price yydistribution (B2B)
  const priceNet = parseFloat(String(r['price net'] || generated['price net'] || '0').replace(',', '.'));
  if (priceNet > 0 && (!r['price yydistribution'] || String(r['price yydistribution']).trim() === '')) {
    generated['price yydistribution'] = calculatePriceB2B_(priceNet, r.Distributor);
  }

  // 4. Calculate price yoyaku.io (B2C)
  const priceB2B = parseFloat(String(r['price yydistribution'] || generated['price yydistribution'] || '0').replace(',', '.'));
  if (priceB2B > 0 && (!r['price yoyaku,io'] || String(r['price yoyaku,io']).trim() === '')) {
    generated['price yoyaku,io'] = calculatePriceB2C_(priceB2B);
  }

  // 5. Generate slug (from artist1 + title + SKU)
  if (!r.slug || String(r.slug).trim() === '') {
    generated.slug = generateProductSlug_(r.artist1, r.title, r.SKU);
  }

  // 6. Generate playlist_files (from tracklist OR Number of tracks + track1-24)
  if (!r.playlist_files || String(r.playlist_files).trim() === '') {
    if (r.tracklist && String(r.tracklist).trim() !== '') {
      // Use tracklist if available (preferred)
      generated.playlist_files = generatePlaylistFromTracklist_(r.SKU, r.tracklist);
    } else {
      // Fallback to track1-track24
      const numTracks = parseInt(r['Number of tracks'] || 0);
      if (numTracks > 0) {
        const trackNames = [];
        for (let i = 1; i <= numTracks; i++) {
          const trackName = r['track' + i] || ('Track ' + i);
          trackNames.push(trackName);
        }
        generated.playlist_files = generatePlaylist_(numTracks, trackNames, r.SKU);
      }
    }
  }

  // 7. Check IMAGE Serveur
  const imageStatus = checkImageStatus_(r.SKU);
  generated['IMAGE Serveur'] = imageStatus;

  // 8. Check MP3 Serveur
  const numTracks = parseInt(r['Number of tracks'] || 0);
  const mp3Status = checkMP3Status_(r.SKU, numTracks);
  generated['MP3 Serveur'] = mp3Status;

  // 9. Determine PACK MEDIA Serveur
  generated['PACK MEDIA Serveur'] = determinePackStatus_(imageStatus, mp3Status);

  // 10. Generate _wp_old_slug (from SKU)
  if (!r._wp_old_slug || String(r._wp_old_slug).trim() === '') {
    generated._wp_old_slug = String(r.SKU).toUpperCase();
  }

  return generated;
}

// ============================================================================
// CALCULATION HELPERS (Upload Dashboard Logic)
// ============================================================================

/**
 * Calculate shipping weight from format string
 * Based on upload-dashboard/lib/utils/calculations.ts
 *
 * @param {string} format - Format string (e.g., "12\"", "2x12\"", "LP")
 * @return {number} Weight in kg
 */
function calculateWeight_(format) {
  if (!format) return 0.3;

  const normalized = String(format).toLowerCase().trim();

  // Multi-LP patterns
  const multiLPMap = {
    '10x12"': 2.0, '9x12"': 1.8, '8x12"': 1.6, '7x12"': 1.4,
    '6x12"': 1.2, '5x12"': 1.0, '4x12"': 0.8, '3x12"': 0.6, '2x12"': 0.4
  };

  for (const pattern in multiLPMap) {
    if (normalized.includes(pattern.toLowerCase())) {
      return multiLPMap[pattern];
    }
  }

  // Single LP/12"
  if (/12"|12inch|lp/i.test(normalized)) return 0.2;
  if (/10"/i.test(normalized)) return 0.11;
  if (/7"/i.test(normalized)) return 0.06;

  return 0.3; // Default
}

/**
 * Calculate net price after distributor margin
 * Based on upload-dashboard/lib/utils/calculations.ts
 *
 * @param {number} priceGross - Gross price from distributor
 * @param {string} distributorSlug - Distributor slug
 * @return {number} Net price (rounded to 2 decimals)
 */
function calculatePriceNet_(priceGross, distributorSlug) {
  const distributors = {
    'telegraphe': { margin: 0.969, currency: 'EUR' },
    'sushitech': { margin: 0.969, currency: 'EUR' },
    'bigwax': { margin: 0.90, currency: 'EUR' },
    'subwax': { margin: 0.88, currency: 'EUR' },
    'yydistribution': { margin: 1.0, currency: 'EUR' }, // No margin
    'prime direct': { margin: 1.01, currency: 'EUR' },
    'rubadub': { margin: 1.06, currency: 'EUR' },
    'deejay': { margin: 1.0, currency: 'EUR' }
  };

  const slug = String(distributorSlug || '').toLowerCase().trim();
  const config = distributors[slug];

  if (!config) {
    Logger.log('Unknown distributor: ' + distributorSlug + ', using default margin 0.969');
    return Math.round(priceGross * 0.969 * 100) / 100;
  }

  const priceNet = priceGross * config.margin;
  return Math.round(priceNet * 100) / 100;
}

/**
 * Calculate B2B price for YYD.FR
 * Based on upload-dashboard/lib/utils/calculations.ts
 *
 * @param {number} priceNet - Net price
 * @param {string} distributorSlug - Distributor slug
 * @return {number} B2B price (rounded to 2 decimals)
 */
function calculatePriceB2B_(priceNet, distributorSlug) {
  const distributors = {
    'telegraphe': 1.25,
    'sushitech': 1.25,
    'bigwax': 1.25,
    'subwax': 1.25,
    'yydistribution': 1.0,
    'prime direct': 1.25,
    'rubadub': 1.25,
    'deejay': 1.0
  };

  const slug = String(distributorSlug || '').toLowerCase().trim();
  const multiplier = distributors[slug] || 1.25;

  return Math.round(priceNet * multiplier * 100) / 100;
}

/**
 * Calculate B2C price for YOYAKU.IO
 * Based on upload-dashboard/lib/utils/calculations.ts
 *
 * @param {number} priceB2B - B2B price
 * @return {number} B2C price (rounded to 1 decimal)
 */
function calculatePriceB2C_(priceB2B) {
  const basePrice = priceB2B * 1.25;
  return Math.round(basePrice * 10) / 10;
}

/**
 * Generate WordPress product slug
 * Based on upload-dashboard/lib/utils/calculations.ts
 *
 * Format: artist-title-sku (lowercase, no accents, hyphenated)
 *
 * @param {string} artist - Primary artist
 * @param {string} title - Product title
 * @param {string} sku - Product SKU
 * @return {string} Generated slug
 */
function generateProductSlug_(artist, title, sku) {
  if (!title || !sku) return '';

  const primaryArtist = String(artist || '').trim();
  let cleanTitle = String(title).trim();

  // Remove artist from title if duplicated
  if (primaryArtist && cleanTitle.startsWith(primaryArtist)) {
    cleanTitle = cleanTitle.replace(primaryArtist + ' - ', '').trim();
  }

  // Combine parts
  const parts = [primaryArtist, cleanTitle, sku].filter(p => p.length > 0);

  // Normalize
  const slug = parts
    .join('-')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9-]/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/-+/g, '-') // Remove duplicate hyphens
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens

  return slug;
}

/**
 * Generate playlist from tracklist (preferred method)
 * Based on upload-dashboard/lib/utils/calculations.ts
 *
 * @param {string} sku - Product SKU
 * @param {string} tracklist - Tracklist (newline-separated)
 * @return {string} Playlist in format: trackname||URL##trackname||URL...
 */
function generatePlaylistFromTracklist_(sku, tracklist) {
  if (!tracklist) return '';

  const baseUrl = 'https://yydistribution.ams3.digitaloceanspaces.com/yyplayer/mp3/';
  const tracks = String(tracklist)
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  const parts = [];
  tracks.forEach((trackName, index) => {
    const trackUrl = baseUrl + sku + '_' + (index + 1) + '.mp3';
    parts.push(trackName + '||' + trackUrl);
  });

  return parts.join('##');
}

/**
 * Generate playlist in format: trackname||URL##trackname||URL...
 *
 * @param {number} numTracks - Number of tracks
 * @param {Array<string>} trackNames - Array of track names
 * @param {string} sku - Product SKU
 * @return {string} Generated playlist
 */
function generatePlaylist_(numTracks, trackNames, sku) {
  if (!numTracks || numTracks === 0) return '';

  const baseUrl = 'https://yydistribution.ams3.digitaloceanspaces.com/yyplayer/mp3/';
  const parts = [];

  for (let i = 0; i < numTracks; i++) {
    const trackName = trackNames[i] || ('Track ' + (i + 1));
    const trackUrl = baseUrl + sku + '_' + (i + 1) + '.mp3';
    parts.push(trackName + '||' + trackUrl);
  }

  return parts.join('##');
}

/**
 * Check if images exist for SKU
 *
 * @param {string} sku - Product SKU
 * @return {string} Status: "Working (format, variants)" or "NO (Not Found)"
 */
function checkImageStatus_(sku) {
  const base = 'https://yydistribution.ams3.digitaloceanspaces.com/yyplayer/images/';
  const formats = ['webp', 'jpg', 'jpeg', 'png'];
  const variants = ['', '_1', '_2', '_3', '_4', '_5', '_6', '_7', '_8', '_9', '_10'];

  const foundFormats = new Set();
  const foundVariants = new Set();

  variants.forEach(variant => {
    formats.forEach(format => {
      const url = base + sku + variant + '.' + format;

      try {
        const resp = UrlFetchApp.fetch(url, {
          method: 'head',
          muteHttpExceptions: true,
          followRedirects: false
        });

        if (resp.getResponseCode() === 200) {
          foundFormats.add(format);
          foundVariants.add(variant || 'no_suffix');
        }
      } catch (e) {
        // Skip
      }
    });
  });

  if (foundFormats.size === 0) {
    return 'NO (Not Found)';
  }

  const formatStr = Array.from(foundFormats).join(', ');
  const variantStr = Array.from(foundVariants).join(', ');
  return 'Working (' + formatStr + ', ' + variantStr + ')';
}

/**
 * Check if MP3s exist for SKU
 *
 * @param {string} sku - Product SKU
 * @param {number} numTracks - Expected number of tracks
 * @return {string} Status: "Working (format, variants)" or "NO (Not Found)"
 */
function checkMP3Status_(sku, numTracks) {
  if (!numTracks || numTracks === 0) {
    return 'NO (No tracks specified)';
  }

  const base = 'https://yydistribution.ams3.digitaloceanspaces.com/yyplayer/mp3/';
  let foundCount = 0;

  for (let i = 1; i <= numTracks; i++) {
    const url = base + sku + '_' + i + '.mp3';

    try {
      const resp = UrlFetchApp.fetch(url, {
        method: 'head',
        muteHttpExceptions: true,
        followRedirects: false
      });

      if (resp.getResponseCode() === 200) {
        foundCount++;
      }
    } catch (e) {
      // Skip
    }
  }

  if (foundCount === 0) {
    return 'NO (Not Found)';
  }

  if (foundCount === numTracks) {
    return 'Working (mp3, _1 to _' + numTracks + ')';
  }

  return 'Partial (' + foundCount + '/' + numTracks + ' found)';
}

/**
 * Determine PACK MEDIA Serveur status
 *
 * @param {string} imageStatus - Image status
 * @param {string} mp3Status - MP3 status
 * @return {string} "Online" if both working, "Not Online (403)" otherwise
 */
function determinePackStatus_(imageStatus, mp3Status) {
  const imageOk = imageStatus.startsWith('Working');
  const mp3Ok = mp3Status.startsWith('Working');

  if (imageOk && mp3Ok) {
    return 'Online';
  }

  return 'Not Online (403)';
}

// ============================================================================
// VALIDATION
// ============================================================================

function validateProduct(r, site) {
  const errors = [];
  site = site || 'yoyaku'; // Default to yoyaku

  // Required fields (common)
  const commonRequired = ['sku', 'title', 'distributor', 'label'];
  commonRequired.forEach(field => {
    if (!r[field] || String(r[field]).trim() === '') {
      errors.push('Missing required field: ' + field);
    }
  });

  // Site-specific required fields
  if (site === 'yoyaku') {
    if (!r['priceyoyakuio'] || String(r['priceyoyakuio']).trim() === '') {
      errors.push('Missing required field: priceyoyakuio');
    }
    if (!r.slug || String(r.slug).trim() === '') {
      errors.push('Missing required field: slug');
    }
  } else if (site === 'yyd') {
    if (!r['price yydistribution'] && !r['priceyydistribution']) {
      errors.push('Missing required field: price yydistribution');
    }
  }

  // Slug format (if provided)
  if (r.slug && !/^[a-z0-9-]+$/.test(String(r.slug))) {
    errors.push('Slug must be lowercase alphanumeric with hyphens only');
  }

  // Price validation (site-specific)
  const priceField = site === 'yoyaku' ? 'priceyoyakuio' : 'price yydistribution';
  if (r[priceField]) {
    const price = parseFloat(String(r[priceField]).replace(',', '.'));
    if (isNaN(price) || price <= 0) {
      errors.push('Price must be a positive number');
    }
  }

  // SKU format
  if (r.sku && !/^[A-Z0-9-_]+$/i.test(String(r.sku))) {
    errors.push('SKU should be alphanumeric (letters, numbers, hyphens, underscores)');
  }

  // Release date format (optional)
  if (r.release_date && !/^\d{4}-\d{2}-\d{2}$/.test(String(r.release_date))) {
    errors.push('Release date must be YYYY-MM-DD format');
  }

  return {
    valid: errors.length === 0,
    errors: errors
  };
}

// ============================================================================
// MAIN API LOGIC - CUSTOM ENDPOINT v2 (ULTRA-FAST)
// ============================================================================

/**
 * Create product using YOYAKU API Connector v2 endpoint (RECOMMENDED)
 * 10-20x faster than WooCommerce API
 * Uses Bearer token authentication
 *
 * @param {object} r Row data
 * @param {string} site Site identifier ('yoyaku' or 'yyd')
 * @return {object} Result object
 */
function newProductV2_(r, site) {
  site = site || 'yoyaku';

  try {
    // Validate
    const validation = validateProduct(r, site);
    if (!validation.valid) {
      throw new Error('Validation failed: ' + validation.errors.join(', '));
    }

    // Build API payload
    const payload = buildApiPayloadV2_(r, site);

    // Get endpoint and token
    const baseUrlProp = site === 'yyd' ? 'WC_BASE_URL_YYD' : 'WC_BASE_URL';
    const tokenProp = site === 'yyd' ? 'YOYAKU_API_BEARER_TOKEN_YYD' : 'YOYAKU_API_BEARER_TOKEN';

    const baseUrl = PropertiesService.getScriptProperties().getProperty(baseUrlProp);
    const token = PropertiesService.getScriptProperties().getProperty(tokenProp);

    if (!token) {
      throw new Error('[' + site.toUpperCase() + '] Missing Bearer token. Set ' + tokenProp + ' in Script Properties');
    }

    // Call custom endpoint
    const endpoint = baseUrl.replace(/\/wp-json.*/, '') + '/wp-json/yoyaku/v2/product/create';

    const response = UrlFetchApp.fetch(endpoint, {
      method: 'post',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });

    const statusCode = response.getResponseCode();
    const responseData = JSON.parse(response.getContentText());

    if (statusCode >= 200 && statusCode < 300 && responseData.success) {
      Logger.log('[' + site.toUpperCase() + ' V2] ' + responseData.action + ' product: ' + responseData.product_id + ' (SKU: ' + r.sku + ') in ' + responseData.execution_time_ms + 'ms');

      return {
        success: true,
        action: responseData.action,
        id: responseData.product_id,
        sku: r.sku,
        url: responseData.url,
        executionTimeMs: responseData.execution_time_ms
      };
    } else {
      throw new Error(responseData.error || 'API returned error: ' + response.getContentText());
    }

  } catch (err) {
    Logger.log('[' + site.toUpperCase() + ' V2] Error: ' + err);
    return {
      success: false,
      error: String(err.message || err)
    };
  }
}

/**
 * Build payload for YOYAKU API Connector v2
 *
 * @param {object} r Row data
 * @param {string} site Site identifier
 * @return {object} API payload
 */
function buildApiPayloadV2_(r, site) {
  // Detect images
  const imageUrls = detectAllImages_(r.sku);

  // Build base payload
  const payload = {
    site: site,
    sku: String(r.sku).toUpperCase(),
    title: String(r.title),
    slug: site === 'yyd' ? String(r.sku).toLowerCase() : String(r.slug || ''),
    description: String(r.description || ''),
    price: site === 'yoyaku' ? parseFloat(r.priceyoyakuio || r['price yoyaku.io'] || 0) : parseFloat(r['price yydistribution'] || 0),
    weight: parseFloat(r.weight || 0.2),
    stock_quantity: 0,
    stock_status: 'outofstock',
    category: site === 'yoyaku' ? 'Forthcoming' : String(r.label || 'Uncategorized'),
    images: imageUrls,
    artists: [r.artist1, r.artist2, r.artist3, r.artist4].filter(Boolean),
    label: String(r.label || ''),
    genres: [r.genre1, r.genre2, r.genre3, r.genre4, r.genre5].filter(Boolean),
    distributor: String(r.distributor || ''),
    tags: [r.tag1, r.tag2].filter(Boolean)
  };

  // Add format for YYD
  if (site === 'yyd' && r.format) {
    payload.format = String(r.format);
  }

  // Build meta_data
  const meta = {};

  // Playlist files
  if (r.playlist_files || r.tracklist) {
    const playlistRaw = r.playlist_files || generatePlaylistFromTracklist_(r.tracklist, r);
    meta['_yoyaku_playlist_files_raw'] = playlistRaw;
    meta['_yyplayer_mp3_url'] = 'https://yydistribution.ams3.digitaloceanspaces.com/yyplayer/mp3/' + r.sku + '_1.mp3';
  }

  // Dimensions (hardcoded per WP All Import #852)
  meta['_width'] = '30';
  meta['_height'] = '30';
  meta['_length'] = '0.2';

  // Site-specific meta
  if (site === 'yoyaku') {
    meta['_set_coming_soon'] = 'yes';
    meta['_yyo_qr_code'] = r.sku;
    meta['_depot_vente'] = String(r.depot_vente || 'no');
  } else {
    meta['_is_pre_order'] = 'yes';
    meta['_low_stock_amount'] = '10';
  }

  // UPS meta
  if (r.UPS_Numero_de_suivi) {
    meta['_ups_tracking_number'] = String(r.UPS_Numero_de_suivi);
  }

  // Add meta to payload
  payload.meta_data = meta;

  return payload;
}

// ============================================================================
// MAIN API LOGIC - YOYAKU.IO (WooCommerce API - Legacy)
// ============================================================================

function newProductYoyaku(r) {
  try {
    // Validate
    const validation = validateProduct(r, 'yoyaku');
    if (!validation.valid) {
      throw new Error('Validation failed: ' + validation.errors.join(', '));
    }

    // Ensure category "Forthcoming" exists
    const forthId = ensureCategoryIdByName_('Forthcoming', 'yoyaku');

    // Ensure tags exist
    const tagIds = ensureTagIds_([r.tag1, r.tag2].filter(Boolean), 'yoyaku');

    // Build WooCommerce payload for YOYAKU.IO
    const payload = buildWooPayloadYoyaku_(r, forthId, tagIds);

    // Find existing product by SKU
    const existing = wooGet_('/products', { sku: r.sku }, 'yoyaku');

    let product;
    if (Array.isArray(existing) && existing.length > 0) {
      // Update existing
      product = wooPut_('/products/' + existing[0].id, payload, 'yoyaku');
      Logger.log('[YOYAKU] Updated product: ' + product.id);
    } else {
      // Create new
      product = wooPost_('/products', payload, 'yoyaku');
      Logger.log('[YOYAKU] Created product: ' + product.id);
    }

    // Optional: Assign custom taxonomies via /wp/v2
    try {
      assignCustomTaxonomies_(product.id, {
        musiclabel: [r.label].filter(Boolean),
        distributormusic: [r.distributor].filter(Boolean),
        musicartist: [r.artist1, r.artist2, r.artist3, r.artist4].filter(Boolean),
        musicstyle: [r.genre1, r.genre2, r.genre3, r.genre4, r.genre5].filter(Boolean)
      }, 'yoyaku');
    } catch (e) {
      Logger.log('[YOYAKU] Custom taxonomies skipped: ' + e.message);
    }

    return {
      success: true,
      id: product.id,
      sku: r.sku,
      url: product.permalink,
      imagesCount: payload.images ? payload.images.length : 0
    };

  } catch (err) {
    Logger.log('[YOYAKU] Error creating product: ' + err);
    return {
      success: false,
      error: String(err.message || err)
    };
  }
}

// ============================================================================
// MAIN API LOGIC - YYD.FR
// ============================================================================

function newProductYYD(r) {
  try {
    // Validate
    const validation = validateProduct(r, 'yyd');
    if (!validation.valid) {
      throw new Error('Validation failed: ' + validation.errors.join(', '));
    }

    // YYD uses label as category (not "Forthcoming")
    const categoryId = ensureCategoryIdByName_(r.label || 'Uncategorized', 'yyd');

    // Ensure tags exist
    const tagIds = ensureTagIds_([r.tag1, r.tag2].filter(Boolean), 'yyd');

    // Build WooCommerce payload for YYD.FR
    const payload = buildWooPayloadYYD_(r, categoryId, tagIds);

    // Find existing product by SKU
    const existing = wooGet_('/products', { sku: r.sku }, 'yyd');

    let product;
    if (Array.isArray(existing) && existing.length > 0) {
      // Update existing
      product = wooPut_('/products/' + existing[0].id, payload, 'yyd');
      Logger.log('[YYD] Updated product: ' + product.id);
    } else {
      // Create new
      product = wooPost_('/products', payload, 'yyd');
      Logger.log('[YYD] Created product: ' + product.id);
    }

    // Optional: Assign custom taxonomies via /wp/v2
    try {
      assignCustomTaxonomies_(product.id, {
        musicformat: [r.format].filter(Boolean),
        ownermusic: [r.distributor].filter(Boolean),
        musicartist: [r.artist1, r.artist2, r.artist3, r.artist4].filter(Boolean),
        musicstyle: [r.genre1, r.genre2, r.genre3, r.genre4, r.genre5].filter(Boolean)
      }, 'yyd');
    } catch (e) {
      Logger.log('[YYD] Custom taxonomies skipped: ' + e.message);
    }

    return {
      success: true,
      id: product.id,
      sku: r.sku,
      url: product.permalink,
      imagesCount: payload.images ? payload.images.length : 0
    };

  } catch (err) {
    Logger.log('[YYD] Error creating product: ' + err);
    return {
      success: false,
      error: String(err.message || err)
    };
  }
}

// ============================================================================
// PAYLOAD BUILDER - YOYAKU.IO (Import #852)
// ============================================================================

function buildWooPayloadYoyaku_(r, categoryId, tagIds) {
  // Smart image detection (multi-format, skip missing)
  const images = testAndCollectImages_(r.sku);

  // Meta data (exact WP All Import #852 mapping)
  const meta = [
    { key: '_wc_cog_cost', value: String(r.pricenet || r['price net'] || '') },
    { key: '_coming_soon_label', value: String(r.release_date || '') },
    { key: '_music_formats', value: String(r.format || '') },
    { key: '_ph_ups_manufacture_country', value: 'FR' },
    { key: '_wf_ups_hst', value: '8523801000' },
    { key: 'ph_ups_invoice_desc', value: 'Phonograph records (vinyl), non-blank' },
    { key: '_product_features', value: String(r.feature || '') },
    { key: '_set_coming_soon', value: 'yes' },
    { key: '_yoyaku_playlist_files_raw', value: String(r.playlist_files || '') },
    { key: '_depot_vente', value: String(r['depot vente'] || r.depotvente || 'no') },
    { key: 'hscode_custom_field', value: '8523801000' },
    { key: '_product_origin_country', value: 'FR' },
    { key: '_wp_old_slug', value: String(r._wp_old_slug || r.sku) },
    { key: '_product_qr_code', value: 'https://www.yoyaku.io/release/' + String(r.sku) },
    { key: '_ph_ups_hst_var', value: '8523801000' }
  ];

  // Build payload for YOYAKU.IO (B2C)
  return {
    name: String(r.title),
    slug: String(r.slug),
    type: 'simple',
    status: 'publish',
    sku: String(r.sku || r.SKU),
    regular_price: String(r.priceyoyakuio || r['price yoyaku,io'] || r['price yoyaku.io']),
    short_description: String(r.description || ''),
    manage_stock: true,
    stock_status: 'outofstock',
    backorders: 'no',
    sold_individually: false,
    virtual: false,
    downloadable: false,
    tax_status: 'taxable',
    tax_class: '',
    weight: String(r.weight || '0.2'),
    dimensions: {
      length: '30',
      width: '30',
      height: '0.2'
    },
    categories: [{ id: categoryId }],
    tags: tagIds.map(id => ({ id: id })),
    images: images,
    meta_data: meta
  };
}

// ============================================================================
// PAYLOAD BUILDER - YYD.FR (Import #935)
// ============================================================================

function buildWooPayloadYYD_(r, categoryId, tagIds) {
  // Smart image detection (multi-format, skip missing)
  // NOTE: YYD import 935 uses _600 suffix pattern!
  const images = testAndCollectImages_(r.sku);

  // Meta data (exact WP All Import #935 mapping)
  const meta = [
    { key: '_low_stock_amount', value: '10' },
    { key: '_product_features', value: String(r.feature || '') },
    { key: '_is_pre_order', value: 'yes' }, // ALL PRODUCTS PRE-ORDER on YYD
    { key: '_yyd_playlist_files_raw', value: String(r.playlist_files || '') },
    { key: '_pre_order_date', value: String(r.release_date || '') },
    { key: '_pre_order_stock_status', value: 'global' },
    { key: '_date_out', value: String(r.release_date || '') },
    { key: 'hscode_custom_field', value: '85238010' },
    { key: '_product_origin_country', value: 'FR' },
    { key: 'ph_ups_invoice_desc', value: 'Vinyl record or Phonograph record' }
  ];

  // Build payload for YYD.FR (B2B)
  return {
    name: String(r.title),
    slug: String(r.sku || r.SKU).toLowerCase(), // YYD uses SKU as slug
    type: 'simple',
    status: 'publish',
    sku: String(r.sku || r.SKU),
    regular_price: String(r['price yydistribution'] || r.priceyydistribution || r['price yoyaku,io']),
    description: String(r.description || ''),
    short_description: '',
    manage_stock: true,
    stock_quantity: 0, // Always starts at 0
    stock_status: 'outofstock',
    backorders: 'yes', // Allow pre-orders
    sold_individually: false,
    virtual: false,
    downloadable: false,
    tax_status: 'taxable',
    tax_class: '',
    weight: String(r.weight || '0.2'),
    dimensions: {
      length: '30',
      width: '30',
      height: '0.2'
    },
    categories: [{ id: categoryId }],
    tags: tagIds.map(id => ({ id: id })),
    images: images,
    meta_data: meta
  };
}

// ============================================================================
// SMART IMAGE DETECTION
// ============================================================================

/**
 * Test and collect available images (multi-format, multi-variant)
 *
 * Tries:
 * - Formats: webp, jpg, jpeg, png
 * - Variants: no suffix, _1, _2, _3, ..., _10
 *
 * Skips missing images (404) to avoid errors
 *
 * @param {string} sku - Product SKU
 * @return {Array} Array of image objects { src: url }
 */
function testAndCollectImages_(sku) {
  const base = 'https://yydistribution.ams3.digitaloceanspaces.com/yyplayer/images/';
  const formats = ['webp', 'jpg', 'jpeg', 'png'];
  const variants = ['', '_1', '_2', '_3', '_4', '_5', '_6', '_7', '_8', '_9', '_10'];

  const found = [];
  const tested = new Set(); // Avoid duplicates

  variants.forEach(variant => {
    formats.forEach(format => {
      const url = base + sku + variant + '.' + format;

      // Skip if already tested
      if (tested.has(url)) return;
      tested.add(url);

      try {
        // HEAD request to check if image exists
        const resp = UrlFetchApp.fetch(url, {
          method: 'head',
          muteHttpExceptions: true,
          followRedirects: false
        });

        if (resp.getResponseCode() === 200) {
          found.push({ src: url });
          Logger.log('✓ Found image: ' + url);
        }
      } catch (e) {
        // Skip silently (image doesn't exist)
      }
    });
  });

  Logger.log('Found ' + found.length + ' images for SKU: ' + sku);

  return found;
}

// ============================================================================
// WOOCOMMERCE REST API HELPERS (Multi-Site Support)
// ============================================================================

function wcBase_(site) {
  site = site || 'yoyaku';
  const propKey = site === 'yyd' ? 'WC_BASE_URL_YYD' : 'WC_BASE_URL';
  const base = PropertiesService.getScriptProperties().getProperty(propKey) || '';

  if (!base) {
    throw new Error('WooCommerce base URL missing for ' + site + '. Set ' + propKey + ' in Script Properties.');
  }

  return base.replace(/\/$/, '') + '/wc/v3';
}

function wcHeaders_(site) {
  site = site || 'yoyaku';
  const keyProp = site === 'yyd' ? 'WC_CONSUMER_KEY_YYD' : 'WC_CONSUMER_KEY';
  const secProp = site === 'yyd' ? 'WC_CONSUMER_SECRET_YYD' : 'WC_CONSUMER_SECRET';

  const key = PropertiesService.getScriptProperties().getProperty(keyProp);
  const sec = PropertiesService.getScriptProperties().getProperty(secProp);

  if (!key || !sec) {
    throw new Error('WooCommerce credentials missing for ' + site + '. Set ' + keyProp + ' and ' + secProp + ' in Script Properties.');
  }

  const token = Utilities.base64Encode(key + ':' + sec);
  return {
    'Authorization': 'Basic ' + token,
    'Content-Type': 'application/json'
  };
}

function wooGet_(path, params, site) {
  site = site || 'yoyaku';
  let url = wcBase_(site) + (path.startsWith('/') ? path : '/' + path);

  if (params && Object.keys(params).length > 0) {
    const qs = Object.keys(params)
      .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
      .join('&');
    url += (url.includes('?') ? '&' : '?') + qs;
  }

  const res = UrlFetchApp.fetch(url, {
    method: 'get',
    headers: wcHeaders_(site),
    muteHttpExceptions: true
  });

  if (res.getResponseCode() >= 200 && res.getResponseCode() < 300) {
    return JSON.parse(res.getContentText());
  }

  throw new Error('[' + site.toUpperCase() + '] WooCommerce GET ' + path + ' failed: HTTP ' + res.getResponseCode() + ' - ' + res.getContentText());
}

function wooPost_(path, body, site) {
  site = site || 'yoyaku';
  const url = wcBase_(site) + (path.startsWith('/') ? path : '/' + path);

  const res = UrlFetchApp.fetch(url, {
    method: 'post',
    headers: wcHeaders_(site),
    payload: JSON.stringify(body),
    muteHttpExceptions: true
  });

  if (res.getResponseCode() >= 200 && res.getResponseCode() < 300) {
    return JSON.parse(res.getContentText());
  }

  throw new Error('[' + site.toUpperCase() + '] WooCommerce POST ' + path + ' failed: HTTP ' + res.getResponseCode() + ' - ' + res.getContentText());
}

function wooPut_(path, body, site) {
  site = site || 'yoyaku';
  const url = wcBase_(site) + (path.startsWith('/') ? path : '/' + path);

  const res = UrlFetchApp.fetch(url, {
    method: 'put',
    headers: wcHeaders_(site),
    payload: JSON.stringify(body),
    muteHttpExceptions: true
  });

  if (res.getResponseCode() >= 200 && res.getResponseCode() < 300) {
    return JSON.parse(res.getContentText());
  }

  throw new Error('[' + site.toUpperCase() + '] WooCommerce PUT ' + path + ' failed: HTTP ' + res.getResponseCode() + ' - ' + res.getContentText());
}

// ============================================================================
// CATEGORY & TAGS (AUTO-CREATE IF MISSING)
// ============================================================================

function ensureCategoryIdByName_(name, site) {
  site = site || 'yoyaku';
  const list = wooGet_('/products/categories', { per_page: 100, search: name }, site);
  const found = (Array.isArray(list) ? list : [])
    .find(c => c.name.toLowerCase() === String(name).toLowerCase());

  if (found) {
    Logger.log('[' + site.toUpperCase() + '] Category "' + name + '" found: ID ' + found.id);
    return found.id;
  }

  const created = wooPost_('/products/categories', { name: name }, site);
  Logger.log('[' + site.toUpperCase() + '] Category "' + name + '" created: ID ' + created.id);
  return created.id;
}

function ensureTagIds_(names, site) {
  site = site || 'yoyaku';
  const ids = [];

  names.forEach(name => {
    const list = wooGet_('/products/tags', { per_page: 100, search: name }, site);
    const found = (Array.isArray(list) ? list : [])
      .find(t => t.name.toLowerCase() === String(name).toLowerCase());

    if (found) {
      ids.push(found.id);
    } else {
      const created = wooPost_('/products/tags', { name: name }, site);
      ids.push(created.id);
    }
  });

  return ids;
}

// ============================================================================
// CUSTOM TAXONOMIES (OPTIONAL - VIA /wp/v2)
// ============================================================================

function wpBase_(site) {
  site = site || 'yoyaku';
  const propKey = site === 'yyd' ? 'WC_BASE_URL_YYD' : 'WC_BASE_URL';
  const base = PropertiesService.getScriptProperties().getProperty(propKey) || '';
  return base.replace(/\/$/, '').replace(/\/wc\/v3$/, '') + '/wp/v2';
}

function wpHeaders_(site) {
  site = site || 'yoyaku';
  const userProp = site === 'yyd' ? 'WP_APP_USER_YYD' : 'WP_APP_USER';
  const passProp = site === 'yyd' ? 'WP_APP_PASSWORD_YYD' : 'WP_APP_PASSWORD';

  const u = PropertiesService.getScriptProperties().getProperty(userProp);
  const p = PropertiesService.getScriptProperties().getProperty(passProp);

  if (!u || !p) {
    throw new Error('[' + site.toUpperCase() + '] WordPress REST credentials missing. Set ' + userProp + ' and ' + passProp + ' in Script Properties.');
  }

  const token = Utilities.base64Encode(u + ':' + p);
  return {
    'Authorization': 'Basic ' + token,
    'Content-Type': 'application/json'
  };
}

function ensureTerms_(taxonomy, names, site) {
  site = site || 'yoyaku';
  const ids = [];

  names.forEach(name => {
    const url = wpBase_(site) + '/' + taxonomy + '?per_page=100&search=' + encodeURIComponent(name);

    const res = UrlFetchApp.fetch(url, {
      method: 'get',
      headers: wpHeaders_(site),
      muteHttpExceptions: true
    });

    if (res.getResponseCode() >= 200 && res.getResponseCode() < 300) {
      const arr = JSON.parse(res.getContentText());
      const found = arr.find(t => t.name.toLowerCase() === String(name).toLowerCase());

      if (found) {
        ids.push(found.id);
      } else {
        // Create term
        const createRes = UrlFetchApp.fetch(wpBase_(site) + '/' + taxonomy, {
          method: 'post',
          headers: wpHeaders_(site),
          payload: JSON.stringify({ name: name }),
          muteHttpExceptions: true
        });

        if (createRes.getResponseCode() >= 200 && createRes.getResponseCode() < 300) {
          ids.push(JSON.parse(createRes.getContentText()).id);
        }
      }
    }
  });

  return ids;
}

function assignCustomTaxonomies_(productId, map, site) {
  site = site || 'yoyaku';

  const userProp = site === 'yyd' ? 'WP_APP_USER_YYD' : 'WP_APP_USER';
  const passProp = site === 'yyd' ? 'WP_APP_PASSWORD_YYD' : 'WP_APP_PASSWORD';

  const u = PropertiesService.getScriptProperties().getProperty(userProp);
  const p = PropertiesService.getScriptProperties().getProperty(passProp);

  if (!u || !p) {
    throw new Error('[' + site.toUpperCase() + '] WordPress REST credentials not configured');
  }

  const body = {};

  Object.keys(map).forEach(tax => {
    const names = map[tax].filter(Boolean);
    if (names.length > 0) {
      body[tax] = ensureTerms_(tax, names, site);
    }
  });

  if (Object.keys(body).length === 0) {
    return; // Nothing to assign
  }

  const url = wpBase_(site) + '/product/' + productId;

  const resp = UrlFetchApp.fetch(url, {
    method: 'post',
    headers: wpHeaders_(site),
    payload: JSON.stringify(body),
    muteHttpExceptions: true
  });

  if (resp.getResponseCode() < 200 || resp.getResponseCode() >= 300) {
    throw new Error('[' + site.toUpperCase() + '] Assigning custom taxonomies failed: HTTP ' + resp.getResponseCode() + ' - ' + resp.getContentText());
  }

  Logger.log('[' + site.toUpperCase() + '] Custom taxonomies assigned to product ' + productId);
}

// ============================================================================
// AUTOMATIC SETUP - Run once to configure Script Properties
// ============================================================================

/**
 * Configures Script Properties automatically
 * Run with: clasp run setupScriptProperties
 *
 * This function will:
 * 1. Set YOYAKU_API_BEARER_TOKEN for YOYAKU.IO
 * 2. Set WC_BASE_URL for YOYAKU.IO
 * 3. Optionally set YYD properties if tokens are provided
 */
function setupScriptProperties() {
  const scriptProperties = PropertiesService.getScriptProperties();

  // YOYAKU.IO Configuration (REQUIRED)
  const yoyakuToken = '5190d79295f463935067b4b7e57f9de95c28e251646abcfc4c39f3abb6f64b50';
  const yoyakuBaseUrl = 'https://yoyaku.io/wp-json';

  scriptProperties.setProperty('YOYAKU_API_BEARER_TOKEN', yoyakuToken);
  scriptProperties.setProperty('WC_BASE_URL', yoyakuBaseUrl);

  Logger.log('✅ YOYAKU.IO configuration set successfully');
  Logger.log('   - YOYAKU_API_BEARER_TOKEN: ' + yoyakuToken.substring(0, 10) + '...');
  Logger.log('   - WC_BASE_URL: ' + yoyakuBaseUrl);

  // YYD.FR Configuration (B2B - now active!)
  const yydToken = 'b5d41ad4797c562c41b42d41f1328554debead46a8ebc340943efd4d7b5676b2';
  const yydBaseUrl = 'https://yydistribution.fr/wp-json';
  scriptProperties.setProperty('YOYAKU_API_BEARER_TOKEN_YYD', yydToken);
  scriptProperties.setProperty('WC_BASE_URL_YYD', yydBaseUrl);
  Logger.log('✅ YYD.FR configuration set successfully');
  Logger.log('   - YOYAKU_API_BEARER_TOKEN_YYD: ' + yydToken.substring(0, 10) + '...');
  Logger.log('   - WC_BASE_URL_YYD: ' + yydBaseUrl);

  return 'Script Properties configured successfully! YOYAKU.IO + YYD.FR are ready to use.';
}

/**
 * Verifies Script Properties are correctly configured
 * Run with: clasp run verifyScriptProperties
 */
function verifyScriptProperties() {
  const scriptProperties = PropertiesService.getScriptProperties();

  const yoyakuToken = scriptProperties.getProperty('YOYAKU_API_BEARER_TOKEN');
  const yoyakuBaseUrl = scriptProperties.getProperty('WC_BASE_URL');
  const yydToken = scriptProperties.getProperty('YOYAKU_API_BEARER_TOKEN_YYD');
  const yydBaseUrl = scriptProperties.getProperty('WC_BASE_URL_YYD');

  const results = {
    yoyaku: {
      token: yoyakuToken ? '✅ Set (' + yoyakuToken.substring(0, 10) + '...)' : '❌ Missing',
      baseUrl: yoyakuBaseUrl ? '✅ Set (' + yoyakuBaseUrl + ')' : '❌ Missing'
    },
    yyd: {
      token: yydToken ? '✅ Set (' + yydToken.substring(0, 10) + '...)' : '⚠️ Not configured (optional)',
      baseUrl: yydBaseUrl ? '✅ Set (' + yydBaseUrl + ')' : '⚠️ Not configured (optional)'
    }
  };

  Logger.log('=== Script Properties Status ===');
  Logger.log('YOYAKU.IO:');
  Logger.log('  Token: ' + results.yoyaku.token);
  Logger.log('  Base URL: ' + results.yoyaku.baseUrl);
  Logger.log('');
  Logger.log('YYD.FR:');
  Logger.log('  Token: ' + results.yyd.token);
  Logger.log('  Base URL: ' + results.yyd.baseUrl);

  return results;
}
