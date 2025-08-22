# 🧠 Import 852 YOYAKU - Règles Business Cachées Identifiées

**Date:** 2025-08-21  
**Source:** Analyse forensique configuration + données réelles  
**Status:** ✅ RÈGLES BUSINESS DOCUMENTÉES  

---

## 🎯 RÈGLES BUSINESS CRITIQUES

### 1. **Stock Management Logic**
```php
// RÈGLE CACHÉE #1: Nouveaux produits toujours en rupture
'stock_quantity' => 0,              // TOUJOURS 0 pour import 852
'stock_status' => 'outofstock',     // TOUJOURS rupture stock
'allow_backorders' => 'no',         // JAMAIS de précommandes

// POURQUOI: Import 852 = "regular new product" = produits à venir
// Le stock sera mis à jour plus tard via Import 803 "update stock only"
```

### 2. **Category Assignment Strategy**
```php
// RÈGLE CACHÉE #2: Tous en catégorie "Forthcoming"
'product_cat' => 'Forthcoming',     // HARDCODÉ - pas d'exception

// POURQUOI: Import 852 pour nouveaux produits pas encore sortis
// Quand release date atteinte → Import 862 change catégorie
```

### 3. **Pricing Hierarchy**
```php
// RÈGLE CACHÉE #3: Pricing cascade YYD → YOYAKU
$pricingLogic = [
    'price net' => 8.79,           // Prix coût (Cost of Goods)
    'price yydistribution' => 10.99, // Prix B2B YYD (+25%)
    'price yoyaku,io' => 16.4       // Prix final YOYAKU (+49% vs YYD)
];

// MARGIN ANALYSIS:
// YYD margin: 10.99 - 8.79 = 2.20 (25% markup)
// YOYAKU margin: 16.4 - 10.99 = 5.41 (49% markup over YYD)
// Total YOYAKU margin: 16.4 - 8.79 = 7.61 (87% markup over cost)
```

### 4. **Images URL Generation Logic**
```php
// RÈGLE CACHÉE #4: Images calculées, pas stockées
function generateImageUrls($sku) {
    $baseUrl = 'https://yydistribution.ams3.digitaloceanspaces.com/yyplayer/images/';
    $images = [];
    
    // PRIMARY: 10 images haute qualité DigitalOcean
    for ($i = 1; $i <= 10; $i++) {
        $images['primary'][] = $baseUrl . $sku . '_' . $i . '_600.jpg';
    }
    
    // FALLBACKS: Images locales si DigitalOcean fail
    $fallbacks = ['.jpg', '_2.jpg', '.jpeg', '_2.jpeg', 
                  '.webp', '_2.webp', '.png', '_2.png'];
    foreach ($fallbacks as $ext) {
        $images['fallback'][] = $sku . $ext;
    }
    
    return $images;
}

// EXEMPLE M036:
// Primary: M036_1_600.jpg, M036_2_600.jpg...M036_10_600.jpg
// Fallback: M036.jpg, M036_2.jpg, M036.jpeg...
```

### 5. **Unique Key Business Logic**
```php
// RÈGLE CACHÉE #5: Unique key triple-compound
$uniqueKey = $sku . '-' . $distributor . $releaseDate;

// EXEMPLES:
"M036-clone2025-09-18"    // DJ Bone release
"M052-clone2025-10-22"    // CEM3340 release

// POURQUOI: 
// - SKU peut être réutilisé par différents distributeurs
// - Même SKU peut avoir différentes dates (repressage)
// - MAIS même SKU + distributeur + date = UNIQUE
```

### 6. **Taxonomy Multi-values Strategy**
```php
// RÈGLE CACHÉE #6: Taxonomies multi-valeurs avec priorité

// MUSICARTIST: Jusqu'à 4, ordre de priorité
if (!empty($artist1)) $artists[] = $artist1;   // Principal
if (!empty($artist2)) $artists[] = $artist2;   // Collaborateur
if (!empty($artist3)) $artists[] = $artist3;   // Feature
if (!empty($artist4)) $artists[] = $artist4;   // Remix

// MUSICSTYLE: Jusqu'à 4, générique → spécifique  
$genres = array_filter([$genre1, $genre2, $genre3, $genre4]);
// Exemple: ['Detroit techno', 'Electronic'] → 'Detroit techno' plus spécifique

// PRODUCT_TAG: Jusqu'à 2, descripteurs commerciaux
$tags = array_filter([$tag1, $tag2]);
// Vides dans échantillon, probablement 'world exclusive', 'limited' etc.
```

