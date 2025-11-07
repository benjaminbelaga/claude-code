# Changelog

All notable changes to YOYAKU API Connector will be documented in this file.

## [2.2.0] - 2025-11-07

### Added
- ✅ **MAJOR FEATURE**: Product Creation endpoint (`/yoyaku/v2/product/create`)
- ✅ **Dual-Site Support**: YOYAKU.IO (B2C) and YYD.FR (B2B) in single endpoint
- ✅ **Bearer Token Authentication**: Secure write operations via wp-config.php token
- ✅ **Idempotent Operations**: Create-or-update by SKU (no duplicates)
- ✅ **Batch Creation**: Create multiple products in one request
- ✅ **Complete Data Support**:
  - Product basics (SKU, title, slug, price, weight, stock)
  - Categories and tags (auto-create if missing)
  - Images (download from URLs, set featured + gallery)
  - Custom taxonomies (artists, labels, genres, distributor, format)
  - Custom meta data (any key-value pairs)

### Site-Specific Features
- ✅ **YOYAKU.IO**:
  - Category: "Forthcoming" (hardcoded)
  - Taxonomies: `distributormusic`, `musicartist`, `musiclabel`, `musicstyle`
  - Meta: `_set_coming_soon: yes`
  - Backorders: No

- ✅ **YYD.FR**:
  - Category: Uses label name
  - Taxonomies: `ownermusic` (distributor), `musicformat`, `musicartist`, `musiclabel`, `musicstyle`
  - Meta: `_is_pre_order: yes`, `_low_stock_amount: 10`
  - Backorders: Yes (pre-order system)

### Technical Details
- New class: `YOYAKU_Product_Creation_Endpoint`
- Uses `YOYAKU_Auth` for Bearer token verification
- Direct WordPress functions (wp_insert_post, update_post_meta)
- Image handling with media_handle_sideload
- Taxonomy auto-creation with term_exists + wp_insert_term
- Cache clearing after creation (clean_post_cache, wp_cache_delete)
- Performance: ~100-150ms per product (10-20x faster than WooCommerce API)

### Security
- ✅ Bearer token authentication (constant-time comparison)
- ✅ Token stored in wp-config.php (YOYAKU_API_BEARER_TOKEN)
- ✅ Failed authentication logged
- ✅ Input sanitization (sanitize_text_field, sanitize_title, wp_kses_post)

### Integration
- Ready for Google Apps Script integration
- Replaces slow WooCommerce API calls
- Compatible with existing Google Sheets workflows
- Batch support for bulk imports

## [2.1.0] - 2025-10-27

### Added
- ✅ Stock Targeted endpoint with backorders gating
- ✅ 16-20x speedup for stock queries
- ✅ Authentication support via YOYAKU_Auth class

## [2.0.0] - 2025-10-23

### Changed
- ✅ Migrated from v1 to v2 endpoint architecture
- ✅ Added authentication layer
- ✅ Improved performance with mega-queries

## [1.4.2] - 2025-10-23

### Added
- ✅ Added `distributor_music` taxonomy to API response
- ✅ Returns first taxonomy term name from `distributormusic` taxonomy
- ✅ Enables Google Sheets to auto-fetch distributor information

### Technical Details
- Added `wp_get_object_terms()` call to fetch `distributormusic` taxonomy
- New response key: `distributor_music` (string - taxonomy term name)
- Example: `"distributor_music": "yydistribution"`

## [1.4.1] - 2025-10-23

### Fixed
- ✅ **CRITICAL FIX**: Changed `shelf_quantity` source from `_yyd_total_shelf` (EUR amount) to `_total_shelves` (quantity in units)
- ✅ Semantic correction: `_total_shelves` represents physical quantity on shelf, not monetary value
- ✅ Aligned with correct business logic: quantity fields for calculations, not EUR amounts

### Technical Details
- Updated `class-base-endpoint.php:34` - Changed from `_yyd_total_shelf` to `_total_shelves`
- Updated `class-product-stock-endpoint.php:141` - Changed shelf_quantity source field
- Database verification: `_total_shelves` exists with 503 rows on YOYAKU.IO

### Field Usage Clarification
- ✅ `_total_shelves` → Quantity in units (physical count) - **USED FOR CALCULATIONS**
- ✅ `_yyd_total_shelf` → EUR amount (monetary value) - **DIFFERENT PURPOSE**
- ✅ API response key `shelf_quantity` now returns correct quantity data

## [1.4.0] - 2025-10-23

