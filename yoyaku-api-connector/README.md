# YOYAKU API Connector

**Centralized REST API endpoints for Google Apps Scripts integration**

Ultra-fast custom WordPress plugin that provides both READ and WRITE operations with direct database queries for maximum performance.

## 🚀 Features

- ✅ **Dual-Site Support** - YOYAKU.IO (B2C) and YYD.FR (B2B) with different configurations
- ✅ **Ultra Fast** - Direct database queries, < 100ms response time
- ✅ **Secure** - Bearer token authentication for write operations
- ✅ **Batch Support** - Process up to 50 products in one request
- ✅ **Idempotent** - Create-or-update by SKU
- ✅ **Complete** - Handles products, taxonomies, images, meta data

## 📦 Endpoints

### v1 Endpoints (READ-ONLY, Public)

#### Product Stock Data

**For:** `wp-import-dashboard` Google Apps Script

**Single Product:**
```
GET /wp-json/yoyaku/v1/product-stock-data/{SKU}
```

**Batch:**
```
POST /wp-json/yoyaku/v1/product-stock-data/batch
Content-Type: application/json

{
  "skus": ["GRN003", "D2E002", "OYSTER72"]
}
```

#### Supply Products

**For:** Supply Dashboard

```
GET /wp-json/yoyaku/v1/supply-products?per_page=100&page=1
```

### v2 Endpoints (READ + WRITE, Authenticated)

#### Create Product

**For:** Google Apps Script product creation from sheets

**Single Product:**
```
POST /wp-json/yoyaku/v2/product/create
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "site": "yoyaku",
  "sku": "TEST001",
  "title": "Artist - Album Title",
  "slug": "artist-album-title-test001",
  "description": "Album description",
  "price": 14.99,
  "weight": 0.2,
  "stock_quantity": 0,
  "stock_status": "outofstock",
  "category": "Forthcoming",
  "tags": ["New Release", "Vinyl"],
  "images": [
    "https://yydistribution.ams3.digitaloceanspaces.com/yyplayer/images/TEST001_1.jpg",
    "https://yydistribution.ams3.digitaloceanspaces.com/yyplayer/images/TEST001_2.jpg"
  ],
  "artists": ["Artist Name"],
  "label": "Label Name",
  "genres": ["Techno", "Electronic"],
  "distributor": "deejay",
  "meta_data": {
    "_yoyaku_playlist_files_raw": "Track 1||url##Track 2||url",
    "_set_coming_soon": "yes"
  }
}
```

**Response:**
```json
{
  "success": true,
  "action": "created",
  "product_id": 12345,
  "sku": "TEST001",
  "url": "https://yoyaku.io/product/artist-album-title-test001/",
  "execution_time_ms": 125.5,
  "site": "yoyaku"
}
```

#### Batch Create Products

```
POST /wp-json/yoyaku/v2/products/batch-create
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "site": "yoyaku",
  "products": [
    { "sku": "TEST001", "title": "...", ... },
    { "sku": "TEST002", "title": "...", ... }
  ]
}
```

**Response:**
```json
{
  "batch_complete": true,
  "total": 2,
  "successes": 2,
  "failures": 0,
  "results": [...]
}
```

## 🔐 Authentication

### v1 Endpoints (Public)
No authentication required for read-only operations.

### v2 Endpoints (Secured)
Requires Bearer token authentication.

**Setup:**

1. Generate a secure random token:
```bash
openssl rand -base64 32
```

2. Add to `wp-config.php` (BEFORE `/* That's all, stop editing! */`):
```php
define('YOYAKU_API_BEARER_TOKEN', 'your-secure-token-here');
```

3. Use in requests:
```bash
curl -X POST https://yoyaku.io/wp-json/yoyaku/v2/product/create \
  -H "Authorization: Bearer your-secure-token-here" \
  -H "Content-Type: application/json" \
  -d '{"sku": "TEST001", ...}'
```

**Google Apps Script:**
```javascript
const BEARER_TOKEN = PropertiesService.getScriptProperties().getProperty('YOYAKU_API_BEARER_TOKEN');

const response = UrlFetchApp.fetch(url, {
  method: 'post',
  headers: {
    'Authorization': 'Bearer ' + BEARER_TOKEN,
    'Content-Type': 'application/json'
  },
  payload: JSON.stringify(productData)
});
```

## 🌐 Site-Specific Configuration

### YOYAKU.IO (B2C)
```json
{
  "site": "yoyaku",
  "category": "Forthcoming",
  "price": 14.99,
  "meta_data": {
    "_set_coming_soon": "yes"
  }
}
```

