# 🔧 Import 852 YOYAKU - Spécifications API Complètes

**Date:** 2025-08-21  
**Import:** #852 "regular new product 2025"  
**Status:** ✅ SPÉCIFICATIONS TECHNIQUES COMPLÈTES  
**API Version:** v1.0  

---

## 📋 API ENDPOINT SPECIFICATION

### Endpoint Details
```yaml
endpoint: /wp-json/yoyaku/v1/products/create-new-852
method: POST
authentication: WooCommerce REST API Key
batch_support: true
rate_limit: 1 request/second
timeout: 60 seconds
```

### Request Headers
```http
POST /wp-json/yoyaku/v1/products/create-new-852 HTTP/1.1
Host: www.yoyaku.io
Authorization: Basic <base64(consumer_key:consumer_secret)>
Content-Type: application/json
User-Agent: YOYAKU-API-Direct/1.0
X-Batch-Size: 15
X-Source: google-sheets-import-852
```

---

## 📥 INPUT SCHEMA

### Required Fields
```javascript
{
  "sku": {
    "type": "string",
    "required": true,
    "pattern": "^[A-Z][0-9]{3,4}$",
    "example": "M036",
    "description": "Unique product identifier"
  },
  "title": {
    "type": "string", 
    "required": true,
    "maxLength": 100,
    "example": "Riding The Thin Line",
    "description": "Product title"
  },
  "label": {
    "type": "string",
    "required": true,
    "maxLength": 50,
    "example": "Metroplex",
    "description": "Music label name → musiclabel taxonomy"
  },
  "price_yoyaku": {
    "type": "string",
    "required": true,
    "pattern": "^[0-9]+,[0-9]{1,2}$",
    "example": "16,4",
    "description": "Price in European decimal format"
  }
}
```

### Optional Fields
```javascript
{
  "distributor": {
    "type": "string",
    "maxLength": 50,
    "example": "clone",
    "description": "Distributor name → distributormusic taxonomy"
  },
  "release_date": {
    "type": "string",
    "format": "date",
    "pattern": "^[0-9]{4}-[0-9]{2}-[0-9]{2}$",
    "example": "2025-09-18",
    "description": "Release date (must be future)"
  },
  "artist1": {
    "type": "string",
    "maxLength": 50,
    "example": "DJ Bone",
    "description": "Primary artist → musicartist taxonomy"
  },
  "artist2": {
    "type": "string", 
    "maxLength": 50,
    "example": "CEM3340",
    "description": "Secondary artist → musicartist taxonomy"
  },
  "artist3": {
    "type": "string",
    "maxLength": 50,
    "description": "Third artist → musicartist taxonomy"
  },
  "artist4": {
    "type": "string",
    "maxLength": 50,
    "description": "Fourth artist → musicartist taxonomy"
  },
  "genre1": {
    "type": "string",
    "maxLength": 30,
    "example": "Detroit techno",
    "description": "Primary genre → musicstyle taxonomy"
  },
  "genre2": {
    "type": "string",
    "maxLength": 30,
    "example": "Electronic",
    "description": "Secondary genre → musicstyle taxonomy"
  },
  "genre3": {
    "type": "string",
    "maxLength": 30,
    "description": "Third genre → musicstyle taxonomy"
  },
  "genre4": {
    "type": "string",
    "maxLength": 30,
    "description": "Fourth genre → musicstyle taxonomy"
  },
  "description": {
    "type": "string",
    "maxLength": 2000,
    "example": "Riding the Thin Line is an EP by DJ Bone...",
    "description": "Product description"
  },
  "feature": {
    "type": "string",
    "maxLength": 100,
    "example": "world exclusive",
    "description": "Special features → _product_features custom field"
  },
  "format": {
    "type": "string",
    "maxLength": 20,
    "example": "12inch",
    "description": "Music format → _music_formats custom field"
  },
  "weight": {
    "type": "string",
    "pattern": "^[0-9]+,[0-9]{1,2}$",
    "example": "0,20",
    "description": "Weight in kg (European decimal)"
  },
  "price_net": {
    "type": "string",
    "pattern": "^[0-9]+,[0-9]{1,2}$",
    "example": "8,79",
    "description": "Cost price → _wc_cog_cost custom field"
  },
  "playlist_files": {
    "type": "string",
    "maxLength": 5000,
    "example": "1 Track||https://...mp3##2 Track||https://...mp3",
    "description": "Playlist in YOYAKU format → _yoyaku_playlist_files_raw"
  },
  "slug": {
    "type": "string",
    "pattern": "^[a-z0-9-]+$",
    "example": "dj-bone-riding-the-thin-line-m036",
    "description": "URL slug"
  },
  "tag1": {
    "type": "string",
    "maxLength": 30,
    "description": "First tag → product_tag taxonomy"
  },
  "tag2": {
    "type": "string",
    "maxLength": 30,
    "description": "Second tag → product_tag taxonomy"
  }
}
```

