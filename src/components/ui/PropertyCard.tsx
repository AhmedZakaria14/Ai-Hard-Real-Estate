import React, { useState } from 'react';
import {
  MapPin,
  Bed,
  Bath,
  Maximize,
  ArrowRight,
  ArrowLeft,
  Calendar,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  Eye,
  Share2,
  Check,
} from 'lucide-react';
import { Language, Property } from '../../types';
import { translations } from '../../lib/translations';
import { Button } from './Button';
import { Badge } from './Badge';

interface PropertyCardProps {
  key?: React.Key;
  property: Property;
  language: Language;
  onSelectProperty: (property: Property) => void;
  onOpenBookViewingModal?: (property: Property) => void;
  layout?: 'grid' | 'list';
  badgeType?: 'featured' | 'new' | 'status';
}

export function PropertyCard({
  property,
  language,
  onSelectProperty,
  onOpenBookViewingModal,
  layout = 'grid',
  badgeType,
}: PropertyCardProps) {
  const t = translations[language];
  const ArrowIcon = language === 'ar' ? ArrowLeft : ArrowRight;
  const [copied, setCopied] = useState(false);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Determine badge label
  const isNew = property.id === 'prop-3' || property.status === 'exclusive';
  const displayBadge = badgeType === 'new' || (badgeType !== 'featured' && isNew)
    ? { text: t.home.propertyBadgeNew, variant: 'primary' as const }
    : property.featured
    ? { text: t.home.propertyBadgeFeatured, variant: 'gradient' as const }
    : null;

  const statusLabel =
    property.status === 'for-sale'
      ? t.properties.filters.forSale
      : property.status === 'for-rent'
      ? t.properties.filters.forRent
      : property.status === 'exclusive'
      ? (language === 'en' ? 'Exclusive' : 'حصري')
      : t.properties.filters.offPlan;

  if (layout === 'list') {
    return (
      <div
        id={`property-card-${property.id}`}
        className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 group flex flex-col md:flex-row gap-6 p-4 sm:p-5"
      >
        {/* Image Container */}
        <div
          className="relative w-full md:w-80 h-56 sm:h-64 rounded-2xl overflow-hidden bg-slate-100 shrink-0 cursor-pointer"
          onClick={() => onSelectProperty(property)}
        >
          <img
            src={property.images[activeImageIdx] || property.images[0]}
            alt={property.title[language]}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

          {/* Badges Overlay */}
          <div className="absolute top-3 start-3 flex flex-wrap gap-1.5 z-10">
            {displayBadge && (
              <Badge variant={displayBadge.variant} className="shadow-sm">
                <Sparkles className="w-3 h-3 me-1 inline" />
                {displayBadge.text}
              </Badge>
            )}
            <Badge variant="dark" className="shadow-sm">
              {statusLabel}
            </Badge>
          </div>

          {/* Share button */}
          <button
            type="button"
            onClick={handleShare}
            aria-label="Share property"
            className="absolute top-3 end-3 w-8 h-8 rounded-full bg-slate-900/60 backdrop-blur-md text-white hover:bg-slate-900 flex items-center justify-center transition-all cursor-pointer z-10"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
          </button>

          {/* Price overlay on image for mobile */}
          <div className="absolute bottom-3 start-3 text-white font-bold text-lg font-display-serif drop-shadow-md">
            {property.price.formattedSAR}
            {property.price.period && (
              <span className="text-xs font-normal opacity-90">
                {' '}
                {property.price.period === 'year' ? t.propertyDetails.perYear : t.propertyDetails.perMonth}
              </span>
            )}
          </div>
        </div>

        {/* Content Container */}
        <div className="flex-1 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>
                {property.location.area[language]}, {property.location.city[language]}
              </span>
              <span className="text-slate-300">•</span>
              <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-medium text-[11px]">
                <ShieldCheck className="w-3 h-3" />
                {language === 'en' ? 'Verified Title' : 'صك معتمد'}
              </span>
            </div>

            <h3
              onClick={() => onSelectProperty(property)}
              className="text-lg sm:text-xl font-bold text-slate-900 font-display-serif hover:text-blue-600 transition-colors cursor-pointer"
            >
              {property.title[language]}
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
              {property.description[language]}
            </p>

            {/* Key Specs */}
            <div className="flex flex-wrap items-center gap-3 py-2 px-3 bg-slate-50 rounded-xl text-xs text-slate-700 border border-slate-100 max-w-fit">
              <div className="flex items-center gap-1.5 font-medium">
                <Bed className="w-4 h-4 text-blue-600" />
                <span>{property.bedrooms > 0 ? `${property.bedrooms} ${t.properties.beds}` : (language === 'en' ? 'Commercial' : 'تجاري')}</span>
              </div>
              <span className="text-slate-300">•</span>
              <div className="flex items-center gap-1.5 font-medium">
                <Bath className="w-4 h-4 text-blue-600" />
                <span>{property.bathrooms} {t.properties.baths}</span>
              </div>
              <span className="text-slate-300">•</span>
              <div className="flex items-center gap-1.5 font-medium">
                <Maximize className="w-4 h-4 text-blue-600" />
                <span>{property.areaSqFt.toLocaleString()} {t.properties.sqft}</span>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="text-slate-900 font-extrabold text-xl font-display-serif hidden md:block">
              {property.price.formattedSAR}
              {property.price.period && (
                <span className="text-xs font-normal text-slate-500">
                  {' '}
                  {property.price.period === 'year' ? t.propertyDetails.perYear : t.propertyDetails.perMonth}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSelectProperty(property)}
                className="text-xs font-bold flex-1 sm:flex-none justify-center"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{t.cta.viewDetails}</span>
              </Button>

              {onOpenBookViewingModal && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onOpenBookViewingModal(property)}
                  className="text-xs font-bold flex-1 sm:flex-none justify-center"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{t.cta.bookViewing}</span>
                </Button>
              )}

              <a
                href={`https://wa.me/966556125711?text=${encodeURIComponent(
                  language === 'en'
                    ? `Hello HARD Real Estate, I would like more information on "${property.title.en}" (Ref: ${property.id}).`
                    : `مرحباً هارد للعقارات، أود الاستفسار عن عقار "${property.title.ar}" (رقم المرجع: ${property.id}).`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-none"
              >
                <Button variant="whatsapp" size="sm" className="w-full text-xs font-bold justify-center">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{t.nav.whatsapp}</span>
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid Layout (Default 3-Column Card)
  return (
    <div
      id={`property-card-${property.id}`}
      className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 group flex flex-col justify-between"
    >
      <div>
        {/* High-Resolution Image Container */}
        <div
          className="relative aspect-16/10 overflow-hidden bg-slate-950 cursor-pointer"
          onClick={() => onSelectProperty(property)}
        >
          <img
            src={property.images[activeImageIdx] || property.images[0]}
            alt={property.title[language]}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-70" />

          {/* Badges on Top */}
          <div className="absolute top-3 start-3 flex flex-wrap items-center gap-1.5 z-10">
            {displayBadge && (
              <Badge variant={displayBadge.variant} className="shadow-md">
                <Sparkles className="w-3 h-3 me-1 inline" />
                {displayBadge.text}
              </Badge>
            )}
            <Badge variant="dark" className="shadow-md">
              {statusLabel}
            </Badge>
          </div>

          {/* Share Button on Top Right */}
          <button
            type="button"
            onClick={handleShare}
            aria-label="Share property"
            className="absolute top-3 end-3 w-8 h-8 rounded-full bg-slate-900/60 backdrop-blur-md text-white hover:bg-slate-900 flex items-center justify-center transition-all cursor-pointer z-10"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
          </button>

          {/* Prominent Price Tag Badge on Bottom of Image */}
          <div className="absolute bottom-3 start-3 text-white font-extrabold text-lg sm:text-xl font-display-serif drop-shadow-lg flex items-baseline gap-1">
            <span>{property.price.formattedSAR}</span>
            {property.price.period && (
              <span className="text-xs font-medium text-slate-200">
                {property.price.period === 'year' ? t.propertyDetails.perYear : t.propertyDetails.perMonth}
              </span>
            )}
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 space-y-3">
          {/* Location text */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="truncate font-medium">
              {property.location.area[language]}, {property.location.city[language]}
            </span>
          </div>

          {/* Property Title */}
          <h3
            onClick={() => onSelectProperty(property)}
            className="text-base sm:text-lg font-bold text-slate-900 font-display-serif hover:text-blue-600 transition-colors cursor-pointer line-clamp-1"
            title={property.title[language]}
          >
            {property.title[language]}
          </h3>

          {/* Key Specs Icons Bar */}
          <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-slate-50 rounded-2xl text-[11px] text-slate-700 border border-slate-100">
            <div className="flex items-center gap-1">
              <Bed className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="truncate font-medium">{property.bedrooms > 0 ? `${property.bedrooms} Beds` : 'Comm.'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Bath className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="truncate font-medium">{property.bathrooms} Baths</span>
            </div>
            <div className="flex items-center gap-1">
              <Maximize className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="truncate font-medium">{property.areaSqFt.toLocaleString()} {t.properties.sqft}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Action Footers */}
      <div className="p-5 pt-0 space-y-2">
        {/* Primary View Details Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onSelectProperty(property)}
          className="w-full text-xs font-bold justify-center hover:bg-slate-900 hover:text-white transition-all"
        >
          <span>{t.cta.viewDetails}</span>
          <ArrowIcon className="w-3.5 h-3.5" />
        </Button>

        {/* Secondary Quick Action Row: Book Viewing & WhatsApp */}
        <div className="grid grid-cols-2 gap-2">
          {onOpenBookViewingModal && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onOpenBookViewingModal(property)}
              className="w-full text-xs font-semibold justify-center"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span className="truncate">{t.cta.bookViewing}</span>
            </Button>
          )}

          <a
            href={`https://wa.me/966556125711?text=${encodeURIComponent(
              language === 'en'
                ? `Hello HARD Real Estate, I am inquiring about "${property.title.en}" (Ref: ${property.id}).`
                : `مرحباً هارد للعقارات، أود الاستفسار عن عقار "${property.title.ar}" (رقم المرجع: ${property.id}).`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full"
          >
            <Button variant="whatsapp" size="sm" className="w-full text-xs font-semibold justify-center">
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="truncate">{t.nav.whatsapp}</span>
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
