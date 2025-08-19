const GENRE_CORRECTIONS_SHEET_NAME = 'Genre Corrections';

function setupGenreCorrectionsSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(GENRE_CORRECTIONS_SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(GENRE_CORRECTIONS_SHEET_NAME);
    const headers = ['Original Genre (Incorrect)', 'Corrected Genre (Official)'];
    const headerRange = sheet.getRange('A1:B1');
    headerRange.setValues([headers]);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#f3f3f3');
    sheet.autoResizeColumns(1, 2);
    sheet.appendRow(['TECHNO DETROIT', 'Techno']);
    sheet.appendRow(['House Tech', 'Tech House']);
    spreadsheet.setActiveSheet(sheet);
    SpreadsheetApp.getUi().alert(
      'Sheet Created: "Genre Corrections"',
      `The sheet "${GENRE_CORRECTIONS_SHEET_NAME}" has been created for you.\n\nPlease add your genre mappings here. The script will use these rules to correct genres during analysis and import.`,
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  } else {
    if (sheet.isSheetHidden()) {
      sheet.showSheet();
    }
    spreadsheet.setActiveSheet(sheet);
    SpreadsheetApp.getUi().alert(
      'Sheet Ready',
      `The sheet "${GENRE_CORRECTIONS_SHEET_NAME}" is already set up. You can manage your genre correction rules here.`,
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  }
}

class GenreCorrector {
  static getGenreCorrections() {
    Logger.log('[getGenreCorrections] Starting...');
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName(GENRE_CORRECTIONS_SHEET_NAME);

    if (!sheet) {
      Logger.log(`[getGenreCorrections] Warning: The sheet "${GENRE_CORRECTIONS_SHEET_NAME}" was not found.`);
      return {};
    }

    const data = sheet.getDataRange().getValues();
    const corrections = {};
    Logger.log(`[getGenreCorrections] Found ${data.length - 1} rows of rules to process.`);
    for (let i = 1; i < data.length; i++) {
      const incorrect = data[i][0];
      const correct = data[i][1];
      if (incorrect && correct) {
        const key = String(incorrect).trim().toLowerCase();
        const value = String(correct).trim();
        corrections[key] = value;
        Logger.log(`[getGenreCorrections] Loading rule: '${key}' -> '${value}'`);
      }
    }
    Logger.log('[getGenreCorrections] Finished. Returning ' + Object.keys(corrections).length + ' rules.');
    return corrections;
  }

  static correctGenre(genre, corrections) {
    if (!genre || !corrections) {
      return genre;
    }
    const trimmedLowerGenre = String(genre).trim().toLowerCase();
    return corrections[trimmedLowerGenre] || genre;
  }

  static addOrUpdateGenreCorrection(incorrectGenre, correctGenre) {
    Logger.log(`[addOrUpdateGenreCorrection] Received: Incorrect='${incorrectGenre}', Correct='${correctGenre}'`);
    const incorrect = String(incorrectGenre).trim();
    const correct = String(correctGenre).trim();

    if (!incorrect || !correct || incorrect.toLowerCase() === correct.toLowerCase()) {
      Logger.log(`[addOrUpdateGenreCorrection] SKIPPED: Correction is invalid or redundant.`);
      return;
    }

    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = spreadsheet.getSheetByName(GENRE_CORRECTIONS_SHEET_NAME);

    if (!sheet) {
      Logger.log(`[addOrUpdateGenreCorrection] Sheet "${GENRE_CORRECTIONS_SHEET_NAME}" not found. Running setup...`);
      setupGenreCorrectionsSheet();
      sheet = spreadsheet.getSheetByName(GENRE_CORRECTIONS_SHEET_NAME);
      if (!sheet) {
        Logger.log('[addOrUpdateGenreCorrection] FATAL: Failed to create the genre corrections sheet. Cannot learn new correction.');
        return;
      }
    }
    
    const range = sheet.getRange("A:A");
    const textFinder = range.createTextFinder(incorrect).matchEntireCell(true).matchCase(false);
    const found = textFinder.findNext();

    if (found) {
      const row = found.getRow();
      sheet.getRange(row, 2).setValue(correct);
      Logger.log(`[addOrUpdateGenreCorrection] SUCCESS: Updated row ${row} with new correction.`);
    } else {
      sheet.appendRow([incorrect, correct]);
      Logger.log(`[addOrUpdateGenreCorrection] SUCCESS: Appended new correction to sheet.`);
    }
  }
}