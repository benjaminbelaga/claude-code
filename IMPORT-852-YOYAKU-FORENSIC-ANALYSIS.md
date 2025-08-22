# 🔬 Import 852 YOYAKU - Analyse Forensique Complète

**Date:** 2025-08-21  
**Import:** #852 YOYAKU.IO New Product Creation  
**Priorité:** Phase 2A - Semaine 1-2  
**Complexité:** 🔴 TRÈS HAUTE (9/10)  

---

## 📋 MÉTHODOLOGIE D'ANALYSE

### **Étape 1: Extraction Configuration WP Import**
```bash
# TODO: Exécuter sur serveur YOYAKU production
ssh -i ~/.ssh/cloudways_rsa master_crhmyfjcsf@134.122.80.6
cd /home/master/applications/jfnkmjmfer/public_html
wp all-import export 852 --format=xml > import-852-config.xml
wp all-import list # Vérifier ID exact
```

### **Étape 2: Analyse Google Sheets Structure**
```bash
# URL Google Sheets Import 852
https://docs.google.com/spreadsheets/d/[SHEET_ID]/edit#gid=[GID]

# Colonnes à analyser:
# A: Image URL ou référence
# B: Distributor 
# C: SKU (CRITIQUE - Unique identifier)
# D: Nom Artiste (musicartist)
# E: Titre Release (Product title part)
# F: Genre (musicstyle) 
# G: Label (musiclabel)
# H: Release Date (releasedate)
# I: Prix YOYAKU.IO (priceyoyakuio)
# J: Prix YYD (priceyydistribution - pas utilisé)
# K: Playlists YOYAKU.IO (playlistsyoyakuio)
# L: Playlists YYD (pas utilisé)
# M: Discogs ID (discogsid)
# N: Image URL 1 (imageurl1)
# O: Image URL 2 (imageurl2)
# P: Image URL 3 (imageurl3)
# Q: Image URL 4 (imageurl4)
# R: Image URL 5 (imageurl5)
```

---

## 🎯 CONFIGURATION WP IMPORT 852 (À EXTRAIRE)

### **Basic Settings**
```xml
<!-- À compléter après extraction -->
<import_id>852</import_id>
<name>YOYAKU New Product Import</name>
<type>product</type>
<source>Google Sheets CSV</source>
<processing_type>ajax</processing_type>
<records_per_batch>20</records_per_batch>
```

### **Field Mappings (Configuration Exacte)**
```xml
<!-- PRODUCT CORE FIELDS -->
<product_title>
  <!-- FORMULE À ANALYSER: Probablement {musicartist} - {Titre Release} -->
  <xpath>[FORMULA_TO_EXTRACT]</xpath>
</product_title>

<product_content>
  <!-- FORMULE COMPLEXE À REVERSE ENGINEER -->
  <xpath>[COMPLEX_FORMULA_TO_EXTRACT]</xpath>
</product_content>

<product_sku>
  <xpath>{sku[1]}</xpath> <!-- Colonne C -->
</product_sku>

<regular_price>
  <xpath>{priceyoyakuio[1]}</xpath> <!-- Colonne I -->
</regular_price>

<!-- STOCK MANAGEMENT -->
<manage_stock>yes</manage_stock>
<stock_quantity>0</stock_quantity> <!-- Par défaut 0 pour nouveaux produits -->
<stock_status>instock</stock_status>
<backorders>no</backorders>
```

### **Taxonomies (YOYAKU Specific)**
```xml
<!-- 4 TAXONOMIES YOYAKU -->
<taxonomy name="musicartist">
  <xpath>{musicartist[1]}</xpath> <!-- Colonne D -->
  <logic>create_if_not_exists</logic>
</taxonomy>

<taxonomy name="musiclabel">
  <xpath>{musiclabel[1]}</xpath> <!-- Colonne G -->
  <logic>create_if_not_exists</logic>
</taxonomy>

<taxonomy name="musicstyle">
  <xpath>{musicstyle[1]}</xpath> <!-- Colonne F -->
  <logic>create_if_not_exists</logic>
</taxonomy>

<taxonomy name="distributormusic">
  <xpath>{distributor[1]}</xpath> <!-- Colonne B -->
  <logic>create_if_not_exists</logic>
</taxonomy>

<taxonomy name="product_cat">
  <value>Forthcoming</value> <!-- HARDCODÉ -->
  <logic>assign</logic>
</taxonomy>
```

### **Custom Fields (Metadata)**
```xml
<!-- CUSTOM FIELDS YOYAKU -->
<custom_field name="_playlist_id">
  <xpath>{playlistsyoyakuio[1]}</xpath> <!-- Colonne K -->
</custom_field>

<custom_field name="_discogs_id">
  <xpath>{discogsid[1]}</xpath> <!-- Colonne M -->
</custom_field>

<custom_field name="_release_date">
  <xpath>{releasedate[1]}</xpath> <!-- Colonne H -->
</custom_field>

<custom_field name="_distributor">
  <xpath>{distributor[1]}</xpath> <!-- Colonne B -->
</custom_field>

<custom_field name="_stock_source">
  <value>google_sheets</value> <!-- HARDCODÉ -->
</custom_field>

<custom_field name="_import_timestamp">
  <value>[AUTO_TIMESTAMP]</value> <!-- Timestamp import -->
</custom_field>
```

