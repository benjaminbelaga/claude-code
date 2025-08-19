/**
 * Complete Import Functions - All imports with full processing
 * Replaces the incomplete runImportEngine calls with complete processing
 */

// ======================= YOYAKU.IO IMPORTS ======================= //

/**
 * Complete Yoyaku New Product Import with processing
 */
function runYoyakuNewImportComplete() {
  runUniversalFixedImport('Yoyaku New Product', 'https://www.yoyaku.io/wp-load.php', '852', 'VXAf_v-w', 'wp import new product');
}

/**
 * Complete Yoyaku Pre-Order Import with processing
 */
function runYoyakuPreOrderImportComplete() {
  runUniversalFixedImport('Yoyaku Pre-Order', 'https://www.yoyaku.io/wp-load.php', '717', 'VXAf_v-w', 'wp import pre-order');
}

/**
 * Complete Yoyaku Picking Update with processing
 */
function runPickingUpdateComplete() {
  runUniversalFixedImport('Yoyaku Picking Update', 'https://www.yoyaku.io/wp-load.php', '775', 'VXAf_v-w', 'update picking status');
}


// ======================= YYD IMPORTS ======================= //

/**
 * Complete YYD New Product Import with processing
 */
function runYYDImportComplete() {
    runUniversalFixedImport('YYD New Product', 'https://www.yydistribution.fr/wp-load.php', '935', 'VXAf_v-w', 'wp import new product');
}

/**
 * Complete YYD Stock Update with processing
 */
function runYYDStockUpdateComplete() {
  runUniversalFixedImport('YYD Stock Update', 'https://www.yydistribution.fr/wp-load.php', '953', 'VXAf_v-w', 'update stock yyd');
}

/**
 * Complete Release Date Update with processing
 */
function runReleaseDateUpdateComplete() {
  runUniversalFixedImport('YYD Release Date Update', 'https://www.yydistribution.fr/wp-load.php', '941', 'VXAf_v-w', 'update release date');
}

// ======================= BARCELONA IMPORTS ======================= //

/**
 * Complete Barcelona Import with processing
 */
function runBarcelonaImportComplete() {
  runUniversalFixedImport('Barcelona POS', 'https://barcelona.yoyaku.io/wp-load.php', '852', 'VXAf_v-w', 'wp import new product');
}

// ======================= OTHER TOOLS ======================= //

/**
 * Complete Delete Bulk Products with processing
 */
function runDeleteBulkProductsComplete() {
    const confirmationMessage = '🚨 DANGER ZONE 🚨\nYou are about to run the BULK DELETE import (ID: 810) on Yoyaku.io.\n\nThis will PERMANENTLY DELETE products from the live site based on the data in the "delete bulk products" sheet.\n\nThis is irreversible. Are you absolutely sure you want to proceed?';
    runUniversalFixedImport('Yoyaku Bulk Delete', 'https://www.yoyaku.io/wp-load.php', '810', 'VXAf_v-w', 'delete bulk products', { confirmationMessage: confirmationMessage });
}

/**
 * Complete Export to Drive with processing
 */
function runExportToDriveComplete() {
  // This function is different as it triggers an export, not a data import.
  // The original logic should be maintained unless it's also broken.
  // For now, keeping the original logic.
  const site = "www.yoyaku.io";
  const importId = '526';
  const key = Config.getImportKey();
  const logPrefix = `[Export to Drive ${importId}]`;
  
  Logger.log(`${logPrefix} Starting COMPLETE export with processing...`);
  SpreadsheetApp.getActiveSpreadsheet().toast(`Starting Export to Drive (${importId}) with processing...`);

  try {
    const success = handleWPImportComplete(`https://${site}/wp-load.php`, importId, key, {});

    if (success) {
      Logger.log(`${logPrefix} Export completed successfully.`);
      SpreadsheetApp.getUi().alert(`🎉 EXPORT TO DRIVE COMPLETED!\n\n• Data exported successfully\n• Files available on Google Drive\n\nExport process finished!`);
    } else {
      Logger.log(`${logPrefix} Export failed.`);
      SpreadsheetApp.getUi().alert(`❌ Export to Drive failed. Check logs for details.`);
    }
  } catch (error) {
    Logger.log(`${logPrefix} CRITICAL ERROR: ${error.message}\nStack: ${error.stack}`);
    SpreadsheetApp.getUi().alert(`❌ Error during export: ${error.message}`);
  }
}