### Changed
- ✅ **BREAKING CHANGE**: Standardized shelf field name from `_yyd_shelf_count` to `_yyd_total_shelf`
- ✅ Aligns with ecosystem-wide custom field naming convention across YSC, YIO, and theme documentation
- ✅ Semantic correction: `_yyd_total_shelf` accurately represents EUR total value (not a count)

### Migration Notes
- API response structure unchanged (still returns `shelf_quantity` key)
- Backend now reads from `_yyd_total_shelf` custom field
- Database migration recommended: rename `_yyd_shelf_count` → `_yyd_total_shelf` if data exists
- No changes required in Google Apps Script consumers (API contract maintained)

### Technical Details
- Updated `class-base-endpoint.php:34` - Changed meta key in default query array
- Updated `class-product-stock-endpoint.php:141` - Changed custom field reference
- Maintains backward compatibility at API response level

### Naming Consistency
- ✅ `_total_preorders` (total preorders count)
- ✅ `_yyd_total_shelf` (total shelf value EUR) - NOW CONSISTENT
- ✅ `_units_on_shelf` (physical units count)

## [1.3.0] - 2025-10-19

### Performance 🚀
- ✅ **MAJOR OPTIMIZATION**: Single mega-query architecture
- ✅ **89% query reduction**: 9 queries → 1 query per product
- ✅ New `get_complete_product_data_by_sku()` method in base class
- ✅ Single JOIN query retrieves: post data + all meta fields at once

### Technical Details
- **Before**: SKU lookup → basic data → stock (2 queries) → image → 4× custom fields = 9 queries
- **After**: Single optimized query with CASE statements and GROUP BY = 1 query
- **Impact**: 100 products = 900 queries → 100 queries (89% reduction)
- **Response time**: ~10-20ms per product (down from ~50-100ms)

### Benefits
- Faster API responses for Google Sheets integration
- Reduced database load on production servers
- Better scalability for batch operations
- Lower memory footprint

## [1.2.0] - 2025-10-19

### Added
- ✅ **Publication status tracking**: New `is_online` boolean field in API response
- ✅ **Post status field**: Returns WordPress `post_status` (publish, draft, pending, etc.)
- ✅ **Support for non-published products**: API now returns data for all products regardless of publication status

### Changed
- ✅ Removed automatic filtering of non-published products
- ✅ API consumers can now determine publication status client-side

### Use Cases
- Google Sheets can display "online" vs "not online" with conditional formatting
- Inventory management tools can track unpublished products
- Better visibility into product lifecycle status

## [1.1.0] - 2025-10-19 (SUPERSEDED BY v1.4.0)

### Changed
- ⚠️ **SUPERSEDED**: Migrated shelf quantity field from `yid_total_shelf` to `_yyd_shelf_count`
- ⚠️ **NOTE**: This version used incorrect field name. Please upgrade to v1.4.0 which uses `_yyd_total_shelf`
- ✅ Updated Product Stock Data endpoint to use new unified field name
- ✅ Aligns with YYD B2B inventory field standardization

### Migration Notes
- API response structure unchanged (still returns `shelf_quantity` key)
- Backend reads from `_yyd_shelf_count` custom field (incorrect - fixed in v1.4.0)
- No changes required in Google Apps Script consumers

## [1.0.0] - 2025-10-18

### Added
- ✅ Initial release
- ✅ Abstract base class `YOYAKU_Base_Endpoint` with reusable methods
- ✅ Product Stock Data endpoint for `wp-import-dashboard` integration
- ✅ Single product endpoint: `GET /yoyaku/v1/product-stock-data/{SKU}`
- ✅ Batch endpoint: `POST /yoyaku/v1/product-stock-data/batch`
- ✅ Direct database queries for maximum performance
- ✅ No authentication required (public read-only endpoints)
- ✅ CORS headers for Google Apps Script access
- ✅ Returns: images, stock, custom fields (_depot_vente, _initial_quantity, _yyd_total_shelf, _total_preorders)

### Technical Details
- **Performance**: < 100ms response time (vs 1-3s for WooCommerce API)
- **Reliability**: Bypasses all WordPress/WooCommerce hooks and filters
- **Batch Support**: Up to 50 SKUs in one request
- **Architecture**: DRY design with abstract base class

### Integration
- Replaces WooCommerce REST API in `wp-import-dashboard` Google Apps Script
- 20-30x faster than standard WooCommerce API
- Simpler authentication (none required)
- Cleaner data format

---

**Author**: Benjamin Belaga
**Company**: YOYAKU SARL
**Repository**: https://github.com/benjaminbelaga/yoyaku-api-connector
