# Setup Guide - Recalculation API Tokens

**Version:** 3.0.0
**Date:** 2025-10-26
**Required for:** Automatic data recalculation before fetch

---

## Quick Start

The v3.0 update requires authentication tokens for the recalculation APIs. Follow these steps to configure them.

---

## Option 1: Direct Configuration (Quick & Easy)

### Step 1: Get API Tokens

You need to generate secure API tokens on both WordPress sites.

**YOYAKU.IO Token (YSC Plugin):**
1. SSH into YOYAKU.IO server
2. Generate token via WP-CLI or custom script
3. Copy the token value

**YYD.FR Token (YYD Plugin):**
1. SSH into YYD.FR server
2. Generate token via WP-CLI or custom script
3. Copy the token value

### Step 2: Update `api-credentials.js`

Open `api-credentials.js` and find the `RECALC_ENDPOINTS` section:

```javascript
const RECALC_ENDPOINTS = {
  'yoyaku.io': {
    url: 'https://www.yoyaku.io/wp-json/ysc/v1/recalculate-preorders',
    token: 'ysc_recalc_2024_secure_token' // TODO: Replace with real token
  },
  'yydistribution.fr': {
    url: 'https://www.yydistribution.fr/wp-json/yyd/v1/recalculate-shelves',
    token: 'yyd_recalc_2024_secure_token' // TODO: Replace with real token
  }
};
```

Replace the placeholder tokens:

```javascript
const RECALC_ENDPOINTS = {
  'yoyaku.io': {
    url: 'https://www.yoyaku.io/wp-json/ysc/v1/recalculate-preorders',
    token: 'your_real_yoyaku_token_here' // ✅ Real token
  },
  'yydistribution.fr': {
    url: 'https://www.yydistribution.fr/wp-json/yyd/v1/recalculate-shelves',
    token: 'your_real_yyd_token_here' // ✅ Real token
  }
};
```

### Step 3: Test

Click "Fetch Data & Calculate" and verify:
- ✅ "Step 1/3: Recalculating YOYAKU.IO..." appears
- ✅ "Step 2/3: Recalculating YYD.FR..." appears
- ✅ Final report shows "YOYAKU.IO: ✅ Success" and "YYD.FR: ✅ Success"

---

## Option 2: Secure Storage (Recommended for Production)

For better security, store tokens in Google Apps Script Properties instead of code.

### Step 1: Store Tokens Securely

In Google Apps Script editor, run this function **once**:

```javascript
function storeRecalcTokensSecurely() {
  const scriptProperties = PropertiesService.getScriptProperties();

  // Store YOYAKU.IO recalculation token
  scriptProperties.setProperty('YOYAKU_RECALC_TOKEN', 'your_real_yoyaku_token_here');

  // Store YYD.FR recalculation token
  scriptProperties.setProperty('YYD_RECALC_TOKEN', 'your_real_yyd_token_here');

  Logger.log('✅ Recalculation tokens stored securely');
}
```

**Run it:**
1. Click "Run" → Select `storeRecalcTokensSecurely`
2. Authorize the script if prompted
3. Check logs to verify: "✅ Recalculation tokens stored securely"

### Step 2: Update `getRecalcEndpoint()` Function

Modify `api-credentials.js` to retrieve tokens from Script Properties:

```javascript
function getRecalcEndpoint(site) {
  const scriptProperties = PropertiesService.getScriptProperties();

  if (!RECALC_ENDPOINTS[site]) {
    throw new Error(`No recalculation endpoint configured for site: ${site}`);
  }

  const endpoint = RECALC_ENDPOINTS[site];

  // Try to get token from Script Properties first, fallback to hardcoded
  let token = endpoint.token;

  if (site === 'yoyaku.io') {
    token = scriptProperties.getProperty('YOYAKU_RECALC_TOKEN') || token;
  } else if (site === 'yydistribution.fr') {
    token = scriptProperties.getProperty('YYD_RECALC_TOKEN') || token;
  }

  return {
    url: endpoint.url,
    token: token
  };
}
```

**Benefits:**
- ✅ Tokens not visible in code
- ✅ Can be rotated without code changes
- ✅ More secure (only accessible by script)

### Step 3: Test

Same as Option 1 - verify recalculation succeeds.

---

## Generating Tokens on WordPress

### Method 1: WordPress Admin Panel (if UI exists)

If your plugins have token management UI:

1. Navigate to plugin settings page
2. Find "API Tokens" or "Recalculation API" section
3. Click "Generate New Token"
4. Copy token value
5. Update Google Apps Script configuration

### Method 2: WP-CLI Command

SSH into server and run:

```bash
# YOYAKU.IO (YSC Plugin)
ssh yoyaku-cloudways "cd /home/master/applications/jfnkmjmfer/public_html && \
  wp eval 'echo wp_generate_password(32, true, true);'"

# YYD.FR (YYD Plugin)
ssh yoyaku-cloudways "cd /home/master/applications/akrjekfvzk/public_html && \
  wp eval 'echo wp_generate_password(32, true, true);'"
```

**Then store tokens in WordPress:**

