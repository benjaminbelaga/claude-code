/**
 * Complete WP Import Handler - Based on working legacy code
 * This function handles the complete import process: trigger + processing until completion
 */

/**
 * Handles the triggering and processing loop for a WP All Import process.
 * Based on the working legacy handleWPImport function.
 * @param {string} baseUrl The base URL of the WordPress site (e.g., "https://www.yoyaku.io/wp-load.php").
 * @param {string} importId The ID of the WP All Import process.
 * @param {string} importKey The secret key for the WP All Import process.
 * @param {object} [options={}] Optional parameters.
 * @returns {boolean} True if the import completed successfully, false otherwise.
 */
function handleWPImportComplete(baseUrl, importId, importKey, options = {}) {
  const scriptStartTime = Date.now();

  const {
    maxRetries = 5,
    processingInterval = 5000, // 5 seconds - realistic timing
    maxProcessingAttempts = 60, // 60 attempts * 5s = 300 seconds = 5 minutes
    timeoutBetweenRetries = 20000, // 20 seconds
    maxTimeout = 21600000, // 6 hours internal limit for THIS import process
    initialDelay = 30000, // 30 seconds
    scriptTimeoutMargin = 330000 // 5.5 minutes (slightly less than 6 min Google limit)
  } = options;

  const logPrefix = `[Import ${importId} on ${baseUrl.split('/')[2]}]`;
  Logger.log(`${logPrefix} Starting COMPLETE import process. Key: ${importKey}. Options: ${JSON.stringify(options)}`);
  SpreadsheetApp.getActiveSpreadsheet().toast(`Starting Import ${importId} on ${baseUrl.split('/')[2]}...`, `WP Import Status`, 5);

  // --- Trigger Phase ---
  let triggerSuccess = false;
  Logger.log(`${logPrefix} Attempting to trigger import...`);
  
  for (let i = 0; i < maxRetries; i++) {
    if (Date.now() - scriptStartTime > scriptTimeoutMargin) {
      throw new Error(`${logPrefix} Google Apps Script execution time limit approaching during trigger phase. Aborting.`);
    }
    
    try {
      const triggerResponse = makeWPImportRequestWithRetryComplete(baseUrl, importId, importKey, 'trigger', maxRetries);
      
      if (triggerResponse && triggerResponse.getResponseCode() === 200) {
        const content = triggerResponse.getContentText();
        
        // Check common success indicators or absence of common error keywords
        if (!content.toLowerCase().includes('error') && !content.toLowerCase().includes('fail') && !content.toLowerCase().includes('wrong key')) {
          triggerSuccess = true;
          Logger.log(`${logPrefix} Import triggered successfully (Attempt ${i + 1}/${maxRetries}). Response snippet: ${content.substring(0,100)}...`);
          break;
        } else {
          Logger.log(`${logPrefix} Trigger attempt ${i + 1}/${maxRetries} got 200 OK, but response indicates potential issue: ${content.substring(0,200)}...`);
          
          if (content.toLowerCase().includes('wrong key')) {
            throw new Error(`${logPrefix} Trigger failed: Incorrect Import Key suspected. Response: ${content.substring(0,200)}...`);
          }
        }
      } else {
        const statusCode = triggerResponse ? triggerResponse.getResponseCode() : 'No Response';
        const responseText = triggerResponse ? triggerResponse.getContentText().substring(0, 200) + '...' : 'N/A';
        Logger.log(`${logPrefix} Trigger attempt ${i + 1}/${maxRetries} failed. Status: ${statusCode}. Response: ${responseText}`);
      }
    } catch (e) {
      Logger.log(`${logPrefix} Trigger attempt ${i + 1}/${maxRetries} threw an error: ${e.message}`);
      
      if (i === maxRetries - 1) {
        Logger.log(`${logPrefix} Final trigger attempt failed.`);
        throw new Error(`${logPrefix} Failed to trigger import after ${maxRetries} attempts. Last error: ${e.message}`);
      }
    }
    
    // Wait before retrying (only if not the last attempt)
    if (i < maxRetries - 1) {
      Logger.log(`${logPrefix} Waiting ${timeoutBetweenRetries / 1000} seconds before retry...`);
      Utilities.sleep(timeoutBetweenRetries);
    }
  }

  if (!triggerSuccess) {
    throw new Error(`${logPrefix} Failed to trigger import ${importId} after ${maxRetries} attempts.`);
  }

  // --- Initial Delay ---
  Logger.log(`${logPrefix} Trigger successful. Waiting ${initialDelay / 1000} seconds before starting processing checks...`);
  Utilities.sleep(initialDelay);

  // --- Processing Phase ---
  let processingAttempts = 0;
  const processingStartTime = Date.now();
  Logger.log(`${logPrefix} Starting processing checks (Max attempts: ${maxProcessingAttempts}, Interval: ${processingInterval/1000}s)...`);
  SpreadsheetApp.getActiveSpreadsheet().toast(`Import ${importId} triggered. Now processing...`, `WP Import Status`, 10);

  while (processingAttempts < maxProcessingAttempts) {
    const currentAttempt = processingAttempts + 1;
    const elapsedScriptTime = Date.now() - scriptStartTime;
    const elapsedProcessingTime = Date.now() - processingStartTime;

    // Check Google Apps Script overall time limit
    if (elapsedScriptTime > scriptTimeoutMargin) {
      Logger.log(`${logPrefix} Google Apps Script execution time limit (${scriptTimeoutMargin/1000}s) approaching during processing phase (Attempt ${currentAttempt}). Aborting.`);
      throw new Error(`${logPrefix} Google Apps Script execution time limit reached during processing. Import likely incomplete.`);
    }

    // Check internal processing time limit for this specific import
    if (elapsedProcessingTime > maxTimeout) {
      Logger.log(`${logPrefix} Import processing exceeded configured maximum time limit (${maxTimeout / 1000}s) at attempt ${currentAttempt}.`);
      throw new Error(`${logPrefix} Import processing exceeded maximum time limit of ${maxTimeout / 1000} seconds.`);
    }

    Logger.log(`${logPrefix} Processing check attempt ${currentAttempt}/${maxProcessingAttempts}. Script time: ${Math.round(elapsedScriptTime/1000)}s. Processing time: ${Math.round(elapsedProcessingTime/1000)}s.`);

    try {
      const processingResponse = makeWPImportRequestWithRetryComplete(baseUrl, importId, importKey, 'processing', maxRetries);

      if (!processingResponse) {
        Logger.log(`${logPrefix} Processing attempt ${currentAttempt} failed to get response (makeWPImportRequestWithRetryComplete returned null/undefined).`);
      } else {
        const statusCode = processingResponse.getResponseCode();
        const content = processingResponse.getContentText();
        const contentLower = content.toLowerCase().trim();

        Logger.log(`${logPrefix} Processing attempt ${currentAttempt} status: ${statusCode}. Response snippet: ${content.substring(0, 150)}...`);

        // --- Check for Completion ---
        if (contentLower.includes('import complete') || contentLower.includes('import completed')) {
          Logger.log(`${logPrefix} Import completed successfully detected at attempt ${currentAttempt}.`);
          SpreadsheetApp.getActiveSpreadsheet().toast(`Import ${importId} COMPLETED successfully!`, `WP Import Status`, 10);
          return true; // SUCCESS!
        }

        // --- Check for Explicit Errors ---
        if (contentLower.includes('error') || contentLower.includes('fail') || statusCode >= 400 || contentLower.includes('wrong key') || contentLower.includes('already running')) {
          Logger.log(`${logPrefix} Import failed or encountered an error at attempt ${currentAttempt}. Status: ${statusCode}. Full error content sample: ${content.substring(0, 500)}`);
          
          // Specific check for "already running" - might need different handling (wait longer?)
          if (contentLower.includes('already running')) {
            Logger.log(`${logPrefix} Server indicated import is already running. Will continue polling.`);
            // No throw here, let it continue polling, but log it clearly.
          } else {
            throw new Error(`${logPrefix} Import failed or reported an error. Status: ${statusCode}. Response: ${content.substring(0, 300)}...`);
          }
        }

        // --- Still Processing ---
        Logger.log(`${logPrefix} Import still processing (Attempt ${currentAttempt}/${maxProcessingAttempts}).`);
        if (currentAttempt % 5 === 0) { // Update toast every 5 attempts
          SpreadsheetApp.getActiveSpreadsheet().toast(`Import ${importId} processing... (Attempt ${currentAttempt}/${maxProcessingAttempts})`, `WP Import Status`, 10);
        }
      }

    } catch (e) {
      Logger.log(`${logPrefix} Processing attempt ${currentAttempt} threw an error: ${e.message}`);
      
      if (e.message.includes('Incorrect Import Key')) {
        throw e; // Re-throw fatal error
      }
      Logger.log(`${logPrefix} Error during processing check ${currentAttempt}, will wait and potentially retry.`);
    }

    // --- Wait Before Next Attempt ---
    processingAttempts++;
    if (processingAttempts < maxProcessingAttempts) {
      Logger.log(`${logPrefix} Waiting ${processingInterval / 1000} seconds before next processing check...`);
      Utilities.sleep(processingInterval);
    }
  }

  // --- Timeout Reached ---
  Logger.log(`${logPrefix} Import processing timed out after ${maxProcessingAttempts} attempts.`);
  SpreadsheetApp.getActiveSpreadsheet().toast(`Import ${importId} TIMED OUT after ${maxProcessingAttempts} checks.`, `WP Import Status - ERROR`, 15);
  throw new Error(`${logPrefix} Import processing timed out after ${maxProcessingAttempts} attempts.`);
}

