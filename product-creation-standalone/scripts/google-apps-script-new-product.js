/**
 * YOYAKU - New Product via WooCommerce REST API
 * Google Apps Script version
 *
 * Conforme à la configuration WP All Import #852
 *
 * Features:
 * - Smart image detection (webp, jpg, jpeg, png)
 * - Skip missing images (no 404 errors)
 * - Multiple image variants (no suffix, _1, _2, etc.)
 * - Idempotent (find-or-create by SKU)
 * - Full WP All Import #852 mapping compliance
 * - Optional custom taxonomies via /wp/v2
 *
 * Author: Benjamin Belaga
 * Version: 1.0.0
 * Date: 2025-11-07
 */

// ============================================================================
// MENU
// ============================================================================

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('YOYAKU • WP IMPORT')
    .addItem('✅ Create/Update selected product', 'menuCreateSelected')
    .addItem('📊 Bulk import (all rows)', 'menuBulkImport')
    .addItem('🔍 Validate selected row', 'menuValidateRow')
    .addToUi();
}

// ============================================================================
// MENU HANDLERS
// ============================================================================

function menuCreateSelected() {
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
  const validation = validateProduct(record);
  if (!validation.valid) {
    SpreadsheetApp.getUi().alert('❌ Validation Error\n\n' + validation.errors.join('\n'));
    return;
  }

  // Create/Update
  SpreadsheetApp.getUi().alert('⏳ Processing product...\n\nSKU: ' + record.sku);

  const res = newProductViaAPI(record);

  if (res.success) {
    SpreadsheetApp.getUi().alert(
      '✅ Success!\n\n' +
      'Product: ' + res.sku + '\n' +
      'ID: ' + res.id + '\n' +
      'Images found: ' + (res.imagesCount || 0) + '\n' +
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

// ============================================================================
// VALIDATION
// ============================================================================

function validateProduct(r) {
  const errors = [];

  // Required fields
  const required = ['sku', 'title', 'slug', 'distributor', 'label', 'priceyoyakuio'];
  required.forEach(field => {
    if (!r[field] || String(r[field]).trim() === '') {
      errors.push('Missing required field: ' + field);
    }
  });

  // Slug format
  if (r.slug && !/^[a-z0-9-]+$/.test(String(r.slug))) {
    errors.push('Slug must be lowercase alphanumeric with hyphens only');
  }

  // Price validation
  if (r.priceyoyakuio) {
    const price = parseFloat(r.priceyoyakuio);
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
// MAIN API LOGIC
// ============================================================================

function newProductViaAPI(r) {
  try {
    // Validate
    const validation = validateProduct(r);
    if (!validation.valid) {
      throw new Error('Validation failed: ' + validation.errors.join(', '));
    }

    // Ensure category "Forthcoming" exists
    const forthId = ensureCategoryIdByName_('Forthcoming');

    // Ensure tags exist
    const tagIds = ensureTagIds_([r.tag1, r.tag2].filter(Boolean));

    // Build WooCommerce payload
    const payload = buildWooPayloadFromRow_(r, forthId, tagIds);

    // Find existing product by SKU
    const existing = wooGet_('/products', { sku: r.sku });

    let product;
    if (Array.isArray(existing) && existing.length > 0) {
      // Update existing
      product = wooPut_('/products/' + existing[0].id, payload);
      Logger.log('Updated product: ' + product.id);
    } else {
      // Create new
      product = wooPost_('/products', payload);
      Logger.log('Created product: ' + product.id);
    }

    // Optional: Assign custom taxonomies via /wp/v2
    try {
      assignCustomTaxonomies_(product.id, {
        musiclabel: [r.label].filter(Boolean),
        distributormusic: [r.distributor].filter(Boolean),
        musicartist: [r.artist1, r.artist2, r.artist3, r.artist4].filter(Boolean),
        musicstyle: [r.genre1, r.genre2, r.genre3, r.genre4, r.genre5].filter(Boolean)
      });
    } catch (e) {
      Logger.log('Custom taxonomies skipped: ' + e.message);
    }

    return {
      success: true,
      id: product.id,
      sku: r.sku,
      url: product.permalink,
      imagesCount: payload.images ? payload.images.length : 0
    };

  } catch (err) {
    Logger.log('Error creating product: ' + err);
    return {
      success: false,
      error: String(err.message || err)
    };
  }
}

// ============================================================================
// PAYLOAD BUILDER (WP ALL IMPORT #852 COMPLIANCE)
// ============================================================================

function buildWooPayloadFromRow_(r, categoryId, tagIds) {
  // Smart image detection (multi-format, skip missing)
  const images = testAndCollectImages_(r.sku);

  // Meta data (exact WP All Import #852 mapping)
  const meta = [
    { key: '_wc_cog_cost', value: String(r.pricenet || '') },
    { key: '_coming_soon_label', value: String(r.release_date || '') },
    { key: '_music_formats', value: String(r.format || '') },
    { key: '_ph_ups_manufacture_country', value: 'FR' },
    { key: '_wf_ups_hst', value: '8523801000' },
    { key: 'ph_ups_invoice_desc', value: 'Phonograph records (vinyl), non-blank' },
    { key: '_product_features', value: String(r.feature || '') },
    { key: '_set_coming_soon', value: 'yes' },
    { key: '_yoyaku_playlist_files_raw', value: String(r.playlist_files || '') },
    { key: '_depot_vente', value: String(r.depotvente || 'no') },
    { key: 'hscode_custom_field', value: '8523801000' },
    { key: '_product_origin_country', value: 'FR' },
    { key: '_wp_old_slug', value: String(r.sku) },
    { key: '_product_qr_code', value: 'https://www.yoyaku.io/release/' + String(r.sku) },
    { key: '_ph_ups_hst_var', value: '8523801000' }
  ];

  // Build payload
  return {
    name: String(r.title),
    slug: String(r.slug),
    type: 'simple',
    status: 'publish',
    sku: String(r.sku),
    regular_price: String(r.priceyoyakuio),
    short_description: String(r.description || ''),
    manage_stock: true,
    stock_status: 'outofstock',
    backorders: 'no',
    sold_individually: false,
    virtual: false,
    downloadable: false,
    tax_status: 'taxable',
    tax_class: '',
    weight: String(r.weight || ''),
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
      const url = base + sku + variant + '_600.' + format;

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
// WOOCOMMERCE REST API HELPERS
// ============================================================================

function wcBase_() {
  const base = PropertiesService.getScriptProperties().getProperty('WC_BASE_URL') || '';
  return base.replace(/\/$/, '') + '/wc/v3';
}

function wcHeaders_() {
  const key = PropertiesService.getScriptProperties().getProperty('WC_CONSUMER_KEY');
  const sec = PropertiesService.getScriptProperties().getProperty('WC_CONSUMER_SECRET');

  if (!key || !sec) {
    throw new Error('WooCommerce credentials missing. Set WC_CONSUMER_KEY and WC_CONSUMER_SECRET in Script Properties.');
  }

  const token = Utilities.base64Encode(key + ':' + sec);
  return {
    'Authorization': 'Basic ' + token,
    'Content-Type': 'application/json'
  };
}

function wooGet_(path, params) {
  let url = wcBase_() + (path.startsWith('/') ? path : '/' + path);

  if (params && Object.keys(params).length > 0) {
    const qs = Object.keys(params)
      .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
      .join('&');
    url += (url.includes('?') ? '&' : '?') + qs;
  }

  const res = UrlFetchApp.fetch(url, {
    method: 'get',
    headers: wcHeaders_(),
    muteHttpExceptions: true
  });

  if (res.getResponseCode() >= 200 && res.getResponseCode() < 300) {
    return JSON.parse(res.getContentText());
  }

  throw new Error('WooCommerce GET ' + path + ' failed: HTTP ' + res.getResponseCode() + ' - ' + res.getContentText());
}

function wooPost_(path, body) {
  const url = wcBase_() + (path.startsWith('/') ? path : '/' + path);

  const res = UrlFetchApp.fetch(url, {
    method: 'post',
    headers: wcHeaders_(),
    payload: JSON.stringify(body),
    muteHttpExceptions: true
  });

  if (res.getResponseCode() >= 200 && res.getResponseCode() < 300) {
    return JSON.parse(res.getContentText());
  }

  throw new Error('WooCommerce POST ' + path + ' failed: HTTP ' + res.getResponseCode() + ' - ' + res.getContentText());
}

function wooPut_(path, body) {
  const url = wcBase_() + (path.startsWith('/') ? path : '/' + path);

  const res = UrlFetchApp.fetch(url, {
    method: 'put',
    headers: wcHeaders_(),
    payload: JSON.stringify(body),
    muteHttpExceptions: true
  });

  if (res.getResponseCode() >= 200 && res.getResponseCode() < 300) {
    return JSON.parse(res.getContentText());
  }

  throw new Error('WooCommerce PUT ' + path + ' failed: HTTP ' + res.getResponseCode() + ' - ' + res.getContentText());
}

// ============================================================================
// CATEGORY & TAGS (AUTO-CREATE IF MISSING)
// ============================================================================

function ensureCategoryIdByName_(name) {
  const list = wooGet_('/products/categories', { per_page: 100, search: name });
  const found = (Array.isArray(list) ? list : [])
    .find(c => c.name.toLowerCase() === String(name).toLowerCase());

  if (found) {
    Logger.log('Category "' + name + '" found: ID ' + found.id);
    return found.id;
  }

  const created = wooPost_('/products/categories', { name: name });
  Logger.log('Category "' + name + '" created: ID ' + created.id);
  return created.id;
}

function ensureTagIds_(names) {
  const ids = [];

  names.forEach(name => {
    const list = wooGet_('/products/tags', { per_page: 100, search: name });
    const found = (Array.isArray(list) ? list : [])
      .find(t => t.name.toLowerCase() === String(name).toLowerCase());

    if (found) {
      ids.push(found.id);
    } else {
      const created = wooPost_('/products/tags', { name: name });
      ids.push(created.id);
    }
  });

  return ids;
}

// ============================================================================
// CUSTOM TAXONOMIES (OPTIONAL - VIA /wp/v2)
// ============================================================================

function wpBase_() {
  const base = PropertiesService.getScriptProperties().getProperty('WC_BASE_URL') || '';
  return base.replace(/\/$/, '').replace(/\/wc\/v3$/, '') + '/wp/v2';
}

function wpHeaders_() {
  const u = PropertiesService.getScriptProperties().getProperty('WP_APP_USER');
  const p = PropertiesService.getScriptProperties().getProperty('WP_APP_PASSWORD');

  if (!u || !p) {
    throw new Error('WordPress REST credentials missing. Set WP_APP_USER and WP_APP_PASSWORD in Script Properties.');
  }

  const token = Utilities.base64Encode(u + ':' + p);
  return {
    'Authorization': 'Basic ' + token,
    'Content-Type': 'application/json'
  };
}

function ensureTerms_(taxonomy, names) {
  const ids = [];

  names.forEach(name => {
    const url = wpBase_() + '/' + taxonomy + '?per_page=100&search=' + encodeURIComponent(name);

    const res = UrlFetchApp.fetch(url, {
      method: 'get',
      headers: wpHeaders_(),
      muteHttpExceptions: true
    });

    if (res.getResponseCode() >= 200 && res.getResponseCode() < 300) {
      const arr = JSON.parse(res.getContentText());
      const found = arr.find(t => t.name.toLowerCase() === String(name).toLowerCase());

      if (found) {
        ids.push(found.id);
      } else {
        // Create term
        const createRes = UrlFetchApp.fetch(wpBase_() + '/' + taxonomy, {
          method: 'post',
          headers: wpHeaders_(),
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

function assignCustomTaxonomies_(productId, map) {
  const u = PropertiesService.getScriptProperties().getProperty('WP_APP_USER');
  const p = PropertiesService.getScriptProperties().getProperty('WP_APP_PASSWORD');

  if (!u || !p) {
    throw new Error('WordPress REST credentials not configured');
  }

  const body = {};

  Object.keys(map).forEach(tax => {
    const names = map[tax].filter(Boolean);
    if (names.length > 0) {
      body[tax] = ensureTerms_(tax, names);
    }
  });

  if (Object.keys(body).length === 0) {
    return; // Nothing to assign
  }

  const url = wpBase_() + '/product/' + productId;

  const resp = UrlFetchApp.fetch(url, {
    method: 'post',
    headers: wpHeaders_(),
    payload: JSON.stringify(body),
    muteHttpExceptions: true
  });

  if (resp.getResponseCode() < 200 || resp.getResponseCode() >= 300) {
    throw new Error('Assigning custom taxonomies failed: HTTP ' + resp.getResponseCode() + ' - ' + resp.getContentText());
  }

  Logger.log('Custom taxonomies assigned to product ' + productId);
}
