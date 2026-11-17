import { COMPANY_CREDENTIALS } from '../data/seedData';

// --- Default Construction Content Sections ---
export interface ConstructionHeroContent {
  badgeAr: string;
  badgeEn: string;
  headlineAr: string;
  headlineEn: string;
  subtitleAr: string;
  subtitleEn: string;
  bgImageUrl: string;
  stats: {
    projectsCount: string;
    buaM2Total: string;
    safetyHours: string;
    satisfactionRate: string;
  };
  ctaPrimaryAr: string;
  ctaPrimaryEn: string;
  ctaSecondaryAr: string;
  ctaSecondaryEn: string;
  isPublished?: boolean;
}

export interface ConstructionCompanyContent {
  crNumber: string;
  taxId: string;
  momrahClassificationAr: string;
  momrahClassificationEn: string;
  sceAccreditationAr: string;
  sceAccreditationEn: string;
  sbcComplianceAr: string;
  sbcComplianceEn: string;
  structuralWarrantyAr: string;
  structuralWarrantyEn: string;
  aboutTitleAr: string;
  aboutTitleEn: string;
  aboutTextAr: string;
  aboutTextEn: string;
  visionAr: string;
  visionEn: string;
  missionAr: string;
  missionEn: string;
  isPublished?: boolean;
}

export interface ConstructionWorkStage {
  id: string;
  order: number;
  titleAr: string;
  titleEn: string;
  durationAr: string;
  durationEn: string;
  descriptionAr: string;
  descriptionEn: string;
  deliverablesAr: string[];
  deliverablesEn: string[];
  iconName: string;
}

export interface ConstructionOfficeLocation {
  id: string;
  nameAr: string;
  nameEn: string;
  addressAr: string;
  addressEn: string;
  phone: string;
  mobile: string;
  whatsapp: string;
  email: string;
  lat: number;
  lng: number;
  googleMapsUrl: string;
  isHQ?: boolean;
}

// Default Seed Content for Hero & Company
export const DEFAULT_HERO_CONTENT: ConstructionHeroContent = {
  badgeAr: 'شركة هارد للمقاولات العامة والتطوير الإنشائي',
  badgeEn: 'HARD General Contracting & Construction Development',
  headlineAr: 'نبني صروح المستقبل بأعلى معايير الهندسة والإتقان',
  headlineEn: 'Building the Future with Supreme Engineering Standards & Mastery',
  subtitleAr:
    'المقاولات العامة والإنشاءات الكبرى والتشطيبات الفاخرة وإدارة المشاريع المتكاملة للمشاريع السكنية والتجارية في المملكة العربية السعودية.',
  subtitleEn:
    'General contracting, landmark construction, ultra-luxury fit-out, and turnkey project governance across the Kingdom of Saudi Arabia.',
  bgImageUrl:
    'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=1600&q=80',
  stats: {
    projectsCount: '٤٥+',
    buaM2Total: '١٨٠,٠٠٠+ م²',
    safetyHours: '١.٥ مليون+ ساعة',
    satisfactionRate: '٩٩.٤٪',
  },
  ctaPrimaryAr: 'استعراض المشاريع الإنشائية',
  ctaPrimaryEn: 'Explore Construction Projects',
  ctaSecondaryAr: 'حاسبة التكلفة التقديرية',
  ctaSecondaryEn: 'Cost Estimator Calculator',
  isPublished: true,
};

export const DEFAULT_COMPANY_CONTENT: ConstructionCompanyContent = {
  crNumber: COMPANY_CREDENTIALS.crNumber,
  taxId: COMPANY_CREDENTIALS.taxId,
  momrahClassificationAr: COMPANY_CREDENTIALS.momrahClassification.ar,
  momrahClassificationEn: COMPANY_CREDENTIALS.momrahClassification.en,
  sceAccreditationAr: COMPANY_CREDENTIALS.sceAccreditation.ar,
  sceAccreditationEn: COMPANY_CREDENTIALS.sceAccreditation.en,
  sbcComplianceAr: COMPANY_CREDENTIALS.sbcCompliance.ar,
  sbcComplianceEn: COMPANY_CREDENTIALS.sbcCompliance.en,
  structuralWarrantyAr: COMPANY_CREDENTIALS.structuralWarranty.ar,
  structuralWarrantyEn: COMPANY_CREDENTIALS.structuralWarranty.en,
  aboutTitleAr: 'شريكك الهندسي الموثوق في البناء والتشييد المتكامل',
  aboutTitleEn: 'Your Trusted Engineering Partner in Integrated Construction',
  aboutTextAr:
    'تأسست شركة هارد للمقاولات لتكون ركيزة أساسية في قطاع المقاولات والإنشاءات بالمملكة، حيث نجمع بين الخبرة الهندسية المتعمقة وأحدث المعدات والتقنيات الإنشائية لتقديم مشاريع متكاملة من التخطيط والتصميم وحتى تسليم المفتاح بأعلى معايير كود البناء السعودي.',
  aboutTextEn:
    'HARD Contracting was founded as a cornerstone in the Kingdom’s contracting and construction sector, combining deep engineering expertise with state-of-the-art machinery to deliver turnkey projects adhering strictly to the Saudi Building Code (SBC).',
  visionAr:
    'أن نكون الخيار الأول في قطاع المقاولات العامة والإنشاءات الكبرى عبر تقديم حلول هندسية مبتكرة ومستدامة تلبي تطلعات رؤية السعودية 2030.',
  visionEn:
    'To be the premier choice in general contracting and major engineering construction by providing innovative and sustainable engineering solutions aligned with Saudi Vision 2030.',
  missionAr:
    'التزام مطلق بالجودة والسلامة والدقة المتناهية في المواعيد، وتسليم صروح إنشائية ترتقي بمستويات المعيشة والاستثمار.',
  missionEn:
    'Absolute commitment to quality, safety, and deadline precision, delivering structural landmarks that elevate living and investment standards.',
  isPublished: true,
};

