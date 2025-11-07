<?php
/**
 * Product Creation Endpoint
 * Ultra-optimized endpoint for creating products from Google Apps Script
 * Supports both YOYAKU.IO (B2C) and YYD.FR (B2B) with different configurations
 *
 * @package YOYAKU_API_Connector
 * @version 2.3.0
 * @changelog 2.3.0 - Complete B2B compliance with WP All Import #935
 *            - Added slug=SKU for YYD (instead of formatted slug)
 *            - Added release_date, playlist_files, features parameters
 *            - Added _pre_order_stock_status, _pre_order_date, _date_out
 *            - Added shipping class 1231 for YYD
 *            - Added all UPS customs fields (HS codes, origin, invoice)
 *            - Added playlist files handling (_yyd_playlist_files_raw/_yoyaku_playlist_files_raw)
 *            - Added product features support (_product_features)
 */

defined('ABSPATH') || exit;

class YOYAKU_Product_Creation_Endpoint extends YOYAKU_Base_Endpoint {

    public function __construct() {
        add_action('rest_api_init', array($this, 'register_routes'));
    }

    /**
     * Register REST API routes
     */
    public function register_routes() {
        // Create or update product
        register_rest_route('yoyaku/v2', '/product/create', array(
            'methods' => 'POST',
            'callback' => array($this, 'create_product'),
            'permission_callback' => array('YOYAKU_Auth', 'verify_request'),
            'args' => $this->get_create_args_schema()
        ));

        // Batch create products
        register_rest_route('yoyaku/v2', '/products/batch-create', array(
            'methods' => 'POST',
            'callback' => array($this, 'batch_create_products'),
            'permission_callback' => array('YOYAKU_Auth', 'verify_request'),
            'args' => array(
                'products' => array(
                    'required' => true,
                    'type' => 'array',
                    'description' => 'Array of product data objects'
                ),
                'site' => array(
                    'required' => false,
                    'type' => 'string',
                    'default' => 'yoyaku',
                    'enum' => array('yoyaku', 'yyd')
                )
            )
        ));
    }

    /**
     * Get product creation arguments schema
     */
    private function get_create_args_schema() {
        return array(
            'site' => array(
                'required' => false,
                'type' => 'string',
                'default' => 'yoyaku',
                'enum' => array('yoyaku', 'yyd'),
                'description' => 'Target site (yoyaku = YOYAKU.IO, yyd = YYD.FR)'
            ),
            'sku' => array(
                'required' => true,
                'type' => 'string',
                'sanitize_callback' => function($value) { return strtoupper($value); },
                'description' => 'Product SKU (unique identifier)'
            ),
            'title' => array(
                'required' => true,
                'type' => 'string',
                'sanitize_callback' => function($value) { return sanitize_text_field($value); },
                'description' => 'Product title'
            ),
            'slug' => array(
                'required' => false,
                'type' => 'string',
                'sanitize_callback' => function($value) { return sanitize_title($value); },
                'description' => 'Product slug (auto-generated if empty)'
            ),
            'description' => array(
                'required' => false,
                'type' => 'string',
                'sanitize_callback' => function($value) { return wp_kses_post($value); },
                'description' => 'Product description'
            ),
            'price' => array(
                'required' => true,
                'type' => 'number',
                'description' => 'Product price (B2C for yoyaku, B2B for yyd)'
            ),
            'weight' => array(
                'required' => false,
                'type' => 'number',
                'default' => 0.2,
                'description' => 'Product weight in kg'
            ),
            'stock_quantity' => array(
                'required' => false,
                'type' => 'integer',
                'default' => 0,
                'description' => 'Stock quantity'
            ),
            'stock_status' => array(
                'required' => false,
                'type' => 'string',
                'default' => 'outofstock',
                'enum' => array('instock', 'outofstock', 'onbackorder'),
                'description' => 'Stock status'
            ),
            'category' => array(
                'required' => false,
                'type' => 'string',
                'description' => 'Category name (yoyaku: "Forthcoming", yyd: label name)'
            ),
            'tags' => array(
                'required' => false,
                'type' => 'array',
                'description' => 'Array of tag names'
            ),
            'images' => array(
                'required' => false,
                'type' => 'array',
                'description' => 'Array of image URLs'
            ),
            'artists' => array(
                'required' => false,
                'type' => 'array',
                'description' => 'Array of artist names (musicartist taxonomy)'
            ),
            'label' => array(
                'required' => false,
                'type' => 'string',
                'description' => 'Label name (musiclabel taxonomy)'
            ),
            'genres' => array(
                'required' => false,
                'type' => 'array',
                'description' => 'Array of genre names (musicstyle taxonomy)'
            ),
            'distributor' => array(
                'required' => false,
                'type' => 'string',
                'description' => 'Distributor name (distributormusic/ownermusic taxonomy)'
            ),
            'format' => array(
                'required' => false,
                'type' => 'string',
                'description' => 'Format (musicformat taxonomy for YYD only)'
            ),
            'release_date' => array(
                'required' => false,
                'type' => 'string',
                'description' => 'Release date (used for _pre_order_date, _date_out, _coming_soon_label)'
            ),
            'playlist_files' => array(
                'required' => false,
                'type' => 'string',
                'description' => 'Playlist files (used for _yoyaku_playlist_files_raw or _yyd_playlist_files_raw)'
            ),
            'features' => array(
                'required' => false,
                'type' => 'string',
                'sanitize_callback' => 'sanitize_text_field',
                'description' => 'Product features (_product_features meta field)'
            ),
            'meta_data' => array(
                'required' => false,
                'type' => 'object',
                'description' => 'Custom meta fields as key-value pairs'
            )
        );
    }

