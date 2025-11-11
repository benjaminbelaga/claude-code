/**
 * @file Utils - Utility functions, and helpers
 * This module contains logging, error handling, and general utility functions
 */

/**
 * Log detailed error information
 */
function logDetailedError(context, error, requestDetails = {}) {
  const logPrefix = '[ERROR LOG]';
  const timestamp = new Date().toISOString();
  
  const errorInfo = {
    timestamp: timestamp,
    context: context,
    message: error.message || error,
    stack: error.stack || 'No stack trace available',
    requestDetails: requestDetails
  };
  
  Logger.log(`${logPrefix} ${timestamp} - ${context}`);
  Logger.log(`${logPrefix} Error: ${errorInfo.message}`);
  
  if (requestDetails.url) {
    Logger.log(`${logPrefix} URL: ${requestDetails.url}`);
  }
  
  if (requestDetails.statusCode) {
    Logger.log(`${logPrefix} Status: ${requestDetails.statusCode}`);
  }
  
  if (requestDetails.responseText) {
    Logger.log(`${logPrefix} Response: ${requestDetails.responseText.substring(0, 500)}...`);
  }
  
  return errorInfo;
}


/**
 * Create URL string helper function
 */
function CREATEURLSTRING(range, urlBase, fileCode) {
  Logger.log(`[URL STRING] Creating URL: range=${range}, base=${urlBase}, code=${fileCode}`);
  
  if (!range || !urlBase || !fileCode) {
    Logger.log(`[URL STRING] Missing parameters`);
    return '';
  }
  
  return `${urlBase}?range=${range}&file=${fileCode}`;
}

/**
 * Test functions - placeholder for testing
 */
function testFunctions() {
  Logger.log('[TEST] Test functions called');
  return true;
}

/**
 * Log detailed request/response for debugging
 */
function logDetailedRequestResponse(url, response) {
  const logPrefix = '[REQUEST/RESPONSE LOG]';
  Logger.log(`${logPrefix} URL: ${url}`);
  
  if (response) {
    Logger.log(`${logPrefix} Status: ${response.getResponseCode()}`);
    Logger.log(`${logPrefix} Headers: ${JSON.stringify(response.getHeaders())}`);
    Logger.log(`${logPrefix} Content: ${response.getContentText().substring(0, 500)}...`);
  } else {
    Logger.log(`${logPrefix} No response object provided`);
  }
}

/**
 * Runs the intelligent metadata validator for both genres and distributors.
 * Scans the sheet for genre and distributor errors and displays an interactive HTML dialog
 * for the user to apply suggestions or provide manual corrections.
 * This is the enhanced version with distributor support.
 */
