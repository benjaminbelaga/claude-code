function onOpen() {
  const ui = SpreadsheetApp.getUi();
  const menu = ui.createMenu('WP Import Dashboard');
  
  // --- Tool & Utility Menus ---
  const metadataMenu = ui.createMenu('📊 metadata');
  metadataMenu.addItem('🤖 AI Parsing (OpenAI Direct)', 'parseMetadataDirectWithOpenAISafe');
  metadataMenu.addItem('🤖 AI Parsing (Make.com)', 'triggerAIParsing');
  metadataMenu.addSeparator();
  metadataMenu.addItem('⚙️ Setup OpenAI API Key', 'setupOpenAIKeySafe');
  metadataMenu.addItem('🧪 Test OpenAI Connection', 'testOpenAIConnection');
  metadataMenu.addItem('🧪 Test Single Row Parsing', 'testSingleMetadataParsingSafe');
  metadataMenu.addSeparator();
  metadataMenu.addItem('💰 Cost Comparison OpenAI vs Make.com', 'compareOpenAIvsMakeCom');
  metadataMenu.addSeparator();
  metadataMenu.addItem('Run metadata corrector', 'runSmartValidator');
  metadataMenu.addItem('Update metadata', 'updateMetadata');
  metadataMenu.addSeparator();
  metadataMenu.addItem('🧠 Analyse Intelligente Pré-Import', 'runIntelligentAnalysis');
  metadataMenu.addItem('🧪 Test Analyse Intelligente (Debug)', 'testAnalyseIntelligente');
  metadataMenu.addItem('🚨 Check Server Status', 'checkServerStatusMenu');
  metadataMenu.addItem('🔧 Run corrector + Server Check', 'runSmartValidatorWithServerCheck');
  menu.addSubMenu(metadataMenu);

  menu.addSeparator();

  // --- Main Site Menus ---
  const yoyakuMenu = ui.createMenu('🛒 YOYAKU.io Tools');
  yoyakuMenu.addItem('Import NEW products', 'runYoyakuNewImport');
  yoyakuMenu.addItem('Import PRE-ORDER products', 'runYoyakuPreOrderImport');
  menu.addSubMenu(yoyakuMenu);

  const yydMenu = ui.createMenu('📦 YYDistribution Tools');
  yydMenu.addItem('Import products', 'runYYDImport');
  menu.addSubMenu(yydMenu);

  const barcelonaMenu = ui.createMenu('🏬 BARCELONA Tools');
  barcelonaMenu.addItem('Import products', 'runBarcelonaImport');
  menu.addSubMenu(barcelonaMenu);
  
  // NEW API Direct Menu (Fast & Reliable)
  const apiDirectMenu = ui.createMenu('⚡ Update Tools (API Direct NEW)');

  // Fetch Data Function (NEW - Top Priority)
  apiDirectMenu.addItem('📊 Fetch Data API update stock', 'fetchDataAPIUpdateStock');
  apiDirectMenu.addSeparator();

  // Phase 1 Functions (Existing)
  apiDirectMenu.addItem('🚀 Update Picking (Direct API)', 'updatePickingDirectAPI');
  apiDirectMenu.addSeparator();
  apiDirectMenu.addItem('📦 Update Stock YOYAKU (Direct API)', 'updateYoyakuStockDirectAPI');
  apiDirectMenu.addItem('📦 Update Stock YYD (Direct API)', 'updateYYDStockDirectAPI');
  apiDirectMenu.addItem('📅 Update Release Date YYD (Direct API)', 'updateReleaseDateDirectAPI');
  apiDirectMenu.addSeparator();
  
  // Phase 2 NEW: Import 852 - Create New Products
  const import852Menu = ui.createMenu('🚀 Create New Products (Import 852)');
  import852Menu.addItem('📦 Create New Products (API Direct)', 'processImport852NewProductsAPI');
  import852Menu.addSeparator();
  import852Menu.addItem('🧪 Test Import 852 API', 'testImport852API');
  import852Menu.addItem('🔍 Validate Configuration', 'validateImport852Config');
  import852Menu.addItem('📊 View Dashboard', 'showImport852Dashboard');
  import852Menu.addSeparator();
  import852Menu.addItem('⚙️ Setup Configuration', 'setupImport852Configuration');
  import852Menu.addItem('🔄 Reset Configuration', 'resetImport852Configuration');
  import852Menu.addSeparator();
  import852Menu.addItem('📋 Legacy WP Import Instructions', 'showLegacyImport852Instructions');
  apiDirectMenu.addSubMenu(import852Menu);
  
  apiDirectMenu.addSeparator();
  apiDirectMenu.addItem('🧪 Test Stock Update', 'testStockUpdate');
  apiDirectMenu.addItem('🧪 Test Release Date Update', 'testReleaseDateUpdate');
  menu.addSubMenu(apiDirectMenu);
  
  // Legacy Update Menu (Keep for transition)
  const updateMenu = ui.createMenu('🔄 Update Tools (Legacy)');
  updateMenu.addItem('Update Yoyaku.io Stock', 'runYoyakuStockUpdate');
  updateMenu.addItem('Update YYD Stock', 'runYYDStockUpdate');
  // updateMenu.addItem('Update Picking Status (Yoyaku)', 'runPickingUpdate'); // Hidden as requested
  updateMenu.addItem('Update Release Dates (YYD)', 'runReleaseDateUpdate');
  updateMenu.addSeparator();
  updateMenu.addItem('🧪 TEST DIRECT Yoyaku Stock', 'testDirectYoyakuStock');
  updateMenu.addItem('🧪 TEST DIRECT YYD Stock', 'testDirectYYDStock');
  menu.addSubMenu(updateMenu);

  menu.addSeparator();

  // --- Other Tools Triggers ---

  const otherMenu = ui.createMenu('🔧 Other Tools');
  otherMenu.addItem('🔍 Analyze Current Sheet', 'runSheetAnalyzer');
  otherMenu.addItem('📤 Export Data to Drive', 'runExportToDrive');
  otherMenu.addItem('🔗 Manual Pabbly Stock Webhook', 'runManualPabblyWebhook');
  otherMenu.addSeparator();
  otherMenu.addItem('🗑️ Delete Bulk Products (Yoyaku)', 'runDeleteBulkProducts');
  
  // Ajouter sous-menu pour les fonctions utilitaires
  const utilsMenu = ui.createMenu('⚙️ Utils');
  utilsMenu.addItem('🔤 Test Slugify Function', 'testSlugifyFunction');
  utilsMenu.addItem('🌐 Test Check URL Function', 'testCheckUrlFunction');
  utilsMenu.addSeparator();
  utilsMenu.addItem('🔍 Diagnostic Automatique Complet', 'runFullDiagnostic');
  utilsMenu.addItem('🧠 Diagnostic Analyse Intelligente', 'diagnoseIntelligentAnalysis');
  utilsMenu.addItem('🚀 Test Automatique Tous Imports', 'testAllImports');
  otherMenu.addSubMenu(utilsMenu);
  
  menu.addSubMenu(otherMenu);

  const diagnosticsMenu = ui.createMenu('🔍 Diagnostics');
  diagnosticsMenu.addItem('🎯 Test Système Complet', 'testSystemeComplet');
  diagnosticsMenu.addItem('🧪 Test Stock Update Flow', 'testStockUpdateFlow');
  diagnosticsMenu.addItem('🌐 Test Connectivité', 'testConnectivite');
  diagnosticsMenu.addSeparator();
  diagnosticsMenu.addItem('Test Site Connections', 'runDiagnosticsConnectionTest');
  diagnosticsMenu.addItem('🧪 Test Configuration', 'testConfiguration');
  diagnosticsMenu.addItem('🧪 Test Stock Update Flow (Legacy)', 'testYoyakuStockUpdateFlow');
  diagnosticsMenu.addSeparator();
  diagnosticsMenu.addItem('🔬 Debug Ultra Complet', 'debugUltraStockUpdate');
  diagnosticsMenu.addItem('🔄 Compare Ancien vs Nouveau', 'compareOldVsNewSystem');
  diagnosticsMenu.addItem('💾 Force Refresh Cache', 'forceRefreshCache');
  diagnosticsMenu.addSeparator();
  diagnosticsMenu.addItem('🔍 WordPress Response Diagnostic', 'testWordPressResponseDiagnostic');
  
  // API Simulations & Live Tests Sub-menu
  const apiSimMenu = ui.createMenu('🎯 API Tests & Validation');
  apiSimMenu.addItem('🚀 Complete API Sites Simulation', 'runCompleteAPISitesSimulation');
  apiSimMenu.addSeparator();
  apiSimMenu.addItem('📍 Picking Update Detail', 'testPickingUpdateDetailed');
  apiSimMenu.addItem('📊 Stock Update Detail', 'testStockUpdateDetailed');
  apiSimMenu.addSeparator();
  apiSimMenu.addItem('🔍 Validate API Endpoints', 'validateAPIEndpoints');
  apiSimMenu.addSeparator();
  apiSimMenu.addItem('⚡ Quick Connectivity Test', 'testQuickConnectivity');
  apiSimMenu.addItem('🔴 LIVE API Tests (PRODUCTION)', 'runLiveAPITests');
  diagnosticsMenu.addSubMenu(apiSimMenu);
  
  menu.addSubMenu(diagnosticsMenu);
  
  const helpMenu = ui.createMenu('🛡️ Help & Setup');
  helpMenu.addItem('🔐 Setup Drive Permissions', 'setupDrivePermissions');
  helpMenu.addItem('🎼 Setup Genre Corrector Sheet', 'setupGenreCorrectionsSheet');
  helpMenu.addItem('📦 Setup Distributor Corrector Sheet', 'setupDistributorCorrectionsSheet');
  helpMenu.addItem('🚚 Setup Official Genres Sheet', 'setupOfficialGenresSheet');
  helpMenu.addSeparator();
  helpMenu.addItem('📖 Show System Docs', 'showSystemDocs');
  helpMenu.addItem('☁️ Cloudflare Help', 'showCloudflareHelp');
  helpMenu.addItem('⚙️ Show Full Config', 'showConfig');
  menu.addSubMenu(helpMenu);

  // --- Deejay.de Scraper Menu (ARCHIVED) ---
  // Fonctionnalité archivée dans _ARCHIVE_EXPERIMENTAL/

  menu.addToUi();
}

