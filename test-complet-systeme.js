/**
 * SCRIPT DE TEST COMPLET - WP IMPORT DASHBOARD
 * Teste toutes les fonctions critiques jusqu'à ce que tout fonctionne parfaitement
 */

/**
 * Test principal qui vérifie tous les composants critiques
 */
function testSystemeComplet() {
  const ui = SpreadsheetApp.getUi();
  const rapport = [];
  let score = 0;
  let totalTests = 0;
  
  rapport.push('🔍 TEST SYSTÈME COMPLET - WP IMPORT DASHBOARD');
  rapport.push('=' .repeat(60));
  rapport.push('');
  
  // TEST 1: Configuration de base
  rapport.push('1️⃣ TEST CONFIGURATION');
  rapport.push('-'.repeat(30));
  totalTests++;
  
  try {
    // Test Config class
    if (typeof Config !== 'undefined') {
      rapport.push('✅ Classe Config définie');
      
      // Test SITES
      const sites = Config.SITES;
      if (sites && sites.YOYAKU_IO) {
        rapport.push('✅ Config.SITES.YOYAKU_IO présent');
        rapport.push(`   Domain: ${sites.YOYAKU_IO.domain}`);
        rapport.push(`   Import IDs: ${JSON.stringify(sites.YOYAKU_IO.importIds)}`);
      } else {
        rapport.push('❌ Config.SITES.YOYAKU_IO manquant');
      }
      
      // Test Import Key
      const importKey = Config.getImportKey();
      if (importKey === 'VXAf_v-w') {
        rapport.push('✅ Import Key correcte: VXAf_v-w');
        score++;
      } else {
        rapport.push(`❌ Import Key incorrecte: ${importKey}`);
      }
      
    } else {
      rapport.push('❌ Classe Config non définie');
    }
  } catch (e) {
    rapport.push('❌ Erreur configuration: ' + e.message);
  }
  
  // TEST 2: Fonctions d'import
  rapport.push('');
  rapport.push('2️⃣ TEST FONCTIONS D\'IMPORT');
  rapport.push('-'.repeat(30));
  totalTests++;
  
  try {
    // Test buildImportUrl
    if (typeof buildImportUrl === 'function') {
      const testUrl = buildImportUrl('YOYAKU_IO', 'stock', 'trigger');
      if (testUrl && testUrl.includes('yoyaku.io') && testUrl.includes('803') && testUrl.includes('VXAf_v-w')) {
        rapport.push('✅ buildImportUrl fonctionne');
        rapport.push(`   URL générée: ${testUrl.substring(0, 80)}...`);
        score++;
      } else {
        rapport.push('❌ buildImportUrl génère URL incorrecte');
        rapport.push(`   URL: ${testUrl}`);
      }
    } else {
      rapport.push('❌ buildImportUrl non définie');
    }
    
    // Test runImportEngine
    if (typeof runImportEngine === 'function') {
      rapport.push('✅ runImportEngine définie');
    } else {
      rapport.push('❌ runImportEngine non définie');
    }
    
  } catch (e) {
    rapport.push('❌ Erreur fonctions import: ' + e.message);
  }
  
  // TEST 3: Fonctions utilitaires
  rapport.push('');
  rapport.push('3️⃣ TEST FONCTIONS UTILITAIRES');
  rapport.push('-'.repeat(30));
  totalTests++;
  
  try {
    // Test slugify
    if (typeof slugify === 'function') {
      const testSlug = slugify('Éric Prydz - Café');
      if (testSlug === 'eric-prydz-cafe') {
        rapport.push('✅ slugify fonctionne correctement');
        score++;
      } else {
        rapport.push(`❌ slugify incorrect: "${testSlug}" (attendu: "eric-prydz-cafe")`);
      }
    } else {
      rapport.push('❌ slugify non définie');
    }
    
    // Test checkUrl
    if (typeof checkUrl === 'function') {
      rapport.push('✅ checkUrl définie');
    } else {
      rapport.push('❌ checkUrl non définie');
    }
    
    // Test analyzeImportComplexity
    if (typeof analyzeImportComplexity === 'function') {
      const analysis = analyzeImportComplexity();
      if (analysis && typeof analysis === 'object') {
        rapport.push('✅ analyzeImportComplexity fonctionne');
        rapport.push(`   SKUs détectés: ${analysis.validSKUs || 0}`);
        rapport.push(`   Temps estimé: ${analysis.estimatedTime || 0}s`);
      } else {
        rapport.push('❌ analyzeImportComplexity retourne résultat invalide');
      }
    } else {
      rapport.push('❌ analyzeImportComplexity non définie');
    }
    
  } catch (e) {
    rapport.push('❌ Erreur fonctions utilitaires: ' + e.message);
  }
  
  // TEST 4: Fonctions de menu
  rapport.push('');
  rapport.push('4️⃣ TEST FONCTIONS MENU');
  rapport.push('-'.repeat(30));
  totalTests++;
  
  try {
    // Test fonctions principales du menu
    const fonctionsMenu = [
      'runYoyakuStockUpdate',
      'runYoyakuNewImport', 
      'runYYDImport',
      'testDirectYoyakuStock',
      'runSmartValidator'
    ];
    
    let fonctionsOK = 0;
    fonctionsMenu.forEach(nomFonction => {
      if (typeof eval(nomFonction) === 'function') {
        fonctionsOK++;
      }
    });
    
    if (fonctionsOK === fonctionsMenu.length) {
      rapport.push('✅ Toutes les fonctions menu définies');
      score++;
    } else {
      rapport.push(`❌ ${fonctionsOK}/${fonctionsMenu.length} fonctions menu définies`);
    }
    
  } catch (e) {
    rapport.push('❌ Erreur fonctions menu: ' + e.message);
  }
  
  // TEST 5: Handlers d'import
  rapport.push('');
  rapport.push('5️⃣ TEST HANDLERS D\'IMPORT');
  rapport.push('-'.repeat(30));
  totalTests++;
  
  try {
    // Test handleWPImportComplete
    if (typeof handleWPImportComplete === 'function') {
      rapport.push('✅ handleWPImportComplete définie');
    } else {
      rapport.push('❌ handleWPImportComplete non définie');
    }
    
    // Test filterAndSendToPabblyForStockUpdate
    if (typeof filterAndSendToPabblyForStockUpdate === 'function') {
      rapport.push('✅ filterAndSendToPabblyForStockUpdate définie');
      score++;
    } else {
      rapport.push('❌ filterAndSendToPabblyForStockUpdate non définie');
    }
    
  } catch (e) {
    rapport.push('❌ Erreur handlers import: ' + e.message);
  }
  
  // RÉSUMÉ FINAL
  rapport.push('');
  rapport.push('🎯 RÉSUMÉ FINAL');
  rapport.push('=' .repeat(60));
  
  const pourcentage = Math.round((score / totalTests) * 100);
  rapport.push(`Score: ${score}/${totalTests} (${pourcentage}%)`);
  
  if (pourcentage >= 80) {
    rapport.push('🎉 SYSTÈME OPÉRATIONNEL');
  } else if (pourcentage >= 60) {
    rapport.push('⚠️ SYSTÈME PARTIELLEMENT FONCTIONNEL');
  } else {
    rapport.push('❌ SYSTÈME NON FONCTIONNEL');
  }
  
  // Afficher le rapport
  const texteRapport = rapport.join('\n');
  console.log(texteRapport);
  ui.alert('Test Système Complet', texteRapport, ui.ButtonSet.OK);
  
  return {
    score: score,
    total: totalTests,
    pourcentage: pourcentage,
    rapport: texteRapport
  };
}

