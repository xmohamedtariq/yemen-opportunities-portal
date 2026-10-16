/**
 * Yemen Opportunities Portal - About
 */

(function () {
  'use strict';

  const params =
    new URLSearchParams(window.location.search);

  const state = {
    lang: params.get('lang') === 'en'
      ? 'en'
      : 'ar'
  };

  const copy = {
    ar: {
      pageTitle: 'عن بوابة فرص اليمن',
      skipLink: 'انتقل إلى المحتوى الرئيسي',
      brandTagline: 'فرص أوضح. وصول أسهل.',
      homeNav: 'الفرص',
      aboutNav: 'عن البوابة',

      heroEyebrow: 'Yemen Opportunities Portal',
      heroTitlePrimary: 'فرص موثوقة.',
      heroTitleAccent: 'طريق أوضح لما هو قادم.',
      heroDescription:
        'منح، دورات، تدريب وفرص مهنية للشباب اليمني، منظمة في مكان واحد ومرتبطة دائمًا بمصادرها الرسمية.',
      exploreButton: 'استكشف الفرص',
      trustButton: 'كيف نتحقق؟',

      trustOfficial: 'مصادر رسمية',
      trustReviewed: 'تحقق يدوي',
      trustNoSignup: 'بدون تسجيل',

      visualHeading: 'اكتشف ما يناسبك',
      visualSearch: 'ابحث عن فرصة...',
      visualType1: 'منحة دراسية',
      visualTitle1: 'فرص تعليمية موثوقة',
      visualMeta1: 'مصدر رسمي',
      visualType2: 'تدريب',
      visualTitle2: 'فرص لتطوير مهاراتك',
      visualMeta2: 'معلومات واضحة',
      visualType3: 'دورات',
      visualTitle3: 'تعلم من أي مكان',
      visualMeta3: 'وصول مباشر',

      whyEyebrow: 'لماذا بوابة فرص اليمن؟',
      whyTitle: 'أقل بحثًا. وضوح أكثر.',
      whyDescription:
        'ركز على الفرصة نفسها بدل قضاء وقتك بين عشرات المواقع والروابط.',

      feature1Title: 'اكتشف أسرع',
      feature1Text:
        'ابحث وفلتر الفرص حسب ما يناسب أهدافك.',

      feature2Title: 'اعتمد على المصدر',
      feature2Text:
        'كل فرصة تقودك إلى المصدر الرسمي للمعلومة.',

      feature3Title: 'احتفظ بما يهمك',
      feature3Text:
        'احفظ فرصك المفضلة وارجع إليها بسهولة.',

      howEyebrow: 'بسيطة من البداية',
      howTitle: 'من الاكتشاف إلى المصدر الرسمي.',

      step1Title: 'اكتشف',
      step1Text: 'ابحث بين الفرص التي تهمك.',

      step2Title: 'قارن',
      step2Text:
        'راجع التفاصيل والمواعيد والمتطلبات.',

      step3Title: 'انتقل للمصدر',
      step3Text:
        'أكمل رحلتك من الصفحة الرسمية للفرصة.',

      trustSectionEyebrow: 'الثقة قبل كل شيء',
      trustSectionTitle:
        'كل فرصة تبدأ من مصدر موثوق.',
      trustSectionText:
        'نراجع المعلومات الأساسية ونربط كل فرصة بمصدرها الرسمي. لا نُنشئ فرصًا غير موجودة، ولا نستبدل المصدر الرسمي بمعلومة غير موثقة.',

      trustPoint1: 'مصدر رسمي',
      trustPoint2: 'معلومات واضحة',
      trustPoint3: 'تحقق قبل النشر',

      creatorEyebrow: 'صُنعت بهدف',
      creatorName: 'Mohammed Tariq Al-Saqaf',
      creatorRole:
        'AI Solutions Developer & Data Analyst',
      creatorBio:
        'أنا محمد طارق السقاف، مطور حلول ذكاء اصطناعي ومحلل بيانات بخلفية في هندسة الميكاترونكس. أهتم ببناء حلول عملية تجعل التقنية والبيانات أكثر فائدة للناس.',
      creatorMission:
        'بنيت بوابة فرص اليمن لأن الوصول إلى الفرص الموثوقة يجب أن يكون أبسط وأكثر وضوحًا للشباب اليمني.',

      ctaEyebrow: 'ابدأ الآن',
      ctaTitle: 'فرصتك القادمة قد تكون هنا.',
      ctaText:
        'استكشف الفرص الحالية وابحث عما يناسب مسارك وطموحك.',
      ctaButton: 'استكشف الفرص',

      footerText: 'فرص أوضح للشباب اليمني.'
    },

    en: {
      pageTitle: 'About | Yemen Opportunities Portal',
      skipLink: 'Skip to main content',
      brandTagline: 'Clearer opportunities. Easier access.',
      homeNav: 'Opportunities',
      aboutNav: 'About',

      heroEyebrow: 'Yemen Opportunities Portal',
      heroTitlePrimary: 'Verified opportunities.',
      heroTitleAccent: 'A clearer path to what comes next.',
      heroDescription:
        'Scholarships, courses, internships, and professional opportunities for Yemeni youth, organized in one place and connected to official sources.',
      exploreButton: 'Explore Opportunities',
      trustButton: 'How do we verify?',

      trustOfficial: 'Official sources',
      trustReviewed: 'Manually reviewed',
      trustNoSignup: 'No sign-up',

      visualHeading: 'Find what fits you',
      visualSearch: 'Search opportunities...',
      visualType1: 'Scholarship',
      visualTitle1: 'Trusted education opportunities',
      visualMeta1: 'Official source',
      visualType2: 'Internship',
      visualTitle2: 'Opportunities to grow',
      visualMeta2: 'Clear information',
      visualType3: 'Courses',
      visualTitle3: 'Learn from anywhere',
      visualMeta3: 'Direct access',

      whyEyebrow: 'Why Yemen Opportunities Portal?',
      whyTitle: 'Less searching. More clarity.',
      whyDescription:
        'Focus on the opportunity itself instead of spending your time across scattered websites and links.',

      feature1Title: 'Discover faster',
      feature1Text:
        'Search and filter opportunities around your goals.',

      feature2Title: 'Trust the source',
      feature2Text:
        'Every opportunity takes you back to its official source.',

      feature3Title: 'Save what matters',
      feature3Text:
        'Keep your favorite opportunities easy to revisit.',

      howEyebrow: 'Simple from the start',
      howTitle: 'From discovery to the official source.',

      step1Title: 'Discover',
      step1Text:
        'Explore opportunities relevant to you.',

      step2Title: 'Compare',
      step2Text:
        'Review details, deadlines, and requirements.',

      step3Title: 'Go official',
      step3Text:
        'Continue from the opportunity’s official page.',

      trustSectionEyebrow: 'Trust comes first',
      trustSectionTitle:
        'Every opportunity starts with a trusted source.',
      trustSectionText:
        'We review key information and connect every opportunity to its official source. We do not invent opportunities or replace official information with unverified claims.',

      trustPoint1: 'Official source',
      trustPoint2: 'Clear information',
      trustPoint3: 'Reviewed before publishing',

      creatorEyebrow: 'Built with purpose',
      creatorName: 'Mohammed Tariq Al-Saqaf',
      creatorRole:
        'AI Solutions Developer & Data Analyst',
      creatorBio:
        "I'm Mohammed Tariq Al-Saqaf, an AI Solutions Developer and Data Analyst with a background in Mechatronics Engineering. I focus on building practical solutions that make technology and data more useful to people.",
      creatorMission:
        'I created Yemen Opportunities Portal because access to trusted opportunities should be simpler and clearer for Yemeni youth.',

      ctaEyebrow: 'Start here',
      ctaTitle:
        'Your next opportunity could be here.',
      ctaText:
        'Explore current opportunities and find what fits your path and ambitions.',
      ctaButton: 'Explore Opportunities',

      footerText:
        'Clearer opportunities for Yemeni youth.'
    }
  };

  const ids = [
    'brandTagline',
    'homeNav',
    'aboutNav',
    'heroEyebrow',
    'heroTitlePrimary',
    'heroTitleAccent',
    'heroDescription',
    'exploreButton',
    'trustButton',
    'trustOfficial',
    'trustReviewed',
    'trustNoSignup',
    'visualHeading',
    'visualSearch',
    'visualType1',
    'visualTitle1',
    'visualMeta1',
    'visualType2',
    'visualTitle2',
    'visualMeta2',
    'visualType3',
    'visualTitle3',
    'visualMeta3',
    'whyEyebrow',
    'whyTitle',
    'whyDescription',
    'feature1Title',
    'feature1Text',
    'feature2Title',
    'feature2Text',
    'feature3Title',
    'feature3Text',
    'howEyebrow',
    'howTitle',
    'step1Title',
    'step1Text',
    'step2Title',
    'step2Text',
    'step3Title',
    'step3Text',
    'trustSectionEyebrow',
    'trustSectionTitle',
    'trustSectionText',
    'trustPoint1',
    'trustPoint2',
    'trustPoint3',
    'creatorEyebrow',
    'creatorName',
    'creatorRole',
    'creatorBio',
    'creatorMission',
    'ctaEyebrow',
    'ctaTitle',
    'ctaText',
    'ctaButton',
    'footerText'
  ];

  function render() {
    const t = copy[state.lang];

    document.documentElement.lang =
      state.lang;

    document.documentElement.dir =
      state.lang === 'ar'
        ? 'rtl'
        : 'ltr';

    document.title = t.pageTitle;

    document
      .getElementById('skipLink')
      .textContent = t.skipLink;

    document
      .getElementById('siteTitle')
      .textContent =
        state.lang === 'ar'
          ? 'بوابة فرص اليمن'
          : 'Yemen Opportunities Portal';

    ids.forEach(id => {
      const element =
        document.getElementById(id);

      if (element && t[id] !== undefined) {
        element.textContent = t[id];
      }
    });

    const langToggle =
      document.getElementById('langToggle');

    langToggle.textContent =
      state.lang === 'ar'
        ? 'الإنجليزية'
        : 'Arabic';

    langToggle.setAttribute(
      'aria-label',
      state.lang === 'ar'
        ? 'Switch language to English'
        : 'التحويل إلى اللغة العربية'
    );

    if (
      window.PortalNavigation &&
      typeof window.PortalNavigation.sync ===
        'function'
    ) {
      window.PortalNavigation.sync();
    }
  }

  function toggleLanguage() {
    state.lang =
      state.lang === 'ar'
        ? 'en'
        : 'ar';

    const url =
      new URL(window.location.href);

    url.searchParams.set(
      'lang',
      state.lang
    );

    window.history.replaceState(
      null,
      '',
      url
    );

    render();
  }

  document
    .getElementById('langToggle')
    .addEventListener(
      'click',
      toggleLanguage
    );

  render();
})();
