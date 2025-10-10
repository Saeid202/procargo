<?php
/**
 * Theme header with bilingual navigation.
 *
 * @package ProCargo
 */

defined( 'ABSPATH' ) || exit;

$header_tagline_texts = procargo_get_translated_texts( 'header_tagline' );
$procargo_nav_items   = array(
	array(
		'id'    => 'hero',
		'href'  => '#procargo-hero',
		'label' => procargo_get_translated_texts( 'nav_home_label' ),
	),
	array(
		'id'    => 'services',
		'href'  => '#procargo-services',
		'label' => procargo_get_translated_texts( 'nav_services_label' ),
	),
	array(
		'id'    => 'about',
		'href'  => '#procargo-features',
		'label' => procargo_get_translated_texts( 'nav_about_label' ),
	),
	array(
		'id'    => 'contact',
		'href'  => '#procargo-cta',
		'label' => procargo_get_translated_texts( 'nav_contact_label' ),
	),
);
$procargo_site_title      = get_bloginfo( 'name' );
$procargo_logo_url        = get_theme_file_uri( 'assets/images/logo.jpg' );
$procargo_contact_label   = procargo_get_translated_texts( 'nav_contact_label' );
$procargo_contact_section = '#procargo-cta';
$procargo_supported_languages = procargo_supported_languages();
?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
	<head>
		<meta charset="<?php bloginfo( 'charset' ); ?>">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<?php wp_head(); ?>
	</head>
	<body <?php body_class(); ?>>
		<?php wp_body_open(); ?>

		<header class="procargo-site-header" data-component="procargo-header">
			<div class="procargo-site-header__inner">
				<div class="procargo-site-header__brand">
					<a class="procargo-site-logo" href="<?php echo esc_url( home_url( '/' ) ); ?>" aria-label="<?php echo esc_attr( $procargo_site_title ); ?>">
						<span class="procargo-site-logo__mark" aria-hidden="true">
							<img
								src="<?php echo esc_url( $procargo_logo_url ); ?>"
								class="procargo-site-logo__image"
								alt=""
								loading="lazy"
								decoding="async"
							/>
						</span>
						<span class="procargo-site-logo__text">
							<span class="procargo-site-logo__title"><?php echo esc_html( $procargo_site_title ); ?></span>
						</span>
					</a>
				</div>

				<nav class="procargo-site-nav" aria-label="<?php esc_attr_e( 'Primary navigation', 'procargo' ); ?>">
					<ul class="procargo-site-nav__list">
						<?php foreach ( $procargo_nav_items as $item ) : ?>
							<?php $is_cta = 'contact' === $item['id']; ?>
							<li class="procargo-site-nav__item<?php echo $is_cta ? ' procargo-site-nav__item--cta' : ''; ?>">
								<a
									class="procargo-site-nav__link<?php echo $is_cta ? ' procargo-site-nav__link--cta' : ''; ?>"
									href="<?php echo esc_url( $item['href'] ); ?>"
									data-nav-id="<?php echo esc_attr( $item['id'] ); ?>"
									<?php procargo_output_i18n_attributes( $item['label'] ); ?>
								>
									<?php echo esc_html( $item['label']['en'] ); ?>
								</a>
							</li>
						<?php endforeach; ?>
					</ul>
				</nav>

				<div class="procargo-site-header__actions">
					<div class="procargo-site-header__actions-main">
						<div class="procargo-language-switch procargo-language-switch--desktop">
							<select
								class="language-select"
								data-lang-select
								aria-label="<?php esc_attr_e( 'Select site language', 'procargo' ); ?>"
							>
								<?php foreach ( $procargo_supported_languages as $code => $label ) : ?>
									<option value="<?php echo esc_attr( $code ); ?>"><?php echo esc_html( $label ); ?></option>
								<?php endforeach; ?>
							</select>
						</div>

						<a
							class="procargo-site-header__cta"
							href="<?php echo esc_url( $procargo_contact_section ); ?>"
							data-nav-id="contact"
							<?php procargo_output_i18n_attributes( $procargo_contact_label ); ?>
						>
							<span class="procargo-site-header__cta-icon" aria-hidden="true"></span>
							<span class="procargo-site-header__cta-text"><?php echo esc_html( $procargo_contact_label['en'] ); ?></span>
						</a>
					</div>

					<button
						type="button"
						class="procargo-site-header__toggle"
						data-mobile-toggle
						aria-expanded="false"
						aria-controls="procargo-mobile-menu"
					>
						<span class="procargo-site-header__toggle-line" aria-hidden="true"></span>
						<span class="procargo-site-header__toggle-line" aria-hidden="true"></span>
						<span class="procargo-site-header__toggle-line" aria-hidden="true"></span>
						<span class="procargo-site-header__toggle-label"><?php esc_html_e( 'Menu', 'procargo' ); ?></span>
					</button>
				</div>
			</div>

			<div id="procargo-mobile-menu" class="procargo-site-mobile" hidden data-mobile-menu>
				<nav aria-label="<?php esc_attr_e( 'Mobile navigation', 'procargo' ); ?>">
					<ul class="procargo-site-mobile__list">
						<?php foreach ( $procargo_nav_items as $item ) : ?>
							<?php $is_cta = 'contact' === $item['id']; ?>
							<li class="procargo-site-mobile__item<?php echo $is_cta ? ' procargo-site-mobile__item--cta' : ''; ?>">
								<a
									class="procargo-site-mobile__link<?php echo $is_cta ? ' procargo-site-mobile__link--cta' : ''; ?>"
									href="<?php echo esc_url( $item['href'] ); ?>"
									data-close-on-select
									data-nav-id="<?php echo esc_attr( $item['id'] ); ?>"
									<?php procargo_output_i18n_attributes( $item['label'] ); ?>
								>
									<?php echo esc_html( $item['label']['en'] ); ?>
								</a>
							</li>
						<?php endforeach; ?>
					</ul>
				</nav>

				<div class="procargo-language-switch procargo-language-switch--mobile" role="group" aria-label="<?php esc_attr_e( 'Select site language', 'procargo' ); ?>">
					<select
						class="language-select"
						data-lang-select
						aria-label="<?php esc_attr_e( 'Select site language', 'procargo' ); ?>"
					>
						<?php foreach ( $procargo_supported_languages as $code => $label ) : ?>
							<option value="<?php echo esc_attr( $code ); ?>"><?php echo esc_html( $label ); ?></option>
						<?php endforeach; ?>
					</select>
				</div>
			</div>
		</header>
