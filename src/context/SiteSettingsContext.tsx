import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { LocalizedText, SectorId } from '../types/backend-schema';
import { hardAdminClient, toHardAdmin } from '../lib/db/hardAdminClient';
import { hardPublishableKey, hardSupabaseUrl } from '../lib/db/hardCatalog';

export interface PublicBrandingSettings {
  sector: SectorId;
  isOverride: boolean;
  publicationStatus: 'draft' | 'published';
  updatedAt: string;
  updatedBy?: string;

  // Branding & Assets
  logoUrlLight: string;
  logoUrlDark: string;
  faviconUrl: string;
  siteName: LocalizedText;
  tagline: LocalizedText;
  aboutSummary: LocalizedText;

  // Contact Channels
  contactEmail: string;
  supportPhone: string;
  whatsappNumber: string;
  tollFreeNumber: string;
  workingHours: LocalizedText;

  // Social Links
  socialLinks: {
    twitter?: string;
    linkedin?: string;
    instagram?: string;
    youtube?: string;
    facebook?: string;
    snapchat?: string;
  };

  // Office & Location
  office: {
    address: LocalizedText;
    city: LocalizedText;
    googleMapsUrl?: string;
  };

  // Footer & Compliance
  footerContent: {
    copyrightText: LocalizedText;
    crNumber?: string;
    taxNumber?: string;
    licenses?: LocalizedText;
  };

  // Design Tokens
  designTokens: {
    primaryAccent: string;
    secondaryAccent: string;
    darkBgToken: string;
    fontFamily: string;
  };
}

export const DEFAULT_PORTAL_SETTINGS: PublicBrandingSettings = {
  sector: 'portal',
  isOverride: false,
  publicationStatus: 'published',
  updatedAt: '1970-01-01T00:00:00.000Z',

  logoUrlLight: '/logo.svg',
  logoUrlDark: '/logo.svg',
  faviconUrl: '/favicon.ico',
  siteName: {
    ar: 'مجموعة هارد',
    en: 'HARD Group',
  },
  tagline: {
    ar: 'الرائدة في العقارات، الإنشاءات، وحلول التكييف بالمملكة',
    en: 'Leading Real Estate, Construction & HVAC Solutions in Saudi Arabia',
  },
  aboutSummary: {
    ar: 'مجموعة استثمارية وتطويرية سعودية متكاملة تقدم أرفع معايير الجودة والابتكار في شتى القطاعات الحيوية.',
    en: 'A premier Saudi investment & development group delivering excellence across real estate, construction, and HVAC engineering.',
  },

  contactEmail: 'info@hardgp.com',
  supportPhone: '+966 55 612 5711',
  whatsappNumber: '+966 55 612 5711',
  tollFreeNumber: '',
  workingHours: {
    ar: 'الأحد - الخميس: 8:00 صباحاً - 5:00 مساءً',
    en: 'Sun - Thu: 8:00 AM - 5:00 PM',
  },

  socialLinks: {
    twitter: 'https://x.com/HARDGRP',
    linkedin: 'https://linkedin.com/company/hardgroup-sa',
    instagram: 'https://www.instagram.com/hardgrp',
    youtube: 'https://youtube.com/@hardgroup_sa',
  },

  office: {
    address: {
      ar: 'طريق الأمير متعب بن عبد العزيز، حي هجر، الدمام، المملكة العربية السعودية',
      en: 'Prince Mutaib bin Abdulaziz Road, Hajr, Dammam, Saudi Arabia',
    },
    city: {
      ar: 'الدمام، المملكة العربية السعودية',
      en: 'Dammam, Saudi Arabia',
    },
    googleMapsUrl: 'https://maps.google.com/?q=26.373703,50.102998',
  },

  footerContent: {
    copyrightText: {
      ar: '© 2026 مجموعة هارد. جميع الحقوق محفوظة.',
      en: '© 2026 HARD Group. All rights reserved.',
    },
    crNumber: '',
    taxNumber: '',
    licenses: {
      ar: '',
      en: '',
    },
  },

  designTokens: {
    primaryAccent: '#0284c7',
    secondaryAccent: '#0369a1',
    darkBgToken: '#034DA2',
    fontFamily: 'Tajawal, Cairo, sans-serif',
  },
};

