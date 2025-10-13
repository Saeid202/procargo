<?php
/**
 * Features section widget.
 *
 * @package ProCargoElementorWidgets
 */

use Elementor\Controls_Manager;
use Elementor\Repeater;
use Elementor\Widget_Base;

if ( ! class_exists( 'ProCargo_Elementor_Features_Widget' ) ) {
	class ProCargo_Elementor_Features_Widget extends Widget_Base {

		/**
		 * Get widget name.
		 */
		public function get_name() {
			return 'procargo-features';
		}

		/**
		 * Get widget title.
		 */
		public function get_title() {
			return __( 'ProCargo Features', 'procargo' );
		}

		/**
		 * Get widget icon.
		 */
		public function get_icon() {
			return 'eicon-featured-image';
		}

		/**
		 * Get categories.
		 */
		public function get_categories() {
			return array( 'procargo' );
		}

		/**
		 * Register controls.
		 */
		protected function register_controls() {
			$this->start_controls_section(
				'section_heading',
				array(
					'label' => __( 'Section Heading', 'procargo' ),
				)
			);

			$this->add_control(
				'heading',
				array(
					'label'       => __( 'Heading', 'procargo' ),
					'type'        => Controls_Manager::TEXT,
					'default'     => __( 'Why shippers choose ProCargo', 'procargo' ),
					'label_block' => true,
				)
			);

			$this->add_control(
				'subheading',
				array(
					'label'       => __( 'Subheading', 'procargo' ),
					'type'        => Controls_Manager::TEXTAREA,
					'default'     => __( 'Stay ahead of every milestone with actionable data and logistics experts on demand.', 'procargo' ),
					'rows'        => 3,
				)
			);

			$this->end_controls_section();

			$this->start_controls_section(
				'section_features',
				array(
					'label' => __( 'Feature List', 'procargo' ),
				)
			);

			$repeater = new Repeater();

			$repeater->add_control(
				'title',
				array(
					'label'       => __( 'Title', 'procargo' ),
					'type'        => Controls_Manager::TEXT,
					'default'     => __( 'Predictive shipment tracking', 'procargo' ),
					'label_block' => true,
				)
			);

			$repeater->add_control(
				'description',
				array(
					'label'       => __( 'Description', 'procargo' ),
					'type'        => Controls_Manager::TEXTAREA,
					'default'     => __( 'Automatic alerts surface risks before they impact your supply chain.', 'procargo' ),
					'rows'        => 4,
				)
			);

			$this->add_control(
				'features',
				array(
					'label'       => __( 'Features', 'procargo' ),
					'type'        => Controls_Manager::REPEATER,
					'fields'      => $repeater->get_controls(),
					'title_field' => '{{{ title }}}',
					'default'     => array(
						array(
							'title'       => __( 'Predictive shipment tracking', 'procargo' ),
							'description' => __( 'Automatic alerts surface risks before they impact your supply chain.', 'procargo' ),
						),
						array(
							'title'       => __( 'Collaborative workspace', 'procargo' ),
							'description' => __( 'Share shipment timelines and tasks with internal teams and partners.', 'procargo' ),
						),
						array(
							'title'       => __( 'Analytics dashboards', 'procargo' ),
							'description' => __( 'Benchmark carrier performance with accessible shipment insights.', 'procargo' ),
						),
					),
				)
			);

			$this->end_controls_section();

			$this->start_controls_section(
				'section_cta',
				array(
					'label' => __( 'Side CTA', 'procargo' ),
				)
			);

			$this->add_control(
				'cta_title',
				array(
					'label'       => __( 'CTA Title', 'procargo' ),
					'type'        => Controls_Manager::TEXT,
					'default'     => __( 'Ready to level-up your logistics?', 'procargo' ),
					'label_block' => true,
				)
			);

			$this->add_control(
				'cta_subtitle',
				array(
					'label'       => __( 'CTA Subtitle', 'procargo' ),
					'type'        => Controls_Manager::TEXTAREA,
					'default'     => __( 'Book a strategy session with a ProCargo specialist to map your ideal route.', 'procargo' ),
					'rows'        => 3,
				)
			);

			$this->add_control(
				'cta_button_text',
				array(
					'label'       => __( 'CTA Button Text', 'procargo' ),
					'type'        => Controls_Manager::TEXT,
					'default'     => __( 'Schedule a call', 'procargo' ),
					'label_block' => true,
				)
			);

			$this->add_control(
				'cta_button_url',
				array(
					'label'       => __( 'CTA Button URL', 'procargo' ),
					'type'        => Controls_Manager::URL,
					'default'     => array(
						'url' => '#contact',
					),
					'placeholder' => __( 'https://example.com', 'procargo' ),
				)
			);

			$this->end_controls_section();
		}

		/**
		 * Render widget output.
		 */
		protected function render() {
			$settings           = $this->get_settings_for_display();
			$cta_button_url     = $settings['cta_button_url']['url'] ?? '';
			$cta_button_target  = ! empty( $settings['cta_button_url']['is_external'] ) ? ' target="_blank" rel="noopener"' : '';
			?>
			<section class="procargo-features">
				<div class="procargo-container procargo-features__grid">
					<div class="procargo-section-heading procargo-section-heading--left">
						<?php if ( ! empty( $settings['heading'] ) ) : ?>
							<h2 class="procargo-section-heading__title">
								<?php echo esc_html( $settings['heading'] ); ?>
							</h2>
						<?php endif; ?>
						<?php if ( ! empty( $settings['subheading'] ) ) : ?>
							<p class="procargo-section-heading__subtitle">
								<?php echo esc_html( $settings['subheading'] ); ?>
							</p>
						<?php endif; ?>
						<?php if ( ! empty( $settings['features'] ) ) : ?>
							<div class="procargo-feature-list">
								<?php foreach ( $settings['features'] as $feature ) : ?>
									<div class="procargo-feature">
										<div>
											<?php if ( ! empty( $feature['title'] ) ) : ?>
												<h3 class="procargo-feature__title">
													<?php echo esc_html( $feature['title'] ); ?>
												</h3>
											<?php endif; ?>
											<?php if ( ! empty( $feature['description'] ) ) : ?>
												<p class="procargo-feature__description">
													<?php echo esc_html( $feature['description'] ); ?>
												</p>
											<?php endif; ?>
										</div>
									</div>
								<?php endforeach; ?>
							</div>
						<?php endif; ?>
					</div>
					<aside class="procargo-feature-cta">
						<div class="procargo-feature-cta__inner">
							<?php if ( ! empty( $settings['cta_title'] ) ) : ?>
								<h3 class="procargo-feature-cta__title">
									<?php echo esc_html( $settings['cta_title'] ); ?>
								</h3>
							<?php endif; ?>
							<?php if ( ! empty( $settings['cta_subtitle'] ) ) : ?>
								<p class="procargo-feature-cta__subtitle">
									<?php echo esc_html( $settings['cta_subtitle'] ); ?>
								</p>
							<?php endif; ?>
							<?php if ( ! empty( $settings['cta_button_text'] ) && $cta_button_url ) : ?>
								<a class="procargo-button procargo-button--primary procargo-button--wide" href="<?php echo esc_url( $cta_button_url ); ?>"<?php echo $cta_button_target; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
									<?php echo esc_html( $settings['cta_button_text'] ); ?>
								</a>
							<?php endif; ?>
						</div>
					</aside>
				</div>
			</section>
			<?php
		}
	}
}
