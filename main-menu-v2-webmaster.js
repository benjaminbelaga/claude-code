/**
 * Menu Integration for Stock Update v2.0 - WEBMASTER EDITION
 * Add this code to your main.js file
 */

function onOpen() {
  const ui = SpreadsheetApp.getUi();

  // Create main menu
  const updateStockMenu = ui.createMenu('⚡ Update Stock');

  // V2.0 WEBMASTER WORKFLOW (3-click workflow)
  updateStockMenu.addItem('🧹 Clear Calculated Data', 'clearCalculatedData');
  updateStockMenu.addItem('📊 Fetch Data & Calculate', 'fetchDataAndCalculate');
  updateStockMenu.addItem('📦 Update Stock YOYAKU v2.0', 'updateYoyakuStockDirectAPI_V2_Webmaster');

  updateStockMenu.addSeparator();

  // Testing & Debug
  updateStockMenu.addItem('📊 Show Calculation Report', 'showCalculationReport');
  updateStockMenu.addItem('🧪 Test Calculations', 'testCalculations');

  updateStockMenu.addSeparator();

  // Legacy (keep for safety during transition)
  updateStockMenu.addItem('📦 Update Stock v1.0 (Legacy)', 'updateYoyakuStockDirectAPI');

  updateStockMenu.addToUi();

  // Other menus can be added here
  // ...
}
