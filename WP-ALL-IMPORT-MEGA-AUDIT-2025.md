# WP ALL IMPORT MEGA AUDIT - COMPLETE DOCUMENTATION
**Date:** 2025-08-19
**Purpose:** Complete audit of all WP All Import configurations for migration to direct API imports

## GOOGLE SHEET SOURCE
**URL:** `https://docs.google.com/spreadsheets/d/1L55TCdfJJxZOHyWqx13XKi58pNqNt3wrUm0C4MIs6X4/export?format=csv`
- Same sheet for BOTH sites
- Different columns used per site
- CSV export format

---

# YOYAKU.IO IMPORTS (6 Total)

## Import 852: Regular New Product Import 2025
**Type:** Product Creation
**Action:** Create new products only
**Identifier:** `{sku[1]}-{distributor[1]}{release_date[1]}`
**Matching:** Custom field `_sku` = `{sku[1]}`

### Core Product Fields
- **Title:** `{title[1]}`
- **SKU:** `{sku[1]}`
- **Description:** `{description[1]}`
- **Regular Price:** `{priceyoyakuio[1]}`
- **Sale Price:** (empty)
- **Stock Quantity:** (empty - defaults to out of stock)
- **Stock Status:** `outofstock`
- **Weight:** `{weight[1]}`
- **Dimensions:** Length: 30, Width: 30, Height: 0.2
- **Product Type:** Simple
- **Virtual:** No
- **Downloadable:** No
- **Tax Status:** Taxable
- **Tax Class:** (empty)
- **Manage Stock:** Yes
- **Allow Backorders:** Yes
- **Sold Individually:** No

### Custom Fields Mapping
```
_wc_cog_cost                => {pricenet[1]}
_coming_soon_label           => {release_date[1]}
_music_formats               => {format[1]}
_ph_ups_manufacture_country  => FR
_wf_ups_hst                  => 85238010
ph_ups_invoice_desc          => Vinyl record or Phonograph record
_product_features            => {feature[1]}
_set_coming_soon             => yes
_yoyaku_playlist_files_raw   => {playlist_files[1]}
_depot_vente                 => {depotvente[1]}
hscode_custom_field          => 85238010
_product_origin_country      => FR
_wp_old_slug                 => {sku[1]}
_product_qr_code             => https://www.yoyaku.io/release/{_wp_old_slug[1]}
```

### Taxonomy Mappings
**Single Term Taxonomies:**
- `product_cat`: "Forthcoming" (hardcoded)
- `musiclabel`: `{label[1]}`
- `distributormusic`: `{distributor[1]}`

**Multiple Term Taxonomies (comma-separated):**
- `product_tag`: `{tag1[1]},{tag2[1]}`
- `musicartist`: `{artist1[1]},{artist2[1]},{artist3[1]},{artist4[1]}`
- `musicstyle`: `{genre1[1]},{genre2[1]},{genre3[1]},{genre4[1]},{genre5[1]}`

### Images
**Featured Images:** Downloads from DigitalOcean Spaces
```
https://yydistribution.ams3.digitaloceanspaces.com/yyplayer/images/{sku[1]}_1_600.jpg
https://yydistribution.ams3.digitaloceanspaces.com/yyplayer/images/{sku[1]}_2_600.jpg
... up to {sku[1]}_10_600.jpg
```

**Gallery Images:** Search existing media library
```
{sku[1]}.jpg
{sku[1]}_2.jpg
{sku[1]}.jpeg
{sku[1]}_2.jpeg
{sku[1]}.webp
{sku[1]}_2.webp
{sku[1]}.png
{sku[1]}_2.png
```

### Update Settings
- Update Title: Yes
- Update Content: Yes
- Update Excerpt: Yes
- Update Images: Yes
- Update Categories: Yes
- Update Custom Fields: Yes
- Update Stock: No

---

## Import 717: Pre-order Product Import 2025
**Type:** Product Creation with Pre-order
**Action:** Create new products with pre-order enabled
**Identifier:** `{sku[1]}-{distributor[1]}{release_date[1]}`
**Matching:** Custom field `_sku` = `{sku[1]}`

### Differences from Import 852
- **Stock Quantity:** `{quantity[1]}` (has initial stock)
- **Additional Custom Fields:**
  - `_is_pre_order`: `yes`
  - `_pre_order_date`: `{release_date[1]}`