export const DEFAULT_WORK_STAGES: ConstructionWorkStage[] = [
  {
    id: 'stage-1',
    order: 1,
    titleAr: 'الحفر والأساسات والهيكل العظم',
    titleEn: 'Excavation, Raft & Superstructure',
    durationAr: '٣ - ٥ أشهر',
    durationEn: '3 - 5 Months',
    descriptionAr: 'أعمال الحفر العميق، صب الخرسانات سابقة الإجهاد، بناء الأعمدة والأسقف Flat Slabs.',
    descriptionEn: 'Deep excavation, post-tensioned raft foundations, column casting, and flat slabs erection.',
    deliverablesAr: ['اختبارات التربة والخرسانة', 'شهادة عزل الأساسات', 'مطابقة SBC الهندسي'],
    deliverablesEn: ['Soil & Concrete Testing', 'Foundation Waterproofing Cert', 'SBC Compliance Inspection'],
    iconName: 'Building2',
  },
  {
    id: 'stage-2',
    order: 2,
    titleAr: 'أنظمة الكهروميكانيك MEP والتأسيس',
    titleEn: 'MEP Infrastructure & Rough-In',
    durationAr: '٢ - ٣ أشهر',
    durationEn: '2 - 3 Months',
    descriptionAr: 'تأسيس شبكات التكييف المركزي VRF، السباكة الضغط العالي، التغذية الكهربائية والمنزل الذكي.',
    descriptionEn: 'VRF HVAC ducting installation, high-pressure plumbing, electrical wiring & KNX smart home tubing.',
    deliverablesAr: ['مخططات As-Built المعتمدة', 'اختبارات الضغط الهيدروليكي', 'تأسيسات التكييف المخفي'],
    deliverablesEn: ['Approved As-Built Shop Drawings', 'Hydraulic Pressure Test Reports', 'HVAC Rough-In Approval'],
    iconName: 'Cpu',
  },
  {
    id: 'stage-3',
    order: 3,
    titleAr: 'التشطيبات الفاخرة والواجهات',
    titleEn: 'Turnkey Luxury Fit-Out & Facades',
    durationAr: '٤ - ٦ أشهر',
    durationEn: '4 - 6 Months',
    descriptionAr: 'تكسيات الحجر الطبيعي والواجهات الزجاجية ثلاثية الطبقات، أرضيات الرخام الإيطالي، والأسقف الديكورية.',
    descriptionEn: 'Riyadh stone cladding, triple-glazed curtain walls, Italian Statuario marble & bespoke ceilings.',
    deliverablesAr: ['عزل الواجهات والأسطح', 'تركيب الرخام والأخشاب', 'أنظمة الإضاءة المعمارية'],
    deliverablesEn: ['Facade & Roof Thermal Proofing', 'Marble & Joinery Installation', 'Architectural Lighting Setup'],
    iconName: 'Layers',
  },
  {
    id: 'stage-4',
    order: 4,
    titleAr: 'الفحص النهائي والتسليم وضمان ١٠ سنوات',
    titleEn: 'Final Inspection, Handover & 10Y Warranty',
    durationAr: '١ شهر',
    durationEn: '1 Month',
    descriptionAr: 'تشغيل واختبار الأنظمة بالكفاءة القصوى، استخراج شهادة الإشغال البلدي، وتسليم وثائق الضمان الإنشائي.',
    descriptionEn: 'Full system commissioning, municipal completion certificate issuance, and 10-year structural warranty package.',
    deliverablesAr: ['وثيقة الضمان الإنشائي ١٠ سنوات', 'شهادة إتمام البناء', 'كتيب التشغيل والصيانة'],
    deliverablesEn: ['10-Year Structural Warranty Certificate', 'Building Occupancy Permit', 'O&M Manuals'],
    iconName: 'ShieldCheck',
  },
];

export const DEFAULT_CONSTRUCTION_HQ: ConstructionOfficeLocation = {
  id: 'hq-dammam',
  nameAr: 'المقر الرئيسي – الدمام',
  nameEn: 'Head Office – Dammam',
  addressAr: 'طريق الأمير متعب بن عبد العزيز، حي هجر، الدمام، المملكة العربية السعودية',
  addressEn: 'Prince Mutaib bin Abdulaziz Road, Hajar District, Dammam, Saudi Arabia',
  phone: '+966 55 612 5711',
  mobile: '',
  whatsapp: '+966556125711',
  email: 'info@hardgp.com',
  lat: 0,
  lng: 0,
  googleMapsUrl: '',
  isHQ: true,
};

export const DEFAULT_OFFICES: ConstructionOfficeLocation[] = [DEFAULT_CONSTRUCTION_HQ];

