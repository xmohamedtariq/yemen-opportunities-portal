/**
 * Yemen Opportunities Portal - Translations Dictionary
 * Bilingual strings for Arabic (primary) and English interfaces.
 */

const translations = {
  ar: {
    siteTitle: 'بوابة فرص اليمن',
    siteSubtitle: 'دليلك الموثوق للمنح الدراسية والدورات والفرص التدريبية والمهنية للشباب اليمني',
    langToggle: 'English',
    searchLabel: 'البحث عن فرصة',
    searchPlaceholder: 'ابحث بالكلمات المفتاحية (العنوان، الجهة، الوصف)...',
    clearSearch: 'مسح البحث',
    filtersHeading: 'تصفية الفرص',
    filterType: 'نوع الفرصة',
    filterCategory: 'المجال / التخصص',
    filterCountry: 'الدولة / النطاق',
    filterEdu: 'المستوى التعليمي',
    filterDelivery: 'نمط الحضور',
    filterFunding: 'نوع التمويل',
    allOption: 'الكل',
    globalOption: 'فرصة دولية / عامة',
    resetFilters: 'إعادة ضبط الفلاتر',
    deadlineLabel: 'الموعد النهائي:',
    closingSoonBadge: 'ينتهي قريباً',
    rollingDeadline: 'تقديم مستمر',
    unspecifiedDeadline: 'غير محدد في المصدر الرسمي',
    officialSource: 'المصدر الرسمي ↗',
    verifiedDate: 'تاريخ التحقق:',
    emptyTitle: 'لا توجد نتائج مطابقة لخيارات البحث',
    emptyMessage: 'جرب تعديل الكلمات المفتاحية أو إعادة ضبط الفلاتر للاطلاع على جميع الفرص المتاحة.',
    emptyResetBtn: 'إعادة ضبط الفلاتر وعرض الكل',
    errorTitle: 'تعذر تحميل بيانات الفرص',
    errorMessage: 'يرجى التأكد من تشغيل الخادم المحلي أو التحقق من الاتصال وإعادة المحاولة.',
    retryBtn: 'إعادة المحاولة',
    footerText: 'بوابة فرص اليمن — منصة تعليمية غير ربحية لخدمة الطلاب والشباب اليمني',
    resultsCount: (count) => {
      if (count === 0) return 'لم يتم العثور على أي فرصة';
      if (count === 1) return 'تم العثور على فرصة واحدة';
      if (count === 2) return 'تم العثور على فرصتين';
      if (count >= 3 && count <= 10) return `تم العثور على ${count} فرص`;
      return `تم العثور على ${count} فرصة`;
    },
    enums: {
      types: {
        scholarship: 'منحة دراسية',
        fellowship: 'زمالة',
        internship: 'تدريب عملي',
        course: 'دورة تعليمية',
        training: 'برنامج تدريبي',
        competition: 'مسابقة',
        grant: 'منحة مالية',
        exchange: 'برنامج تبادل'
      },
      categories: {
        technology: 'تكنولوجيا ومعلومات',
        engineering: 'هندسة وعلوم تطبيقية',
        health: 'طب وعلوم صحية',
        business: 'إدارة وأعمال',
        humanities: 'علوم إنسانية واجتماعية',
        education: 'تعليم وتدريس',
        arts: 'فنون وإعلام وتصميم',
        general: 'تخصصات عامة ومتعددة'
      },
      educationLevels: {
        school: 'طلاب المدارس',
        bachelor: 'بكالوريوس',
        master: 'ماجستير',
        phd: 'دكتوراه',
        'fresh-graduate': 'حديثو التخرج',
        professional: 'مهنيون وممارسون',
        'open-to-all': 'متاح للجميع'
      },
      deliveryModes: {
        online: 'عبر الإنترنت',
        'in-person': 'حضورياً',
        hybrid: 'مدمج'
      },
      fundingTypes: {
        'fully-funded': 'ممولة بالكامل',
        'partially-funded': 'ممولة جزئياً',
        free: 'مجانية بالكامل',
        'paid-stipend': 'مدفوعة الأجر',
        'self-funded': 'رسوم ذاتية'
      },
      applicationStatuses: {
        open: 'متاح للتقديم',
        upcoming: 'يفتح قريباً',
        closed: 'مغلق',
        suspended: 'معلق مؤقتاً'
      },
      countries: {
        YE: 'اليمن',
        GB: 'المملكة المتحدة',
        CA: 'كندا',
        CN: 'الصين',
        SA: 'المملكة العربية السعودية',
        NL: 'هولندا',
        DE: 'ألمانيا'
      }
    }
  },
  en: {
    siteTitle: 'Yemen Opportunities Portal',
    siteSubtitle: 'Your verified guide to scholarships, courses, and professional opportunities for Yemeni youth',
    langToggle: 'العربية',
    searchLabel: 'Search opportunities',
    searchPlaceholder: 'Search by keywords (title, provider, description)...',
    clearSearch: 'Clear search',
    filtersHeading: 'Filter Opportunities',
    filterType: 'Opportunity Type',
    filterCategory: 'Field / Category',
    filterCountry: 'Country / Scope',
    filterEdu: 'Education Level',
    filterDelivery: 'Delivery Mode',
    filterFunding: 'Funding Type',
    allOption: 'All',
    globalOption: 'International / Global',
    resetFilters: 'Reset Filters',
    deadlineLabel: 'Deadline:',
    closingSoonBadge: 'Closing Soon',
    rollingDeadline: 'Rolling Deadline',
    unspecifiedDeadline: 'Not specified in official source',
    officialSource: 'Official Source ↗',
    verifiedDate: 'Verified on:',
    emptyTitle: 'No matching opportunities found',
    emptyMessage: 'Try adjusting your search terms or resetting filters to view all available opportunities.',
    emptyResetBtn: 'Reset Filters & Show All',
    errorTitle: 'Failed to load opportunities data',
    errorMessage: 'Please ensure the local server is running or check your connection and try again.',
    retryBtn: 'Retry',
    footerText: 'Yemen Opportunities Portal — Non-profit educational portal supporting Yemeni youth',
    resultsCount: (count) => {
      if (count === 0) return 'No opportunities found';
      if (count === 1) return '1 opportunity found';
      return `${count} opportunities found`;
    },
    enums: {
      types: {
        scholarship: 'Scholarship',
        fellowship: 'Fellowship',
        internship: 'Internship',
        course: 'Course',
        training: 'Training Program',
        competition: 'Competition',
        grant: 'Grant',
        exchange: 'Exchange Program'
      },
      categories: {
        technology: 'Technology & IT',
        engineering: 'Engineering',
        health: 'Medicine & Health',
        business: 'Business & Management',
        humanities: 'Humanities & Social Sciences',
        education: 'Education & Teaching',
        arts: 'Arts & Design',
        general: 'General & Multidisciplinary'
      },
      educationLevels: {
        school: 'High School',
        bachelor: 'Bachelor',
        master: "Master's",
        phd: 'PhD',
        'fresh-graduate': 'Fresh Graduates',
        professional: 'Professionals',
        'open-to-all': 'Open to All'
      },
      deliveryModes: {
        online: 'Online',
        'in-person': 'In-Person',
        hybrid: 'Hybrid'
      },
      fundingTypes: {
        'fully-funded': 'Fully Funded',
        'partially-funded': 'Partially Funded',
        free: 'Free',
        'paid-stipend': 'Paid / Stipend',
        'self-funded': 'Self-funded'
      },
      applicationStatuses: {
        open: 'Open',
        upcoming: 'Upcoming',
        closed: 'Closed',
        suspended: 'Suspended'
      },
      countries: {
        YE: 'Yemen',
        GB: 'United Kingdom',
        CA: 'Canada',
        CN: 'China',
        SA: 'Saudi Arabia',
        NL: 'Netherlands',
        DE: 'Germany'
      }
    }
  }
};
