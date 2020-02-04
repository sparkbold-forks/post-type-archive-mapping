<?php
/**
 * Blocks Initializer
 *
 * Enqueue CSS/JS of all the blocks.
 *
 * @since 3.3.0
 * @package Post Type Archive Mapping
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Register route for getting taxonomy terms
 *
 * @since 1.0.0
 */
function ptam_custom_posts_advanced_register_route() {
	register_rest_route(
		'ptam/v3',
		'/get_terms',
		array(
			'methods'  => 'POST',
			'callback' => 'ptam_get_all_terms',
		)
	);
	register_rest_route(
		'ptam/v3',
		'/get_posts',
		array(
			'methods'  => 'POST',
			'callback' => 'ptam_get_posts',
		)
	);

	register_rest_route(
		'ptam/v3',
		'/get_taxonomies',
		array(
			'methods'  => 'POST',
			'callback' => 'ptam_get_taxonomies',
		)
	);
}
add_action( 'rest_api_init', 'ptam_custom_posts_advanced_register_route' );