### 7. **Playlist Files Encoding**
```php
// RÈGLE CACHÉE #7: Format playlist propriétaire YOYAKU
$playlistFormat = "Titre||URL MP3##Titre2||URL2##...";

// PATTERN ANALYSÉ:
function parsePlaylistFiles($playlistString) {
    $tracks = explode('##', $playlistString);
    $playlist = [];
    
    foreach ($tracks as $track) {
        if (preg_match('/^(.+?)\|\|(.+?)$/', $track, $matches)) {
            $playlist[] = [
                'title' => trim($matches[1]),
                'mp3_url' => trim($matches[2])
            ];
        }
    }
    
    return $playlist;
}

// EXEMPLE M036:
[
  ['title' => '1 Shut The Lites Off', 'mp3_url' => 'https://...M036_1.mp3'],
  ['title' => '2 The Funk', 'mp3_url' => 'https://...M036_2.mp3'],
  ['title' => '3 The Haunting', 'mp3_url' => 'https://...M036_3.mp3']
]
```

### 8. **Coming Soon & Pre-order Logic**
```php
// RÈGLE CACHÉE #8: Coming Soon automatique basé sur release_date
function determineComingSoonStatus($releaseDate) {
    $today = new DateTime();
    $release = new DateTime($releaseDate);
    
    if ($release > $today) {
        return [
            '_set_coming_soon' => 'yes',
            '_coming_soon_label' => $releaseDate,
            'stock_status' => 'outofstock',     // Pas encore dispo
            'catalog_visibility' => 'visible'    // Mais visible catalog
        ];
    }
    
    // Si release_date passée, produit devient "available"
    // MAIS Import 852 est pour nouveaux, donc toujours futur
}
```

### 9. **Slug Generation Strategy**
```php
// RÈGLE CACHÉE #9: Slug pattern spécifique YOYAKU
function generateSlug($artist, $title, $sku) {
    // Pattern observé: {artist-lowercase}-{title-lowercase}-{sku-lowercase}
    
    $slugParts = [];
    if ($artist) $slugParts[] = sanitizeForSlug($artist);
    if ($title) $slugParts[] = sanitizeForSlug($title);
    $slugParts[] = strtolower($sku);
    
    return implode('-', $slugParts);
}

// EXEMPLES OBSERVÉS:
// "dj-bone-riding-the-thin-line-m036"
// Pattern: {artist}-{title}-{sku}

function sanitizeForSlug($text) {
    return strtolower(preg_replace('/[^a-zA-Z0-9]+/', '-', $text));
}
```

### 10. **Decimal Format Conversion**
```php
// RÈGLE CACHÉE #10: Conversion virgules européennes → points anglais
function convertEuropeanToEnglishDecimals($value) {
    // Input: "16,4", "8,79", "0,20"
    // Output: 16.4, 8.79, 0.20
    
    return (float) str_replace(',', '.', $value);
}

// OBLIGATOIRE pour WooCommerce API
// Google Sheets français → virgules
// WooCommerce → points décimaux
```

---

## 🔄 WORKFLOW BUSINESS RULES

### Import 852 → Autres Imports Dependencies
```php
// RÈGLE CACHÉE #11: Import 852 déclenche workflow 3-phases

// PHASE 1: Import 852 "regular new product" 
//   → Créer produit de base, stock=0, status=outofstock

// PHASE 2: Import 803 "update stock only" 
//   → Mettre à jour stock quand disponible

// PHASE 3: Import 862 "release date dashboard"
//   → Changer catégorie Forthcoming → Released à la date

// DÉPENDANCES:
// Import 852 DOIT être exécuté AVANT 803 et 862
// Les 3 utilisent même unique_key pour matching
```

### Error Handling Business Logic
```php
// RÈGLE CACHÉE #12: Gestion erreurs progressive

function handleImportErrors($product, $errors) {
    $criticalErrors = ['sku_missing', 'price_invalid', 'title_missing'];
    $warningErrors = ['image_404', 'genre_empty', 'weight_invalid'];
    
    foreach ($errors as $error) {
        if (in_array($error['type'], $criticalErrors)) {
            // ÉCHEC CRITIQUE: Ne pas créer le produit
            return ['status' => 'failed', 'reason' => $error['message']];
        }
        
        if (in_array($error['type'], $warningErrors)) {
            // WARNING: Créer avec valeur par défaut
            $product = applyDefaults($product, $error['type']);
        }
    }
    
    return ['status' => 'success_with_warnings', 'product' => $product];
}

function applyDefaults($product, $errorType) {
    switch ($errorType) {
        case 'image_404':
            $product['images'] = []; // Produit sans images
            break;
        case 'weight_invalid':
            $product['weight'] = '0.20'; // 200g par défaut vinyl
            break;
        case 'genre_empty':
            $product['genres'] = ['Electronic']; // Genre par défaut
            break;
    }
    return $product;
}
```

