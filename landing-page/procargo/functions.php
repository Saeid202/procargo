<?php
/**
 * Theme helper functions and Customizer settings.
 *
 * @package ProCargo
 */

defined( 'ABSPATH' ) || exit;

/**
 * Enqueue global theme assets.
 *
 * @return void
 */
function procargo_enqueue_theme_assets() {
	wp_enqueue_style(
		'procargo-fonts',
		'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap',
		array(),
		null
	);

	wp_enqueue_script(
		'procargo-header',
		get_theme_file_uri( 'assets/js/procargo-header.js' ),
		array(),
		wp_get_theme()->get( 'Version' ),
		true
	);
}

add_action( 'wp_enqueue_scripts', 'procargo_enqueue_theme_assets' );

/**
 * Return supported language codes and labels.
 *
 * @return array<string, string>
 */
function procargo_supported_languages() {
	return array(
		'en' => __( 'English', 'procargo' ),
		'fa' => 'فارسی',
	);
}

/**
 * Retrieve a theme modification for the given language.
 *
 * @param string $key  Base modification key.
 * @param string $lang Language code.
 * @return string
 */
function procargo_theme_mod_lang( $key, $lang = 'en' ) {
	$languages = procargo_supported_languages();
	$lang      = array_key_exists( $lang, $languages ) ? $lang : 'en';

	if ( 'fa' === $lang ) {
		$default_fa = procargo_get_default_mod( "{$key}_fa" );
		$value      = get_theme_mod( "procargo_{$key}_fa", $default_fa );

		if ( null !== $value && '' !== $value ) {
			return $value;
		}
	}

	return procargo_theme_mod( $key );
}

/**
 * Retrieve localized text values for English and Farsi.
 *
 * @param string $key Base modification key.
 * @return array{en:string, fa:string}
 */
function procargo_get_translated_texts( $key ) {
	$english = procargo_theme_mod( $key );
	$farsi   = procargo_theme_mod_lang( $key, 'fa' );

	return array(
		'en' => $english,
		'fa' => '' !== $farsi ? $farsi : $english,
	);
}

/**
 * Echo data attributes for the language switcher.
 *
 * @param array{en:string, fa:string} $texts Bilingual values.
 * @return void
 */
function procargo_output_i18n_attributes( $texts ) {
	$english = isset( $texts['en'] ) ? $texts['en'] : '';
	$farsi   = isset( $texts['fa'] ) ? $texts['fa'] : $english;

	echo 'data-i18n data-i18n-en="' . esc_attr( $english ) . '" data-i18n-fa="' . esc_attr( $farsi ) . '"';
}

/**
 * Retrieve the full list of default theme modifications.
 *
 * @return array<string, string>
 */
