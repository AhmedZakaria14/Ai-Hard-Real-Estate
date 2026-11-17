import React, { useState } from 'react';
import {
  Megaphone,
  HousePlus,
  BadgeCheck,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Camera,
} from 'lucide-react';
import { Language, PageId } from '../types';
import { useTextOverride } from '../context/TextOverrideContext';
import { Button } from '../components/ui/Button';
import { BrandLogo } from '../components/ui/BrandLogo';
import { ValuationWizard } from '../components/forms/ValuationWizard';

interface MarketingPageProps {
  onNavigate: (page: PageId) => void;
  language: Language;
  onOpenListPropertyModal: () => void;
}

export function MarketingPage({
  onNavigate,
  language,
  onOpenListPropertyModal,
}: MarketingPageProps) {
  const { translations } = useTextOverride();
  const [showValuation, setShowValuation] = useState(false);
  const t = translations[language];
  const ArrowIcon = language === 'ar' ? ArrowLeft : ArrowRight;

  const serviceIcons = [Megaphone, Camera, HousePlus, BadgeCheck];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Header */}
      <div className="space-y-3 max-w-3xl">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display-serif tracking-tight">
          {t.marketing.pageTitle}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          {t.marketing.pageSubtitle}
        </p>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {t.marketing.services.map((service, idx) => {
          const Icon = serviceIcons[idx] || Megaphone;
          return (
            <div
              key={idx}
              className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs hover:shadow-md hover:border-blue-300 transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 font-display-serif">
                  {service.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {service.desc}
                </p>
              </div>

              <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-blue-600">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>{language === 'en' ? 'Included in Standard Listing Plan' : 'مشمول في باقة التسويق القياسية'}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Valuation & Listing CTA Box */}
      <div className="bg-hard-gradient text-white rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="relative z-10 max-w-2xl space-y-4">

          <h2 className="text-2xl sm:text-3xl font-extrabold font-display-serif">
            {t.marketing.listFormTitle}
          </h2>

          <p className="text-xs sm:text-base text-blue-100 leading-relaxed">
            {t.marketing.listFormSubtitle}
          </p>

          <div className="pt-4 flex flex-col sm:flex-row sm:flex-wrap gap-3">
            <Button
              variant="white"
              size="lg"
              onClick={onOpenListPropertyModal}
              className="w-full min-w-48 whitespace-nowrap font-bold text-blue-900 sm:w-56"
            >
              <span>{t.cta.listProperty}</span>
              <ArrowIcon className="w-4 h-4" />
            </Button>
            <Button
              variant="white"
              size="lg"
              onClick={() => setShowValuation(true)}
              aria-controls="property-valuation"
              aria-expanded={showValuation}
            >
              {language === 'ar' ? 'اطلب تقييم عقارك' : 'Request a property valuation'}
            </Button>
            <Button
              href="https://wa.me/966556125711?text=Hello%20HARD%20Real%20Estate,%20I%20would%20like%20a%20property%20valuation."
              target="_blank"
              rel="noopener noreferrer"
              variant="whatsapp"
              size="lg"
              className="w-full min-w-48 whitespace-nowrap sm:w-56"
            >
              <span>{t.cta.chatOnWhatsApp}</span>
            </Button>
          </div>
        </div>

        <div className="relative z-10 hidden md:flex items-center justify-center p-6 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 shadow-2xl">
          <BrandLogo size="xl" language={language} variant="light" isIconOnly />
        </div>
      </div>
      <section id="property-valuation" hidden={!showValuation} aria-label={language === 'ar' ? 'طلب تقييم عقار' : 'Property valuation request'}>
        {showValuation && <ValuationWizard language={language} />}
      </section>
    </div>
  );
}
