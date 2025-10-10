<?php
/**
 * Template Name: ProCargo Landing Page
 * Template Post Type: page
 *
 * Copy this file into your active theme (e.g. wp-content/themes/your-theme/)
 * to register it as a custom page template. Pair it with the accompanying
 * CSS in assets/css/procargo-landing-page.css.
 */

defined( 'ABSPATH' ) || exit;

// Attempt to load the external stylesheet, with a graceful inline fallback.
$css_relative_path = 'assets/css/procargo-landing-page.css';
$css_file_path     = function_exists( 'get_theme_file_path' ) ? get_theme_file_path( $css_relative_path ) : '';

if ( $css_file_path && file_exists( $css_file_path ) ) {
	wp_enqueue_style(
		'procargo-landing-page',
		get_theme_file_uri( $css_relative_path ),
		array(),
		wp_get_theme()->get( 'Version' )
	);
} else {
	$inline_css_path = __DIR__ . '/procargo-landing-page.css';

	if ( file_exists( $inline_css_path ) ) {
		$inline_css = file_get_contents( $inline_css_path ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents

		if ( $inline_css ) {
			wp_register_style( 'procargo-landing-page-inline', false );
			wp_enqueue_style( 'procargo-landing-page-inline' );
			wp_add_inline_style( 'procargo-landing-page-inline', $inline_css );
		}
	}
}

get_header();

if ( have_posts() ) :
	while ( have_posts() ) :
		the_post();

		// Allow Elementor to render custom layouts when the page is built with it.
		$elementor_instance     = class_exists( '\Elementor\Plugin' ) ? \Elementor\Plugin::instance() : null;
		$has_elementor_content = $elementor_instance && $elementor_instance->db->is_built_with_elementor( get_the_ID() );
		$is_elementor_editing  = $elementor_instance
			&& (
				( isset( $elementor_instance->editor ) && $elementor_instance->editor->is_edit_mode() )
				|| ( isset( $elementor_instance->preview ) && $elementor_instance->preview->is_preview_mode() )
			);
		?>
		<main id="procargo-landing" class="procargo-landing" role="main">
			<?php if ( $has_elementor_content || $is_elementor_editing ) : ?>
				<?php the_content(); ?>
			<?php else : ?>
				<?php
				$stats = array(
					array(
						'value' => procargo_get_translated_texts( 'stat_one_value' ),
						'label' => procargo_get_translated_texts( 'stat_one_label' ),
					),
					array(
						'value' => procargo_get_translated_texts( 'stat_two_value' ),
						'label' => procargo_get_translated_texts( 'stat_two_label' ),
					),
					array(
						'value' => procargo_get_translated_texts( 'stat_three_value' ),
						'label' => procargo_get_translated_texts( 'stat_three_label' ),
					),
					array(
						'value' => procargo_get_translated_texts( 'stat_four_value' ),
						'label' => procargo_get_translated_texts( 'stat_four_label' ),
					),
				);

				$services = array(
					array(
						'title'       => procargo_get_translated_texts( 'service_one_title' ),
						'description' => procargo_get_translated_texts( 'service_one_description' ),
						'items'       => array(
							procargo_get_translated_texts( 'service_one_list_item_one' ),
							procargo_get_translated_texts( 'service_one_list_item_two' ),
							procargo_get_translated_texts( 'service_one_list_item_three' ),
						),
					),
					array(
						'title'       => procargo_get_translated_texts( 'service_two_title' ),
						'description' => procargo_get_translated_texts( 'service_two_description' ),
						'items'       => array(
							procargo_get_translated_texts( 'service_two_list_item_one' ),
							procargo_get_translated_texts( 'service_two_list_item_two' ),
							procargo_get_translated_texts( 'service_two_list_item_three' ),
						),
					),
					array(
						'title'       => procargo_get_translated_texts( 'service_three_title' ),
						'description' => procargo_get_translated_texts( 'service_three_description' ),
						'items'       => array(
							procargo_get_translated_texts( 'service_three_list_item_one' ),
							procargo_get_translated_texts( 'service_three_list_item_two' ),
							procargo_get_translated_texts( 'service_three_list_item_three' ),
						),
					),
				);

				$features = array(
					array(
						'title'       => procargo_get_translated_texts( 'feature_one_title' ),
						'description' => procargo_get_translated_texts( 'feature_one_description' ),
					),
					array(
						'title'       => procargo_get_translated_texts( 'feature_two_title' ),
						'description' => procargo_get_translated_texts( 'feature_two_description' ),
					),
					array(
						'title'       => procargo_get_translated_texts( 'feature_three_title' ),
						'description' => procargo_get_translated_texts( 'feature_three_description' ),
					),
				);
				?>
				<?php
				$hero_title_line_primary   = procargo_get_translated_texts( 'hero_title_line_primary' );
				$hero_title_line_highlight = procargo_get_translated_texts( 'hero_title_line_highlight' );
				$hero_subtitle_texts       = procargo_get_translated_texts( 'hero_subtitle' );
				$hero_primary_button_label = procargo_get_translated_texts( 'hero_primary_button_label' );
				$hero_secondary_button_label = procargo_get_translated_texts( 'hero_secondary_button_label' );
				$services_title_texts        = procargo_get_translated_texts( 'services_title' );
				$services_subtitle_texts     = procargo_get_translated_texts( 'services_subtitle' );
				$features_title_texts        = procargo_get_translated_texts( 'features_title' );
				$features_subtitle_texts     = procargo_get_translated_texts( 'features_subtitle' );
				$feature_cta_title_texts     = procargo_get_translated_texts( 'feature_cta_title' );
				$feature_cta_subtitle_texts  = procargo_get_translated_texts( 'feature_cta_subtitle' );
				$feature_cta_button_label    = procargo_get_translated_texts( 'feature_cta_button_label' );
				$cta_title_texts             = procargo_get_translated_texts( 'cta_title' );
				$cta_subtitle_texts          = procargo_get_translated_texts( 'cta_subtitle' );
				$cta_primary_button_label    = procargo_get_translated_texts( 'cta_primary_button_label' );
				$cta_secondary_button_label  = procargo_get_translated_texts( 'cta_secondary_button_label' );
				?>
				<section id="procargo-hero" class="procargo-hero" aria-labelledby="procargo-hero-title">
					<div class="procargo-hero__overlay" aria-hidden="true"></div>
					<div class="procargo-hero__container">
						<div class="procargo-hero__layout">
							<div class="procargo-hero__content">
								<h1 id="procargo-hero-title" class="procargo-hero__title" data-animate data-animate-delay="0.05s">
									<span class="procargo-hero__title-line" <?php procargo_output_i18n_attributes( $hero_title_line_primary ); ?>>
										<?php echo esc_html( $hero_title_line_primary['en'] ); ?>
									</span>
									<span class="procargo-hero__title-highlight" <?php procargo_output_i18n_attributes( $hero_title_line_highlight ); ?>>
										<?php echo esc_html( $hero_title_line_highlight['en'] ); ?>
									</span>
								</h1>
								<p class="procargo-hero__subtitle" data-animate data-animate-delay="0.15s" <?php procargo_output_i18n_attributes( $hero_subtitle_texts ); ?>>
									<?php echo esc_html( $hero_subtitle_texts['en'] ); ?>
								</p>
								<div class="procargo-hero__actions" data-animate data-animate-delay="0.25s">
									<a class="procargo-button procargo-button--primary" href="<?php echo esc_url( procargo_theme_mod( 'hero_primary_button_url' ) ); ?>">
										<span <?php procargo_output_i18n_attributes( $hero_primary_button_label ); ?>>
											<?php echo esc_html( $hero_primary_button_label['en'] ); ?>
										</span>
									</a>
									<a class="procargo-button procargo-button--ghost" href="<?php echo esc_url( procargo_theme_mod( 'hero_secondary_button_url' ) ); ?>">
										<span <?php procargo_output_i18n_attributes( $hero_secondary_button_label ); ?>>
											<?php echo esc_html( $hero_secondary_button_label['en'] ); ?>
										</span>
									</a>
								</div>
							</div>
							<div class="procargo-hero__visual" aria-hidden="true" data-animate data-animate-delay="0.35s">
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

					<span class="procargo-hero__bubble procargo-hero__bubble--one" aria-hidden="true"></span>
					<span class="procargo-hero__bubble procargo-hero__bubble--two" aria-hidden="true"></span>
					<span class="procargo-hero__bubble procargo-hero__bubble--three" aria-hidden="true"></span>
				</section>

				<section class="procargo-stats" aria-label="<?php esc_attr_e( 'Key company metrics', 'procargo' ); ?>">
					<div class="procargo-container">
						<div class="procargo-stats__grid">
							<?php foreach ( $stats as $stat ) : ?>
								<div class="procargo-stat" data-animate>
									<div class="procargo-stat__figure" <?php procargo_output_i18n_attributes( $stat['value'] ); ?>>
										<?php echo esc_html( $stat['value']['en'] ); ?>
									</div>
									<div class="procargo-stat__label" <?php procargo_output_i18n_attributes( $stat['label'] ); ?>>
										<?php echo esc_html( $stat['label']['en'] ); ?>
									</div>
								</div>
							<?php endforeach; ?>
						</div>
					</div>
				</section>

				<section id="procargo-services" class="procargo-services" aria-labelledby="procargo-services-title">
					<div class="procargo-container">
						<div class="procargo-section-heading">
							<h2 id="procargo-services-title" class="procargo-section-heading__title" <?php procargo_output_i18n_attributes( $services_title_texts ); ?>>
								<?php echo esc_html( $services_title_texts['en'] ); ?>
							</h2>
							<p class="procargo-section-heading__subtitle" <?php procargo_output_i18n_attributes( $services_subtitle_texts ); ?>>
								<?php echo esc_html( $services_subtitle_texts['en'] ); ?>
							</p>
						</div>

						<div class="procargo-card-grid">
							<?php foreach ( $services as $service_index => $service ) : ?>
								<article class="procargo-card" data-animate>
									<div class="procargo-card__icon">
										<?php // Icons remain static for each card. ?>
										<?php if ( 0 === $service_index ) : ?>
											<svg class="procargo-icon" viewBox="0 0 24 24" aria-hidden="true">
												<path d="M2.25 5.25h12v9h-12v-9zM14.25 8.25h3l2.25 3v3h-5.25v-6zM5.25 17.25a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM16.5 17.25a1.5 1.5 0 1 0 .001 3 1.5 1.5 0 0 0-.001-3z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
											</svg>
										<?php elseif ( 1 === $service_index ) : ?>
											<svg class="procargo-icon" viewBox="0 0 24 24" aria-hidden="true">
												<path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
												<path d="M3 12h18M12 3a15.3 15.3 0 0 1 4.5 9A15.3 15.3 0 0 1 12 21 15.3 15.3 0 0 1 7.5 12 15.3 15.3 0 0 1 12 3z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
											</svg>
										<?php else : ?>
											<svg class="procargo-icon" viewBox="0 0 24 24" aria-hidden="true">
												<path d="M12 3l7.5 3v6c0 4.5-3 8.61-7.5 9.75C7.5 20.61 4.5 16.5 4.5 12V6L12 3z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
												<path d="M9 12l2 2 4-4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
											</svg>
										<?php endif; ?>
									</div>
									<h3 class="procargo-card__title" <?php procargo_output_i18n_attributes( $service['title'] ); ?>>
										<?php echo esc_html( $service['title']['en'] ); ?>
									</h3>
									<p class="procargo-card__description" <?php procargo_output_i18n_attributes( $service['description'] ); ?>>
										<?php echo esc_html( $service['description']['en'] ); ?>
									</p>
									<ul class="procargo-card__list">
										<?php foreach ( $service['items'] as $item ) : ?>
											<li <?php procargo_output_i18n_attributes( $item ); ?>>
												<?php echo esc_html( $item['en'] ); ?>
											</li>
										<?php endforeach; ?>
									</ul>
								</article>
							<?php endforeach; ?>
						</div>
					</div>
				</section>

				<section id="procargo-features" class="procargo-features" aria-labelledby="procargo-features-title">
					<div class="procargo-container procargo-features__grid">
						<div class="procargo-section-heading procargo-section-heading--left">
							<h2 id="procargo-features-title" class="procargo-section-heading__title" <?php procargo_output_i18n_attributes( $features_title_texts ); ?>>
								<?php echo esc_html( $features_title_texts['en'] ); ?>
							</h2>
							<p class="procargo-section-heading__subtitle" <?php procargo_output_i18n_attributes( $features_subtitle_texts ); ?>>
								<?php echo esc_html( $features_subtitle_texts['en'] ); ?>
							</p>

							<div class="procargo-feature-list">
								<?php foreach ( $features as $feature_index => $feature ) : ?>
									<div class="procargo-feature" data-animate>
										<span class="procargo-feature__icon" aria-hidden="true">
											<?php if ( 0 === $feature_index ) : ?>
												<svg class="procargo-icon" viewBox="0 0 24 24">
													<path d="M12 6v6l4 2" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
													<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.5" />
												</svg>
											<?php elseif ( 1 === $feature_index ) : ?>
												<svg class="procargo-icon" viewBox="0 0 24 24">
													<path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.9 5.82 22 7 14.14 2 9.27l6.91-1.01L12 2z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
												</svg>
											<?php else : ?>
												<svg class="procargo-icon" viewBox="0 0 24 24">
													<path d="M12 3l8 4.5-8 4.5-8-4.5L12 3zM4 12l8 4.5 8-4.5M4 17l8 4.5 8-4.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
												</svg>
											<?php endif; ?>
										</span>
										<div>
											<h3 class="procargo-feature__title" <?php procargo_output_i18n_attributes( $feature['title'] ); ?>>
												<?php echo esc_html( $feature['title']['en'] ); ?>
											</h3>
											<p class="procargo-feature__description" <?php procargo_output_i18n_attributes( $feature['description'] ); ?>>
												<?php echo esc_html( $feature['description']['en'] ); ?>
											</p>
										</div>
									</div>
								<?php endforeach; ?>
							</div>
						</div>

						<aside class="procargo-feature-cta" aria-labelledby="procargo-feature-cta-title">
							<div class="procargo-feature-cta__inner" data-animate data-animate-delay="0.12s">
								<h3 id="procargo-feature-cta-title" class="procargo-feature-cta__title" <?php procargo_output_i18n_attributes( $feature_cta_title_texts ); ?>>
									<?php echo esc_html( $feature_cta_title_texts['en'] ); ?>
								</h3>
								<p class="procargo-feature-cta__subtitle" <?php procargo_output_i18n_attributes( $feature_cta_subtitle_texts ); ?>>
									<?php echo esc_html( $feature_cta_subtitle_texts['en'] ); ?>
								</p>
								<a class="procargo-button procargo-button--primary procargo-button--wide" href="<?php echo esc_url( procargo_theme_mod( 'feature_cta_button_url' ) ); ?>">
									<span <?php procargo_output_i18n_attributes( $feature_cta_button_label ); ?>>
										<?php echo esc_html( $feature_cta_button_label['en'] ); ?>
									</span>
								</a>
							</div>
						</aside>
					</div>
				</section>

				<section id="procargo-cta" class="procargo-cta" aria-labelledby="procargo-cta-title">
					<div class="procargo-container">
						<h2 id="procargo-cta-title" class="procargo-cta__title" data-animate <?php procargo_output_i18n_attributes( $cta_title_texts ); ?>>
							<?php echo esc_html( $cta_title_texts['en'] ); ?>
						</h2>
						<p class="procargo-cta__subtitle" data-animate data-animate-delay="0.1s" <?php procargo_output_i18n_attributes( $cta_subtitle_texts ); ?>>
							<?php echo esc_html( $cta_subtitle_texts['en'] ); ?>
						</p>
						<div class="procargo-cta__actions" data-animate data-animate-delay="0.2s">
							<a class="procargo-button procargo-button--light" href="<?php echo esc_url( procargo_theme_mod( 'cta_primary_button_url' ) ); ?>">
								<span <?php procargo_output_i18n_attributes( $cta_primary_button_label ); ?>>
									<?php echo esc_html( $cta_primary_button_label['en'] ); ?>
								</span>
							</a>
							<a class="procargo-button procargo-button--ghost-light" href="<?php echo esc_url( procargo_theme_mod( 'cta_secondary_button_url' ) ); ?>">
								<span <?php procargo_output_i18n_attributes( $cta_secondary_button_label ); ?>>
									<?php echo esc_html( $cta_secondary_button_label['en'] ); ?>
								</span>
							</a>
						</div>
					</div>
				</section>
			<?php endif; ?>
		</main>
		<?php
	endwhile;
endif;

get_footer();