/**
 * FONCTION SIMPLE POUR AUTORISER LES PERMISSIONS
 */
function authorizeGoogleSheets() {
  try {
    // Ouvrir le spreadsheet pour déclencher l'autorisation
    const spreadsheet = SpreadsheetApp.openById("1L55TCdfJJxZOHyWqx13XKi58pNqNt3wrUm0C4MIs6X4");
    const sheet = spreadsheet.getActiveSheet();
    
    Logger.log("✅ Permissions Google Sheets autorisées avec succès !");
    
    // Test d'écriture
    const testData = ["TEST", "Autorisation", "Réussie", new Date().toISOString()];
    sheet.appendRow(testData);
    
    return "✅ Permissions OK - Test d'écriture réussi";
    
  } catch (error) {
    Logger.log("❌ Erreur autorisation: " + error.toString());
    return "❌ Erreur: " + error.toString();
  }
}

// --- Import Triggers ---

function runYoyakuNewImport() {
  // Vérification des serveurs avant l'import
  if (!checkServersBeforeImport('Yoyaku New Import')) {
    return; // L'utilisateur a choisi d'annuler à cause des warnings
  }
  
  runYoyakuNewImportComplete();
}

function runYoyakuPreOrderImport() {
  // Vérification des serveurs avant l'import
  if (!checkServersBeforeImport('Yoyaku Pre-Order Import')) {
    return; // L'utilisateur a choisi d'annuler à cause des warnings
  }
  
  runYoyakuPreOrderImportComplete();
}

