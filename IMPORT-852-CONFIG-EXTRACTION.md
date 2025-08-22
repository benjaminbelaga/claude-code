# 🔍 Import 852 YOYAKU - Configuration Extraite Complète

**Date:** 2025-08-21  
**Status:** ✅ EXTRACTION RÉUSSIE  
**Source:** Production YOYAKU.IO (jfnkmjmfer)  

---

## 📋 DONNÉES BASIQUES

### Import Details
```yaml
ID: 852
Name: "regular new product 2025"
Type: "url" (Google Sheets CSV)
Path: "https://docs.google.com/spreadsheets/d/1L55TCdfJJxZOHyWqx13XKi58pNqNt3wrUm0C4MIs6X4/export?format=csv&gid=773659492"
Post Type: "product"
Records Per Request: 1
Processing: "ajax"
```

### Google Sheets Configuration
```
URL: https://docs.google.com/spreadsheets/d/1L55TCdfJJxZOHyWqx13XKi58pNqNt3wrUm0C4MIs6X4/edit#gid=773659492
Format: CSV Export
Encoding: UTF-8
Delimiter: ","
```

---

## 🎯 CONFIGURATION PRODUCT CORE

### Basic Product Settings
```php
// Product Type & Status
'custom_type' => 'product',
'status' => 'publish',
'single_product_type' => 'simple', // Par défaut simple

// Product Core Fields
'title' => '{title[1]}',                    // DIRECTEMENT depuis colonne title
'content' => '',                            // Pas de contenu
'post_excerpt' => '{description[1]}',       // Description depuis colonne
'post_slug' => '{slug[1]}',                 // Slug depuis colonne

// Unique Key Strategy
'unique_key' => '{sku[1]}-{distributor[1]}{release_date[1]}',
'duplicate_matching' => 'auto',
'duplicate_indicator' => 'custom field',
'custom_duplicate_name' => '_sku',
'custom_duplicate_value' => '{sku[1]}',
```

### Product Data (WooCommerce)
```php
// SKU & Pricing
'single_product_sku' => '{sku[1]}',
'single_product_regular_price' => '{priceyoyakuio[1]}',
'single_product_sale_price' => '',          // Pas de prix soldé

// Stock Management
'is_product_manage_stock' => 'yes',
'single_product_stock_qty' => '',           // VIDE = 0 par défaut
'product_stock_status' => 'outofstock',     // Par défaut rupture
'product_allow_backorders' => 'no',

// Product Status
'is_product_virtual' => 'no',
'is_product_downloadable' => 'no',
'is_product_enabled' => 'yes',
'is_product_featured' => 'no',
'is_product_visibility' => 'visible',

// Tax & Shipping
'multiple_product_tax_status' => 'taxable',
'multiple_product_tax_class' => '',         // Standard tax
'single_product_weight' => '{weight[1]}',
'single_product_length' => '30',            // 30cm hardcodé
'single_product_width' => '30',             // 30cm hardcodé  
'single_product_height' => '0.2',           // 2mm hardcodé
'multiple_product_shipping_class' => '-1',  // Pas de classe shipping
```

---

## 🎨 IMAGES CONFIGURATION

