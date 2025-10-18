// ============================================
// 📊 FETCH DATA API - Update Stock Sheet
// ============================================
// Retrieves current product data from WooCommerce API
// and populates the "update stock" sheet with live data
// ============================================

/**
 * Fetch current stock data from WooCommerce API
 * Populates sheet "update stock" with live product data
 *
 * Columns populated:
 * - A: Image (=IMAGE(Z) formula)
 * - G: Depot Vente (_depot_vente custom field)
 * - H: Current Stock (stock_quantity)
 * - J: Initial Quantity Origin (_initial_quantity custom field)
 * - K: Stock Status (stock_status)
 * - T: Quantity Shelf (yid_total_shelf custom field)
 * - U: Total Preorders (_total_preorders custom field - HPOS real-time calculation)
 * - Z: Image URL (raw URL from WooCommerce API)
 */
function fetchDataAPIUpdateStock() {
  const ui = SpreadsheetApp.getUi();
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('update stock');

  if (!sheet) {
    ui.alert('❌ Error', 'Sheet "update stock" not found!', ui.ButtonSet.OK);
    return;
  }

  // Confirm action
  const result = ui.alert(
    '📊 Fetch Data from WooCommerce API',
    'This will fetch current product data from YOYAKU.IO and populate the sheet.\n\n' +
    '✅ Data retrieved:\n' +
    '• Product Image\n' +
    '• Current Stock\n' +
    '• Stock Status\n' +
    '• Depot Vente\n' +
    '• Initial Quantity\n' +
    '• Quantity Shelf\n' +
    '• Total Preorders\n\n' +
    'Continue?',
    ui.ButtonSet.YES_NO
  );

  if (result !== ui.Button.YES) return;

  SpreadsheetApp.getActiveSpreadsheet().toast('🔄 Fetching product data...', 'Processing', -1);

  try {
    // Get sheet data
    const data = sheet.getDataRange().getValues();
    const headers = data[0];

    // Find column indices
    const skuIndex = headers.findIndex(h => h.toString().toUpperCase() === 'SKU');

    if (skuIndex === -1) {
      ui.alert('❌ Error', 'SKU column not found!', ui.ButtonSet.OK);
      return;
    }

    // Column indices for data population
    const imageCol = 0;        // A: Image formula =IMAGE(Z)
    const depotVenteCol = 6;   // G: Depot Vente
    const currentStockCol = 7; // H: Current Stock
    const initialQtyCol = 9;   // J: Initial Quantity Origin
    const stockStatusCol = 10; // K: Stock Status
    const shelfQtyCol = 19;    // T: Quantity Shelf (column 20 = index 19)
    const totalPreordersCol = 20; // U: Total Preorders (column 21 = index 20)
    const imageUrlCol = 25;    // Z: Image URL (column 26 = index 25)

    // API Configuration
    const API_BASE = 'https://www.yoyaku.io/wp-json/wc/v3';
    const API_KEY = 'ck_f66f25feeabe4c509dcbc0a41d1b4379f5f4ab74';
    const API_SECRET = 'cs_6a23c0ec55570d2f51d0abf11e83a8e81d1d789b';
    const authHeader = 'Basic ' + Utilities.base64Encode(API_KEY + ':' + API_SECRET);

    // Process each row
    let successCount = 0;
    let errorCount = 0;
    const errorDetails = [];

    for (let i = 1; i < data.length; i++) {
      const sku = data[i][skuIndex];

      // Skip empty SKUs
      if (!sku || sku === '' || sku === '#N/A' || sku.toString().trim() === '') {
        continue;
      }

      try {
        // Search product by SKU
        const searchUrl = `${API_BASE}/products?sku=${encodeURIComponent(sku.toString().trim())}`;
        const searchOptions = {
          method: 'get',
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json'
          },
          muteHttpExceptions: true
        };

        const searchResponse = UrlFetchApp.fetch(searchUrl, searchOptions);
        const searchData = JSON.parse(searchResponse.getContentText());

        if (searchData.length === 0) {
          errorCount++;
          errorDetails.push({
            row: i + 1,
            sku: sku,
            error: 'Product not found'
          });
          continue;
        }

        const product = searchData[0];

        // IMPORTANT: Extract data safely with fallbacks - no crashes if undefined
        let imageUrl = '';
        let stockQuantity = 0;
        let stockStatus = 'outofstock';
        let depotVente = '';
        let initialQty = '';
        let shelfQty = '';
        let totalPreorders = '';

        // Safe extraction - each field independently checked
        try {
          if (product && product.images && product.images.length > 0) {
            imageUrl = product.images[0].src || '';
            Logger.log(`✅ SKU ${sku}: Found image URL: ${imageUrl}`);
          } else {
            Logger.log(`⚠️ SKU ${sku}: No images in WooCommerce API response`);
            // Log only if product exists
            if (product) {
              const productStr = JSON.stringify(product);
              if (productStr && productStr.length > 0) {
                Logger.log(`⚠️ Product sample: ${productStr.substring(0, 300)}`);
              }
            } else {
              Logger.log(`❌ SKU ${sku}: Product object is null/undefined`);
            }
          }
        } catch (e) {
          Logger.log(`❌ Image error for SKU ${sku}: ${e.message}`);
        }

        try {
          stockQuantity = product && product.stock_quantity !== undefined ? product.stock_quantity : 0;
          stockStatus = product && product.stock_status ? product.stock_status : 'outofstock';
        } catch (e) {
          Logger.log(`⚠️ Stock extraction error for SKU ${sku}: ${e.message}`);
        }

        try {
          if (product && product.meta_data) {
            depotVente = getMetaValue(product.meta_data, '_depot_vente') || '';
            initialQty = getMetaValue(product.meta_data, '_initial_quantity') || '';
            shelfQty = getMetaValue(product.meta_data, 'yid_total_shelf') || '';
            totalPreorders = getMetaValue(product.meta_data, '_total_preorders') || '';
          }
        } catch (e) {
          Logger.log(`⚠️ Custom fields extraction error for SKU ${sku}: ${e.message}`);
        }

        // Write data to sheet - BATCH WRITE for speed
        const rowIndex = i + 1; // 1-based row index

        // Z: Image URL (raw URL)
        sheet.getRange(rowIndex, imageUrlCol + 1).setValue(imageUrl);

        // A: Image formula =IMAGE(Z)
        if (imageUrl) {
          const imageFormulaCell = `Z${rowIndex}`;
          sheet.getRange(rowIndex, imageCol + 1).setFormula(`=IMAGE(${imageFormulaCell})`);
        }

        // G: Depot Vente
        sheet.getRange(rowIndex, depotVenteCol + 1).setValue(depotVente);

        // H: Current Stock
        sheet.getRange(rowIndex, currentStockCol + 1).setValue(stockQuantity);

        // J: Initial Quantity Origin
        sheet.getRange(rowIndex, initialQtyCol + 1).setValue(initialQty);

        // K: Stock Status
        sheet.getRange(rowIndex, stockStatusCol + 1).setValue(stockStatus);

        // T: Quantity Shelf
        sheet.getRange(rowIndex, shelfQtyCol + 1).setValue(shelfQty);

        // U: Total Preorders
        sheet.getRange(rowIndex, totalPreordersCol + 1).setValue(totalPreorders);

        successCount++;

        // Progress update every 10 products
        if (successCount % 10 === 0) {
          SpreadsheetApp.getActiveSpreadsheet().toast(
            `✅ Processed ${successCount} products...`,
            'Progress',
            3
          );
        }

        // REMOVED: No sleep needed for GET requests (read-only operations)
        // Utilities.sleep(1000);

      } catch (error) {
        errorCount++;
        errorDetails.push({
          row: i + 1,
          sku: sku,
          error: error.message
        });
        Logger.log(`❌ Error fetching SKU ${sku}: ${error.message}`);
      }
    }

    // Final report
    let reportMessage = `✅ Data fetch complete!\n\n`;
    reportMessage += `📊 Results:\n`;
    reportMessage += `• Success: ${successCount} products\n`;
    reportMessage += `• Errors: ${errorCount} products\n\n`;

    if (errorDetails.length > 0) {
      reportMessage += `❌ Errors:\n`;
      errorDetails.forEach(err => {
        reportMessage += `• Row ${err.row} (${err.sku}): ${err.error}\n`;
      });
    }

    SpreadsheetApp.getActiveSpreadsheet().toast('✅ Fetch complete!', 'Success', 5);
    ui.alert('📊 Fetch Data Complete', reportMessage, ui.ButtonSet.OK);

  } catch (error) {
    Logger.log(`❌ Fatal error: ${error.message}`);
    ui.alert('❌ Error', `Fatal error: ${error.message}`, ui.ButtonSet.OK);
  }
}

/**
 * Helper function to get meta value from product meta_data array
 * @param {Array} metaData - Array of meta_data objects from WooCommerce API
 * @param {string} key - Meta key to search for
 * @returns {string} - Meta value or empty string if not found
 */
function getMetaValue(metaData, key) {
  if (!metaData || !Array.isArray(metaData)) return '';

  const meta = metaData.find(m => m.key === key);
  return meta ? meta.value : '';
}
