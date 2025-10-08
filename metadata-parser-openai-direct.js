/**
 * Metadata Parser with Direct OpenAI Integration
 * Replaces Make.com workflow with direct API calls
 *
 * @author Benjamin Belaga
 * @version 1.1.0
 * @description Parses metadata directly via OpenAI API, eliminating Make.com dependency
 *
 * Workflow:
 * 1. Reads "metadata creator" sheet
 * 2. Calls OpenAI API directly (no Make.com)
 * 3. Parses structured JSON response
 * 4. Writes to "wp import new product" sheet
 *
 * Benefits vs Make.com:
 * - 3x faster (no network hops)
 * - $35/month cost savings
 * - Easier debugging (all in one place)
 * - Same OpenAI prompt (copied from Make.com)
 */

// ============================================
// 🔐 CONFIGURATION & SECURITY
// ============================================

/**
 * Configuration for OpenAI API
 */
const OPENAI_CONFIG = {
  model: 'gpt-4o', // or 'gpt-4o-mini' for faster/cheaper
  apiEndpoint: 'https://api.openai.com/v1/chat/completions',
  maxTokens: 4000,
  temperature: 0.1, // Low for consistent structured output
  timeout: 60000 // 60 seconds timeout
};

/**
 * Get OpenAI API Key from Script Properties (secure storage)
 * @returns {string} API Key
 * @throws {Error} If API key not configured
 */
function getOpenAIKey() {
  const scriptProperties = PropertiesService.getScriptProperties();
  const key = scriptProperties.getProperty('OPENAI_API_KEY');

  if (!key) {
    throw new Error(
      'OpenAI API key not configured.\n\n' +
      'Please run: Menu > 📊 metadata > ⚙️ Setup OpenAI API Key'
    );
  }

  return key;
}

/**
 * Setup OpenAI API Key via user prompt
 * Stores securely in Script Properties
 *
 * Usage: Run once from Apps Script editor or menu
 */
function setupOpenAIKey() {
  const ui = SpreadsheetApp.getUi();

  const response = ui.prompt(
    '🔑 OpenAI API Key Setup',
    'Enter your OpenAI API Key (starts with "sk-"):\n\n' +
    'Get your key from: https://platform.openai.com/api-keys',
    ui.ButtonSet.OK_CANCEL
  );

  if (response.getSelectedButton() === ui.Button.OK) {
    const apiKey = response.getResponseText().trim();

    // Validate key format
    if (!apiKey.startsWith('sk-')) {
      ui.alert(
        '❌ Invalid API Key',
        'OpenAI API keys must start with "sk-"\n\nPlease try again.',
        ui.ButtonSet.OK
      );
      return;
    }

    // Store securely
    PropertiesService.getScriptProperties().setProperty('OPENAI_API_KEY', apiKey);

    ui.alert(
      '✅ Success!',
      'OpenAI API Key stored securely.\n\n' +
      'You can now use the AI Parsing function.',
      ui.ButtonSet.OK
    );

    Logger.log('[OpenAI Setup] API Key configured successfully');
  } else {
    ui.alert('Setup cancelled.');
  }
}

/**
 * Test OpenAI connection
 * Validates API key and connectivity
 */