function runSmartValidator() {
  const ui = SpreadsheetApp.getUi();
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const dataRange = sheet.getDataRange();
  const data = dataRange.getValues();
  const headers = data[0];
  
  // Find SKU column with multiple possible names for better compatibility
  const skuColumnIndex = headers.findIndex(header => {
    const headerStr = String(header).trim().toLowerCase();
    return headerStr === 'sku' || headerStr === 'reference' || headerStr === 'code';
  });
  
  if (skuColumnIndex === -1) {
    ui.alert('Error', 'Could not find a "SKU", "Reference", or "Code" column in the current sheet. The validator cannot run without it.', ui.ButtonSet.OK);
    Logger.log('[runSmartValidator] Validation stopped: No SKU column found.');
    return;
  }
  
  Logger.log(`[runSmartValidator] Found SKU column at index ${skuColumnIndex}: ${headers[skuColumnIndex]}`);

  Logger.log('[runSmartValidator] Starting smart metadata validation (genres + distributors)...');

  // Find genre columns
  const genreColumns = headers.map((header, index) => 
    String(header).toLowerCase().startsWith('genre') ? index : -1
  ).filter(index => index !== -1);

  // Find distributor columns
  Logger.log(`[runSmartValidator] Headers detected: ${JSON.stringify(headers)}`);
  
  const distributorColumns = headers.map((header, index) => {
    const headerStr = String(header).trim().toLowerCase();
    Logger.log(`[runSmartValidator] Checking header at index ${index}: '${header}' -> '${headerStr}'`);
    
    const isDistributor = headerStr === 'distributor' || headerStr === 'distributeur' || headerStr.startsWith('distributor');
    if (isDistributor) {
      Logger.log(`[runSmartValidator] ✅ DISTRIBUTOR COLUMN FOUND at index ${index}: '${header}'`);
    }
    
    return isDistributor ? index : -1;
  }).filter(index => index !== -1);
  
  Logger.log(`[runSmartValidator] Final distributorColumns detected: ${distributorColumns}`);

  if (genreColumns.length === 0 && distributorColumns.length === 0) {
    ui.alert('No validation columns found. Please ensure you have either genre columns (e.g., "Genre 1", "Genre 2") or distributor columns ("Distributor").');
    Logger.log('[runSmartValidator] Validation stopped: No genre or distributor columns found.');
    return;
  }
  
  Logger.log(`[runSmartValidator] Found ${genreColumns.length} genre columns and ${distributorColumns.length} distributor columns to validate.`);

  // Load official data and corrections
  const allGenresFromDB = Config.getGenres();
  const allDistributorsFromDB = Config.getDistributors();
  const distributorMapping = Config.getDistributorMapping(); // B->A mapping from taxonomy
  const genreCorrections = GenreCorrector.getGenreCorrections();
  const distributorCorrections = DistributorCorrector.getDistributorCorrections();
  
  Logger.log('[runSmartValidator] Loaded ' + Object.keys(genreCorrections).length + ' genre correction rules.');
  Logger.log('[runSmartValidator] Loaded ' + Object.keys(distributorCorrections).length + ' distributor correction rules.');
  Logger.log('[runSmartValidator] Loaded ' + Object.keys(distributorMapping).length + ' distributor mappings (B->A from taxonomy).');
  
  let issuesMap = {}; // Use a map to group issues by original value (genre or distributor)
  let processedRows = 0;

  // Start from row 1 to skip headers
  for (let i = 1; i < data.length; i++) {
    const rowData = data[i];
    
    // Safe SKU extraction with validation
    if (!rowData || rowData.length <= skuColumnIndex) {
      Logger.log(`[runSmartValidator] Skipping row ${i + 1}: insufficient data`);
      continue;
    }
    
    const sku = rowData[skuColumnIndex]; // Get SKU from the identified column

    if (!sku || String(sku).trim() === '') {
      Logger.log(`[runSmartValidator] Skipping row ${i + 1}: empty SKU`);
      continue;
    }
    
    processedRows++;

    // Validate genres
    genreColumns.forEach(colIndex => {
      if (colIndex < rowData.length) {
        const genre = rowData[colIndex];
        if (genre && typeof genre === 'string' && genre.trim() !== '') {
          const trimmedGenre = genre.trim();
          const lowerCaseGenre = trimmedGenre.toLowerCase();
          
          const isValid = allGenresFromDB && allGenresFromDB.some(validGenre => String(validGenre).trim().toLowerCase() === lowerCaseGenre);
          
          if (!isValid) {
            Logger.log(`[runSmartValidator] Found invalid genre: '${trimmedGenre}' at row ${i + 1}, SKU: ${sku}.`);
            const suggestion = genreCorrections[lowerCaseGenre] || '';
            if(suggestion) {
              Logger.log(`[runSmartValidator] Found suggestion for '${lowerCaseGenre}': '${suggestion}'`);
            }
            
            const issueKey = `GENRE:${trimmedGenre}`;
            if (!issuesMap[issueKey]) {
              issuesMap[issueKey] = {
                originalValue: trimmedGenre,
                validationType: 'GENRE',
                locations: [],
                suggestion: suggestion,
                type: suggestion ? 'SUGGESTION' : 'ERROR'
              };
            }
            issuesMap[issueKey].locations.push({
              row: i + 1,
              col: colIndex + 1,
              sku: String(sku),
              columnHeader: headers[colIndex]
            });
          }
        }
      }
    });

    // Validate distributors
    Logger.log(`[runSmartValidator] Processing distributors for ${distributorColumns.length} columns: ${distributorColumns}`);
    distributorColumns.forEach(colIndex => {
      if (colIndex < rowData.length) {
        const distributor = rowData[colIndex];
        if (distributor && typeof distributor === 'string' && distributor.trim() !== '') {
          // Extract only the first line (distributor name) and ignore address lines
          const firstLine = distributor.trim().split('\n')[0].trim();
          const trimmedDistributor = firstLine;
          const lowerCaseDistributor = trimmedDistributor.toLowerCase();
          
          Logger.log(`[runSmartValidator] Processing distributor: Full='${distributor.replace(/\n/g, ' | ')}', FirstLine='${firstLine}'`);
          
          // First check: exact match with official distributors
          let isValid = allDistributorsFromDB && allDistributorsFromDB.some(validDistributor => String(validDistributor).trim().toLowerCase() === lowerCaseDistributor);
          let suggestedDistributor = '';
          
          // Second check: intelligent mapping from taxonomy sheet (B->A)
          if (!isValid && distributorMapping) {
            const mappedValue = distributorMapping[lowerCaseDistributor];
            if (mappedValue) {
              isValid = false; // Still needs correction to the short form
              suggestedDistributor = mappedValue;
              Logger.log(`[runSmartValidator] Distributor mapping found: '${trimmedDistributor}' → suggests '${suggestedDistributor}'`);
            }
          }
          
          // Third check: manual correction rules
          if (!isValid && !suggestedDistributor) {
            suggestedDistributor = distributorCorrections[lowerCaseDistributor] || '';
          }
          
          if (!isValid) {
            Logger.log(`[runSmartValidator] Found invalid distributor: '${trimmedDistributor}' at row ${i + 1}, SKU: ${sku}.`);
            if(suggestedDistributor) {
              Logger.log(`[runSmartValidator] Found suggestion for '${lowerCaseDistributor}': '${suggestedDistributor}'`);
            }
            
            const issueKey = `DISTRIBUTOR:${trimmedDistributor}`;
            if (!issuesMap[issueKey]) {
              issuesMap[issueKey] = {
                originalValue: trimmedDistributor,
                validationType: 'DISTRIBUTOR',
                locations: [],
                suggestion: suggestedDistributor,
                type: suggestedDistributor ? 'SUGGESTION' : 'ERROR'
              };
            }
            issuesMap[issueKey].locations.push({
              row: i + 1,
              col: colIndex + 1,
              sku: String(sku),
              columnHeader: headers[colIndex]
            });
          }
        }
      }
    });
  }

  Logger.log(`[runSmartValidator] Processed ${processedRows} rows with valid SKUs`);

  // Convert the map to an array for the dialog
  const issues = Object.keys(issuesMap).map(issueKey => {
    const issue = issuesMap[issueKey];
    return {
      originalValue: issue.originalValue,
      validationType: issue.validationType,
      locations: issue.locations,
      suggestion: issue.suggestion,
      type: issue.type
    };
  });
  
  // Count issues by type for better reporting
  const genreIssues = issues.filter(issue => issue.validationType === 'GENRE');
  const distributorIssues = issues.filter(issue => issue.validationType === 'DISTRIBUTOR');
  
  Logger.log(`[runSmartValidator] Validation scan complete. Found ${genreIssues.length} unique genre issues and ${distributorIssues.length} unique distributor issues.`);
  Logger.log('[runSmartValidator] Issues object to be sent to dialog: ' + JSON.stringify(issues, null, 2));

  if (issues.length === 0) {
    ui.alert('✅ No metadata issues found. Everything looks good!');
    return;
  }

  showCorrectionDialog(issues);
}


