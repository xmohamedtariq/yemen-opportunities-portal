'use strict';

(() => {
  const UI = {
    ar: {
      pageTitle: 'إحصاءات الفرص | بوابة فرص اليمن',
      description: 'لوحة إحصاءات بوابة فرص اليمن — نظرة مباشرة على الفرص الموثقة حسب النوع والتخصص والدولة والتمويل',
      skipLink: 'انتقل إلى المحتوى الرئيسي',
      siteTitle: 'بوابة فرص اليمن',
      siteSubtitle: 'فرص موثقة. وصول أوضح. للشباب اليمني.',
      opportunitiesNav: 'الفرص',
      statisticsNav: 'الإحصاءات',
      aboutNav: 'عن البوابة',
      languageButton: 'English',
      languageAria: 'Switch language to English',
      eyebrow: 'بيانات الفرص الموثقة',
      heroTitle: 'صورة أوضح عن الفرص المتاحة',
      heroCopy: 'تُحسب هذه الإحصاءات مباشرة من قاعدة الفرص الموثقة في البوابة، دون أرقام ثابتة أو بيانات مولدة.',
      trustNote: 'جميع الأرقام مشتقة من البيانات الحالية في opportunities.json',
      loading: 'جاري تحليل بيانات الفرص...',
      errorTitle: 'تعذر تحميل الإحصاءات',
      errorCopy: 'تعذر قراءة بيانات الفرص. تحقق من تشغيل الخادم المحلي ثم أعد المحاولة.',
      retry: 'إعادة المحاولة',
      overviewKicker: 'نظرة سريعة',
      overviewTitle: 'ملخص قاعدة الفرص',
      totalLabel: 'إجمالي الفرص',
      totalNote: 'فرصة موثقة في قاعدة البيانات',
      countriesLabel: 'الدول والنطاقات',
      countriesNote: 'دول أو نطاقات دولية ممثلة',
      categoriesLabel: 'التخصصات',
      categoriesNote: 'مجالات مختلفة ضمن الفرص',
      fullyFundedLabel: 'ممولة بالكامل',
      fullyFundedNote: 'بحسب المعلومات الموثقة في المصدر',
      typeKicker: 'حسب النوع',
      typeTitle: 'أنواع الفرص',
      categoryKicker: 'حسب المجال',
      categoryTitle: 'التخصصات والمجالات',
      countryKicker: 'حسب الوجهة',
      countryTitle: 'الدول والنطاق الدولي',
      fundingKicker: 'حسب التمويل',
      fundingTitle: 'أنواع التمويل',
      dataNote: 'ملاحظة: الإحصاءات تصف السجلات الحالية فقط، وقد تتغير عند إعادة التحقق من الفرص أو تحديث قاعدة البيانات.',
      footer: 'بوابة فرص اليمن — فرص موثقة ووصول أوضح للشباب اليمني',
      noData: 'لا توجد بيانات مصنفة لعرضها.',
      global: 'دولي / عالمي',
      notSpecified: 'غير محدد في المصدر الرسمي'
    },
    en: {
      pageTitle: 'Opportunity Statistics | Yemen Opportunities Portal',
      description: 'Yemen Opportunities Portal statistics — a live overview of verified opportunities by type, field, country, and funding.',
      skipLink: 'Skip to main content',
      siteTitle: 'Yemen Opportunities Portal',
      siteSubtitle: 'Trusted opportunities. Clearer access. Built for Yemeni youth.',
      opportunitiesNav: 'Opportunities',
      statisticsNav: 'Statistics',
      aboutNav: 'About',
      languageButton: 'العربية',
      languageAria: 'التبديل إلى اللغة العربية',
      eyebrow: 'Verified opportunity data',
      heroTitle: 'A clearer view of the opportunity landscape',
      heroCopy: 'These statistics are calculated directly from the portal’s verified opportunity dataset, with no fixed counts or generated data.',
      trustNote: 'Every number is derived from the current opportunities.json dataset',
      loading: 'Analyzing opportunity data...',
      errorTitle: 'Unable to load statistics',
      errorCopy: 'The opportunity dataset could not be read. Make sure the local server is running, then try again.',
      retry: 'Try again',
      overviewKicker: 'At a glance',
      overviewTitle: 'Dataset overview',
      totalLabel: 'Total opportunities',
      totalNote: 'Verified opportunities in the dataset',
      countriesLabel: 'Countries & scopes',
      countriesNote: 'Countries or international scopes represented',
      categoriesLabel: 'Fields',
      categoriesNote: 'Distinct opportunity fields represented',
      fullyFundedLabel: 'Fully funded',
      fullyFundedNote: 'Based on verified source information',
      typeKicker: 'By type',
      typeTitle: 'Opportunity types',
      categoryKicker: 'By field',
      categoryTitle: 'Fields and categories',
      countryKicker: 'By destination',
      countryTitle: 'Countries and global scope',
      fundingKicker: 'By funding',
      fundingTitle: 'Funding types',
      dataNote: 'Note: these statistics describe the current records only and may change when opportunities are re-verified or the dataset is updated.',
      footer: 'Yemen Opportunities Portal — trusted opportunities and clearer access for Yemeni youth',
      noData: 'No classified data is available to display.',
      global: 'International / Global',
      notSpecified: 'Not specified in official source'
    }
  };

  const TYPE_LABELS = {
    scholarship: { ar: 'منحة دراسية', en: 'Scholarship' },
    fellowship: { ar: 'زمالة', en: 'Fellowship' },
    internship: { ar: 'تدريب عملي', en: 'Internship' },
    course: { ar: 'دورة', en: 'Course' },
    training: { ar: 'برنامج تدريبي', en: 'Training Program' },
    competition: { ar: 'مسابقة', en: 'Competition' },
    grant: { ar: 'منحة تمويلية', en: 'Grant' },
    exchange: { ar: 'برنامج تبادل', en: 'Exchange Program' }
  };

  const CATEGORY_LABELS = {
    technology: { ar: 'التقنية وتقنية المعلومات', en: 'Technology & IT' },
    engineering: { ar: 'الهندسة', en: 'Engineering' },
    health: { ar: 'الطب والصحة', en: 'Medicine & Health' },
    business: { ar: 'الأعمال والإدارة', en: 'Business & Management' },
    humanities: { ar: 'العلوم الإنسانية والاجتماعية', en: 'Humanities & Social Sciences' },
    education: { ar: 'التعليم والتدريس', en: 'Education & Teaching' },
    arts: { ar: 'الفنون والتصميم', en: 'Arts & Design' },
    general: { ar: 'عام ومتعدد التخصصات', en: 'General & Multidisciplinary' }
  };

  const FUNDING_LABELS = {
    'fully-funded': { ar: 'ممولة بالكامل', en: 'Fully Funded' },
    'partially-funded': { ar: 'ممولة جزئياً', en: 'Partially Funded' },
    'self-funded': { ar: 'تمويل ذاتي', en: 'Self Funded' },
    funded: { ar: 'ممولة', en: 'Funded' },
    free: { ar: 'مجانية', en: 'Free' }
  };

  const state = {
    lang: new URLSearchParams(window.location.search).get('lang') === 'en' ? 'en' : 'ar',
    opportunities: []
  };

  const dom = {
    description: document.getElementById('pageDescription'),
    langToggle: document.getElementById('langToggle'),
    mainNav: document.getElementById('mainNav'),
    homeLink: document.getElementById('homeLink'),
    opportunitiesNav: document.getElementById('opportunitiesNav'),
    statisticsNav: document.getElementById('statisticsNav'),
    aboutNav: document.getElementById('aboutNav'),
    loading: document.getElementById('statisticsLoading'),
    error: document.getElementById('statisticsError'),
    content: document.getElementById('statisticsContent'),
    retryButton: document.getElementById('retryButton'),
    total: document.getElementById('totalOpportunities'),
    countryCount: document.getElementById('countryCount'),
    categoryCount: document.getElementById('categoryCount'),
    fullyFundedCount: document.getElementById('fullyFundedCount'),
    typeStatistics: document.getElementById('typeStatistics'),
    categoryStatistics: document.getElementById('categoryStatistics'),
    countryStatistics: document.getElementById('countryStatistics'),
    fundingStatistics: document.getElementById('fundingStatistics')
  };

  function currentText() {
    return UI[state.lang];
  }

  function applyLanguage() {
    const t = currentText();

    document.documentElement.lang = state.lang;
    document.documentElement.dir = state.lang === 'ar' ? 'rtl' : 'ltr';
    document.title = t.pageTitle;
    dom.description.setAttribute('content', t.description);
    dom.mainNav.setAttribute(
      'aria-label',
      state.lang === 'ar' ? 'التنقل الرئيسي' : 'Main navigation'
    );

    document.querySelectorAll('[data-i18n]').forEach((element) => {
      const key = element.dataset.i18n;
      if (Object.prototype.hasOwnProperty.call(t, key)) {
        element.textContent = t[key];
      }
    });

    dom.langToggle.textContent = t.languageButton;
    dom.langToggle.setAttribute('aria-label', t.languageAria);

    const langQuery = `?lang=${encodeURIComponent(state.lang)}`;
    dom.homeLink.href = `index.html${langQuery}`;
    dom.opportunitiesNav.href = `index.html${langQuery}`;
    dom.statisticsNav.href = `statistics.html${langQuery}`;
    dom.aboutNav.href = `about.html${langQuery}`;
  }

  function increment(map, key) {
    map.set(key, (map.get(key) || 0) + 1);
  }

  function countArrayValues(opportunities, field) {
    const counts = new Map();

    opportunities.forEach((opportunity) => {
      const values = Array.isArray(opportunity[field]) ? opportunity[field] : [];
      values.forEach((value) => {
        if (typeof value === 'string' && value.trim()) {
          increment(counts, value.trim());
        }
      });
    });

    return counts;
  }

  function countSingleValues(opportunities, field, missingKey = null) {
    const counts = new Map();

    opportunities.forEach((opportunity) => {
      const value = opportunity[field];

      if (typeof value === 'string' && value.trim()) {
        increment(counts, value.trim());
      } else if (missingKey !== null) {
        increment(counts, missingKey);
      }
    });

    return counts;
  }

  function countryKey(country) {
    if (country === null || typeof country === 'undefined' || country === '') {
      return '__global__';
    }

    if (typeof country === 'string') {
      return country.trim() || '__global__';
    }

    if (typeof country === 'object') {
      if (typeof country.code === 'string' && country.code.trim()) {
        return country.code.trim();
      }

      if (country.name && typeof country.name === 'object') {
        const localizedName = country.name[state.lang];
        if (typeof localizedName === 'string' && localizedName.trim()) {
          return localizedName.trim();
        }
      }
    }

    return '__global__';
  }

  function countCountries(opportunities) {
    const counts = new Map();

    opportunities.forEach((opportunity) => {
      increment(counts, countryKey(opportunity.country));
    });

    return counts;
  }

  function fallbackLabel(value) {
    return String(value)
      .replace(/[-_]+/g, ' ')
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  function typeLabel(value) {
    return TYPE_LABELS[value]?.[state.lang] || fallbackLabel(value);
  }

  function categoryLabel(value) {
    return CATEGORY_LABELS[value]?.[state.lang] || fallbackLabel(value);
  }

  function fundingLabel(value) {
    if (value === '__unspecified__') {
      return currentText().notSpecified;
    }

    return FUNDING_LABELS[value]?.[state.lang] || fallbackLabel(value);
  }

  function countryLabel(value) {
    if (value === '__global__') {
      return currentText().global;
    }

    if (/^[A-Z]{2}$/.test(value)) {
      try {
        const displayNames = new Intl.DisplayNames(
          [state.lang === 'ar' ? 'ar' : 'en'],
          { type: 'region' }
        );

        return displayNames.of(value) || value;
      } catch (error) {
        return value;
      }
    }

    return value;
  }

  function sortedEntries(counts, labelFunction) {
    return [...counts.entries()]
      .map(([key, count]) => ({
        key,
        count,
        label: labelFunction(key)
      }))
      .sort((a, b) => {
        if (b.count !== a.count) {
          return b.count - a.count;
        }

        return a.label.localeCompare(
          b.label,
          state.lang === 'ar' ? 'ar' : 'en'
        );
      });
  }

  function renderBars(container, counts, labelFunction) {
    container.replaceChildren();

    const entries = sortedEntries(counts, labelFunction);

    if (!entries.length) {
      const empty = document.createElement('p');
      empty.className = 'statistics-empty';
      empty.textContent = currentText().noData;
      container.appendChild(empty);
      return;
    }

    const maxCount = Math.max(...entries.map((entry) => entry.count), 1);

    entries.forEach((entry) => {
      const item = document.createElement('div');
      item.className = 'statistics-bar-item';

      const meta = document.createElement('div');
      meta.className = 'statistics-bar-meta';

      const label = document.createElement('span');
      label.className = 'statistics-bar-label';
      label.textContent = entry.label;

      const count = document.createElement('span');
      count.className = 'statistics-bar-count';
      count.textContent = String(entry.count);

      const track = document.createElement('div');
      track.className = 'statistics-bar-track';
      track.setAttribute('aria-hidden', 'true');

      const fill = document.createElement('div');
      fill.className = 'statistics-bar-fill';
      fill.style.width = `${(entry.count / maxCount) * 100}%`;

      meta.append(label, count);
      track.appendChild(fill);
      item.append(meta, track);
      container.appendChild(item);
    });
  }

  function renderStatistics() {
    const opportunities = state.opportunities;

    const typeCounts = countSingleValues(opportunities, 'type');
    const categoryCounts = countArrayValues(opportunities, 'categories');
    const countryCounts = countCountries(opportunities);
    const fundingCounts = countSingleValues(
      opportunities,
      'fundingType',
      '__unspecified__'
    );

    dom.total.textContent = String(opportunities.length);
    dom.countryCount.textContent = String(countryCounts.size);
    dom.categoryCount.textContent = String(categoryCounts.size);
    dom.fullyFundedCount.textContent = String(
      fundingCounts.get('fully-funded') || 0
    );

    renderBars(dom.typeStatistics, typeCounts, typeLabel);
    renderBars(dom.categoryStatistics, categoryCounts, categoryLabel);
    renderBars(dom.countryStatistics, countryCounts, countryLabel);
    renderBars(dom.fundingStatistics, fundingCounts, fundingLabel);
  }

  async function loadStatistics() {
    dom.loading.hidden = false;
    dom.error.hidden = true;
    dom.content.hidden = true;

    try {
      const response = await fetch('data/opportunities.json');

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (!data || !Array.isArray(data.opportunities)) {
        throw new Error('Malformed opportunities dataset.');
      }

      state.opportunities = data.opportunities;
      renderStatistics();

      dom.loading.hidden = true;
      dom.content.hidden = false;
    } catch (error) {
      console.error('Statistics dashboard failed to load:', error);
      dom.loading.hidden = true;
      dom.error.hidden = false;
    }
  }

  dom.langToggle.addEventListener('click', () => {
    const nextLang = state.lang === 'ar' ? 'en' : 'ar';
    window.location.href = `statistics.html?lang=${encodeURIComponent(nextLang)}`;
  });

  dom.retryButton.addEventListener('click', loadStatistics);

  applyLanguage();
  loadStatistics();
})();