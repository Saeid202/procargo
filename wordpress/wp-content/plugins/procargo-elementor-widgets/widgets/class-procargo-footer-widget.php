<?php
/**
 * Footer widget.
 *
 * @package ProCargoElementorWidgets
 */

use Elementor\Controls_Manager;
use Elementor\Group_Control_Typography;
use Elementor\Repeater;
use Elementor\Widget_Base;

if ( ! class_exists( 'ProCargo_Elementor_Footer_Widget' ) ) {
	class ProCargo_Elementor_Footer_Widget extends Widget_Base {

		/**
		 * Widget machine name.
		 */
		public function get_name() {
			return 'procargo-footer';
		}

		/**
		 * Display title.
		 */
		public function get_title() {
			return __( 'ProCargo Footer', 'procargo' );
		}

		/**
		 * Icon.
		 */
		public function get_icon() {
			return 'eicon-footer';
		}

		/**
		 * Categories.
		 */
		public function get_categories() {
			return array( 'procargo' );
		}

		/**
		 * Register controls.
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
				'brand_text',
				array(
					'label'       => __( 'Brand Text', 'procargo' ),
					'type'        => Controls_Manager::TEXT,
					'default'     => __( 'ProCargo', 'procargo' ),
					'label_block' => true,
				)
			);

			$this->add_control(
				'brand_description',
				array(
					'label'       => __( 'Short Description', 'procargo' ),
					'type'        => Controls_Manager::TEXTAREA,
					'default'     => __( 'Global logistics partner delivering transparency across every route.', 'procargo' ),
					'rows'        => 3,
				)
			);

			$this->end_controls_section();

			$this->start_controls_section(
				'section_columns',
				array(
					'label' => __( 'Footer Columns', 'procargo' ),
				)
			);

			$column_repeater = new Repeater();

			$column_repeater->add_control(
				'column_title',
				array(
					'label'       => __( 'Column Title', 'procargo' ),
					'type'        => Controls_Manager::TEXT,
					'default'     => __( 'Services', 'procargo' ),
					'label_block' => true,
				)
			);

			$column_repeater->add_control(
				'column_content',
				array(
					'label'       => __( 'Column Content', 'procargo' ),
					'type'        => Controls_Manager::WYSIWYG,
					'default'     => "<ul>\n<li>Freight Forwarding</li>\n<li>Customs Brokerage</li>\n<li>Warehouse & Fulfilment</li>\n</ul>",
				)
			);

			$this->add_control(
				'columns',
				array(
					'label'       => __( 'Columns', 'procargo' ),
					'type'        => Controls_Manager::REPEATER,
					'fields'      => $column_repeater->get_controls(),
					'title_field' => '{{{ column_title }}}',
					'default'     => array(
						array(
							'column_title'   => __( 'Services', 'procargo' ),
							'column_content' => "<ul>\n<li>Freight Forwarding</li>\n<li>Customs Brokerage</li>\n<li>Last-mile Delivery</li>\n</ul>",
						),
						array(
							'column_title'   => __( 'Company', 'procargo' ),
							'column_content' => "<ul>\n<li>About</li>\n<li>Careers</li>\n<li>Press</li>\n</ul>",
						),
					),
				)
			);

			$this->end_controls_section();

			$this->start_controls_section(
				'section_bottom',
				array(
					'label' => __( 'Footer Bottom', 'procargo' ),
				)
			);

			$this->add_control(
				'bottom_text',
				array(
					'label'       => __( 'Copyright', 'procargo' ),
					'type'        => Controls_Manager::TEXT,
					'default'     => sprintf(
						/* translators: %s: current year */
						__( '© %s ProCargo. All rights reserved.', 'procargo' ),
						date_i18n( 'Y' )
					),
					'label_block' => true,
				)
			);

			$this->add_control(
				'show_top_border',
				array(
					'label'        => __( 'Show Top Border', 'procargo' ),
					'type'         => Controls_Manager::SWITCHER,
					'return_value' => 'yes',
					'default'      => 'yes',
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
					'name'     => 'column_title_typography',
					'label'    => __( 'Column Title Typography', 'procargo' ),
					'selector' => '{{WRAPPER}} .procargo-footer__column-title',
				)
			);

			$this->end_controls_section();
		}

		/**
		 * Render widget output.
		 */
		protected function render() {
			$settings        = $this->get_settings_for_display();
			$logo_image      = $settings['logo_image']['url'] ?? '';
			$logo_alt        = $settings['logo_image']['alt'] ?? '';
			$brand_text      = $settings['brand_text'] ?? '';
			$description     = $settings['brand_description'] ?? '';
			$columns         = $settings['columns'] ?? array();
			$bottom_text     = $settings['bottom_text'] ?? '';
			$show_top_border = 'yes' === ( $settings['show_top_border'] ?? 'yes' );
			?>
			<footer class="procargo-footer<?php echo $show_top_border ? ' procargo-footer--bordered' : ''; ?>">
				<div class="procargo-container">
					<div class="procargo-footer__top">
						<div class="procargo-footer__brand">
							<?php if ( $logo_image ) : ?>
								<img class="procargo-footer__logo" src="<?php echo esc_url( $logo_image ); ?>" alt="<?php echo esc_attr( $logo_alt ? $logo_alt : $brand_text ); ?>" />
							<?php endif; ?>
							<?php if ( $brand_text ) : ?>
								<h3 class="procargo-footer__brand-name"><?php echo esc_html( $brand_text ); ?></h3>
							<?php endif; ?>
							<?php if ( $description ) : ?>
								<p class="procargo-footer__description">
									<?php echo esc_html( $description ); ?>
								</p>
							<?php endif; ?>
						</div>
						<?php if ( ! empty( $columns ) ) : ?>
							<div class="procargo-footer__columns">
								<?php foreach ( $columns as $column ) : ?>
									<div class="procargo-footer__column">
										<?php if ( ! empty( $column['column_title'] ) ) : ?>
											<h4 class="procargo-footer__column-title">
												<?php echo esc_html( $column['column_title'] ); ?>
											</h4>
										<?php endif; ?>
										<?php if ( ! empty( $column['column_content'] ) ) : ?>
											<div class="procargo-footer__column-content">
												<?php echo wp_kses_post( $column['column_content'] ); ?>
											</div>
										<?php endif; ?>
									</div>
								<?php endforeach; ?>
							</div>
						<?php endif; ?>
					</div>
					<?php if ( $bottom_text ) : ?>
						<div class="procargo-footer__bottom">
							<p><?php echo esc_html( $bottom_text ); ?></p>
						</div>
					<?php endif; ?>
				</div>
			</footer>
			<?php
		}
	}
}