// ======================= UTILITY FUNCTIONS ======================= //

/**
 * Get data from sheet and convert to CSV for export
 */
function getDataForExport(sheetName) {
  const logPrefix = `[GetDataForExport Sheet: ${sheetName}]`;
  Logger.log(`${logPrefix} Starting.`);
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    var errorMessage = `Sheet not found: "${sheetName}"`;
    Logger.log(`${logPrefix} Error: ${errorMessage}`);
    SpreadsheetApp.getUi().alert(errorMessage);
    throw new Error(errorMessage);
  }

  var dataRange = sheet.getDataRange();
  var data = dataRange.getValues();
  Logger.log(`${logPrefix} Read ${data.length} rows and ${data[0] ? data[0].length : 0} columns.`);

  // Convert data to CSV string, handling quotes and commas correctly according to RFC 4180
  var csvContent = data.map(function(row, rowIndex) {
    return row.map(function(cell, colIndex) {
      var cellValue = cell === null || cell === undefined ? '' : String(cell);
      // Escape double quotes by doubling them " -> ""
      var escapedCell = cellValue.replace(/"/g, '""');
      // Enclose in double quotes if it contains comma, newline, or double quote
      if (escapedCell.includes(',') || escapedCell.includes('\n') || escapedCell.includes('"')) {
        return '"' + escapedCell + '"';
      }
      return escapedCell;
    }).join(','); // Use comma as delimiter
  }).join('\n'); // Use newline as row separator

   Logger.log(`${logPrefix} Finished converting data to CSV string (length: ${csvContent.length})`);
  return csvContent;
}

/**
 * Export CSV data to Google Drive
 */
function exportToDrive(folderId, fileName, data) {
  const logPrefix = '[ExportToDrive]';
  
  // Enhanced parameter validation and logging
  Logger.log(`${logPrefix} Function called with parameters:`);
  Logger.log(`${logPrefix} - folderId: ${folderId} (type: ${typeof folderId})`);
  Logger.log(`${logPrefix} - fileName: ${fileName} (type: ${typeof fileName})`);
  Logger.log(`${logPrefix} - data: ${data ? `${data.length} characters` : 'null/undefined'} (type: ${typeof data})`);
  
  // Parameter validation with specific error messages
  if (!folderId || folderId === 'undefined' || typeof folderId !== 'string') {
      const errorMsg = `Invalid Folder ID: "${folderId}" (type: ${typeof folderId})`;
      Logger.log(`${logPrefix} Error: ${errorMsg}`);
      throw new Error(`Export failed: ${errorMsg}`);
  }
  
  if (!fileName || fileName === 'undefined' || typeof fileName !== 'string') {
      const errorMsg = `Invalid fileName: "${fileName}" (type: ${typeof fileName})`;
      Logger.log(`${logPrefix} Error: ${errorMsg}`);
      throw new Error(`Export failed: ${errorMsg}`);
  }
  
  Logger.log(`${logPrefix} Attempting to export "${fileName}.csv" to folder ID: ${folderId}`);
  if (!data) {
       Logger.log(`${logPrefix} Warning: No data provided to export for file "${fileName}.csv". Creating empty file.`);
       data = "";
  }

  try {
    // Try using basic DriveApp first (works with basic permissions)
    Logger.log(`${logPrefix} Using DriveApp method for better compatibility...`);
    
    // Get the folder
    const folder = DriveApp.getFolderById(folderId);
    Logger.log(`${logPrefix} Found folder: ${folder.getName()}`);
    
    // Create blob from data
    const blob = Utilities.newBlob(data, 'text/csv', fileName + '.csv');
    
    // Create file in folder
    const file = folder.createFile(blob);
    const fileId = file.getId();
    
    Logger.log(`${logPrefix} Success! Created file with ID ${fileId} named "${fileName}.csv" in folder "${folder.getName()}"`);
    SpreadsheetApp.getActiveSpreadsheet().toast(`✅ Exported ${fileName}.csv to Drive`, `Export Success`, 5);
    return fileId;

  } catch (e) {
    Logger.log(`${logPrefix} ERROR exporting file: ${e.toString()}\nStack: ${e.stack}`);
    Logger.log(`${logPrefix} Details - FolderID: ${folderId}, FileName: ${fileName}`);
     
    if (e.message.includes("not have permission") || e.message.includes("drive.files.create")) {
        Logger.log(`${logPrefix} Drive permissions error detected.`);
        SpreadsheetApp.getUi().alert(`❌ DRIVE PERMISSIONS ERROR\n\nYou need to authorize Google Drive access.\n\nSOLUTION:\n1. Go to Extensions > WP Import Dashboard > Intelligent Other Tools\n2. Click "🔐 Setup Drive Permissions"\n3. Grant all requested permissions\n4. Try the export again`);
    } else if (e.message.includes("not found") || e.message.includes("No item with the given ID")) {
        Logger.log(`${logPrefix} Error suggests Folder ID "${folderId}" was not found or script lacks permission.`);
        SpreadsheetApp.getUi().alert(`❌ FOLDER NOT FOUND\n\nFolder ID "${folderId}" not found or access denied.\n\nPlease check:\n1. Folder ID is correct\n2. Folder is shared with your account\n3. You have write permissions`);
    
        SpreadsheetApp.getUi().alert(`❌ Drive Export Error: ${e.message}\n\nTry running "🔐 Setup Drive Permissions" from the menu first.`);
    }
    throw new Error(`${logPrefix} Failed: ${e.message}`);
  }
}