All other settings identical to Import 852

---

## Import 803: Stock Update Only 2025
**Type:** Update Existing Products
**Action:** Update stock quantity only
**Identifier:** `- {sku[1]}` (with dash prefix)
**Matching:** SKU field

### Fields Updated
- **Stock Quantity:** `{quantity[1]}`
- **Stock Status:** `auto` (automatically set based on quantity)
- **Manage Stock:** Yes

### Update Settings
- Create New Records: No
- Update Title: No
- Update SKU: No
- Update Images: No
- Update Custom Fields: Yes (stock related only)
- Is Keep Former Posts: No

---

## Import 775: Picking Update 2025
**Type:** Update Existing Products
**Action:** Update picking/location data
**Identifier:** (appears to use SKU)
**Details:** Limited information available - needs further investigation

### Update Settings
- Create New Records: No
- Stock Status: auto

---

## Import 526: Export Import
**Note:** Not found in database query - may be disabled or deleted
**Action:** Unknown - needs investigation

---

## Import 810: Delete Products Batch
**Type:** Product Deletion
**Action:** Delete products via Google Sheets list
**Identifier:** SKU based

### Settings
- Create New Records: No
- Is Delete Missing: Likely yes (for deletion)
- Stock Status: auto

---

# YYDISTRIBUTION.FR IMPORTS (3 Total)

## Import 935: New Product Import (Pre-Order 2023)
**Type:** Product Creation
**Action:** Create new products with pre-order
**Identifier:** `{title[1]} - {sku[1]}`
**Matching:** Title + SKU combination

### Core Product Fields
- **Title:** `{title[1]}`
- **SKU:** `{sku[1]}`
- **Regular Price:** `{priceyydistribution[1]}`
- **Stock Quantity:** 0 (starts at zero)
- **Product Type:** Simple

### Custom Fields Mapping
```
_low_stock_amount            => 10
_product_features            => {feature[1]}
_is_pre_order                => yes
_yyd_playlist_files_raw      => {playlist_files[1]}
_pre_order_date              => {release_date[1]}
_pre_order_stock_status      => global
_date_out                    => {release_date[1]}
hscode_custom_field          => 85238010
_product_origin_country      => FR
ph_ups_invoice_desc          => Vinyl record or Phonograph record
```

### Taxonomy Mappings (YYD Different!)
**Single Term Taxonomies:**
- `product_cat`: `{label[1]}` (Note: Uses label as category!)
- `musicformat`: `{format[1]}`
- `ownermusic`: `{distributor[1]}`

**Multiple Term Taxonomies:**
- `product_tag`: `{tag1[1]},{tag2[1]}`
- `musicartist`: `{artist1[1]},{artist2[1]},{artist3[1]},{artist4[1]}`
- `musicstyle`: `{genre1[1]},{genre2[1]},{genre3[1]},{genre4[1]},{genre5[1]}`

**Note:** YYD uses different taxonomies:
- `musicformat` instead of product attributes
- `ownermusic` instead of `distributormusic`
- `weekmusic`, `musiccountry`, `musicdealtype` available but not mapped

---

## Import 953: Stock Update
**Type:** Update Existing Products
**Action:** Update stock quantity only
**Identifier:** `{sku[1]}`
**Matching:** SKU field

### Fields Updated
- **Stock Quantity:** `{quantity[1]}`

### Settings
- Create New Records: No
- Update only stock related fields

---

## Import 941: Release Date Update Dashboard
**Type:** Update Existing Products
**Action:** Update release dates
**Identifier:** SKU based (needs confirmation)

### Fields Updated
- Release date related custom fields
- Pre-order dates

### Settings
- Create New Records: No

---

# CRITICAL DIFFERENCES BETWEEN SITES

## 1. Taxonomy Differences
**YOYAKU.IO:**
- Uses `musiclabel` taxonomy
- Uses `distributormusic` taxonomy
- `product_cat` is hardcoded to "Forthcoming"

**YYDistribution.fr:**
- Uses `musicformat` taxonomy
- Uses `ownermusic` taxonomy (instead of distributormusic)
- `product_cat` uses the label value dynamically

## 2. Price Column Differences
- YOYAKU.IO: `{priceyoyakuio[1]}`
- YYDistribution: `{priceyydistribution[1]}`

## 3. Custom Fields Differences
**YOYAKU.IO Specific:**
- `_yoyaku_playlist_files_raw`
- `_depot_vente`
- `_wp_old_slug`
- `_product_qr_code`

