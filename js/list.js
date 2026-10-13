/**
 * Yemen Opportunities Portal - Opportunities Listing & Filtering Engine
 * Agent A Implementation
 *
 * Safe DOM rendering (Zero unsafe HTML interpolation), client-side plain-text
 * keyword search with Arabic normalization, and data-driven filters.
 */

'use strict';

// Application State
const state = {
  lang: 'ar', // 'ar' (primary) or 'en'
  opportunities: [], // Loaded from data/opportunities.json
  searchQuery: '',
  filters: {
    type: 'all',
    category: 'all',
    country: 'all', // 'all', 'GLOBAL', or ISO alpha-2 code ('GB', 'CA', etc.)
    educationLevel: 'all',
    deliveryMode: 'all',
    fundingType: 'all'
  }
};

// DOM References
const dom = {
  html: document.documentElement,
  pageTitle: document.getElementById('pageTitle'),
  siteTitle: document.getElementById('siteTitle'),
  siteSubtitle: document.getElementById('siteSubtitle'),
  langToggle: document.getElementById('langToggle'),
  skipLink: document.getElementById('skipLink'),

  // Search
  searchLabel: document.getElementById('searchLabel'),
  searchInput: document.getElementById('searchInput'),
  clearSearchBtn: document.getElementById('clearSearchBtn'),

  // Filters
  controlsHeading: document.getElementById('controlsHeading'),
  resetFiltersBtn: document.getElementById('resetFiltersBtn'),
  filterType: document.getElementById('filterType'),
  filterCategory: document.getElementById('filterCategory'),
  filterCountry: document.getElementById('filterCountry'),
  filterEdu: document.getElementById('filterEdu'),
  filterDelivery: document.getElementById('filterDelivery'),
  filterFunding: document.getElementById('filterFunding'),

  labelFilterType: document.getElementById('labelFilterType'),
  labelFilterCategory: document.getElementById('labelFilterCategory'),
  labelFilterCountry: document.getElementById('labelFilterCountry'),
  labelFilterEdu: document.getElementById('labelFilterEdu'),
  labelFilterDelivery: document.getElementById('labelFilterDelivery'),
  labelFilterFunding: document.getElementById('labelFilterFunding'),

  // Results & States
  resultsCount: document.getElementById('resultsCount'),
  container: document.getElementById('opportunitiesContainer'),
  emptyState: document.getElementById('emptyState'),
  emptyTitle: document.getElementById('emptyTitle'),
  emptyMessage: document.getElementById('emptyMessage'),
  emptyResetBtn: document.getElementById('emptyResetBtn'),

  errorState: document.getElementById('errorState'),
  errorTitle: document.getElementById('errorTitle'),
  errorMessage: document.getElementById('errorMessage'),
  retryBtn: document.getElementById('retryBtn'),

  footerText: document.getElementById('footerText')
};

/**
 * Basic Arabic normalization helper for resilient search.
 * Removes tashkeel, unifies alif variants, and normalizes alif maqsura.
 */
function normalizeArabic(text) {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670]/g, '') // Remove tashkeel
    .replace(/[أإآ]/g, 'ا') // Normalize Alif
    .replace(/ى/g, 'ي') // Normalize Alif Maqsura
    .trim();
}

/**
 * Returns localized enum text from translations dictionary.
 */
function getLocalizedEnum(group, key, lang) {
  const t = translations[lang] || translations.ar;
  if (t.enums && t.enums[group] && t.enums[group][key]) {
    return t.enums[group][key];
  }
  return key;
}

/**
 * Safely creates an opportunity card using standard DOM APIs.
 * Prevents XSS by never using innerHTML interpolation for opportunity data.
 */
