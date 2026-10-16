/**
 * Yemen Opportunities Portal
 * Shared language-aware navigation.
 */

(function () {
  'use strict';

  function getCurrentLanguage() {
    const params =
      new URLSearchParams(window.location.search);

    const queryLang = params.get('lang');

    if (queryLang === 'en') return 'en';
    if (queryLang === 'ar') return 'ar';

    return document.documentElement.lang === 'en'
      ? 'en'
      : 'ar';
  }

  function syncNavigation() {
    const lang = getCurrentLanguage();

    document
      .querySelectorAll('[data-preserve-lang]')
      .forEach(link => {
        const baseHref =
          link.getAttribute('data-base-href');

        if (!baseHref) return;

        const url = new URL(
          baseHref,
          window.location.href
        );

        url.searchParams.set('lang', lang);

        link.setAttribute(
          'href',
          url.pathname.split('/').pop() +
            url.search
        );
      });

    document
      .querySelectorAll('[data-about-link]')
      .forEach(link => {
        link.textContent =
          lang === 'en'
            ? 'About'
            : 'عن البوابة';
      });
  }

  window.PortalNavigation = {
    sync: syncNavigation,
    getLanguage: getCurrentLanguage
  };

  syncNavigation();

  const observer =
    new MutationObserver(syncNavigation);

  observer.observe(
    document.documentElement,
    {
      attributes: true,
      attributeFilter: ['lang', 'dir']
    }
  );
})();