export const DEFAULT_SECTOR_SETTINGS: Record<SectorId, Partial<PublicBrandingSettings>> = {
  portal: {},
  realestate: {
    sector: 'realestate',
    siteName: { ar: 'هارد للعقارات', en: 'HARD Realestate' },
    tagline: { ar: 'تسويق ووساطة فاخرة', en: 'Luxury Marketing & Brokerage' },
    designTokens: {
      primaryAccent: '#0284c7', // Sky Blue
      secondaryAccent: '#0369a1',
      darkBgToken: '#034DA2',
      fontFamily: 'Tajawal, sans-serif',
    },
  },
  construction: {
    sector: 'construction',
    siteName: { ar: 'هارد للمقاولات', en: 'HARD Contracting' },
    tagline: { ar: 'مقاولات عامة وإنشائية', en: 'Contracting & Construction' },
    designTokens: {
      primaryAccent: '#0284c7',
      secondaryAccent: '#0369a1',
      darkBgToken: '#034DA2',
      fontFamily: 'Tajawal, sans-serif',
    },
  },
  hvac: {
    sector: 'hvac',
    siteName: { ar: 'هارد لصيانة التكييف', en: 'HARD HVAC Maintenance' },
    tagline: { ar: 'صيانة احترافية', en: 'Professional Maintenance' },
    designTokens: {
      primaryAccent: '#0284c7',
      secondaryAccent: '#0369a1',
      darkBgToken: '#034DA2',
      fontFamily: 'Tajawal, sans-serif',
    },
  },
};

// URL Sanitization Utility to prevent script injection
export function sanitizeUrl(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:text/html') ||
    lower.startsWith('vbscript:') ||
    lower.includes('<script')
  ) {
    return '#invalid-url';
  }
  return trimmed;
}

// Text Sanitization Utility
export function sanitizeText(text: string): string {
  if (!text) return '';
  return text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '').trim();
}

// Hex color validation
export function isValidHexColor(color: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color.trim());
}

interface SiteSettingsContextType {
  getEffectiveSettings: (sector?: SectorId) => PublicBrandingSettings;
  allSectorSettings: Record<SectorId, PublicBrandingSettings>;
  saveDraftSettings: (sector: SectorId, settings: PublicBrandingSettings, authorUid?: string) => Promise<void>;
  publishSettings: (sector: SectorId, authorUid?: string) => Promise<void>;
  resetSectorSettings: (sector: SectorId) => Promise<void>;
  isLoading: boolean;
}

const SiteSettingsContext = createContext<SiteSettingsContextType | undefined>(undefined);

