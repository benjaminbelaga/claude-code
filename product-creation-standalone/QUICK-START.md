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
3. Click **Add property** (3 times):

| Property | Value |
|----------|-------|
| `WC_BASE_URL` | `https://yoyaku.io/wp-json` |
| `WC_CONSUMER_KEY` | `ck_...` (get from WordPress) |
| `WC_CONSUMER_SECRET` | `cs_...` (get from WordPress) |

**Get WooCommerce keys:**
```
WordPress Admin → WooCommerce → Settings → Advanced → REST API
→ Add Key → Copy keys
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
4. **Menu → YOYAKU • WP IMPORT → ✅ Create/Update selected product**
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
  VINYL001_1_600.jpg
  VINYL001_2_600.jpg
  ...
```

Pattern: `{SKU}_{1..10}_600.{format}`

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