/**
 * Test spécifique de la fonction stock update
 */
function testStockUpdateFlow() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    console.log('🧪 TEST STOCK UPDATE FLOW');
    
    // Test 1: Vérifier la configuration
    const siteConfig = Config.getSiteConfig('YOYAKU_IO');
    if (!siteConfig) {
      throw new Error('Configuration YOYAKU_IO non trouvée');
    }
    
    const importId = siteConfig.importIds.stock;
    if (importId !== '803') {
      throw new Error(`Import ID stock incorrect: ${importId} (attendu: 803)`);
    }
    
    // Test 2: Générer l'URL
    const url = buildImportUrl('YOYAKU_IO', 'stock', 'trigger');
    console.log('URL générée:', url);
    
    // Test 3: Vérifier les composants de l'URL
    const urlCorrects = [
      url.includes('yoyaku.io'),
      url.includes('import_key=VXAf_v-w'),
      url.includes('import_id=803'),
      url.includes('action=trigger'),
      url.includes('hpos=1')
    ];
    
    const urlOK = urlCorrects.every(test => test);
    
    if (urlOK) {
      ui.alert('✅ Test Stock Update', 'Flow de stock update validé!\n\n• Configuration OK\n• URL générée correctement\n• Tous les paramètres présents', ui.ButtonSet.OK);
      return true;
    } else {
      ui.alert('❌ Test Stock Update', `Flow de stock update échoué!\n\nURL: ${url}\n\nVérifiez la configuration.`, ui.ButtonSet.OK);
      return false;
    }
    
  } catch (error) {
    ui.alert('❌ Erreur Test Stock Update', `Erreur: ${error.message}`, ui.ButtonSet.OK);
    return false;
  }
}

/**
 * Test de connectivité réseau
 */
function testConnectivite() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    console.log('🌐 TEST CONNECTIVITÉ');
    
    // Test connexion à Google
    const testGoogle = checkUrl('https://www.google.com');
    console.log('Test Google:', testGoogle);
    
    // Test connexion à YOYAKU.IO
    const testYoyaku = checkUrl('https://www.yoyaku.io');
    console.log('Test YOYAKU.IO:', testYoyaku);
    
    // Test connexion à YYDistribution
    const testYYD = checkUrl('https://www.yydistribution.fr');
    console.log('Test YYD:', testYYD);
    
    const resultats = `Test de connectivité:\n\n• Google: ${testGoogle}\n• YOYAKU.IO: ${testYoyaku}\n• YYDistribution: ${testYYD}`;
    
    ui.alert('🌐 Test Connectivité', resultats, ui.ButtonSet.OK);
    
    return {
      google: testGoogle,
      yoyaku: testYoyaku,
      yyd: testYYD
    };
    
  } catch (error) {
    ui.alert('❌ Erreur Connectivité', `Erreur: ${error.message}`, ui.ButtonSet.OK);
    return null;
  }
} 