/**
 * Metadata Parser with Direct OpenAI Integration - SAFE COHABITATION VERSION
 * Works in parallel with Make.com - NO CONFLICTS
 *
 * @author Benjamin Belaga
 * @version 1.1.0-safe
 * @description Teste OpenAI direct SANS toucher au système Make.com existant
 *
 * DIFFÉRENCES vs Make.com:
 * - Écrit dans une SHEET SÉPARÉE: "wp import new product (OpenAI Test)"
 * - Bouton menu distinct: "🤖 AI Parsing (OpenAI Test)"
 * - Permet comparaison côte-à-côte
 * - Aucune interférence avec le workflow actuel
 * - Musialary peut continuer à utiliser Make.com
 */

// ============================================
// 🔐 CONFIGURATION & SECURITY
// ============================================

const OPENAI_CONFIG_SAFE = {
  model: 'gpt-4o', // or 'gpt-4o-mini' for faster/cheaper
  apiEndpoint: 'https://api.openai.com/v1/chat/completions',
  maxTokens: 4000,
  temperature: 0.1,
  // SAFE: Sheet de test séparée pour éviter conflit avec Make.com
  outputSheetName: 'wp import new product (OpenAI Test)',
  inputSheetName: 'metadata creator'
};

/**
 * Get OpenAI API Key from Script Properties (secure storage)
 */
function getOpenAIKeySafe() {
  const scriptProperties = PropertiesService.getScriptProperties();
  const key = scriptProperties.getProperty('OPENAI_API_KEY');

  if (!key) {
    throw new Error(
      'OpenAI API key not configured.\n\n' +
      'Run: Menu > 📊 metadata > ⚙️ Setup OpenAI API Key'
    );
  }

  return key;
}

/**
 * Setup OpenAI API Key - SAME as before
 */
function setupOpenAIKeySafe() {
  const ui = SpreadsheetApp.getUi();

  const response = ui.prompt(
    '🔑 OpenAI API Key Setup',
    'Enter your OpenAI API Key (starts with "sk-"):\n\n' +
    'Get your key from: https://platform.openai.com/api-keys',
    ui.ButtonSet.OK_CANCEL
  );

  if (response.getSelectedButton() === ui.Button.OK) {
    const apiKey = response.getResponseText().trim();

    if (!apiKey.startsWith('sk-')) {
      ui.alert('❌ Invalid API Key', 'OpenAI API keys must start with "sk-"', ui.ButtonSet.OK);
      return;
    }

    PropertiesService.getScriptProperties().setProperty('OPENAI_API_KEY', apiKey);
    ui.alert('✅ Success!', 'OpenAI API Key stored securely.', ui.ButtonSet.OK);
    Logger.log('[OpenAI Setup] API Key configured successfully');
  }
}

/**
 * Parse metadata using OpenAI API - SAME logic as before
 */
function parseMetadataWithOpenAISafe(rowData) {
  const logPrefix = '[OpenAI Parse Safe]';
  const apiKey = getOpenAIKeySafe();

  // Same system prompt as Make.com
  const systemPrompt = `You are a music distribution data processor. Extract data and output ONLY raw JSON.

CRITICAL RULES:
- Output MUST be valid JSON only - no text before or after
- No markdown formatting, no code blocks, no backticks
- Properly escape all special characters in JSON

Output Format:
{
  "sku": "",
  "release_date": "DD-MM-YYYY",
  "title": "",
  "label": "",
  "artist1": "",
  "artist2": "",
  "artist3": "",
  "artist4": "",
  "genre1": "",
  "genre2": "",
  "genre3": "",
  "genre4": "",
  "feature": "",
  "format": "",
  "description": "",
  "tracklist": ""
}

Domain Knowledge:
- Catalog numbers often contain label abbreviations + numbers
- Format = physical media format (e.g., "12\\" Vinyl")
- Split multiple artists into separate artist fields
- Split genres into separate genre fields

Corrections:
- "House Tech" → "Tech House"
- "Acid House" → "Acid"
- "Deep" → "Deep House"

Rules:
- If release_date missing, use date 30 days from today
- If description > 400 characters, summarize Juno Records style
- If SKU missing but catalog number exists, use that as SKU
- Format tracklist with \\n separators`;

  const userPrompt = `Parse the following distribution data:\n\n${rowData.bloc_metadata}`;

  const payload = {
    model: OPENAI_CONFIG_SAFE.model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: OPENAI_CONFIG_SAFE.temperature,
    max_tokens: OPENAI_CONFIG_SAFE.maxTokens,
    response_format: { type: 'json_object' }
  };

  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: { 'Authorization': 'Bearer ' + apiKey },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    Logger.log(`${logPrefix} Calling OpenAI for SKU: ${rowData.sku}`);
    const response = UrlFetchApp.fetch(OPENAI_CONFIG_SAFE.apiEndpoint, options);
    const statusCode = response.getResponseCode();
    const content = response.getContentText();

    if (statusCode !== 200) {
      throw new Error(`OpenAI API error ${statusCode}: ${content}`);
    }

    const json = JSON.parse(content);
    if (json.error) {
      throw new Error(`OpenAI Error: ${json.error.message}`);
    }

    const messageContent = json.choices[0].message.content;
    const parsedData = JSON.parse(messageContent);

    Logger.log(`${logPrefix} Successfully parsed SKU: ${rowData.sku}`);
    return parsedData;

  } catch (error) {
    Logger.log(`${logPrefix} Error: ${error.message}`);
    throw error;
  }
}