/**
 * Displays a custom HTML dialog with the list of issues to be corrected.
 * @param {Array<Object>} issues - An array of issue objects to display.
 */
function showCorrectionDialog(issues) {
  const htmlTemplate = HtmlService.createTemplateFromFile('CorrectionDialog');
  const html = htmlTemplate.evaluate().setWidth(700).setHeight(500);

  // Use Script Cache to pass issue data to the dialog
  const cache = CacheService.getScriptCache();
  cache.put('validation_issues', JSON.stringify(issues), 3600); // Cache for 1 hour

  SpreadsheetApp.getUi().showModalDialog(html, '🔧 Metadata Validation & Correction (Genres + Distributors)');
  Logger.info('Displaying correction dialog to user.');
}

// ==================================================================
// GLOBAL FUNCTIONS FOR DIALOG COMMUNICATION
// These must be top-level functions to be callable from client-side script.
// ==================================================================

/**
 * Retrieves validation issues from the cache.
 * Called by the client-side JavaScript in the dialog.
 * @returns {string} A JSON string of the issues.
 */
function getValidationIssues() {
  try {
    const issues = CacheService.getScriptCache().get('validation_issues');
    return issues;
  } catch (e) {
    Logger.log('Failed to retrieve issues from cache.', e);
    return null;
  }
}

