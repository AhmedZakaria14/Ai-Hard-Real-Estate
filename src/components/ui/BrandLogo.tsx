import { LocalizedValue } from './LocalizedValue';
import { ManagedImg } from './ManagedElements';
import React from 'react';
import { Language } from '../../types';
import { useSiteSettings } from '../../context/SiteSettingsContext';

export function usePublishedBrandEmblem(sector: 'portal' | 'realestate' | 'construction' | 'hvac', variant: 'light' | 'dark') {
  const { getEffectiveSettings } = useSiteSettings();
  const settings = getEffectiveSettings(sector);
  return (variant === 'light' ? settings.logoUrlLight : settings.logoUrlDark) || '/logo.svg';
}

const sectorWordmarks = {
  realestate: {
    ar: { name: 'هارد للعقارات', tagline: 'تسويق ووساطة فاخرة' },
    en: { name: 'HARD Realestate', tagline: 'Luxury Marketing & Brokerage' },
  },
  construction: {
    ar: { name: 'هارد للمقاولات', tagline: 'مقاولات عامة وإنشائية' },
    en: { name: 'HARD Contracting', tagline: 'General Contracting & Construction' },
  },
  hvac: {
    ar: { name: 'هارد لصيانة التكييف', tagline: 'صيانة احترافية' },
    en: { name: 'HARD HVAC Maintenance', tagline: 'Professional Maintenance' },
  },
} as const;

interface BrandLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  language?: Language;
  variant?: 'light' | 'dark';
  className?: string;
  isIconOnly?: boolean;
  compactTagline?: boolean;
  standardWordmark?: boolean;
  sector?: 'portal' | 'realestate' | 'construction' | 'hvac';
}

export function BrandLogo({
  size = 'md',
  showText = true,
  language = 'en',
  variant = 'dark',
  className = '',
  isIconOnly = false,
  compactTagline = false,
  standardWordmark = false,
  sector = 'realestate',
}: BrandLogoProps) {
  let settings;
  try {
    const { getEffectiveSettings } = useSiteSettings();
    settings = getEffectiveSettings(sector);
  } catch (e) {
    settings = null;
  }

  // Dimension and typography presets
  const sizeMap = {
    xs: { h: 'h-8 sm:h-9', textClass: 'text-sm', subTextClass: 'text-[9px]' },
    sm: { h: 'h-10 sm:h-11', textClass: 'text-base', subTextClass: 'text-[10px]' },
    md: { h: 'h-12 sm:h-14', textClass: 'text-lg sm:text-xl', subTextClass: 'text-[10px] sm:text-[11px]' },
    lg: { h: 'h-16 sm:h-20', textClass: 'text-2xl sm:text-3xl', subTextClass: 'text-xs' },
    xl: { h: 'h-24 sm:h-28', textClass: 'text-3xl sm:text-4xl', subTextClass: 'text-sm' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;
  const isAr = language === 'ar';

  const logoSrc = settings
    ? variant === 'light'
      ? settings.logoUrlLight || '/logo.svg'
      : settings.logoUrlDark || '/logo.svg'
    : '/logo.svg';

  const brandName = settings
    ? isAr
      ? settings.siteName?.ar || 'هارد للعقارات'
      : settings.siteName?.en || 'HARD REAL ESTATE'
    : isAr
    ? 'هارد للعقارات'
    : 'HARD REAL ESTATE';

  const tagline = settings
    ? isAr
      ? settings.tagline?.ar || 'تسويق ووساطة عقارية فاخرة'
      : settings.tagline?.en || 'Marketing & Luxury Brokerage'
    : isAr
    ? 'تسويق ووساطة عقارية فاخرة'
    : 'Marketing & Luxury Brokerage';

  const wordmark = standardWordmark && sector !== 'portal' ? { name: brandName, tagline } : null;

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Official Emblem */}
      <div className={`relative shrink-0 ${currentSize.h} flex items-center justify-center transition-transform duration-200 group-hover:scale-105`}>
        <ManagedImg copyScope="realestate.BrandLogo"
          src={logoSrc}
          alt={wordmark?.name ?? brandName}
          className={`${currentSize.h} w-auto object-contain object-center max-w-[min(10rem,32vw)] shrink-0 py-0.5 drop-shadow-xs`}
          loading="eager"
          decoding="async"
          onError={({ currentTarget }) => { if (!currentTarget.src.endsWith('/logo.svg')) currentTarget.src = '/logo.svg'; }}
        />
      </div>

      {/* Accompanying Brand Wordmark Typography */}
      {showText && !isIconOnly && (
        <div className="flex min-w-0 flex-col justify-center leading-tight">
          <div className="flex items-baseline gap-1.5">
            <span
              className={`font-bold tracking-tight font-display-serif ${wordmark ? 'text-sm text-[#0076BB] sm:text-base' : currentSize.textClass + (variant === 'light' ? ' text-white' : ' text-slate-900')}`}
            >
              <LocalizedValue value={wordmark?.name ?? brandName} />
            </span>
          </div>
          <span
            className={`tracking-wider uppercase font-semibold font-ui-sans ${wordmark ? 'text-[9px] normal-case tracking-normal sm:text-[10px]' : compactTagline && !isAr ? 'max-w-36 text-[8px] tracking-normal sm:text-[9px]' : currentSize.subTextClass} ${
              variant === 'light' ? 'text-sky-300/80' : wordmark ? 'text-slate-600' : 'text-slate-500'
            }`}
          >
            <LocalizedValue value={wordmark?.tagline ?? tagline} />
          </span>
        </div>
      )}
    </div>
  );
}
