import { PageId, Language } from '../types';

export type SectorId = 'portal' | 'realestate' | 'construction' | 'hvac';

export interface SectorDefinition {
  id: SectorId;
  pageId: PageId;
  href: string;
  name: {
    en: string;
    ar: string;
  };
  shortName: {
    en: string;
    ar: string;
  };
  tagline: {
    en: string;
    ar: string;
  };
  iconName: 'Building2' | 'Home' | 'HardHat' | 'ThermometerSnowflake';
}

export const HARD_GROUP_SECTORS: SectorDefinition[] = [
  {
    id: 'portal',
    pageId: 'portal',
    href: '/',
    name: {
      en: 'HARD Group Portal',
      ar: 'بوابة مجموعة هارد',
    },
    shortName: {
      en: 'Group Portal',
      ar: 'بوابة المجموعة',
    },
    tagline: {
      en: 'Corporate Holdings & Gateway',
      ar: 'بوابة المجموعة',
    },
    iconName: 'Building2',
  },
  {
    id: 'realestate',
    pageId: 'home',
    href: '/realestate',
    name: {
      en: 'HARD Real Estate',
      ar: 'هارد للعقارات',
    },
    shortName: {
      en: 'Real Estate',
      ar: 'العقارات',
    },
    tagline: {
      en: 'Brokerage & Advisory',
      ar: 'الوساطة والتسويق العقاري',
    },
    iconName: 'Home',
  },
  {
    id: 'construction',
    pageId: 'construction',
    href: '/construction',
    name: {
      en: 'HARD Contracting',
      ar: 'هارد للمقاولات',
    },
    shortName: {
      en: 'Construction',
      ar: 'المقاولات',
    },
    tagline: {
      en: 'General Contracting & Engineering',
      ar: 'المقاولات العامة والتطوير الإنشائي',
    },
    iconName: 'HardHat',
  },
  {
    id: 'hvac',
    pageId: 'hvac',
    href: '/hvac',
    name: {
      en: 'HARD HVAC Maintenance',
      ar: 'هارد لصيانة التكييف',
    },
    shortName: {
      en: 'HVAC Maintenance',
      ar: 'صيانة التكييف',
    },
    tagline: {
      en: 'Cooling, VRF & Electromechanical',
      ar: 'التبريد المركزي والخدمات الكهروميكانيكية',
    },
    iconName: 'ThermometerSnowflake',
  },
];

/**
 * Centralized Verified Contact Registry for HARD Group Sectors
 */
export const SECTOR_CONTACT_DETAILS = {
  realestate: {
    phone: '+966 55 612 5711',
    whatsapp: '+966556125711',
    email: 'info@hardgp.com',
    address: {
      ar: 'حي طريق الملك فهد، الخبر، المنطقة الشرقية، المملكة العربية السعودية',
      en: 'King Fahd Road District, Al Khobar, Eastern Province, Kingdom of Saudi Arabia',
    },
    regaLicense: '1200048912',
    crNumber: '',
  },
  construction: {
    phone: '+966 55 612 5711',
    mobile: '',
    whatsapp: '+966556125711',
    email: 'info@hardgp.com',
    crNumber: '',
    taxId: '',
    sceAccreditation: '',
    address: {
      ar: 'طريق الأمير متعب بن عبد العزيز، حي هجر، الدمام، المملكة العربية السعودية',
      en: 'Prince Mutaib bin Abdulaziz Road, Hajar District, Dammam, Saudi Arabia',
    },
    coordinates: {
      lat: 26.373703,
      lng: 50.102998,
    },
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=26.373703,50.102998',
    verificationStatus: {
      isVerifiedCoordinates: true,
      buildingNumberPending: true,
      ar: 'إحداثيات المقر الرئيسي في الدمام. رقم المبنى والوحدة غير منشور حتى اعتماده.',
      en: 'Dammam head-office coordinates. Building and suite numbers remain unpublished until confirmed.',
    },
  },
  hvac: {
    phone: '+966 55 064 1000',
    mobile: '',
    whatsapp: '+966550641000',
    email: 'info@hardgp.com',
    officeName: {
      ar: 'المكتب الإقليمي ومركز عمليات التكييف',
      en: 'HVAC Regional Operations & Dispatch Hub',
    },
    city: {
      ar: 'الدمام',
      en: 'Dammam',
    },
    district: {
      ar: 'حي هجر',
      en: 'Hajr District',
    },
    address: {
      ar: 'طريق الأمير متعب بن عبد العزيز، حي هجر، الدمام، المملكة العربية السعودية',
      en: 'Prince Mutaib bin Abdulaziz Road, Hajr District, Dammam, Saudi Arabia',
    },
    coordinates: {
      lat: 26.373784,
      lng: 50.103001,
    },
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=26.373784,50.103001',
    verificationStatus: {
      isVerifiedCoordinates: true,
      buildingNumberPending: true,
      ar: 'إحداثيات المقر الإقليمي الموثقة (حي الراكة الشمالية - الخبر - 26.3737° N, 50.1030° E) [رقم المبنى والرمز البريدي قيد الاعتماد البلدي النهائي]',
      en: 'Verified Regional Operations Destination (Al Rakah District, Al Khobar - 26.3737° N, 50.1030° E) [Building/Unit # Pending Final Municipal Verification]',
    },
    serviceCoverage: {
      ar: 'نطاق الخدمة الميدانية: الخبر، الدمام، الظهران، الجبيل، القطيف، والرياض',
      en: 'Field Service Coverage: Al Khobar, Dammam, Dhahran, Jubail, Qatif, and Riyadh',
    },
  },
} as const;

/**
 * Returns the current active sector based on the page id.
 */
export function getActiveSector(currentPage: PageId): SectorId {
  switch (currentPage) {
    case 'portal':
      return 'portal';
    case 'construction':
      return 'construction';
    case 'hvac':
      return 'hvac';
    case 'not-found': {
      if (typeof window !== 'undefined') {
        const path = window.location.pathname.toLowerCase();
        if (path.startsWith('/construction')) return 'construction';
        if (path.startsWith('/hvac')) return 'hvac';
        if (path.startsWith('/realestate')) return 'realestate';
      }
      return 'portal';
    }
    default:
      // All real estate pages (home, about, properties, projects, marketing, blog, contact, admin)
      return 'realestate';
  }
}

/**
 * Helper to get localized sector name
 */
export function getSectorName(sector: SectorDefinition, language: Language): string {
  return sector.name[language];
}

/**
 * Helper to get localized short sector name
 */
export function getSectorShortName(sector: SectorDefinition, language: Language): string {
  return sector.shortName[language];
}
