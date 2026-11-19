import { subscribeSectorSection, saveSectorSection } from '../../lib/db/hardSectorSections';
import { loadPublishedHvacServices } from '../../lib/db/hardCatalog';
import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Language,
  HVACService,
  HVACGalleryItem,
  HVACGalleryCategory,
  HVACTestimonial,
  HVACFaqItem,
  HVACChecklistItem,
} from '../types';
import {
  initialServices,
  initialGallery,
  initialGalleryCategories,
  initialTestimonials,
  initialFaqs,
  yearRoundChecklist as initialChecklist,
} from '../data/initialData';
import {
  HVACCityArea,
  HVACHeroContent,
  HVACOperatingHoursContact,
  HVACBookingCopy,
  DEFAULT_HVAC_CITIES,
  DEFAULT_HVAC_HERO,
  DEFAULT_HVAC_HOURS_CONTACT,
  DEFAULT_HVAC_BOOKING_COPY,
} from '../services/sectionDefaults';

interface QuoteInitData {
  city: string;
  customCity?: string;
  service: string;
}

interface HVACContextType {
  language: Language;
  isAr: boolean;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  // Leads
  // Services
  services: HVACService[];
  updateServices: (services: HVACService[]) => void;
  // Cities & Service Areas
  serviceAreas: HVACCityArea[];
  updateServiceAreas: (areas: HVACCityArea[]) => Promise<void>;
  // Hero & Booking Copy & Contact
  heroContent: HVACHeroContent;
  updateHeroContent: (data: Partial<HVACHeroContent>) => Promise<void>;
  operatingHours: HVACOperatingHoursContact;
  updateOperatingHours: (data: Partial<HVACOperatingHoursContact>) => Promise<void>;
  bookingCopy: HVACBookingCopy;
  updateBookingCopy: (data: Partial<HVACBookingCopy>) => Promise<void>;
  // Portfolio Gallery
  galleryItems: HVACGalleryItem[];
  galleryCategories: HVACGalleryCategory[];
  addGalleryItem: (item: Omit<HVACGalleryItem, 'id'>) => Promise<void>;
  updateGalleryItem: (id: string, item: Partial<HVACGalleryItem>) => Promise<void>;
  deleteGalleryItem: (id: string) => Promise<void>;
  updateGalleryItems: (items: HVACGalleryItem[]) => void;
  // Testimonials
  testimonials: HVACTestimonial[];
  addTestimonial: (item: Omit<HVACTestimonial, 'id'>) => Promise<void>;
  updateTestimonial: (id: string, item: Partial<HVACTestimonial>) => Promise<void>;
  deleteTestimonial: (id: string) => Promise<void>;
  updateTestimonials: (items: HVACTestimonial[]) => void;
  // FAQs & Guides
  faqItems: HVACFaqItem[];
  updateFaqItems: (items: HVACFaqItem[]) => void;
  maintenanceGuides: HVACChecklistItem[];
  updateMaintenanceGuides: (items: HVACChecklistItem[]) => void;
  resetAllToDefaults: () => void;
  // Booking Modal
  isBookingModalOpen: boolean;
  bookingInitialService: string;
  openBookingModal: (serviceName?: string) => void;
  closeBookingModal: () => void;
  // Quote Dialog
  isQuoteDialogOpen: boolean;
  quoteInitialData: QuoteInitData | null;
  openQuoteDialog: (initData: QuoteInitData) => void;
  closeQuoteDialog: () => void;
}

const HVACContext = createContext<HVACContextType | undefined>(undefined);

const STORAGE_KEY_LEADS = 'hard_hvac_leads_v1';
const STORAGE_KEY_SERVICES = 'hard_hvac_services_v1';
const STORAGE_KEY_GALLERY = 'hard_hvac_gallery_v1';
const STORAGE_KEY_REVIEWS = 'hard_hvac_reviews_v1';

