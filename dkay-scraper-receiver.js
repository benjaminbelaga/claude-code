/**
 * DKAY Scraper Receiver
 * Fonction doPost pour recevoir les données du scraper Python DKAY
 */

/**
 * Fonction principale pour recevoir les données du scraper DKAY
 * Compatible avec l'architecture WP Import Dashboard existante
 */
function doPost(e) {
  try {
    Logger.log('📥 doPost appelé - DKAY Scraper Integration');
    
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error('Données POST manquantes');
    }
    
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    Logger.log(`🎯 Action demandée: ${action}`);
    
    // Configuration du spreadsheet (utilise la config existante du dashboard)
    const spreadsheetId = "1L55TCdfJJxZOHyWqx13XKi58pNqNt3wrUm0C4MIs6X4";
    const sheetName = "wp import new product";
    
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    let sheet = spreadsheet.getSheetByName(sheetName);
    
    // Vérifier que l'onglet existe
    if (!sheet) {
      Logger.log(`⚠️ Création onglet manquant: ${sheetName}`);
      sheet = spreadsheet.insertSheet(sheetName);
      const headers = [
        "Distributor", "sku", "Price Gross", "release_date", "quantity", 
        "title", "label", "artist1", "artist2", "artist3", "artist4", 
        "genre1", "genre2", "genre3", "genre4", "feature", "format", 
        "description", "tracklist", "depot vente", "weight", 
        "price net", "price yydistribution", "price yoyaku,io"
      ];
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      Logger.log('✅ Headers créés');
    }
    
    // Traitement selon l'action
    switch (action) {
      case "test":
        Logger.log('🧪 Test de connexion DKAY Scraper');
        return ContentService.createTextOutput(JSON.stringify({
          success: true,
          message: "Connexion DKAY Scraper réussie",
          version: "v3.0",
          spreadsheetName: spreadsheet.getName(),
          sheetName: sheet.getName(),
          lastRow: sheet.getLastRow(),
          timestamp: new Date().toISOString()
        })).setMimeType(ContentService.MimeType.JSON);
        
      case "addDeejayRow":
      case "addDkayRow":
        Logger.log('📝 Ajout ligne produit DKAY');
        const productData = data.data;
        
        if (!productData) {
          throw new Error('productData manquant');
        }
        
        // Construire la ligne de données dans l'ordre exact des colonnes
        const rowData = [
          productData.distributor || '',           // A: Distributor
          productData.sku || '',                   // B: sku
          productData.priceGross || '',            // C: Price Gross
          productData.release_date || '',          // D: release_date
          productData.quantity || '',              // E: quantity
          productData.title || '',                 // F: title
          productData.label || '',                 // G: label
          productData.artist1 || '',               // H: artist1
          productData.artist2 || '',               // I: artist2
          productData.artist3 || '',               // J: artist3
          productData.artist4 || '',               // K: artist4
          productData.genre1 || '',                // L: genre1
          productData.genre2 || '',                // M: genre2
          productData.genre3 || '',                // N: genre3
          productData.genre4 || '',                // O: genre4
          productData.features || '',              // P: feature
          productData.format || '',                // Q: format
          productData.description || '',           // R: description
          productData.tracklist || '',             // S: tracklist
          productData.depot_vente || '',           // T: depot vente
          '',                                      // U: weight (EMPTY)
          '',                                      // V: price net (EMPTY)
          '',                                      // W: price yydistribution (EMPTY)
          productData.priceGross || ''             // X: price yoyaku,io (SAME AS C)
        ];
        
        const nextRow = sheet.getLastRow() + 1;
        sheet.getRange(nextRow, 1, 1, rowData.length).setValues([rowData]);
        
        Logger.log(`✅ Ligne ${nextRow} ajoutée - SKU: ${productData.sku} - Artist: ${productData.artist1} - Title: ${productData.title}`);
        Logger.log(`📊 Métadonnées: Genres: ${productData.genre1}, ${productData.genre2} - Description: ${(productData.description || '').substring(0, 50)}...`);
        
        return ContentService.createTextOutput(JSON.stringify({
          success: true,
          message: `Produit ${productData.sku} ajouté ligne ${nextRow}`,
          row: nextRow,
          sku: productData.sku,
          artist: productData.artist1,
          title: productData.title,
          genres: [productData.genre1, productData.genre2].filter(g => g),
          timestamp: new Date().toISOString()
        })).setMimeType(ContentService.MimeType.JSON);
        
      default:
        throw new Error(`Action inconnue: ${action}`);
    }
    
  } catch (error) {
    Logger.log(`❌ Erreur doPost DKAY Scraper: ${error.toString()}`);
    Logger.log(`📊 Stack trace: ${error.stack}`);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString(),
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Fonction doGet pour information sur la Web App
 */
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    service: "DKAY Scraper Receiver",
    version: "3.0",
    status: "active",
    timestamp: new Date().toISOString(),
    usage: "Envoyer POST avec action: 'test' ou 'addDkayRow'"
  })).setMimeType(ContentService.MimeType.JSON);
} 