    /**
     * Create or update product
     *
     * @param WP_REST_Request $request Request object
     * @return WP_REST_Response Response
     */
    public function create_product($request) {
        global $wpdb;

        $start_time = microtime(true);
        $site = $request['site'];
        $sku = strtoupper($request['sku']);

        try {
            // Check if product exists
            $existing_id = $this->get_product_id_by_sku($sku);

            if ($existing_id) {
                // Update existing product
                $product_id = $this->update_product($existing_id, $request);
                $action = 'updated';
            } else {
                // Create new product
                $product_id = $this->insert_product($request);
                $action = 'created';
            }

            // Set category
            if (!empty($request['category'])) {
                $this->set_product_category($product_id, $request['category']);
            }

            // Set tags
            if (!empty($request['tags']) && is_array($request['tags'])) {
                $this->set_product_tags($product_id, $request['tags']);
            }

            // Set images
            if (!empty($request['images']) && is_array($request['images'])) {
                $this->set_product_images($product_id, $request['images']);
            }

            // Set custom taxonomies
            $this->set_custom_taxonomies($product_id, $request, $site);

            // Set custom meta data
            if (!empty($request['meta_data']) && is_object($request['meta_data'])) {
                $this->set_custom_meta($product_id, $request['meta_data']);
            }

            // Clear caches
            clean_post_cache($product_id);
            wp_cache_delete('product_' . $product_id, 'posts');

            $execution_time = round((microtime(true) - $start_time) * 1000, 2);

            return new WP_REST_Response(array(
                'success' => true,
                'action' => $action,
                'product_id' => $product_id,
                'sku' => $sku,
                'url' => get_permalink($product_id),
                'execution_time_ms' => $execution_time,
                'site' => $site
            ), $action === 'created' ? 201 : 200);

        } catch (Exception $e) {
            return new WP_REST_Response(array(
                'success' => false,
                'error' => $e->getMessage(),
                'sku' => $sku,
                'site' => $site
            ), 500);
        }
    }

    /**
     * Batch create products
     *
     * @param WP_REST_Request $request Request object
     * @return WP_REST_Response Response
     */
    public function batch_create_products($request) {
        $products = $request['products'];
        $site = $request['site'];
        $results = array();

        foreach ($products as $product_data) {
            // Add site to product data
            $product_data['site'] = $site;

            // Create WP_REST_Request for each product
            $product_request = new WP_REST_Request('POST', '/yoyaku/v2/product/create');
            $product_request->set_body_params($product_data);

            // Create product
            $response = $this->create_product($product_request);
            $results[] = $response->get_data();
        }

        // Count successes and failures
        $successes = count(array_filter($results, function($r) {
            return $r['success'] === true;
        }));
        $failures = count($results) - $successes;

        return new WP_REST_Response(array(
            'batch_complete' => true,
            'total' => count($results),
            'successes' => $successes,
            'failures' => $failures,
            'results' => $results
        ), 200);
    }

