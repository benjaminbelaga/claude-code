<?php
/**
 * YOYAKU Product Importer
 * 
 * Replacement for WP All Import with direct API integration
 * Handles product creation, updates, and deletion from Google Sheets
 * 
 * @package YOYAKU
 * @version 1.0.0
 * @author Benjamin (CTO YOYAKU)
 */

namespace YOYAKU\Import;

class ProductImporter {
    
    /**
     * Google Sheet URL
     */
    const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1L55TCdfJJxZOHyWqx13XKi58pNqNt3wrUm0C4MIs6X4/export?format=csv';
    
    /**
     * Site configurations
     */
    private $site_config;
    
    /**
     * Current site identifier
     */
    private $current_site;
    
    /**
     * Import statistics
     */
    private $stats = [
        'created' => 0,
        'updated' => 0,
        'skipped' => 0,
        'errors' => 0
    ];
    
    /**
     * Constructor
     */
    public function __construct() {
        $this->detect_site();
        $this->load_configuration();
    }
    
    /**
     * Detect current site
     */
    private function detect_site() {
        $site_url = get_site_url();
        
        if (strpos($site_url, 'yoyaku.io') !== false) {
            $this->current_site = 'yoyaku.io';
        } elseif (strpos($site_url, 'yydistribution.fr') !== false) {
            $this->current_site = 'yydistribution.fr';
        } else {
            throw new \Exception('Unknown site: ' . $site_url);
        }
    }
    
    /**
     * Load site-specific configuration
     */
    private function load_configuration() {
        $config_file = __DIR__ . '/wp-import-api-config.json';
        
        if (!file_exists($config_file)) {
            throw new \Exception('Configuration file not found');
        }
        
        $config = json_decode(file_get_contents($config_file), true);
        $this->site_config = $config['sites'][$this->current_site];
    }
    
    /**
     * Execute import by ID
     * 
     * @param string $import_id Import configuration ID
     * @return array Import results
     */
    public function execute_import($import_id) {
        if (!isset($this->site_config['imports'][$import_id])) {
            throw new \Exception('Import configuration not found: ' . $import_id);
        }
        
        $import_config = $this->site_config['imports'][$import_id];
        
        if (!$import_config['enabled']) {
            return ['status' => 'error', 'message' => 'Import is disabled'];
        }
        
        // Fetch Google Sheet data
        $csv_data = $this->fetch_csv_data();
        
        if (empty($csv_data)) {
            return ['status' => 'error', 'message' => 'No data found in Google Sheet'];
        }
        
        // Process based on import type
        switch ($import_config['type']) {
            case 'create_product':
                return $this->process_product_creation($csv_data, $import_config);
                
            case 'create_product_preorder':
                return $this->process_preorder_creation($csv_data, $import_config);
                
            case 'update_stock':
                return $this->process_stock_update($csv_data, $import_config);
                
            case 'update_picking':
                return $this->process_picking_update($csv_data, $import_config);
                
            case 'update_release_date':
                return $this->process_release_date_update($csv_data, $import_config);
                
            case 'delete_products':
                return $this->process_product_deletion($csv_data, $import_config);
                
            default:
                return ['status' => 'error', 'message' => 'Unknown import type: ' . $import_config['type']];
        }
    }
    
    /**
     * Fetch CSV data from Google Sheets
     */
    private function fetch_csv_data() {
        $response = wp_remote_get(self::SHEET_URL, [
            'timeout' => 30,
            'sslverify' => false
        ]);
        
        if (is_wp_error($response)) {
            throw new \Exception('Failed to fetch Google Sheet: ' . $response->get_error_message());
        }
        
        $csv_content = wp_remote_retrieve_body($response);
        
        // Parse CSV
        $lines = explode("\n", $csv_content);
        $headers = str_getcsv(array_shift($lines));
        
        $data = [];
        foreach ($lines as $line) {
            if (empty(trim($line))) continue;
            
            $row = str_getcsv($line);
            $row_data = [];
            
            foreach ($headers as $index => $header) {
                $row_data[$header] = isset($row[$index]) ? $row[$index] : '';
            }
            
            $data[] = $row_data;
        }
        
        return $data;
    }
    
