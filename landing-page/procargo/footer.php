<?php
/**
 * Theme footer output.
 *
 * @package ProCargo
 */

defined( 'ABSPATH' ) || exit;

$elementor_footer_rendered = false;
$elementor_footer_id       = get_theme_mod( 'procargo_elementor_footer_template', 0 );

if ( $elementor_footer_id ) {
	$footer_markup = procargo_render_elementor_template( $elementor_footer_id );

	if ( $footer_markup ) {
		$elementor_footer_rendered = true;
		echo '<div class="procargo-elementor-footer">';
		echo $footer_markup; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		echo '</div>';
	}
}

if ( ! $elementor_footer_rendered ) :
	$site_name              = get_bloginfo( 'name' );
	$hero_subtitle_texts    = procargo_get_translated_texts( 'hero_subtitle' );
	$footer_services_heading = procargo_get_translated_texts( 'footer_services' );
	$footer_company_heading  = procargo_get_translated_texts( 'footer_company' );
	$footer_contact_heading  = procargo_get_translated_texts( 'footer_contact' );

	$footer_service_links = array(
		array(
			'label' => procargo_get_translated_texts( 'sea_freight' ),
			'url'   => procargo_theme_mod( 'footer_sea_freight_url' ),
		),
		array(
			'label' => procargo_get_translated_texts( 'air_freight' ),
			'url'   => procargo_theme_mod( 'footer_air_freight_url' ),
		),
		array(
			'label' => procargo_get_translated_texts( 'customs_compliance' ),
			'url'   => procargo_theme_mod( 'footer_customs_compliance_url' ),
		),
		array(
			'label' => procargo_get_translated_texts( 'warehousing' ),
			'url'   => procargo_theme_mod( 'footer_warehousing_url' ),
		),
	);

	$footer_company_links = array(
		array(
			'label' => procargo_get_translated_texts( 'footer_about_us' ),
			'url'   => procargo_theme_mod( 'footer_about_us_url' ),
		),
		array(
			'label' => procargo_get_translated_texts( 'footer_careers' ),
			'url'   => procargo_theme_mod( 'footer_careers_url' ),
		),
		array(
			'label' => procargo_get_translated_texts( 'footer_news' ),
			'url'   => procargo_theme_mod( 'footer_news_url' ),
		),
		array(
			'label' => procargo_get_translated_texts( 'footer_contact_page' ),
			'url'   => procargo_theme_mod( 'footer_contact_page_url' ),
		),
	);

	$footer_phone_texts   = procargo_get_translated_texts( 'footer_phone' );
	$footer_phone_href    = preg_replace( '/[^0-9+]/', '', $footer_phone_texts['en'] );
	$footer_email         = sanitize_email( procargo_theme_mod( 'footer_email' ) );
	$footer_address_texts = procargo_get_translated_texts( 'footer_address' );
	$current_year         = gmdate( 'Y' );

	if ( '' === $footer_phone_href ) {
		$footer_phone_href = $footer_phone_texts['en'];
	}

	if ( ! $footer_email ) {
		$footer_email = 'info@cargobridge.com';
	}

	$brand_initial = '';

	if ( $site_name ) {
		if ( function_exists( 'mb_substr' ) && function_exists( 'mb_strtoupper' ) ) {
			$brand_initial = mb_strtoupper( mb_substr( $site_name, 0, 1 ) );
		} else {
			$brand_initial = strtoupper( substr( $site_name, 0, 1 ) );
		}
	}

	if ( '' === $brand_initial ) {
		$brand_initial = 'C';
	}

	$copyright_texts = array(
		'en' => sprintf(
			/* translators: 1: Current year. 2: Site name. */
			__( '© %1$s %2$s. All rights reserved.', 'procargo' ),
			$current_year,
			$site_name
		),
		'fa' => sprintf(
			/* translators: 1: Current year. 2: Site name. */
			__( '© %1$s %2$s. کلیه حقوق محفوظ است.', 'procargo' ),
			$current_year,
			$site_name
		),
	);