```bash
# YOYAKU.IO
wp option update ysc_recalc_api_token "generated_token_here"

# YYD.FR
wp option update yyd_recalc_api_token "generated_token_here"
```

### Method 3: Direct Database Insert

**YOYAKU.IO:**
```sql
INSERT INTO wp_options (option_name, option_value, autoload)
VALUES ('ysc_recalc_api_token', 'your_generated_token', 'no')
ON DUPLICATE KEY UPDATE option_value = 'your_generated_token';
```

**YYD.FR:**
```sql
INSERT INTO wp_options (option_name, option_value, autoload)
VALUES ('yyd_recalc_api_token', 'your_generated_token', 'no')
ON DUPLICATE KEY UPDATE option_value = 'your_generated_token';
```

---

## Token Validation on WordPress Side

Your WordPress plugins should validate tokens like this:

### YOYAKU.IO (YSC Plugin)

```php
// In /wp-json/ysc/v1/recalculate-preorders endpoint

public function recalculate_preorders(WP_REST_Request $request) {
    // Get token from Authorization header
    $auth_header = $request->get_header('Authorization');

    if (empty($auth_header)) {
        return new WP_Error('missing_auth', 'Authorization header missing', ['status' => 401]);
    }

    // Extract token (format: "Bearer TOKEN_HERE")
    $token = str_replace('Bearer ', '', $auth_header);

    // Validate token against stored option
    $valid_token = get_option('ysc_recalc_api_token');

    if ($token !== $valid_token) {
        return new WP_Error('invalid_token', 'Invalid API token', ['status' => 401]);
    }

    // Token valid - proceed with recalculation
    // ... recalculation logic ...

    return rest_ensure_response([
        'success' => true,
        'message' => 'Preorders recalculated successfully'
    ]);
}
```

### YYD.FR (YYD Plugin)

```php
// In /wp-json/yyd/v1/recalculate-shelves endpoint

public function recalculate_shelves(WP_REST_Request $request) {
    // Same validation pattern as above
    $auth_header = $request->get_header('Authorization');

    if (empty($auth_header)) {
        return new WP_Error('missing_auth', 'Authorization header missing', ['status' => 401]);
    }

    $token = str_replace('Bearer ', '', $auth_header);
    $valid_token = get_option('yyd_recalc_api_token');

    if ($token !== $valid_token) {
        return new WP_Error('invalid_token', 'Invalid API token', ['status' => 401]);
    }

    // Token valid - proceed with recalculation
    // ... recalculation logic ...

    return rest_ensure_response([
        'success' => true,
        'message' => 'Shelf quantities recalculated successfully'
    ]);
}
```

---

## Troubleshooting

### Error: "Authorization header missing"

**Cause:** Token not being sent in request.

**Fix:**
1. Check `api-credentials.js` has valid token
2. Verify `getRecalcEndpoint()` returns token correctly
3. Check `recalculateSourceData()` includes Authorization header

### Error: "Invalid API token"

**Cause:** Token mismatch between Google Sheet and WordPress.

**Fix:**
1. Regenerate token on WordPress
2. Update Google Apps Script with new token
3. Test again

### Error: "Endpoint not found" (404)

**Cause:** WordPress REST API endpoint doesn't exist.

**Fix:**
1. Verify YSC/YYD plugins are active
2. Check plugin version supports recalculation API
3. Test endpoint manually with curl:

```bash
curl -X POST https://www.yoyaku.io/wp-json/ysc/v1/recalculate-preorders \
  -H "Authorization: Bearer your_token_here"
```

### Recalculation shows "⚠️ Failed"

**Debugging steps:**
1. Open Google Apps Script editor
2. View → Logs
3. Check for error messages
4. Common causes:
   - Wrong token
   - Endpoint not active
   - Network timeout
   - WordPress error (check WordPress logs)

---

## Security Best Practices

### Token Requirements

- ✅ Minimum 32 characters
- ✅ Random alphanumeric + special characters
- ✅ Unique per site (don't reuse)
- ✅ Rotated every 90 days

### Token Storage

- ✅ Use Script Properties (not hardcoded)
- ✅ Never commit tokens to Git
- ✅ Store backups in secure password manager
- ✅ Document token rotation dates

### WordPress Side

- ✅ Store tokens in `wp_options` (not code)
- ✅ Use `autoload = 'no'` (performance)
- ✅ Validate token on every request
- ✅ Rate limit endpoint (max 10 calls/minute)
- ✅ Log failed authentication attempts

---

## Testing Checklist

After configuration, verify:

- [ ] YOYAKU.IO recalculation succeeds (check logs)
- [ ] YYD.FR recalculation succeeds (check logs)
- [ ] Data fetch works after recalculation
- [ ] Final report shows success for both sites
- [ ] Error handling works (test with wrong token)
- [ ] Performance is acceptable (~7-13 seconds added)

---

## Support

**Questions?** Contact: ben@yoyaku.fr

**Documentation:**
- Full changelog: `CHANGELOG-V3.0.md`
- API functions: `api-stock-functions-v2-webmaster.js`
- Credentials config: `api-credentials.js`
