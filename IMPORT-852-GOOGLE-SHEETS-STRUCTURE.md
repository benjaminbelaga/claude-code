# 📊 Import 852 YOYAKU - Structure Google Sheets Analysée

**Date:** 2025-08-21  
**Source:** https://docs.google.com/spreadsheets/d/1L55TCdfJJxZOHyWqx13XKi58pNqNt3wrUm0C4MIs6X4/edit#gid=773659492  
**Status:** ✅ STRUCTURE DOCUMENTÉE  
**Lignes total:** 22 (headers + 21 produits)

---

## 📋 MAPPING COLONNES COMPLET

### Colonnes 1-10: Core Product Data
```
1. Distributor           → {distributor[1]}        → distributormusic taxonomy
2. sku                  → {sku[1]}                → _sku + unique_key  
3. Price Gross          → NON UTILISÉ             → (prix brut)
4. release_date         → {release_date[1]}       → _coming_soon_label custom field
5. quantity             → NON UTILISÉ             → (stock quantity)
6. title                → {title[1]}              → post_title
7. label                → {label[1]}              → musiclabel taxonomy
8. artist1              → {artist1[1]}            → musicartist taxonomy (multi)
9. artist2              → {artist2[1]}            → musicartist taxonomy (multi)
10. artist3             → {artist3[1]}            → musicartist taxonomy (multi)
```

### Colonnes 11-20: Music Metadata
```
11. artist4             → {artist4[1]}            → musicartist taxonomy (multi)
12. genre1              → {genre1[1]}             → musicstyle taxonomy (multi)
13. genre2              → {genre2[1]}             → musicstyle taxonomy (multi)
14. genre3              → {genre3[1]}             → musicstyle taxonomy (multi)  
15. genre4              → {genre4[1]}             → musicstyle taxonomy (multi)
16. feature             → {feature[1]}            → _product_features custom field
17. format              → {format[1]}             → _music_formats custom field
18. description         → {description[1]}        → post_excerpt
19. tracklist           → NON UTILISÉ             → (dans description)
20. depot vente         → {depotvente[1]}         → _depot_vente custom field
```

### Colonnes 21-30: Pricing & Media
```
21. weight              → {weight[1]}             → product weight
22. price net           → {pricenet[1]}           → _wc_cog_cost custom field  
23. price yydistribution → NON UTILISÉ            → (prix YYD)
24. "price yoyaku,io"   → {priceyoyakuio[1]}     → regular_price (PRINCIPAL)
25. quantity            → NON UTILISÉ             → (doublon colonne 5)
26. "on yoyaku,io vlook"→ NON UTILISÉ             → (lookup YOYAKU)
27. playlist_files      → {playlist_files[1]}    → _yoyaku_playlist_files_raw
28. Number of tracks    → NON UTILISÉ             → (nombre pistes)
29. track1              → NON UTILISÉ             → (piste individuelle)
30. track2              → NON UTILISÉ             → (piste individuelle)
```

### Colonnes 31-50: Tracks (Non utilisées)
```
31-54. track3 → track24  → NON UTILISÉES          → (pistes individuelles)
```

### Colonnes 55-64: SEO & Media
```
55. slug                → {slug[1]}               → post_name
56. _wp_old_slug        → {sku[1]}                → _wp_old_slug custom field
57. IMAGE Serveur       → NON UTILISÉ             → (status images)
58. MP3 Serveur         → NON UTILISÉ             → (status MP3)
59. PACK MEDIA Serveur  → NON UTILISÉ             → (status pack média)
60. "on yoyaku,io"      → NON UTILISÉ             → (status YOYAKU)
61. tag 1               → {tag1[1]}               → product_tag taxonomy
62. tag 2               → {tag2[1]}               → product_tag taxonomy
63. Email Label         → NON UTILISÉ             → (email contact label)
```

---

## 🔍 ANALYSE DISCREPANCIES

### ❌ **ERREUR CRITIQUE:** Colonnes WP Import vs Google Sheets
```php
// WP IMPORT CONFIG ATTENDAIT:
'{imageurl1[1]}'    // N'EXISTE PAS dans le sheet
'{imageurl2[1]}'    // N'EXISTE PAS dans le sheet
'{imageurl3[1]}'    // N'EXISTE PAS dans le sheet
'{imageurl4[1]}'    // N'EXISTE PAS dans le sheet
'{imageurl5[1]}'    // N'EXISTE PAS dans le sheet

// MAIS LE SHEET CONTIENT:
'IMAGE Serveur'     // Status des images, pas URLs
'MP3 Serveur'       // Status MP3, pas URLs
'PACK MEDIA Serveur'// Status pack, pas URLs

// IMAGES URLS SONT EN FAIT CALCULÉES:
// Pattern: https://yydistribution.ams3.digitaloceanspaces.com/yyplayer/images/{sku}_[1-10]_600.jpg
```

