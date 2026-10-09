import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Language,
  HVACLead,
  HVACLeadStatus,
  HVACService,
  HVACGalleryItem,
  HVACTestimonial,
} from '../types';
import {
  initialServices,
  initialGallery,
  initialTestimonials,
  initialSampleLeads,
} from '../data/initialData';

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
  leads: HVACLead[];
  addLead: (leadData: Omit<HVACLead, 'id' | 'referenceNumber' | 'createdAt' | 'status' | 'source'>) => HVACLead;
  updateLeadStatus: (id: string, status: HVACLeadStatus) => void;
  deleteLead: (id: string) => void;
  // CMS Entities
  services: HVACService[];
  updateServices: (services: HVACService[]) => void;
  galleryItems: HVACGalleryItem[];
  updateGalleryItems: (items: HVACGalleryItem[]) => void;
  testimonials: HVACTestimonial[];
  updateTestimonials: (items: HVACTestimonial[]) => void;
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

  // Leads state
  const [leads, setLeads] = useState<HVACLead[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LEADS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return initialSampleLeads;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_LEADS, JSON.stringify(leads));
    } catch {
      // ignore
    }
  }, [leads]);

  // Services
  const [services, setServices] = useState<HVACService[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SERVICES);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return initialServices;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SERVICES, JSON.stringify(services));
    } catch {
      // ignore
    }
  }, [services]);

  // Gallery Items
  const [galleryItems, setGalleryItems] = useState<HVACGalleryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_GALLERY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return initialGallery;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_GALLERY, JSON.stringify(galleryItems));
    } catch {
      // ignore
    }
  }, [galleryItems]);

  // Testimonials
  const [testimonials, setTestimonials] = useState<HVACTestimonial[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_REVIEWS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return initialTestimonials;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_REVIEWS, JSON.stringify(testimonials));
    } catch {
      // ignore
    }
  }, [testimonials]);

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

  // Add lead function
  const addLead = (leadData: Omit<HVACLead, 'id' | 'referenceNumber' | 'createdAt' | 'status' | 'source'>): HVACLead => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const referenceNumber = `HVAC-2026-${randomSuffix}`;
    const newLead: HVACLead = {
      ...leadData,
      id: `hvac-lead-${Date.now()}-${randomSuffix}`,
      referenceNumber,
      source: 'hvac',
      createdAt: new Date().toISOString(),
      status: 'new',
    };

    setLeads((prev) => [newLead, ...prev]);

    // Optional API dispatch / email trigger (non-blocking)
    try {
      fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient: 'info@hardgp.com',
          subject: `New HVAC Lead [${referenceNumber}]: ${leadData.clientName}`,
          data: newLead,
        }),
      }).catch(() => {
        // graceful offline fallback
      });
    } catch {
      // ignore
    }

    return newLead;
  };

  const updateLeadStatus = (id: string, status: HVACLeadStatus) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status } : l))
    );
  };

  const deleteLead = (id: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== id));
  };

  const resetAllToDefaults = () => {
    setServices(initialServices);
    setGalleryItems(initialGallery);
    setTestimonials(initialTestimonials);
    setLeads(initialSampleLeads);
    localStorage.removeItem(STORAGE_KEY_SERVICES);
    localStorage.removeItem(STORAGE_KEY_GALLERY);
    localStorage.removeItem(STORAGE_KEY_REVIEWS);
    localStorage.removeItem(STORAGE_KEY_LEADS);
  };

  return (
    <HVACContext.Provider
      value={{
        language,
        isAr: language === 'ar',
        setLanguage,
        toggleLanguage,
        leads,
        addLead,
        updateLeadStatus,
        deleteLead,
        services,
        updateServices: setServices,
        galleryItems,
        updateGalleryItems: setGalleryItems,
        testimonials,
        updateTestimonials: setTestimonials,
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