function runYYDImport() {
  // Vérification des serveurs avant l'import
  if (!checkServersBeforeImport('YYD Import')) {
    return; // L'utilisateur a choisi d'annuler à cause des warnings
  }
  
  runYYDImportComplete();
}

function runBarcelonaImport() {
  // Vérification des serveurs avant l'import
  if (!checkServersBeforeImport('Barcelona Import')) {
    return; // L'utilisateur a choisi d'annuler à cause des warnings
  }
  
  runBarcelonaImportComplete();
}

// --- Update Triggers ---

function runYoyakuStockUpdate() {
  // Force cache refresh by adding a comment
  Logger.log('[CACHE REFRESH] Running Yoyaku stock update with COMPLETE processing');
  
  // Use the complete import system with processing loop
  const site = "www.yoyaku.io";
  const importId = '803';
  const key = Config.getImportKey();
  const logPrefix = `[Yoyaku Stock Update ${importId}]`;
  
  Logger.log(`${logPrefix} Starting COMPLETE stock update with processing...`);
  SpreadsheetApp.getActiveSpreadsheet().toast(`Starting Yoyaku Stock Update (${importId}) with processing...`);

  try {
    const success = handleWPImportComplete(`https://${site}/wp-load.php`, importId, key, {});

    if (success) {
      Logger.log(`${logPrefix} Stock update completed successfully.`);
      // Trigger Pabbly stock update
      try {
        filterAndSendToPabblyForStockUpdate();
        Logger.log(`${logPrefix} Pabbly stock update triggered.`);
        SpreadsheetApp.getUi().alert(`🎉 Yoyaku Stock Update COMPLETED!\n\n• Import finished successfully\n• Pabbly webhook triggered`);
      } catch (pabblyError) {
        Logger.log(`${logPrefix} Pabbly trigger failed: ${pabblyError.message}`);
        SpreadsheetApp.getUi().alert(`🎉 Yoyaku Stock Update COMPLETED!\n⚠️ Pabbly trigger failed: ${pabblyError.message}`);
      }
    } else {
      Logger.log(`${logPrefix} Stock update failed.`);
      SpreadsheetApp.getUi().alert(`❌ Yoyaku Stock Update failed. Check logs for details.`);
    }
  } catch (error) {
    Logger.log(`${logPrefix} CRITICAL ERROR: ${error.message}\nStack: ${error.stack}`);
    SpreadsheetApp.getUi().alert(`❌ Error during stock update: ${error.message}`);
  }
}