function createOpportunityCard(opp, lang) {
  const card = document.createElement('article');
  card.className = 'opportunity-card';
  card.setAttribute('aria-labelledby', `title-${opp.id}`);

  // Badges container
  const badgeContainer = document.createElement('div');
  badgeContainer.className = 'card-badges';

  // 1. Type badge
  if (opp.type) {
    const typeBadge = document.createElement('span');
    typeBadge.className = 'badge badge-type';
    typeBadge.textContent = getLocalizedEnum('types', opp.type, lang);
    badgeContainer.appendChild(typeBadge);
  }

  // 2. Funding badge
  if (opp.fundingType) {
    const fundingBadge = document.createElement('span');
    fundingBadge.className = 'badge badge-funding';
    fundingBadge.textContent = getLocalizedEnum('fundingTypes', opp.fundingType, lang);
    badgeContainer.appendChild(fundingBadge);
  }

  // 3. Delivery mode badge
  if (opp.deliveryMode) {
    const deliveryBadge = document.createElement('span');
    deliveryBadge.className = 'badge badge-delivery';
    deliveryBadge.textContent = getLocalizedEnum('deliveryModes', opp.deliveryMode, lang);
    badgeContainer.appendChild(deliveryBadge);
  }

  // 4. Closing soon badge (if fixed deadline within 14 days)
  if (opp.deadline && opp.deadline.type === 'fixed' && opp.deadline.date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineDate = new Date(opp.deadline.date);
    const daysRemaining = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
    if (daysRemaining >= 0 && daysRemaining <= 14) {
      const closingBadge = document.createElement('span');
      closingBadge.className = 'badge badge-closing-soon';
      closingBadge.textContent = translations[lang].closingSoonBadge;
      badgeContainer.appendChild(closingBadge);
    }
  }

  card.appendChild(badgeContainer);

  // Card Title
  const title = document.createElement('h3');
  title.id = `title-${opp.id}`;
  title.className = 'card-title';
  const localizedTitle = (opp.title && opp.title[lang]) || (opp.title && opp.title.ar) || '';
  title.textContent = localizedTitle;
  card.appendChild(title);

  // Organization
  const org = document.createElement('p');
  org.className = 'card-org';
  const localizedOrg = (opp.organization && opp.organization[lang]) || (opp.organization && opp.organization.ar) || '';
  org.textContent = localizedOrg;
  card.appendChild(org);

  // Meta list (Country, Categories, Education levels)
  const metaList = document.createElement('div');
  metaList.className = 'card-meta-list';

  // Country chip
  const countryChip = document.createElement('span');
  countryChip.className = 'meta-chip meta-chip-country';
  if (opp.country && opp.country.code) {
    const localizedCountry = (opp.country.name && opp.country.name[lang]) ||
      getLocalizedEnum('countries', opp.country.code, lang) ||
      opp.country.code;
    countryChip.textContent = localizedCountry;
  } else {
    countryChip.textContent = translations[lang].globalOption;
  }
  metaList.appendChild(countryChip);

  // Category chips
  if (Array.isArray(opp.categories)) {
    opp.categories.forEach(cat => {
      const catChip = document.createElement('span');
      catChip.className = 'meta-chip meta-chip-category';
      catChip.textContent = getLocalizedEnum('categories', cat, lang);
      metaList.appendChild(catChip);
    });
  }

  // Education level chip
  if (Array.isArray(opp.educationLevels) && opp.educationLevels.length > 0) {
    const eduChip = document.createElement('span');
    eduChip.className = 'meta-chip';
    const eduLabels = opp.educationLevels.map(lvl => getLocalizedEnum('educationLevels', lvl, lang));
    eduChip.textContent = eduLabels.join(' • ');
    metaList.appendChild(eduChip);
  }

  card.appendChild(metaList);

  // Deadline box
  const deadlineBox = document.createElement('div');
  deadlineBox.className = 'card-deadline-box';

  const deadlineLabel = document.createElement('span');
  deadlineLabel.className = 'deadline-label';
  deadlineLabel.textContent = translations[lang].deadlineLabel;
  deadlineBox.appendChild(deadlineLabel);

  const deadlineValue = document.createElement('span');
  deadlineValue.className = 'deadline-text';

  if (opp.deadline) {
    if (opp.deadline.type === 'fixed' && opp.deadline.date) {
      const bdi = document.createElement('bdi');
      bdi.textContent = opp.deadline.date;
      deadlineValue.appendChild(bdi);
    } else if (opp.deadline.type === 'rolling') {
      deadlineValue.textContent = translations[lang].rollingDeadline;
    } else {
      deadlineValue.textContent = translations[lang].unspecifiedDeadline;
    }
  } else {
    deadlineValue.textContent = translations[lang].unspecifiedDeadline;
  }
  deadlineBox.appendChild(deadlineValue);

  card.appendChild(deadlineBox);

  // Short description (if present)
  const localizedDesc = (opp.shortDescription && opp.shortDescription[lang]) || (opp.shortDescription && opp.shortDescription.ar);
  if (localizedDesc) {
    const desc = document.createElement('p');
    desc.className = 'card-description';
    desc.textContent = localizedDesc;
    card.appendChild(desc);
  }

  // Card Footer with official source link
  const footer = document.createElement('div');
  footer.className = 'card-footer';

  if (opp.officialSourceUrl) {
    const sourceLink = document.createElement('a');
    sourceLink.className = 'source-link';
    sourceLink.href = opp.officialSourceUrl;
    sourceLink.target = '_blank';
    sourceLink.rel = 'noopener noreferrer';
    sourceLink.textContent = translations[lang].officialSource;
    footer.appendChild(sourceLink);
  }

  card.appendChild(footer);

  return card;
}