**YYDistribution Specific:**
- `_yyd_playlist_files_raw`
- `_low_stock_amount`
- `_pre_order_stock_status`
- `_date_out`

## 4. Initial Stock
- YOYAKU.IO: Varies (empty for regular, quantity for preorder)
- YYDistribution: Always starts at 0

---

# GOOGLE SHEETS COLUMNS MAPPING

Based on the import configurations, the Google Sheet must have these columns:

## Essential Columns (Both Sites)
1. `sku` - Product SKU
2. `title` - Product title
3. `description` - Product description
4. `release_date` - Release/pre-order date
5. `priceyoyakuio` - Price for YOYAKU.IO
6. `priceyydistribution` - Price for YYDistribution
7. `pricenet` - Net cost price
8. `quantity` - Stock quantity
9. `weight` - Product weight
10. `format` - Music format (Vinyl, CD, etc.)
11. `label` - Music label
12. `distributor` - Distributor name
13. `feature` - Product features
14. `playlist_files` - Playlist/audio files
15. `depotvente` - Depot vente status

## Artist Columns
16. `artist1` - Primary artist
17. `artist2` - Secondary artist
18. `artist3` - Third artist
19. `artist4` - Fourth artist

## Genre/Style Columns
20. `genre1` - Primary genre
21. `genre2` - Secondary genre
22. `genre3` - Third genre
23. `genre4` - Fourth genre
24. `genre5` - Fifth genre

## Tag Columns
25. `tag1` - Primary tag
26. `tag2` - Secondary tag

## Additional Columns (if used)
27. `slug` - URL slug (optional)

---

# PROCESSING OPTIONS

## Import Settings
- Records per request: 1 (very conservative)
- Processing: AJAX
- Chuncking: Enabled
- Import processing: ajax
- Processing iteration logic: auto

## Schedule Settings
- Scheduling enabled: Yes (some imports)
- Timezone: Europe/Paris
- Run frequency: Varies per import

---

# MIGRATION RECOMMENDATIONS

## 1. API Architecture
Create separate endpoints for:
- `/api/products/create` - New products (852, 717, 935)
- `/api/products/update-stock` - Stock updates (803, 953)
- `/api/products/update-release` - Release date updates (941)
- `/api/products/update-picking` - Picking updates (775)
- `/api/products/delete` - Batch deletion (810)

## 2. Site Detection
Implement site detection logic:
```php
if (site_url() contains 'yoyaku.io') {
    use YOYAKU configuration
} else if (site_url() contains 'yydistribution.fr') {
    use YYD configuration
}
```

## 3. Taxonomy Handling
Create mapping arrays:
```php
$taxonomy_map = [
    'yoyaku.io' => [
        'label_taxonomy' => 'musiclabel',
        'distributor_taxonomy' => 'distributormusic',
        'format_field' => '_music_formats'
    ],
    'yydistribution.fr' => [
        'label_taxonomy' => 'product_cat',
        'distributor_taxonomy' => 'ownermusic',
        'format_taxonomy' => 'musicformat'
    ]
];
```

## 4. Validation Rules
Implement validation:
- SKU: Required, unique per site
- Title: Required
- Price: Required, numeric, > 0
- Release Date: Valid date format
- Stock: Integer >= 0

## 5. Error Handling
- Log all import attempts
- Track failed rows with reasons
- Implement retry mechanism
- Email notifications for failures

## 6. Performance Optimization
- Batch processing (10-20 products per batch)
- Use direct database queries for lookups
- Cache taxonomy terms
- Pre-download images to media library

## 7. Testing Strategy
1. Create test Google Sheet with sample data
2. Test each import type separately
3. Verify taxonomy assignments
4. Check custom field mappings
5. Validate image imports
6. Test update vs create logic

---

# NEXT STEPS

1. **Verify Import 526** - Check if Export Import exists
2. **Detail Import 775** - Get full picking update configuration
3. **Create API endpoints** - Build REST API structure
4. **Build import classes** - One per import type
5. **Create admin interface** - Replace WP All Import UI
6. **Implement logging** - Track all operations
7. **Set up monitoring** - Alert on failures
8. **Create documentation** - For future maintenance

---

**End of Audit Document**
Generated: 2025-08-19
By: Benjamin (CTO YOYAKU)