/**
 * Get formatted date for exports
 */
function getFormattedDate_DDMMYYYY() {
  try {
    var today = new Date();
    var day = Utilities.formatDate(today, 'Europe/Paris', 'dd');
    var month = Utilities.formatDate(today, 'Europe/Paris', 'MM');
    var year = Utilities.formatDate(today, 'Europe/Paris', 'yyyy');
    var result = day + '-' + month + '-' + year;
    
    Logger.log(`[getFormattedDate_DDMMYYYY] Generated date: "${result}"`);
    
    if (!result || result.includes('undefined') || result.includes('null')) {
      throw new Error(`Invalid date generated: "${result}"`);
    }
    
    return result;
  } catch (error) {
    Logger.log(`[getFormattedDate_DDMMYYYY] ERROR: ${error.message}`);
    var fallbackDate = new Date().toISOString().split('T')[0].replace(/-/g, '-');
    Logger.log(`[getFormattedDate_DDMMYYYY] Using fallback date: "${fallbackDate}"`);
    return fallbackDate;
  }
}

/**
 * Trigger new product Pabbly webhook
 */
function triggerNewProductPabblyWebhook() {
  const webhookUrl = "https://connect.pabbly.com/api/v1/work-flow-hit/workflow_id/fac57189-d29a-46ce-90df-a62c7e909a34/target/Yoyaku%20IO%20New%20Product%20Imported";
  const logPrefix = `[Pabbly New Product Webhook]`;
  Logger.log(`${logPrefix} Triggering webhook...`);

  try {
    const response = UrlFetchApp.fetch(webhookUrl, { 'method': 'post', 'muteHttpExceptions': true });
    Logger.log(`${logPrefix} Webhook triggered successfully. Status: ${response.getResponseCode()}`);
  } catch (error) {
    Logger.log(`${logPrefix} Failed to trigger webhook. Error: ${error.message}`);
  }
} 

/**
 * Universal Fixed Import Wrapper Function
 * Bridges old calls to the new handleWPImportComplete system
 */
function runUniversalFixedImport(siteName, baseUrl, importId, importKey, sheetName, options = {}) {
  const logPrefix = `[Universal Fixed Import - ${siteName}]`;
  
  // Confirmation Dialog (if not skipped)
  if (!options.skipConfirmation) {
    const ui = SpreadsheetApp.getUi();
    const message = options.confirmationMessage || 
      `You are about to run the '${siteName}' import (ID: ${importId}) using data from the "${sheetName}" sheet.\n\nThis will send the sheet's data to the live site.\n\nContinue?`;
    const response = ui.alert(`Confirm Import: ${siteName}`, message, ui.ButtonSet.YES_NO);
    if (response !== ui.Button.YES) {
      Logger.log(`${logPrefix} User cancelled operation.`);
      SpreadsheetApp.getActiveSpreadsheet().toast('Import cancelled.');
      return false;
    }
  }

  Logger.log(`${logPrefix} Starting import for ${siteName} (ID: ${importId}) from sheet: ${sheetName}`);
  SpreadsheetApp.getActiveSpreadsheet().toast(`Starting ${siteName} Import (${importId})...`, `Import Started`, 5);

  try {
    // Call the main handler function
    const success = handleWPImportComplete(baseUrl, importId, importKey, options);
    
    if (success) {
      Logger.log(`${logPrefix} Import completed successfully for ${siteName}`);
      
      // Auto-trigger CSV export for new products and pre-orders
      if (sheetName && (sheetName.includes('wp import new product') || sheetName.includes('wp import pre-order'))) {
        Logger.log(`${logPrefix} Auto-triggering CSV export for ${sheetName}...`);
        try {
          runExportToDriveComplete();
          Logger.log(`${logPrefix} CSV export completed successfully`);
        } catch (exportError) {
          Logger.log(`${logPrefix} CSV export failed: ${exportError.message}`);
          // Don't fail the whole import if export fails
        }
      }
      
      SpreadsheetApp.getActiveSpreadsheet().toast(`✅ ${siteName} Import completed successfully!`, `Success`, 5);
      return true;
    } else {
      Logger.log(`${logPrefix} Import failed for ${siteName}`);
      SpreadsheetApp.getActiveSpreadsheet().toast(`❌ ${siteName} Import failed. Check logs for details.`, `Failed`, 5);
      return false;
    }
  } catch (error) {
    Logger.log(`${logPrefix} CRITICAL ERROR for ${siteName}: ${error.message}\nStack: ${error.stack}`);
    SpreadsheetApp.getActiveSpreadsheet().toast(`❌ Error during ${siteName} import: ${error.message}`, `Error`, 5);
    return false;
  }
}