/**
 * Processes corrections submitted from the HTML dialog.
 * Called by the client-side JavaScript.
 * @param {Object} formObject - The object containing the corrections from the form.
 * @returns {Object} A result object with success status and a message.
 */
function processCorrections(formObject) {
    Logger.log('--- [processCorrections] Starting Correction Process ---');
    Logger.log('[processCorrections] Received form object: ' + JSON.stringify(formObject, null, 2));

    if (!formObject || !formObject.corrections) {
        Logger.log('[processCorrections] ERROR: Invalid or missing corrections object.');
        return { success: false, message: 'Invalid data received from the form.'};
    }
    
    try {
        const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
        const correctionsData = formObject.corrections;
        let appliedCount = 0;

        Logger.log(`[processCorrections] Processing ${correctionsData.length} unique corrections.`);

        // Get the updated lists of official data AFTER potential new additions
        const officialGenres = Config.getGenres();
        const officialDistributors = Config.getDistributors();
        const genreRule = SpreadsheetApp.newDataValidation().requireValueInList(officialGenres, true).build();
        const distributorRule = SpreadsheetApp.newDataValidation().requireValueInList(officialDistributors, true).build();

        correctionsData.forEach((correction, index) => {
            const { originalValue, newValue, locations, validationType } = correction;
            Logger.log(`[processCorrections] Item #${index}: Type='${validationType}', Original='${originalValue}', New='${newValue}', Locations=${JSON.stringify(locations)}`);
            
            if (newValue && originalValue && locations && locations.length > 0 && validationType) {
                Logger.log(`[processCorrections] Item #${index}: PASSED validation. Applying changes.`);
                
                // Teach the system the new correction FIRST, based on validation type
                if (validationType === 'GENRE') {
                    Logger.log(`[processCorrections] Item #${index}: Calling addOrUpdateGenreCorrection.`);
                    GenreCorrector.addOrUpdateGenreCorrection(originalValue, newValue);
                } else if (validationType === 'DISTRIBUTOR') {
                    Logger.log(`[processCorrections] Item #${index}: Calling addOrUpdateDistributorCorrection.`);
                    DistributorCorrector.addOrUpdateDistributorCorrection(originalValue, newValue);
                }

                // Apply the correction to all relevant cells and update their validation rule
                locations.forEach(loc => {
                    const cell = sheet.getRange(parseInt(loc.row), parseInt(loc.col));
                    cell.setValue(newValue);
                    
                    // Apply appropriate validation rule based on type
                    if (validationType === 'GENRE') {
                        cell.setDataValidation(genreRule);
                    } else if (validationType === 'DISTRIBUTOR') {
                        cell.setDataValidation(distributorRule);
                    }
                    
                    appliedCount++;
                });
                
      } else {
                Logger.log(`[processCorrections] Item #${index}: SKIPPED. Validation failed.`);
            }
        });
      
        const message = `✅ Successfully applied ${appliedCount} total corrections and updated the knowledge base.`;
        Logger.log('[processCorrections] --- Finished ---');
        return { success: true, message: message };

    } catch (e) {
        Logger.log('[processCorrections] FATAL ERROR: ' + e.toString());
        Logger.log('[processCorrections] Stack Trace: ' + e.stack);
        return { success: false, message: `Error: ${e.message}` };
    }
  }
  
  // filterAndSendToPabblyForStockUpdate() moved to complete-import-handler.gs to avoid duplication 

/**
 * Analyse intelligente de la complexité d'import (système migré de l'ancien code)
 * @returns {Object} Résultats de l'analyse
 */
