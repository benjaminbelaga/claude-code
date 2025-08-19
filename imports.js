/**
 * @file Manages all WP All Import trigger and processing logic.
 * This file contains the core engine for handling WordPress imports, including
 * robust error handling, retry mechanisms, and Cloudflare bypass strategies.
 */

/**
 * The core intelligent import handler.
 * This function triggers a WP All Import process and monitors it until completion.
 * It uses a simplified, robust trigger mechanism and provides clear user feedback.
 *
 * @param {string} siteName - The key for the site from the Config.SITES object (e.g., 'YOYAKU_IO').
 * @param {string} importType - The key for the import ID from the site's config (e.g., 'stock').
 * @param {object} [options={}] - Additional options.
 * @param {boolean} [options.skipConfirmation=false] - If true, skips the pre-import confirmation dialog.
 * @returns {boolean} True if the import was successful, false otherwise.
 */
function runImportEngine(siteName, importType, options = {}) {
  const logPrefix = `[ImportEngine: ${siteName} - ${importType}]`;
  Logger.info(`${logPrefix} Starting...`);
    
    try {
    const siteConfig = Config.getSiteConfig(siteName);
    const importId = Config.getImportId(siteName, importType);
    const importKey = Config.getImportKey();

    if (!siteConfig || !importId || !importKey) {
      throw new Error(`Invalid configuration for ${siteName} or ${importType}`);
    }

    const { wpLoadUrl, isCloudflareProtected } = siteConfig;

    if (!options.skipConfirmation) {
      const ui = SpreadsheetApp.getUi();
      const response = ui.alert(
        `Confirm Import: ${siteConfig.name}`,
        `You are about to run the '${importType}' import (ID: ${importId}) on ${siteConfig.name}.\n\nContinue?`,
        ui.ButtonSet.YES_NO
      );

      if (response !== ui.Button.YES) {
        Logger.info(`${logPrefix} User cancelled operation.`);
        SpreadsheetApp.getActiveSpreadsheet().toast('Import cancelled.');
        return false;
      }
    }

    const fullImportUrl = buildImportUrl(siteName, importType, 'trigger');

    Logger.info(`${logPrefix} Triggering import ID ${importId} at ${fullImportUrl}`);
    SpreadsheetApp.getActiveSpreadsheet().toast(`🚀 Starting import: ${siteConfig.name} - ${importType}...`, 'Import Status', 10);

    const triggerResponse = makeRequest(fullImportUrl, isCloudflareProtected);

    if (triggerResponse.success) {
      Logger.info(`${logPrefix} Trigger successful. Response: ${triggerResponse.content.substring(0, 150)}...`);
      // For now, we just trigger. We can add processing logic here later if needed.
      SpreadsheetApp.getUi().alert('✅ Success!', `Import '${importType}' on ${siteConfig.name} has been successfully triggered.`, SpreadsheetApp.getUi().ButtonSet.OK);
      return true;
        } else {
      Logger.log(`${logPrefix} Trigger failed. Status: ${triggerResponse.statusCode}. Error: ${triggerResponse.error}`);
      SpreadsheetApp.getUi().alert('❌ Import Failed', `Could not trigger the import on ${siteConfig.name}.\n\nStatus: ${triggerResponse.statusCode}\nError: ${triggerResponse.error}\n\nCheck logs for more details.`, SpreadsheetApp.getUi().ButtonSet.OK);
      return false;
    }
    
  } catch (e) {
    Logger.log(`${logPrefix} CRITICAL ERROR: ${e.message}\nStack: ${e.stack}`);
    SpreadsheetApp.getUi().alert(`❌ Critical Error`, `An unexpected error occurred: ${e.message}`);
    return false;
    }
  }
  
  /**
 * Makes an HTTP GET request with appropriate headers and retries.
 * @param {string} url - The URL to fetch.
 * @param {boolean} isCloudflare - Whether to use Cloudflare-specific headers.
 * @param {number} [retries=3] - The number of times to retry on failure.
 * @returns {{success: boolean, content: string, statusCode: number, error: string}}
 */
function makeRequest(url, isCloudflare, retries = 3) {
  const logPrefix = `[makeRequest: ${url.substring(0, 60)}...]`;
    
  const userAgents = Config.USER_AGENTS;
  const baseHeaders = {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
  };

  const cfHeaders = isCloudflare ? {
    'DNT': '1',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
  } : {};
  
  for (let i = 0; i < retries; i++) {
    try {
      const userAgent = userAgents[i % userAgents.length];
      const options = {
        'method': 'get',
        'muteHttpExceptions': true,
        'followRedirects': true,
        'headers': { ...baseHeaders, ...cfHeaders, 'User-Agent': userAgent }
      };

      Logger.info(`${logPrefix} Attempt ${i + 1}/${retries}...`);
      const response = UrlFetchApp.fetch(url, options);
      const statusCode = response.getResponseCode();
      const content = response.getContentText();

      if (statusCode === 200) {
        if (content.toLowerCase().includes('wrong key')) {
           return { success: false, content, statusCode, error: 'Incorrect Import Key detected.' };
        }
        if (content.toLowerCase().includes('import not found')) {
           return { success: false, content, statusCode, error: `Import ID not found on server.` };
      }
        if (isCloudflare && content.toLowerCase().includes('just a moment')) {
          Logger.warning(`${logPrefix} Cloudflare challenge detected. Retrying...`);
          Utilities.sleep(2000 * (i + 1)); // Wait longer on each retry
          continue;
        }
        return { success: true, content, statusCode, error: null };
    }
      
      Logger.warning(`${logPrefix} Request failed with status ${statusCode}.`);
      Utilities.sleep(1000 * (i + 1));

    } catch (e) {
      Logger.log(`${logPrefix} Exception on attempt ${i + 1}: ${e.message}`);
      if (i === retries - 1) {
        return { success: false, content: null, statusCode: -1, error: e.message };
      }
      Utilities.sleep(1500 * (i + 1));
    }
  }

  return { success: false, content: null, statusCode: -1, error: `Request failed after ${retries} retries.` };
} 