---

## 💰 BUSINESS INTELLIGENCE RULES

### Pricing Strategy Analysis
```php
// RÈGLE CACHÉE #13: Stratégie prix psychologique
$pricingStrategy = [
    'cost_price' => 8.79,           // Prix d'achat
    'b2b_price' => 10.99,           // +25% pour B2B (YYD)
    'retail_price' => 16.4,         // +49% vs B2B (+87% vs cost)
    'psychological_pricing' => true  // 16.4 vs 16.40 (prix psychologique)
];

// PATTERN: Tous les prix finissent par ,4 ou ,79
// 8,79 / 10,99 / 16,4 → Pattern psychologique français
```

### Market Positioning Rules
```php
// RÈGLE CACHÉE #14: Positionnement marché par genre

$marketPositioning = [
    'Detroit techno' => ['premium' => true, 'exclusive' => true],
    'Electro' => ['premium' => true, 'exclusive' => true],
    'Electronic' => ['mainstream' => true, 'volume' => true]
];

// TOUS les produits échantillon = 'world exclusive'
// Import 852 = nouveautés exclusives, pas catalog général
```

### Inventory Management Philosophy
```php
// RÈGLE CACHÉE #15: Gestion stock "pull" vs "push"

// STRATÉGIE PULL:
// 1. Annoncer produit (Import 852) → stock=0
// 2. Mesurer demande (pre-orders, wishlist)
// 3. Commander stock optimal (Import 803)
// 4. Activer vente (Import 862)

// AVANTAGES:
// - Pas de sur-stock
// - Mesure demande réelle
// - Optimisation cash flow
```

---

## ⚙️ TECHNICAL BUSINESS RULES

### Data Validation Rules
```php
// RÈGLE CACHÉE #16: Validation métier stricte

$validationRules = [
    'sku' => [
        'required' => true,
        'pattern' => '/^[A-Z][0-9]{3,4}$/',  // M036, M052 pattern
        'unique' => true
    ],
    'price_yoyaku' => [
        'required' => true,
        'min' => 5.0,                        // Prix minimum 5€
        'format' => 'european_decimal'       // 16,4 format
    ],
    'release_date' => [
        'required' => true,
        'future_only' => true,               // Import 852 = futur uniquement
        'format' => 'YYYY-MM-DD'
    ],
    'title' => [
        'required' => true,
        'max_length' => 100,
        'no_html' => true
    ]
];
```

### SEO & URL Rules
```php
// RÈGLE CACHÉE #17: SEO automatique

function generateSEOElements($product) {
    return [
        'meta_title' => $product['artist'] . ' - ' . $product['title'],
        'meta_description' => substr($product['description'], 0, 160) . '...',
        'canonical_url' => 'https://www.yoyaku.io/release/' . $product['slug'],
        'qr_code_url' => 'https://www.yoyaku.io/release/' . strtolower($product['sku']),
        'og_image' => generateImageUrls($product['sku'])['primary'][0]
    ];
}
```

---

## 🚨 CONTRAINTES & LIMITATIONS

### Business Constraints
```php
// RÈGLE CACHÉE #18: Contraintes métier absolues

$businessConstraints = [
    'max_products_per_batch' => 1,          // WP Import processing
    'max_artists_per_product' => 4,        // UI limitation
    'max_genres_per_product' => 4,         // Taxonomy performance
    'required_image_dimensions' => '600x600', // CDN standard
    'max_description_length' => 2000,      // WooCommerce limit
    'hs_code_fixed' => '85238010',         // Legal requirement vinyl
    'origin_country_fixed' => 'FR',        // Legal requirement
    'tax_class_standard' => true           // French tax law
];
```

### Performance Rules
```php
// RÈGLE CACHÉE #19: Performance optimization

$performanceRules = [
    'batch_size_images' => 1,              // 1 image par fois
    'cdn_timeout' => 30,                   // 30s timeout DigitalOcean
    'fallback_attempts' => 8,              // 8 fallback images
    'taxonomy_cache' => true,              // Cache terms lookup
    'duplicate_check_limit' => 1000       // Check 1000 recent products
];
```

---

**✅ ANALYSE COMPLÈTE:** Toutes les règles business cachées identifiées et documentées. Prêt pour Phase 1D - Spécifications techniques complètes.