function runYYDStockUpdate() {
  runYYDStockUpdateComplete();
}

function runPickingUpdate() {
  runPickingUpdateComplete();
}

function runReleaseDateUpdate() {
  runReleaseDateUpdateComplete();
}

// --- Other Tools Triggers ---

function runDeleteBulkProducts() {
  const ui = SpreadsheetApp.getUi();
  const logPrefix = `[DeleteBulk]`;

  // First, very explicit confirmation
  const firstConfirm = ui.alert(
    '🚨 ATTENTION: DANGER ZONE',
    'You are about to run the BULK DELETE import (ID: 810) on Yoyaku.io.\n\nThis action will PERMANENTLY DELETE products from the live site based on the data in your sheet.\n\nThis is irreversible. Are you absolutely sure you want to proceed?',
    ui.ButtonSet.YES_NO
  );

  if (firstConfirm !== ui.Button.YES) {
    Logger.info(`${logPrefix} User cancelled the operation at the first confirmation.`);
    SpreadsheetApp.getActiveSpreadsheet().toast('Delete operation cancelled.');
    return;
  }

  // Second, final confirmation
  const secondConfirm = ui.alert(
    '🚨 FINAL CONFIRMATION',
    'Last chance. You are confirming that you want to delete products from YOYAKU.IO.\n\nThere is no undo.',
    ui.ButtonSet.YES_NO
  );

  if (secondConfirm !== ui.Button.YES) {
    Logger.info(`${logPrefix} User cancelled the operation at the final confirmation.`);
    SpreadsheetApp.getActiveSpreadsheet().toast('Delete operation cancelled.');
    return;
  }

  Logger.info(`${logPrefix} User confirmed deletion. Calling complete import system.`);
  // Use complete import system with double confirmation already handled
  runDeleteBulkProductsComplete();
}

function runExportToDrive() {
  const logPrefix = `[ExportToDrive]`;
  Logger.info(`${logPrefix} User triggered export to Drive.`);
  runExportToDriveComplete();
}

function runManualPabblyWebhook() {
  const logPrefix = `[ManualPabbly]`;
  Logger.info(`${logPrefix} User triggered manual Pabbly stock webhook.`);
  
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert(
    'Manual Pabbly Webhook Trigger',
    'This will manually send stock data from the "update stock" sheet to Pabbly for all rows with a value in the "_manage_stock" column.\n\nContinue?',
    ui.ButtonSet.YES_NO
  );

  if (response === ui.Button.YES) {
    try {
      filterAndSendToPabblyForStockUpdate();
      ui.alert('✅ Success', 'Stock data has been sent to Pabbly. Check logs for details.');
    } catch (e) {
      Logger.log(`${logPrefix} Error: ${e.message}`);
      ui.alert('❌ Error', `Failed to send data to Pabbly: ${e.message}`);
    }
      } else {
    Logger.info(`${logPrefix} User cancelled operation.`);
    SpreadsheetApp.getActiveSpreadsheet().toast('Operation cancelled.');
  }
}

