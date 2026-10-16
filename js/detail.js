/**
 * Yemen Opportunities Portal - Opportunity Detail View
 *
 * Loads one opportunity by stable ID from the production dataset.
 * Uses safe DOM APIs only and never inserts opportunity data as HTML.
 */

(function () {
  'use strict';

  const params = new URLSearchParams(window.location.search);
  const requestedId = params.get('id') || '';
  const requestedLang = params.get('lang');

  const state = {
    lang: requestedLang === 'en' ? 'en' : 'ar',
    opportunity: null,
    errorKind: null
  };

  const dom = {
    html: document.documentElement,
    pageTitle: document.getElementById('pageTitle'),
    siteTitle: document.getElementById('siteTitle'),
    siteSubtitle: document.getElementById('siteSubtitle'),
    skipLink: document.getElementById('skipLink'),
    langToggle: document.getElementById('langToggle'),
    footerText: document.getElementById('footerText'),

    backToList: document.getElementById('backToList'),
    errorBackLink: document.getElementById('errorBackLink'),

    loading: document.getElementById('detailLoading'),
    content: document.getElementById('detailContent'),
    error: document.getElementById('detailError'),
    errorTitle: document.getElementById('detailErrorTitle'),
    errorMessage: document.getElementById('detailErrorMessage'),

    badges: document.getElementById('detailBadges'),
    title: document.getElementById('detailTitle'),
    organization: document.getElementById('detailOrganization'),
    favoriteButton: document.getElementById('favoriteButton'),

    descriptionSection: document.getElementById('descriptionSection'),
    descriptionHeading: document.getElementById('descriptionHeading'),
    description: document.getElementById('detailDescription'),

    factsHeading: document.getElementById('factsHeading'),
    typeLabel: document.getElementById('typeLabel'),
    countryLabel: document.getElementById('countryLabel'),
    categoriesLabel: document.getElementById('categoriesLabel'),
    educationLabel: document.getElementById('educationLabel'),
    fundingLabel: document.getElementById('fundingLabel'),
    deliveryLabel: document.getElementById('deliveryLabel'),
    languagesLabel: document.getElementById('languagesLabel'),
    statusLabel: document.getElementById('statusLabel'),

    type: document.getElementById('detailType'),
    country: document.getElementById('detailCountry'),
    categories: document.getElementById('detailCategories'),
    education: document.getElementById('detailEducation'),
    funding: document.getElementById('detailFunding'),
    delivery: document.getElementById('detailDelivery'),
    languages: document.getElementById('detailLanguages'),
    status: document.getElementById('detailStatus'),

    deadlineHeading: document.getElementById('deadlineHeading'),
    deadline: document.getElementById('detailDeadline'),
    deadlineNotesContainer: document.getElementById('deadlineNotesContainer'),
    deadlineNotesLabel: document.getElementById('deadlineNotesLabel'),
    deadlineNotes: document.getElementById('detailDeadlineNotes'),

    eligibilitySection: document.getElementById('eligibilitySection'),
    eligibilityHeading: document.getElementById('eligibilityHeading'),
    eligibility: document.getElementById('detailEligibility'),

    officialSourceLink: document.getElementById('officialSourceLink'),
    applicationLink: document.getElementById('applicationLink'),
    verificationText: document.getElementById('verificationText')
  };

  function getTranslations() {
    return translations[state.lang] || translations.ar;
  }

  function localizedText(value) {
    if (!value || typeof value !== 'object') {
      return '';
    }

    return value[state.lang] || value.ar || value.en || '';
  }

  function getLocalizedEnum(group, key) {
    const t = getTranslations();

    if (
      key &&
      t.enums &&
      t.enums[group] &&
      t.enums[group][key]
    ) {
      return t.enums[group][key];
    }

    return key || t.notSpecifiedValue;
  }

  function getLanguageName(code) {
    if (!code) return '';

    try {
      const names = new Intl.DisplayNames(
        [state.lang],
        { type: 'language' }
      );

      return names.of(code) || code.toUpperCase();
    } catch (_error) {
      return code.toUpperCase();
    }
  }

  function createBadge(text, className) {
    const badge = document.createElement('span');

    badge.className = `badge ${className}`;
    badge.textContent = text;

    return badge;
  }

  function renderValueList(container, values) {
    const t = getTranslations();

    container.replaceChildren();

    if (!Array.isArray(values) || values.length === 0) {
      container.textContent = t.notSpecifiedValue;
      return;
    }

    values.forEach((value) => {
      const chip = document.createElement('span');

      chip.className = 'meta-chip';
      chip.textContent = value;

      container.appendChild(chip);
    });
  }

  function setSafeExternalLink(anchor, url, label) {
    anchor.hidden = true;
    anchor.removeAttribute('href');

    if (typeof url !== 'string' || !url) {
      return false;
    }

    try {
      const parsed = new URL(url);

      if (parsed.protocol !== 'https:') {
        return false;
      }

      anchor.href = parsed.href;
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
      anchor.textContent = label;
      anchor.hidden = false;

      return true;
    } catch (_error) {
      return false;
    }
  }

  function getDeadlineText(status) {
    const t = getTranslations();

    if (status.kind === 'today') {
      return t.deadlineToday;
    }

    if (status.kind === 'expired') {
      return t.deadlineExpired;
    }

    if (
      status.kind === 'future' &&
      Number.isInteger(status.daysRemaining)
    ) {
      return t.daysRemaining(status.daysRemaining);
    }

    if (status.kind === 'rolling') {
      return t.rollingDeadline;
    }

    if (status.kind === 'invalid') {
      return t.invalidDeadline;
    }

    return t.unspecifiedDeadline;
  }

  function renderDeadline(opportunity) {
    const status = window.DeadlineUtils.getDeadlineStatus(
      opportunity.deadline
    );

    dom.deadline.replaceChildren();

    if (
      opportunity.deadline &&
      opportunity.deadline.type === 'fixed' &&
      opportunity.deadline.date
    ) {
      const date = document.createElement('bdi');
      const separator = document.createTextNode(' • ');
      const statusText = document.createElement('span');

      date.className = 'detail-deadline-date';
      date.textContent = opportunity.deadline.date;

      statusText.className = status.isClosingSoon
        ? 'detail-deadline-status badge badge-closing-soon'
        : 'detail-deadline-status';

      statusText.textContent = getDeadlineText(status);

      dom.deadline.appendChild(date);
      dom.deadline.appendChild(separator);
      dom.deadline.appendChild(statusText);
    } else {
      dom.deadline.textContent = getDeadlineText(status);
    }

    const notes = opportunity.deadline
      ? localizedText(opportunity.deadline.notes)
      : '';

    if (notes) {
      dom.deadlineNotes.textContent = notes;
      dom.deadlineNotesContainer.hidden = false;
    } else {
      dom.deadlineNotes.textContent = '';
      dom.deadlineNotesContainer.hidden = true;
    }

    return status;
  }

  function getEffectiveStatusText(opportunity, deadlineStatus) {
    const t = getTranslations();

    if (deadlineStatus.kind === 'expired') {
      return t.deadlineExpired;
    }

    if (opportunity.applicationStatus) {
      return getLocalizedEnum(
        'applicationStatuses',
        opportunity.applicationStatus
      );
    }

    return t.notSpecifiedValue;
  }

  function syncFavoriteButton() {
    if (!state.opportunity) return;

    const t = getTranslations();
    const favorite = window.FavoritesStore.has(
      state.opportunity.id
    );

    const title = localizedText(state.opportunity.title);
    const label = favorite
      ? t.removeFavorite
      : t.saveFavorite;

    dom.favoriteButton.setAttribute(
      'aria-pressed',
      favorite ? 'true' : 'false'
    );

    dom.favoriteButton.setAttribute(
      'aria-label',
      `${label}: ${title}`
    );

    dom.favoriteButton.textContent =
      `${favorite ? '★' : '☆'} ${label}`;
  }

  function renderOpportunity() {
    if (!state.opportunity) return;

    const opportunity = state.opportunity;
    const t = getTranslations();

    const title = localizedText(opportunity.title);
    const organization = localizedText(
      opportunity.organization
    );

    dom.title.textContent = title;
    dom.organization.textContent = organization;
    dom.pageTitle.textContent = `${title} | ${t.siteTitle}`;

    dom.badges.replaceChildren();

    if (opportunity.type) {
      dom.badges.appendChild(
        createBadge(
          getLocalizedEnum('types', opportunity.type),
          'badge-type'
        )
      );
    }

    if (opportunity.fundingType) {
      dom.badges.appendChild(
        createBadge(
          getLocalizedEnum(
            'fundingTypes',
            opportunity.fundingType
          ),
          'badge-funding'
        )
      );
    }

    if (opportunity.deliveryMode) {
      dom.badges.appendChild(
        createBadge(
          getLocalizedEnum(
            'deliveryModes',
            opportunity.deliveryMode
          ),
          'badge-delivery'
        )
      );
    }

    const deadlineStatus = renderDeadline(opportunity);

    if (deadlineStatus.isClosingSoon) {
      dom.badges.appendChild(
        createBadge(
          t.closingSoonBadge,
          'badge-closing-soon'
        )
      );
    }

    const description = localizedText(
      opportunity.shortDescription
    );

    if (description) {
      dom.description.textContent = description;
      dom.descriptionSection.hidden = false;
    } else {
      dom.description.textContent = '';
      dom.descriptionSection.hidden = true;
    }

    dom.type.textContent = opportunity.type
      ? getLocalizedEnum('types', opportunity.type)
      : t.notSpecifiedValue;

    if (opportunity.country && opportunity.country.code) {
      dom.country.textContent =
        localizedText(opportunity.country.name) ||
        getLocalizedEnum(
          'countries',
          opportunity.country.code
        );
    } else {
      dom.country.textContent = t.globalOption;
    }

    renderValueList(
      dom.categories,
      Array.isArray(opportunity.categories)
        ? opportunity.categories.map(
            category => getLocalizedEnum(
              'categories',
              category
            )
          )
        : []
    );

    renderValueList(
      dom.education,
      Array.isArray(opportunity.educationLevels)
        ? opportunity.educationLevels.map(
            level => getLocalizedEnum(
              'educationLevels',
              level
            )
          )
        : []
    );

    dom.funding.textContent = opportunity.fundingType
      ? getLocalizedEnum(
          'fundingTypes',
          opportunity.fundingType
        )
      : t.notSpecifiedValue;

    dom.delivery.textContent = opportunity.deliveryMode
      ? getLocalizedEnum(
          'deliveryModes',
          opportunity.deliveryMode
        )
      : t.notSpecifiedValue;

    dom.languages.textContent =
      Array.isArray(opportunity.languages) &&
      opportunity.languages.length > 0
        ? opportunity.languages
            .map(code => getLanguageName(code))
            .join(' • ')
        : t.notSpecifiedValue;

    dom.status.textContent = getEffectiveStatusText(
      opportunity,
      deadlineStatus
    );

    const eligibility = localizedText(
      opportunity.eligibilityNote
    );

    if (eligibility) {
      dom.eligibility.textContent = eligibility;
      dom.eligibilitySection.hidden = false;
    } else {
      dom.eligibility.textContent = '';
      dom.eligibilitySection.hidden = true;
    }

    setSafeExternalLink(
      dom.officialSourceLink,
      opportunity.officialSourceUrl,
      t.officialSource
    );

    setSafeExternalLink(
      dom.applicationLink,
      opportunity.applicationUrl,
      t.applicationLink
    );

    dom.verificationText.textContent =
      `${t.verifiedDate} ${opportunity.verificationDate}`;

    syncFavoriteButton();
  }

  function updateStaticText() {
    const t = getTranslations();

    dom.html.lang = state.lang;
    dom.html.dir = state.lang === 'ar' ? 'rtl' : 'ltr';

    dom.siteTitle.textContent = t.siteTitle;
    dom.siteSubtitle.textContent = t.siteSubtitle;
    dom.footerText.textContent = t.footerText;

    dom.langToggle.textContent = t.langToggle;

    dom.langToggle.setAttribute(
      'aria-label',
      state.lang === 'ar'
        ? 'Switch language to English'
        : 'التحويل إلى اللغة العربية'
    );

    dom.skipLink.textContent =
      state.lang === 'ar'
        ? 'انتقل إلى المحتوى الرئيسي'
        : 'Skip to main content';

    dom.backToList.textContent = t.backToList;
    dom.errorBackLink.textContent = t.backToList;

    dom.loading.textContent = t.detailLoading;
    dom.descriptionHeading.textContent = t.detailDescriptionHeading;
    dom.factsHeading.textContent = t.detailFactsHeading;
    dom.typeLabel.textContent = t.detailTypeLabel;
    dom.countryLabel.textContent = t.filterCountry;
    dom.categoriesLabel.textContent = t.filterCategory;
    dom.educationLabel.textContent = t.filterEdu;
    dom.fundingLabel.textContent = t.filterFunding;
    dom.deliveryLabel.textContent = t.filterDelivery;
    dom.languagesLabel.textContent = t.detailLanguagesLabel;
    dom.statusLabel.textContent = t.detailStatusLabel;
    dom.deadlineHeading.textContent = t.deadlineLabel.replace(':', '');
    dom.deadlineNotesLabel.textContent = t.detailDeadlineNotesLabel;
    dom.eligibilityHeading.textContent = t.detailEligibilityHeading;

    if (!state.opportunity) {
      dom.pageTitle.textContent =
        `${t.detailPageTitle} | ${t.siteTitle}`;
    }
  }

  function showError(kind) {
    const t = getTranslations();

    state.errorKind = kind;

    dom.loading.hidden = true;
    dom.content.hidden = true;
    dom.error.hidden = false;

    dom.errorTitle.textContent = t.detailNotFoundTitle;

    if (kind === 'missing-id') {
      dom.errorMessage.textContent = t.detailMissingIdMessage;
    } else if (kind === 'load-error') {
      dom.errorTitle.textContent = t.detailLoadErrorTitle;
      dom.errorMessage.textContent = t.detailLoadErrorMessage;
    } else {
      dom.errorMessage.textContent = t.detailNotFoundMessage;
    }

    dom.pageTitle.textContent =
      `${dom.errorTitle.textContent} | ${t.siteTitle}`;
  }

  async function loadOpportunity() {
    if (!requestedId) {
      showError('missing-id');
      return;
    }

    try {
      const response = await fetch('data/opportunities.json');

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (!data || !Array.isArray(data.opportunities)) {
        throw new Error('Malformed opportunities dataset');
      }

      const opportunity = data.opportunities.find(
        item => item.id === requestedId
      );

      if (!opportunity) {
        showError('not-found');
        return;
      }

      state.opportunity = opportunity;
      state.errorKind = null;

      dom.loading.hidden = true;
      dom.error.hidden = true;
      dom.content.hidden = false;

      renderOpportunity();
    } catch (_error) {
      showError('load-error');
    }
  }

  function toggleLanguage() {
    state.lang = state.lang === 'ar' ? 'en' : 'ar';

    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('lang', state.lang);

    window.history.replaceState(null, '', currentUrl);

    updateStaticText();

    if (state.opportunity) {
      renderOpportunity();
    } else if (state.errorKind) {
      showError(state.errorKind);
    }
  }

  dom.langToggle.addEventListener('click', toggleLanguage);

  dom.favoriteButton.addEventListener('click', () => {
    if (!state.opportunity) return;

    window.FavoritesStore.toggle(state.opportunity.id);
    syncFavoriteButton();
  });

  window.addEventListener('favorites:changed', syncFavoriteButton);

  window.addEventListener('storage', (event) => {
    if (event.key === window.FavoritesStore.STORAGE_KEY) {
      syncFavoriteButton();
    }
  });

  updateStaticText();
  loadOpportunity();
})();