function analyzeImportComplexity() {
  const logPrefix = '[SMART ANALYSIS]';
  Logger.log(`${logPrefix} Starting intelligent import analysis...`);
  
  try {
    const sheet = SpreadsheetApp.getActiveSheet();
    const data = sheet.getDataRange().getValues();
    
    let analysis = {
      totalRows: data.length,
      validSKUs: 0,
      emptyRows: 0,
      complexProducts: 0,
      hasImages: 0,
      hasVariants: 0,
      hasCategories: 0,
      estimatedTime: 0,
      timeoutRecommended: 0,
      processingInterval: 5000
    };
    
    // Check if data is empty
    if (data.length === 0) {
      Logger.log(`${logPrefix} Empty sheet detected`);
      const defaultTiming = calculateIntelligentTiming(analysis);
      return { ...analysis, ...defaultTiming };
    }
    
    // Find SKU column (usually first column or look for "SKU" header)
    let skuColumnIndex = 0;
    const headers = data[0];
    for (let i = 0; i < headers.length; i++) {
      if (headers[i] && headers[i].toString().toLowerCase().includes('sku')) {
        skuColumnIndex = i;
        break;
      }
    }
    
    Logger.log(`${logPrefix} SKU column detected at index: ${skuColumnIndex}`);
    
    // Analyze each row
    for (let i = 1; i < data.length; i++) { // Skip header
      const row = data[i];
      const sku = row[skuColumnIndex];
      
      if (sku && sku.toString().trim() !== '') {
        analysis.validSKUs++;
        
        // Analyze product complexity
        let isComplex = false;
        
        // Check for images (URLs)
        const hasImages = row.some(cell => {
          if (!cell) return false;
          const cellStr = cell.toString();
          return cellStr.includes('http') || cellStr.includes('www.') || cellStr.includes('.jpg') || cellStr.includes('.png');
        });
        if (hasImages) {
          analysis.hasImages++;
          isComplex = true;
        }
        
        // Check for variants (pipe separator |)
        const hasVariants = row.some(cell => {
          if (!cell) return false;
          return cell.toString().includes('|');
        });
        if (hasVariants) {
          analysis.hasVariants++;
          isComplex = true;
        }
        
        // Check for categories (comma separator ,)
        const hasCategories = row.some(cell => {
          if (!cell) return false;
          const cellStr = cell.toString();
          return cellStr.includes(',') && cellStr.length > 10; // Avoid simple commas
        });
        if (hasCategories) {
          analysis.hasCategories++;
          isComplex = true;
        }
        
        if (isComplex) {
          analysis.complexProducts++;
        }
      } else {
        analysis.emptyRows++;
      }
    }
    
    // Calculate intelligent timing
    const timing = calculateIntelligentTiming(analysis);
    analysis.estimatedTime = timing.estimatedTime;
    analysis.timeoutRecommended = timing.timeoutRecommended;
    analysis.processingInterval = timing.processingInterval;
    
    Logger.log(`${logPrefix} Analysis complete: ${analysis.validSKUs} SKUs, ${analysis.complexProducts} complex, ~${Math.ceil(analysis.estimatedTime/60)}min estimated`);
    
    return analysis;
    
  } catch (error) {
    Logger.log(`${logPrefix} Analysis error: ${error.message}`);
    // Return default analysis if error
    return {
      totalRows: 0,
      validSKUs: 10, // Default assumption
      emptyRows: 0,
      complexProducts: 5,
      hasImages: 0,
      hasVariants: 0,
      hasCategories: 0,
      estimatedTime: 120, // 2 minutes default
      timeoutRecommended: 300, // 5 minutes default
      processingInterval: 5000
    };
  }
}

/**
 * Calcule les timings intelligents basés sur la complexité d'import
 * @param {Object} analysis Les résultats de l'analyse
 * @returns {Object} Recommandations de timing
 */
