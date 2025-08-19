/**
 * @file distributor-corrector.gs
 * @description Handles the correction of distributor names based on a user-defined mapping sheet.
 */

/**
 * The name of the sheet where users define distributor corrections.
 * @type {string}
 */
const DISTRIBUTOR_CORRECTIONS_SHEET_NAME = 'Distributor Corrections';

/**
 * Ensures the "Distributor Corrections" sheet exists, is visible, and properly configured.
 * If the sheet doesn't exist, it creates and formats it for the user.
 * If it exists but is hidden, it makes it visible.
 */
function setupDistributorCorrectionsSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(DISTRIBUTOR_CORRECTIONS_SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(DISTRIBUTOR_CORRECTIONS_SHEET_NAME);
    
    // Set headers and format them
    const headers = ['Original Distributor (Incorrect)', 'Corrected Distributor (Official)'];
    const headerRange = sheet.getRange('A1:B1');
    headerRange.setValues([headers]);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#f3f3f3');
    
    // Auto-resize columns for better readability
    sheet.autoResizeColumns(1, 2);
    
    // Add some example data to guide the user
    sheet.appendRow(['subwax distribuciones', 'SUBWAX DISTRIBUCIONES']);
    sheet.appendRow(['wax distribution', 'Wax Distribution']);
    sheet.appendRow(['inevitavel melodia ldaav de', 'INEVITAVEL MELODIA, LDAAV DE']);
    
    // Set the new sheet as active and inform the user
    spreadsheet.setActiveSheet(sheet);
    SpreadsheetApp.getUi().alert(
      'Sheet Created: "Distributor Corrections"',
      `The sheet "${DISTRIBUTOR_CORRECTIONS_SHEET_NAME}" has been created for you.\n\nPlease add your distributor mappings here. The script will use these rules to correct distributors during analysis and import.`,
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  } else {
    // If the sheet exists, just make sure it's visible and activate it.
    if (sheet.isSheetHidden()) {
      sheet.showSheet();
    }
    spreadsheet.setActiveSheet(sheet);
    SpreadsheetApp.getUi().alert(
      'Sheet Ready',
      `The sheet "${DISTRIBUTOR_CORRECTIONS_SHEET_NAME}" is already set up. You can manage your distributor correction rules here.`,
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  }
}

/**
 * @class DistributorCorrector
 * @description Manages distributor correction mappings from the user-defined sheet.
 */
class DistributorCorrector {
  /**
   * Retrieves the distributor correction mappings from the "Distributor Corrections" sheet.
   * @returns {Object} An object mapping incorrect distributors to correct distributors. Returns empty if sheet not found.
   */
  static getDistributorCorrections() {
    Logger.log('[getDistributorCorrections] Starting...');
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName(DISTRIBUTOR_CORRECTIONS_SHEET_NAME);

    if (!sheet) {
      Logger.log(`[getDistributorCorrections] Warning: The sheet "${DISTRIBUTOR_CORRECTIONS_SHEET_NAME}" was not found.`);
      return {};
    }

    const data = sheet.getDataRange().getValues();
    const corrections = {};
    Logger.log(`[getDistributorCorrections] Found ${data.length - 1} rows of rules to process.`);
    
    // Start from 1 to skip header row
    for (let i = 1; i < data.length; i++) {
      const incorrect = data[i][0];
      const correct = data[i][1];
      if (incorrect && correct) {
        const key = String(incorrect).trim().toLowerCase();
        const value = String(correct).trim();
        corrections[key] = value;
        Logger.log(`[getDistributorCorrections] Loading rule: '${key}' -> '${value}'`);
      }
    }
    Logger.log('[getDistributorCorrections] Finished. Returning ' + Object.keys(corrections).length + ' rules.');
    return corrections;
  }

  /**
   * Applies the stored corrections to a given distributor.
   * The matching is case-insensitive.
   * @param {string} distributor The distributor to correct.
   * @param {Object} corrections A map of corrections, typically from getDistributorCorrections().
   * @returns {string} The corrected distributor, or the original distributor if no correction is found.
   */
  static correctDistributor(distributor, corrections) {
    if (!distributor || !corrections) {
      return distributor;
    }
    const trimmedLowerDistributor = String(distributor).trim().toLowerCase();
    return corrections[trimmedLowerDistributor] || distributor;
  }

  /**
   * Adds or updates a distributor correction in the user-facing "Distributor Corrections" sheet.
   * If the incorrect distributor already exists, it updates the correction.
   * Otherwise, it adds a new row. This makes the system "learn".
   * @param {string} incorrectDistributor The distributor to be corrected.
   * @param {string} correctDistributor The correct distributor.
   */
  static addOrUpdateDistributorCorrection(incorrectDistributor, correctDistributor) {
    Logger.log(`[addOrUpdateDistributorCorrection] Received: Incorrect='${incorrectDistributor}', Correct='${correctDistributor}'`);
    const incorrect = String(incorrectDistributor).trim();
    const correct = String(correctDistributor).trim();

    if (!incorrect || !correct || incorrect.toLowerCase() === correct.toLowerCase()) {
      Logger.log(`[addOrUpdateDistributorCorrection] SKIPPED: Correction is invalid or redundant.`);
      return;
    }

    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = spreadsheet.getSheetByName(DISTRIBUTOR_CORRECTIONS_SHEET_NAME);

    // If sheet doesn't exist, run setup to create it.
    if (!sheet) {
      Logger.log(`[addOrUpdateDistributorCorrection] Sheet "${DISTRIBUTOR_CORRECTIONS_SHEET_NAME}" not found. Running setup...`);
      setupDistributorCorrectionsSheet();
      sheet = spreadsheet.getSheetByName(DISTRIBUTOR_CORRECTIONS_SHEET_NAME);
      if (!sheet) {
        Logger.log('[addOrUpdateDistributorCorrection] FATAL: Failed to create the distributor corrections sheet. Cannot learn new correction.');
        return;
      }
    }
    
    const range = sheet.getRange("A:A");
    const textFinder = range.createTextFinder(incorrect).matchEntireCell(true).matchCase(false);
    const found = textFinder.findNext();

    if (found) {
      const row = found.getRow();
      sheet.getRange(row, 2).setValue(correct);
      Logger.log(`[addOrUpdateDistributorCorrection] SUCCESS: Updated row ${row} with new correction.`);
    } else {
      sheet.appendRow([incorrect, correct]);
      Logger.log(`[addOrUpdateDistributorCorrection] SUCCESS: Appended new correction to sheet.`);
    }
  }
} 