<?php
/**
 * Hero section widget.
 *
 * @package ProCargoElementorWidgets
 */

use Elementor\Controls_Manager;
use Elementor\Group_Control_Background;
use Elementor\Group_Control_Typography;
use Elementor\Widget_Base;

if ( ! class_exists( 'ProCargo_Elementor_Hero_Widget' ) ) {
	class ProCargo_Elementor_Hero_Widget extends Widget_Base {

		/**
		 * Get widget unique name.
		 */
		public function get_name() {
			return 'procargo-hero';
		}

		/**
		 * Get widget title.
		 */
		public function get_title() {
			return __( 'ProCargo Hero', 'procargo' );
		}

		/**
		 * Get widget icon.
		 */
		public function get_icon() {
			return 'eicon-call-to-action';
		}

		/**
		 * Get widget categories.
		 */
		public function get_categories() {
			return array( 'procargo' );
		}

		/**
		 * Register widget controls.
		 */
		protected function register_controls() {
			$this->start_controls_section(
				'content_section',
				array(
					'label' => __( 'Content', 'procargo' ),
				)
			);

			$this->add_control(
				'primary_heading',
				array(
					'label'       => __( 'Primary Heading', 'procargo' ),
					'type'        => Controls_Manager::TEXT,
					'default'     => __( 'Logistics elevated', 'procargo' ),
					'label_block' => true,
				)
			);

			$this->add_control(
				'highlight_heading',
				array(
					'label'       => __( 'Highlight Heading', 'procargo' ),
					'type'        => Controls_Manager::TEXT,
					'default'     => __( 'by ProCargo', 'procargo' ),
					'label_block' => true,
				)
			);

			$this->add_control(
				'subheading',
				array(
					'label'       => __( 'Subheading', 'procargo' ),
					'type'        => Controls_Manager::TEXTAREA,
					'default'     => __( 'Transform the way you manage global shipping with smart tracking and proactive support.', 'procargo' ),
					'rows'        => 4,
				)
			);

			$this->add_control(
				'primary_button_text',
				array(
					'label'       => __( 'Primary Button Text', 'procargo' ),
					'type'        => Controls_Manager::TEXT,
					'default'     => __( 'Get started', 'procargo' ),
					'label_block' => true,
				)
			);

			$this->add_control(
				'primary_button_url',
				array(
					'label'       => __( 'Primary Button URL', 'procargo' ),
					'type'        => Controls_Manager::URL,
					'placeholder' => __( 'https://example.com', 'procargo' ),
					'default'     => array(
						'url' => '#contact',
					),
				)
			);

			$this->add_control(
				'secondary_button_text',
				array(
					'label'       => __( 'Secondary Button Text', 'procargo' ),
					'type'        => Controls_Manager::TEXT,
					'default'     => __( 'Learn more', 'procargo' ),
					'label_block' => true,
				)
			);

			$this->add_control(
				'secondary_button_url',
				array(
					'label'       => __( 'Secondary Button URL', 'procargo' ),
					'type'        => Controls_Manager::URL,
					'placeholder' => __( 'https://example.com', 'procargo' ),
					'default'     => array(
						'url' => '#services',
					),
				)
			);

			$this->end_controls_section();

			$this->start_controls_section(
				'style_section',
				array(
					'label' => __( 'Style', 'procargo' ),
					'tab'   => Controls_Manager::TAB_STYLE,
				)
			);

			$this->add_group_control(
				Group_Control_Typography::get_type(),
				array(
					'name'     => 'heading_typography',
					'label'    => __( 'Heading Typography', 'procargo' ),
					'selector' => '{{WRAPPER}} .procargo-hero__title',
				)
			);

			$this->add_group_control(
				Group_Control_Background::get_type(),
				array(
					'name'     => 'hero_background',
					'label'    => __( 'Background', 'procargo' ),
					'selector' => '{{WRAPPER}} .procargo-hero',
				)
			);

			$this->end_controls_section();
		}

		/**
		 * Render widget output.
		 */
		protected function render() {
			$settings               = $this->get_settings_for_display();
			$primary_button_url     = $settings['primary_button_url']['url'] ?? '';
			$secondary_button_url   = $settings['secondary_button_url']['url'] ?? '';
			$primary_button_target  = ! empty( $settings['primary_button_url']['is_external'] ) ? ' target="_blank" rel="noopener"' : '';
			$secondary_button_target = ! empty( $settings['secondary_button_url']['is_external'] ) ? ' target="_blank" rel="noopener"' : '';
			?>
			<section class="procargo-hero">
				<div class="procargo-hero__overlay" aria-hidden="true"></div>
				<div class="procargo-hero__container">
					<div class="procargo-hero__layout">
						<div class="procargo-hero__content">
							<h1 class="procargo-hero__title">
								<span class="procargo-hero__title-line">
									<?php echo esc_html( $settings['primary_heading'] ); ?>
								</span>
								<span class="procargo-hero__title-highlight">
									<?php echo esc_html( $settings['highlight_heading'] ); ?>
								</span>
							</h1>
							<?php if ( ! empty( $settings['subheading'] ) ) : ?>
								<p class="procargo-hero__subtitle">
									<?php echo esc_html( $settings['subheading'] ); ?>
								</p>
							<?php endif; ?>
							<div class="procargo-hero__actions">
								<?php if ( ! empty( $settings['primary_button_text'] ) && $primary_button_url ) : ?>
									<a class="procargo-button procargo-button--primary" href="<?php echo esc_url( $primary_button_url ); ?>"<?php echo $primary_button_target; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
										<?php echo esc_html( $settings['primary_button_text'] ); ?>
									</a>
								<?php endif; ?>
								<?php if ( ! empty( $settings['secondary_button_text'] ) && $secondary_button_url ) : ?>
									<a class="procargo-button procargo-button--ghost" href="<?php echo esc_url( $secondary_button_url ); ?>"<?php echo $secondary_button_target; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
										<?php echo esc_html( $settings['secondary_button_text'] ); ?>
									</a>
								<?php endif; ?>
							</div>
						</div>
						<div class="procargo-hero__visual" aria-hidden="true">
							<div class="procargo-hero__visual-frame">
								<span class="procargo-hero__visual-glow"></span>
								<span class="procargo-hero__orb procargo-hero__orb--primary"></span>
								<span class="procargo-hero__orb procargo-hero__orb--accent"></span>
								<span class="procargo-hero__pulse procargo-hero__pulse--one"></span>
								<span class="procargo-hero__pulse procargo-hero__pulse--two"></span>
								<span class="procargo-hero__route"></span>
								<span class="procargo-hero__route procargo-hero__route--secondary"></span>
							</div>
						</div>
					</div>
				</div>
			</section>
			<?php
		}
	}
}