function calculateIntelligentTiming(analysis) {
  const logPrefix = '[SMART TIMING]';
  
  // Base calculation: 2-4 seconds per SKU depending on complexity
  let baseTimePerSKU = 2; // seconds
  
  // Adjust base time based on complexity ratio
  const complexityRatio = analysis.validSKUs > 0 ? analysis.complexProducts / analysis.validSKUs : 0;
  if (complexityRatio > 0.5) {
    baseTimePerSKU = 4; // Many complex products
  } else if (complexityRatio > 0.2) {
    baseTimePerSKU = 3; // Some complex products
  }
  
  // Calculate base time
  let estimatedSeconds = analysis.validSKUs * baseTimePerSKU;
  
  // Volume adjustments
  if (analysis.validSKUs > 200) {
    estimatedSeconds *= 1.3; // +30% for large volumes
  } else if (analysis.validSKUs > 100) {
    estimatedSeconds *= 1.15; // +15% for medium volumes
  }
  
  // Complexity bonuses
  if (analysis.hasImages > 0) {
    estimatedSeconds += analysis.hasImages * 1; // +1s per product with images
  }
  if (analysis.hasVariants > 0) {
    estimatedSeconds += analysis.hasVariants * 2; // +2s per product with variants
  }
  
  // Processing interval based on volume
  let processingInterval = 5000; // 5 seconds default
  if (analysis.validSKUs > 100) {
    processingInterval = 8000; // 8 seconds for large volumes
  } else if (analysis.validSKUs > 200) {
    processingInterval = 10000; // 10 seconds for very large volumes
  }
  
  // Timeout: 3x estimated time, minimum 5 minutes, maximum 30 minutes
  let timeoutRecommended = Math.max(estimatedSeconds * 3, 300); // Min 5 minutes
  timeoutRecommended = Math.min(timeoutRecommended, 1800); // Max 30 minutes
  
  Logger.log(`${logPrefix} Calculated: ${estimatedSeconds}s estimated, ${timeoutRecommended}s timeout, ${processingInterval}ms interval`);
  
  return {
    estimatedTime: estimatedSeconds,
    timeoutRecommended: timeoutRecommended,
    processingInterval: processingInterval
  };
}

/**
 * Affiche l'analyse intelligente pré-import avec warnings serveur intégrés
 * @param {Object} analysis Les résultats de l'analyse
 * @param {string} importContext Le contexte d'import
 * @returns {boolean} True si l'utilisateur veut continuer
 */
function showIntelligentPreImportInfo(analysis, importContext = 'Import') {
  const minutes = Math.ceil(analysis.estimatedTime / 60);
  const timeoutMinutes = Math.ceil(analysis.timeoutRecommended / 60);
  
  let message = `🧠 ANALYSE INTELLIGENTE PRÉ-IMPORT:\n\n`;
  message += `📊 ${analysis.validSKUs} produits détectés\n`;
  message += `🗑️ ${analysis.emptyRows} lignes vides ignorées\n`;
  message += `⚡ ${analysis.complexProducts} produits complexes:\n`;
  
  if (analysis.hasImages > 0) message += `   📸 ${analysis.hasImages} avec images\n`;
  if (analysis.hasVariants > 0) message += `   🔄 ${analysis.hasVariants} avec variants\n`;
  if (analysis.hasCategories > 0) message += `   📁 ${analysis.hasCategories} avec catégories\n`;
  
  message += `\n⏱️ Temps estimé: ~${minutes} minute(s)\n`;
  message += `🛡️ Timeout sécurité: ${timeoutMinutes} minutes\n`;
  message += `⚙️ Vérification: toutes les ${analysis.processingInterval/1000}s\n\n`;
  
  // Warnings based on analysis
  if (analysis.validSKUs > 100) {
    message += `⚠️ GROS VOLUME: Processing ralenti pour stabilité\n`;
  }
  if (analysis.complexProducts > 20) {
    message += `⚠️ COMPLEXITÉ ÉLEVÉE: Import peut être plus long\n`;
  }
  if (analysis.estimatedTime > 600) { // > 10 minutes
    message += `⚠️ IMPORT LONG: Prévoir ${minutes} minutes\n`;
  }
  
  // Ajouter les warnings serveur
  try {
    const sheet = SpreadsheetApp.getActiveSheet();
    const serverWarnings = checkServerStatus(sheet);
    
    if (serverWarnings.length > 0) {
      message += `\n🚨 WARNINGS SERVEURS:\n`;
      serverWarnings.forEach(warning => {
        message += `${warning}\n`;
      });
    } else {
      message += `\n✅ SERVEURS: Tous les serveurs sont OK\n`;
    }
  } catch (error) {
    Logger.log(`[showIntelligentPreImportInfo] Server check error: ${error.message}`);
    message += `\n⚠️ SERVEURS: Impossible de vérifier le statut des serveurs\n`;
  }
  
  message += `\n🚀 Continuer l'import intelligent ?`;
  
  const response = SpreadsheetApp.getUi().alert(
    `${importContext} - Analyse Pré-Import`,
    message,
    SpreadsheetApp.getUi().ButtonSet.YES_NO
  );
  
  return response === SpreadsheetApp.getUi().Button.YES;
}

