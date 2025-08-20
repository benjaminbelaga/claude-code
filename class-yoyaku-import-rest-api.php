<?php
/**
 * YOYAKU Import REST API
 * 
 * REST API endpoints for product import operations
 * Replaces WP All Import with direct API integration
 * 
 * @package YOYAKU
 * @version 1.0.0
 * @author Benjamin (CTO YOYAKU)
 */

namespace YOYAKU\Import;

class ImportRestAPI {
    
    /**
     * Namespace for API endpoints
     */
    const API_NAMESPACE = 'yoyaku/v1';
    
    /**
     * Constructor - Register routes
     */
    public function __construct() {
        add_action('rest_api_init', [$this, 'register_routes']);
    }
    
    /**
     * Register REST API routes
     */
    public function register_routes() {
        // Product creation endpoint
        register_rest_route(self::API_NAMESPACE, '/products/create', [
            'methods' => 'POST',
            'callback' => [$this, 'create_products'],
            'permission_callback' => [$this, 'check_permissions'],
            'args' => $this->get_product_args()
        ]);
        
        // Stock update endpoint
        register_rest_route(self::API_NAMESPACE, '/products/update-stock', [
            'methods' => 'POST',
            'callback' => [$this, 'update_stock'],
            'permission_callback' => [$this, 'check_permissions'],
            'args' => [
                'sku' => [
                    'required' => true,
                    'type' => 'string',
                    'sanitize_callback' => 'sanitize_text_field'
                ],
                'quantity' => [
                    'required' => true,
                    'type' => 'integer',
                    'minimum' => 0
                ]
            ]
        ]);
        
        // Picking update endpoint
        register_rest_route(self::API_NAMESPACE, '/products/update-picking', [
            'methods' => 'POST',
            'callback' => [$this, 'update_picking'],
            'permission_callback' => [$this, 'check_permissions'],
            'args' => [
                'sku' => [
                    'required' => true,
                    'type' => 'string',
                    'sanitize_callback' => 'sanitize_text_field'
                ],
                'picking1' => [
                    'type' => 'string',
                    'sanitize_callback' => 'sanitize_text_field'
                ],
                'picking2' => [
                    'type' => 'string',
                    'sanitize_callback' => 'sanitize_text_field'
                ]
            ]
        ]);
        
        // Release date update endpoint
        register_rest_route(self::API_NAMESPACE, '/products/update-release', [
            'methods' => 'POST',
            'callback' => [$this, 'update_release_date'],
            'permission_callback' => [$this, 'check_permissions'],
            'args' => [
                'sku' => [
                    'required' => true,
                    'type' => 'string',
                    'sanitize_callback' => 'sanitize_text_field'
                ],
                'release_date' => [
                    'required' => true,
                    'type' => 'string',
                    'format' => 'date',
                    'sanitize_callback' => 'sanitize_text_field'
                ]
            ]
        ]);
        
        // Product deletion endpoint
        register_rest_route(self::API_NAMESPACE, '/products/delete', [
            'methods' => 'POST',
            'callback' => [$this, 'delete_products'],
            'permission_callback' => [$this, 'check_permissions'],
            'args' => [
                'sku' => [
                    'required' => true,
                    'type' => 'string',
                    'sanitize_callback' => 'sanitize_text_field'
                ],
                'permanent' => [
                    'type' => 'boolean',
                    'default' => false
                ]
            ]
        ]);
        
        // Batch import endpoint
        register_rest_route(self::API_NAMESPACE, '/import/batch', [
            'methods' => 'POST',
            'callback' => [$this, 'batch_import'],
            'permission_callback' => [$this, 'check_permissions'],
            'args' => [
                'import_id' => [
                    'required' => true,
                    'type' => 'string',
                    'enum' => ['852', '717', '803', '775', '810', '935', '953', '941']
                ],
                'data' => [
                    'required' => true,
                    'type' => 'array'
                ]
            ]
        ]);
        
        // Import from Google Sheets endpoint
        register_rest_route(self::API_NAMESPACE, '/import/google-sheets', [
            'methods' => 'POST',
            'callback' => [$this, 'import_from_sheets'],
            'permission_callback' => [$this, 'check_permissions'],
            'args' => [
                'import_id' => [
                    'required' => true,
                    'type' => 'string',
                    'enum' => ['852', '717', '803', '775', '810', '935', '953', '941']
                ]
            ]
        ]);
        
        // Import status endpoint
        register_rest_route(self::API_NAMESPACE, '/import/status', [
            'methods' => 'GET',
            'callback' => [$this, 'get_import_status'],
            'permission_callback' => [$this, 'check_permissions']
        ]);
    }
    
