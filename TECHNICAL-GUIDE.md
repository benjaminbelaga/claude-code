# 🔧 Guide Technique - WP Import Dashboard API Direct

**Guide développeur complet pour l'architecture interne et maintenance**

---

## 📋 Architecture des fonctions

### Structure modulaire
```javascript
// Pattern architectural standard
function [function_name]DirectAPI() {
  // 1. Validation UI & sécurité
  const ui = SpreadsheetApp.getUi();
  const sheet = validateSheet('update stock');
  
  // 2. Confirmation utilisateur
  const confirmation = showConfirmationDialog();
  if (!confirmation) return;
  
  // 3. Processing par batch
  const batches = createBatches(data, BATCH_SIZE);
  
  // 4. Traitement API
  batches.forEach(batch => {
    processBatch(batch);
    applyRateLimit();
  });
  
  // 5. Reporting détaillé
  showResults(successCount, errorCount, details);
}
```

### Gestion des credentials
```javascript
// Système fallback multi-niveau
function getCredentials(site) {
  // Niveau 1: Script Properties (sécurisé)
  const secure = getSecureCredentials(site);
  if (secure && isValidCredential(secure)) return secure;
  
  // Niveau 2: Fallback hardcodé  
  const fallback = API_CREDENTIALS[site];
  if (fallback && isValidCredential(fallback)) return fallback;
  
  // Niveau 3: Error
  throw new Error(`No valid credentials for ${site}`);
}
```

## 🔄 API Call Pattern

### Standard WooCommerce API Call
```javascript
function makeAPICall(method, url, payload = null) {
  const options = {
    method: method,
    headers: {
      'Authorization': 'Basic ' + Utilities.base64Encode(key + ':' + secret),
      'Content-Type': 'application/json'
    },
    muteHttpExceptions: true
  };
  
  if (payload) {
    options.payload = JSON.stringify(payload);
  }
  
  const response = UrlFetchApp.fetch(url, options);
  
  if (response.getResponseCode() !== 200) {
    throw new APIError(response.getResponseCode(), response.getContentText());
  }
  
  return JSON.parse(response.getContentText());
}
```

### Batch Processing Optimal
```javascript
function processBatch(batch, site) {
  const results = { success: 0, errors: 0, details: [] };
  
  batch.forEach(item => {
    try {
      // 1. Find product by SKU
      const products = searchProductBySKU(item.sku, site);
      
      // 2. Validate product exists
      if (products.length === 0) {
        throw new ProductNotFoundError(item.sku);
      }
      
      // 3. Update product
      const updated = updateProduct(products[0].id, item, site);
      
      // 4. Track success
      results.success++;
      Logger.log(`✅ ${item.sku} updated successfully`);
      
    } catch (error) {
      // 5. Handle error
      results.errors++;
      results.details.push({
        row: item.row,
        sku: item.sku,
        error: error.message
      });
      Logger.log(`❌ ${item.sku}: ${error.message}`);
    }
  });
  
  return results;
}
```

## 📊 Rate Limiting Strategy

### Calculs optimaux par fonction
```javascript
const RATE_LIMITS = {
  picking: {
    batchSize: 10,
    delayMs: 1000,     // 1s between batches
    reason: "Meta data updates are lightweight"
  },
  stock_yoyaku: {
    batchSize: 20, 
    delayMs: 1000,     // 1s between batches
    reason: "Standard stock API calls"
  },
  stock_yyd: {
    batchSize: 15,
    delayMs: 1500,     // 1.5s between batches  
    reason: "Pre-order logic requires more processing"
  },
  release_date: {
    batchSize: 50,
    delayMs: 500,      // 0.5s between batches
    reason: "Simple 2-field updates, fastest possible"
  }
};
```

### Adaptive Rate Limiting
```javascript
function adaptiveDelay(batchIndex, errorRate) {
  const baseDelay = RATE_LIMITS[functionType].delayMs;
  
  // Increase delay if error rate is high
  if (errorRate > 0.1) {
    return baseDelay * 2;
  }
  
  // Decrease delay for later batches if no errors
  if (batchIndex > 3 && errorRate === 0) {
    return Math.max(baseDelay * 0.8, 250);
  }
  
  return baseDelay;
}
```

## 🧪 Testing Framework

### Unit Tests Structure
```javascript
function runUnitTests() {
  const tests = [
    testSKUValidation,
    testAPICredentials, 
    testBatchProcessing,
    testErrorHandling,
    testRateLimit
  ];
  
  let passed = 0;
  let failed = 0;
  
  tests.forEach(test => {
    try {
      test();
      passed++;
      Logger.log(`✅ ${test.name} passed`);
    } catch (error) {
      failed++;
      Logger.log(`❌ ${test.name} failed: ${error.message}`);
    }
  });
  
  return { passed, failed, total: tests.length };
}
```

### Integration Tests
```javascript
function testSKUWorkflow(testSKU = 'SKU001') {
  // 1. Search product
  const products = searchProductBySKU(testSKU, 'yoyaku.io');
  assert(products.length > 0, 'Product should exist');
  
  // 2. Capture original state
  const original = products[0];
  const originalPicking1 = getMetaValue(original, '_picking_location_1');
  
  // 3. Update product
  const newValue = 'TEST-' + Date.now();
  updateProduct(original.id, { picking1: newValue }, 'yoyaku.io');
  
  // 4. Verify update
  const updated = getProduct(original.id, 'yoyaku.io');
  const updatedPicking1 = getMetaValue(updated, '_picking_location_1');
  assert(updatedPicking1 === newValue, 'Update should be applied');
  
  // 5. Cleanup - restore original
  updateProduct(original.id, { picking1: originalPicking1 }, 'yoyaku.io');
  
  Logger.log(`✅ Full workflow test passed for ${testSKU}`);
}
```

