import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  Bed,
  Bath,
  Maximize,
  Calendar,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  Building,
  Car,
} from 'lucide-react';
import { Language, PageId, Property } from '../types';
import { translations } from '../lib/translations';
import { mockProperties } from '../data/mockData';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { formatCurrency } from '../lib/utils';
import { PropertyInquiryForm } from '../components/forms/PropertyInquiryForm';

interface PropertyDetailPageProps {
  property: Property;
  onBack: () => void;
  onNavigate: (page: PageId) => void;
  onSelectProperty: (property: Property) => void;
  language: Language;
  onOpenBookViewingModal?: (property: Property) => void;
}

export function PropertyDetailPage({
  property,
  onBack,
  onNavigate,
  onSelectProperty,
  language,
  onOpenBookViewingModal,
}: PropertyDetailPageProps) {
  const t = translations[language];
  const ArrowIcon = language === 'ar' ? ArrowRight : ArrowLeft;
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const similarProperties = mockProperties.filter((p) => p.id !== property.id).slice(0, 2);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-700 transition-colors cursor-pointer"
      >
        <ArrowIcon className="w-4 h-4" />
        <span>{t.propertyDetails.backToListings}</span>
      </button>

      {/* Main Header & Title Bar */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-slate-200">
        <div className="space-y-3 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={property.status === 'for-sale' ? 'gradient' : 'dark'}>
              {property.status === 'for-sale'
                ? t.properties.filters.forSale
                : property.status === 'for-rent'
                ? t.properties.filters.forRent
                : t.properties.filters.offPlan}
            </Badge>
            <Badge variant="outline">{property.type.toUpperCase()}</Badge>
            <span className="text-xs text-slate-400">ID: {property.id}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 font-display-serif tracking-tight leading-tight">
            {property.title[language]}
          </h1>

          <div className="flex items-center gap-2 text-sm text-slate-600">
            <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
            <span>{property.location.address[language]}</span>
          </div>
        </div>

        {/* Price & Action Box */}
        <div className="text-start lg:text-end space-y-3">
          <div>
            <span className="text-xs text-slate-500 uppercase tracking-wider block">
              {t.propertyDetails.price}
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-blue-700 font-display-serif">
              {property.price.formattedSAR || `${property.price.sar?.toLocaleString()} SAR`}
              {property.price.period && (
                <span className="text-sm font-normal text-slate-500">
                  {' '}
                  {property.price.period === 'year' ? t.propertyDetails.perYear : t.propertyDetails.perMonth}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Section */}
      <div className="space-y-3">
        {/* Main large image */}
        <div className="relative aspect-16/9 sm:aspect-21/9 rounded-3xl overflow-hidden bg-slate-900 shadow-lg">
          <img
            src={property.images[activeImageIndex] || property.images[0]}
            alt={property.title[language]}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-all duration-300"
          />
        </div>

        {/* Thumbnails */}
        {property.images.length > 1 && (
          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            {property.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`relative w-24 sm:w-32 aspect-16/10 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                  activeImageIndex === idx
                    ? 'border-blue-600 ring-2 ring-blue-500/30'
                    : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img src={img} alt="thumbnail" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Grid: Details & Sticky Booking Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Details, Specs, Amenities, Mortgage Calc (8 cols) */}
        <div className="lg:col-span-8 space-y-10">
          {/* Quick Specs Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <div className="space-y-1">
              <span className="text-xs text-slate-500 flex items-center gap-1.5">
                <Bed className="w-3.5 h-3.5 text-blue-600" />
                {t.propertyDetails.quickFacts.bedrooms}
              </span>
              <p className="text-base font-bold text-slate-900">
                {property.bedrooms > 0 ? property.bedrooms : 'Commercial'}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-slate-500 flex items-center gap-1.5">
                <Bath className="w-3.5 h-3.5 text-blue-600" />
                {t.propertyDetails.quickFacts.bathrooms}
              </span>
              <p className="text-base font-bold text-slate-900">{property.bathrooms}</p>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-slate-500 flex items-center gap-1.5">
                <Maximize className="w-3.5 h-3.5 text-blue-600" />
                {t.propertyDetails.quickFacts.area}
              </span>
              <p className="text-base font-bold text-slate-900">
                {property.areaSqFt.toLocaleString()} {t.properties.sqft} ({property.areaSqM} {t.properties.sqm})
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-slate-500 flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-blue-600" />
                {t.propertyDetails.quickFacts.parking}
              </span>
              <p className="text-base font-bold text-slate-900">{property.features.parkingSpaces} Slots</p>
            </div>
          </div>

          {/* Description / Overview */}
          <div className="space-y-4 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 font-display-serif">
              {t.propertyDetails.overview}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              {property.description[language]}
            </p>
          </div>

          {/* Detailed Specifications Matrix */}
          <div className="space-y-4 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 font-display-serif">
              {t.propertyDetails.specifications}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">{t.propertyDetails.quickFacts.propertyType}:</span>
                <span className="font-semibold text-slate-900 capitalize">{property.type}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">{t.propertyDetails.quickFacts.yearBuilt}:</span>
                <span className="font-semibold text-slate-900">{property.features.yearBuilt}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">{t.propertyDetails.quickFacts.furnishing}:</span>
                <span className="font-semibold text-slate-900">{property.features.furnishing[language]}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">{t.propertyDetails.quickFacts.view}:</span>
                <span className="font-semibold text-slate-900">{property.features.view[language]}</span>
              </div>
            </div>
          </div>

          {/* Luxury Amenities */}
          <div className="space-y-4 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 font-display-serif">
              {t.propertyDetails.amenities}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {property.amenities[language].map((amenity, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Dedicated Property Inquiry Form */}
          <PropertyInquiryForm property={property} language={language} />
        </div>

        {/* Right Column: Sticky Action & Direct Agent Card (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Direct CTA Box */}
          <div className="sticky top-24 bg-white p-6 rounded-2xl border border-slate-200 shadow-md space-y-5">
            <h3 className="text-lg font-bold text-slate-900 font-display-serif">
              {language === 'en' ? 'Inquire or Tour Property' : 'طلب معاينة أو استفسار'}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {t.propertyDetails.bookViewingSubtitle}
            </p>

            {/* Mandatory "Book a Viewing" CTA */}
            <Button
              variant="primary"
              size="lg"
              onClick={() => onOpenBookViewingModal(property)}
              className="w-full shadow-md justify-center font-bold"
            >
              <Calendar className="w-4 h-4" />
              <span>{t.cta.bookViewing}</span>
            </Button>

            {/* Mandatory "Chat on WhatsApp" Direct CTA */}
            <a
              href={`https://wa.me/966556125711?text=${encodeURIComponent(
                language === 'en'
                  ? `Hello HARD Real Estate, I'm inquiring about "${property.title.en}" (Ref: ${property.id}).`
                  : `مرحباً هارد للعقارات، أود الاستفسار عن عقار "${property.title.ar}" (رقم المرجع: ${property.id}).`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full"
            >
              <Button variant="whatsapp" size="lg" className="w-full justify-center">
                <MessageSquare className="w-4 h-4" />
                <span>{t.cta.chatOnWhatsApp}</span>
              </Button>
            </a>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-500 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                {language === 'en' ? 'Verified Title Deed & Escrow Protected' : 'صك ملكية موثق ومعتمد وضمان بنكي'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Properties Section */}
      <div className="pt-12 border-t border-slate-200 space-y-6">
        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 font-display-serif">
          {t.propertyDetails.similarProperties}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {similarProperties.map((sim) => (
            <div
              key={sim.id}
              onClick={() => {
                onSelectProperty(sim);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md cursor-pointer transition-all flex flex-col sm:flex-row group"
            >
              <div className="relative sm:w-48 aspect-16/10 sm:aspect-auto overflow-hidden bg-slate-100">
                <img
                  src={sim.images[0]}
                  alt={sim.title[language]}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                <div>
                  <span className="text-[11px] text-blue-600 font-semibold">{sim.location.area[language]}</span>
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                    {sim.title[language]}
                  </h4>
                </div>
                <div className="text-sm font-bold text-slate-900 font-display-serif">
                  {sim.price.formattedSAR || `${sim.price.sar?.toLocaleString()} SAR`}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
