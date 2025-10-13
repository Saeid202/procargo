<?php
/**
 * Services section widget.
 *
 * @package ProCargoElementorWidgets
 */

use Elementor\Controls_Manager;
use Elementor\Group_Control_Typography;
use Elementor\Repeater;
use Elementor\Widget_Base;

if ( ! class_exists( 'ProCargo_Elementor_Services_Widget' ) ) {
	class ProCargo_Elementor_Services_Widget extends Widget_Base {

		/**
		 * Widget unique name.
		 */
		public function get_name() {
			return 'procargo-services';
		}

		/**
		 * Widget title.
		 */
		public function get_title() {
			return __( 'ProCargo Services', 'procargo' );
		}

		/**
		 * Widget icon.
		 */
		public function get_icon() {
			return 'eicon-bullet-list';
		}

		/**
		 * Widget categories.
		 */
		public function get_categories() {
			return array( 'procargo' );
		}

		/**
		 * Registers controls.
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
					'default'     => __( 'Logistics services built for scale', 'procargo' ),
					'label_block' => true,
				)
			);

			$this->add_control(
				'subheading',
				array(
					'label'       => __( 'Subheading', 'procargo' ),
					'type'        => Controls_Manager::TEXTAREA,
					'default'     => __( 'Centralise international freight, customs brokerage, and inland logistics with a single team.', 'procargo' ),
					'rows'        => 3,
				)
			);

			$this->end_controls_section();

			$this->start_controls_section(
				'section_cards',
				array(
					'label' => __( 'Service Cards', 'procargo' ),
				)
			);

			$repeater = new Repeater();

			$repeater->add_control(
				'title',
				array(
					'label'       => __( 'Title', 'procargo' ),
					'type'        => Controls_Manager::TEXT,
					'default'     => __( 'Global Freight Forwarding', 'procargo' ),
					'label_block' => true,
				)
			);

			$repeater->add_control(
				'description',
				array(
					'label'       => __( 'Description', 'procargo' ),
					'type'        => Controls_Manager::TEXTAREA,
					'default'     => __( 'Door-to-door management across sea, air, and rail with proactive status updates.', 'procargo' ),
					'rows'        => 4,
				)
			);

			$repeater->add_control(
				'list_items',
				array(
					'label'       => __( 'Bullet Items', 'procargo' ),
					'type'        => Controls_Manager::TEXTAREA,
					'default'     => "Import & export compliance\nReal-time shipment tracking\nDedicated account managers",
					'description' => __( 'Add one benefit per line.', 'procargo' ),
					'rows'        => 5,
				)
			);

			$this->add_control(
				'services',
				array(
					'label'       => __( 'Services', 'procargo' ),
					'type'        => Controls_Manager::REPEATER,
					'fields'      => $repeater->get_controls(),
					'title_field' => '{{{ title }}}',
					'default'     => array(
						array(
							'title'       => __( 'Global Freight Forwarding', 'procargo' ),
							'description' => __( 'Door-to-door management across sea, air, and rail with proactive status updates.', 'procargo' ),
							'list_items'  => "Import & export compliance\nReal-time shipment tracking\nDedicated account managers",
						),
						array(
							'title'       => __( 'Customs Brokerage', 'procargo' ),
							'description' => __( 'Navigate regulations with on-the-ground experts in key trade hubs.', 'procargo' ),
							'list_items'  => "Electronic filings\nTariff strategy support\nBonded warehouse access",
						),
						array(
							'title'       => __( 'Inland & Last-mile', 'procargo' ),
							'description' => __( 'Connect port arrivals to final destinations with multi-modal partners.', 'procargo' ),
							'list_items'  => "Drayage coordination\nFulfilment centre routing\nTime-definite delivery options",
						),
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
					'name'     => 'card_title_typography',
					'label'    => __( 'Card Title Typography', 'procargo' ),
					'selector' => '{{WRAPPER}} .procargo-card__title',
				)
			);

			$this->end_controls_section();
		}

		/**
		 * Render widget.
		 */
		protected function render() {
			$settings = $this->get_settings_for_display();
			?>
			<section class="procargo-services">
				<div class="procargo-container">
					<div class="procargo-section-heading">
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
					</div>
					<?php if ( ! empty( $settings['services'] ) ) : ?>
						<div class="procargo-card-grid">
							<?php foreach ( $settings['services'] as $service ) : ?>
								<article class="procargo-card">
									<?php if ( ! empty( $service['title'] ) ) : ?>
										<h3 class="procargo-card__title">
											<?php echo esc_html( $service['title'] ); ?>
										</h3>
									<?php endif; ?>
									<?php if ( ! empty( $service['description'] ) ) : ?>
										<p class="procargo-card__description">
											<?php echo esc_html( $service['description'] ); ?>
										</p>
									<?php endif; ?>
									<?php
									$list_items = array_filter(
										array_map( 'trim', explode( "\n", (string) $service['list_items'] ) )
									);
									if ( ! empty( $list_items ) ) :
										?>
										<ul class="procargo-card__list">
											<?php foreach ( $list_items as $item ) : ?>
												<li>
													<?php echo esc_html( $item ); ?>
												</li>
											<?php endforeach; ?>
										</ul>
									<?php endif; ?>
								</article>
							<?php endforeach; ?>
						</div>
					<?php endif; ?>
				</div>
			</section>
			<?php
		}
	}
}