    /**
     * Insert new product into database
     *
     * @param WP_REST_Request $request Request data
     * @return int Product ID
     */
    private function insert_product($request) {
        global $wpdb;

        $sku = strtoupper($request['sku']);
        $title = sanitize_text_field($request['title']);
        $site = $request['site'];

        // YYD B2B: slug = SKU (matching WP All Import #935)
        // YOYAKU B2C: slug = formatted slug or title-sku
        if ($site === 'yyd') {
            $slug = strtolower($sku);
        } else {
            $slug = !empty($request['slug']) ? sanitize_title($request['slug']) : sanitize_title($title . '-' . $sku);
        }

        $description = !empty($request['description']) ? wp_kses_post($request['description']) : '';
        $price = floatval($request['price']);
        $weight = !empty($request['weight']) ? floatval($request['weight']) : 0.2;
        $stock_qty = !empty($request['stock_quantity']) ? intval($request['stock_quantity']) : 0;
        $stock_status = !empty($request['stock_status']) ? $request['stock_status'] : 'outofstock';

        // Insert post
        $post_data = array(
            'post_title' => $title,
            'post_name' => $slug,
            'post_content' => $description,
            'post_status' => 'publish',
            'post_type' => 'product',
            'post_author' => 1
        );

        $product_id = wp_insert_post($post_data);

        if (is_wp_error($product_id)) {
            throw new Exception('Failed to create product: ' . $product_id->get_error_message());
        }

        // Set product meta (direct SQL for speed)
        $meta_data = array(
            '_sku' => $sku,
            '_price' => $price,
            '_regular_price' => $price,
            '_weight' => $weight,
            '_stock' => $stock_qty,
            '_stock_status' => $stock_status,
            '_manage_stock' => 'yes',
            '_visibility' => 'visible',
            '_featured' => 'no',
            '_virtual' => 'no',
            '_downloadable' => 'no',
            '_sold_individually' => 'no',
            '_backorders' => $site === 'yyd' ? 'yes' : 'no',
            '_width' => '30',
            '_height' => '30',
            '_length' => '0.2',
        );

        // Add site-specific meta
        if ($site === 'yyd') {
            // B2B-specific meta fields (matching WP All Import #935)
            $meta_data['_is_pre_order'] = 'yes';
            $meta_data['_low_stock_amount'] = '10';
            $meta_data['_pre_order_stock_status'] = 'global';

            // Release date fields
            if (!empty($request['release_date'])) {
                $meta_data['_pre_order_date'] = sanitize_text_field($request['release_date']);
                $meta_data['_date_out'] = sanitize_text_field($request['release_date']);
            }

            // Playlist files
            if (!empty($request['playlist_files'])) {
                $meta_data['_yyd_playlist_files_raw'] = sanitize_text_field($request['playlist_files']);
            }

            // Product features
            if (!empty($request['features'])) {
                $meta_data['_product_features'] = sanitize_text_field($request['features']);
            }

            // UPS customs fields (hardcoded for vinyl records)
            $meta_data['hscode_custom_field'] = '8523801000';
            $meta_data['_product_origin_country'] = 'FR';
            $meta_data['ph_ups_invoice_desc'] = 'Phonograph records (vinyl), non-blank';
            $meta_data['_ph_ups_hst_var'] = '8523801000';
            $meta_data['_wf_ups_hst'] = '8523801000';

        } else {
            // B2C-specific meta fields (YOYAKU.IO)
            $meta_data['_set_coming_soon'] = 'yes';

            // Release date field
            if (!empty($request['release_date'])) {
                $meta_data['_coming_soon_label'] = sanitize_text_field($request['release_date']);
            }

            // Playlist files
            if (!empty($request['playlist_files'])) {
                $meta_data['_yoyaku_playlist_files_raw'] = sanitize_text_field($request['playlist_files']);
            }

            // Product features
            if (!empty($request['features'])) {
                $meta_data['_product_features'] = sanitize_text_field($request['features']);
            }
        }

        foreach ($meta_data as $key => $value) {
            update_post_meta($product_id, $key, $value);
        }

        // Set shipping class for YYD (ID 1231)
        if ($site === 'yyd') {
            wp_set_object_terms($product_id, 1231, 'product_shipping_class');
        }

        return $product_id;
    }

    /**
     * Update existing product
     *
     * @param int $product_id Product ID
     * @param WP_REST_Request $request Request data
     * @return int Product ID
     */
    private function update_product($product_id, $request) {
        global $wpdb;

        $title = sanitize_text_field($request['title']);
        $slug = !empty($request['slug']) ? sanitize_title($request['slug']) : null;
        $description = !empty($request['description']) ? wp_kses_post($request['description']) : null;

        // Update post
        $post_data = array(
            'ID' => $product_id,
            'post_title' => $title
        );

        if ($slug) {
            $post_data['post_name'] = $slug;
        }

        if ($description) {
            $post_data['post_content'] = $description;
        }

        wp_update_post($post_data);

        // Update meta
        if (!empty($request['price'])) {
            $price = floatval($request['price']);
            update_post_meta($product_id, '_price', $price);
            update_post_meta($product_id, '_regular_price', $price);
        }

        if (!empty($request['weight'])) {
            update_post_meta($product_id, '_weight', floatval($request['weight']));
        }

        if (isset($request['stock_quantity'])) {
            update_post_meta($product_id, '_stock', intval($request['stock_quantity']));
        }

        if (!empty($request['stock_status'])) {
            update_post_meta($product_id, '_stock_status', $request['stock_status']);
        }

        return $product_id;
    }