/**
 * Extracts and populates filter options dynamically from data present in dataset.
 */
function populateFilterOptions() {
  const lang = state.lang;
  const t = translations[lang];

  // Helper to rebuild a select menu while preserving current selection
  function rebuildSelect(selectElement, items, getLabel, currentValue) {
    selectElement.replaceChildren();

    const allOption = document.createElement('option');
    allOption.value = 'all';
    allOption.textContent = t.allOption;
    selectElement.appendChild(allOption);

    items.forEach(val => {
      const opt = document.createElement('option');
      opt.value = val;
      opt.textContent = getLabel(val);
      selectElement.appendChild(opt);
    });

    selectElement.value = items.includes(currentValue) ? currentValue : 'all';
  }

  // 1. Opportunity Types present
  const typesPresent = Array.from(new Set(state.opportunities.map(o => o.type).filter(Boolean))).sort();
  rebuildSelect(
    dom.filterType,
    typesPresent,
    type => getLocalizedEnum('types', type, lang),
    state.filters.type
  );

  // 2. Categories present
  const categoriesPresent = Array.from(new Set(state.opportunities.flatMap(o => o.categories || []).filter(Boolean))).sort();
  rebuildSelect(
    dom.filterCategory,
    categoriesPresent,
    cat => getLocalizedEnum('categories', cat, lang),
    state.filters.category
  );

  // 3. Countries present (includes 'GLOBAL' for null country + specific ISO codes)
  const countriesSet = new Set();
  let hasGlobal = false;
  state.opportunities.forEach(o => {
    if (o.country && o.country.code) {
      countriesSet.add(o.country.code);
    } else {
      hasGlobal = true;
    }
  });

  const countryOptions = [];
  if (hasGlobal) countryOptions.push('GLOBAL');
  const sortedCountryCodes = Array.from(countriesSet).sort();
  sortedCountryCodes.forEach(code => countryOptions.push(code));

  rebuildSelect(
    dom.filterCountry,
    countryOptions,
    code => {
      if (code === 'GLOBAL') return t.globalOption;
      return getLocalizedEnum('countries', code, lang);
    },
    state.filters.country
  );

  // 4. Education levels present
  const eduLevelsPresent = Array.from(new Set(state.opportunities.flatMap(o => o.educationLevels || []).filter(Boolean))).sort();
  rebuildSelect(
    dom.filterEdu,
    eduLevelsPresent,
    lvl => getLocalizedEnum('educationLevels', lvl, lang),
    state.filters.educationLevel
  );

  // 5. Delivery modes present
  const deliveryModesPresent = Array.from(new Set(state.opportunities.map(o => o.deliveryMode).filter(Boolean))).sort();
  rebuildSelect(
    dom.filterDelivery,
    deliveryModesPresent,
    mode => getLocalizedEnum('deliveryModes', mode, lang),
    state.filters.deliveryMode
  );

  // 6. Funding types present
  const fundingTypesPresent = Array.from(new Set(state.opportunities.map(o => o.fundingType).filter(Boolean))).sort();
  rebuildSelect(
    dom.filterFunding,
    fundingTypesPresent,
    fund => getLocalizedEnum('fundingTypes', fund, lang),
    state.filters.fundingType
  );
}

/**
 * Plain-text keyword search checking normalized terms against opportunity fields.
 */
