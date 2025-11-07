<?php
/**
 * Plugin Name: YOYAKU API Connector
 * Plugin URI: https://github.com/benjaminbelaga/yoyaku-api-connector
 * Description: Centralized REST API endpoints for Google Apps Scripts integration - Ultra-fast direct database queries
 * Version: 2.2.0
 * Author: Benjamin Belaga
 * Author URI: https://yoyaku.io
 * License: GPL-2.0+
 * Text Domain: yoyaku-api-connector
 *
 * @package YOYAKU_API_Connector
 */

defined('ABSPATH') || exit;

// Plugin constants
define('YOYAKU_API_VERSION', '2.2.0');
define('YOYAKU_API_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('YOYAKU_API_PLUGIN_URL', plugin_dir_url(__FILE__));

/**
 * Autoloader for plugin classes
 */
spl_autoload_register(function($class) {
    // Only autoload YOYAKU classes
    if (strpos($class, 'YOYAKU_') !== 0) {
        return;
    }

    // Convert class name to file path
    // YOYAKU_Base_Endpoint → class-base-endpoint.php
    $class_file = 'class-' . strtolower(str_replace('_', '-', str_replace('YOYAKU_', '', $class))) . '.php';
    $file_path = YOYAKU_API_PLUGIN_DIR . 'includes/' . $class_file;

    if (file_exists($file_path)) {
        require_once $file_path;
    }
});

/**
 * Initialize plugin endpoints
 * Using init hook instead of plugins_loaded to ensure REST API is available
 */
add_action('init', function() {
    // v1 endpoints - Legacy support (READ-ONLY)
    // Initialize Product Stock Data endpoint (for wp-import-dashboard)
    if (class_exists('YOYAKU_Product_Stock_Endpoint')) {
        new YOYAKU_Product_Stock_Endpoint();
    }

    // Supply Products endpoint (for Supply Dashboard - ultra-optimized!)
    if (class_exists('YOYAKU_Supply_Products_Endpoint')) {
        new YOYAKU_Supply_Products_Endpoint();
    }

    // Stock Targeted endpoint with backorders gating (16-20x speedup)
    if (class_exists('YOYAKU_Stock_Targeted_Endpoint')) {
        new YOYAKU_Stock_Targeted_Endpoint();
    }

    // v2 endpoints - New architecture with authentication (READ + WRITE)
    // Product Creation endpoint (for Google Apps Script product creation)
    if (class_exists('YOYAKU_Product_Creation_Endpoint')) {
        new YOYAKU_Product_Creation_Endpoint();
    }
}, 10);

/**
 * Activation hook
 */
register_activation_hook(__FILE__, function() {
    // Flush rewrite rules to register REST routes
    flush_rewrite_rules();

    // Check for Bearer token configuration
    if (!defined('YOYAKU_API_BEARER_TOKEN')) {
        // Show admin notice about missing token
        add_action('admin_notices', function() {
            echo '<div class="notice notice-warning is-dismissible">';
            echo '<p><strong>YOYAKU API Connector:</strong> Please add YOYAKU_API_BEARER_TOKEN to your wp-config.php for authentication.</p>';
            echo '</div>';
        });
    }
});

/**
 * Deactivation hook
 */
register_deactivation_hook(__FILE__, function() {
    // Clean up
    flush_rewrite_rules();
});
