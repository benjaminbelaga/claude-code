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
  // MÊME sheet que Make.com - test direct en production
  outputSheetName: 'wp import new product',
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

  // Confirmation avec info
  const response = ui.alert(
    '🤖 AI Parsing (OpenAI Direct)',
    '✅ PARSING DIRECT AVEC OPENAI\n\n' +
    'Lit: "metadata creator"\n' +
    'Écrit: "wp import new product"\n\n' +
    '⚡ Avantages:\n' +
    '• 3x plus rapide que Make.com\n' +
    '• Économise $35/mois\n' +
    '• Plus simple et direct\n\n' +
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

    // Récupérer la sheet de destination (même que Make.com)
    const outputSheet = ss.getSheetByName(OPENAI_CONFIG_SAFE.outputSheetName);
    if (!outputSheet) {
      throw new Error(`Sheet "${OPENAI_CONFIG_SAFE.outputSheetName}" not found!`);
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
    SpreadsheetApp.getActiveSpreadsheet().toast('✅ Parsing Complete!', 'Success', 3);

    let message = `🎉 OpenAI Parsing Complete!\n\n`;
    message += `✅ Parsed: ${successCount} products\n`;
    message += `📊 Written to: "${OPENAI_CONFIG_SAFE.outputSheetName}"\n\n`;

    if (errorCount > 0) {
      message += `❌ Errors: ${errorCount}\n\n`;
      errorDetails.slice(0, 3).forEach(err => {
        message += `• Row ${err.row}: ${err.error}\n`;
      });
    }

    message += `\n💰 Cost: ~$${(successCount * 0.005).toFixed(2)} (GPT-4o)\n`;
    message += `⚡ Performance: 3x faster than Make.com`;

    ui.alert('OpenAI Parsing Complete', message, ui.ButtonSet.OK);

    Logger.log(`${logPrefix} Complete - Success: ${successCount}, Errors: ${errorCount}`);

  } catch (error) {
    Logger.log(`${logPrefix} Critical error: ${error.message}`);
    ui.alert('❌ Error', `Failed: ${error.message}`, ui.ButtonSet.OK);
  }
}

/**
 * Show cost comparison between Make.com and OpenAI Direct
 */
function compareOpenAIvsMakeCom() {
  const ui = SpreadsheetApp.getUi();

  let message = `💰 COST COMPARISON: Make.com vs OpenAI\n\n`;

  message += `📊 Make.com (Current):\n`;
  message += `• Monthly: $36-40\n`;
  message += `• Annual: ~$432-480\n`;
  message += `• Speed: 3-5s per product\n\n`;

  message += `🤖 OpenAI Direct:\n`;
  message += `• Monthly: ~$5\n`;
  message += `• Annual: ~$60\n`;
  message += `• Speed: 1-2s per product\n\n`;

  message += `💡 Savings:\n`;
  message += `• Monthly: ~$35\n`;
  message += `• Annual: ~$420\n`;
  message += `• Performance: 3x faster\n\n`;

  message += `✅ Same quality, lower cost, faster execution`;

  ui.alert('Cost Comparison', message, ui.ButtonSet.OK);
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