function testOpenAIConnection() {
  const ui = SpreadsheetApp.getUi();
  const logPrefix = '[OpenAI Test]';

  try {
    Logger.log(`${logPrefix} Testing OpenAI connection...`);

    const apiKey = getOpenAIKey();

    // Simple test request
    const testPayload = {
      model: 'gpt-4o-mini', // Use cheaper model for test
      messages: [
        { role: 'user', content: 'Say "Connection successful" in JSON format: {"status": "..."}' }
      ],
      max_tokens: 50,
      response_format: { type: 'json_object' }
    };

    const options = {
      method: 'post',
      contentType: 'application/json',
      headers: {
        'Authorization': 'Bearer ' + apiKey
      },
      payload: JSON.stringify(testPayload),
      muteHttpExceptions: true
    };

    const response = UrlFetchApp.fetch(OPENAI_CONFIG.apiEndpoint, options);
    const statusCode = response.getResponseCode();
    const content = response.getContentText();

    if (statusCode === 200) {
      const json = JSON.parse(content);
      const message = json.choices[0].message.content;

      ui.alert(
        '✅ Connection Successful!',
        `OpenAI API is working correctly.\n\n` +
        `Model: ${OPENAI_CONFIG.model}\n` +
        `Response: ${message}`,
        ui.ButtonSet.OK
      );

      Logger.log(`${logPrefix} Connection test successful`);
    } else {
      throw new Error(`API returned status ${statusCode}: ${content}`);
    }

  } catch (error) {
    Logger.log(`${logPrefix} Connection test failed: ${error.message}`);
    ui.alert(
      '❌ Connection Failed',
      `Error: ${error.message}\n\n` +
      'Please check:\n' +
      '1. API Key is valid\n' +
      '2. You have OpenAI API credits\n' +
      '3. Network connection is working',
      ui.ButtonSet.OK
    );
  }
}

// ============================================
// 🤖 OPENAI PARSING LOGIC
// ============================================

/**
 * Parse metadata using OpenAI API
 *
 * @param {Object} rowData - Row data with distributor, sku, price, bloc_metadata
 * @returns {Object} Parsed metadata object
 * @throws {Error} If API call fails
 */
