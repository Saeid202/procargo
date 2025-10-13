/**
 * Handles simple header menu toggle for smaller screens.
 */
( function () {
	const toggles = document.querySelectorAll( '.procargo-header__toggle' );

	if ( ! toggles.length ) {
		return;
	}

	toggles.forEach( ( toggle ) => {
		const navId = toggle.getAttribute( 'aria-controls' );
		const nav   = document.getElementById( navId );
		const header = toggle.closest( '.procargo-header' );

		if ( ! nav ) {
			return;
		}

		toggle.addEventListener( 'click', () => {
			const isExpanded = 'true' === toggle.getAttribute( 'aria-expanded' );
			const nextState  = ! isExpanded;

			toggle.setAttribute( 'aria-expanded', nextState );
			nav.classList.toggle( 'procargo-header__nav--open', nextState );
			if ( header ) {
				header.classList.toggle( 'procargo-header--menu-open', nextState );
			}
		} );

		const navLinks = nav.querySelectorAll( 'a' );
		if ( navLinks.length ) {
			navLinks.forEach( ( link ) => {
				link.addEventListener( 'click', () => {
					toggle.setAttribute( 'aria-expanded', false );
					nav.classList.remove( 'procargo-header__nav--open' );
					if ( header ) {
						header.classList.remove( 'procargo-header--menu-open' );
					}
				} );
			} );
		}
	} );
}() );