### Image URLs (DigitalOcean Spaces)
```php
// Featured Image + 9 Gallery Images (10 total)
'download_featured_image' => '
https://yydistribution.ams3.digitaloceanspaces.com/yyplayer/images/{sku[1]}_1_600.jpg
https://yydistribution.ams3.digitaloceanspaces.com/yyplayer/images/{sku[1]}_2_600.jpg
https://yydistribution.ams3.digitaloceanspaces.com/yyplayer/images/{sku[1]}_3_600.jpg
https://yydistribution.ams3.digitaloceanspaces.com/yyplayer/images/{sku[1]}_4_600.jpg
https://yydistribution.ams3.digitaloceanspaces.com/yyplayer/images/{sku[1]}_5_600.jpg
https://yydistribution.ams3.digitaloceanspaces.com/yyplayer/images/{sku[1]}_6_600.jpg
https://yydistribution.ams3.digitaloceanspaces.com/yyplayer/images/{sku[1]}_7_600.jpg
https://yydistribution.ams3.digitaloceanspaces.com/yyplayer/images/{sku[1]}_8_600.jpg
https://yydistribution.ams3.digitaloceanspaces.com/yyplayer/images/{sku[1]}_9_600.jpg
https://yydistribution.ams3.digitaloceanspaces.com/yyplayer/images/{sku[1]}_10_600.jpg',

// Fallback Images (Local)
'gallery_featured_image' => '
{sku[1]}.jpg
{sku[1]}_2.jpg
{sku[1]}.jpeg
{sku[1]}_2.jpeg
{sku[1]}.webp
{sku[1]}_2.webp
{sku[1]}.png
{sku[1]}_2.png',

// Image Settings
'download_images' => 'yes',
'search_existing_images' => '1',
'search_existing_images_logic' => 'by_url',
'is_featured' => '1',                        // Premier = featured
'auto_rename_images' => '0',
'images_name' => 'filename',
```

### Pattern Images Analysé
```javascript
// Pattern principal (10 images)
const imagePattern = {
  base_url: 'https://yydistribution.ams3.digitaloceanspaces.com/yyplayer/images/',
  pattern: '{sku}_[1-10]_600.jpg',
  featured: '{sku}_1_600.jpg',           // Premier = featured image
  gallery: '{sku}_[2-10]_600.jpg',       // 9 images gallery
  
  // Fallbacks locaux si DigitalOcean fail
  fallbacks: [
    '{sku}.jpg', '{sku}_2.jpg',
    '{sku}.jpeg', '{sku}_2.jpeg',  
    '{sku}.webp', '{sku}_2.webp',
    '{sku}.png', '{sku}_2.png'
  ]
};
```

---

## 🏷️ TAXONOMIES CONFIGURATION

### Taxonomies YOYAKU (4 taxonomies)
```php
// 1. PRODUCT CATEGORIES
'tax_single_xpath' => [
  'product_cat' => 'Forthcoming'             // HARDCODÉ - tous en Forthcoming
],

// 2. MUSIC ARTIST (Multiple values)
'tax_logic' => ['musicartist' => 'multiple'],
'tax_assing' => ['musicartist' => '1'],
'tax_multiple_xpath' => [
  'musicartist' => '{artist1[1]},{artist2[1]},{artist3[1]},{artist4[1]}'
],
'tax_multiple_delim' => ['musicartist' => ','],

// 3. MUSIC LABEL (Single value)
'tax_logic' => ['musiclabel' => 'single'],
'tax_assing' => ['musiclabel' => '1'],
'tax_single_xpath' => [
  'musiclabel' => '{label[1]}'
],

// 4. MUSIC STYLE (Multiple values)
'tax_logic' => ['musicstyle' => 'multiple'],
'tax_assing' => ['musicstyle' => '1'],
'tax_multiple_xpath' => [
  'musicstyle' => '{genre1[1]},{genre2[1]},{genre3[1]},{genre4[1]},{genre5[1]}'
],
'tax_multiple_delim' => ['musicstyle' => ','],

// 5. DISTRIBUTOR MUSIC (Single value)
'tax_logic' => ['distributormusic' => 'single'],
'tax_assing' => ['distributormusic' => '1'],
'tax_single_xpath' => [
  'distributormusic' => '{distributor[1]}'
],

// 6. PRODUCT TAGS (Multiple values)
'tax_logic' => ['product_tag' => 'multiple'],
'tax_assing' => ['product_tag' => '1'],
'tax_multiple_xpath' => [
  'product_tag' => '{tag1[1]},{tag2[1]}'
],
'tax_multiple_delim' => ['product_tag' => ','],
```