function matchesSearch(opp, normalizedQuery) {
  if (!normalizedQuery) return true;

  const targetStrings = [
    opp.title?.ar,
    opp.title?.en,
    opp.organization?.ar,
    opp.organization?.en,
    opp.shortDescription?.ar,
    opp.shortDescription?.en
  ].filter(Boolean);

  const queryTerms = normalizedQuery.split(/\s+/).filter(Boolean);
  return queryTerms.every(term =>
    targetStrings.some(str => normalizeArabic(str).includes(term))
  );
}

/**
 * Filter opportunities based on active state.
 */
function filterOpportunities() {
  const normalizedQuery = normalizeArabic(state.searchQuery);

  return state.opportunities.filter(opp => {
    // 1. Search filter
    if (!matchesSearch(opp, normalizedQuery)) return false;

    // 2. Type filter
    if (state.filters.type !== 'all' && opp.type !== state.filters.type) {
      return false;
    }

    // 3. Category filter
    if (state.filters.category !== 'all') {
      if (!Array.isArray(opp.categories) || !opp.categories.includes(state.filters.category)) {
        return false;
      }
    }

    // 4. Country filter
    if (state.filters.country !== 'all') {
      if (state.filters.country === 'GLOBAL') {
        if (opp.country !== null) return false;
      } else {
        if (!opp.country || opp.country.code !== state.filters.country) return false;
      }
    }

    // 5. Education level filter
    if (state.filters.educationLevel !== 'all') {
      if (!Array.isArray(opp.educationLevels) || !opp.educationLevels.includes(state.filters.educationLevel)) {
        return false;
      }
    }

    // 6. Delivery mode filter
    if (state.filters.deliveryMode !== 'all') {
      if (opp.deliveryMode !== state.filters.deliveryMode) return false;
    }

    // 7. Funding type filter
    if (state.filters.fundingType !== 'all') {
      if (opp.fundingType !== state.filters.fundingType) return false;
    }

    return true;
  });
}

/**
 * Renders filtered opportunities list or appropriate empty state.
 */
function applyFiltersAndRender() {
  const filtered = filterOpportunities();
  const count = filtered.length;
  const lang = state.lang;
  const t = translations[lang];

  // Update results counter
  dom.resultsCount.textContent = t.resultsCount(count);

  // Clear previous cards
  dom.container.replaceChildren();

  if (count === 0) {
    dom.container.hidden = true;
    dom.emptyState.hidden = false;
  } else {
    dom.emptyState.hidden = true;
    dom.container.hidden = false;

    // Render cards safely
    const fragment = document.createDocumentFragment();
    filtered.forEach(opp => {
      fragment.appendChild(createOpportunityCard(opp, lang));
    });
    dom.container.appendChild(fragment);
  }
}

/**
 * Resets search input and all filter dropdowns back to initial state.
 */
function resetAllFilters() {
  state.searchQuery = '';
  state.filters.type = 'all';
  state.filters.category = 'all';
  state.filters.country = 'all';
  state.filters.educationLevel = 'all';
  state.filters.deliveryMode = 'all';
  state.filters.fundingType = 'all';

  dom.searchInput.value = '';
  dom.clearSearchBtn.hidden = true;

  dom.filterType.value = 'all';
  dom.filterCategory.value = 'all';
  dom.filterCountry.value = 'all';
  dom.filterEdu.value = 'all';
  dom.filterDelivery.value = 'all';
  dom.filterFunding.value = 'all';

  applyFiltersAndRender();
}

/**
 * Updates all static UI chrome and labels for active language.
 */