export function HVACProvider({
  children,
  initialLanguage = 'ar',
  onLanguageChangeExternal,
}: {
  children: React.ReactNode;
  initialLanguage?: Language;
  onLanguageChangeExternal?: (lang: Language) => void;
}) {
  const [language, setLanguageState] = useState<Language>(initialLanguage);

  // Sync external language prop if updated
  useEffect(() => {
    setLanguageState(initialLanguage);
  }, [initialLanguage]);

  // Synchronize HTML attributes for RTL & Lang
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (onLanguageChangeExternal) {
      onLanguageChangeExternal(lang);
    }
  };

  const toggleLanguage = () => {
    const next = language === 'ar' ? 'en' : 'ar';
    setLanguage(next);
  };

  const [services, setServices] = useState<HVACService[]>([]);
  useEffect(() => {
    const controller = new AbortController();
    loadPublishedHvacServices(controller.signal).then((entries) => {
      if (controller.signal.aborted) return;
      setServices(entries.map(({ content }) => content).sort((a, b) => a.sortOrder - b.sortOrder));
    }).catch((error) => {
      if (!controller.signal.aborted) console.error('Unable to load the HVAC services catalog', error);
    });
    return () => controller.abort();
  }, []);

  // Shared Service Areas / Cities
  const [serviceAreas, setServiceAreas] = useState<HVACCityArea[]>(DEFAULT_HVAC_CITIES);

  useEffect(() => {
    const unsub = subscribeSectorSection<HVACCityArea[]>({ sector: 'hvac', key: 'service_areas' },
      DEFAULT_HVAC_CITIES,
      (data) => setServiceAreas(data)
    );
    return () => unsub();
  }, []);

  const updateServiceAreas = async (areas: HVACCityArea[]) => {
    await saveSectorSection({ sector: 'hvac', key: 'service_areas' }, areas);
    setServiceAreas(areas);
  };

  // Hero, Operating Hours & Booking Copy
  const [heroContent, setHeroContent] = useState<HVACHeroContent>(DEFAULT_HVAC_HERO);
  const [operatingHours, setOperatingHours] = useState<HVACOperatingHoursContact>(DEFAULT_HVAC_HOURS_CONTACT);
  const [bookingCopy, setBookingCopy] = useState<HVACBookingCopy>(DEFAULT_HVAC_BOOKING_COPY);

  useEffect(() => {
    const unsubHero = subscribeSectorSection<HVACHeroContent>({ sector: 'hvac', key: 'hero' },
      DEFAULT_HVAC_HERO,
      (data) => setHeroContent(data)
    );
    const unsubHours = subscribeSectorSection<HVACOperatingHoursContact>({ sector: 'hvac', key: 'hours_contact' },
      DEFAULT_HVAC_HOURS_CONTACT,
      (data) => setOperatingHours(data)
    );
    const unsubBooking = subscribeSectorSection<HVACBookingCopy>({ sector: 'hvac', key: 'booking_copy' },
      DEFAULT_HVAC_BOOKING_COPY,
      (data) => setBookingCopy(data)
    );

    return () => {
      unsubHero();
      unsubHours();
      unsubBooking();
    };
  }, []);

  const updateHeroContent = async (data: Partial<HVACHeroContent>) => {
    const merged = { ...heroContent, ...data };
    await saveSectorSection({ sector: 'hvac', key: 'hero' }, merged);
    setHeroContent(merged);
  };

  const updateOperatingHours = async (data: Partial<HVACOperatingHoursContact>) => {
    const merged = { ...operatingHours, ...data };
    await saveSectorSection({ sector: 'hvac', key: 'hours_contact' }, merged);
    setOperatingHours(merged);
  };

  const updateBookingCopy = async (data: Partial<HVACBookingCopy>) => {
    const merged = { ...bookingCopy, ...data };
    await saveSectorSection({ sector: 'hvac', key: 'booking_copy' }, merged);
    setBookingCopy(merged);
  };

  const [galleryCategories, setGalleryCategories] = useState<HVACGalleryCategory[]>(initialGalleryCategories);
  useEffect(() => subscribeSectorSection({ sector: 'hvac', key: 'gallery_categories' }, initialGalleryCategories, setGalleryCategories), []);

  // Gallery Items
  const [galleryItems, setGalleryItems] = useState<HVACGalleryItem[]>(initialGallery);

  useEffect(() => {
    const unsub = subscribeSectorSection<HVACGalleryItem[]>({ sector: 'hvac', key: 'work_gallery' }, initialGallery, setGalleryItems);
    return () => unsub();
  }, []);

  const addGalleryItem = async (item: Omit<HVACGalleryItem, 'id'>) => {
    const next = [...galleryItems, { ...item, id: crypto.randomUUID() }];
    await saveSectorSection({ sector: 'hvac', key: 'work_gallery' }, next);
    setGalleryItems(next);
  };

  const updateGalleryItem = async (id: string, updated: Partial<HVACGalleryItem>) => {
    const next = galleryItems.map((item) => item.id === id ? { ...item, ...updated } : item);
    await saveSectorSection({ sector: 'hvac', key: 'work_gallery' }, next);
    setGalleryItems(next);
  };

  const deleteGalleryItem = async (id: string) => {
    const next = galleryItems.filter((item) => item.id !== id);
    await saveSectorSection({ sector: 'hvac', key: 'work_gallery' }, next);
    setGalleryItems(next);
  };

  // Testimonials
  const [testimonials, setTestimonials] = useState<HVACTestimonial[]>(initialTestimonials);

  useEffect(() => {
    const unsub = subscribeSectorSection<HVACTestimonial[]>({ sector: 'hvac', key: 'reviews' }, initialTestimonials, setTestimonials);
    return () => unsub();
  }, []);

  const addTestimonial = async (item: Omit<HVACTestimonial, 'id'>) => {
    const next = [...testimonials, { ...item, id: crypto.randomUUID() }];
    await saveSectorSection({ sector: 'hvac', key: 'reviews' }, next);
    setTestimonials(next);
  };

  const updateTestimonial = async (id: string, updated: Partial<HVACTestimonial>) => {
    const next = testimonials.map((item) => item.id === id ? { ...item, ...updated } : item);
    await saveSectorSection({ sector: 'hvac', key: 'reviews' }, next);
    setTestimonials(next);
  };

  const deleteTestimonial = async (id: string) => {
    const next = testimonials.filter((item) => item.id !== id);
    await saveSectorSection({ sector: 'hvac', key: 'reviews' }, next);
    setTestimonials(next);
  };

  // FAQs & Maintenance Guides
  const [faqItems, setFaqItems] = useState<HVACFaqItem[]>(initialFaqs);
  useEffect(() => subscribeSectorSection({ sector: 'hvac', key: 'faq' }, initialFaqs, setFaqItems), []);
  const [maintenanceGuides, setMaintenanceGuides] = useState<HVACChecklistItem[]>(initialChecklist);

  useEffect(() => subscribeSectorSection<HVACChecklistItem[]>({ sector: 'hvac', key: 'maintenance_guide' }, initialChecklist, setMaintenanceGuides), []);

  // Booking Modal
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingInitialService, setBookingInitialService] = useState('');

  const openBookingModal = (serviceName?: string) => {
    setBookingInitialService(serviceName || '');
    setIsBookingModalOpen(true);
  };

  const closeBookingModal = () => {
    setIsBookingModalOpen(false);
  };

  // Listen for window custom event 'hvac:open-booking'
  useEffect(() => {
    const handleCustomBookingEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ service?: string }>;
      openBookingModal(customEvent.detail?.service);
    };

    window.addEventListener('hvac:open-booking', handleCustomBookingEvent);
    return () => {
      window.removeEventListener('hvac:open-booking', handleCustomBookingEvent);
    };
  }, []);

  // Quote Dialog
  const [isQuoteDialogOpen, setIsQuoteDialogOpen] = useState(false);
  const [quoteInitialData, setQuoteInitialData] = useState<QuoteInitData | null>(null);

  const openQuoteDialog = (initData: QuoteInitData) => {
    setQuoteInitialData(initData);
    setIsQuoteDialogOpen(true);
  };

  const closeQuoteDialog = () => {
    setIsQuoteDialogOpen(false);
  };

  const resetAllToDefaults = () => {
    setServices(initialServices);
    setGalleryItems(initialGallery);
    setTestimonials(initialTestimonials);
    setServiceAreas(DEFAULT_HVAC_CITIES);
    setHeroContent(DEFAULT_HVAC_HERO);
    setOperatingHours(DEFAULT_HVAC_HOURS_CONTACT);
    setBookingCopy(DEFAULT_HVAC_BOOKING_COPY);
  };

  const updateServices = async (items: HVACService[]) => {
    await Promise.all(items.map(async () => undefined));
    setServices(items);
  };

  const updateGalleryItems = async (items: HVACGalleryItem[]) => {
    await saveSectorSection({ sector: 'hvac', key: 'work_gallery' }, items);
    setGalleryItems(items);
  };

  const updateTestimonials = async (items: HVACTestimonial[]) => {
    await saveSectorSection({ sector: 'hvac', key: 'reviews' }, items);
    setTestimonials(items);
  };

  const updateFaqItems = async (items: HVACFaqItem[]) => {
    await saveSectorSection({ sector: 'hvac', key: 'faq' }, items);
    setFaqItems(items);
  };

  const updateMaintenanceGuides = async (items: HVACChecklistItem[]) => {
    await saveSectorSection({ sector: 'hvac', key: 'maintenance_guide' }, items);
    setMaintenanceGuides(items);
  };

  return (
    <HVACContext.Provider
      value={{
        language,
        isAr: language === 'ar',
        setLanguage,
        toggleLanguage,
        services,
        updateServices,
        serviceAreas,
        updateServiceAreas,
        heroContent,
        updateHeroContent,
        operatingHours,
        updateOperatingHours,
        bookingCopy,
        updateBookingCopy,
        galleryItems,
        galleryCategories,
        addGalleryItem,
        updateGalleryItem,
        deleteGalleryItem,
        updateGalleryItems,
        testimonials,
        addTestimonial,
        updateTestimonial,
        deleteTestimonial,
        updateTestimonials,
        faqItems,
        updateFaqItems,
        maintenanceGuides,
        updateMaintenanceGuides,
        resetAllToDefaults,
        isBookingModalOpen,
        bookingInitialService,
        openBookingModal,
        closeBookingModal,
        isQuoteDialogOpen,
        quoteInitialData,
        openQuoteDialog,
        closeQuoteDialog,
      }}
    >
      {children}
    </HVACContext.Provider>
  );
}

export function useHVAC() {
  const context = useContext(HVACContext);
  if (!context) {
    throw new Error('useHVAC must be used within an HVACProvider');
  }
  return context;
}
