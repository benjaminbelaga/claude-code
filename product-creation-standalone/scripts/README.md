# YOYAKU - New Product via API (Google Apps Script)

**Create WooCommerce products directly from Google Sheets via API**

Strictly compliant with WP All Import #852 configuration.

---

## ✨ Features

✅ **Smart Image Detection**
- Tries multiple formats: `webp`, `jpg`, `jpeg`, `png`
- Tries multiple variants: no suffix, `_1`, `_2`, ..., `_10`
- Skips missing images (no 404 errors)
- Example: For SKU `VINYL001`, tries:
  - `VINYL001_600.webp`
  - `VINYL001_600.jpg`
  - `VINYL001_1_600.webp`
  - `VINYL001_1_600.jpg`
  - ... up to `_10`

✅ **WP All Import #852 Compliance**
- Category: `Forthcoming` (auto-created if missing)
- Meta fields: 16 custom fields (UPS, QR code, coming soon, etc.)
- Dimensions: 30x30x0.2 cm (hardcoded)
- Stock: `outofstock` by default + `manage_stock: true`
- Tags: Auto-create if missing

✅ **Idempotent**
- Find-or-create by SKU
- Update existing products (no duplicates)

✅ **Validation**
- Required fields check
- Slug format validation
- Price validation
- Date format check

✅ **Optional Custom Taxonomies**
- `musicartist` (artist1-4)
- `musiclabel` (label)
- `musicstyle` (genre1-5)
- `distributormusic` (distributor)
- Via WordPress `/wp/v2` REST API

---

## 🚀 Installation

### 1. Open Google Sheets

Create or open your products sheet with these columns:

**Required:**
- `sku`
- `title`
- `slug`
- `distributor`
- `label`
- `priceyoyakuio`

**Optional:**
- `description`, `pricenet`, `weight`, `format`
- `release_date`, `feature`, `playlist_files`, `depotvente`
- `artist1-4`, `genre1-5`, `tag1-2`

### 2. Open Script Editor

1. In Google Sheets: **Extensions → Apps Script**
2. Delete default `Code.gs` content
3. Copy-paste entire `google-apps-script-new-product.js` content
4. **File → Save** (name it "YOYAKU WP Import")

### 3. Configure Script Properties

1. In Apps Script: **Project Settings → Script Properties**
2. Add these properties:

| Property | Value | Example |
|----------|-------|---------|
| `WC_BASE_URL` | WordPress base URL | `https://yoyaku.io/wp-json` |
| `WC_CONSUMER_KEY` | WooCommerce consumer key | `ck_...` |
| `WC_CONSUMER_SECRET` | WooCommerce consumer secret | `cs_...` |

**Optional (for custom taxonomies):**
| Property | Value | Notes |
|----------|-------|-------|
| `WP_APP_USER` | WordPress username | For `/wp/v2` access |
| `WP_APP_PASSWORD` | Application Password | Generate in WordPress |

**How to generate WooCommerce keys:**
```
WordPress Admin → WooCommerce → Settings → Advanced → REST API → Add Key
```

**How to generate Application Password:**
```
WordPress Admin → Users → Your Profile → Application Passwords → Add New
```

### 4. Authorize Script

1. **Run → onOpen** (first time)
2. Review permissions
3. Click **Allow**

### 5. Refresh Sheet

Close and reopen your Google Sheet. You should see:

**Menu: YOYAKU • WP IMPORT**

---

## 📖 Usage

### Create/Update Single Product

1. Select a data row (not header)
2. **Menu → YOYAKU • WP IMPORT → ✅ Create/Update selected product**
3. Wait for confirmation

**Result:**
- Product created/updated in WooCommerce
- Images automatically detected and added
- Category `Forthcoming` assigned
- All meta fields populated

### Validate Before Import

1. Select a data row
2. **Menu → YOYAKU • WP IMPORT → 🔍 Validate selected row**
3. See validation results

### Bulk Import

1. **Menu → YOYAKU • WP IMPORT → 📊 Bulk import (all rows)**
2. Confirm
3. Wait for completion

---

## 🎯 Example Data

### Minimum Required

```csv
sku,title,slug,distributor,label,priceyoyakuio
VINYL001,"Aphex Twin - Selected Ambient Works","aphex-twin-selected-ambient-works","DEEJAY","Warp Records","24.99"
```

### Full Data