/**
 * MAIN FUNCTION: Parse metadata with OpenAI (SAFE VERSION)
 *
 * ✅ SAFE FEATURES:
 * - Écrit dans "wp import new product (OpenAI Test)" (sheet séparée)
 * - N'interfère PAS avec Make.com
 * - Permet comparaison côte-à-côte
 * - Musialary peut continuer avec Make.com
 */
function parseMetadataDirectWithOpenAISafe() {
  const ui = SpreadsheetApp.getUi();
  const logPrefix = '[AI Parsing OpenAI Safe]';

  Logger.log(`${logPrefix} Starting SAFE OpenAI parsing (no conflict with Make.com)...`);

  // Confirmation avec info sur la sécurité
  const response = ui.alert(
    '🤖 AI Parsing (OpenAI Test - SAFE)',
    '✅ VERSION TEST SÉCURISÉE\n\n' +
    'Cette version teste OpenAI SANS toucher Make.com:\n\n' +
    '• Lit: "metadata creator" (même source)\n' +
    '• Écrit: "wp import new product (OpenAI Test)" (SÉPARÉ)\n' +
    '• Make.com continue à écrire dans "wp import new product"\n' +
    '• Vous pouvez comparer les 2 résultats côte-à-côte\n\n' +
    '⚡ Avantages:\n' +
    '• 3x plus rapide que Make.com\n' +
    '• Économise $35/mois\n' +
    '• Aucun risque pour le système actuel\n\n' +
    'Continuer?',
    ui.ButtonSet.YES_NO
  );

  if (response !== ui.Button.YES) {
    Logger.log(`${logPrefix} User cancelled`);
    return;
  }

  try {
    // Test API key
    getOpenAIKeySafe();

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const inputSheet = ss.getSheetByName(OPENAI_CONFIG_SAFE.inputSheetName);

    if (!inputSheet) {
      throw new Error(`Sheet "${OPENAI_CONFIG_SAFE.inputSheetName}" not found!`);
    }

    // Créer ou récupérer la sheet de test
    let outputSheet = ss.getSheetByName(OPENAI_CONFIG_SAFE.outputSheetName);
    if (!outputSheet) {
      outputSheet = ss.insertSheet(OPENAI_CONFIG_SAFE.outputSheetName);

      // Copier les headers depuis la sheet Make.com
      const makeSheet = ss.getSheetByName('wp import new product');
      if (makeSheet) {
        const headers = makeSheet.getRange(1, 1, 1, makeSheet.getLastColumn()).getValues();
        outputSheet.getRange(1, 1, 1, headers[0].length).setValues(headers);
        outputSheet.getRange(1, 1, 1, headers[0].length).setFontWeight('bold');
      }

      ui.alert(
        '✅ Sheet Created',
        `Created test sheet: "${OPENAI_CONFIG_SAFE.outputSheetName}"\n\n` +
        'Results will be written here (separate from Make.com).',
        ui.ButtonSet.OK
      );
    }

    // Get input data
    const data = inputSheet.getDataRange().getDisplayValues();
    const headers = data[0].map(h => h.trim().toLowerCase());

    // Find columns
    const colIndexes = {
      distributor: headers.indexOf('distributor'),
      sku: headers.indexOf('sku'),
      price: headers.indexOf('price'),
      bloc_metadata: headers.indexOf('bloc_metadata')
    };

    if (colIndexes.bloc_metadata === -1) {
      throw new Error('Column "bloc_metadata" not found!');
    }

    // Process rows
    let successCount = 0;
    let errorCount = 0;
    let errorDetails = [];

    SpreadsheetApp.getActiveSpreadsheet().toast(
      'Starting OpenAI Test parsing...',
      '🤖 Test Mode',
      -1
    );

    for (let i = 1; i < data.length; i++) {
      const row = data[i];

      if (!row[colIndexes.bloc_metadata]) continue;

      try {
        const rowData = {
          distributor: row[colIndexes.distributor] || '',
          sku: row[colIndexes.sku] || '',
          price: row[colIndexes.price] || '',
          bloc_metadata: row[colIndexes.bloc_metadata]
        };

        SpreadsheetApp.getActiveSpreadsheet().toast(
          `Processing row ${i + 1}/${data.length} (Test)...`,
          '🤖 Parsing',
          -1
        );

        // Parse with OpenAI
        const parsed = parseMetadataWithOpenAISafe(rowData);

        // Build output row
        const outputRow = [
          rowData.distributor,
          rowData.sku || parsed.sku || '',
          rowData.price,
          parsed.release_date || '',
          '', // quantity
          parsed.title || '',
          parsed.label || '',
          parsed.artist1 || '',
          parsed.artist2 || '',
          parsed.artist3 || '',
          parsed.artist4 || '',
          parsed.genre1 || '',
          parsed.genre2 || '',
          parsed.genre3 || '',
          parsed.genre4 || '',
          parsed.feature || '',
          parsed.format || '',
          parsed.description || '',
          parsed.tracklist || ''
        ];

        // Write to TEST sheet
        outputSheet.appendRow(outputRow);
        successCount++;

        // Rate limiting
        Utilities.sleep(1000);

      } catch (error) {
        errorCount++;
        errorDetails.push({
          row: i + 1,
          sku: row[colIndexes.sku] || 'N/A',
          error: error.message
        });
        Logger.log(`${logPrefix} Error row ${i + 1}: ${error.message}`);
      }
    }

    // Results
    SpreadsheetApp.getActiveSpreadsheet().toast('✅ Test Complete!', 'Success', 3);

    let message = `🎉 OpenAI Test Parsing Complete!\n\n`;
    message += `✅ Parsed: ${successCount} products\n`;
    message += `📊 Written to: "${OPENAI_CONFIG_SAFE.outputSheetName}"\n\n`;

    if (errorCount > 0) {
      message += `❌ Errors: ${errorCount}\n\n`;
      errorDetails.slice(0, 3).forEach(err => {
        message += `• Row ${err.row}: ${err.error}\n`;
      });
    }

    message += `\n💡 NEXT STEPS:\n`;
    message += `1. Compare results with Make.com output\n`;
    message += `2. Check quality in "${OPENAI_CONFIG_SAFE.outputSheetName}"\n`;
    message += `3. If satisfied, can switch to OpenAI completely\n\n`;
    message += `💰 Cost: ~$${(successCount * 0.005).toFixed(2)}\n`;
    message += `🔒 Make.com system untouched - still working!`;

    ui.alert('OpenAI Test Complete', message, ui.ButtonSet.OK);

    Logger.log(`${logPrefix} Complete - Success: ${successCount}, Errors: ${errorCount}`);

  } catch (error) {
    Logger.log(`${logPrefix} Critical error: ${error.message}`);
    ui.alert('❌ Error', `Failed: ${error.message}`, ui.ButtonSet.OK);
  }
}