### 🔧 **CORRECTION MAPPING:**
```php
// Les URLs images ne viennent PAS du sheet
// Elles sont générées automatiquement par pattern:

$imageUrls = [];
for ($i = 1; $i <= 10; $i++) {
    $imageUrls[] = "https://yydistribution.ams3.digitaloceanspaces.com/yyplayer/images/{$sku}_{$i}_600.jpg";
}

// + Fallbacks locaux pattern:
$fallbackUrls = [
    "{$sku}.jpg", "{$sku}_2.jpg",
    "{$sku}.jpeg", "{$sku}_2.jpeg",
    "{$sku}.webp", "{$sku}_2.webp", 
    "{$sku}.png", "{$sku}_2.png"
];
```

---

## 📝 ÉCHANTILLON DONNÉES RÉELLES

### Produit 1: DJ Bone - Riding The Thin Line
```csv
Distributor: clone
sku: M036
Price Gross: 8,79
release_date: 2025-09-18
quantity: (vide)
title: Riding The Thin Line
label: Metroplex
artist1: DJ Bone
artist2-4: (vides)
genre1: Detroit techno
genre2: Electronic
genre3-4: (vides)
feature: world exclusive
format: 12inch
description: "Riding the Thin Line is an EP by DJ Bone..."
weight: 0,20
price net: 8,79
price yydistribution: 10,99
price yoyaku,io: 16,4
playlist_files: "1 Shut The Lites Off||https://...##2 The Funk||..."
slug: dj-bone-riding-the-thin-line-m036
_wp_old_slug: m036
IMAGE Serveur: "Working (jpg, _1_600)"
tag 1-2: (vides)
```

### Produit 2: CEM3340 & 2030 - Machines Awake EP
```csv
Distributor: clone
sku: M052
title: Machines Awake EP
label: Metroplex
artist1: CEM3340
artist2: 2030
genre1: Electro
price yoyaku,io: 16,4
release_date: 2025-10-22
feature: world exclusive
format: 12inch
playlist_files: "1 Machines Awake||...##2 Circuit Take Control||..."
```

---

## 🎯 BUSINESS RULES IDENTIFIÉES

### 1. **Unique Key Strategy**
```php
// WP Import unique key: "{sku[1]}-{distributor[1]}{release_date[1]}"
// Exemples:
"M036-clone2025-09-18"
"M052-clone2025-10-22"
```

### 2. **Taxonomies Multi-valeurs**
```php
// Artists: Jusqu'à 4 artistes par release
'musicartist' => 'DJ Bone'                    // Seul artist1 pour M036
'musicartist' => 'CEM3340,2030'               // artist1 + artist2 pour M052

// Genres: Jusqu'à 4 genres par release  
'musicstyle' => 'Detroit techno,Electronic'   // genre1 + genre2 pour M036
'musicstyle' => 'Electro'                     // Seul genre1 pour M052
```

### 3. **Pricing Logic**
```php
// Prix YOYAKU.IO = prix de vente final
'regular_price' => '16,4'  // Même prix pour les 2 produits

// Prix coût/net = prix d'achat
'_wc_cog_cost' => '8,79'   // Cost of goods

// Prix YYD = prix B2B (pas utilisé import 852)
'price yydistribution' => '10,99'
```

### 4. **Stock Management**
```php
// Par défaut tous nouveaux produits:
'manage_stock' => true,
'stock_quantity' => 0,           // Toujours 0 pour nouveaux
'stock_status' => 'outofstock',  // Toujours rupture au début
'allow_backorders' => 'no'
```

### 5. **Category Assignment**
```php
// TOUS les nouveaux produits:
'product_cat' => 'Forthcoming'  // Hardcodé dans WP Import
```

### 6. **Playlist Files Pattern**
```php
// Format: "Titre||URL MP3##Titre2||URL2##..."
$playlistPattern = '/^(.+?)\|\|(.+?)(?:##|$)/';

// Exemple M036:
"1 Shut The Lites Off||https://yydistribution.ams3.digitaloceanspaces.com/yyplayer/mp3/M036_1.mp3##2 The Funk||https://yydistribution.ams3.digitaloceanspaces.com/yyplayer/mp3/M036_2.mp3##3 The Haunting||https://yydistribution.ams3.digitaloceanspaces.com/yyplayer/mp3/M036_3.mp3"
```

---

## ⚙️ HARDCODED VALUES ANALYSIS