/**
 * Converts text to URL-friendly slug format
 * Handles French characters, accents, and special characters
 * @param {...string} arguments - Text to convert (can be multiple arguments)
 * @returns {string} URL-friendly slug
 */
function slugify() {
  var args = Array.prototype.slice.call(arguments);
  var inputString = args.join(' ');
  if (!inputString) return "";

  // Table de translittération FR + diacritiques
  var map = {
    'à':'a','á':'a','â':'a','ã':'a','ä':'a','å':'a','æ':'ae',
    'ç':'c',
    'è':'e','é':'e','ê':'e','ë':'e',
    'ì':'i','í':'i','î':'i','ï':'i',
    'ñ':'n',
    'ò':'o','ó':'o','ô':'o','õ':'o','ö':'o','ø':'o','œ':'oe',
    'ù':'u','ú':'u','û':'u',
    'ý':'y','ÿ':'y',
    'À':'A','Á':'A','Â':'A','Ã':'A','Ä':'A','Å':'A','Æ':'AE',
    'Ç':'C',
    'È':'E','É':'E','Ê':'E','Ë':'E',
    'Ì':'I','Í':'I','Î':'I','Ï':'I',
    'Ñ':'N',
    'Ò':'O','Ó':'O','Ô':'O','Õ':'O','Ö':'O','Ø':'O','Œ':'OE',
    'Ù':'U','Ú':'U','Û':'U','Ü':'U',
    'Ý':'Y','Ÿ':'Y',
    'ß':'ss'
  };

  var slug = inputString.split('').map(function (char) {
    return map[char] || char;
  }).join('');

  slug = slug.toLowerCase()                // minuscules
             .replace(/\s+/g, '-')         // espaces → tirets
             .replace(/[^a-z0-9-]+/g, '')  // retire les caractères indésirables
             .replace(/--+/g, '-')         // tirets multiples → un seul
             .replace(/^-+|-+$/g, '');     // supprime tirets en début/fin

  return slug;
}

/**
 * Checks if a given URL is reachable using an HTTP GET request.
 * Returns status depending on the domain and response code.
 * @param {string} url The URL to check.
 * @returns {string} Status: "Online", "Not Online (code)", or "Invalid URL"
 */
