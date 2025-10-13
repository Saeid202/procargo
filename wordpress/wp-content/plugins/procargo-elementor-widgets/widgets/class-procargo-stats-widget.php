<?php
/**
 * Stats section widget.
 *
 * @package ProCargoElementorWidgets
 */

use Elementor\Controls_Manager;
use Elementor\Repeater;
use Elementor\Widget_Base;

if ( ! class_exists( 'ProCargo_Elementor_Stats_Widget' ) ) {
	class ProCargo_Elementor_Stats_Widget extends Widget_Base {

		/**
		 * Widget unique name.
		 */
		public function get_name() {
			return 'procargo-stats';
		}

		/**
		 * Widget label.
		 */
		public function get_title() {
			return __( 'ProCargo Stats', 'procargo' );
		}

		/**
		 * Widget icon.
		 */
		public function get_icon() {
			return 'eicon-counter';
		}

		/**
		 * Widget category.
		 */
		public function get_categories() {
			return array( 'procargo' );
		}

		/**
		 * Register repeater controls.
		 */
		protected function register_controls() {
			$this->start_controls_section(
				'content_section',
				array(
					'label' => __( 'Statistics', 'procargo' ),
				)
			);

			$repeater = new Repeater();

			$repeater->add_control(
				'value',
				array(
					'label'       => __( 'Value', 'procargo' ),
					'type'        => Controls_Manager::TEXT,
					'default'     => __( '24/7', 'procargo' ),
					'label_block' => true,
				)
			);

			$repeater->add_control(
				'label',
				array(
					'label'       => __( 'Label', 'procargo' ),
					'type'        => Controls_Manager::TEXT,
					'default'     => __( 'Support availability', 'procargo' ),
					'label_block' => true,
				)
			);

			$this->add_control(
				'stats',
				array(
					'label'       => __( 'Items', 'procargo' ),
					'type'        => Controls_Manager::REPEATER,
					'fields'      => $repeater->get_controls(),
					'default'     => array(
						array(
							'value' => __( '10k+', 'procargo' ),
							'label' => __( 'Successful shipments', 'procargo' ),
						),
						array(
							'value' => __( '98%', 'procargo' ),
							'label' => __( 'Customer satisfaction', 'procargo' ),
						),
					),
					'title_field' => '{{{ value }}} – {{{ label }}}',
				)
			);

			$this->end_controls_section();
		}

		/**
		 * Render the stats grid.
		 */
		protected function render() {
			$settings = $this->get_settings_for_display();

			if ( empty( $settings['stats'] ) ) {
				return;
			}
			?>
			<section class="procargo-stats" aria-label="<?php esc_attr_e( 'Key company metrics', 'procargo' ); ?>">
				<div class="procargo-container">
					<div class="procargo-stats__grid">
						<?php foreach ( $settings['stats'] as $item ) : ?>
							<div class="procargo-stat">
								<?php if ( ! empty( $item['value'] ) ) : ?>
									<div class="procargo-stat__figure">
										<?php echo esc_html( $item['value'] ); ?>
									</div>
								<?php endif; ?>
								<?php if ( ! empty( $item['label'] ) ) : ?>
									<div class="procargo-stat__label">
										<?php echo esc_html( $item['label'] ); ?>
									</div>
								<?php endif; ?>
							</div>
						<?php endforeach; ?>
					</div>
				</div>
			</section>
			<?php
		}
	}
}