    /**
     * Process product creation
     */
    private function process_product_creation($csv_data, $config) {
        foreach ($csv_data as $row) {
            try {
                // Check if product exists
                $existing_product = $this->find_product_by_sku($row['sku']);
                
                if ($existing_product && !$config['update_existing']) {
                    $this->stats['skipped']++;
                    continue;
                }
                
                // Prepare product data
                $product_data = $this->prepare_product_data($row, $config);
                
                if ($existing_product) {
                    // Update existing product
                    $this->update_product($existing_product->ID, $product_data);
                    $this->stats['updated']++;
                } else {
                    // Create new product
                    $this->create_product($product_data);
                    $this->stats['created']++;
                }
                
            } catch (\Exception $e) {
                $this->log_error('Product creation failed for SKU ' . $row['sku'] . ': ' . $e->getMessage());
                $this->stats['errors']++;
            }
        }
        
        return [
            'status' => 'success',
            'stats' => $this->stats
        ];
    }
    
    /**
     * Process pre-order product creation
     */
    private function process_preorder_creation($csv_data, $config) {
        // Similar to product creation but with pre-order fields
        $base_config = $config;
        
        // Merge base import if specified
        if (isset($config['base_import'])) {
            $base_config = array_merge(
                $this->site_config['imports'][$config['base_import']],
                $config['differences']
            );
        }
        
        // Add pre-order specific fields
        $base_config['custom_fields']['_is_pre_order'] = 'yes';
        $base_config['custom_fields']['_pre_order_date'] = '{release_date}';
        
        return $this->process_product_creation($csv_data, $base_config);
    }
    
    /**
     * Process stock update
     */
    private function process_stock_update($csv_data, $config) {
        foreach ($csv_data as $row) {
            try {
                $product = $this->find_product_by_sku($row['sku']);
                
                if (!$product) {
                    $this->stats['skipped']++;
                    continue;
                }
                
                // Update stock
                update_post_meta($product->ID, '_stock', $row['quantity']);
                
                // Update stock status
                $stock_status = ($row['quantity'] > 0) ? 'instock' : 'outofstock';
                update_post_meta($product->ID, '_stock_status', $stock_status);
                
                // Clear transients
                wc_delete_product_transients($product->ID);
                
                $this->stats['updated']++;
                
            } catch (\Exception $e) {
                $this->log_error('Stock update failed for SKU ' . $row['sku'] . ': ' . $e->getMessage());
                $this->stats['errors']++;
            }
        }
        
        return [
            'status' => 'success',
            'stats' => $this->stats
        ];
    }
    
    /**
     * Process picking location update
     */
    private function process_picking_update($csv_data, $config) {
        foreach ($csv_data as $row) {
            try {
                $product = $this->find_product_by_sku($row['sku']);
                
                if (!$product) {
                    $this->stats['skipped']++;
                    continue;
                }
                
                // Update picking locations
                if (!empty($row['picking1'])) {
                    update_post_meta($product->ID, '_picking_location_1', $row['picking1']);
                }
                
                if (!empty($row['picking2'])) {
                    update_post_meta($product->ID, '_picking_location_2', $row['picking2']);
                }
                
                $this->stats['updated']++;
                
            } catch (\Exception $e) {
                $this->log_error('Picking update failed for SKU ' . $row['sku'] . ': ' . $e->getMessage());
                $this->stats['errors']++;
            }
        }
        
        return [
            'status' => 'success',
            'stats' => $this->stats
        ];
    }
    
    /**
     * Process release date update
     */
    private function process_release_date_update($csv_data, $config) {
        foreach ($csv_data as $row) {
            try {
                $product = $this->find_product_by_sku($row['sku']);
                
                if (!$product) {
                    $this->stats['skipped']++;
                    continue;
                }
                
                // Update release dates
                update_post_meta($product->ID, '_pre_order_date', $row['release_date']);
                
                if ($this->current_site === 'yydistribution.fr') {
                    update_post_meta($product->ID, '_date_out', $row['release_date']);
                }
                
                $this->stats['updated']++;
                
            } catch (\Exception $e) {
                $this->log_error('Release date update failed for SKU ' . $row['sku'] . ': ' . $e->getMessage());
                $this->stats['errors']++;
            }
        }
        
        return [
            'status' => 'success',
            'stats' => $this->stats
        ];
    }
    
    /**
     * Process product deletion
     */
    private function process_product_deletion($csv_data, $config) {
        foreach ($csv_data as $row) {
            try {
                $product = $this->find_product_by_sku($row['sku']);
                
                if (!$product) {
                    $this->stats['skipped']++;
                    continue;
                }
                
                // Move to trash or permanently delete
                if ($config['action'] === 'trash') {
                    wp_trash_post($product->ID);
                } else {
                    wp_delete_post($product->ID, true);
                }
                
                $this->stats['updated']++;
                
            } catch (\Exception $e) {
                $this->log_error('Product deletion failed for SKU ' . $row['sku'] . ': ' . $e->getMessage());
                $this->stats['errors']++;
            }
        }
        
        return [
            'status' => 'success',
            'stats' => $this->stats
        ];
    }
    
