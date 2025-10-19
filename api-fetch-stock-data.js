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
 * - T: Quantity Shelf (_yyd_shelf_count custom field)
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

    // NEW: Custom YOYAKU API Endpoint (no authentication needed!)
    const API_BASE = 'https://www.yoyaku.io/wp-json/yoyaku/v1/product-stock-data';

    // OLD WooCommerce API (commented for reference)
    // const API_BASE = 'https://www.yoyaku.io/wp-json/wc/v3';
    // const API_KEY = 'ck_f66f25feeabe4c509dcbc0a41d1b4379f5f4ab74';
    // const API_SECRET = 'cs_6a23c0ec55570d2f51d0abf11e83a8e81d1d789b';
    // const authHeader = 'Basic ' + Utilities.base64Encode(API_KEY + ':' + API_SECRET);

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
        // NEW: Call custom YOYAKU endpoint (no auth needed!)
        const searchUrl = `${API_BASE}/${encodeURIComponent(sku.toString().trim())}`;
        const searchOptions = {
          method: 'get',
          headers: {
            'Content-Type': 'application/json'
          },
          muteHttpExceptions: true
        };

        const searchResponse = UrlFetchApp.fetch(searchUrl, searchOptions);
        const product = JSON.parse(searchResponse.getContentText());

        // Check if product was found
        if (!product || product.found === false || product.error) {
          errorCount++;
          errorDetails.push({
            row: i + 1,
            sku: sku,
            error: product.error || 'Product not found'
          });
          continue;
        }

        // NEW: Direct extraction from custom endpoint (already clean format!)
        const imageUrl = product.image_url || '';
        const stockQuantity = product.stock_quantity || 0;
        const stockStatus = product.stock_status || 'outofstock';
        const depotVente = product.depot_vente || '';
        const initialQty = product.initial_quantity || '';
        const shelfQty = product.shelf_quantity || '';
        const totalPreorders = product.total_preorders || '';

        // Log success
        if (imageUrl) {
          Logger.log(`✅ SKU ${sku}: Image URL found: ${imageUrl}`);
        } else {
          Logger.log(`⚠️ SKU ${sku}: No image URL in custom endpoint response`);
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

// Helper function getMetaValue() removed - no longer needed!
// Custom endpoint returns clean data directly
