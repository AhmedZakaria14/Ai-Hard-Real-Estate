import type { SectorSection } from './db/hardSectorSections';

export const groupPortalSection = { sector: 'portal', key: 'landing' } satisfies SectorSection;

export const defaultGroupPortal = {
  titleAr: 'مجموعة هارد',
  titleEn: 'HARD Group',
  subtitleAr: 'بوابة المجموعة',
  subtitleEn: 'Group Portal',
  introAr: 'بوابة موحدة تجمع قطاعات مجموعة هارد في الوساطة والتسويق العقاري، المقاولات الإنشائية، وصيانة أنظمة التكييف والتبريد.',
  introEn: 'A unified portal for HARD Group’s real estate brokerage and marketing, construction contracting, and HVAC and refrigeration maintenance divisions.',
  footerAr: 'جميع الحقوق محفوظة. مجموعة هارد@2026',
  footerEn: 'Copyright. HARD Group@2026',
  realestate: {
    nameEn: 'HARD Real Estate',
    nameAr: 'هارد للعقارات',
    descriptionEn:
      'A leading HARD division in the Eastern Province, specializing in real estate marketing, brokerage licensed by the Real Estate General Authority (FAL), and management of major regional investment portfolios.',
    descriptionAr:
      'من قطاعات هارد الرائدة في المنطقة الشرقية، ويختص بالتسويق العقاري والوساطة المعتمدة برخصة (فال) من الهيئة العامة للعقار، وإدارة المحافظ الاستثمارية الكبرى في المنطقة الشرقية.',
    image:
      'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80',
  },
  construction: {
    nameEn: 'HARD Construction Contracting',
    nameAr: 'هارد للمقاولات الإنشائية',
    descriptionEn:
      'HARD Group’s main division delivers classified construction services for villas, apartments, residential and commercial complexes, and smart buildings in accordance with the Saudi Building Code.',
    descriptionAr:
      'القطاع الرئيسي في مجموعة هارد، يقدم خدمات المقاولات الإنشائية المصنفة ومشاريع الفلل والشقق والمجمعات السكنية والتجارية والمنشآت الذكية، وفق معايير كود البناء السعودي.',
    image:
      'https://images.unsplash.com/photo-1517581177682-a085bb7ffb15?auto=format&fit=crop&w=1200&q=80',
  },
  hvac: {
    nameEn: 'HARD HVAC Maintenance',
    nameAr: 'هارد لصيانة التكييف',
    descriptionEn:
      'A specialized HVAC and refrigeration maintenance division offering maintenance contracts, modern maintenance systems, air duct cleaning, and rapid emergency response.',
    descriptionAr:
      'قطاع تخصصي لخدمات صيانة التكييف والتبريد، يقدم عقود الصيانة وأنظمة صيانة حديثة وتنقية مجاري الهواء مع طوارئ واستجابة سريعة.',
    image:
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=80',
  },
};
