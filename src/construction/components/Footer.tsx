import { useTextOverride } from '../../context/TextOverrideContext';
import { usePublishedBrandEmblem } from '../../components/ui/BrandLogo';
import React from 'react';
import {
  ShieldCheck,
  Award,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
} from 'lucide-react';
import { useConstruction } from '../context/ConstructionContext';
import { COMPANY_CREDENTIALS } from '../data/seedData';
import { handleSemanticClick } from '../../lib/navigation';

interface FooterProps {
  onNavigate?: (page: any) => void;
  onOpenCMS?: () => void;
}

export function Footer({ onNavigate }: FooterProps) {
  const emblem = usePublishedBrandEmblem('construction', 'light');
  const { language, openCostEstimator, openQuoteModal } = useConstruction();
  const { construction: constructionTranslations } = useTextOverride();
  const t = constructionTranslations[language];
  const isAr = language === 'ar';

  return (
    <footer className="bg-[#0b1b2d] text-slate-400 border-t border-slate-800 text-xs">
      {/* Main Footer Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 text-start">
        {/* Col 1: Brand & Tagline */}
        <div className="space-y-4 lg:col-span-1">
          <div className="flex items-center gap-3">
            <img
              src={emblem} onError={({ currentTarget }) => { if (!currentTarget.src.endsWith('/logo.svg')) currentTarget.src = '/logo.svg'; }}
              alt="HARD Group"
              className="h-10 w-auto object-contain"
            />
            <div>
              <div className="font-display-serif font-black text-base text-white">
                {isAr ? 'هارد للمقاولات' : 'HARD Contracting Co.'}
              </div>
              <div className="text-[10px] text-[#009ee2] font-bold">
                {isAr ? 'مقاولات عامة وإنشائية' : 'General Contracting & Construction'}
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {t.brand.tagline.replace('في المملكة', 'في المنطقة الشرقية')}. {t.brand.slogan.replace('في المملكة', 'في المنطقة الشرقية')}.
          </p>

        </div>

        {/* Col 2: Quick Links */}
        <div className="space-y-4">

          <div className="space-y-2">
            <h4 className="text-sm font-bold text-white font-display-serif">
              {isAr ? 'روابط سريعة' : 'Quick Navigation'}
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <a href="#home" className="hover:text-[#009ee2] transition-colors">
                  {t.nav.home}
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-[#009ee2] transition-colors">
                  {t.nav.about}
                </a>
              </li>
              <li>
                <a href="#projects" className="hover:text-[#009ee2] transition-colors">
                  {t.nav.projects}
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-[#009ee2] transition-colors">
                  {t.nav.services}
                </a>
              </li>
              <li>
                <button
                  type="button"
                  onClick={openCostEstimator}
                  className="text-amber-400 hover:text-amber-300 font-bold cursor-pointer"
                >
                  {t.nav.calculator}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openQuoteModal()}
                  className="text-[#009ee2] hover:text-sky-300 font-bold cursor-pointer"
                >
                  {t.nav.requestQuote}
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Col 3: Accreditations */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-white font-display-serif">
            {isAr ? 'الاعتمادات والضمانات' : 'Credentials & Codes'}
          </h4>
          <ul className="space-y-2 text-xs">
            <li className="flex items-center gap-2 text-slate-300">
              <Award className="w-4 h-4 text-[#009ee2] shrink-0" />
              <span>{isAr ? 'تصنيف معتمد' : 'Certified classification'}</span>
            </li>
            <li className="flex items-center gap-2 text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{t.credentials.sbc}</span>
            </li>
            <li className="flex items-center gap-2 text-slate-300">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{t.credentials.warranty}</span>
            </li>
          </ul>
        </div>

        {/* Col 4: Contact & Language */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-white font-display-serif">
            {isAr ? 'التواصل المباشر' : 'Direct Support'}
          </h4>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#009ee2] shrink-0" />
              <a
                href={`tel:${COMPANY_CREDENTIALS.phone.replace(/\s+/g, '')}`}
                className="hover:text-[#009ee2] dir-ltr text-start font-semibold text-slate-200"
              >
                {COMPANY_CREDENTIALS.phone}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#009ee2] shrink-0" />
              <a href={`mailto:${COMPANY_CREDENTIALS.email}`} className="hover:text-[#009ee2] text-slate-200">
                {COMPANY_CREDENTIALS.email}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#009ee2] shrink-0" />
              <span>{isAr ? 'طريق الأمير متعب بن عبد العزيز، حي هجر، الدمام، المملكة العربية السعودية' : 'Prince Mutaib bin Abdulaziz Road, Hajar District, Dammam, Saudi Arabia'}</span>
            </div>
          </div>

        </div>
      </div>

      {/* Sub-Footer Copyright */}
      <div className="border-t border-slate-900 py-6 bg-[#071320]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-[11px] text-slate-400">
          <div>
            {isAr ? 'جميع الحقوق محفوظة. هارد للمقاولات@٢٠٢٦' : 'Copyright. HARD Contracting@2026'}
          </div>
        </div>
      </div>
    </footer>
  );
}