/**
 * Compare OpenAI vs Make.com results
 * Helper function to spot-check quality
 */
function compareOpenAIvsMakeCom() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const makeSheet = ss.getSheetByName('wp import new product');
  const openaiSheet = ss.getSheetByName('wp import new product (OpenAI Test)');

  if (!makeSheet || !openaiSheet) {
    ui.alert(
      '⚠️ Sheets Missing',
      'Need both sheets to compare:\n' +
      '• "wp import new product" (Make.com)\n' +
      '• "wp import new product (OpenAI Test)"\n\n' +
      'Run both parsers first.',
      ui.ButtonSet.OK
    );
    return;
  }

  const makeData = makeSheet.getDataRange().getValues();
  const openaiData = openaiSheet.getDataRange().getValues();

  let message = `📊 COMPARISON: Make.com vs OpenAI\n\n`;
  message += `Make.com rows: ${makeData.length - 1}\n`;
  message += `OpenAI rows: ${openaiData.length - 1}\n\n`;

  message += `💡 Check manually:\n`;
  message += `• Quality of parsing\n`;
  message += `• Completeness of fields\n`;
  message += `• Special characters handling\n\n`;

  message += `If OpenAI quality = Make.com:\n`;
  message += `→ Switch to OpenAI (save $35/month)\n`;
  message += `→ Disable Make.com webhook`;

  ui.alert('Comparison', message, ui.ButtonSet.OK);
}

/**
 * Test single row - SAFE version
 */
function testSingleMetadataParsingSafe() {
  const ui = SpreadsheetApp.getUi();
  const logPrefix = '[Test Single Safe]';

  const testData = {
    distributor: 'Test Distributor',
    sku: 'TEST-001',
    price: '15.00',
    bloc_metadata: `Artist: Ricardo Villalobos
Title: Dependent And Happy
Label: Incienso
Catalog: INC-028
Format: 12" Vinyl
Release Date: 15-03-2025
Genre: Minimal, Tech House
Tracklist:
A1. Dependent And Happy (10:23)
B1. What You Get (8:45)`
  };

  try {
    Logger.log(`${logPrefix} Testing...`);
    const result = parseMetadataWithOpenAISafe(testData);

    Logger.log(`${logPrefix} Result: ${JSON.stringify(result, null, 2)}`);

    ui.alert(
      '✅ Test Successful!',
      `Title: ${result.title}\n` +
      `Artist: ${result.artist1}\n` +
      `Label: ${result.label}\n\n` +
      'Check Logs for full JSON.',
      ui.ButtonSet.OK
    );

  } catch (error) {
    Logger.log(`${logPrefix} Failed: ${error.message}`);
    ui.alert('❌ Test Failed', `Error: ${error.message}`, ui.ButtonSet.OK);
  }
}