?>
		<footer id="procargo-footer" class="procargo-footer" role="contentinfo">
			<div class="procargo-footer__inner">
				<div class="procargo-footer__grid">
					<div class="procargo-footer__col procargo-footer__col--brand">
						<div class="procargo-footer__brand">
							<div class="procargo-footer__brand-icon" aria-hidden="true">
								<span class="procargo-footer__brand-initial"><?php echo esc_html( $brand_initial ); ?></span>
							</div>
							<span class="procargo-footer__brand-name"><?php echo esc_html( $site_name ); ?></span>
						</div>
						<p class="procargo-footer__description" <?php procargo_output_i18n_attributes( $hero_subtitle_texts ); ?>>
							<?php echo esc_html( $hero_subtitle_texts['en'] ); ?>
						</p>
					</div>

					<div class="procargo-footer__col">
						<h3 class="procargo-footer__heading" <?php procargo_output_i18n_attributes( $footer_services_heading ); ?>>
							<?php echo esc_html( $footer_services_heading['en'] ); ?>
						</h3>
						<ul class="procargo-footer__list">
							<?php foreach ( $footer_service_links as $link ) : ?>
								<li class="procargo-footer__list-item">
									<a
										class="procargo-footer__link"
										href="<?php echo esc_url( $link['url'] ? $link['url'] : '#' ); ?>"
										<?php procargo_output_i18n_attributes( $link['label'] ); ?>
									>
										<?php echo esc_html( $link['label']['en'] ); ?>
									</a>
								</li>
							<?php endforeach; ?>
						</ul>
					</div>

					<div class="procargo-footer__col">
						<h3 class="procargo-footer__heading" <?php procargo_output_i18n_attributes( $footer_company_heading ); ?>>
							<?php echo esc_html( $footer_company_heading['en'] ); ?>
						</h3>
						<ul class="procargo-footer__list">
							<?php foreach ( $footer_company_links as $link ) : ?>
								<li class="procargo-footer__list-item">
									<a
										class="procargo-footer__link"
										href="<?php echo esc_url( $link['url'] ? $link['url'] : '#' ); ?>"
										<?php procargo_output_i18n_attributes( $link['label'] ); ?>
									>
										<?php echo esc_html( $link['label']['en'] ); ?>
									</a>
								</li>
							<?php endforeach; ?>
						</ul>
					</div>

					<div class="procargo-footer__col">
						<h3 class="procargo-footer__heading" <?php procargo_output_i18n_attributes( $footer_contact_heading ); ?>>
							<?php echo esc_html( $footer_contact_heading['en'] ); ?>
						</h3>
						<ul class="procargo-footer__list procargo-footer__list--contact">
							<li class="procargo-footer__list-item">
								<a
									class="procargo-footer__link"
									href="<?php echo esc_url( 'tel:' . $footer_phone_href ); ?>"
									<?php procargo_output_i18n_attributes( $footer_phone_texts ); ?>
								>
									<?php echo esc_html( $footer_phone_texts['en'] ); ?>
								</a>
							</li>
							<?php if ( $footer_email ) : ?>
								<li class="procargo-footer__list-item">
									<a class="procargo-footer__link" href="<?php echo esc_url( 'mailto:' . $footer_email ); ?>">
										<?php echo esc_html( $footer_email ); ?>
									</a>
								</li>
							<?php endif; ?>
							<li class="procargo-footer__list-item">
								<span class="procargo-footer__text" <?php procargo_output_i18n_attributes( $footer_address_texts ); ?>>
									<?php echo esc_html( $footer_address_texts['en'] ); ?>
								</span>
							</li>
						</ul>
					</div>
				</div>

				<div class="procargo-footer__legal" <?php procargo_output_i18n_attributes( $copyright_texts ); ?>>
					<?php echo esc_html( $copyright_texts['en'] ); ?>
				</div>
			</div>
		</footer>
<?php endif; ?>

		<?php wp_footer(); ?>
	</body>
</html>