## 🚨 Error Handling Strategy

### Error Classification
```javascript
class APIError extends Error {
  constructor(statusCode, message) {
    super(`API Error ${statusCode}: ${message}`);
    this.statusCode = statusCode;
    this.isRetryable = statusCode >= 500; // Retry server errors
  }
}

class ProductNotFoundError extends Error {
  constructor(sku) {
    super(`Product not found: ${sku}`);
    this.isRetryable = false; // Never retry missing products
  }
}

class ValidationError extends Error {
  constructor(field, value) {
    super(`Invalid ${field}: ${value}`);
    this.isRetryable = false;
  }
}
```

### Retry Logic
```javascript
function withRetry(operation, maxRetries = 3) {
  let attempt = 0;
  
  while (attempt < maxRetries) {
    try {
      return operation();
    } catch (error) {
      attempt++;
      
      if (!error.isRetryable || attempt >= maxRetries) {
        throw error;
      }
      
      // Exponential backoff
      const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
      Utilities.sleep(delay);
      
      Logger.log(`Retry ${attempt}/${maxRetries} after ${delay}ms delay`);
    }
  }
}
```

## 📈 Performance Monitoring

### Execution Time Tracking
```javascript
class PerformanceMonitor {
  constructor() {
    this.startTime = Date.now();
    this.checkpoints = [];
  }
  
  checkpoint(name) {
    const now = Date.now();
    this.checkpoints.push({
      name: name,
      time: now,
      duration: now - (this.checkpoints[this.checkpoints.length - 1]?.time || this.startTime)
    });
  }
  
  report() {
    const total = Date.now() - this.startTime;
    
    Logger.log('=== PERFORMANCE REPORT ===');
    Logger.log(`Total execution: ${total}ms`);
    
    this.checkpoints.forEach(cp => {
      Logger.log(`${cp.name}: ${cp.duration}ms`);
    });
    
    return { total, checkpoints: this.checkpoints };
  }
}

// Usage
const perf = new PerformanceMonitor();
// ... processing ...
perf.checkpoint('Data validation');
// ... processing ...  
perf.checkpoint('Batch creation');
// ... processing ...
const report = perf.report();
```

### Memory Usage Optimization
```javascript
function optimizeMemoryUsage() {
  // Process large datasets in chunks to avoid memory issues
  const MEMORY_CHUNK_SIZE = 100;
  
  function processLargeDataset(data) {
    const results = [];
    
    for (let i = 0; i < data.length; i += MEMORY_CHUNK_SIZE) {
      const chunk = data.slice(i, i + MEMORY_CHUNK_SIZE);
      const chunkResults = processChunk(chunk);
      results.push(...chunkResults);
      
      // Force garbage collection hint
      if (i % (MEMORY_CHUNK_SIZE * 5) === 0) {
        Utilities.sleep(100); // Brief pause for GC
      }
    }
    
    return results;
  }
}
```

## 🔧 Maintenance & Debug

### Debug Modes
```javascript
const DEBUG_CONFIG = {
  enabled: false, // Set to true for debugging
  logLevel: 'INFO', // DEBUG, INFO, WARN, ERROR
  logAPI: false, // Log full API requests/responses
  mockMode: false // Use mock data instead of real API
};

function debugLog(level, message, data = null) {
  if (!DEBUG_CONFIG.enabled) return;
  
  const levels = ['DEBUG', 'INFO', 'WARN', 'ERROR'];
  const currentLevelIndex = levels.indexOf(DEBUG_CONFIG.logLevel);
  const messageLevelIndex = levels.indexOf(level);
  
  if (messageLevelIndex >= currentLevelIndex) {
    const timestamp = new Date().toISOString();
    Logger.log(`[${timestamp}] ${level}: ${message}`);
    
    if (data) {
      Logger.log(JSON.stringify(data, null, 2));
    }
  }
}
```

### Health Check System
```javascript
function systemHealthCheck() {
  const healthReport = {
    timestamp: new Date().toISOString(),
    apis: {},
    sheets: {},
    performance: {}
  };
  
  // Test API connectivity
  ['yoyaku.io', 'yydistribution.fr'].forEach(site => {
    try {
      const start = Date.now();
      testAPIConnectivity(site);
      healthReport.apis[site] = {
        status: 'healthy',
        responseTime: Date.now() - start
      };
    } catch (error) {
      healthReport.apis[site] = {
        status: 'error',
        error: error.message
      };
    }
  });
  
  // Test sheet access
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('update stock');
    healthReport.sheets.updateStock = {
      status: sheet ? 'found' : 'missing',
      rows: sheet ? sheet.getLastRow() : 0
    };
  } catch (error) {
    healthReport.sheets.updateStock = {
      status: 'error',
      error: error.message
    };
  }
  
  return healthReport;
}
```

---

**Maintenance Notes:**
- Review rate limits monthly based on API performance
- Update batch sizes based on server capacity changes  
- Monitor error patterns for proactive improvements
- Keep credentials rotated every 6 months
- Performance benchmark quarterly vs baseline