### Batch Request Schema
```javascript
{
  "batch": [
    {
      "sku": "M036",
      "title": "Riding The Thin Line",
      "label": "Metroplex",
      "price_yoyaku": "16,4",
      "artist1": "DJ Bone",
      "genre1": "Detroit techno",
      "genre2": "Electronic",
      // ... other fields
    },
    {
      "sku": "M052", 
      "title": "Machines Awake EP",
      // ... other fields
    }
  ],
  "options": {
    "validate_only": false,
    "create_terms": true,
    "process_images": true,
    "send_notifications": false
  }
}
```

---

## 📤 OUTPUT SCHEMA

### Success Response
```javascript
{
  "success": true,
  "message": "Products processed successfully",
  "batch_id": "batch_20250821_154832",
  "processed_count": 15,
  "results": [
    {
      "sku": "M036",
      "status": "created",
      "product_id": 98765,
      "url": "https://www.yoyaku.io/product/dj-bone-riding-the-thin-line-m036/",
      "processing_time": "2.34s",
      "warnings": [],
      "created_data": {
        "taxonomies": {
          "musicartist": ["DJ Bone"],
          "musiclabel": ["Metroplex"],
          "musicstyle": ["Detroit techno", "Electronic"],
          "distributormusic": ["clone"],
          "product_cat": ["Forthcoming"]
        },
        "custom_fields": {
          "_wc_cog_cost": "8.79",
          "_coming_soon_label": "2025-09-18",
          "_product_features": "world exclusive",
          "_music_formats": "12inch",
          "_product_origin_country": "FR",
          "hscode_custom_field": "85238010"
        },
        "images": {
          "featured": "https://yydistribution.ams3.digitaloceanspaces.com/yyplayer/images/M036_1_600.jpg",
          "gallery": ["...M036_2_600.jpg", "...M036_3_600.jpg"],
          "processed": 8,
          "failed": 2
        }
      }
    }
  ],
  "summary": {
    "created": 13,
    "updated": 0, 
    "failed": 2,
    "warnings": 5,
    "images_processed": 124,
    "images_failed": 18,
    "taxonomies_created": 8,
    "processing_time": "34.2s"
  }
}
```

### Error Response
```javascript
{
  "success": false,
  "message": "Batch processing failed",
  "error_code": "VALIDATION_FAILED",
  "batch_id": "batch_20250821_154832",
  "processed_count": 3,
  "results": [
    {
      "sku": "INVALID",
      "status": "failed",
      "errors": [
        {
          "field": "sku",
          "code": "INVALID_FORMAT", 
          "message": "SKU must match pattern ^[A-Z][0-9]{3,4}$"
        },
        {
          "field": "price_yoyaku",
          "code": "REQUIRED_FIELD",
          "message": "price_yoyaku is required"
        }
      ]
    }
  ],
  "global_errors": [
    {
      "code": "RATE_LIMIT_EXCEEDED",
      "message": "Rate limit exceeded: 1 request/second"
    }
  ]
}
```

---

## ⚙️ DATA TRANSFORMATION RULES

### 1. Price Conversion
```javascript
function convertEuropeanPrice(europeanPrice) {
  // Input: "16,4" (European)
  // Output: "16.4" (English decimal)
  
  if (!europeanPrice || europeanPrice === '') return '';
  
  const converted = europeanPrice.replace(',', '.');
  const parsed = parseFloat(converted);
  
  if (isNaN(parsed) || parsed <= 0) {
    throw new ValidationError('Invalid price format');
  }
  
  return parsed.toString();
}

// Examples:
// "16,4" → "16.4"
// "8,79" → "8.79"
// "0,20" → "0.2"
```