function runSheetAnalyzer() {
  const logPrefix = `[SheetAnalyzer]`;
  Logger.info(`${logPrefix} User triggered sheet analysis.`);
  
  try {
    const analysis = analyzeImportComplexity();
    
    let message = `🧠 SHEET ANALYSIS RESULTS:\n\n` +
                  `Total Rows: ${analysis.totalRows}\n` +
                  `Valid Products (SKU): ${analysis.validSKUs}\n` +
                  `Empty Rows: ${analysis.emptyRows}\n\n` +
                  `COMPLEXITY:\n` +
                  `Complex Products: ${analysis.complexProducts}\n` +
                  `(Products with images, variants, or multiple categories)\n\n` +
                  `TIMING ESTIMATE:\n` +
                  `Estimated Time: ~${Math.ceil(analysis.estimatedTime / 60)} minutes\n` +
                  `Recommended Timeout: ${Math.ceil(analysis.timeoutRecommended / 60)} minutes\n` +
                  `Processing Interval: ${analysis.processingInterval / 1000} seconds per check`;

    SpreadsheetApp.getUi().alert('Sheet Analysis', message, SpreadsheetApp.getUi().ButtonSet.OK);

  } catch (e) {
    Logger.log(`${logPrefix} Error: ${e.message}`);
    SpreadsheetApp.getUi().alert('❌ Error', `Failed to analyze the sheet: ${e.message}`);
  }
}

// --- Diagnostics & Help Triggers ---

function runDiagnosticsConnectionTest() {
  runConnectionTest();
}

function showConfig() {
  const config = Config.showCurrentConfig();
  const message = `Current Configuration (v${Config.VERSION}):\n\n${JSON.stringify(config, null, 2)}`;
  SpreadsheetApp.getUi().alert('Full Configuration', message, SpreadsheetApp.getUi().ButtonSet.OK);
}

/**
 * Creates and sets up the 'Official Genres' sheet.
 * This sheet will serve as the single source of truth for genre data validation.
 */
function setupOfficialGenresSheet() {
  const sheetName = 'Genres Officiels';
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(sheetName);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
    Logger.log(`Sheet "${sheetName}" created.`);
  }

  // Clear the sheet and set it up
  sheet.clear();
  const header = ['Official Genre List (Source: yoyaku.io)'];
  const headerRange = sheet.getRange('A1');
  headerRange.setValue(header[0]);
  headerRange.setFontWeight('bold');
  sheet.getRange('B1').setValue('<- Paste the list from yoyaku.io here, in column A').setFontStyle('italic').setFontColor('#666');

  sheet.autoResizeColumn(1);
  spreadsheet.setActiveSheet(sheet);

  SpreadsheetApp.getUi().alert(
    'Sheet Ready: "Genres Officiels"',
    'The sheet has been created.\n\nPlease copy the official genre list from yoyaku.io and paste it into column A of this new sheet.',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
} 

// === NOUVELLES FONCTIONS DE TEST DIRECT ===

/**
 * Test direct YOYAKU Stock - Bypass complet du système
 */
function testDirectYoyakuStock() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    // URL générée dynamiquement avec Config
    const importKey = Config.getImportKey();
    const directUrl = `https://www.yoyaku.io/wp-load.php?import_key=${importKey}&import_id=803&action=trigger&hpos=1&nocache=${Date.now()}&rand=${Math.random()}`;
    
    console.log('🧪 TEST DIRECT YOYAKU STOCK');
    console.log('URL:', directUrl);
    
    ui.alert('🧪 Test Direct Yoyaku Stock', 
             `URL générée directement (bypass complet):\n\n${directUrl}\n\nCette URL sera testée...`, 
             ui.ButtonSet.OK);
    
    // Test de la requête
    const options = {
      'method': 'get',
      'muteHttpExceptions': true,
      'followRedirects': true,
      'headers': {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    };
    
    const response = UrlFetchApp.fetch(directUrl, options);
    const statusCode = response.getResponseCode();
    const content = response.getContentText();
    
    console.log('Status:', statusCode);
    console.log('Response:', content.substring(0, 200));
    
    if (statusCode === 200) {
      if (content.toLowerCase().includes('wrong key')) {
        ui.alert('❌ Erreur', 'Import Key incorrecte détectée dans la réponse!', ui.ButtonSet.OK);
      } else if (content.toLowerCase().includes('import not found')) {
        ui.alert('❌ Erreur', 'Import ID 803 non trouvé sur le serveur!', ui.ButtonSet.OK);
      } else {
        ui.alert('✅ Succès!', `Test direct réussi!\n\nStatus: ${statusCode}\nRéponse: ${content.substring(0, 150)}...`, ui.ButtonSet.OK);
      }
    } else {
      ui.alert('❌ Erreur HTTP', `Status Code: ${statusCode}\nRéponse: ${content}`, ui.ButtonSet.OK);
    }
    
  } catch (e) {
    console.error('Erreur test direct:', e.message);
    ui.alert('❌ Erreur Critique', `Erreur durant le test direct: ${e.message}`, ui.ButtonSet.OK);
  }
}