### **Images Configuration**
```xml
<!-- IMAGES MULTIPLE AVEC FALLBACKS -->
<featured_image>
  <xpath>{imageurl1[1]}</xpath> <!-- Colonne N -->
  <download>yes</download>
  <fallback_strategy>skip_if_404</fallback_strategy>
</featured_image>

<gallery_images>
  <image1>
    <xpath>{imageurl2[1]}</xpath> <!-- Colonne O -->
  </image1>
  <image2>
    <xpath>{imageurl3[1]}</xpath> <!-- Colonne P -->
  </image2>
  <image3>
    <xpath>{imageurl4[1]}</xpath> <!-- Colonne Q -->
  </image3>
  <image4>
    <xpath>{imageurl5[1]}</xpath> <!-- Colonne R -->
  </image4>
  <download>yes</download>
  <fallback_strategy>skip_if_404</fallback_strategy>
</gallery_images>
```

---

## 🔍 QUESTIONS CRITIQUES À ANALYSER

### **1. Product Title Formula**
**Question:** Comment est construit le titre produit?
**Options possibles:**
```php
// Option A: Simple concatenation
$title = "{musicartist} - {Titre Release}";

// Option B: Conditional logic
if (!empty("{musicartist}") && !empty("{Titre Release}")) {
    $title = "{musicartist} - {Titre Release}";
} else if (!empty("{musicartist}")) {
    $title = "{musicartist}";
} else {
    $title = "{Titre Release}";
}

// Option C: Complex formula with fallbacks
$title = "[COMPLEX_WP_IMPORT_FORMULA]";
```

### **2. Product Description Formula**
**Question:** Comment est générée la description?
**Analyse requise:** Reverse engineer la formule WP Import
```php
// Pattern probable basé sur l'analyse des audits
$description = "";
if (!empty("{Titre Release}")) {
    $description .= "Album: {Titre Release}\n";
}
if (!empty("{musicartist}")) {
    $description .= "Artist: {musicartist}\n";
}
if (!empty("{musiclabel}")) {
    $description .= "Label: {musiclabel}\n";
}
if (!empty("{musicstyle}")) {
    $description .= "Genre: {musicstyle}\n";
}
if (!empty("{releasedate}")) {
    $description .= "Release Date: {releasedate}\n";
}
if (!empty("{distributor}")) {
    $description .= "Distributor: {distributor}\n";
}
```

### **3. Image URLs Pattern**
**Question:** Quel est le pattern exact des URLs images?
**À analyser:**
```javascript
// Pattern supposé basé sur audit
const imagePatterns = {
  base_url: 'https://[CDN_DOMAIN]/images/',
  patterns: [
    '{imageurl1}', // URL complète depuis sheet
    '{imageurl2}', // URL complète depuis sheet
    '{imageurl3}', // URL complète depuis sheet
    '{imageurl4}', // URL complète depuis sheet
    '{imageurl5}'  // URL complète depuis sheet
  ],
  fallbacks: [
    '.jpg' => '.png',
    '_high.jpg' => '_medium.jpg',
    '_600.jpg' => '_400.jpg'
  ]
};
```

### **4. Stock Management Logic**
**Question:** Quelle est la logique de stock par défaut?
```php
// Pour nouveaux produits Import 852
$stock_settings = [
    'manage_stock' => true,
    'stock_quantity' => 0,      // Toujours 0 au début?
    'stock_status' => 'instock', // Ou 'outofstock'?
    'backorders' => 'no',       // Ou 'yes'?
];
```

### **5. Duplicate Handling**
**Question:** Comment sont gérés les doublons?
```php
// Unique key strategy
$unique_key_options = [
    'sku_only' => '{sku}',
    'title_sku' => '{title} - {sku}',
    'artist_title' => '{musicartist} - {Titre Release}',
];
```

---

## 📊 DONNÉES À COLLECTER

### **A. Configuration WP Import**
- [ ] **Export XML complet** de l'import 852
- [ ] **Formules exactes** pour title et description
- [ ] **Mappings custom fields** complets
- [ ] **Logique taxonomies** et création termes
- [ ] **Configuration images** et fallbacks
- [ ] **Settings duplicate** handling

### **B. Google Sheets Analysis**
- [ ] **Structure colonnes** exacte avec headers
- [ ] **Échantillon données** réelles (10-20 lignes)
- [ ] **Validation format** URLs images
- [ ] **Types de données** par colonne
- [ ] **Données manquantes** patterns

### **C. Production Database**
- [ ] **Produits existants** créés par Import 852
- [ ] **Custom fields** réellement assignés
- [ ] **Taxonomies** et termes créés
- [ ] **Images** réellement attachées
- [ ] **Metadata** structure complète