function checkUrl(url) {
  if (!url || typeof url !== 'string' || !url.match(/^https?:\/\//)) {
    return "Invalid URL";
  }
  var logPrefix = `[CheckUrl: ${url.substring(0,50)}...]`;
  try {
    var options = {
      'method': 'get',  // Use GET to avoid HEAD being blocked and follow redirects
      'muteHttpExceptions': true,
      'followRedirects': true,  // Follow the redirect chain to the final page
      'validateHttpsCertificates': true,
      'headers': {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
      }
    };
    var response = UrlFetchApp.fetch(url, options);
    var statusCode = response.getResponseCode();

    if (statusCode >= 200 && statusCode < 400) {
      return "Online";  // Final destination is OK
    } else {
      return `Not Online (${statusCode})`;
    }
  } catch (e) {
    Logger.log(`${logPrefix} Error: ${e.message}`);
    return "Not Online (Error)";
  }
}

/**
 * Creates URL string from range (legacy compatibility function)
 * @param {Array} range - Range of values
 * @param {string} urlBase - Base URL
 * @param {string} fileCode - File code
 * @returns {string} Formatted URL string
 */
function CREATEURLSTRING(range, urlBase, fileCode) {
   if (!Array.isArray(range)) {
     range = (range === null || range === undefined || range === "") ? [] : [[range]]; // Handle single cell or empty
   }
  var output = [];
  range.flat().forEach(function(cellValue, i) {
    if (cellValue !== null && cellValue !== undefined && String(cellValue).trim() !== "") {
       output.push(String(cellValue) + "||" + urlBase + fileCode + "_" + (i + 1) + ".mp3");
    }
  });
  return output.join("##");
} 

/**
 * Vérifie les serveurs IMAGE et MP3 et génère des warnings groupés
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - La feuille à vérifier
 * @returns {Array} Array des warnings trouvés
 */
function checkServerStatus(sheet) {
  const warnings = [];
  
  if (!sheet) {
    sheet = SpreadsheetApp.getActiveSheet();
  }
  
  try {
    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) return warnings; // Pas de données
    
    const data = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();
    
    // Chercher les colonnes SKU, IMAGE Serveur, MP3 Serveur
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const skuCol = headers.indexOf('SKU');
    const imageCol = headers.indexOf('IMAGE Serveur (BC)');
    const mp3Col = headers.indexOf('MP3 Serveur (BD)');
    
    if (skuCol === -1) {
      warnings.push('⚠️ Colonne SKU non trouvée');
      return warnings;
    }
    
    // Grouper les SKU par problème
    const imageProblems = {}; // { "statut": [sku1, sku2, sku3] }
    const mp3Problems = {}; // { "statut": [sku1, sku2, sku3] }
    
    data.forEach((row, index) => {
      const rowNumber = index + 2;
      const sku = row[skuCol];
      
      if (!sku || String(sku).trim() === '') return; // Pas de SKU, on passe
      
      // Vérifier IMAGE Serveur (BC)
      if (imageCol !== -1) {
        const imageStatus = String(row[imageCol]).trim().toLowerCase();
        const originalStatus = String(row[imageCol]).trim();
        if (imageStatus !== 'working' && imageStatus !== '') {
          if (!imageProblems[originalStatus]) {
            imageProblems[originalStatus] = [];
          }
          imageProblems[originalStatus].push(sku);
        }
      }
      
      // Vérifier MP3 Serveur (BD)
      if (mp3Col !== -1) {
        const mp3Status = String(row[mp3Col]).trim().toLowerCase();
        const originalStatus = String(row[mp3Col]).trim();
        if (mp3Status !== 'online' && mp3Status !== '') {
          if (!mp3Problems[originalStatus]) {
            mp3Problems[originalStatus] = [];
          }
          mp3Problems[originalStatus].push(sku);
        }
      }
    });
    
    // Générer les warnings groupés pour IMAGE
    Object.keys(imageProblems).forEach(status => {
      const skus = imageProblems[status];
      const skuList = skus.join(', ');
      warnings.push(`⚠️ SKU ${skuList} - IMAGE Serveur (BC) n'est pas "Working" (statut: "${status}")`);
    });
    
    // Générer les warnings groupés pour MP3
    Object.keys(mp3Problems).forEach(status => {
      const skus = mp3Problems[status];
      const skuList = skus.join(', ');
      warnings.push(`⚠️ SKU ${skuList} - MP3 Serveur (BD) n'est pas "Online" (statut: "${status}")`);
    });
    
  } catch (error) {
    warnings.push(`❌ Erreur lors de la vérification des serveurs: ${error.message}`);
  }
  
  return warnings;
}

/**
 * Affiche les warnings des serveurs sous forme de popup
 * @param {Array} warnings - Array des warnings
 * @param {string} title - Titre du popup
 */
function showServerWarnings(warnings, title = '🚨 Warnings Serveurs') {
  if (warnings.length === 0) {
    SpreadsheetApp.getUi().alert(title, '✅ Tous les serveurs sont OK !', SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }
  
  let message = `${warnings.length} problème(s) détecté(s) :\n\n`;
  warnings.forEach(warning => {
    message += `${warning}\n`;
  });
  
  message += `\n💡 Vérifiez ces SKUs avant l'import pour éviter les erreurs.`;
  
  SpreadsheetApp.getUi().alert(title, message, SpreadsheetApp.getUi().ButtonSet.OK);
}

/**
 * Affiche les warnings dans les logs
 * @param {Array} warnings - Array des warnings
 * @param {string} context - Contexte pour les logs
 */
function logServerWarnings(warnings, context = 'Server Check') {
  if (warnings.length === 0) {
    Logger.log(`[${context}] ✅ Tous les serveurs sont OK`);
    return;
  }

  Logger.log(`[${context}] 🚨 ${warnings.length} problème(s) serveur détecté(s):`);
  warnings.forEach(warning => {
    Logger.log(`[${context}] ${warning}`);
  });
}

/**
 * Display toast notification in Google Sheets
 * @param {string} message - Message to display
 * @param {string} title - Toast title (default: 'Import')
 * @param {number} timeoutSeconds - Duration in seconds (default: 3)
 */
function showToast(message, title = 'Import', timeoutSeconds = 3) {
  try {
    SpreadsheetApp.getActiveSpreadsheet().toast(message, title, timeoutSeconds);
  } catch (error) {
    Logger.log('[TOAST] ' + message);
  }
} 