```csv
sku,title,slug,description,distributor,label,priceyoyakuio,pricenet,weight,format,release_date,feature,playlist_files,depotvente,artist1,artist2,genre1,genre2,tag1,tag2
VINYL001,"Aphex Twin - Selected Ambient Works 85-92","aphex-twin-selected-ambient-works","Classic ambient techno album from Aphex Twin.","DEEJAY","Warp Records","24.99","15.50","180","LP, 12""","2025-01-15","Reissue, 180g Vinyl","track1.mp3,track2.mp3","no","Aphex Twin","","Ambient","Techno","New Release","Vinyl"
```

---

## 🖼️ Image Strategy

### Pattern Tested

For SKU `VINYL001`, the script tests:

```
https://yydistribution.ams3.digitaloceanspaces.com/yyplayer/images/
  ├─ VINYL001_600.webp
  ├─ VINYL001_600.jpg
  ├─ VINYL001_600.jpeg
  ├─ VINYL001_600.png
  ├─ VINYL001_1_600.webp
  ├─ VINYL001_1_600.jpg
  ├─ VINYL001_1_600.jpeg
  ├─ VINYL001_1_600.png
  ├─ VINYL001_2_600.webp
  ├─ ... (up to _10)
```

**Only existing images are added** (HTTP 200).

Missing images are **skipped silently**.

---

## 🔧 Customization

### Change Image Base URL

Edit line ~320:

```javascript
const base = 'https://YOUR-CDN-URL/path/to/images/';
```

### Change Default Category

Edit line ~211:

```javascript
const forthId = ensureCategoryIdByName_('Your Category Name');
```

### Add More Image Variants

Edit line ~327:

```javascript
const variants = ['', '_1', '_2', '_3', ..., '_20']; // Add more
```

### Disable Custom Taxonomies

Comment out lines ~277-287:

```javascript
// try {
//   assignCustomTaxonomies_(...);
// } catch (e) { ... }
```

---

## 🐛 Troubleshooting

### Error: "WooCommerce credentials missing"

**Fix:** Set `WC_CONSUMER_KEY` and `WC_CONSUMER_SECRET` in Script Properties.

### Error: "Validation failed: Missing required field"

**Fix:** Ensure all required columns are filled:
- `sku`, `title`, `slug`, `distributor`, `label`, `priceyoyakuio`

### Error: "Slug must be lowercase alphanumeric with hyphens only"

**Fix:** Slug format: `lowercase-with-hyphens-only`

Bad: `Product Name`, `Product_Name`, `Product123!`
Good: `product-name`, `product-name-123`

### Images not appearing

**Possible causes:**
1. Images don't exist on Digital Ocean Spaces
2. Wrong SKU format (check URL in logs)
3. CORS issue (check bucket permissions)

**Debug:**
1. Check Apps Script logs: **View → Logs**
2. Look for "✓ Found image:" entries
3. Test image URL manually in browser

### Custom taxonomies not assigned

**Possible causes:**
1. `WP_APP_USER` / `WP_APP_PASSWORD` not set
2. Taxonomies not registered with `show_in_rest: true`
3. WordPress Application Password not generated

**Solution:**
- Custom taxonomies are **optional**
- Product will be created anyway (without custom taxos)
- Add taxonomies manually in WordPress if needed

---

## 📊 Performance

**Speed:**
- Single product: ~2-5 seconds
- Bulk import: ~10-15 products/minute

**Bottleneck:**
- Image detection (HEAD requests)
- To speed up: Reduce variants tested

---

## 🔐 Security

**Credentials stored:**
- Script Properties (secure, not in code)
- Not visible in sheet
- Not shared when sharing sheet

**Permissions required:**
- Google Sheets access
- External requests (WooCommerce API)

---

## 📚 References

**WP All Import #852 Config:**
- See `/wp-all-import-settings/WP-IMPORT-852-COMPLETE-DOCUMENTATION.md`

**WooCommerce REST API:**
- https://woocommerce.github.io/woocommerce-rest-api-docs/

**WordPress REST API:**
- https://developer.wordpress.org/rest-api/

---

## ✅ Changelog

**v1.0.0 (2025-11-07)**
- Initial release
- Smart image detection (multi-format, multi-variant)
- WP All Import #852 compliance
- Idempotent by SKU
- Optional custom taxonomies

---

**Author:** Benjamin Belaga
**License:** Proprietary (YOYAKU Internal Use)
**Support:** ben@yoyaku.fr