### 2. Taxonomy Processing
```javascript
function processTaxonomies(data) {
  const taxonomies = {};
  
  // Music Artists (up to 4)
  const artists = [data.artist1, data.artist2, data.artist3, data.artist4]
    .filter(artist => artist && artist.trim())
    .map(artist => artist.trim());
  
  if (artists.length > 0) {
    taxonomies.musicartist = artists;
  }
  
  // Music Genres (up to 4)  
  const genres = [data.genre1, data.genre2, data.genre3, data.genre4]
    .filter(genre => genre && genre.trim())
    .map(genre => genre.trim());
    
  if (genres.length > 0) {
    taxonomies.musicstyle = genres;
  }
  
  // Single value taxonomies
  if (data.label && data.label.trim()) {
    taxonomies.musiclabel = [data.label.trim()];
  }
  
  if (data.distributor && data.distributor.trim()) {
    taxonomies.distributormusic = [data.distributor.trim()];
  }
  
  // Hardcoded category
  taxonomies.product_cat = ['Forthcoming'];
  
  // Tags
  const tags = [data.tag1, data.tag2]
    .filter(tag => tag && tag.trim())
    .map(tag => tag.trim());
    
  if (tags.length > 0) {
    taxonomies.product_tag = tags;
  }
  
  return taxonomies;
}
```

### 3. Image URL Generation
```javascript
function generateImageUrls(sku) {
  const baseUrl = 'https://yydistribution.ams3.digitaloceanspaces.com/yyplayer/images/';
  const imageUrls = [];
  
  // Primary images (DigitalOcean Spaces)
  for (let i = 1; i <= 10; i++) {
    imageUrls.push({
      src: `${baseUrl}${sku}_${i}_600.jpg`,
      name: `${sku}_${i}`,
      position: i === 1 ? 0 : i - 1  // First image is featured (position 0)
    });
  }
  
  return imageUrls;
}
```

