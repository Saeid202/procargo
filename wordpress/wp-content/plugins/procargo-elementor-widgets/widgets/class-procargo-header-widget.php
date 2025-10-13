<?php
/**
 * Header widget.
 *
 * @package ProCargoElementorWidgets
 */

use Elementor\Controls_Manager;
use Elementor\Group_Control_Typography;
use Elementor\Widget_Base;

if ( ! class_exists( 'ProCargo_Elementor_Header_Widget' ) ) {
	class ProCargo_Elementor_Header_Widget extends Widget_Base {

		/**
		 * Get widget unique name.
		 */
		public function get_name() {
			return 'procargo-header';
		}

		/**
		 * Title displayed in Elementor panel.
		 */
		public function get_title() {
			return __( 'ProCargo Header', 'procargo' );
		}

		/**
		 * Icon in Elementor panel.
		 */
		public function get_icon() {
			return 'eicon-nav-menu';
		}

		/**
		 * Associated category.
		 */
		public function get_categories() {
			return array( 'procargo' );
		}

		/**
		 * Retrieve available nav menus.
		 *
		 * @return array
		 */
		protected function get_menu_options() {
			if ( ! function_exists( 'wp_get_nav_menus' ) ) {
				return array();
			}

			$menus   = wp_get_nav_menus();
			$options = array();

			foreach ( $menus as $menu ) {
				$options[ $menu->term_id ] = $menu->name;
			}

			return $options;
		}

		/**
		 * Register widget controls.
		 */
		protected function register_controls() {
			$this->start_controls_section(
				'section_brand',
				array(
					'label' => __( 'Brand', 'procargo' ),
				)
			);

			$this->add_control(
				'logo_image',
				array(
					'label'   => __( 'Logo Image', 'procargo' ),
					'type'    => Controls_Manager::MEDIA,
					'default' => array(),
				)
			);

			$this->add_control(
				'logo_text',
				array(
					'label'       => __( 'Logo Text', 'procargo' ),
					'type'        => Controls_Manager::TEXT,
					'default'     => __( 'ProCargo', 'procargo' ),
					'label_block' => true,
				)
			);

			$this->end_controls_section();

			$this->start_controls_section(
				'section_menu',
				array(
					'label' => __( 'Navigation', 'procargo' ),
				)
			);

			$this->add_control(
				'menu_id',
				array(
					'label'   => __( 'WordPress Menu', 'procargo' ),
					'type'    => Controls_Manager::SELECT,
					'options' => $this->get_menu_options(),
					'default' => '',
				)
			);

			$this->add_control(
				'show_menu_toggle',
				array(
					'label'        => __( 'Enable Mobile Menu Toggle', 'procargo' ),
					'type'         => Controls_Manager::SWITCHER,
					'label_on'     => __( 'Yes', 'procargo' ),
					'label_off'    => __( 'No', 'procargo' ),
					'return_value' => 'yes',
					'default'      => 'yes',
				)
			);

			$this->end_controls_section();

			$this->start_controls_section(
				'section_cta',
				array(
					'label' => __( 'Call To Action', 'procargo' ),
				)
			);

			$this->add_control(
				'cta_text',
				array(
					'label'       => __( 'Button Text', 'procargo' ),
					'type'        => Controls_Manager::TEXT,
					'default'     => __( 'Request a quote', 'procargo' ),
					'label_block' => true,
				)
			);

			$this->add_control(
				'cta_url',
				array(
					'label'       => __( 'Button URL', 'procargo' ),
					'type'        => Controls_Manager::URL,
					'placeholder' => __( 'https://example.com', 'procargo' ),
					'default'     => array(
						'url' => '#contact',
					),
				)
			);

			$this->end_controls_section();

			$this->start_controls_section(
				'section_style',
				array(
					'label' => __( 'Styles', 'procargo' ),
					'tab'   => Controls_Manager::TAB_STYLE,
				)
			);

			$this->add_group_control(
				Group_Control_Typography::get_type(),
				array(
					'name'     => 'menu_typography',
					'label'    => __( 'Menu Typography', 'procargo' ),
					'selector' => '{{WRAPPER}} .procargo-header__menu-list > li > a',
				)
			);

			$this->end_controls_section();
		}

		/**
		 * Render widget output.
		 */
		protected function render() {
			$settings          = $this->get_settings_for_display();
			$logo_image        = $settings['logo_image']['url'] ?? '';
			$logo_alt          = $settings['logo_image']['alt'] ?? '';
			$logo_text         = ! empty( $settings['logo_text'] ) ? $settings['logo_text'] : get_bloginfo( 'name' );
			$menu_id           = ! empty( $settings['menu_id'] ) ? (int) $settings['menu_id'] : 0;
			$cta_text          = $settings['cta_text'] ?? '';
			$cta_url           = $settings['cta_url']['url'] ?? '';
			$cta_target        = ! empty( $settings['cta_url']['is_external'] ) ? ' target="_blank" rel="noopener"' : '';
			$show_menu_toggle  = 'yes' === ( $settings['show_menu_toggle'] ?? 'yes' );
			$is_editor_preview = class_exists( '\Elementor\Plugin' ) && \Elementor\Plugin::$instance->editor->is_edit_mode();

			$menu_markup = '';

			if ( $menu_id ) {
				$menu_markup = wp_nav_menu(
					array(
						'menu'        => $menu_id,
						'container'   => false,
						'menu_class'  => 'procargo-header__menu-list',
						'fallback_cb' => '__return_empty_string',
						'depth'       => 1,
						'echo'        => false,
						'items_wrap'  => '<ul class="%2$s">%3$s</ul>',
						'link_before' => '<span>',
						'link_after'  => '</span>',
					)
				);
			}
			$nav_id = 'procargo-header-menu-' . $this->get_id();
			?>
			<header class="procargo-header">
				<div class="procargo-container procargo-header__inner">
					<div class="procargo-header__brand">
						<a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="procargo-header__brand-link">
							<?php if ( $logo_image ) : ?>
								<img class="procargo-header__logo" src="<?php echo esc_url( $logo_image ); ?>" alt="<?php echo esc_attr( $logo_alt ? $logo_alt : $logo_text ); ?>" />
							<?php endif; ?>
							<?php if ( $logo_text ) : ?>
								<span class="procargo-header__logo-text"><?php echo esc_html( $logo_text ); ?></span>
							<?php endif; ?>
						</a>
					</div>

					<?php if ( $show_menu_toggle ) : ?>
						<button class="procargo-header__toggle" aria-expanded="false" aria-controls="<?php echo esc_attr( $nav_id ); ?>">
							<span class="procargo-header__toggle-line"></span>
							<span class="procargo-header__toggle-line"></span>
							<span class="procargo-header__toggle-line"></span>
							<span class="screen-reader-text"><?php esc_html_e( 'Toggle navigation', 'procargo' ); ?></span>
						</button>
					<?php endif; ?>

					<nav id="<?php echo esc_attr( $nav_id ); ?>" class="procargo-header__nav" aria-label="<?php esc_attr_e( 'Primary menu', 'procargo' ); ?>">
						<?php
						if ( $menu_markup ) {
							echo $menu_markup; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
						} elseif ( $is_editor_preview ) {
							printf(
								'<p class="procargo-header__menu-placeholder">%s</p>',
								esc_html__( 'Select a WordPress menu to display navigation links.', 'procargo' )
							);
						}
						?>
					</nav>

					<?php if ( $cta_text && $cta_url ) : ?>
						<a class="procargo-button procargo-button--primary procargo-header__cta" href="<?php echo esc_url( $cta_url ); ?>"<?php echo $cta_target; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
							<?php echo esc_html( $cta_text ); ?>
						</a>
					<?php endif; ?>
				</div>
			</header>
			<?php
		}
	}
}