### 1. **UPS Shipping Data**
```php
// TOUS les produits Import 852:
'_ph_ups_manufacture_country' => 'FR',                           // France
'_wf_ups_hst' => '85238010',                                    // HS Code Vinyl
'ph_ups_invoice_desc' => 'Vinyl record or Phonograph record',   // Description
'_product_origin_country' => 'FR',                              // Origine France
'hscode_custom_field' => '85238010',                            // HS Code doublon
```

### 2. **Product Dimensions**
```php
// TOUS les produits (12" vinyl standard):
'length' => '30',        // 30cm
'width' => '30',         // 30cm  
'height' => '0.2',       // 2mm épaisseur vinyl
// weight vient du sheet: {weight[1]} (exemple: 0,20 = 200g)
```

### 3. **Coming Soon Settings**
```php
// TOUS les nouveaux produits:
'_set_coming_soon' => 'yes',                    // Coming soon activé
'_coming_soon_label' => '{release_date[1]}',    // Label = date release
```

### 4. **QR Code Generation**
```php  
// Auto-généré pour tous:
'_product_qr_code' => 'https://www.yoyaku.io/release/{_wp_old_slug[1]}'
// Exemple: 'https://www.yoyaku.io/release/m036'
```

---

## 🚨 PROBLÈMES DÉTECTÉS

### 1. **Virgules décimales vs Points**
```php
// Google Sheets utilise virgules européennes:
"8,79", "16,4", "0,20"

// WooCommerce attend points anglais:
8.79, 16.4, 0.20

// CONVERSION REQUISE dans API
```

### 2. **Headers multi-lignes**
```
"price yoyaku
io"  // Header sur 2 lignes

// Doit être converti en: "price yoyaku,io"
```

### 3. **Colonnes quantity dupliquées**
```
Colonne 5: quantity    (vide)
Colonne 25: quantity   (vide)

// Probablement erreur dans le sheet, ignorer
```

### 4. **Images pattern vs réalité**
```php
// WP Import config dit:
'download_featured_image' => 'https://yydistribution.ams3.digitaloceanspaces.com/yyplayer/images/{sku[1]}_1_600.jpg...'

// Mais sheet montre:
'IMAGE Serveur' => "Working (jpg, _1_600)"  // Juste status

// LES URLS SONT CALCULÉES, PAS DANS LE SHEET
```

---

## ✅ API SPECIFICATIONS DÉDUITES

### Input Schema Google Sheets → API
```yaml
required_fields:
  - sku: string (unique, colonne 2)
  - title: string (colonne 6)
  - label: string (colonne 7) 
  - price_yoyaku: number (colonne 24, conversion virgule→point)
  
optional_fields:
  - distributor: string (colonne 1) → distributormusic taxonomy
  - release_date: date (colonne 4) → _coming_soon_label
  - artist1-4: string (colonnes 8-11) → musicartist taxonomy
  - genre1-4: string (colonnes 12-15) → musicstyle taxonomy
  - feature: string (colonne 16) → _product_features
  - format: string (colonne 17) → _music_formats
  - description: text (colonne 18) → post_excerpt
  - weight: number (colonne 21, conversion virgule→point)
  - price_net: number (colonne 22) → _wc_cog_cost
  - playlist_files: text (colonne 27) → _yoyaku_playlist_files_raw
  - slug: string (colonne 55) → post_name
  - tag1-2: string (colonnes 61-62) → product_tag taxonomy

calculated_fields:
  - images: array[10] → pattern {sku}_[1-10]_600.jpg
  - _wp_old_slug: string → {sku} lowercased
  - _product_qr_code: url → https://www.yoyaku.io/release/{sku}
```

### Output WooCommerce Product
```php
[
  'name' => $row['title'],
  'slug' => $row['slug'],
  'type' => 'simple',
  'status' => 'publish',
  'catalog_visibility' => 'visible',
  'description' => $row['description'],
  'sku' => $row['sku'],
  'regular_price' => convertPrice($row['price yoyaku,io']),
  'manage_stock' => true,
  'stock_quantity' => 0,
  'stock_status' => 'outofstock',
  'weight' => convertPrice($row['weight']),
  'dimensions' => ['length' => '30', 'width' => '30', 'height' => '0.2'],
  'categories' => [['name' => 'Forthcoming']],
  'tags' => buildTags($row['tag 1'], $row['tag 2']),
  'images' => buildImageUrls($row['sku']),
  'meta_data' => buildCustomFields($row)
]
```

---

**🎯 PRÊT POUR PHASE 1C:** Structure Google Sheets complètement analysée, business rules identifiées, problèmes détectés, spécifications API déduites.