function procargo_get_default_mods() {
	return array(
		'header_tagline_fa'                => 'حمل‌ونقل بین‌المللی',
		'nav_home_label'                   => __( 'Home', 'procargo' ),
		'nav_home_label_fa'                => 'خانه',
		'nav_services_label'               => __( 'Services', 'procargo' ),
		'nav_services_label_fa'            => 'خدمات',
		'nav_about_label'                  => __( 'About Us', 'procargo' ),
		'nav_about_label_fa'               => 'درباره ما',
		'nav_contact_label'                => __( 'Contact', 'procargo' ),
		'nav_contact_label_fa'             => 'تماس',
		'hero_title_line_primary'      => __( 'Bridge Your Cargo', 'procargo' ),
		'hero_title_line_primary_fa'   => 'پل بار شما',
		'hero_title_line_highlight'    => __( 'China to Canada', 'procargo' ),
		'hero_title_line_highlight_fa' => 'از چین تا کانادا',
		'hero_subtitle'                => __(
			'Reliable, fast, and secure cargo services connecting the world\'s largest manufacturing hub with North America\'s fastest-growing market. Experience seamless logistics with CargoBridge.',
			'procargo'
		),
		'hero_subtitle_fa'             => 'خدمات باری مطمئن، سریع و ایمن که بزرگ‌ترین مرکز تولید جهان را به پررونق‌ترین بازار آمریکای شمالی متصل می‌کند. تجربه لجستیک بدون دردسر با ProCargo.',
		'hero_primary_button_label'    => __( 'Get Started Today', 'procargo' ),
		'hero_primary_button_label_fa' => 'همین امروز شروع کنید',
		'hero_primary_button_url'      => home_url( '/signup/' ),
		'hero_secondary_button_label'  => __( 'Learn More', 'procargo' ),
		'hero_secondary_button_label_fa' => 'بیشتر بدانید',
		'hero_secondary_button_url'    => '#procargo-services',
		'stat_one_value'               => '10,000+',
		'stat_one_value_fa'            => '۱۰٬۰۰۰+',
		'stat_one_label'               => __( 'Successful Shipments', 'procargo' ),
		'stat_one_label_fa'            => 'ارسال‌های موفق',
		'stat_two_value'               => '99.8%',
		'stat_two_value_fa'            => '۹۹٫۸٪',
		'stat_two_label'               => __( 'On-Time Delivery', 'procargo' ),
		'stat_two_label_fa'            => 'تحویل به‌موقع',
		'stat_three_value'             => '24/7',
		'stat_three_value_fa'          => '۲۴/۷',
		'stat_three_label'             => __( 'Customer Support', 'procargo' ),
		'stat_three_label_fa'          => 'پشتیبانی مشتری',
		'stat_four_value'              => '15+',
		'stat_four_value_fa'           => '۱۵+',
		'stat_four_label'              => __( 'Years Experience', 'procargo' ),
		'stat_four_label_fa'           => 'سال تجربه',
		'services_title'               => __( 'Our Cargo Services', 'procargo' ),
		'services_title_fa'            => 'خدمات حمل‌ونقل ما',
		'services_subtitle'            => __( 'Comprehensive logistics solutions tailored for China-Canada trade routes.', 'procargo' ),
		'services_subtitle_fa'         => 'راهکارهای جامع لجستیک ویژه مسیرهای چین تا کانادا.',
		'service_one_title'            => __( 'Sea Freight', 'procargo' ),
		'service_one_title_fa'         => 'حمل دریایی',
		'service_one_description'      => __(
			'Cost-effective ocean shipping with FCL and LCL options, perfect for large shipments.',
			'procargo'
		),
		'service_one_description_fa'   => 'حمل دریایی مقرون‌به‌صرفه با گزینه‌های FCL و LCL، مناسب برای محموله‌های حجیم.',
		'service_one_list_item_one'    => __( 'FCL & LCL Services', 'procargo' ),
		'service_one_list_item_one_fa' => 'خدمات FCL و LCL',
		'service_one_list_item_two'    => __( 'Global Port Coverage', 'procargo' ),
		'service_one_list_item_two_fa' => 'پوشش بندری جهانی',
		'service_one_list_item_three'  => __( 'Customs Clearance', 'procargo' ),
		'service_one_list_item_three_fa' => 'ترخیص گمرکی',
		'service_two_title'            => __( 'Air Freight', 'procargo' ),
		'service_two_title_fa'         => 'حمل هوایی',
		'service_two_description'      => __(
			'Express air freight services for time-sensitive shipments and urgent deliveries.',
			'procargo'
		),
		'service_two_description_fa'   => 'خدمات حمل هوایی سریع برای محموله‌های حساس به زمان و ارسال‌های فوری.',
		'service_two_list_item_one'    => __( 'Express & Standard', 'procargo' ),
		'service_two_list_item_one_fa' => 'سرویس اکسپرس و استاندارد',
		'service_two_list_item_two'    => __( 'Door-to-Door Service', 'procargo' ),
		'service_two_list_item_two_fa' => 'سرویس درب به درب',
		'service_two_list_item_three'  => __( 'Real-time Tracking', 'procargo' ),
		'service_two_list_item_three_fa' => 'رهگیری لحظه‌ای',
		'service_three_title'          => __( 'Customs & Compliance', 'procargo' ),
		'service_three_title_fa'       => 'گمرک و انطباق',
		'service_three_description'    => __(
			'Expert customs clearance and compliance services for smooth border crossings.',
			'procargo'
		),
		'service_three_description_fa' => 'خدمات تخصصی ترخیص و انطباق برای عبور آسان از مرزها.',
		'service_three_list_item_one'  => __( 'Documentation Support', 'procargo' ),
		'service_three_list_item_one_fa' => 'پشتیبانی اسناد',
		'service_three_list_item_two'  => __( 'Regulatory Compliance', 'procargo' ),
		'service_three_list_item_two_fa' => 'انطباق با مقررات',
		'service_three_list_item_three'=> __( 'Risk Management', 'procargo' ),
		'service_three_list_item_three_fa' => 'مدیریت ریسک',
		'features_title'               => __( 'Why Choose CargoBridge?', 'procargo' ),
		'features_title_fa'            => 'چرا ProCargo؟',
		'features_subtitle'            => __( 'We make international shipping simple, reliable, and cost-effective.', 'procargo' ),
		'features_subtitle_fa'         => 'ما حمل‌ونقل بین‌المللی را ساده، مطمئن و مقرون‌به‌صرفه می‌کنیم.',
		'feature_one_title'            => __( 'Fast Transit Times', 'procargo' ),
		'feature_one_title_fa'         => 'زمان‌های عبور سریع',
		'feature_one_description'      => __(
			'Optimized routes and partnerships ensure your cargo reaches its destination in the shortest possible time.',
			'procargo'
		),
		'feature_one_description_fa'   => 'مسیرهای بهینه و مشارکت‌های گسترده باعث می‌شود محموله شما در کوتاه‌ترین زمان برسد.',
		'feature_two_title'            => __( 'Global Network', 'procargo' ),
		'feature_two_title_fa'         => 'شبکه جهانی',
		'feature_two_description'      => __(
			'Extensive network of partners and facilities across China and Canada for seamless operations.',
			'procargo'
		),
		'feature_two_description_fa'   => 'شبکه گسترده‌ای از شرکا و تأسیسات در سراسر چین و کانادا برای عملیاتی روان.',
		'feature_three_title'          => __( 'Competitive Pricing', 'procargo' ),
		'feature_three_title_fa'       => 'قیمت‌گذاری رقابتی',
		'feature_three_description'    => __(
			'Transparent pricing with no hidden fees. Get the best value for your shipping needs.',
			'procargo'
		),
		'feature_three_description_fa' => 'قیمت‌گذاری شفاف بدون هزینه‌های پنهان؛ بهترین ارزش برای نیازهای حمل‌ونقل شما.',
		'feature_cta_title'            => __( 'Get a Quote', 'procargo' ),
		'feature_cta_title_fa'         => 'دریافت پیش‌فاکتور',
		'feature_cta_subtitle'         => __( 'Calculate shipping costs and transit times for your cargo.', 'procargo' ),
		'feature_cta_subtitle_fa'      => 'هزینه‌ها و زمان‌های حمل را برای محموله خود محاسبه کنید.',
		'feature_cta_button_label'     => __( 'Request Quote', 'procargo' ),
		'feature_cta_button_label_fa'  => 'درخواست پیش‌فاکتور',
		'feature_cta_button_url'       => home_url( '/signup/' ),
		'cta_title'                    => __( 'Ready to Ship Your Cargo?', 'procargo' ),
		'cta_title_fa'                 => 'آماده ارسال محموله خود هستید؟',
		'cta_subtitle'                 => __(
			'Join thousands of satisfied customers who trust CargoBridge for their international shipping needs.',
			'procargo'
		),
		'cta_subtitle_fa'              => 'به هزاران مشتری راضی بپیوندید که برای حمل‌ونقل بین‌المللی به ProCargo اعتماد کرده‌اند.',
		'cta_primary_button_label'     => __( 'Start Shipping Today', 'procargo' ),
		'cta_primary_button_label_fa'  => 'امروز ارسال را شروع کنید',
		'cta_primary_button_url'       => home_url( '/signup/' ),
		'cta_secondary_button_label'   => __( 'Contact Sales', 'procargo' ),
		'cta_secondary_button_label_fa'=> 'تماس با فروش',
		'cta_secondary_button_url'     => '#procargo-contact',
		'footer_services'              => __( 'Services', 'procargo' ),
		'footer_services_fa'           => 'خدمات',
		'footer_company'               => __( 'Company', 'procargo' ),
		'footer_company_fa'            => 'شرکت',
		'footer_contact'               => __( 'Contact', 'procargo' ),
		'footer_contact_fa'            => 'تماس',
		'sea_freight'                  => __( 'Sea Freight', 'procargo' ),
		'sea_freight_fa'               => 'حمل دریایی',
		'air_freight'                  => __( 'Air Freight', 'procargo' ),
		'air_freight_fa'               => 'حمل هوایی',
		'customs_compliance'           => __( 'Customs & Compliance', 'procargo' ),
		'customs_compliance_fa'        => 'گمرک و انطباق',
		'warehousing'                  => __( 'Warehousing', 'procargo' ),
		'warehousing_fa'               => 'انبارداری',
		'footer_about_us'              => __( 'About Us', 'procargo' ),
		'footer_about_us_fa'           => 'درباره ما',
		'footer_careers'               => __( 'Careers', 'procargo' ),
		'footer_careers_fa'            => 'فرصت‌های شغلی',
		'footer_news'                  => __( 'News', 'procargo' ),
		'footer_news_fa'               => 'اخبار',
		'footer_contact_page'          => __( 'Contact', 'procargo' ),
		'footer_contact_page_fa'       => 'صفحه تماس',
		'footer_sea_freight_url'       => home_url( '/services/' ),
		'footer_air_freight_url'       => home_url( '/services/' ),
		'footer_customs_compliance_url'=> home_url( '/services/' ),
		'footer_warehousing_url'       => home_url( '/services/' ),
		'footer_about_us_url'          => home_url( '/about/' ),
		'footer_careers_url'           => home_url( '/careers/' ),
		'footer_news_url'              => home_url( '/news/' ),
		'footer_contact_page_url'      => home_url( '/contact/' ),
		'footer_phone'                 => '+1 (555) 123-4567',
		'footer_phone_fa'              => '‎+۱ (۵۵۵) ۱۲۳-۴۵۶۷',
		'footer_email'                 => 'info@cargobridge.com',
		'footer_address'               => __( '123 Shipping St, Toronto, ON', 'procargo' ),
		'footer_address_fa'            => 'تورنتو، انتاریو، خیابان شیپینگ ۱۲۳',
	);
}

