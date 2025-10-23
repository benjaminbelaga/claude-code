/**
 * CLEAN MENU STRUCTURE - YOYAKU WP Import Dashboard
 * Version: 3.0.0 - Épuré et optimisé
 * Date: 2025-10-23
 *
 * Changes from v2.0:
 * - Removed duplicate/legacy stock update functions
 * - Removed nested submenus (flat structure)
 * - Moved "Create New Products" out of stock update menu
 * - Consolidated test functions
 */

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  const menu = ui.createMenu('WP Import Dashboard');

  // ========================================
  // MAIN STOCK UPDATE MENU (WEBMASTER v2.0)
  // ========================================
  const updateStockMenu = ui.createMenu('⚡ Update Stock');
  updateStockMenu.addItem('🧹 Clear Calculated Data', 'clearCalculatedData');
  updateStockMenu.addItem('📊 Fetch Data & Calculate', 'fetchDataAndCalculate');
  updateStockMenu.addItem('📦 Update Stock YOYAKU v2.0', 'updateYoyakuStockDirectAPI_V2_Webmaster');
  updateStockMenu.addSeparator();
  updateStockMenu.addItem('📊 Show Calculation Report', 'showCalculationReport');
  updateStockMenu.addItem('🧪 Test Calculations', 'testCalculations');
  menu.addSubMenu(updateStockMenu);

  menu.addSeparator();

  // ========================================
  // METADATA PARSING & CORRECTION
  // ========================================
  const metadataMenu = ui.createMenu('📊 Metadata Tools');
  metadataMenu.addItem('🤖 AI Parsing (OpenAI)', 'parseMetadataDirectWithOpenAISafe');
  metadataMenu.addItem('🧠 Smart Validator', 'runSmartValidator');
  metadataMenu.addItem('🔧 Update Metadata', 'updateMetadata');
  metadataMenu.addSeparator();
  metadataMenu.addItem('⚙️ Setup OpenAI API Key', 'setupOpenAIKeySafe');
  metadataMenu.addItem('🧪 Test OpenAI Connection', 'testOpenAIConnection');
  menu.addSubMenu(metadataMenu);

  menu.addSeparator();

  // ========================================
  // PRODUCT IMPORT TOOLS
  // ========================================
  const importMenu = ui.createMenu('📦 Import Products');
  importMenu.addItem('🛒 Import NEW (YOYAKU.io)', 'runYoyakuNewImport');
  importMenu.addItem('⏰ Import PRE-ORDER (YOYAKU.io)', 'runYoyakuPreOrderImport');
  importMenu.addSeparator();
  importMenu.addItem('📦 Import Products (YYDistribution)', 'runYYDImport');
  importMenu.addSeparator();
  importMenu.addItem('🏬 Import Products (BARCELONA)', 'runBarcelonaImport');
  menu.addSubMenu(importMenu);

  menu.addSeparator();

  // ========================================
  // CREATE NEW PRODUCTS (Import 852)
  // ========================================
  const import852Menu = ui.createMenu('🚀 Create Products (852)');
  import852Menu.addItem('📦 Create New Products API', 'processImport852NewProductsAPI');
  import852Menu.addSeparator();
  import852Menu.addItem('🧪 Test Import 852', 'testImport852API');
  import852Menu.addItem('📊 View Dashboard', 'showImport852Dashboard');
  import852Menu.addSeparator();
  import852Menu.addItem('⚙️ Setup Configuration', 'setupImport852Configuration');
  menu.addSubMenu(import852Menu);

  menu.addSeparator();

  // ========================================
  // YYDISTRIBUTION SPECIFIC TOOLS
  // ========================================
  const yydToolsMenu = ui.createMenu('📦 YYD Tools');
  yydToolsMenu.addItem('📅 Update Release Dates', 'updateReleaseDateDirectAPI');
  yydToolsMenu.addSeparator();
  yydToolsMenu.addItem('🧪 Test Release Date Update', 'testReleaseDateUpdate');
  menu.addSubMenu(yydToolsMenu);

  menu.addSeparator();

  // ========================================
  // YOYAKU SPECIFIC TOOLS
  // ========================================
  const yoyakuToolsMenu = ui.createMenu('🛒 YOYAKU Tools');
  yoyakuToolsMenu.addItem('🚀 Update Picking Locations', 'updatePickingDirectAPI');
  yoyakuToolsMenu.addSeparator();
  yoyakuToolsMenu.addItem('🗑️ Delete Bulk Products', 'runDeleteBulkProducts');
  menu.addSubMenu(yoyakuToolsMenu);

  menu.addSeparator();

  // ========================================
  // DIAGNOSTICS & TESTING
  // ========================================
  const diagnosticsMenu = ui.createMenu('🔍 Diagnostics');
  diagnosticsMenu.addItem('🎯 Test Complete System', 'testSystemeComplet');
  diagnosticsMenu.addItem('🧪 Test Stock Update Flow', 'testStockUpdateFlow');
  diagnosticsMenu.addItem('🌐 Test Connectivity', 'testConnectivite');
  diagnosticsMenu.addSeparator();
  diagnosticsMenu.addItem('🔬 Debug Ultra Complete', 'debugUltraStockUpdate');
  diagnosticsMenu.addItem('🔄 Compare Old vs New', 'compareOldVsNewSystem');
  menu.addSubMenu(diagnosticsMenu);

  menu.addSeparator();

  // ========================================
  // OTHER UTILITIES
  // ========================================
  const utilsMenu = ui.createMenu('🔧 Other Tools');
  utilsMenu.addItem('🔍 Analyze Current Sheet', 'runSheetAnalyzer');
  utilsMenu.addItem('📤 Export Data to Drive', 'runExportToDrive');
  utilsMenu.addItem('🔗 Manual Pabbly Webhook', 'runManualPabblyWebhook');
  utilsMenu.addSeparator();
  utilsMenu.addItem('⚙️ Full Diagnostic', 'runFullDiagnostic');
  menu.addSubMenu(utilsMenu);

  menu.addToUi();
}

/**
 * REMOVED FUNCTIONS (Legacy/Duplicate):
 *
 * FROM "Update Stock" menu:
 * - ❌ fetchDataAPIUpdateStock (duplicate of fetchDataAndCalculate)
 * - ❌ updateYoyakuStockDirectAPI (v1.0 legacy)
 * - ❌ updateYYDStockDirectAPI (not needed - sync exists)
 * - ❌ testStockUpdate (duplicate of testCalculations)
 *
 * MOVED to other menus:
 * - ✅ updatePickingDirectAPI → YOYAKU Tools
 * - ✅ updateReleaseDateDirectAPI → YYD Tools
 * - ✅ import852 submenu → Create Products (852) standalone
 *
 * DEPRECATED menus removed:
 * - ❌ "🔄 Update Tools (Legacy)" - All functions moved or removed
 * - ❌ "🏬 BARCELONA Tools" - Merged into Import Products
 */
