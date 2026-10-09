import { Language } from './types';

export interface BilingualEntry {
  en: string;
  ar: string;
}

export function pick(entry: BilingualEntry | undefined, lang: Language): string {
  if (!entry) return '';
  return entry[lang] || entry.en || '';
}

export const T = {
  emergencyBar: {
    badge: {
      en: '24/7 Emergency Response',
      ar: 'طوارئ واستجابة على مدار ٢٤/٧',
    },
    coverage: {
      en: 'Rapid technician dispatch across Eastern Province & Riyadh',
      ar: 'مباشرة ميدانية سريعة في المنطقة الشرقية والرياض',
    },
    callNow: {
      en: 'Call 24/7: +966 55 064 1000',
      ar: 'اتصل للطوارئ: 0550641000',
    },
    phoneNumber: '+966 55 064 1000',
    phoneDisplay: '+966 55 064 1000',
  },
  brand: {
    wordHard: 'HARD',
    suffix: 'HVAC Maintenance',
    portalTitle: {
      en: 'Corporate Group Portal',
      ar: 'بوابة المجموعة',
    },
    constructionTitle: {
      en: 'Construction Division',
      ar: 'قطاع الإنشاءات',
    },
    realEstateTitle: {
      en: 'Real Estate Division',
      ar: 'قطاع العقارات',
    },
  },
  nav: {
    services: {
      en: 'Services',
      ar: 'خدماتنا',
    },
    whyUs: {
      en: 'Why Choose Us',
      ar: 'لماذا هارد؟',
    },
    work: {
      en: 'Our Work',
      ar: 'معرض الأعمال',
    },
    calculator: {
      en: 'Efficiency Calc',
      ar: 'حاسبة الكفاءة',
    },
    checklist: {
      en: 'Maintenance Guide',
      ar: 'دليل الصيانة',
    },
    reviews: {
      en: 'Reviews',
      ar: 'آراء العملاء',
    },
    faq: {
      en: 'FAQ',
      ar: 'الأسئلة الشائعة',
    },
    contact: {
      en: 'Contact Us',
      ar: 'اتصل بنا',
    },
    callPill: {
      en: 'Call 24/7',
      ar: 'اتصال 24/7',
    },
    bookServiceBtn: {
      en: 'Book Service Now',
      ar: 'احجز موعد صيانة',
    },
    portalBack: {
      en: 'Group Portal',
      ar: 'بوابة هارد',
    },
    adminPanel: {
      en: 'Admin CMS',
      ar: 'لوحة التحكم',
    },
  },
  hero: {
    eyebrow: {
      en: 'Heating · Cooling · Ventilation',
      ar: 'التبريد · التدفئة · التهوية المركزية',
    },
    headline: {
      en: 'Precision AC Maintenance & Deep Cleaning for Lasting Cooling in Saudi Climate',
      ar: 'صيانة وغسيل أجهزة التكييف والتبريد بأعلى معايير الدقة والاحترافية',
    },
    subheadline: {
      en: 'Certified HVAC engineers delivering deep coil chemical cleaning, rapid troubleshooting, duct sanitization, and preventative maintenance contracts across the Eastern Province and Riyadh.',
      ar: 'كوادر هندسية وفنية متخصصة تقدم غسيل كيميائي شامل للكويلات، صيانة الأعطال المستعصية، وتعقيم مجاري الهواء مع عقود صيانة سنوية موثوقة في المنطقة الشرقية والرياض.',
    },
    badge1: {
      en: 'SBC & SASO Compliant',
      ar: 'معتمد وفق الكود السعودي والمواصفات',
    },
    badge2: {
      en: '24/7 Emergency Dispatch',
      ar: 'مباشرة طوارئ ٢٤ ساعة',
    },
    badge3: {
      en: 'Genuine Spare Parts Guarantee',
      ar: 'ضمان قطع الغيار الأصلية',
    },
  },
  quoteForm: {
    title: {
      en: 'Get Instant Service Quote',
      ar: 'احصل على عرض سعر فوري',
    },
    subtitle: {
      en: 'Select your city & service for prompt scheduling',
      ar: 'حدد مدينتك ونوع الخدمة لبدء التنسيق الفوري',
    },
    cityLabel: {
      en: 'Select City',
      ar: 'اختر المدينة',
    },
    cityPlaceholder: {
      en: 'Select your location...',
      ar: 'اختر موقعك...',
    },
    otherCityLabel: {
      en: 'Specify Your City / District',
      ar: 'حدد مدينتك أو حيك السكني',
    },
    otherCityPlaceholder: {
      en: 'e.g. Al Hasa, Bqaiq, Industrial Area...',
      ar: 'مثال: الأحساء، بقيق، المدينة الصناعية...',
    },
    serviceLabel: {
      en: 'Service Type',
      ar: 'نوع الخدمة المطلوبة',
    },
    servicePlaceholder: {
      en: 'Select AC Service...',
      ar: 'اختر الخدمة...',
    },
    btnInstantQuote: {
      en: 'Get Instant Quote',
      ar: 'احصل على عرض السعر',
    },
    dialogTitle: {
      en: 'Complete Your Quote Request',
      ar: 'استكمال بيانات طلب عرض السعر',
    },
    dialogSubtitle: {
      en: 'Our dispatch engineer will review your system specs and confirm exact timing within 15 minutes.',
      ar: 'سيقوم مهندس التشغيل بمراجعة تفاصيل جهازك والتواصل لتأكيد الموعد خلال 15 دقيقة.',
    },
    fullNameLabel: {
      en: 'Full Name',
      ar: 'الاسم الكامل',
    },
    phoneLabel: {
      en: 'Phone Number (Saudi Mobile)',
      ar: 'رقم الجوال السعودي',
    },
    emailLabel: {
      en: 'Email Address (Optional)',
      ar: 'البريد الإلكتروني (اختياري)',
    },
    notesLabel: {
      en: 'Unit Details & Symptoms (e.g. 3 Split units, not cooling, water leak)',
      ar: 'تفاصيل الأجهزة والعطل (مثال: ٣ مكيفات سبليت، تبريد ضعيف، تسريب مياه)',
    },
    urgencyLabel: {
      en: 'Urgent Same-Day Emergency Dispatch',
      ar: 'طلب صيانة طارئة في نفس اليوم',
    },
    refLabel: {
      en: 'Reference ID Generated:',
      ar: 'الرقم المرجعي للطلب:',
    },
    submitBtn: {
      en: 'Send Request',
      ar: 'إرسال طلب الصيانة',
    },
    sendingBtn: {
      en: 'Sending...',
      ar: 'جاري الإرسال...',
    },
    whatsappHandoff: {
      en: 'Continue on WhatsApp',
      ar: 'المتابعة المباشرة عبر واتساب',
    },
    successMessage: {
      en: 'Your quote request has been recorded successfully. Reference:',
      ar: 'تم تسجيل طلبك بنجاح. الرقم المرجعي للطلب:',
    },
    closeBtn: {
      en: 'Close',
      ar: 'إغلاق',
    },
  },
  services: {
    eyebrow: {
      en: 'Our Specialized Capabilities',
      ar: 'حلولنا الشاملة',
    },
    title: {
      en: 'Complete HVAC Engineering & Maintenance Services',
      ar: 'خدمات هندسية متكاملة لصيانة وتشغيل أنظمة التكييف',
    },
    subtitle: {
      en: 'From residential split systems to heavy central VRF chillers, HARD delivers certified maintenance with precision diagnostic tools.',
      ar: 'من المكيفات الجدارية والسبليت للمنازل، إلى أنظمة الشيلرات والمكيفات المركزية والباكج للشركات والمجمعات.',
    },
  },
  whyUs: {
    eyebrow: {
      en: 'The HARD Advantage',
      ar: 'معايير التميز',
    },
    title: {
      en: 'Why Residential & Commercial Clients Trust HARD HVAC',
      ar: 'لماذا يختار عملاؤنا في الشرقية خدمات هارد؟',
    },
    subtitle: {
      en: 'Engineered for extreme Gulf summer loads with uncompromising craftsmanship, safety certifications, and transparent pricing.',
      ar: 'مصممة للعمل بكفاءة تامة تحت درجات حرارة الصيف القصوى، مع التزام صارم بالأمان والشفافية التامة.',
    },
    badges: [
      {
        id: 'licensed',
        title: {
          en: 'Licensed & Insured',
          ar: 'مرخص ومعتمد نظاميًا',
        },
        desc: {
          en: 'Fully registered Saudi commercial entity with comprehensive liability insurance and municipality compliance.',
          ar: 'كيان سعودي معتمد ومؤهل رسميًا مع تغطية تأمينية شاملة والتزام بأنظمة البلديات والدفاع المدني.',
        },
      },
      {
        id: 'certified',
        title: {
          en: 'Certified HVAC Technicians',
          ar: 'مهندسون وفنيون معتمدون',
        },
        desc: {
          en: 'Rigorous manufacturer-certified staff specialized in Daikin, Carrier, LG, Gree, York, and Trane systems.',
          ar: 'كوادر مؤهلة وخبراء معتمدون في أنظمة دايكن، كارير، إل جي، جري، يورك، وترين بمختلف السعات.',
        },
      },
      {
        id: 'pricing',
        title: {
          en: 'Upfront Transparent Pricing',
          ar: 'تسعير واضح وشفاف',
        },
        desc: {
          en: 'Detailed itemized quotes before any work begins — no hidden diagnosis fees or unexpected surcharges.',
          ar: 'عروض أسعار تفصيلية ومحددة قبل بدء أي عمل دون أي رسوم فحص مخفية أو تكاليف غير معلنة.',
        },
      },
      {
        id: 'dispatch',
        title: {
          en: '24/7 Rapid Emergency Response',
          ar: 'استجابة طوارئ على مدار الساعة',
        },
        desc: {
          en: 'Dedicated mobile service vans equipped with diagnostic pressure gauges, vacuum pumps, and genuine gas cylinders.',
          ar: 'أسطول متنقل مجهز بأحدث أجهزة كشف الأعطال ومضخات التفريغ واسطوانات الفريون الأصلية.',
        },
      },
      {
        id: 'warranty',
        title: {
          en: 'Comprehensive Service Warranty',
          ar: 'ضمان مكتوب على الصيانة والقطع',
        },
        desc: {
          en: 'All repairs, compressor replacements, and cleaning procedures are backed by a certified warranty certificate.',
          ar: 'نوفر شهادة ضمان رسمية على جميع أعمال الإصلاح وتبديل الكمبروسرات وتعبئة الغاز وقطع الغيار.',
        },
      },
    ],
  },
  gallery: {
    eyebrow: {
      en: 'Real Field Operations',
      ar: 'من الميدان',
    },
    title: {
      en: 'Featured Job Work & Maintenance Portfolio',
      ar: 'معرض أعمالنا ومشاريع الصيانة المنفذة',
    },
    subtitle: {
      en: 'Actual inspection, cleaning, coil decontamination, and VRF installation projects completed across the Kingdom.',
      ar: 'صور حقيقية لعمليات الغسيل الكيميائي، معالجة مجاري الهواء، وتركيب وتشغيل وحدات التكييف المركزية.',
    },
  },
  calculator: {
    eyebrow: {
      en: 'Energy Efficiency',
      ar: 'كفاءة الطاقة والتوفير',
    },
    title: {
      en: 'Calculate Local Efficiency Incentives & Savings',
      ar: 'احسب حوافز وتوفير كفاءة الطاقة السنوي',
    },
    subtitle: {
      en: 'Estimate electricity bill reductions and local Saudi energy efficiency rebates when upgrading and servicing your cooling system with HARD.',
      ar: 'اكتشف حجم الوفر المالي في فاتورة الكهرباء ومقدار الحوافز التقديرية عند صيانة وتحديث أجهزتك بأنظمة عالية الكفاءة.',
    },
    areaSliderLabel: {
      en: 'Air-Conditioned Area (Square Metres):',
      ar: 'المساحة المكيفة الإجمالية (متر مربع):',
    },
    tierLabel: {
      en: 'Cooling System Tier:',
      ar: 'نوع وكفاءة نظام التكييف:',
    },
    tierSplitStandard: {
      en: 'Standard Split (Lower SEER)',
      ar: 'سبليت تقليدي (كفاءة عادية)',
    },
    tierInverterHigh: {
      en: 'Inverter Split (High SEER Energy Saver)',
      ar: 'سبليت إنفرتر موفر للطاقة (كفاءة عالية)',
    },
    tierPackage: {
      en: 'Rooftop Package Unit',
      ar: 'وحدات مدمجة سطحية (باكج سنترال)',
    },
    tierVRF: {
      en: 'VRF / Central Chiller Solution',
      ar: 'أنظمة تدفق التبريد المتغير VRF / الشيلرات',
    },
    annualSavingsTitle: {
      en: 'Estimated Annual Electricity Savings',
      ar: 'الوفر السنوي التقديري في فاتورة الكهرباء',
    },
    incentiveEstimateTitle: {
      en: 'Estimated Saudi Energy Rebates & Efficiency Value',
      ar: 'قيمة الحوافز والدعم التقديرية لكفاءة التبريد',
    },
    carbonOffsetTitle: {
      en: 'Annual CO₂ Footprint Reduction',
      ar: 'خفض الانبعاثات الكربونية السنوي',
    },
    disclaimer: {
      en: '*Estimates calculated based on SEC tariff rates, Gulf peak summer temperature curves (48°C), and optimal system SEER ratings with regular HARD maintenance.',
      ar: '*الحسابات تقديرية وتعتمد على تعرفة الشركة السعودية للكهرباء ومعدلات تشغيل ذروة الصيف (٤٨ مئوية) مع الصيانة الدورية من هارد.',
    },
    bookUpgradeBtn: {
      en: 'Book Energy Efficiency Audit',
      ar: 'احجز فحص كفاءة الطاقة للأجهزة',
    },
  },
  checklist: {
    eyebrow: {
      en: 'Preventative Care',
      ar: 'العناية الوقائية',
    },
    title: {
      en: 'Seasonal HVAC Maintenance Checklist',
      ar: 'دليل الصيانة الدورية حسب المواسم',
    },
    subtitle: {
      en: 'Follow our certified engineers’ checklist to prevent sudden compressor burnouts and maintain crisp indoor air quality year-round.',
      ar: 'خطوات إرشادية معتمدة من مهندسينا لحماية الكمبروسر من التلف وضمان هواء نقي ونظيف على مدار العام.',
    },
    summerTab: {
      en: 'Summer Extreme Heat Preparation',
      ar: 'استعدادات ذروة الصيف الحار',
    },
    winterTab: {
      en: 'Winter Optimization & Off-Peak Care',
      ar: 'صيانة الشتاء والتشغيل الاقتصادي',
    },
  },
  reviews: {
    eyebrow: {
      en: 'Client Satisfaction',
      ar: 'ثقة عملائنا',
    },
    title: {
      en: 'What Our Clients Say in the Eastern Province',
      ar: 'آراء وتقييمات العملاء في المنطقة الشرقية',
    },
    subtitle: {
      en: 'Real feedback from homeowners, compound managers, and commercial business operators.',
      ar: 'تجارب حقيقية لملاك الفلل والقصور ومديري المجمعات والشركات في مدن الشرقية.',
    },
  },
  faq: {
    eyebrow: {
      en: 'Got Questions?',
      ar: 'الأسئلة المتكررة',
    },
    title: {
      en: 'Frequently Asked HVAC Maintenance Questions',
      ar: 'أبرز الأسئلة الشائعة حول صيانة وغسيل التكييف',
    },
    subtitle: {
      en: 'Clear answers on maintenance frequency, refrigerant leaks, warranties, and emergency turnaround.',
      ar: 'إجابات واضحة وموثوقة حول فترات الغسيل، تسريب الفريون، الضمانات، واستجابة الطوارئ.',
    },
  },
  contact: {
    eyebrow: {
      en: 'Get In Touch',
      ar: 'تواصل معنا',
    },
    title: {
      en: 'Book Your Service or Inquire About Maintenance Contracts',
      ar: 'احجز موعد الصيانة أو استفسر عن العقود السنوية',
    },
    subtitle: {
      en: 'Our engineering dispatch team is on standby to assist you immediately.',
      ar: 'فريق الاستقبال والدعم الفني مستعد لخدمتك وتوجيه أقرب فريق صيانة لموقعك.',
    },
    formName: {
      en: 'Your Name',
      ar: 'الاسم الكريم',
    },
    formPhone: {
      en: 'Mobile Number',
      ar: 'رقم الجوال',
    },
    formEmail: {
      en: 'Email Address',
      ar: 'البريد الإلكتروني',
    },
    formService: {
      en: 'Service Needed',
      ar: 'نوع الخدمة',
    },
    formMessage: {
      en: 'Message / Project Requirements',
      ar: 'تفاصيل الطلب والملاحظات',
    },
    formSubmit: {
      en: 'Send Maintenance Message',
      ar: 'إرسال الرسالة',
    },
    formSending: {
      en: 'Transmitting...',
      ar: 'جاري الإرسال...',
    },
    formSuccess: {
      en: 'Message dispatched to info@hardgp.com. We will contact you within minutes!',
      ar: 'تم إرسال رسالتك بنجاح إلى info@hardgp.com. سنتواصل معك خلال دقائق!',
    },
    addressTitle: {
      en: 'Regional Office & Dispatch Hub',
      ar: 'المكتب الإقليمي ومركز الصيانة',
    },
    addressDesc: {
      en: 'King Fahd Road, Al Khobar / Dammam Metropolitan, Eastern Province, Kingdom of Saudi Arabia',
      ar: 'طريق الملك فهد، الخبر / الدمام، المنطقة الشرقية، المملكة العربية السعودية',
    },
    emailTitle: {
      en: 'Direct Email',
      ar: 'البريد الإلكتروني',
    },
    emailVal: 'info@hardgp.com',
    hoursTitle: {
      en: 'Working Hours',
      ar: 'ساعات العمل',
    },
    hoursRegular: {
      en: 'Sat–Thu: 7:00 AM – 9:00 PM',
      ar: 'السبت إلى الخميس: ٧:٠٠ ص – ٩:٠٠ م',
    },
    hoursFriday: {
      en: 'Friday: Emergency Service Only (24/7)',
      ar: 'الجمعة: خدمة الطوارئ الميدانية فقط (٢٤ ساعة)',
    },
    mapTitle: {
      en: 'HARD HVAC Service Hub (Coordinates: 26.373784, 50.103001)',
      ar: 'موقع مركز خدمات هارد للتكييف (الإحداثيات: 26.373784, 50.103001)',
    },
  },
  emergencyBanner: {
    badge: {
      en: 'URGENT COOLING BREAKDOWN?',
      ar: 'هل توقف التبريد بشكل مفاجئ؟',
    },
    title: {
      en: 'Our 24/7 Emergency AC Rescue Vans Are Active in Your City',
      ar: 'فرق طوارئ التكييف المتنقلة من هارد جاهزة لمباشرة موقعك فوراً',
    },
    desc: {
      en: 'Immediate emergency response for residential villas, hospitals, server rooms, and commercial facilities.',
      ar: 'استجابة سريعة للفلل السكنية، الخوادم التقنية، المنشآت الطبية، والمطاعم والمكاتب التجارية.',
    },
    callBtn: {
      en: 'Call +966 55 064 1000',
      ar: 'اتصل الآن: 0550641000',
    },
    whatsappBtn: {
      en: 'WhatsApp Emergency Dispatch',
      ar: 'طوارئ واتساب الفورية',
    },
  },
  footer: {
    aboutText: {
      en: 'HARD HVAC Maintenance is a specialized division of HARD Group, delivering premier cooling, heating, ventilation, and air quality engineering across the Kingdom of Saudi Arabia.',
      ar: 'هارد لصيانة وتكييف الهواء هي الذراع التخصصي لمجموعة هارد، تقدم أرقى معايير التبريد والتهوية والتحكم المناخي الذكي في المملكة العربية السعودية.',
    },
    quickLinks: {
      en: 'Quick Navigation',
      ar: 'روابط سريعة',
    },
    servicesLink: {
      en: 'Services',
      ar: 'الخدمات',
    },
    galleryLink: {
      en: 'Work Portfolio',
      ar: 'معرض الأعمال',
    },
    calcLink: {
      en: 'Efficiency Calculator',
      ar: 'حاسبة الكفاءة',
    },
    contactLink: {
      en: 'Contact & Location',
      ar: 'الاتصال والموقع',
    },
    groupLinks: {
      en: 'HARD Group Divisions',
      ar: 'قطاعات مجموعة هارد',
    },
    corporatePortal: {
      en: 'Corporate Group Portal',
      ar: 'بوابة المجموعة القابضة',
    },
    constructionDiv: {
      en: 'HARD Construction & Contracting',
      ar: 'هارد للإنشاءات والمقاولات',
    },
    realEstateDiv: {
      en: 'HARD Real Estate & Brokerage',
      ar: 'هارد للعقارات والتسويق',
    },
    followUs: {
      en: 'Follow HARD Group',
      ar: 'تابع مجموعة هارد',
    },
    rights: {
      en: 'HARD HVAC Maintenance © 2026. All rights reserved.',
      ar: 'هارد لصيانة التكييف © ٢٠٢٦. جميع الحقوق محفوظة.',
    },
    slogan: {
      en: 'Engineered for the Kingdom’s Climate.',
      ar: 'هندسة متطورة مصممة لمناخ المملكة.',
    },
  },
  bookingModal: {
    title: {
      en: 'Book HVAC Maintenance & Inspection',
      ar: 'حجز موعد صيانة وفحص التكييف',
    },
    subtitle: {
      en: 'Choose your desired service, date, and time slot. We will confirm with a certified technician assignment.',
      ar: 'اختر الخدمة المطلوبة والموعد المناسب وسيتم إسناد فني متخصص وتأكيد الحجز فوراً.',
    },
    serviceSelect: {
      en: 'Select Service Required',
      ar: 'اختر نوع الخدمة',
    },
    dateLabel: {
      en: 'Preferred Appointment Date',
      ar: 'التاريخ المفضل للزيارة',
    },
    timeSlotLabel: {
      en: 'Preferred Time Slot',
      ar: 'الفترة المفضلة',
    },
    slotMorning: {
      en: 'Morning (8:00 AM – 12:00 PM)',
      ar: 'صباحية (٨:٠٠ ص – ١٢:٠٠ م)',
    },
    slotAfternoon: {
      en: 'Afternoon (1:00 PM – 5:00 PM)',
      ar: 'ظهرية (١:٠٠ م – ٥:٠٠ م)',
    },
    slotEvening: {
      en: 'Evening (6:00 PM – 9:00 PM)',
      ar: 'مسائية (٦:٠٠ م – ٩:٠٠ م)',
    },
    slotEmergency: {
      en: 'Urgent Same-Day Emergency',
      ar: 'طوارئ عاجلة في نفس اليوم',
    },
    clientName: {
      en: 'Client Name',
      ar: 'اسم العميل',
    },
    phone: {
      en: 'Phone Number',
      ar: 'رقم الجوال',
    },
    city: {
      en: 'City / District',
      ar: 'المدينة / الحي',
    },
    notes: {
      en: 'AC Units & Fault Notes',
      ar: 'ملاحظات الأعطال وعدد الأجهزة',
    },
    submitBtn: {
      en: 'Confirm Booking Request',
      ar: 'تأكيد طلب الحجز',
    },
  },
  cms: {
    title: {
      en: 'HARD HVAC Maintenance CMS',
      ar: 'لوحة تحكم هارد للتكييف',
    },
    authTitle: {
      en: 'HVAC Management Portal Access',
      ar: 'بوابة إدارة عمليات التكييف',
    },
    pinPrompt: {
      en: 'Enter your 4-digit administrative PIN code (Default: 2026)',
      ar: 'أدخل رمز الأمان الإداري المكون من 4 أرقام (الافتراضي: 2026)',
    },
    unlockBtn: {
      en: 'Unlock Portal',
      ar: 'فتح لوحة التحكم',
    },
    instantUnlock: {
      en: 'Instant Access for Reviewers (PIN: 2026)',
      ar: 'دخول سريع للمراجعة (رمز: 2026)',
    },
    exitBtn: {
      en: 'Return to Website',
      ar: 'العودة للموقع الرئيسي',
    },
    tabLeads: {
      en: 'Inquiries & Leads',
      ar: 'الطلبات والاستفسارات',
    },
    tabServices: {
      en: 'Manage Services',
      ar: 'إدارة الخدمات',
    },
    tabGallery: {
      en: 'Work Gallery',
      ar: 'معرض الأعمال',
    },
    tabReviews: {
      en: 'Testimonials',
      ar: 'آراء العملاء',
    },
  },
  citiesList: [
    { id: 'dammam', en: 'Dammam', ar: 'الدمام' },
    { id: 'khobar', en: 'Al Khobar', ar: 'الخبر' },
    { id: 'dhahran', en: 'Dhahran', ar: 'الظهران' },
    { id: 'qatif', en: 'Qatif', ar: 'القطيف' },
    { id: 'saihat', en: 'Saihat', ar: 'سيهات' },
    { id: 'safwa', en: 'Safwa', ar: 'صفوى' },
    { id: 'tarout', en: 'Tarout Island', ar: 'جزيرة تاروت' },
    { id: 'jubail', en: 'Jubail Industrial & City', ar: 'الجبيل والجبيل الصناعية' },
    { id: 'rastanura', en: 'Ras Tanura', ar: 'رأس تنورة' },
    { id: 'abqaiq', en: 'Abqaiq (Buqayq)', ar: 'بقيق' },
    { id: 'other', en: 'Other City...', ar: 'مدينة أخرى...' },
  ],
};
