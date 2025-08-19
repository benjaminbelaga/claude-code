const METADATA_CSV_URL = 'https://yoyaku.io/wp-content/uploads/exports/yoyaku_taxonomies.csv';
const METADATA_SHEET_NAME = 'metadata';

/**
 * Fetches the latest taxonomies from the yoyaku.io CSV and updates the 'metadata' sheet.
 */
function updateMetadata() {
  const logPrefix = '[UpdateMetadata]';
  const ui = SpreadsheetApp.getUi();
  
  try {
    Logger.log(`${logPrefix} Starting metadata update from ${METADATA_CSV_URL}`);
    ui.alert('🚀 Starting Metadata Update', 'Fetching the latest distributor, genre, and label lists from yoyaku.io...', ui.ButtonSet.OK);

    // 1. Fetch the CSV data
    const response = UrlFetchApp.fetch(METADATA_CSV_URL, { muteHttpExceptions: true });
    const responseCode = response.getResponseCode();
    
    if (responseCode !== 200) {
      throw new Error(`Failed to fetch data from server. Received HTTP status code: ${responseCode}. URL: ${METADATA_CSV_URL}`);
    }

    const csvContent = response.getContentText();
    const data = Utilities.parseCsv(csvContent);

    if (!data || data.length === 0) {
      throw new Error('Fetched CSV data is empty or could not be parsed.');
    }

    Logger.log(`${logPrefix} Successfully fetched and parsed ${data.length} rows.`);

    // 2. Get the target sheet
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = spreadsheet.getSheetByName(METADATA_SHEET_NAME);
    if (!sheet) {
        sheet = spreadsheet.insertSheet(METADATA_SHEET_NAME);
        Logger.log(`${logPrefix} Created missing sheet: "${METADATA_SHEET_NAME}".`);
    }

    // 3. Clear existing content and write new data
    sheet.clearContents();
    sheet.getRange(1, 1, data.length, data[0].length).setValues(data);
    Logger.log(`${logPrefix} Successfully wrote ${data.length} rows to the "${METADATA_SHEET_NAME}" sheet.`);

    // 4. Autofit columns for better readability
    for (let i = 1; i <= data[0].length; i++) {
        sheet.autoResizeColumn(i);
    }
    
    spreadsheet.setActiveSheet(sheet);
    ui.alert('✅ Success!', `The "${METADATA_SHEET_NAME}" sheet has been successfully updated with ${data.length - 1} records.`, ui.ButtonSet.OK);
    SpreadsheetApp.getActiveSpreadsheet().toast('Metadata updated successfully!', 'SUCCESS', 5);

  } catch (error) {
    Logger.log(`${logPrefix} ERROR: ${error.stack}`);
    ui.alert('❌ An Error Occurred', `Failed to update metadata. Please check the logs for details.\n\nError: ${error.message}`, ui.ButtonSet.OK);
  }
} 