### 4. Custom Fields Mapping
```javascript
function buildCustomFields(data) {
  const customFields = [];
  
  // Cost of Goods
  if (data.price_net) {
    customFields.push({
      key: '_wc_cog_cost',
      value: convertEuropeanPrice(data.price_net)
    });
  }
  
  // Coming Soon Label
  if (data.release_date) {
    customFields.push({
      key: '_coming_soon_label',
      value: data.release_date
    });
  }
  
  // Product Features
  if (data.feature) {
    customFields.push({
      key: '_product_features',
      value: data.feature
    });
  }
  
  // Music Format
  if (data.format) {
    customFields.push({
      key: '_music_formats', 
      value: data.format
    });
  }
  
  // Playlist Files
  if (data.playlist_files) {
    customFields.push({
      key: '_yoyaku_playlist_files_raw',
      value: data.playlist_files
    });
  }
  
  // Hardcoded UPS/Legal fields
  customFields.push(\n    { key: '_ph_ups_manufacture_country', value: 'FR' },\n    { key: '_wf_ups_hst', value: '85238010' },\n    { key: 'ph_ups_invoice_desc', value: 'Vinyl record or Phonograph record' },\n    { key: '_product_origin_country', value: 'FR' },\n    { key: 'hscode_custom_field', value: '85238010' },\n    { key: '_set_coming_soon', value: 'yes' }\n  );\n  \n  // Generated fields\n  customFields.push({\n    key: '_wp_old_slug',\n    value: data.sku.toLowerCase()\n  });\n  \n  customFields.push({\n    key: '_product_qr_code',\n    value: `https://www.yoyaku.io/release/${data.sku.toLowerCase()}`\n  });\n  \n  return customFields;\n}\n```\n\n### 5. Unique Key Generation\n```javascript\nfunction generateUniqueKey(data) {\n  // WP Import pattern: {sku}-{distributor}{release_date}\n  const sku = data.sku || '';\n  const distributor = data.distributor || 'unknown';\n  const releaseDate = data.release_date || new Date().toISOString().split('T')[0];\n  \n  return `${sku}-${distributor}${releaseDate}`;\n}\n\n// Examples:\n// \"M036-clone2025-09-18\"\n// \"M052-clone2025-10-22\"\n```\n\n---\n\n## 🔍 VALIDATION RULES\n\n### Pre-processing Validation\n```javascript\nfunction validateInput(data) {\n  const errors = [];\n  \n  // Required fields\n  if (!data.sku || !data.sku.match(/^[A-Z][0-9]{3,4}$/)) {\n    errors.push({\n      field: 'sku',\n      code: 'INVALID_FORMAT',\n      message: 'SKU must match pattern [A-Z][0-9]{3,4}'\n    });\n  }\n  \n  if (!data.title || data.title.trim().length === 0) {\n    errors.push({\n      field: 'title',\n      code: 'REQUIRED_FIELD',\n      message: 'Title is required'\n    });\n  }\n  \n  if (!data.label || data.label.trim().length === 0) {\n    errors.push({\n      field: 'label',\n      code: 'REQUIRED_FIELD',\n      message: 'Label is required'\n    });\n  }\n  \n  if (!data.price_yoyaku || !data.price_yoyaku.match(/^[0-9]+,[0-9]{1,2}$/)) {\n    errors.push({\n      field: 'price_yoyaku',\n      code: 'INVALID_FORMAT',\n      message: 'Price must be in European decimal format (e.g. 16,4)'\n    });\n  }\n  \n  // Business rules validation\n  if (data.release_date) {\n    const releaseDate = new Date(data.release_date);\n    const today = new Date();\n    \n    if (releaseDate <= today) {\n      errors.push({\n        field: 'release_date',\n        code: 'INVALID_DATE',\n        message: 'Release date must be in the future for Import 852'\n      });\n    }\n  }\n  \n  return errors;\n}\n```\n\n### Duplicate Check\n```javascript\nasync function checkDuplicates(data) {\n  const uniqueKey = generateUniqueKey(data);\n  \n  // Check by unique key first\n  const existingByKey = await findProductByUniqueKey(uniqueKey);\n  if (existingByKey) {\n    return {\n      duplicate: true,\n      reason: 'unique_key_exists',\n      existing_id: existingByKey.id,\n      message: `Product with unique key ${uniqueKey} already exists`\n    };\n  }\n  \n  // Check by SKU  \n  const existingBySku = await findProductBySku(data.sku);\n  if (existingBySku) {\n    return {\n      duplicate: true,\n      reason: 'sku_exists',\n      existing_id: existingBySku.id,\n      message: `Product with SKU ${data.sku} already exists`\n    };\n  }\n  \n  return { duplicate: false };\n}\n```\n\n---\n\n## 🎯 WOOCOMMERCE API PAYLOAD\n\n### Product Creation Payload\n```javascript\nfunction buildWooCommercePayload(data) {\n  return {\n    name: data.title,\n    slug: data.slug || generateSlug(data),\n    type: 'simple',\n    status: 'publish',\n    catalog_visibility: 'visible',\n    description: data.description || '',\n    short_description: '',\n    \n    // Pricing\n    regular_price: convertEuropeanPrice(data.price_yoyaku),\n    sale_price: '',\n    \n    // Inventory\n    sku: data.sku,\n    manage_stock: true,\n    stock_quantity: 0,\n    stock_status: 'outofstock',\n    backorders: 'no',\n    sold_individually: false,\n    \n    // Shipping\n    weight: data.weight ? convertEuropeanPrice(data.weight) : '0.20',\n    dimensions: {\n      length: '30',\n      width: '30', \n      height: '0.2'\n    },\n    shipping_class: '',\n    \n    // Tax\n    tax_status: 'taxable',\n    tax_class: '',\n    \n    // Product options\n    virtual: false,\n    downloadable: false,\n    featured: false,\n    \n    // Categories & Tags\n    categories: [{ name: 'Forthcoming' }],\n    tags: buildTags(data),\n    \n    // Images\n    images: generateImageUrls(data.sku),\n    \n    // Custom Fields\n    meta_data: buildCustomFields(data),\n    \n    // Custom taxonomies (will be set separately)\n    // musicartist, musiclabel, musicstyle, distributormusic\n  };\n}\n```\n\n---\n\n## 🔄 ERROR HANDLING\n\n### Error Types & Recovery\n```javascript\nclass Import852Error extends Error {\n  constructor(type, message, field = null, data = null) {\n    super(message);\n    this.type = type;\n    this.field = field;\n    this.data = data;\n  }\n}\n\n// Error types\nconst ERROR_TYPES = {\n  VALIDATION_ERROR: 'validation_error',\n  DUPLICATE_PRODUCT: 'duplicate_product',\n  API_ERROR: 'api_error',\n  IMAGE_PROCESSING_ERROR: 'image_processing_error',\n  TAXONOMY_ERROR: 'taxonomy_error',\n  RATE_LIMIT_ERROR: 'rate_limit_error'\n};\n\n// Error recovery strategies\nfunction handleError(error, productData) {\n  switch (error.type) {\n    case ERROR_TYPES.VALIDATION_ERROR:\n      // Critical: Skip product\n      return { action: 'skip', reason: error.message };\n      \n    case ERROR_TYPES.DUPLICATE_PRODUCT:\n      // Update existing or skip\n      return { action: 'update_existing', product_id: error.data.existing_id };\n      \n    case ERROR_TYPES.IMAGE_PROCESSING_ERROR:\n      // Continue without images\n      return { action: 'continue_without_images', warning: error.message };\n      \n    case ERROR_TYPES.TAXONOMY_ERROR:\n      // Continue with default taxonomies\n      return { action: 'continue_with_defaults', warning: error.message };\n      \n    case ERROR_TYPES.RATE_LIMIT_ERROR:\n      // Retry with delay\n      return { action: 'retry_with_delay', delay: 5000 };\n      \n    default:\n      // Unknown error: Skip product\n      return { action: 'skip', reason: `Unknown error: ${error.message}` };\n  }\n}\n```\n\n### Rollback Strategy\n```javascript\nclass RollbackManager {\n  constructor() {\n    this.createdProducts = [];\n    this.createdTerms = [];\n    this.processedImages = [];\n  }\n  \n  trackCreatedProduct(productId, productData) {\n    this.createdProducts.push({ id: productId, data: productData });\n  }\n  \n  trackCreatedTerm(taxonomy, termId, termName) {\n    this.createdTerms.push({ taxonomy, id: termId, name: termName });\n  }\n  \n  async rollbackBatch() {\n    console.log(`Rolling back ${this.createdProducts.length} products`);\n    \n    // Delete created products\n    for (const product of this.createdProducts.reverse()) {\n      try {\n        await deleteProduct(product.id, true); // force delete\n        console.log(`Rolled back product ${product.id}`);\n      } catch (error) {\n        console.error(`Failed to rollback product ${product.id}:`, error);\n      }\n    }\n    \n    // Clean up created terms (if they have no other products)\n    for (const term of this.createdTerms.reverse()) {\n      try {\n        const termUsage = await getTermUsageCount(term.taxonomy, term.id);\n        if (termUsage === 0) {\n          await deleteTerm(term.taxonomy, term.id, true);\n          console.log(`Rolled back term ${term.name} from ${term.taxonomy}`);\n        }\n      } catch (error) {\n        console.error(`Failed to rollback term ${term.name}:`, error);\n      }\n    }\n  }\n}\n```\n\n---\n\n## 🚀 IMPLEMENTATION EXAMPLE\n\n### Google Apps Script Function\n```javascript\nfunction processImport852NewProducts() {\n  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();\n  const sheet = spreadsheet.getSheetByName('update stock');\n  \n  if (!sheet) {\n    throw new Error('Sheet \"update stock\" not found');\n  }\n  \n  const data = getSheetData(sheet);\n  const rollbackManager = new RollbackManager();\n  \n  try {\n    const results = [];\n    \n    for (const row of data) {\n      try {\n        // Validate\n        const validationErrors = validateInput(row);\n        if (validationErrors.length > 0) {\n          results.push({\n            sku: row.sku,\n            status: 'failed',\n            errors: validationErrors\n          });\n          continue;\n        }\n        \n        // Check duplicates\n        const duplicateCheck = await checkDuplicates(row);\n        if (duplicateCheck.duplicate) {\n          results.push({\n            sku: row.sku,\n            status: 'skipped',\n            reason: duplicateCheck.message\n          });\n          continue;\n        }\n        \n        // Create product\n        const payload = buildWooCommercePayload(row);\n        const response = await createWooCommerceProduct(payload);\n        \n        if (response.success) {\n          // Set taxonomies\n          await setProductTaxonomies(response.product.id, processTaxonomies(row));\n          \n          // Process images\n          await processProductImages(response.product.id, generateImageUrls(row.sku));\n          \n          rollbackManager.trackCreatedProduct(response.product.id, row);\n          \n          results.push({\n            sku: row.sku,\n            status: 'created',\n            product_id: response.product.id,\n            url: response.product.permalink\n          });\n        } else {\n          results.push({\n            sku: row.sku,\n            status: 'failed', \n            errors: response.errors\n          });\n        }\n        \n        // Rate limiting\n        Utilities.sleep(1500); // 1.5 seconds between requests\n        \n      } catch (error) {\n        const recovery = handleError(error, row);\n        \n        if (recovery.action === 'skip') {\n          results.push({\n            sku: row.sku,\n            status: 'failed',\n            errors: [{ message: recovery.reason }]\n          });\n        } else if (recovery.action === 'retry_with_delay') {\n          Utilities.sleep(recovery.delay);\n          // Retry logic here...\n        }\n      }\n    }\n    \n    return {\n      success: true,\n      message: `Processed ${results.length} products`,\n      results: results,\n      summary: generateSummary(results)\n    };\n    \n  } catch (batchError) {\n    console.error('Batch processing failed:', batchError);\n    await rollbackManager.rollbackBatch();\n    \n    return {\n      success: false,\n      message: 'Batch processing failed - all changes rolled back',\n      error: batchError.message\n    };\n  }\n}\n```\n\n---\n\n## 📊 TESTING STRATEGY\n\n### Unit Tests\n```javascript\n// Test data conversion\nfunction testPriceConversion() {\n  assert.equal(convertEuropeanPrice('16,4'), '16.4');\n  assert.equal(convertEuropeanPrice('8,79'), '8.79');\n  assert.equal(convertEuropeanPrice('0,20'), '0.2');\n}\n\n// Test taxonomy processing\nfunction testTaxonomyProcessing() {\n  const testData = {\n    artist1: 'DJ Bone',\n    artist2: '',\n    genre1: 'Detroit techno',\n    genre2: 'Electronic',\n    label: 'Metroplex',\n    distributor: 'clone'\n  };\n  \n  const result = processTaxonomies(testData);\n  \n  assert.deepEqual(result.musicartist, ['DJ Bone']);\n  assert.deepEqual(result.musicstyle, ['Detroit techno', 'Electronic']);\n  assert.deepEqual(result.musiclabel, ['Metroplex']);\n  assert.deepEqual(result.product_cat, ['Forthcoming']);\n}\n\n// Test unique key generation\nfunction testUniqueKeyGeneration() {\n  const testData = {\n    sku: 'M036',\n    distributor: 'clone',\n    release_date: '2025-09-18'\n  };\n  \n  const result = generateUniqueKey(testData);\n  assert.equal(result, 'M036-clone2025-09-18');\n}\n```\n\n### Integration Tests\n```javascript\n// Test full product creation flow\nfunction testProductCreationFlow() {\n  const testProduct = {\n    sku: 'TEST001',\n    title: 'Test Product',\n    label: 'Test Label',\n    price_yoyaku: '15,5',\n    artist1: 'Test Artist',\n    genre1: 'Test Genre',\n    release_date: '2025-12-01'\n  };\n  \n  // Should validate successfully\n  const validationErrors = validateInput(testProduct);\n  assert.equal(validationErrors.length, 0);\n  \n  // Should generate correct payload\n  const payload = buildWooCommercePayload(testProduct);\n  assert.equal(payload.name, 'Test Product');\n  assert.equal(payload.sku, 'TEST001');\n  assert.equal(payload.regular_price, '15.5');\n  \n  // Should generate image URLs\n  const imageUrls = generateImageUrls('TEST001');\n  assert.equal(imageUrls.length, 10);\n  assert.equal(imageUrls[0].src, 'https://yydistribution.ams3.digitaloceanspaces.com/yyplayer/images/TEST001_1_600.jpg');\n}\n```\n\n---\n\n**✅ SPÉCIFICATIONS COMPLÈTES:** API Import 852 entièrement spécifiée avec validation, transformation, gestion d'erreurs, rollback et tests. Prêt pour implémentation Phase 2.