### Taxonomies Settings
```php
// Auto-création des termes
'term_assing' => [
  'product_cat' => '1',
  'musicartist' => '1',
  'musiclabel' => '1', 
  'musicstyle' => '1',
  'distributormusic' => '1',
  'product_tag' => '1'
],

// Logique update taxonomies
'is_update_categories' => '1',
'update_categories_logic' => 'full_update',
'do_not_create_terms' => '0',                // Créer termes si inexistants
```

---

## 🔧 CUSTOM FIELDS

### Custom Fields Mappings
```php
'custom_name' => [
  0 => '_wc_cog_cost',                        // Cost of Goods
  1 => '_coming_soon_label',                  // Coming Soon Label
  2 => '_music_formats',                      // Format musical
  3 => '_ph_ups_manufacture_country',         // Pays fabrication UPS
  4 => '_wf_ups_hst',                        // HS Code UPS
  5 => 'ph_ups_invoice_desc',                // Description facture UPS
  6 => '_product_features',                   // Caractéristiques produit
  7 => '_set_coming_soon',                   // Activer coming soon
  8 => '_yoyaku_playlist_files_raw',         // Playlist files bruts
  9 => '_depot_vente',                       // Dépôt vente
  10 => 'hscode_custom_field',               // HS Code custom
  11 => '_product_origin_country',           // Pays origine
  12 => '_wp_old_slug',                      // Ancien slug
  13 => '_product_qr_code'                   // QR Code produit
],

'custom_value' => [
  0 => '{pricenet[1]}',                      // Prix net depuis colonne
  1 => '{release_date[1]}',                  // Date release depuis colonne
  2 => '{format[1]}',                        // Format depuis colonne
  3 => 'FR',                                 // HARDCODÉ France
  4 => '85238010',                           // HARDCODÉ HS Code
  5 => 'Vinyl record or Phonograph record\'', // HARDCODÉ Description UPS
  6 => '{feature[1]}',                       // Features depuis colonne
  7 => 'yes',                                // HARDCODÉ Coming Soon activé
  8 => '{playlist_files[1]}',                // Playlist files depuis colonne
  9 => '{depotvente[1]}',                    // Dépôt vente depuis colonne
  10 => '85238010',                          // HARDCODÉ HS Code (doublon)
  11 => 'FR',                                // HARDCODÉ France (doublon)
  12 => '{sku[1]}',                          // SKU comme ancien slug
  13 => 'https://www.yoyaku.io/release/{_wp_old_slug[1]}' // QR Code URL générée
],
```

### Custom Fields Settings
```php
'is_update_custom_fields' => '1',
'update_custom_fields_logic' => 'full_update',
'custom_fields_list' => '0',                // Pas de filtre
'custom_fields_only_list' => '',
'custom_fields_except_list' => '',
```

---

## 📊 GOOGLE SHEETS STRUCTURE ANALYSÉE

### Colonnes Identifiées
```php
// Colonnes utilisées dans les mappings
$columns_mapping = [
  // CORE PRODUCT
  'sku' => 'SKU unique identifier',
  'title' => 'Titre produit complet',
  'description' => 'Description produit',
  'slug' => 'Slug URL',
  
  // PRICING
  'priceyoyakuio' => 'Prix YOYAKU.IO',
  'pricenet' => 'Prix net (cost)',
  
  // MUSIC METADATA
  'artist1' => 'Artiste principal',
  'artist2' => 'Artiste 2',
  'artist3' => 'Artiste 3', 
  'artist4' => 'Artiste 4',
  'label' => 'Label musical',
  'genre1' => 'Genre principal',
  'genre2' => 'Genre 2',
  'genre3' => 'Genre 3',
  'genre4' => 'Genre 4',
  'genre5' => 'Genre 5',
  'distributor' => 'Distributeur',
  
  // METADATA
  'release_date' => 'Date de sortie',
  'format' => 'Format (Vinyl, CD, etc.)',
  'weight' => 'Poids produit',
  'feature' => 'Caractéristiques',
  'playlist_files' => 'Fichiers playlist',
  'depotvente' => 'Dépôt vente info',
  
  // TAGS
  'tag1' => 'Tag 1',
  'tag2' => 'Tag 2'
];
```

