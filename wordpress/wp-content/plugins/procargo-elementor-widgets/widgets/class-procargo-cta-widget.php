<?php
/**
 * CTA section widget.
 *
 * @package ProCargoElementorWidgets
 */

use Elementor\Controls_Manager;
use Elementor\Widget_Base;

if ( ! class_exists( 'ProCargo_Elementor_CTA_Widget' ) ) {
	class ProCargo_Elementor_CTA_Widget extends Widget_Base {

		/**
		 * Widget unique name.
		 */
		public function get_name() {
			return 'procargo-cta';
		}

		/**
		 * Widget title.
		 */
		public function get_title() {
			return __( 'ProCargo Call to Action', 'procargo' );
		}

		/**
		 * Widget icon.
		 */
		public function get_icon() {
			return 'eicon-button';
		}

		/**
		 * Widget categories.
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
				'title',
				array(
					'label'       => __( 'Title', 'procargo' ),
					'type'        => Controls_Manager::TEXT,
					'default'     => __( 'Unlock intelligent freight management today', 'procargo' ),
					'label_block' => true,
				)
			);

			$this->add_control(
				'subtitle',
				array(
					'label'       => __( 'Subtitle', 'procargo' ),
					'type'        => Controls_Manager::TEXTAREA,
					'default'     => __( 'Talk with our specialists to map a logistics strategy tailored to your routes and cargo.', 'procargo' ),
					'rows'        => 3,
				)
			);

			$this->add_control(
				'primary_button_text',
				array(
					'label'       => __( 'Primary Button Text', 'procargo' ),
					'type'        => Controls_Manager::TEXT,
					'default'     => __( 'Book a consultation', 'procargo' ),
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
					'default'     => __( 'View platform overview', 'procargo' ),
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
						'url' => '#overview',
					),
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
			<section class="procargo-cta">
				<div class="procargo-container">
					<?php if ( ! empty( $settings['title'] ) ) : ?>
						<h2 class="procargo-cta__title">
							<?php echo esc_html( $settings['title'] ); ?>
						</h2>
					<?php endif; ?>
					<?php if ( ! empty( $settings['subtitle'] ) ) : ?>
						<p class="procargo-cta__subtitle">
							<?php echo esc_html( $settings['subtitle'] ); ?>
						</p>
					<?php endif; ?>
					<div class="procargo-cta__actions">
						<?php if ( ! empty( $settings['primary_button_text'] ) && $primary_button_url ) : ?>
							<a class="procargo-button procargo-button--light" href="<?php echo esc_url( $primary_button_url ); ?>"<?php echo $primary_button_target; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
								<?php echo esc_html( $settings['primary_button_text'] ); ?>
							</a>
						<?php endif; ?>
						<?php if ( ! empty( $settings['secondary_button_text'] ) && $secondary_button_url ) : ?>
							<a class="procargo-button procargo-button--ghost-light" href="<?php echo esc_url( $secondary_button_url ); ?>"<?php echo $secondary_button_target; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
								<?php echo esc_html( $settings['secondary_button_text'] ); ?>
							</a>
						<?php endif; ?>
					</div>
				</div>
			</section>
			<?php
		}
	}
}