    /**
     * Check permissions for API access
     */
    public function check_permissions($request) {
        // Check for API key in header
        $api_key = $request->get_header('X-YOYAKU-API-KEY');
        
        if ($api_key && $this->validate_api_key($api_key)) {
            return true;
        }
        
        // Check for WordPress user capability
        return current_user_can('manage_woocommerce');
    }
    
    /**
     * Validate API key
     */
    private function validate_api_key($api_key) {
        $valid_keys = get_option('yoyaku_api_keys', []);
        return in_array($api_key, $valid_keys);
    }
    
    /**
     * Get product arguments for validation
     */
    private function get_product_args() {
        return [
            'sku' => [
                'required' => true,
                'type' => 'string',
                'sanitize_callback' => 'sanitize_text_field'
            ],
            'title' => [
                'required' => true,
                'type' => 'string',
                'sanitize_callback' => 'sanitize_text_field'
            ],
            'description' => [
                'type' => 'string',
                'sanitize_callback' => 'wp_kses_post'
            ],
            'price' => [
                'required' => true,
                'type' => 'number',
                'minimum' => 0
            ],
            'quantity' => [
                'type' => 'integer',
                'minimum' => 0,
                'default' => 0
            ],
            'weight' => [
                'type' => 'number',
                'minimum' => 0
            ],
            'format' => [
                'type' => 'string',
                'sanitize_callback' => 'sanitize_text_field'
            ],
            'label' => [
                'type' => 'string',
                'sanitize_callback' => 'sanitize_text_field'
            ],
            'distributor' => [
                'type' => 'string',
                'sanitize_callback' => 'sanitize_text_field'
            ],
            'release_date' => [
                'type' => 'string',
                'format' => 'date',
                'sanitize_callback' => 'sanitize_text_field'
            ],
            'artists' => [
                'type' => 'array',
                'items' => [
                    'type' => 'string',
                    'sanitize_callback' => 'sanitize_text_field'
                ]
            ],
            'genres' => [
                'type' => 'array',
                'items' => [
                    'type' => 'string',
                    'sanitize_callback' => 'sanitize_text_field'
                ]
            ],
            'tags' => [
                'type' => 'array',
                'items' => [
                    'type' => 'string',
                    'sanitize_callback' => 'sanitize_text_field'
                ]
            ],
            'is_preorder' => [
                'type' => 'boolean',
                'default' => false
            ]
        ];
    }
    
