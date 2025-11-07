# 🚀 QUICK START - 5 Minutes

**Create your first product via API in 5 minutes**

---

## ⚡ Steps

### 1️⃣ Open Google Sheets (30 sec)

Create a new Google Sheet with this header:

```
sku | title | slug | distributor | label | priceyoyakuio
```

Add test data:

```
TEST001 | Test Artist - Test Album | test-artist-test-album | DEEJAY | Test Records | 9.99
```

---

### 2️⃣ Copy Script (1 min)

1. **Extensions → Apps Script**
2. Delete default code
3. Copy-paste **entire content** from:
   ```
   scripts/google-apps-script-new-product.js
   ```
4. **File → Save** (name: "YOYAKU WP Import")

---

### 3️⃣ Configure (2 min)

**In Apps Script Editor:**

1. Click **⚙️ Project Settings**
2. Scroll to **Script Properties**
3. Click **Add property** for each site:

**YOYAKU.IO (B2C) - Required:**

| Property | Value |
|----------|-------|
| `WC_BASE_URL` | `https://yoyaku.io/wp-json` |
| `WC_CONSUMER_KEY` | `ck_...` (get from WordPress) |
| `WC_CONSUMER_SECRET` | `cs_...` (get from WordPress) |

**YYD.FR (B2B) - Optional (if using YYD features):**

| Property | Value |
|----------|-------|
| `WC_BASE_URL_YYD` | `https://yydistribution.fr/wp-json` |
| `WC_CONSUMER_KEY_YYD` | `ck_...` (get from WordPress) |
| `WC_CONSUMER_SECRET_YYD` | `cs_...` (get from WordPress) |

**Custom Taxonomies (Optional - for both sites):**

| Property | Value |
|----------|-------|
| `WP_APP_USER` | WordPress username (YOYAKU.IO) |
| `WP_APP_PASSWORD` | Application password (YOYAKU.IO) |
| `WP_APP_USER_YYD` | WordPress username (YYD.FR) |
| `WP_APP_PASSWORD_YYD` | Application password (YYD.FR) |

**Get WooCommerce keys:**
```
WordPress Admin → WooCommerce → Settings → Advanced → REST API
→ Add Key → Copy keys
```

**Get WordPress Application Password:**
```
WordPress Admin → Users → Your Profile → Application Passwords
→ Add New → Copy password
```

---

### 4️⃣ Authorize (1 min)

1. In Apps Script: **Run → onOpen**
2. Review permissions
3. Click **Advanced → Go to... → Allow**

---

### 5️⃣ Test! (30 sec)

1. **Refresh your Google Sheet** (close & reopen)
2. You should see menu: **YOYAKU • WP IMPORT**
3. Select your test row (row 2)
4. **Menu → YOYAKU • WP IMPORT → New Product (API) → New Product on yoyaku.io (API)**
5. Wait ~2 seconds
6. Success alert! 🎉

---

## ✅ Verify

**Check in WordPress:**
```
Products → All Products → Search "TEST001"
```

**Or via WP-CLI:**
```bash
ssh yoyaku-cloudways "cd applications/jfnkmjmfer/public_html && \
  wp post list --post_type=product --meta_key=_sku --meta_value=TEST001 --allow-root"
```

---

## 🎯 What Was Created

**Product:**
- ✅ SKU: TEST001
- ✅ Title: Test Artist - Test Album
- ✅ Slug: test-artist-test-album
- ✅ Price: €9.99
- ✅ Category: Forthcoming
- ✅ Stock: Out of stock (default)
- ✅ Dimensions: 30x30x0.2 cm
- ✅ All WP All Import #852 meta fields

**Images:**
- Smart detection attempted (webp, jpg, jpeg, png)
- Skipped if not found (no errors)

---

## 🔄 Auto-Generate Missing Columns (NEW!)

**Replace Google Sheets formulas with one-click automation**

### What it generates:

1. **weight** - From format (12", 2x12", LP, etc.)
2. **price net** - From Price Gross + distributor margin
3. **price yydistribution** - B2B price (net × multiplier)
4. **price yoyaku.io** - B2C price (B2B × 1.25, rounded)
5. **slug** - From artist1 + title + SKU (WordPress-friendly)
6. **playlist_files** - From tracklist OR track1-24
7. **IMAGE Serveur** - Check image existence (multi-format)
8. **MP3 Serveur** - Check MP3 existence
9. **PACK MEDIA Serveur** - Determine if complete (Online/Not Online)
10. **_wp_old_slug** - From SKU (uppercase)

### How to use:

1. Fill columns A-S (Distributor, SKU, Price Gross, title, format, etc.)
2. Select a data row
3. **Menu → YOYAKU • WP IMPORT → 🔄 Auto-generate missing columns**
4. Wait ~5-10 seconds (verifies images & MP3s)
5. Columns T-BI auto-filled!

### Example:

**Before:**
```
Distributor: prime direct
SKU: CBR003
Price Gross: 9.1
format: 12"
title: Benedikt Frey - Aid Kit
artist1: Benedikt Frey
tracklist: A1 - Aid Kit
A2 - Aid Kit (Carl Finlow Remix)
B1 - Tender
B2 - Tides
```

**After auto-generation:**
```
weight: 0.2
price net: 9.19
price yydistribution: 11.49
price yoyaku.io: 14.4
slug: benedikt-frey-aid-kit-cbr003
playlist_files: A1 - Aid Kit||https://.../_1.mp3##A2 - Aid Kit (Carl Finlow Remix)||https://.../_2.mp3##...
IMAGE Serveur: Working (jpg, _1)
MP3 Serveur: Working (mp3, _1 to _4)
PACK MEDIA Serveur: Online
```

**No more formulas needed!** 🎉

---

## 🚀 Next Steps

### Add Real Product

Replace test data with real product:

```
sku | title | slug | description | distributor | label | priceyoyakuio | artist1 | genre1 | tag1
VINYL001 | Aphex Twin - SAW 85-92 | aphex-twin-saw-85-92 | Classic album | DEEJAY | Warp Records | 24.99 | Aphex Twin | Ambient | New Release
```

### Bulk Import

1. Add multiple rows
2. **Menu → 📊 Bulk import (all rows)**

### Upload Images

Upload to Digital Ocean Spaces:
```
https://yydistribution.ams3.digitaloceanspaces.com/yyplayer/images/
  VINYL001_1.jpg
  VINYL001_2.jpg
  ...
```

Pattern: `{SKU}_{1..10}.{format}`

---

## 🐛 Troubleshooting

**Menu not appearing?**
→ Refresh sheet (close & reopen)

**"WooCommerce credentials missing"?**
→ Check Script Properties (WC_CONSUMER_KEY, WC_CONSUMER_SECRET)

**"Validation failed"?**
→ Fill all required columns (sku, title, slug, distributor, label, priceyoyakuio)

**Full guide:** [scripts/README.md](scripts/README.md#troubleshooting)

---

## 📚 Full Documentation

- [Main README](README.md) - Complete overview
- [Scripts Guide](scripts/README.md) - Detailed installation
- [WP All Import Config](/wp-all-import-settings/) - Reference mapping

---

**⏱️ Total time:** ~5 minutes
**Result:** Product created via API, 100x faster than WP All Import!

**🎉 You're ready to create products via API!**