/**
 * Test direct YYD Stock - Bypass complet du système
 */
function testDirectYYDStock() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    // URL générée dynamiquement avec Config
    const importKey = Config.getImportKey();
    const directUrl = `https://www.yydistribution.fr/wp-load.php?import_key=${importKey}&import_id=953&action=trigger&hpos=1&nocache=${Date.now()}&rand=${Math.random()}`;
    
    console.log('🧪 TEST DIRECT YYD STOCK');
    console.log('URL:', directUrl);
    
    ui.alert('🧪 Test Direct YYD Stock', 
             `URL générée directement (bypass complet):\n\n${directUrl}\n\nCette URL sera testée...`, 
             ui.ButtonSet.OK);
    
    // Test de la requête
    const options = {
      'method': 'get',
      'muteHttpExceptions': true,
      'followRedirects': true,
      'headers': {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    };
    
    const response = UrlFetchApp.fetch(directUrl, options);
    const statusCode = response.getResponseCode();
    const content = response.getContentText();
    
    console.log('Status:', statusCode);
    console.log('Response:', content.substring(0, 200));
    
    if (statusCode === 200) {
      if (content.toLowerCase().includes('wrong key')) {
        ui.alert('❌ Erreur', 'Import Key incorrecte détectée dans la réponse!', ui.ButtonSet.OK);
      } else if (content.toLowerCase().includes('import not found')) {
        ui.alert('❌ Erreur', 'Import ID 953 non trouvé sur le serveur!', ui.ButtonSet.OK);
      } else {
        ui.alert('✅ Succès!', `Test direct réussi!\n\nStatus: ${statusCode}\nRéponse: ${content.substring(0, 150)}...`, ui.ButtonSet.OK);
      }
    } else {
      ui.alert('❌ Erreur HTTP', `Status Code: ${statusCode}\nRéponse: ${content}`, ui.ButtonSet.OK);
    }
    
  } catch (e) {
    console.error('Erreur test direct:', e.message);
    ui.alert('❌ Erreur Critique', `Erreur durant le test direct: ${e.message}`, ui.ButtonSet.OK);
  }
} 

/**
 * Test function for slugify utility
 */
function testSlugifyFunction() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    // Test cases for slugify function
    const testCases = [
      { input: 'Björk & Radiohead', expected: 'bjork-radiohead' },
      { input: 'Café de la Paix', expected: 'cafe-de-la-paix' },
      { input: 'Éric Prydz - Pjanoo', expected: 'eric-prydz-pjanoo' },
      { input: 'Thé à la menthe', expected: 'the-a-la-menthe' },
      { input: 'Naïve Records', expected: 'naive-records' },
      { input: 'Motörhead', expected: 'motorhead' }
    ];
    
    let results = '🔤 TEST SLUGIFY FUNCTION\n\n';
    let allPassed = true;
    
    testCases.forEach(testCase => {
      const result = slugify(testCase.input);
      const passed = result === testCase.expected;
      if (!passed) allPassed = false;
      
      results += `Input: "${testCase.input}"\n`;
      results += `Expected: "${testCase.expected}"\n`;
      results += `Got: "${result}"\n`;
      results += `Status: ${passed ? '✅ PASS' : '❌ FAIL'}\n\n`;
    });
    
    results += `\nOverall: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`;
    
    ui.alert('Slugify Test Results', results, ui.ButtonSet.OK);
    
  } catch (error) {
    ui.alert('❌ Error Testing Slugify', `Error: ${error.message}`, ui.ButtonSet.OK);
  }
}

/**
 * Test function for checkUrl utility
 */
function testCheckUrlFunction() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    // Test cases for checkUrl function
    const testUrls = [
      'https://www.google.com',
      'https://www.yoyaku.io',
      'https://www.yydistribution.fr',
      'https://httpstat.us/200',
      'https://httpstat.us/404',
      'not-a-url',
      'https://this-domain-does-not-exist-12345.com'
    ];
    
    let results = '🌐 TEST CHECK URL FUNCTION\n\n';
    results += 'Testing URL accessibility...\n\n';
    
    testUrls.forEach(url => {
      const result = checkUrl(url);
      results += `URL: ${url}\n`;
      results += `Status: ${result}\n\n`;
    });
    
    results += '\nNote: Results may vary based on network conditions and site availability.';
    
    ui.alert('Check URL Test Results', results, ui.ButtonSet.OK);
    
  } catch (error) {
    ui.alert('❌ Error Testing Check URL', `Error: ${error.message}`, ui.ButtonSet.OK);
  }
} 

