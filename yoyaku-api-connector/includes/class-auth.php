<?php
/**
 * Authentication Helper
 * Centralized token management for YOYAKU API endpoints
 *
 * @package YOYAKU_API_Connector
 * @version 2.0.0
 */

defined('ABSPATH') || exit;

class YOYAKU_Auth {

    /**
     * Verify bearer token from wp-config.php
     * Uses constant-time comparison to prevent timing attacks
     *
     * @param string $token Token to verify
     * @return bool True if token is valid
     */
    public static function verify_token($token) {
        if (!defined('YOYAKU_API_BEARER_TOKEN')) {
            error_log('[YOYAKU Auth] YOYAKU_API_BEARER_TOKEN not defined in wp-config.php');
            return false;
        }

        return hash_equals(YOYAKU_API_BEARER_TOKEN, $token);
    }

    /**
     * Extract token from Authorization header
     * Supports both "Bearer TOKEN" and "TOKEN" formats
     *
     * @param string $auth_header Authorization header value
     * @return string|null Extracted token or null if not found
     */
    public static function extract_token($auth_header) {
        if (empty($auth_header)) {
            return null;
        }

        // Handle "Bearer TOKEN" format
        if (preg_match('/Bearer\s+(.*)$/i', $auth_header, $matches)) {
            return trim($matches[1]);
        }

        // Handle direct token (no "Bearer" prefix)
        return trim($auth_header);
    }

    /**
     * Mask token for logging (security)
     * Shows only first 10 characters to prevent token leakage in logs
     *
     * @param string $token Token to mask
     * @return string Masked token
     */
    public static function mask_token($token) {
        if (empty($token)) {
            return 'none';
        }

        $length = strlen($token);
        if ($length <= 10) {
            return str_repeat('*', $length);
        }

        return substr($token, 0, 10) . '...' . substr($token, -3);
    }

    /**
     * Verify request has valid Bearer token
     * For use as permission_callback in register_rest_route
     *
     * @param WP_REST_Request $request Request object
     * @return bool True if authenticated
     */
    public static function verify_request($request) {
        $auth_header = $request->get_header('authorization');
        $token = self::extract_token($auth_header);

        if (!$token) {
            error_log('[YOYAKU Auth] No authorization token provided');
            return false;
        }

        $is_valid = self::verify_token($token);

        if (!$is_valid) {
            error_log('[YOYAKU Auth] Invalid token: ' . self::mask_token($token));
        }

        return $is_valid;
    }
}