    /**
     * Set product category
     *
     * @param int $product_id Product ID
     * @param string $category_name Category name
     */
    private function set_product_category($product_id, $category_name) {
        $term = term_exists($category_name, 'product_cat');

        if (!$term) {
            $term = wp_insert_term($category_name, 'product_cat');
        }

        if (!is_wp_error($term)) {
            $term_id = is_array($term) ? $term['term_id'] : $term;
            wp_set_object_terms($product_id, array($term_id), 'product_cat');
        }
    }

    /**
     * Set product tags
     *
     * @param int $product_id Product ID
     * @param array $tags Array of tag names
     */
    private function set_product_tags($product_id, $tags) {
        $tag_ids = array();

        foreach ($tags as $tag_name) {
            if (empty($tag_name)) continue;

            $term = term_exists($tag_name, 'product_tag');

            if (!$term) {
                $term = wp_insert_term($tag_name, 'product_tag');
            }

            if (!is_wp_error($term)) {
                $tag_ids[] = is_array($term) ? $term['term_id'] : $term;
            }
        }

        if (!empty($tag_ids)) {
            wp_set_object_terms($product_id, $tag_ids, 'product_tag');
        }
    }

    /**
     * Set product images from URLs
     *
     * @param int $product_id Product ID
     * @param array $image_urls Array of image URLs
     */
    private function set_product_images($product_id, $image_urls) {
        require_once(ABSPATH . 'wp-admin/includes/media.php');
        require_once(ABSPATH . 'wp-admin/includes/file.php');
        require_once(ABSPATH . 'wp-admin/includes/image.php');

        $image_ids = array();

        foreach ($image_urls as $index => $image_url) {
            if (empty($image_url)) continue;

            // Download image
            $temp_file = download_url($image_url);

            if (is_wp_error($temp_file)) {
                continue;
            }

            // Prepare image data
            $file_array = array(
                'name' => basename($image_url),
                'tmp_name' => $temp_file
            );

            // Upload image
            $attachment_id = media_handle_sideload($file_array, $product_id);

            if (is_wp_error($attachment_id)) {
                @unlink($temp_file);
                continue;
            }

            $image_ids[] = $attachment_id;
        }

        // Set featured image (first one)
        if (!empty($image_ids)) {
            set_post_thumbnail($product_id, $image_ids[0]);

            // Set gallery (all except first)
            if (count($image_ids) > 1) {
                $gallery_ids = array_slice($image_ids, 1);
                update_post_meta($product_id, '_product_image_gallery', implode(',', $gallery_ids));
            }
        }
    }

    /**
     * Set custom taxonomies based on site
     *
     * @param int $product_id Product ID
     * @param WP_REST_Request $request Request data
     * @param string $site Site identifier
     */
    private function set_custom_taxonomies($product_id, $request, $site) {
        // Artists (both sites)
        if (!empty($request['artists']) && is_array($request['artists'])) {
            $this->set_taxonomy_terms($product_id, 'musicartist', $request['artists']);
        }

        // Label (both sites)
        if (!empty($request['label'])) {
            $this->set_taxonomy_terms($product_id, 'musiclabel', array($request['label']));
        }

        // Genres (both sites)
        if (!empty($request['genres']) && is_array($request['genres'])) {
            $this->set_taxonomy_terms($product_id, 'musicstyle', $request['genres']);
        }

        // Distributor (site-specific taxonomy name)
        if (!empty($request['distributor'])) {
            $distributor_taxonomy = $site === 'yyd' ? 'ownermusic' : 'distributormusic';
            $this->set_taxonomy_terms($product_id, $distributor_taxonomy, array($request['distributor']));
        }

        // Format (YYD only)
        if ($site === 'yyd' && !empty($request['format'])) {
            $this->set_taxonomy_terms($product_id, 'musicformat', array($request['format']));
        }
    }

    /**
     * Set taxonomy terms for a product
     *
     * @param int $product_id Product ID
     * @param string $taxonomy Taxonomy name
     * @param array $term_names Array of term names
     */
    private function set_taxonomy_terms($product_id, $taxonomy, $term_names) {
        $term_ids = array();

        foreach ($term_names as $term_name) {
            if (empty($term_name)) continue;

            $term = term_exists($term_name, $taxonomy);

            if (!$term) {
                $term = wp_insert_term($term_name, $taxonomy);
            }

            if (!is_wp_error($term)) {
                $term_ids[] = is_array($term) ? $term['term_id'] : $term;
            }
        }

        if (!empty($term_ids)) {
            wp_set_object_terms($product_id, $term_ids, $taxonomy);
        }
    }

    /**
     * Set custom meta data
     *
     * @param int $product_id Product ID
     * @param object $meta_data Meta data object
     */
    private function set_custom_meta($product_id, $meta_data) {
        foreach ($meta_data as $key => $value) {
            // Ensure key starts with underscore for private meta
            $meta_key = (strpos($key, '_') === 0) ? $key : '_' . $key;
            update_post_meta($product_id, $meta_key, $value);
        }
    }
}