/**
 * Lance l'analyse intelligente pré-import (pour test)
 */
function runIntelligentAnalysis() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    ui.alert('🧠 Analyse Intelligente', 'Démarrage de l\'analyse intelligente...', ui.ButtonSet.OK);
    
    // Analyser la complexité d'import
    const analysis = analyzeImportComplexity();
    
    // Afficher l'analyse intelligente pré-import
    const userContinue = showIntelligentPreImportInfo(analysis, 'Test Analyse Intelligente');
    
    if (userContinue) {
      ui.alert('✅ Analyse Terminée', 'L\'utilisateur a choisi de continuer l\'import.\n\n(Ceci était un test - aucun import réel n\'a été lancé)', ui.ButtonSet.OK);
    } else {
      ui.alert('❌ Analyse Annulée', 'L\'utilisateur a choisi d\'annuler l\'import.\n\n(Ceci était un test - aucun import réel n\'a été lancé)', ui.ButtonSet.OK);
    }
    
  } catch (error) {
    ui.alert('❌ Erreur Analyse', `Erreur: ${error.message}`, ui.ButtonSet.OK);
  }
}

/**
 * Vérifie le statut des serveurs et affiche les warnings
 */
function checkServerStatusMenu() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    ui.alert('🚨 Vérification Serveurs', 'Vérification des serveurs IMAGE et MP3 en cours...', ui.ButtonSet.OK);
    
    const sheet = SpreadsheetApp.getActiveSheet();
    const warnings = checkServerStatus(sheet);
    
    logServerWarnings(warnings, 'Manual Server Check');
    showServerWarnings(warnings, '🚨 Résultats Vérification Serveurs');
    
  } catch (error) {
    ui.alert('❌ Erreur Vérification Serveurs', `Erreur: ${error.message}`, ui.ButtonSet.OK);
  }
}

/**
 * Exécute le metadata corrector avec vérification des serveurs
 */
function runSmartValidatorWithServerCheck() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    // D'abord afficher une confirmation
    const response = ui.alert(
      '🔧 Metadata Corrector + Server Check',
      'Cette action va :\n1. Exécuter le metadata corrector\n2. Vérifier les serveurs IMAGE et MP3\n\nContinuer ?',
      ui.ButtonSet.YES_NO
    );
    
    if (response !== ui.Button.YES) {
      return;
    }
    
    // Exécuter le metadata corrector
    ui.alert('🔧 Étape 1/2', 'Exécution du metadata corrector...', ui.ButtonSet.OK);
    
    // Exécuter le metadata corrector
    runSmartValidator();
    
    // Vérifier les serveurs
    ui.alert('🚨 Étape 2/2', 'Vérification des serveurs...', ui.ButtonSet.OK);
    
    const sheet = SpreadsheetApp.getActiveSheet();
    const warnings = checkServerStatus(sheet);
    
    logServerWarnings(warnings, 'Post-Corrector Server Check');
    
    // Afficher les résultats
    if (warnings.length > 0) {
      showServerWarnings(warnings, '🚨 Warnings après Metadata Corrector');
    } else {
      ui.alert('✅ Succès Complet', 'Metadata corrector terminé !\n✅ Tous les serveurs sont OK !', ui.ButtonSet.OK);
    }
    
  } catch (error) {
    ui.alert('❌ Erreur Metadata + Server Check', `Erreur: ${error.message}`, ui.ButtonSet.OK);
  }
}

/**
 * Fonction helper pour l'analyse intelligente pré-import (remplace checkServersBeforeImport)
 * @param {string} context - Contexte de l'import (ex: "Yoyaku Import")
 * @returns {boolean} - True si on peut continuer, False si l'utilisateur annule
 */
function checkServersBeforeImport(context = 'Import') {
  try {
    // Analyser la complexité d'import
    const analysis = analyzeImportComplexity();
    
    // Afficher l'analyse intelligente pré-import avec warnings serveur intégrés
    return showIntelligentPreImportInfo(analysis, context);
    
  } catch (error) {
    Logger.log(`[${context}] Erreur analyse pré-import: ${error.message}`);
    
    // Fallback vers la méthode simple en cas d'erreur
    const ui = SpreadsheetApp.getUi();
    const response = ui.alert(
      `⚠️ ${context} - Analyse Simplifiée`,
      `Erreur d'analyse: ${error.message}\n\nContinuer l'import ?`,
      ui.ButtonSet.YES_NO
    );
    
    return response === ui.Button.YES;
  }
} 

