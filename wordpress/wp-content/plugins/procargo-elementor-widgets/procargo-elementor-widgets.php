<?php
/**
 * Plugin Name: ProCargo Elementor Widgets
 * Description: Custom Elementor widgets for the ProCargo landing page sections.
 * Version: 1.0.0
 * Author: ProCargo
 *
 * @package ProCargoElementorWidgets
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'PROCARGO_ELEMENTOR_WIDGETS_PATH', plugin_dir_path( __FILE__ ) );
define( 'PROCARGO_ELEMENTOR_WIDGETS_URL', plugin_dir_url( __FILE__ ) );

final class ProCargo_Elementor_Widgets_Plugin {

	/**
	 * Bootstraps plugin hooks.
	 */
	public function __construct() {
		add_action( 'plugins_loaded', array( $this, 'init' ) );
	}

	/**
	 * Initialise plugin once Elementor is available.
	 */
	public function init() {
		if ( ! did_action( 'elementor/loaded' ) ) {
			add_action( 'admin_notices', array( $this, 'missing_elementor_notice' ) );
			return;
		}

		add_action( 'elementor/widgets/register', array( $this, 'register_widgets' ) );
		add_action( 'elementor/elements/categories_registered', array( $this, 'register_category' ) );
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_styles' ) );
	}

	/**
	 * Register the ProCargo widget category.
	 *
	 * @param \Elementor\Elements_Manager $elements_manager Manager instance.
	 */
	public function register_category( $elements_manager ) {
		$elements_manager->add_category(
			'procargo',
			array(
				'title' => __( 'ProCargo', 'procargo' ),
				'icon'  => 'fa fa-ship',
			)
		);
	}

	/**
	 * Register all widgets with Elementor.
	 *
	 * @param \Elementor\Widgets_Manager $widgets_manager Widgets manager.
	 */
	public function register_widgets( $widgets_manager ) {
		require_once PROCARGO_ELEMENTOR_WIDGETS_PATH . 'widgets/class-procargo-header-widget.php';
		require_once PROCARGO_ELEMENTOR_WIDGETS_PATH . 'widgets/class-procargo-hero-widget.php';
		require_once PROCARGO_ELEMENTOR_WIDGETS_PATH . 'widgets/class-procargo-stats-widget.php';
		require_once PROCARGO_ELEMENTOR_WIDGETS_PATH . 'widgets/class-procargo-services-widget.php';
		require_once PROCARGO_ELEMENTOR_WIDGETS_PATH . 'widgets/class-procargo-features-widget.php';
		require_once PROCARGO_ELEMENTOR_WIDGETS_PATH . 'widgets/class-procargo-cta-widget.php';
		require_once PROCARGO_ELEMENTOR_WIDGETS_PATH . 'widgets/class-procargo-footer-widget.php';

		$widgets_manager->register( new \ProCargo_Elementor_Header_Widget() );
		$widgets_manager->register( new \ProCargo_Elementor_Hero_Widget() );
		$widgets_manager->register( new \ProCargo_Elementor_Stats_Widget() );
		$widgets_manager->register( new \ProCargo_Elementor_Services_Widget() );
		$widgets_manager->register( new \ProCargo_Elementor_Features_Widget() );
		$widgets_manager->register( new \ProCargo_Elementor_CTA_Widget() );
		$widgets_manager->register( new \ProCargo_Elementor_Footer_Widget() );
	}

	/**
	 * Enqueue the front-end stylesheet for the widgets.
	 */
	public function enqueue_styles() {
		wp_enqueue_style(
			'procargo-elementor-widgets',
			PROCARGO_ELEMENTOR_WIDGETS_URL . 'assets/css/procargo-elementor-widgets.css',
			array(),
			'1.0.0'
		);
		wp_enqueue_script(
			'procargo-elementor-widgets',
			PROCARGO_ELEMENTOR_WIDGETS_URL . 'assets/js/procargo-elementor-widgets.js',
			array(),
			'1.0.0',
			true
		);
	}

	/**
	 * Show admin notice if Elementor is missing.
	 */
	public function missing_elementor_notice() {
		if ( isset( $_GET['activate'] ) ) { // phpcs:ignore WordPress.Security
			unset( $_GET['activate'] ); // phpcs:ignore WordPress.Security
		}

		printf(
			'<div class="notice notice-warning is-dismissible"><p>%s</p></div>',
			esc_html__( 'ProCargo Elementor Widgets requires Elementor to be installed and activated.', 'procargo' )
		);
	}
}

new ProCargo_Elementor_Widgets_Plugin();