/**
 * Makes a request to the WP All Import URL with retries on failure.
 * @param {string} baseUrl The base URL (e.g., "https://site.com/wp-load.php").
 * @param {string} importId The import ID.
 * @param {string} importKey The import key.
 * @param {string} action The action ('trigger' or 'processing').
 * @param {number} [retries=3] Number of retries for this specific request.
 * @returns {GoogleAppsScript.URL_Fetch.HTTPResponse | null} The HTTP response object or null if all retries fail.
 */
function makeWPImportRequestWithRetryComplete(baseUrl, importId, importKey, action, retries = 3) {
  const url = buildImportUrlComplete(baseUrl, importId, importKey, action);
  const options = {
    'method': 'get',
    'muteHttpExceptions': true,
    'followRedirects': true,
    'validateHttpsCertificates': true,
    'headers': {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1'
    }
  };

  let lastError = null;
  const logPrefix = `[Fetch ${action} for Import ${importId} on ${baseUrl.split('/')[2]}]`;

  for (let i = 0; i < retries; i++) {
    const attempt = i + 1;
    try {
      Logger.log(`${logPrefix} Attempt ${attempt}/${retries} to fetch URL: ${url}`);
      const response = UrlFetchApp.fetch(url, options);
      const statusCode = response.getResponseCode();
      const responseText = response.getContentText();

      // Success Case (200 OK)
      if (statusCode === 200) {
        if (responseText.toLowerCase().includes('wrong key')) {
          Logger.log(`${logPrefix} Attempt ${attempt} got 200 OK, but response contains 'wrong key'. Failing fast.`);
          throw new Error(`${logPrefix} Incorrect Import Key detected in response.`);
        }
        Logger.log(`${logPrefix} Attempt ${attempt} successful. Status: ${statusCode}.`);
        return response;
      } else {
        lastError = `HTTP Status ${statusCode}`;
        Logger.log(`${logPrefix} Attempt ${attempt} failed with Status ${statusCode}. Response: ${responseText.substring(0, 300)}...`);
        
        if (statusCode === 403 || statusCode === 401) {
          Logger.log(`${logPrefix} Received ${statusCode}. Potential permission issue. Stopping retries.`);
          break;
        }
        if (statusCode === 404) {
          Logger.log(`${logPrefix} Received 404 Not Found. Check Base URL and wp-load.php path. Stopping retries.`);
          break;
        }
      }
    } catch (e) {
      lastError = e.message;
      Logger.log(`${logPrefix} Attempt ${attempt} failed with error: ${e.message}`);
      
      if (e.message.includes('Timeout')) {
        Logger.log(`${logPrefix} Request timed out.`);
      }
      if (e.message.includes('DNS') || e.message.includes('could not be found')) {
        Logger.log(`${logPrefix} DNS or Hostname resolution error. Check Base URL. Stopping retries.`);
        break;
      }
      if (e.message.includes('Incorrect Import Key')) {
        throw e; // Re-throw immediately
      }
    }

    // Wait before the next retry (if needed)
    if (i < retries - 1) {
      const sleepTime = Math.pow(2, i) * 5000 + Math.random() * 1000;
      Logger.log(`${logPrefix} Sleeping for ${Math.round(sleepTime / 1000)} seconds before retry ${attempt + 1}`);
      Utilities.sleep(sleepTime);
    }
  }

  Logger.log(`${logPrefix} Request failed after ${retries} attempts. Last error: ${lastError}`);
  return null;
}