**Taxonomies:**
- `musicartist` - Artists
- `musiclabel` - Labels
- `musicstyle` - Genres
- `distributormusic` - Distributors

### YYD.FR (B2B)
```json
{
  "site": "yyd",
  "category": "Label Name",
  "price": 11.49,
  "format": "12\"",
  "meta_data": {
    "_is_pre_order": "yes",
    "_low_stock_amount": "10"
  }
}
```

**Taxonomies:**
- `musicartist` - Artists
- `musiclabel` - Labels (also used as category!)
- `musicstyle` - Genres
- `ownermusic` - Distributors (different from YOYAKU!)
- `musicformat` - Format (YYD only)

**Key Differences:**
- YYD uses `label` as category name (not "Forthcoming")
- YYD uses `ownermusic` taxonomy for distributor (not `distributormusic`)
- YYD has `musicformat` taxonomy
- YYD products are always pre-order (`_is_pre_order: yes`)
- YYD allows backorders by default

## 🏗️ Architecture

```
yoyaku-api-connector/
├── yoyaku-api-connector.php              # Main plugin file
├── includes/
│   ├── class-auth.php                    # Bearer token authentication
│   ├── class-base-endpoint.php           # Abstract base class (DRY)
│   ├── class-product-stock-endpoint.php  # Stock data (v1)
│   ├── class-supply-products-endpoint.php # Supply dashboard (v1)
│   ├── class-stock-targeted-endpoint.php  # Targeted stock (v1)
│   └── class-product-creation-endpoint.php # Product creation (v2) ✨ NEW
└── README.md
```

## 📥 Installation

### Method 1: Git Clone (Recommended)
```bash
cd /path/to/wordpress/wp-content/plugins/
git clone https://github.com/benjaminbelaga/yoyaku-api-connector.git
```

### Method 2: SFTP Deploy
```bash
# On local machine
cd /Users/yoyaku/Git/wp-import-dashboard/yoyaku-api-connector

# Deploy to YOYAKU.IO
sshpass -p "PASSWORD" scp -r * yoyakudev@134.122.80.6:public_html/wp-content/plugins/yoyaku-api-connector/

# Deploy to YYD.FR
sshpass -p "PASSWORD" scp -r * yydistributiondev@134.122.80.6:public_html/wp-content/plugins/yoyaku-api-connector/
```

### Method 3: SSH Deploy
```bash
ssh yoyaku-cloudways
cd applications/jfnkmjmfer/public_html/wp-content/plugins/
git clone https://github.com/benjaminbelaga/yoyaku-api-connector.git
wp plugin activate yoyaku-api-connector --allow-root
```

## 🎯 Benefits

| Aspect | WooCommerce API | YOYAKU Custom API | Improvement |
|--------|----------------|-------------------|-------------|
| **Speed** | 1-3 seconds | < 150ms | **10-20x faster** |
| **Authentication** | Basic Auth (key+secret) | Bearer Token | Simpler |
| **Dual-Site** | Separate configs | Single endpoint | Easier |
| **Data Format** | Complex nested | Clean flat | Easier to use |
| **Batch Support** | Limited | Up to 50 | Better |
| **Images** | Manual upload | Direct URLs | Faster |
| **Reliability** | Hooks/filters | Direct SQL | More reliable |

## 🧪 Testing

### Test v1 Endpoint (Public)
```bash
curl https://yoyaku.io/wp-json/yoyaku/v1/product-stock-data/GRN003
```

### Test v2 Endpoint (Authenticated)
```bash
curl -X POST https://yoyaku.io/wp-json/yoyaku/v2/product/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "site": "yoyaku",
    "sku": "TEST001",
    "title": "Test Product",
    "price": 9.99
  }'
```

## 🔒 Security

**v1 Endpoints (Public READ-ONLY):**
- No authentication required
- Only GET operations
- Cannot modify data
- CORS enabled for Google Apps Script

**v2 Endpoints (Secured WRITE):**
- Bearer token required
- Constant-time comparison (prevents timing attacks)
- Token stored in wp-config.php (not in database)
- Failed attempts logged

## 📝 License

GPL-2.0+

## 👤 Author

**Benjamin Belaga**
- Email: ben@yoyaku.io
- Company: YOYAKU SARL
- Website: https://yoyaku.io

## 🎯 Version

**2.2.0** - Dual-site product creation with Bearer authentication

---

**Built with ❤️ for YOYAKU operations**