/**
 * Universal Fixed Import Wrapper Function
 * Bridges old calls to the new handleWPImportComplete system
 * @param {string} siteName Display name for the site (for logging)
 * @param {string} baseUrl The base URL of the WordPress site
 * @param {string} importId The ID of the import
 * @param {string} importKey The secret key for the import
 * @param {string} sheetName The name of the sheet (for logging)
 * @param {object} options Additional options
 * @returns {boolean} True if the import completed successfully
 */
function runUniversalFixedImport(siteName, baseUrl, importId, importKey, sheetName, options = {}) {
  const logPrefix = `[Universal Fixed Import - ${siteName}]`;
  
  // Confirmation Dialog (if not skipped)
  if (!options.skipConfirmation) {
    const ui = SpreadsheetApp.getUi();
    const message = options.confirmationMessage || 
      `You are about to run the '${siteName}' import (ID: ${importId}) using data from the "${sheetName}" sheet.\n\nThis will send the sheet's data to the live site.\n\nContinue?`;
    const response = ui.alert(`Confirm Import: ${siteName}`, message, ui.ButtonSet.YES_NO);
    if (response !== ui.Button.YES) {
      Logger.log(`${logPrefix} User cancelled operation.`);
      SpreadsheetApp.getActiveSpreadsheet().toast('Import cancelled.');
      return false;
    }
  }

  Logger.log(`${logPrefix} Starting import for ${siteName} (ID: ${importId}) from sheet: ${sheetName}`);
  SpreadsheetApp.getActiveSpreadsheet().toast(`Starting ${siteName} Import (${importId})...`, `Import Started`, 5);

  try {
    // Call the main handler function
    const success = handleWPImportComplete(baseUrl, importId, importKey, options);
    
    if (success) {
      Logger.log(`${logPrefix} Import completed successfully for ${siteName}`);
      
      // Auto-trigger CSV export for new products and pre-orders
      if (sheetName && (sheetName.includes('wp import new product') || sheetName.includes('wp import pre-order'))) {
        Logger.log(`${logPrefix} Auto-triggering CSV export for ${sheetName}...`);
        try {
          runExportToDriveComplete();
          Logger.log(`${logPrefix} CSV export completed successfully`);
        } catch (exportError) {
          Logger.log(`${logPrefix} CSV export failed: ${exportError.message}`);
          // Don't fail the whole import if export fails
        }
      }
      
      SpreadsheetApp.getActiveSpreadsheet().toast(`✅ ${siteName} Import completed successfully!`, `Success`, 5);
      return true;
    } else {
      Logger.log(`${logPrefix} Import failed for ${siteName}`);
      SpreadsheetApp.getActiveSpreadsheet().toast(`❌ ${siteName} Import failed. Check logs for details.`, `Failed`, 5);
      return false;
    }
  } catch (error) {
    Logger.log(`${logPrefix} CRITICAL ERROR for ${siteName}: ${error.message}\nStack: ${error.stack}`);
    SpreadsheetApp.getActiveSpreadsheet().toast(`❌ Error during ${siteName} import: ${error.message}`, `Error`, 5);
    return false;
  }
}