### Structure Probable Google Sheets
```
A: sku
B: title  
C: description
D: slug
E: priceyoyakuio
F: pricenet
G: artist1
H: artist2
I: artist3
J: artist4
K: label
L: genre1
M: genre2
N: genre3
O: genre4
P: genre5
Q: distributor
R: release_date
S: format
T: weight
U: feature
V: playlist_files
W: depotvente
X: tag1
Y: tag2
```

---

## ⚙️ UPDATE SETTINGS

### Update Logic
```php
// What gets updated
'is_update_status' => '1',                  // Status
'is_update_content' => '1',                 // Contenu
'is_update_title' => '1',                   // Titre
'is_update_slug' => '1',                    // Slug
'is_update_excerpt' => '1',                 // Extrait
'is_update_categories' => '1',              // Catégories
'is_update_images' => '1',                  // Images
'is_update_custom_fields' => '1',           // Custom fields
'is_update_attachments' => '1',             // Attachments

// Update strategies
'update_images_logic' => 'full_update',
'update_categories_logic' => 'full_update',
'update_custom_fields_logic' => 'full_update',
'update_all_data' => 'yes',

// What NOT to update during processing
'create_new_records' => '1',                // Créer nouveaux
'is_delete_missing' => '0',                 // Ne pas supprimer manquants
'is_keep_former_posts' => 'yes',            // Garder anciens posts
'do_not_remove_images' => '1',              // Ne pas supprimer images
```

### Processing Settings
```php
'records_per_request' => '1',               // 1 produit par batch
'import_processing' => 'ajax',              // AJAX processing
'chuncking' => '1',                         // Chunking activé
'is_fast_mode' => '0',                      // Fast mode OFF
'processing_iteration_logic' => 'auto',     // Auto iteration
```

---

## 🔍 ANALYSE CRITIQUE

### ✅ Points Forts Identifiés
1. **Images robustes**: 10 URLs DigitalOcean + 8 fallbacks locaux
2. **Taxonomies complètes**: 4 taxonomies YOYAKU bien mappées
3. **Unique key solide**: SKU + distributor + release_date
4. **Custom fields riches**: 14 champs métier
5. **Update logic complète**: Full update sur tout

### ⚠️ Complexités Détectées
1. **Images multiples**: 10 URLs pattern `{sku}_[1-10]_600.jpg`
2. **Taxonomies multi-valeurs**: artists (4) + genres (5) 
3. **Hardcoded values**: HS Code, country, descriptions UPS
4. **Mixed data sources**: DigitalOcean + fallbacks locaux
5. **Complex unique key**: Triple concatenation

### 🚨 Points d'Attention
1. **Stock par défaut**: `outofstock` - tous nouveaux produits en rupture
2. **Prix requis**: `priceyoyakuio` obligatoire
3. **Category hardcodée**: Tous en "Forthcoming"
4. **Dimensions hardcodées**: 30x30x0.2cm pour tous
5. **UPS data hardcodée**: HS Code + Description fixes

---

## 🎯 PROCHAINES ÉTAPES

### Phase 1B: Validation Données Réelles
1. ✅ **Accès Google Sheets** - URL identifiée
2. ⏳ **Export échantillon** - 10-20 lignes de test
3. ⏳ **Validation colonnes** - Correspondance mapping
4. ⏳ **Test images** - URLs DigitalOcean accessibles
5. ⏳ **Analyse formules** - Vérifier calculs complexes

### Phase 1C: Spécifications API
1. ⏳ **Mapping API WooCommerce** - Correspondance exacte
2. ⏳ **Business rules** - Logique unique key, taxonomies
3. ⏳ **Image processing** - Stratégie fallbacks
4. ⏳ **Error handling** - Gestion échecs par étape
5. ⏳ **Testing strategy** - Plan validation complète

---

**✅ SUCCÈS:** Configuration Import 852 entièrement extraite et analysée. Prêt pour Phase 1B - Validation données réelles.