/**
 * Builds the WP All Import URL with necessary parameters.
 * @param {string} baseUrl The base URL (e.g., "https://site.com/wp-load.php").
 * @param {string} importId The import ID.
 * @param {string} importKey The import key.
 * @param {string} action The action ('trigger' or 'processing').
 * @returns {string} The fully constructed URL.
 */
function buildImportUrlComplete(baseUrl, importId, importKey, action) {
  const timestamp = Date.now();
  const random = Math.random();
  
  let url = `${baseUrl}?import_key=${importKey}&import_id=${importId}&action=${action}`;
  url += `&hpos=1`;
  url += `&nocache=${timestamp}`;
  url += `&rand=${random}`;
  
  return url;
}

/**
 * Function to be called from Pabbly webhook system
 * Filters and sends stock update data based on trigger column
 */
function filterAndSendToPabblyForStockUpdate() {
  const sheetName = "update stock";
  const triggerHeader = "_manage_stock";
  const logPrefix = '[Pabbly Stock Filter&Send]';
  Logger.log(`${logPrefix} Starting process from sheet "${sheetName}"... Trigger column header: "${triggerHeader}"`);
  
  var errorsOccurred = false;
  var sentCount = 0;
  var skippedCount = 0;

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) throw new Error(`Sheet "${sheetName}" not found`);

    var dataRange = sheet.getDataRange();
    var data = dataRange.getValues();
    if (data.length <= 1) {
      Logger.log(`${logPrefix} No data rows found in sheet "${sheetName}".`);
      return;
    }
    
    var headers = data[0];
    Logger.log(`${logPrefix} Found ${data.length - 1} data rows. Headers: ${headers.join(', ')}`);

    // Define headers to extract
    const headersToExtract = {
      sku: "_sku",
      trigger: triggerHeader,
      name: "post_title",
      regularPrice: "_regular_price",
      salePrice: "_sale_price",
      stock: "_stock",
      attributeV: "Attribute 1 value(s)",
      attributeW: "Attribute 2 value(s)",
      currentStockSheet: "current stock"
    };

    // Get column indices
    const colIndices = {};
    let triggerColIndex = -1;
    for (const key in headersToExtract) {
      const index = headers.indexOf(headersToExtract[key]);
      colIndices[key] = index;
      if (index === -1) {
        Logger.log(`${logPrefix} Warning: Header "${headersToExtract[key]}" (for key "${key}") not found.`);
      }
      if (key === 'trigger') {
        triggerColIndex = index;
      }
    }

    if (triggerColIndex === -1) {
      throw new Error(`Trigger header "${triggerHeader}" not found in sheet "${sheetName}". Cannot proceed.`);
    }
    if (colIndices.sku === -1) {
      throw new Error(`SKU header "${headersToExtract.sku}" not found. Cannot proceed.`);
    }

    // Process data rows
    for (var i = 1; i < data.length; i++) {
      var currentRow = i + 1;
      var row = data[i];
      var triggerValue = row[triggerColIndex];
      var skuValue = row[colIndices.sku];

      // Check trigger condition
      if (triggerValue === null || triggerValue === undefined || String(triggerValue).trim() === '') {
        skippedCount++;
        continue;
      }

      // Construct payload
      var payload = {};
      for (const key in colIndices) {
        if (colIndices[key] !== -1) {
          payload[key] = row[colIndices[key]];
        } else {
          payload[key] = null;
        }
      }
      if (!payload.sku) payload.sku = skuValue || `Row_${currentRow}`;

      // Send the payload
      try {
        Logger.log(`${logPrefix} Row ${currentRow}: Processing SKU ${payload.sku}. Trigger value: ${triggerValue}. Sending to Pabbly...`);
        sendStockUpdateToPabbly(payload);
        sentCount++;
        Utilities.sleep(150);
      } catch (rowError) {
        Logger.log(`${logPrefix} Row ${currentRow}: ERROR sending SKU ${payload.sku}. Error: ${rowError.message}`);
        errorsOccurred = true;
        Utilities.sleep(500);
      }
    }

    Logger.log(`${logPrefix} Process finished. Sent: ${sentCount}, Skipped (empty trigger): ${skippedCount}, Errors: ${errorsOccurred ? 'YES' : 'NO'}.`);
    
  } catch (error) {
    Logger.log(`${logPrefix} CRITICAL ERROR: ${error.message}\nStack: ${error.stack}`);
    throw error;
  }
}