    /**
     * Find product by SKU
     */
    private function find_product_by_sku($sku) {
        global $wpdb;
        
        // HPOS compatible query
        $product_id = $wpdb->get_var($wpdb->prepare(
            "SELECT post_id FROM {$wpdb->postmeta} 
             WHERE meta_key = '_sku' AND meta_value = %s 
             LIMIT 1",
            $sku
        ));
        
        if ($product_id) {
            return get_post($product_id);
        }
        
        return null;
    }
    
    /**
     * Prepare product data from CSV row
     */
    private function prepare_product_data($row, $config) {
        $product_data = [
            'post_type' => 'product',
            'post_status' => 'publish',
            'post_title' => $this->parse_template($config['product_fields']['title'], $row),
            'post_content' => $this->parse_template($config['product_fields']['description'] ?? '', $row),
            'meta_input' => []
        ];
        
        // Add SKU
        $product_data['meta_input']['_sku'] = $this->parse_template($config['product_fields']['sku'], $row);
        
        // Add prices
        $product_data['meta_input']['_regular_price'] = $this->parse_template($config['product_fields']['regular_price'], $row);
        $product_data['meta_input']['_price'] = $product_data['meta_input']['_regular_price'];
        
        // Add stock
        if (isset($config['product_fields']['stock_quantity'])) {
            $product_data['meta_input']['_stock'] = $this->parse_template($config['product_fields']['stock_quantity'], $row);
            $product_data['meta_input']['_manage_stock'] = 'yes';
        }
        
        // Add custom fields
        if (isset($config['custom_fields'])) {
            foreach ($config['custom_fields'] as $field_name => $field_value) {
                $product_data['meta_input'][$field_name] = $this->parse_template($field_value, $row);
            }
        }
        
        // Add taxonomies
        if (isset($config['taxonomies'])) {
            $product_data['tax_input'] = $this->prepare_taxonomies($config['taxonomies'], $row);
        }
        
        return $product_data;
    }
    
    /**
     * Parse template string with row data
     */
    private function parse_template($template, $row) {
        if (empty($template)) {
            return '';
        }
        
        // Replace placeholders like {sku}, {title}, etc.
        preg_match_all('/\{([^}]+)\}/', $template, $matches);
        
        foreach ($matches[1] as $placeholder) {
            $value = isset($row[$placeholder]) ? $row[$placeholder] : '';
            $template = str_replace('{' . $placeholder . '}', $value, $template);
        }
        
        return $template;
    }
    
    /**
     * Prepare taxonomies from configuration
     */
    private function prepare_taxonomies($taxonomies_config, $row) {
        $tax_input = [];
        
        foreach ($taxonomies_config as $taxonomy => $config) {
            $value = $this->parse_template($config['value'], $row);
            
            if ($config['type'] === 'multiple') {
                // Split by delimiter
                $terms = explode($config['delimiter'] ?? ',', $value);
                $terms = array_map('trim', $terms);
                $terms = array_filter($terms); // Remove empty values
                $tax_input[$taxonomy] = $terms;
            } else {
                // Single term
                $tax_input[$taxonomy] = [$value];
            }
        }
        
        return $tax_input;
    }
    
    /**
     * Create new product
     */
    private function create_product($product_data) {
        $product_id = wp_insert_post($product_data);
        
        if (is_wp_error($product_id)) {
            throw new \Exception($product_id->get_error_message());
        }
        
        // Set product type
        wp_set_object_terms($product_id, 'simple', 'product_type');
        
        // Clear caches
        wc_delete_product_transients($product_id);
        
        return $product_id;
    }
    
    /**
     * Update existing product
     */
    private function update_product($product_id, $product_data) {
        $product_data['ID'] = $product_id;
        
        $result = wp_update_post($product_data);
        
        if (is_wp_error($result)) {
            throw new \Exception($result->get_error_message());
        }
        
        // Clear caches
        wc_delete_product_transients($product_id);
        
        return $product_id;
    }
    
    /**
     * Log error message
     */
    private function log_error($message) {
        error_log('[YOYAKU Import] ' . $message);
        
        // Optionally send email notification
        if (defined('YOYAKU_IMPORT_ERROR_EMAIL')) {
            wp_mail(
                YOYAKU_IMPORT_ERROR_EMAIL,
                'YOYAKU Import Error',
                $message
            );
        }
    }
}

// Usage example:
/*
$importer = new \YOYAKU\Import\ProductImporter();

// Execute new product import (852)
$result = $importer->execute_import('852');

// Execute stock update (803)
$result = $importer->execute_import('803');

// Execute picking update (775)
$result = $importer->execute_import('775');
*/