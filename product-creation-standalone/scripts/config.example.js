/**
 * Google Apps Script - Configuration Example
 *
 * Copy these values to Script Properties:
 * Apps Script Editor → Project Settings → Script Properties → Add property
 */

// ============================================================================
// REQUIRED - WooCommerce REST API
// ============================================================================

// WordPress base URL (with /wp-json)
// Example: https://yoyaku.io/wp-json
WC_BASE_URL = "https://your-site.com/wp-json"

// WooCommerce Consumer Key
// Generate in: WordPress Admin → WooCommerce → Settings → Advanced → REST API
WC_CONSUMER_KEY = "ck_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

// WooCommerce Consumer Secret
WC_CONSUMER_SECRET = "cs_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"


// ============================================================================
// OPTIONAL - WordPress REST API (for custom taxonomies)
// ============================================================================

// WordPress username
WP_APP_USER = "your-username"

// WordPress Application Password
// Generate in: WordPress Admin → Users → Your Profile → Application Passwords
WP_APP_PASSWORD = "xxxx xxxx xxxx xxxx xxxx xxxx"


// ============================================================================
// HOW TO USE
// ============================================================================

/**
 * 1. In Google Apps Script Editor:
 *    - Project Settings (gear icon)
 *    - Script Properties
 *    - Add property (one by one)
 *
 * 2. Required properties:
 *    - WC_BASE_URL
 *    - WC_CONSUMER_KEY
 *    - WC_CONSUMER_SECRET
 *
 * 3. Optional (for custom taxonomies):
 *    - WP_APP_USER
 *    - WP_APP_PASSWORD
 *
 * 4. Save and authorize script
 */


// ============================================================================
// GENERATE WOOCOMMERCE KEYS
// ============================================================================

/**
 * 1. WordPress Admin → WooCommerce → Settings
 * 2. Advanced tab → REST API
 * 3. Add Key
 * 4. Description: "Google Apps Script"
 * 5. User: Your admin user
 * 6. Permissions: Read/Write
 * 7. Generate API Key
 * 8. Copy Consumer Key and Consumer Secret
 */


// ============================================================================
// GENERATE APPLICATION PASSWORD
// ============================================================================

/**
 * 1. WordPress Admin → Users → Your Profile
 * 2. Scroll to "Application Passwords"
 * 3. New Application Password Name: "Google Apps Script"
 * 4. Add New Application Password
 * 5. Copy password (shown only once)
 * 6. Format: xxxx xxxx xxxx xxxx xxxx xxxx
 */