/**
 * Sends stock update data to Pabbly webhook
 */
function sendStockUpdateToPabbly(rowData) {
  const url = "https://connect.pabbly.com/workflow/sendwebhookdata/IjU3NjUwNTY1MDYzMDA0MzI1MjZlNTUzNjUxMzYi_pc";
  const logPrefix = `[Pabbly Stock Send SKU: ${rowData.sku || 'Unknown'}]`;
  Logger.log(`${logPrefix} Sending data to Pabbly Stock Update webhook...`);

  var payload;
  try {
    payload = JSON.stringify(rowData);
  } catch (jsonError) {
    Logger.log(`${logPrefix} Error: Failed to stringify JSON payload: ${jsonError.message}`);
    throw new Error(`Failed to create JSON payload for Pabbly: ${jsonError.message}`);
  }

  var options = {
    'method': 'post',
    'contentType': 'application/json',
    'muteHttpExceptions': true,
    'payload': payload
  };

  try {
    var response = UrlFetchApp.fetch(url, options);
    var responseCode = response.getResponseCode();
    var responseBody = response.getContentText();

    if (responseCode >= 200 && responseCode < 300) {
      Logger.log(`${logPrefix} Successfully sent data. Status: ${responseCode}. Response: ${responseBody.substring(0,100)}`);
    } else {
      Logger.log(`${logPrefix} ERROR sending data. Status: ${responseCode}. Response: ${responseBody.substring(0, 500)}`);
      throw new Error(`Pabbly request failed with status ${responseCode}. Response: ${responseBody.substring(0, 300)}...`);
    }
  } catch (error) {
    Logger.log(`${logPrefix} EXCEPTION sending data: ${error.message}\nStack: ${error.stack}`);
    throw new Error(`Failed to send to Pabbly: ${error.message}`);
  }
} 