export const SiteSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [publishedSettings, setPublishedSettings] = useState<Record<SectorId, PublicBrandingSettings>>({
    portal: DEFAULT_PORTAL_SETTINGS,
    realestate: { ...DEFAULT_PORTAL_SETTINGS, ...DEFAULT_SECTOR_SETTINGS.realestate, sector: 'realestate' },
    construction: { ...DEFAULT_PORTAL_SETTINGS, ...DEFAULT_SECTOR_SETTINGS.construction, sector: 'construction' },
    hvac: { ...DEFAULT_PORTAL_SETTINGS, ...DEFAULT_SECTOR_SETTINGS.hvac, sector: 'hvac' },
  });
  const [draftSettings, setDraftSettings] = useState<Partial<Record<SectorId, PublicBrandingSettings>>>({});
  const [isLoading, setIsLoading] = useState(true);
  const allSectorSettings = React.useMemo(() => {
    const result = { ...publishedSettings };
    for (const sector of Object.keys(draftSettings) as SectorId[]) {
      const draft = draftSettings[sector];
      if (draft && Date.parse(draft.updatedAt) > Date.parse(publishedSettings[sector].updatedAt)) {
        result[sector] = draft;
      }
    }
    return result;
  }, [publishedSettings, draftSettings]);

  useEffect(() => {
    const controller = new AbortController();
    let generation = 0;
    async function loadPublished() {
      const request = ++generation;
      try {
        const response = await fetch(hardSupabaseUrl + '/rest/v1/hard_site_branding?visibility=eq.published&select=sector,settings', {
          headers: { apikey: hardPublishableKey },
          cache: 'no-store',
          signal: controller.signal,
        });
        if (!response.ok) throw new Error('Could not fetch published branding');
        const rows: { sector: SectorId; settings: PublicBrandingSettings }[] = await response.json();
        if (controller.signal.aborted || request !== generation) return;
        setPublishedSettings((previous) => {
          const result = { ...previous };
          for (const { sector, settings } of rows) result[sector] = { ...previous[sector], ...settings, sector };
          return result;
        });
      } catch (error) {
        if (!controller.signal.aborted) console.warn('Could not load the database branding', error);
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }
    const onStorage = (event: StorageEvent) => { if (event.key === 'hard-branding-saved') void loadPublished(); };
    window.addEventListener('focus', loadPublished);
    window.addEventListener('hard-branding-saved', loadPublished);
    window.addEventListener('storage', onStorage);
    void loadPublished();
    return () => {
      controller.abort();
      window.removeEventListener('focus', loadPublished);
      window.removeEventListener('hard-branding-saved', loadPublished);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  useEffect(() => {
    let requestId = 0;
    const { data: { subscription } } = hardAdminClient.auth.onAuthStateChange((_event, session) => {
      const id = ++requestId;
      if (!session || !toHardAdmin(session.user)) {
        setDraftSettings({});
        return;
      }
      setTimeout(async () => {
        if (id !== requestId) return;
        try {
          const { data, error } = await hardAdminClient.from('hard_site_branding').select('sector,settings').eq('visibility','draft');
          if (id !== requestId || error) return;
          setDraftSettings(Object.fromEntries((data ?? []).map(({ sector, settings }) => [sector, settings])));
        } catch {
          // Keep the published settings available if drafts cannot be loaded.
        }
      }, 0);
    });
    return () => {
      requestId++;
      subscription.unsubscribe();
    };
  }, []);

  /**
   * Evaluates precedence: Sector Overrides merge over Shared Group (portal) settings.
   */
  const getEffectiveSettings = useCallback(
    (sector: SectorId = 'portal'): PublicBrandingSettings => {
      const portalSettings = publishedSettings.portal || DEFAULT_PORTAL_SETTINGS;
      if (sector === 'portal') {
        return portalSettings;
      }

      const sectorSettings = publishedSettings[sector];
      if (!sectorSettings) {
        return { ...portalSettings, sector };
      }

      // Merge sector settings over shared portal settings
      return {
        ...portalSettings,
        ...sectorSettings,
        sector,
        siteName: sectorSettings.siteName?.ar ? sectorSettings.siteName : portalSettings.siteName,
        tagline: sectorSettings.tagline?.ar ? sectorSettings.tagline : portalSettings.tagline,
        aboutSummary: sectorSettings.aboutSummary?.ar ? sectorSettings.aboutSummary : portalSettings.aboutSummary,
        contactEmail: sectorSettings.contactEmail || portalSettings.contactEmail,
        supportPhone: sectorSettings.supportPhone || portalSettings.supportPhone,
        whatsappNumber: sectorSettings.whatsappNumber || portalSettings.whatsappNumber,
        designTokens: {
          ...portalSettings.designTokens,
          ...(sectorSettings.designTokens || {}),
        },
        office: {
          ...portalSettings.office,
          ...(sectorSettings.office || {}),
        },
        footerContent: {
          ...portalSettings.footerContent,
          ...(sectorSettings.footerContent || {}),
        },
      };
    },
    [publishedSettings]
  );

  async function persistSettings(sector: SectorId, settings: PublicBrandingSettings, visibility: 'draft' | 'published') {
    const payload: PublicBrandingSettings = {
      ...settings,
      sector,
      publicationStatus: visibility,
      logoUrlLight: sanitizeUrl(settings.logoUrlLight),
      logoUrlDark: sanitizeUrl(settings.logoUrlDark),
      faviconUrl: sanitizeUrl(settings.faviconUrl),
      contactEmail: sanitizeText(settings.contactEmail),
      supportPhone: sanitizeText(settings.supportPhone),
      whatsappNumber: sanitizeText(settings.whatsappNumber),
      office: { ...settings.office, googleMapsUrl: sanitizeUrl(settings.office.googleMapsUrl || '') },
      updatedAt: new Date().toISOString(),
    };
    delete payload.updatedBy;
    const { error } = await hardAdminClient.from('hard_site_branding').upsert({
      sector, visibility, settings: payload, updated_at: payload.updatedAt,
    }, { onConflict: 'sector,visibility' });
    if (error) throw error;
    if (visibility === 'draft') setDraftSettings((previous) => ({ ...previous, [sector]: payload }));
    else {
      setPublishedSettings((previous) => ({ ...previous, [sector]: payload }));
      window.dispatchEvent(new Event('hard-branding-saved'));
      try { localStorage.setItem('hard-branding-saved', String(Date.now())); } catch { /* Focus reload remains available. */ }
    }
  }

  const saveDraftSettings = (sector: SectorId, settings: PublicBrandingSettings) => persistSettings(sector, settings, 'draft');

  async function publishSettings(sector: SectorId) {
    const { data, error } = await hardAdminClient.from('hard_site_branding').select('settings')
      .eq('sector', sector).eq('visibility','draft').maybeSingle();
    if (error) throw error;
    await persistSettings(sector, data?.settings ?? getEffectiveSettings(sector), 'published');
  }

  const resetSectorSettings = (sector: SectorId) => persistSettings(
    sector, { ...DEFAULT_PORTAL_SETTINGS, ...DEFAULT_SECTOR_SETTINGS[sector], sector }, 'published',
  );

  return (
    <SiteSettingsContext.Provider
      value={{
        getEffectiveSettings,
        allSectorSettings,
        saveDraftSettings,
        publishSettings,
        resetSectorSettings,
        isLoading,
      }}
    >
      {children}
    </SiteSettingsContext.Provider>
  );
};

export function useSiteSettings() {
  const context = useContext(SiteSettingsContext);
  if (!context) {
    throw new Error('useSiteSettings must be used within a SiteSettingsProvider');
  }
  return context;
}