---

## 🛠️ PLAN D'EXTRACTION DONNÉES

### **Étape 1: SSH Serveur Production**
```bash
# Connexion serveur YOYAKU
ssh -i ~/.ssh/cloudways_rsa master_crhmyfjcsf@134.122.80.6

# Navigation WordPress
cd /home/master/applications/jfnkmjmfer/public_html

# Export configuration Import 852
wp all-import export 852 --format=xml

# Liste imports actifs
wp all-import list

# Info détaillée Import 852
wp all-import info 852
```

### **Étape 2: Analyse Database Produits**
```bash
# Derniers produits créés par Import 852
wp post list --post_type=product --meta_key=_import_id --meta_value=852 --number=10

# Custom fields les plus utilisés
wp db query "SELECT meta_key, COUNT(*) as count FROM wp_postmeta WHERE meta_key LIKE '_%' GROUP BY meta_key ORDER BY count DESC LIMIT 20"

# Taxonomies produits
wp term list musicartist --format=table --number=10
wp term list musiclabel --format=table --number=10
wp term list musicstyle --format=table --number=10
wp term list distributormusic --format=table --number=10
```

### **Étape 3: Google Sheets Access**
```bash
# URL Sheet Import 852 (à identifier)
# https://docs.google.com/spreadsheets/d/[ID]/edit#gid=[GID]

# Export CSV pour analyse
curl "[SHEET_CSV_URL]" > import-852-sample.csv

# Analyse headers et échantillon
head -n 5 import-852-sample.csv
```

---

## 📝 SPÉCIFICATIONS TECHNIQUES À CRÉER

Après collecte données, créer:

### **1. API Specification Document**
```yaml
# import-852-api-spec.yaml
endpoint: /wp-json/yoyaku/v1/products/create-new
method: POST
authentication: WooCommerce API Key
batch_size: 20
rate_limit: 1req/sec

input_schema:
  sku: string (required, unique)
  musicartist: string (required)
  title_release: string (required)
  musiclabel: string (optional)
  musicstyle: string (optional)
  distributor: string (optional)
  price_yoyaku: number (required, > 0)
  release_date: date (ISO format)
  playlist_id: string (optional)
  discogs_id: string (optional)
  image_urls: array[string] (1-5 URLs)

output_schema:
  product_id: integer
  sku: string
  status: "created|updated|failed"
  errors: array[string]
```

### **2. Data Transformation Rules**
```javascript
// transformation-rules-852.js
const transformationRules = {
  title: (data) => `${data.musicartist} - ${data.titre_release}`,
  description: (data) => generateDescription(data),
  taxonomies: {
    musicartist: (value) => createOrGetTerm('musicartist', value),
    musiclabel: (value) => createOrGetTerm('musiclabel', value),
    musicstyle: (value) => createOrGetTerm('musicstyle', value),
    distributormusic: (value) => createOrGetTerm('distributormusic', value),
    product_cat: () => getTerm('product_cat', 'Forthcoming')
  },
  custom_fields: {
    '_playlist_id': (data) => data.playlistsyoyakuio,
    '_discogs_id': (data) => data.discogsid,
    '_release_date': (data) => formatDate(data.releasedate),
    '_distributor': (data) => data.distributor,
    '_stock_source': () => 'google_sheets',
    '_import_timestamp': () => Date.now()
  }
};
```

### **3. Image Processing Rules**
```javascript
// image-processing-rules-852.js
const imageProcessingRules = {
  sources: ['imageurl1', 'imageurl2', 'imageurl3', 'imageurl4', 'imageurl5'],
  featured_image: 'imageurl1', // Premier = featured
  gallery_images: ['imageurl2', 'imageurl3', 'imageurl4', 'imageurl5'],
  fallback_strategy: 'skip_if_404',
  retry_attempts: 3,
  timeout: 30000, // 30 secondes
  allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  max_size: '10MB'
};
```

---

## ✅ CHECKLIST ANALYSE COMPLÈTE

### **Phase 1A: Extraction (Jour 1-2)**
- [ ] Connexion SSH serveur production
- [ ] Export configuration WP Import 852 XML
- [ ] Identification Google Sheets URL et GID
- [ ] Export échantillon CSV données réelles
- [ ] Documentation structure colonnes

### **Phase 1B: Reverse Engineering (Jour 3-4)**
- [ ] Analyse formules title et description
- [ ] Identification patterns URLs images
- [ ] Mapping custom fields complet
- [ ] Logique taxonomies et termes
- [ ] Stratégie duplicate handling

### **Phase 1C: Spécifications (Jour 5)**
- [ ] Création API specification YAML
- [ ] Documentation transformation rules
- [ ] Image processing configuration
- [ ] Validation business rules
- [ ] Plan de tests unitaires

---

**🎯 PRÊT:** Analyse méthodique en 5 jours pour extraire TOUTES les configurations et créer des spécifications techniques complètes avant développement.