/**
 * Retrieve a single default theme modification by key.
 *
 * @param string $key Mod key.
 * @return string
 */
function procargo_get_default_mod( $key ) {
	$defaults = procargo_get_default_mods();

	return isset( $defaults[ $key ] ) ? $defaults[ $key ] : '';
}

/**
 * Helper to read theme modifications with sane defaults.
 *
 * @param string $key Mod key suffix.
 * @return string
 */
function procargo_theme_mod( $key ) {
	return get_theme_mod( "procargo_{$key}", procargo_get_default_mod( $key ) );
}

/**
 * Sanitize textarea values for the Customizer.
 *
 * @param string $value Raw textarea value.
 * @return string
 */
function procargo_sanitize_textarea( $value ) {
	return sanitize_textarea_field( $value );
}

/**
 * Sanitize URL values while allowing hash anchors.
 *
 * @param string $value Raw value.
 * @return string
 */
function procargo_sanitize_url( $value ) {
	if ( 0 === strpos( $value, '#' ) ) {
		return sanitize_text_field( $value );
	}

	return esc_url_raw( $value );
}

/**
 * Register Customizer settings and controls for the landing page.
 *
 * @param WP_Customize_Manager $wp_customize Customizer manager instance.
 * @return void
 */
function procargo_customize_register( $wp_customize ) {
	if ( ! ( $wp_customize instanceof WP_Customize_Manager ) ) {
		return;
	}

	$wp_customize->add_panel(
		'procargo_landing_panel',
		array(
			'title'       => __( 'Procargo Landing Page', 'procargo' ),
			'description' => __( 'Manage the content that appears on the Procargo landing page template.', 'procargo' ),
			'priority'    => 160,
		)
	);

	// Header section.
	$wp_customize->add_section(
		'procargo_header_section',
		array(
			'title' => __( 'Header', 'procargo' ),
			'panel' => 'procargo_landing_panel',
		)
	);

	$header_fields = array(
		'header_tagline'     => array(
			'label'    => __( 'Tagline', 'procargo' ),
			'sanitize' => 'sanitize_text_field',
		),
		'nav_home_label'     => array(
			'label'    => __( 'Navigation Label: Home', 'procargo' ),
			'sanitize' => 'sanitize_text_field',
		),
		'nav_services_label' => array(
			'label'    => __( 'Navigation Label: Services', 'procargo' ),
			'sanitize' => 'sanitize_text_field',
		),
		'nav_about_label'    => array(
			'label'    => __( 'Navigation Label: About', 'procargo' ),
			'sanitize' => 'sanitize_text_field',
		),
		'nav_contact_label'  => array(
			'label'    => __( 'Navigation Label: Contact', 'procargo' ),
			'sanitize' => 'sanitize_text_field',
		),
	);

	foreach ( $header_fields as $key => $field ) {
		$wp_customize->add_setting(
			"procargo_{$key}",
			array(
				'default'           => procargo_get_default_mod( $key ),
				'sanitize_callback' => $field['sanitize'],
			)
		);

		$wp_customize->add_control(
			"procargo_{$key}",
			array(
				'label'   => $field['label'],
				'section' => 'procargo_header_section',
				'type'    => 'text',
			)
		);

		$wp_customize->add_setting(
			"procargo_{$key}_fa",
			array(
				'default'           => procargo_get_default_mod( "{$key}_fa" ),
				'sanitize_callback' => $field['sanitize'],
			)
		);

		$wp_customize->add_control(
			"procargo_{$key}_fa",
			array(
				/* translators: %s: base field label. */
				'label'       => sprintf( __( '%s (Persian)', 'procargo' ), $field['label'] ),
				'section'     => 'procargo_header_section',
				'type'        => 'text',
			)
		);
	}

	// Hero section.
	$wp_customize->add_section(
		'procargo_hero_section',
		array(
			'title' => __( 'Hero Section', 'procargo' ),
			'panel' => 'procargo_landing_panel',
		)
	);

	$hero_fields = array(
		'hero_title_line_primary'     => array(
			'label'    => __( 'Title - Primary Line', 'procargo' ),
			'sanitize' => 'sanitize_text_field',
		),
		'hero_title_line_highlight'   => array(
			'label'    => __( 'Title - Highlighted Line', 'procargo' ),
			'sanitize' => 'sanitize_text_field',
		),
		'hero_subtitle'               => array(
			'label'    => __( 'Subtitle', 'procargo' ),
			'type'     => 'textarea',
			'sanitize' => 'procargo_sanitize_textarea',
		),
		'hero_primary_button_label'   => array(
			'label'    => __( 'Primary Button Label', 'procargo' ),
			'sanitize' => 'sanitize_text_field',
		),
		'hero_primary_button_url'     => array(
			'label'       => __( 'Primary Button URL', 'procargo' ),
			'description' => __( 'You can use absolute URLs or relative paths (e.g. /signup/).', 'procargo' ),
			'sanitize'    => 'procargo_sanitize_url',
		),
		'hero_secondary_button_label' => array(
			'label'    => __( 'Secondary Button Label', 'procargo' ),
			'sanitize' => 'sanitize_text_field',
		),
		'hero_secondary_button_url'   => array(
			'label'       => __( 'Secondary Button URL', 'procargo' ),
			'description' => __( 'Supports hash anchors (e.g. #procargo-services).', 'procargo' ),
			'sanitize'    => 'procargo_sanitize_url',
		),
	);

	foreach ( $hero_fields as $key => $field ) {
		$wp_customize->add_setting(
			"procargo_{$key}",
			array(
				'default'           => procargo_get_default_mod( $key ),
				'sanitize_callback' => $field['sanitize'],
			)
		);

		$control_args = array(
			'label'   => $field['label'],
			'section' => 'procargo_hero_section',
			'settings'=> "procargo_{$key}",
			'type'    => isset( $field['type'] ) ? $field['type'] : 'text',
		);

		if ( isset( $field['description'] ) ) {
			$control_args['description'] = $field['description'];
		}

		$wp_customize->add_control( "procargo_{$key}", $control_args );

		if ( substr( $key, -4 ) === '_url' ) {
			continue;
		}

		$wp_customize->add_setting(
			"procargo_{$key}_fa",
			array(
				'default'           => procargo_get_default_mod( "{$key}_fa" ),
				'sanitize_callback' => $field['sanitize'],
			)
		);

		$fa_control_args = array(
			/* translators: %s: base field label. */
			'label'       => sprintf( __( '%s (Persian)', 'procargo' ), $field['label'] ),
			'section'     => 'procargo_hero_section',
			'settings'    => "procargo_{$key}_fa",
			'type'        => isset( $field['type'] ) ? $field['type'] : 'text',
		);

		if ( isset( $field['description'] ) ) {
			$fa_control_args['description'] = $field['description'];
		}

		$wp_customize->add_control( "procargo_{$key}_fa", $fa_control_args );
	}

	// Stats section.
	$wp_customize->add_section(
		'procargo_stats_section',
		array(
			'title' => __( 'Stats Section', 'procargo' ),
			'panel' => 'procargo_landing_panel',
		)
	);

	$stat_slugs = array(
		1 => 'one',
		2 => 'two',
		3 => 'three',
		4 => 'four',
	);

	for ( $index = 1; $index <= 4; $index++ ) {
		$slug      = $stat_slugs[ $index ];
		$value_key = "stat_{$slug}_value";
		$label_key = "stat_{$slug}_label";

		$wp_customize->add_setting(
			"procargo_{$value_key}",
			array(
				'default'           => procargo_get_default_mod( $value_key ),
				'sanitize_callback' => 'sanitize_text_field',
			)
		);

		$wp_customize->add_control(
			"procargo_{$value_key}",
			array(
				'label'   => sprintf( __( 'Statistic %d Value', 'procargo' ), $index ),
				'section' => 'procargo_stats_section',
				'type'    => 'text',
			)
		);

		$wp_customize->add_setting(
			"procargo_{$value_key}_fa",
			array(
				'default'           => procargo_get_default_mod( "{$value_key}_fa" ),
				'sanitize_callback' => 'sanitize_text_field',
			)
		);

		$wp_customize->add_control(
			"procargo_{$value_key}_fa",
			array(
				/* translators: %d: Statistic index. */
				'label'   => sprintf( __( 'Statistic %d Value (Persian)', 'procargo' ), $index ),
				'section' => 'procargo_stats_section',
				'type'    => 'text',
			)
		);

		$wp_customize->add_setting(
			"procargo_{$label_key}",
			array(
				'default'           => procargo_get_default_mod( $label_key ),
				'sanitize_callback' => 'sanitize_text_field',
			)
		);

		$wp_customize->add_control(
			"procargo_{$label_key}",
			array(
				'label'   => sprintf( __( 'Statistic %d Label', 'procargo' ), $index ),
				'section' => 'procargo_stats_section',
				'type'    => 'text',
			)
		);

		$wp_customize->add_setting(
			"procargo_{$label_key}_fa",
			array(
				'default'           => procargo_get_default_mod( "{$label_key}_fa" ),
				'sanitize_callback' => 'sanitize_text_field',
			)
		);

		$wp_customize->add_control(
			"procargo_{$label_key}_fa",
			array(
				/* translators: %d: Statistic index. */
				'label'   => sprintf( __( 'Statistic %d Label (Persian)', 'procargo' ), $index ),
				'section' => 'procargo_stats_section',
				'type'    => 'text',
			)
		);
	}

	// Services section.
	$wp_customize->add_section(
		'procargo_services_section',
		array(
			'title' => __( 'Services Section', 'procargo' ),
			'panel' => 'procargo_landing_panel',
		)
	);

	$service_fields = array(
		'services_title'    => array(
			'label'    => __( 'Section Title', 'procargo' ),
			'sanitize' => 'sanitize_text_field',
		),
		'services_subtitle' => array(
			'label'    => __( 'Section Subtitle', 'procargo' ),
			'type'     => 'textarea',
			'sanitize' => 'procargo_sanitize_textarea',
		),
	);

	foreach ( $service_fields as $key => $field ) {
		$wp_customize->add_setting(
			"procargo_{$key}",
			array(
				'default'           => procargo_get_default_mod( $key ),
				'sanitize_callback' => $field['sanitize'],
			)
		);

		$wp_customize->add_control(
			"procargo_{$key}",
			array(
				'label'   => $field['label'],
				'section' => 'procargo_services_section',
				'type'    => isset( $field['type'] ) ? $field['type'] : 'text',
			)
		);

		$wp_customize->add_setting(
			"procargo_{$key}_fa",
			array(
				'default'           => procargo_get_default_mod( "{$key}_fa" ),
				'sanitize_callback' => $field['sanitize'],
			)
		);

		$wp_customize->add_control(
			"procargo_{$key}_fa",
			array(
				/* translators: %s: base field label. */
				'label'   => sprintf( __( '%s (Persian)', 'procargo' ), $field['label'] ),
				'section' => 'procargo_services_section',
				'type'    => isset( $field['type'] ) ? $field['type'] : 'text',
			)
		);
	}

	$service_slugs = array(
		1 => 'one',
		2 => 'two',
		3 => 'three',
	);

	for ( $service_index = 1; $service_index <= 3; $service_index++ ) {
		$service_slug   = $service_slugs[ $service_index ];
		$title_key       = "service_{$service_slug}_title";
		$description_key = "service_{$service_slug}_description";

		$wp_customize->add_setting(
			"procargo_{$title_key}",
			array(
				'default'           => procargo_get_default_mod( $title_key ),
				'sanitize_callback' => 'sanitize_text_field',
			)
		);

		$wp_customize->add_control(
			"procargo_{$title_key}",
			array(
				/* translators: %d: Service index. */
				'label'   => sprintf( __( 'Service %d Title', 'procargo' ), $service_index ),
				'section' => 'procargo_services_section',
				'type'    => 'text',
			)
		);

		$wp_customize->add_setting(
			"procargo_{$title_key}_fa",
			array(
				'default'           => procargo_get_default_mod( "{$title_key}_fa" ),
				'sanitize_callback' => 'sanitize_text_field',
			)
		);

		$wp_customize->add_control(
			"procargo_{$title_key}_fa",
			array(
				/* translators: %d: Service index. */
				'label'   => sprintf( __( 'Service %d Title (Persian)', 'procargo' ), $service_index ),
				'section' => 'procargo_services_section',
				'type'    => 'text',
			)
		);

		$wp_customize->add_setting(
			"procargo_{$description_key}",
			array(
				'default'           => procargo_get_default_mod( $description_key ),
				'sanitize_callback' => 'procargo_sanitize_textarea',
			)
		);

		$wp_customize->add_control(
			"procargo_{$description_key}",
			array(
				'label'   => sprintf( __( 'Service %d Description', 'procargo' ), $service_index ),
				'section' => 'procargo_services_section',
				'type'    => 'textarea',
			)
		);

		$wp_customize->add_setting(
			"procargo_{$description_key}_fa",
			array(
				'default'           => procargo_get_default_mod( "{$description_key}_fa" ),
				'sanitize_callback' => 'procargo_sanitize_textarea',
			)
		);

		$wp_customize->add_control(
			"procargo_{$description_key}_fa",
			array(
				/* translators: %d: Service index. */
				'label'   => sprintf( __( 'Service %d Description (Persian)', 'procargo' ), $service_index ),
				'section' => 'procargo_services_section',
				'type'    => 'textarea',
			)
		);

		for ( $item_index = 1; $item_index <= 3; $item_index++ ) {
			$item_slug = $service_slugs[ $item_index ];
			$list_key  = "service_{$service_slug}_list_item_{$item_slug}";

			$wp_customize->add_setting(
				"procargo_{$list_key}",
				array(
					'default'           => procargo_get_default_mod( $list_key ),
					'sanitize_callback' => 'sanitize_text_field',
				)
			);

			$wp_customize->add_control(
				"procargo_{$list_key}",
				array(
					/* translators: 1: Service index. 2: List item index. */
					'label'   => sprintf( __( 'Service %1$d List Item %2$d', 'procargo' ), $service_index, $item_index ),
					'section' => 'procargo_services_section',
					'type'    => 'text',
				)
			);

			$wp_customize->add_setting(
				"procargo_{$list_key}_fa",
				array(
					'default'           => procargo_get_default_mod( "{$list_key}_fa" ),
					'sanitize_callback' => 'sanitize_text_field',
				)
			);

			$wp_customize->add_control(
				"procargo_{$list_key}_fa",
				array(
					/* translators: 1: Service index. 2: List item index. */
					'label'   => sprintf( __( 'Service %1$d List Item %2$d (Persian)', 'procargo' ), $service_index, $item_index ),
					'section' => 'procargo_services_section',
					'type'    => 'text',
				)
			);
		}
	}

	// Features section.
	$wp_customize->add_section(
		'procargo_features_section',
		array(
			'title' => __( 'Features Section', 'procargo' ),
			'panel' => 'procargo_landing_panel',
		)
	);

	$feature_section_fields = array(
		'features_title'    => array(
			'label'    => __( 'Section Title', 'procargo' ),
			'sanitize' => 'sanitize_text_field',
		),
		'features_subtitle' => array(
			'label'    => __( 'Section Subtitle', 'procargo' ),
			'type'     => 'textarea',
			'sanitize' => 'procargo_sanitize_textarea',
		),
	);

	foreach ( $feature_section_fields as $key => $field ) {
		$wp_customize->add_setting(
			"procargo_{$key}",
			array(
				'default'           => procargo_get_default_mod( $key ),
				'sanitize_callback' => $field['sanitize'],
			)
		);

		$wp_customize->add_control(
			"procargo_{$key}",
			array(
				'label'   => $field['label'],
				'section' => 'procargo_features_section',
				'type'    => isset( $field['type'] ) ? $field['type'] : 'text',
			)
		);

		$wp_customize->add_setting(
			"procargo_{$key}_fa",
			array(
				'default'           => procargo_get_default_mod( "{$key}_fa" ),
				'sanitize_callback' => $field['sanitize'],
			)
		);

		$wp_customize->add_control(
			"procargo_{$key}_fa",
			array(
				/* translators: %s: base field label. */
				'label'   => sprintf( __( '%s (Persian)', 'procargo' ), $field['label'] ),
				'section' => 'procargo_features_section',
				'type'    => isset( $field['type'] ) ? $field['type'] : 'text',
			)
		);
	}

	$feature_slugs = array(
		1 => 'one',
		2 => 'two',
		3 => 'three',
	);

	for ( $feature_index = 1; $feature_index <= 3; $feature_index++ ) {
		$feature_slug   = $feature_slugs[ $feature_index ];
		$title_key       = "feature_{$feature_slug}_title";
		$description_key = "feature_{$feature_slug}_description";

		$wp_customize->add_setting(
			"procargo_{$title_key}",
			array(
				'default'           => procargo_get_default_mod( $title_key ),
				'sanitize_callback' => 'sanitize_text_field',
			)
		);

		$wp_customize->add_control(
			"procargo_{$title_key}",
			array(
				/* translators: %d: Feature index. */
				'label'   => sprintf( __( 'Feature %d Title', 'procargo' ), $feature_index ),
				'section' => 'procargo_features_section',
				'type'    => 'text',
			)
		);

		$wp_customize->add_setting(
			"procargo_{$title_key}_fa",
			array(
				'default'           => procargo_get_default_mod( "{$title_key}_fa" ),
				'sanitize_callback' => 'sanitize_text_field',
			)
		);

		$wp_customize->add_control(
			"procargo_{$title_key}_fa",
			array(
				/* translators: %d: Feature index. */
				'label'   => sprintf( __( 'Feature %d Title (Persian)', 'procargo' ), $feature_index ),
				'section' => 'procargo_features_section',
				'type'    => 'text',
			)
		);

		$wp_customize->add_setting(
			"procargo_{$description_key}",
			array(
				'default'           => procargo_get_default_mod( $description_key ),
				'sanitize_callback' => 'procargo_sanitize_textarea',
			)
		);

		$wp_customize->add_control(
			"procargo_{$description_key}",
			array(
				'label'   => sprintf( __( 'Feature %d Description', 'procargo' ), $feature_index ),
				'section' => 'procargo_features_section',
				'type'    => 'textarea',
			)
		);

		$wp_customize->add_setting(
			"procargo_{$description_key}_fa",
			array(
				'default'           => procargo_get_default_mod( "{$description_key}_fa" ),
				'sanitize_callback' => 'procargo_sanitize_textarea',
			)
		);

		$wp_customize->add_control(
			"procargo_{$description_key}_fa",
			array(
				/* translators: %d: Feature index. */
				'label'   => sprintf( __( 'Feature %d Description (Persian)', 'procargo' ), $feature_index ),
				'section' => 'procargo_features_section',
				'type'    => 'textarea',
			)
		);
	}

	// Feature call to action.
	$feature_cta_fields = array(
		'feature_cta_title'        => array(
			'label'    => __( 'CTA Title', 'procargo' ),
			'sanitize' => 'sanitize_text_field',
		),
		'feature_cta_subtitle'     => array(
			'label'    => __( 'CTA Subtitle', 'procargo' ),
			'type'     => 'textarea',
			'sanitize' => 'procargo_sanitize_textarea',
		),
		'feature_cta_button_label' => array(
			'label'    => __( 'CTA Button Label', 'procargo' ),
			'sanitize' => 'sanitize_text_field',
		),
		'feature_cta_button_url'   => array(
			'label'       => __( 'CTA Button URL', 'procargo' ),
			'description' => __( 'Use a full URL or relative path.', 'procargo' ),
			'sanitize'    => 'procargo_sanitize_url',
		),
	);

	foreach ( $feature_cta_fields as $key => $field ) {
		$wp_customize->add_setting(
			"procargo_{$key}",
			array(
				'default'           => procargo_get_default_mod( $key ),
				'sanitize_callback' => $field['sanitize'],
			)
		);

		$wp_customize->add_control(
			"procargo_{$key}",
			array(
				'label'       => $field['label'],
				'section'     => 'procargo_features_section',
				'type'        => isset( $field['type'] ) ? $field['type'] : 'text',
				'description' => isset( $field['description'] ) ? $field['description'] : '',
			)
		);

		if ( substr( $key, -4 ) === '_url' ) {
			continue;
		}

		$wp_customize->add_setting(
			"procargo_{$key}_fa",
			array(
				'default'           => procargo_get_default_mod( "{$key}_fa" ),
				'sanitize_callback' => $field['sanitize'],
			)
		);

		$wp_customize->add_control(
			"procargo_{$key}_fa",
			array(
				/* translators: %s: base field label. */
				'label'       => sprintf( __( '%s (Persian)', 'procargo' ), $field['label'] ),
				'section'     => 'procargo_features_section',
				'type'        => isset( $field['type'] ) ? $field['type'] : 'text',
				'description' => isset( $field['description'] ) ? $field['description'] : '',
			)
		);
	}

	// Final call to action.
	$wp_customize->add_section(
		'procargo_cta_section',
		array(
			'title' => __( 'Final CTA Section', 'procargo' ),
			'panel' => 'procargo_landing_panel',
		)
	);

	$cta_fields = array(
		'cta_title'                  => array(
			'label'    => __( 'Section Title', 'procargo' ),
			'sanitize' => 'sanitize_text_field',
		),
		'cta_subtitle'               => array(
			'label'    => __( 'Section Subtitle', 'procargo' ),
			'type'     => 'textarea',
			'sanitize' => 'procargo_sanitize_textarea',
		),
		'cta_primary_button_label'   => array(
			'label'    => __( 'Primary Button Label', 'procargo' ),
			'sanitize' => 'sanitize_text_field',
		),
		'cta_primary_button_url'     => array(
			'label'    => __( 'Primary Button URL', 'procargo' ),
			'sanitize' => 'procargo_sanitize_url',
		),
		'cta_secondary_button_label' => array(
			'label'    => __( 'Secondary Button Label', 'procargo' ),
			'sanitize' => 'sanitize_text_field',
		),
		'cta_secondary_button_url'   => array(
			'label'    => __( 'Secondary Button URL', 'procargo' ),
			'sanitize' => 'procargo_sanitize_url',
		),
	);

	foreach ( $cta_fields as $key => $field ) {
		$wp_customize->add_setting(
			"procargo_{$key}",
			array(
				'default'           => procargo_get_default_mod( $key ),
				'sanitize_callback' => $field['sanitize'],
			)
		);

		$wp_customize->add_control(
			"procargo_{$key}",
			array(
				'label'   => $field['label'],
				'section' => 'procargo_cta_section',
				'type'    => isset( $field['type'] ) ? $field['type'] : 'text',
			)
		);

		if ( substr( $key, -4 ) === '_url' ) {
			continue;
		}

		$wp_customize->add_setting(
			"procargo_{$key}_fa",
			array(
				'default'           => procargo_get_default_mod( "{$key}_fa" ),
				'sanitize_callback' => $field['sanitize'],
			)
		);

		$wp_customize->add_control(
			"procargo_{$key}_fa",
			array(
				/* translators: %s: base field label. */
				'label'   => sprintf( __( '%s (Persian)', 'procargo' ), $field['label'] ),
				'section' => 'procargo_cta_section',
				'type'    => isset( $field['type'] ) ? $field['type'] : 'text',
			)
		);
	}

	// Footer section.
	$wp_customize->add_section(
		'procargo_footer_section',
		array(
			'title' => __( 'Footer', 'procargo' ),
			'panel' => 'procargo_landing_panel',
		)
	);

	$footer_translated_fields = array(
		'footer_services'       => array(
			/* translators: Footer column heading. */
			'label'    => __( 'Services Column Heading', 'procargo' ),
			'sanitize' => 'sanitize_text_field',
		),
		'footer_company'        => array(
			/* translators: Footer column heading. */
			'label'    => __( 'Company Column Heading', 'procargo' ),
			'sanitize' => 'sanitize_text_field',
		),
		'footer_contact'        => array(
			/* translators: Footer column heading. */
			'label'    => __( 'Contact Column Heading', 'procargo' ),
			'sanitize' => 'sanitize_text_field',
		),
		'sea_freight'           => array(
			'label'    => __( 'Services Link Label: Sea Freight', 'procargo' ),
			'sanitize' => 'sanitize_text_field',
		),
		'air_freight'           => array(
			'label'    => __( 'Services Link Label: Air Freight', 'procargo' ),
			'sanitize' => 'sanitize_text_field',
		),
		'customs_compliance'    => array(
			'label'    => __( 'Services Link Label: Customs & Compliance', 'procargo' ),
			'sanitize' => 'sanitize_text_field',
		),
		'warehousing'           => array(
			'label'    => __( 'Services Link Label: Warehousing', 'procargo' ),
			'sanitize' => 'sanitize_text_field',
		),
		'footer_about_us'       => array(
			'label'    => __( 'Company Link Label: About Us', 'procargo' ),
			'sanitize' => 'sanitize_text_field',
		),
		'footer_careers'        => array(
			'label'    => __( 'Company Link Label: Careers', 'procargo' ),
			'sanitize' => 'sanitize_text_field',
		),
		'footer_news'           => array(
			'label'    => __( 'Company Link Label: News', 'procargo' ),
			'sanitize' => 'sanitize_text_field',
		),
		'footer_contact_page'   => array(
			'label'    => __( 'Company Link Label: Contact', 'procargo' ),
			'sanitize' => 'sanitize_text_field',
		),
		'footer_phone'          => array(
			'label'    => __( 'Contact Detail: Phone Number', 'procargo' ),
			'sanitize' => 'sanitize_text_field',
		),
		'footer_address'        => array(
			'label'    => __( 'Contact Detail: Address', 'procargo' ),
			'type'     => 'textarea',
			'sanitize' => 'procargo_sanitize_textarea',
		),
	);

	foreach ( $footer_translated_fields as $key => $field ) {
		$wp_customize->add_setting(
			"procargo_{$key}",
			array(
				'default'           => procargo_get_default_mod( $key ),
				'sanitize_callback' => $field['sanitize'],
			)
		);

		$wp_customize->add_control(
			"procargo_{$key}",
			array(
				'label'       => $field['label'],
				'section'     => 'procargo_footer_section',
				'type'        => isset( $field['type'] ) ? $field['type'] : 'text',
			)
		);

		$wp_customize->add_setting(
			"procargo_{$key}_fa",
			array(
				'default'           => procargo_get_default_mod( "{$key}_fa" ),
				'sanitize_callback' => $field['sanitize'],
			)
		);

		$wp_customize->add_control(
			"procargo_{$key}_fa",
			array(
				/* translators: %s: Base field label. */
				'label'       => sprintf( __( '%s (Persian)', 'procargo' ), $field['label'] ),
				'section'     => 'procargo_footer_section',
				'type'        => isset( $field['type'] ) ? $field['type'] : 'text',
			)
		);
	}

	$wp_customize->add_setting(
		'procargo_footer_email',
		array(
			'default'           => procargo_get_default_mod( 'footer_email' ),
			'sanitize_callback' => 'sanitize_email',
		)
	);

	$wp_customize->add_control(
		'procargo_footer_email',
		array(
			'label'   => __( 'Contact Detail: Email Address', 'procargo' ),
			'section' => 'procargo_footer_section',
			'type'    => 'text',
		)
	);

	$footer_url_fields = array(
		'footer_sea_freight_url'        => __( 'Services Link URL: Sea Freight', 'procargo' ),
		'footer_air_freight_url'        => __( 'Services Link URL: Air Freight', 'procargo' ),
		'footer_customs_compliance_url' => __( 'Services Link URL: Customs & Compliance', 'procargo' ),
		'footer_warehousing_url'        => __( 'Services Link URL: Warehousing', 'procargo' ),
		'footer_about_us_url'           => __( 'Company Link URL: About Us', 'procargo' ),
		'footer_careers_url'            => __( 'Company Link URL: Careers', 'procargo' ),
		'footer_news_url'               => __( 'Company Link URL: News', 'procargo' ),
		'footer_contact_page_url'       => __( 'Company Link URL: Contact', 'procargo' ),
	);

	foreach ( $footer_url_fields as $key => $label ) {
		$wp_customize->add_setting(
			"procargo_{$key}",
			array(
				'default'           => procargo_get_default_mod( $key ),
				'sanitize_callback' => 'procargo_sanitize_url',
			)
		);

		$wp_customize->add_control(
			"procargo_{$key}",
			array(
				'label'   => $label,
				'section' => 'procargo_footer_section',
				'type'    => 'url',
			)
		);
	}
}
add_action( 'customize_register', 'procargo_customize_register' );
