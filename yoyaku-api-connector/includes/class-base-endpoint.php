<?php
/**
 * Base Endpoint Class
 * Abstract class with common methods for all YOYAKU API endpoints
 *
 * @package YOYAKU_API_Connector
 */

defined('ABSPATH') || exit;

abstract class YOYAKU_Base_Endpoint {

    /**
     * ULTRA-OPTIMIZED: Get complete product data by SKU in single query
     * Replaces: get_product_id_by_sku + get_product_basic_data + all get_custom_field calls
     *
     * Performance: 9 queries → 1 query per product (89% reduction!)
     *
     * @param string $sku Product SKU
     * @param array $meta_keys Array of meta keys to retrieve (default: common fields)
     * @return object|null Complete product data or null if not found
     */
    protected function get_complete_product_data_by_sku($sku, $meta_keys = array()) {
        global $wpdb;

        // Default meta keys if none provided
        if (empty($meta_keys)) {
            $meta_keys = array(
                '_stock',
                '_stock_status',
                '_thumbnail_id',
                '_depot_vente',
                '_initial_quantity',
                '_total_shelves',      // Quantity in units (not _yyd_total_shelf which is EUR amount)
                '_total_preorders'
            );
        }

        // Build CASE statements for each meta key
        $case_statements = array();
        foreach ($meta_keys as $key) {
            $safe_key = esc_sql($key);
            $case_statements[] = "MAX(CASE WHEN pm.meta_key = '{$safe_key}' THEN pm.meta_value END) as `{$safe_key}`";
        }
        $cases = implode(",\n            ", $case_statements);

        // Single mega-query: SKU lookup + post data + all meta fields
        $query = "
            SELECT
                p.ID as product_id,
                p.post_title,
                p.post_status,
                {$cases}
            FROM {$wpdb->postmeta} pm_sku
            INNER JOIN {$wpdb->posts} p ON pm_sku.post_id = p.ID
            LEFT JOIN {$wpdb->postmeta} pm ON p.ID = pm.post_id
            WHERE pm_sku.meta_key = '_sku'
              AND pm_sku.meta_value = %s
              AND p.post_type = 'product'
            GROUP BY p.ID
            LIMIT 1
        ";

        return $wpdb->get_row($wpdb->prepare($query, strtoupper($sku)));
    }

    /**
     * Get product ID by SKU
     * Direct database query - no filters/hooks
     *
     * @param string $sku Product SKU
     * @return int|null Product ID or null if not found
     */
    protected function get_product_id_by_sku($sku) {
        global $wpdb;

        $product_id = $wpdb->get_var($wpdb->prepare(
            "SELECT post_id FROM {$wpdb->postmeta}
             WHERE meta_key = '_sku' AND meta_value = %s
             LIMIT 1",
            strtoupper($sku)
        ));

        return $product_id ? (int)$product_id : null;
    }

    /**
     * Get product basic info
     *
     * @param int $product_id Product ID
     * @return object|null Product data or null
     */
    protected function get_product_basic_data($product_id) {
        global $wpdb;

        return $wpdb->get_row($wpdb->prepare(
            "SELECT post_title, post_name, post_status
             FROM {$wpdb->posts}
             WHERE ID = %d AND post_type = 'product'",
            $product_id
        ));
    }

    /**
     * Get image URL from thumbnail ID
     *
     * @param int $product_id Product ID
     * @return string Image URL or empty string
     */
    protected function get_image_url($product_id) {
        global $wpdb;

        $image_id = $wpdb->get_var($wpdb->prepare(
            "SELECT meta_value FROM {$wpdb->postmeta}
             WHERE post_id = %d AND meta_key = '_thumbnail_id' LIMIT 1",
            $product_id
        ));

        if (!$image_id) {
            return '';
        }

        // Get image URL
        $image_url = wp_get_attachment_url($image_id);
        return $image_url ? $image_url : '';
    }

    /**
     * Get custom field value
     *
     * @param int $product_id Product ID
     * @param string $meta_key Meta key
     * @return string Meta value or empty string
     */
    protected function get_custom_field($product_id, $meta_key) {
        global $wpdb;

        $value = $wpdb->get_var($wpdb->prepare(
            "SELECT meta_value FROM {$wpdb->postmeta}
             WHERE post_id = %d AND meta_key = %s LIMIT 1",
            $product_id,
            $meta_key
        ));

        return $value !== null ? $value : '';
    }

    /**
     * Get stock data
     *
     * @param int $product_id Product ID
     * @return array Stock quantity and status
     */
    protected function get_stock_data($product_id) {
        global $wpdb;

        $stock_quantity = $wpdb->get_var($wpdb->prepare(
            "SELECT meta_value FROM {$wpdb->postmeta}
             WHERE post_id = %d AND meta_key = '_stock' LIMIT 1",
            $product_id
        ));

        $stock_status = $wpdb->get_var($wpdb->prepare(
            "SELECT meta_value FROM {$wpdb->postmeta}
             WHERE post_id = %d AND meta_key = '_stock_status' LIMIT 1",
            $product_id
        ));

        return array(
            'quantity' => $stock_quantity !== null ? (int)$stock_quantity : 0,
            'status' => $stock_status ? $stock_status : 'outofstock'
        );
    }

    /**
     * Get taxonomy terms directly from database
     *
     * @param int $product_id Product ID
     * @param string $taxonomy Taxonomy name
     * @return array Array of term names
     */
    protected function get_terms_direct($product_id, $taxonomy) {
        global $wpdb;

        $terms = $wpdb->get_col($wpdb->prepare(
            "SELECT t.name
             FROM {$wpdb->terms} t
             INNER JOIN {$wpdb->term_taxonomy} tt ON t.term_id = tt.term_id
             INNER JOIN {$wpdb->term_relationships} tr ON tt.term_taxonomy_id = tr.term_taxonomy_id
             WHERE tr.object_id = %d AND tt.taxonomy = %s
             ORDER BY t.name ASC",
            $product_id,
            $taxonomy
        ));

        // Decode HTML entities
        return array_map(function($term) {
            return html_entity_decode($term, ENT_QUOTES, 'UTF-8');
        }, $terms);
    }

    /**
     * Add CORS headers for public access
     */
    protected function add_cors_headers() {
        header('Access-Control-Allow-Origin: *');
        header('Cache-Control: no-cache, must-revalidate, max-age=0');
    }

    /**
     * Abstract method - must be implemented by child classes
     * Register REST API routes
     */
    abstract public function register_routes();
}