function testAnalyseIntelligente() {
  Logger.log('Test Analyse Intelligente - Début');
  
  try {
    // Test 1: Vérifier que la fonction analyzeImportComplexity fonctionne
    Logger.log('Test 1: analyzeImportComplexity');
    const analysis = analyzeImportComplexity();
    Logger.log('Analysis result: ' + JSON.stringify(analysis, null, 2));
    
    // Test 2: Vérifier que showIntelligentPreImportInfo fonctionne
    Logger.log('Test 2: showIntelligentPreImportInfo');
    const result = showIntelligentPreImportInfo(analysis, 'Test Analyse Intelligente');
    Logger.log('User response: ' + result);
    
    Logger.log('Test Analyse Intelligente - Succès');
    return true;
    
  } catch (error) {
    Logger.log('Test Analyse Intelligente - Erreur: ' + error.message);
    Logger.log('Stack trace: ' + error.stack);
    SpreadsheetApp.getUi().alert('Erreur Test', 'Erreur: ' + error.message, SpreadsheetApp.getUi().ButtonSet.OK);
    return false;
  }
} 

// --- AI Parsing Functions ---

/**
 * Reads data from "metadata creator" sheet, sanitizes it,
 * writes back the sanitized version, and sends the data to a Make.com webhook.
 */
function triggerAIParsing() {
  const sheetName = "metadata creator";
  const webhookUrl = "https://hook.eu2.make.com/vfl6tgunr9djqfy4aum2vzjm3fugu90j";
  const logPrefix = '[AI Parsing V3]';
  Logger.log(`${logPrefix} Starting process from sheet "${sheetName}"`);
  SpreadsheetApp.getActiveSpreadsheet().toast('Starting AI Parsing...', `${logPrefix} Status`, 5);

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    const msg = `Error: Sheet "${sheetName}" not found.`;
    Logger.log(`${logPrefix} ${msg}`);
    SpreadsheetApp.getUi().alert(msg);
    return;
  }

  const dataRange = sheet.getDataRange();
  const data = dataRange.getDisplayValues(); // Important pour dropdowns
  const headers = data[0].map(h => h.trim().toLowerCase());
  const HEADER_ROW = 1;

  // Trouver les colonnes dynamiquement, insensible à la casse
  const distCol = headers.indexOf("distributor") + 1;
  const skuCol = headers.indexOf("sku") + 1;
  const priceCol = headers.indexOf("price") + 1;
  const metadataCol = headers.indexOf("bloc_metadata") + 1;
  const sanitizedCol = headers.indexOf("bloc metadata santizerforjson") + 1;

  if (distCol < 1 || skuCol < 1 || priceCol < 1 || metadataCol < 1 || sanitizedCol < 1) {
    Logger.log(`${logPrefix} One or more columns not found!`);
    SpreadsheetApp.getUi().alert("Erreur: Vérifie les noms exacts des colonnes (distributor, sku, price, bloc_metadata, bloc metadata santizerForJson)");
    return;
  }

  for (let i = HEADER_ROW; i < data.length; i++) {
    const currentRow = i + 1;
    const distributor = data[i][distCol - 1];
    const sku = data[i][skuCol - 1];
    const price = data[i][priceCol - 1];
    const blocMetadata = data[i][metadataCol - 1];

    // Sanitize metadata
    const sanitizedMetadata = sanitizeTextForJSON(blocMetadata);
    sheet.getRange(currentRow, sanitizedCol).setValue(sanitizedMetadata);

    // Préparer le payload
    const rowData = {
      distributor: distributor,
      sku: sku,
      price: price,
      bloc_metadata: blocMetadata,
      bloc_metadata_santizerForJson: sanitizedMetadata
    };

    // Envoyer à Make.com
    try {
      const options = {
        method: "post",
        contentType: "application/json",
        payload: JSON.stringify(rowData)
      };
      UrlFetchApp.fetch(webhookUrl, options);
      Logger.log(`${logPrefix} Sent row ${currentRow}: ${JSON.stringify(rowData)}`);
    } catch (e) {
      Logger.log(`${logPrefix} Error sending row ${currentRow}: ${e.message}`);
    }
  }
}

// Fonction de nettoyage JSON simple
function sanitizeTextForJSON(text) {
  if (!text) return "";
  return String(text)
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "")
    .replace(/"/g, '\\"')
    .replace(/\u2028/g, "")
    .replace(/\u2029/g, "");
} 