function updateInterfaceLanguage(newLang) {
  state.lang = newLang;
  const t = translations[newLang];

  // Update document root attributes
  dom.html.lang = newLang;
  dom.html.dir = newLang === 'ar' ? 'rtl' : 'ltr';

  // Update titles & labels
  dom.pageTitle.textContent = `${t.siteTitle} | ${newLang === 'ar' ? 'فرص تعليمية ومهنية موثوقة' : 'Verified Educational Opportunities'}`;
  dom.siteTitle.textContent = t.siteTitle;
  dom.siteSubtitle.textContent = t.siteSubtitle;
  dom.langToggle.textContent = t.langToggle;
  dom.langToggle.setAttribute('aria-label', newLang === 'ar' ? 'Switch language to English' : 'التحويل إلى اللغة العربية');
  dom.skipLink.textContent = newLang === 'ar' ? 'انتقل إلى المحتوى الرئيسي' : 'Skip to main content';

  dom.searchLabel.textContent = t.searchLabel;
  dom.searchInput.placeholder = t.searchPlaceholder;
  dom.clearSearchBtn.setAttribute('aria-label', t.clearSearch);

  dom.controlsHeading.textContent = t.filtersHeading;
  dom.resetFiltersBtn.textContent = t.resetFilters;

  dom.labelFilterType.textContent = t.filterType;
  dom.labelFilterCategory.textContent = t.filterCategory;
  dom.labelFilterCountry.textContent = t.filterCountry;
  dom.labelFilterEdu.textContent = t.filterEdu;
  dom.labelFilterDelivery.textContent = t.filterDelivery;
  dom.labelFilterFunding.textContent = t.filterFunding;

  dom.emptyTitle.textContent = t.emptyTitle;
  dom.emptyMessage.textContent = t.emptyMessage;
  dom.emptyResetBtn.textContent = t.emptyResetBtn;

  dom.errorTitle.textContent = t.errorTitle;
  dom.errorMessage.textContent = t.errorMessage;
  dom.retryBtn.textContent = t.retryBtn;

  dom.footerText.textContent = t.footerText;

  // Re-populate filter options with translated labels while maintaining current selections
  populateFilterOptions();

  // Re-render cards in new language
  applyFiltersAndRender();
}

/**
 * Toggles language between Arabic and English.
 */
function toggleLanguage() {
  const targetLang = state.lang === 'ar' ? 'en' : 'ar';
  updateInterfaceLanguage(targetLang);
}

/**
 * Shows error state when data cannot be loaded.
 */
function showErrorState(errorMessage) {
  dom.container.hidden = true;
  dom.emptyState.hidden = true;
  dom.errorState.hidden = false;
  dom.resultsCount.textContent = translations[state.lang].resultsCount(0);
  console.error('Opportunities Portal Data Loading Error:', errorMessage);
}

/**
 * Loads opportunities dataset from data/opportunities.json.
 */
async function loadOpportunities() {
  dom.errorState.hidden = true;
  try {
    const response = await fetch('data/opportunities.json');
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}: Failed to load opportunities.json`);
    }
    const data = await response.json();
    if (!data || !Array.isArray(data.opportunities)) {
      throw new Error('Malformed dataset: opportunities array missing.');
    }
    state.opportunities = data.opportunities;

    populateFilterOptions();
    applyFiltersAndRender();
  } catch (err) {
    showErrorState(err.message);
  }
}

/**
 * Sets up event listeners.
 */
function initEvents() {
  // Search input
  dom.searchInput.addEventListener('input', (e) => {
    state.searchQuery = e.target.value;
    dom.clearSearchBtn.hidden = state.searchQuery.trim() === '';
    applyFiltersAndRender();
  });

  // Clear search button
  dom.clearSearchBtn.addEventListener('click', () => {
    state.searchQuery = '';
    dom.searchInput.value = '';
    dom.clearSearchBtn.hidden = true;
    dom.searchInput.focus();
    applyFiltersAndRender();
  });

  // Filter selects
  dom.filterType.addEventListener('change', (e) => {
    state.filters.type = e.target.value;
    applyFiltersAndRender();
  });

  dom.filterCategory.addEventListener('change', (e) => {
    state.filters.category = e.target.value;
    applyFiltersAndRender();
  });

  dom.filterCountry.addEventListener('change', (e) => {
    state.filters.country = e.target.value;
    applyFiltersAndRender();
  });

  dom.filterEdu.addEventListener('change', (e) => {
    state.filters.educationLevel = e.target.value;
    applyFiltersAndRender();
  });

  dom.filterDelivery.addEventListener('change', (e) => {
    state.filters.deliveryMode = e.target.value;
    applyFiltersAndRender();
  });

  dom.filterFunding.addEventListener('change', (e) => {
    state.filters.fundingType = e.target.value;
    applyFiltersAndRender();
  });

  // Reset buttons
  dom.resetFiltersBtn.addEventListener('click', resetAllFilters);
  dom.emptyResetBtn.addEventListener('click', resetAllFilters);

  // Language toggle
  dom.langToggle.addEventListener('click', toggleLanguage);

  // Retry button
  dom.retryBtn.addEventListener('click', loadOpportunities);
}

// Initial bootstrap
document.addEventListener('DOMContentLoaded', () => {
  initEvents();
  loadOpportunities();
});