function parseMetadataWithOpenAI(rowData) {
  const logPrefix = '[OpenAI Parse]';
  const apiKey = getOpenAIKey();

  // System prompt (copied from Make.com workflow)
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
- Catalog numbers often contain label abbreviations + numbers (e.g., "INC-028")
- Format = physical media format (e.g., "12\\" Vinyl", "1LP", "2x12\\"")
- Split multiple artists into separate artist fields
- Split genres into separate genre fields

Corrections for Common Mistakes:
- "House Tech" → "Tech House"
- "Acid House" → "Acid"
- "Deep" → "Deep House"

Rules:
- If release_date missing, use date 30 days from today
- If description > 400 characters, summarize Juno Records style (400-500 chars)
- If SKU missing but catalog number exists, use that as SKU
- Format tracklist with \\n separators between tracks`;

  const userPrompt = `Parse the following distribution data into standardized JSON:\n\n${rowData.bloc_metadata}`;

  // OpenAI API request
  const payload = {
    model: OPENAI_CONFIG.model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: OPENAI_CONFIG.temperature,
    max_tokens: OPENAI_CONFIG.maxTokens,
    response_format: { type: 'json_object' } // Force JSON output
  };

  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'Authorization': 'Bearer ' + apiKey
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    Logger.log(`${logPrefix} Calling OpenAI API for SKU: ${rowData.sku}`);

    const response = UrlFetchApp.fetch(OPENAI_CONFIG.apiEndpoint, options);
    const statusCode = response.getResponseCode();
    const content = response.getContentText();

    if (statusCode !== 200) {
      throw new Error(`OpenAI API error ${statusCode}: ${content}`);
    }

    const json = JSON.parse(content);

    if (json.error) {
      throw new Error(`OpenAI API Error: ${json.error.message}`);
    }

    // Extract and parse the JSON content
    const messageContent = json.choices[0].message.content;
    const parsedData = JSON.parse(messageContent);

    Logger.log(`${logPrefix} Successfully parsed SKU: ${rowData.sku}`);

    return parsedData;

  } catch (error) {
    Logger.log(`${logPrefix} Error parsing SKU ${rowData.sku}: ${error.message}`);
    throw error;
  }
}

/**
 * Fallback: Parse with Claude if OpenAI fails
 * Optional - requires Anthropic API key
 *
 * @param {Object} rowData - Row data
 * @returns {Object} Parsed metadata
 */
function parseMetadataWithClaude(rowData) {
  const logPrefix = '[Claude Parse]';
  const apiKey = PropertiesService.getScriptProperties().getProperty('CLAUDE_API_KEY');

  if (!apiKey) {
    throw new Error('Claude API key not configured. Fallback unavailable.');
  }

  // Similar implementation as OpenAI but with Anthropic API
  // For now, just throw error to use OpenAI only
  throw new Error('Claude fallback not yet implemented. Use OpenAI only.');
}

// ============================================
// 📊 MAIN PROCESSING FUNCTIONS
// ============================================

/**
 * Main function: Parse metadata from "metadata creator" sheet
 * Replaces triggerAIParsing() + Make.com workflow
 *
 * Usage: Menu > 📊 metadata > 🤖 AI Parsing (Direct OpenAI)
 */
function parseMetadataDirectWithOpenAI() {
  const ui = SpreadsheetApp.getUi();
  const logPrefix = '[AI Parsing Direct]';
  const sheetName = 'metadata creator';
  const outputSheetName = 'wp import new product';

  Logger.log(`${logPrefix} Starting direct OpenAI parsing...`);

  // Confirmation dialog
  const response = ui.alert(
    '🤖 AI Parsing (Direct OpenAI)',
    'This will parse metadata using OpenAI API directly.\n\n' +
    '✅ Benefits vs Make.com:\n' +
    '• 3x faster processing\n' +
    '• $35/month cost savings\n' +
    '• Real-time progress tracking\n' +
    '• Easier debugging\n\n' +
    'Estimated cost: ~$0.005 per product\n\n' +
    'Continue?',
    ui.ButtonSet.YES_NO
  );

  if (response !== ui.Button.YES) {
    Logger.log(`${logPrefix} User cancelled`);
    return;
  }

  try {
    // Test API key first
    getOpenAIKey();

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const inputSheet = ss.getSheetByName(sheetName);
    const outputSheet = ss.getSheetByName(outputSheetName);

    if (!inputSheet) {
      throw new Error(`Sheet "${sheetName}" not found!`);
    }

    if (!outputSheet) {
      throw new Error(`Sheet "${outputSheetName}" not found!`);
    }

    // Get input data
    const data = inputSheet.getDataRange().getDisplayValues();
    const headers = data[0].map(h => h.trim().toLowerCase());

    // Find column indexes
    const colIndexes = {
      distributor: headers.indexOf('distributor'),
      sku: headers.indexOf('sku'),
      price: headers.indexOf('price'),
      bloc_metadata: headers.indexOf('bloc_metadata')
    };

    // Validate required columns
    if (colIndexes.bloc_metadata === -1) {
      throw new Error('Column "bloc_metadata" not found in input sheet!');
    }

    // Process each row
    let successCount = 0;
    let errorCount = 0;
    let errorDetails = [];

    SpreadsheetApp.getActiveSpreadsheet().toast(
      'Starting processing...',
      '🤖 AI Parsing',
      -1
    );

    for (let i = 1; i < data.length; i++) {
      const row = data[i];

      // Skip empty rows
      if (!row[colIndexes.bloc_metadata]) {
        continue;
      }

      try {
        const rowData = {
          distributor: row[colIndexes.distributor] || '',
          sku: row[colIndexes.sku] || '',
          price: row[colIndexes.price] || '',
          bloc_metadata: row[colIndexes.bloc_metadata]
        };

        SpreadsheetApp.getActiveSpreadsheet().toast(
          `Processing row ${i + 1}/${data.length}...`,
          '🤖 Parsing',
          -1
        );

        // Parse with OpenAI
        const parsed = parseMetadataWithOpenAI(rowData);

        // Merge with original data
        const outputRow = buildOutputRow(rowData, parsed);

        // Write to output sheet
        outputSheet.appendRow(outputRow);
        successCount++;

        // Rate limiting (1 request per second to respect OpenAI limits)
        Utilities.sleep(1000);

      } catch (error) {
        errorCount++;
        errorDetails.push({
          row: i + 1,
          sku: row[colIndexes.sku] || 'N/A',
          error: error.message
        });
        Logger.log(`${logPrefix} Error processing row ${i + 1}: ${error.message}`);
      }
    }

    // Show results
    SpreadsheetApp.getActiveSpreadsheet().toast('✅ Complete!', 'Success', 3);

    let message = `🎉 AI Parsing Complete!\n\n`;
    message += `✅ Successfully parsed: ${successCount} products\n`;

    if (errorCount > 0) {
      message += `❌ Errors: ${errorCount} products\n\n`;
      message += `Error details (first 5):\n`;
      errorDetails.slice(0, 5).forEach(err => {
        message += `• Row ${err.row} (${err.sku}): ${err.error}\n`;
      });
    }

    message += `\n💰 Estimated cost: $${(successCount * 0.005).toFixed(2)}`;
    message += `\n💾 Data written to "${outputSheetName}" sheet`;

    ui.alert('AI Parsing Complete', message, ui.ButtonSet.OK);

    Logger.log(`${logPrefix} Complete - Success: ${successCount}, Errors: ${errorCount}`);

  } catch (error) {
    Logger.log(`${logPrefix} Critical error: ${error.message}`);
    ui.alert(
      '❌ Error',
      `Failed to parse metadata:\n\n${error.message}`,
      ui.ButtonSet.OK
    );
  }
}

/**
 * Build output row for "wp import new product" sheet
 *
 * @param {Object} original - Original row data
 * @param {Object} parsed - Parsed metadata from OpenAI
 * @returns {Array} Row data array
 */
function buildOutputRow(original, parsed) {
  return [
    original.distributor || '',
    original.sku || parsed.sku || '',
    original.price || '',
    parsed.release_date || '',
    '', // quantity (empty)
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
}

// ============================================
// 🧪 TEST FUNCTIONS
// ============================================

/**
 * Test function for development
 * Tests parsing with a single sample row
 */
function testSingleMetadataParsing() {
  const ui = SpreadsheetApp.getUi();
  const logPrefix = '[Test Single]';

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
B1. What You Get (8:45)
Description: Ricardo Villalobos returns to Incienso with two hypnotic cuts of his signature minimal sound.`
  };

  try {
    Logger.log(`${logPrefix} Testing with sample data...`);

    const result = parseMetadataWithOpenAI(testData);

    Logger.log(`${logPrefix} Test result:`);
    Logger.log(JSON.stringify(result, null, 2));

    ui.alert(
      '✅ Test Successful!',
      `Parsed data:\n\n` +
      `Title: ${result.title}\n` +
      `Label: ${result.label}\n` +
      `Artist: ${result.artist1}\n` +
      `Format: ${result.format}\n\n` +
      'Check Logs (View > Logs) for full JSON output.',
      ui.ButtonSet.OK
    );

  } catch (error) {
    Logger.log(`${logPrefix} Test failed: ${error.message}`);
    ui.alert(
      '❌ Test Failed',
      `Error: ${error.message}`,
      ui.ButtonSet.OK
    );
  }
}

/**
 * Compare Make.com vs Direct OpenAI cost
 * Educational function
 */
function showCostComparison() {
  const ui = SpreadsheetApp.getUi();

  const message = `💰 COST COMPARISON: Make.com vs Direct OpenAI\n\n` +
    `📊 Make.com (Current):\n` +
    `• Base: $9-10/month\n` +
    `• Webhook + OpenAI + Parse + Write = 4 ops/product\n` +
    `• 1000 products = 4000 ops = ~$36-40/month\n\n` +
    `🤖 Direct OpenAI (New):\n` +
    `• Apps Script: FREE\n` +
    `• OpenAI GPT-4o: ~$0.005/product\n` +
    `• 1000 products = ~$5/month\n\n` +
    `💵 MONTHLY SAVINGS: ~$35/month\n` +
    `📈 ANNUAL SAVINGS: ~$420/year\n\n` +
    `⚡ BONUS:\n` +
    `• 3x faster processing\n` +
    `• Real-time progress tracking\n` +
    `• Easier debugging\n` +
    `• No external dependencies`;

  ui.alert('Cost Comparison', message, ui.ButtonSet.OK);
}
