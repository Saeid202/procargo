(function () {
	const STORAGE_KEY = 'procargoLanguage';
	const LANG_FA = 'fa';
	const LANG_EN = 'en';

	const languageOptions = [LANG_FA, LANG_EN];

	const getStoredLanguage = () => {
		try {
			const stored = window.localStorage.getItem(STORAGE_KEY);
			if (languageOptions.includes(stored)) {
				return stored;
			}
		} catch (error) {
			// Access to localStorage can fail; ignore and continue.
		}
		return null;
	};

	const setStoredLanguage = (lang) => {
		try {
			window.localStorage.setItem(STORAGE_KEY, lang);
		} catch (error) {
			// Ignore storage errors (e.g., disabled cookies).
		}
	};

	const detectLanguage = () => {
		const stored = getStoredLanguage();
		if (stored) {
			return stored;
		}

		const documentLang = document.documentElement.lang;
		if (languageOptions.includes(documentLang)) {
			return documentLang;
		}

		const navigatorLang = (navigator.language || navigator.userLanguage || '').toLowerCase();
		if (navigatorLang.startsWith(LANG_FA)) {
			return LANG_FA;
		}

		return LANG_EN;
	};

	const applyLanguage = (lang) => {
		const normalized = languageOptions.includes(lang) ? lang : LANG_EN;
		document.documentElement.lang = normalized;
		document.documentElement.dir = normalized === LANG_FA ? 'rtl' : 'ltr';

		const i18nNodes = document.querySelectorAll('[data-i18n]');
		i18nNodes.forEach((node) => {
			const attrName = normalized === LANG_FA ? 'i18nFa' : 'i18nEn';
			const value = node.dataset[attrName];

			if (typeof value === 'undefined') {
				return;
			}

			if ('value' in node && node.tagName === 'INPUT') {
				node.value = value;
				return;
			}

			if ('placeholder' in node && node.placeholder) {
				node.placeholder = value;
			}

			node.textContent = value;
		});

		const languageSelects = document.querySelectorAll('[data-lang-select]');
		languageSelects.forEach((select) => {
			if (select.value !== normalized) {
				select.value = normalized;
			}
		});

		setStoredLanguage(normalized);
	};

	const toggleMobileMenu = (menu, toggleButton, forceState) => {
		const isOpen = typeof forceState === 'boolean' ? forceState : menu.dataset.open !== 'true';

		menu.dataset.open = isOpen ? 'true' : 'false';
		toggleButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');

		if (isOpen) {
			menu.removeAttribute('hidden');
		} else {
			menu.setAttribute('hidden', '');
		}
	};

	document.addEventListener('DOMContentLoaded', () => {
		document.documentElement.classList.add('procargo-js-enabled');

		const initialLanguage = detectLanguage();
		applyLanguage(initialLanguage);

		const header = document.querySelector('[data-component="procargo-header"]');

		if (!header) {
			return;
		}

		const applyHeaderScrollState = () => {
			const threshold = header.offsetHeight * 0.5;
			if (window.scrollY > threshold) {
				header.classList.add('is-scrolled');
				return;
			}
			header.classList.remove('is-scrolled');
		};

		const mobileMenu = header.querySelector('[data-mobile-menu]');
		const mobileToggle = header.querySelector('[data-mobile-toggle]');

		const languageSelects = document.querySelectorAll('[data-lang-select]');
		languageSelects.forEach((select) => {
			select.addEventListener('change', () => {
				const lang = select.value;
				if (!lang) {
					return;
				}
				applyLanguage(lang);

				if (mobileMenu && mobileToggle) {
					toggleMobileMenu(mobileMenu, mobileToggle, false);
				}
			});
		});

		if (mobileMenu && mobileToggle) {
			mobileToggle.addEventListener('click', () => {
				toggleMobileMenu(mobileMenu, mobileToggle);
			});

			const closeOnSelectLinks = mobileMenu.querySelectorAll('[data-close-on-select]');
			closeOnSelectLinks.forEach((link) => {
				link.addEventListener('click', () => {
					toggleMobileMenu(mobileMenu, mobileToggle, false);
				});
			});
		}

		applyHeaderScrollState();
		window.addEventListener('scroll', applyHeaderScrollState, { passive: true });
		window.addEventListener('resize', applyHeaderScrollState);

		const animatedNodes = document.querySelectorAll('[data-animate]');

		if (animatedNodes.length) {
			const prefersReducedMotion = typeof window.matchMedia === 'function'
				&& window.matchMedia('(prefers-reduced-motion: reduce)').matches;

			const revealNode = (node) => {
				node.classList.add('is-visible');
			};

			if (!prefersReducedMotion && 'IntersectionObserver' in window) {
				const observer = new IntersectionObserver(
					(entries) => {
						entries.forEach((entry) => {
							if (!entry.isIntersecting) {
								return;
							}
							revealNode(entry.target);
							observer.unobserve(entry.target);
						});
					},
					{
						threshold: 0.25,
						rootMargin: '0px 0px -10% 0px',
					}
				);

				animatedNodes.forEach((node) => {
					const delay = node.getAttribute('data-animate-delay');
					if (delay) {
						node.style.animationDelay = delay;
					}
					observer.observe(node);
				});
			} else {
				animatedNodes.forEach((node) => {
					const delay = node.getAttribute('data-animate-delay');
					if (delay) {
						node.style.animationDelay = delay;
					}
					revealNode(node);
				});
			}
		}
	});
})();