    /**
     * Create products endpoint handler
     */
    public function create_products($request) {
        try {
            $params = $request->get_params();
            
            // Check if product exists
            $existing_product = wc_get_product_id_by_sku($params['sku']);
            
            if ($existing_product) {
                return new \WP_REST_Response([
                    'status' => 'error',
                    'message' => 'Product with SKU already exists',
                    'product_id' => $existing_product
                ], 400);
            }
            
            // Create product
            $product = new \WC_Product_Simple();
            
            // Set basic properties
            $product->set_name($params['title']);
            $product->set_sku($params['sku']);
            $product->set_regular_price($params['price']);
            $product->set_description($params['description'] ?? '');
            $product->set_stock_quantity($params['quantity'] ?? 0);
            $product->set_manage_stock(true);
            $product->set_weight($params['weight'] ?? '');
            
            // Set stock status
            $stock_status = ($params['quantity'] > 0) ? 'instock' : 'outofstock';
            $product->set_stock_status($stock_status);
            
            // Save product
            $product_id = $product->save();
            
            // Add custom fields
            $this->add_custom_fields($product_id, $params);
            
            // Add taxonomies
            $this->add_taxonomies($product_id, $params);
            
            // Handle pre-order
            if (!empty($params['is_preorder'])) {
                update_post_meta($product_id, '_is_pre_order', 'yes');
                update_post_meta($product_id, '_pre_order_date', $params['release_date']);
            }
            
            return new \WP_REST_Response([
                'status' => 'success',
                'message' => 'Product created successfully',
                'product_id' => $product_id,
                'sku' => $params['sku']
            ], 201);
            
        } catch (\Exception $e) {
            return new \WP_REST_Response([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Update stock endpoint handler
     */
    public function update_stock($request) {
        try {
            $params = $request->get_params();
            
            // Find product by SKU
            $product_id = wc_get_product_id_by_sku($params['sku']);
            
            if (!$product_id) {
                return new \WP_REST_Response([
                    'status' => 'error',
                    'message' => 'Product not found'
                ], 404);
            }
            
            $product = wc_get_product($product_id);
            
            // Update stock
            $product->set_stock_quantity($params['quantity']);
            $product->set_manage_stock(true);
            
            // Update stock status
            $stock_status = ($params['quantity'] > 0) ? 'instock' : 'outofstock';
            $product->set_stock_status($stock_status);
            
            $product->save();
            
            // Clear caches
            wc_delete_product_transients($product_id);
            
            return new \WP_REST_Response([
                'status' => 'success',
                'message' => 'Stock updated successfully',
                'product_id' => $product_id,
                'sku' => $params['sku'],
                'new_quantity' => $params['quantity']
            ], 200);
            
        } catch (\Exception $e) {
            return new \WP_REST_Response([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Update picking locations endpoint handler
     */
    public function update_picking($request) {
        try {
            $params = $request->get_params();
            
            // Find product by SKU
            $product_id = wc_get_product_id_by_sku($params['sku']);
            
            if (!$product_id) {
                return new \WP_REST_Response([
                    'status' => 'error',
                    'message' => 'Product not found'
                ], 404);
            }
            
            // Update picking locations
            if (isset($params['picking1'])) {
                update_post_meta($product_id, '_picking_location_1', $params['picking1']);
            }
            
            if (isset($params['picking2'])) {
                update_post_meta($product_id, '_picking_location_2', $params['picking2']);
            }
            
            return new \WP_REST_Response([
                'status' => 'success',
                'message' => 'Picking locations updated successfully',
                'product_id' => $product_id,
                'sku' => $params['sku']
            ], 200);
            
        } catch (\Exception $e) {
            return new \WP_REST_Response([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Update release date endpoint handler
     */
    public function update_release_date($request) {
        try {
            $params = $request->get_params();
            
            // Find product by SKU
            $product_id = wc_get_product_id_by_sku($params['sku']);
            
            if (!$product_id) {
                return new \WP_REST_Response([
                    'status' => 'error',
                    'message' => 'Product not found'
                ], 404);
            }
            
            // Update release date
            update_post_meta($product_id, '_pre_order_date', $params['release_date']);
            update_post_meta($product_id, '_coming_soon_label', $params['release_date']);
            
            // YYDistribution specific
            if (strpos(get_site_url(), 'yydistribution.fr') !== false) {
                update_post_meta($product_id, '_date_out', $params['release_date']);
            }
            
            return new \WP_REST_Response([
                'status' => 'success',
                'message' => 'Release date updated successfully',
                'product_id' => $product_id,
                'sku' => $params['sku'],
                'release_date' => $params['release_date']
            ], 200);
            
        } catch (\Exception $e) {
            return new \WP_REST_Response([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Delete products endpoint handler
     */
    public function delete_products($request) {
        try {
            $params = $request->get_params();
            
            // Find product by SKU
            $product_id = wc_get_product_id_by_sku($params['sku']);
            
            if (!$product_id) {
                return new \WP_REST_Response([
                    'status' => 'error',
                    'message' => 'Product not found'
                ], 404);
            }
            
            // Delete product
            if ($params['permanent']) {
                wp_delete_post($product_id, true);
                $message = 'Product permanently deleted';
            } else {
                wp_trash_post($product_id);
                $message = 'Product moved to trash';
            }
            
            return new \WP_REST_Response([
                'status' => 'success',
                'message' => $message,
                'product_id' => $product_id,
                'sku' => $params['sku']
            ], 200);
            
        } catch (\Exception $e) {
            return new \WP_REST_Response([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Batch import endpoint handler
     */
    public function batch_import($request) {
        try {
            $params = $request->get_params();
            $import_id = $params['import_id'];
            $data = $params['data'];
            
            $importer = new ProductImporter();
            $stats = [
                'created' => 0,
                'updated' => 0,
                'skipped' => 0,
                'errors' => 0
            ];
            
            foreach ($data as $row) {
                try {
                    // Process based on import type
                    $result = $this->process_single_import($import_id, $row);
                    
                    if ($result['status'] === 'created') {
                        $stats['created']++;
                    } elseif ($result['status'] === 'updated') {
                        $stats['updated']++;
                    } elseif ($result['status'] === 'skipped') {
                        $stats['skipped']++;
                    }
                    
                } catch (\Exception $e) {
                    $stats['errors']++;
                }
            }
            
            return new \WP_REST_Response([
                'status' => 'success',
                'stats' => $stats
            ], 200);
            
        } catch (\Exception $e) {
            return new \WP_REST_Response([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Import from Google Sheets endpoint handler
     */
    public function import_from_sheets($request) {
        try {
            $params = $request->get_params();
            $import_id = $params['import_id'];
            
            $importer = new ProductImporter();
            $result = $importer->execute_import($import_id);
            
            return new \WP_REST_Response($result, 200);
            
        } catch (\Exception $e) {
            return new \WP_REST_Response([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Get import status endpoint handler
     */
    public function get_import_status($request) {
        $status = get_option('yoyaku_import_status', []);
        
        return new \WP_REST_Response([
            'status' => 'success',
            'data' => $status
        ], 200);
    }
    
    /**
     * Add custom fields to product
     */
    private function add_custom_fields($product_id, $params) {
        $site_url = get_site_url();
        
        // Common custom fields
        update_post_meta($product_id, '_ph_ups_manufacture_country', 'FR');
        update_post_meta($product_id, '_wf_ups_hst', '85238010');
        update_post_meta($product_id, 'ph_ups_invoice_desc', 'Vinyl record or Phonograph record');
        update_post_meta($product_id, 'hscode_custom_field', '85238010');
        update_post_meta($product_id, '_product_origin_country', 'FR');
        
        // Site-specific fields
        if (strpos($site_url, 'yoyaku.io') !== false) {
            update_post_meta($product_id, '_music_formats', $params['format'] ?? '');
            update_post_meta($product_id, '_coming_soon_label', $params['release_date'] ?? '');
            update_post_meta($product_id, '_set_coming_soon', 'yes');
        } else {
            update_post_meta($product_id, '_low_stock_amount', '10');
            update_post_meta($product_id, '_pre_order_stock_status', 'global');
        }
    }
    
    /**
     * Add taxonomies to product
     */
    private function add_taxonomies($product_id, $params) {
        $site_url = get_site_url();
        
        if (strpos($site_url, 'yoyaku.io') !== false) {
            // YOYAKU.IO taxonomies
            if (!empty($params['label'])) {
                wp_set_object_terms($product_id, $params['label'], 'musiclabel');
            }
            
            if (!empty($params['distributor'])) {
                wp_set_object_terms($product_id, $params['distributor'], 'distributormusic');
            }
            
            wp_set_object_terms($product_id, 'Forthcoming', 'product_cat');
            
        } else {
            // YYDistribution taxonomies
            if (!empty($params['label'])) {
                wp_set_object_terms($product_id, $params['label'], 'product_cat');
            }
            
            if (!empty($params['format'])) {
                wp_set_object_terms($product_id, $params['format'], 'musicformat');
            }
            
            if (!empty($params['distributor'])) {
                wp_set_object_terms($product_id, $params['distributor'], 'ownermusic');
            }
        }
        
        // Common taxonomies
        if (!empty($params['artists'])) {
            wp_set_object_terms($product_id, $params['artists'], 'musicartist');
        }
        
        if (!empty($params['genres'])) {
            wp_set_object_terms($product_id, $params['genres'], 'musicstyle');
        }
        
        if (!empty($params['tags'])) {
            wp_set_object_terms($product_id, $params['tags'], 'product_tag');
        }
    }
    
    /**
     * Process single import based on type
     */
    private function process_single_import($import_id, $row) {
        // Implementation based on import type
        // This would use the configuration to process each row
        return ['status' => 'success'];
    }
}

// Initialize REST API
new ImportRestAPI();