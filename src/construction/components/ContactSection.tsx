import React from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Building,
  FileCheck,
  MessageCircle,
  ArrowRight,
  ArrowLeft,
  Navigation,
} from 'lucide-react';
import { useConstruction } from '../context/ConstructionContext';
import { constructionTranslations } from '../utils/translations';
import { COMPANY_CREDENTIALS } from '../data/seedData';

export function ContactSection() {
  const { language, openQuoteModal } = useConstruction();
  const t = constructionTranslations[language];
  const isAr = language === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  return (
    <section id="contact" className="py-16 sm:py-24 bg-[#f8fafc] text-slate-900 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="space-y-3 max-w-3xl text-start">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#e8f4fc] border border-[#d0e9fa] text-[#009ee2] text-xs font-bold shadow-2xs">
            <MapPin className="w-3.5 h-3.5 text-[#009ee2]" />
            <span>{t.contact.badge}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black font-display-serif text-[#0f243e] tracking-tight">
            {t.contact.title}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
            {t.contact.subtitle}
          </p>
        </div>

        {/* Contact Info Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Main Headquarters Card */}
          <div className="bg-white border border-sky-100 rounded-3xl p-6 sm:p-8 space-y-6 text-start shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-[#eef7ff] border border-sky-100 text-[#009ee2]">
                <Building className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0f243e] font-display-serif">
                  {t.contact.headquarters}
                </h3>
                <span className="text-xs text-[#009ee2] font-semibold">
                  {isAr ? 'الإدارة العامة والمشاريع الكبرى' : 'Executive Management & Major Tenders'}
                </span>
              </div>
            </div>

            <div className="space-y-4 text-xs text-slate-600">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#009ee2] shrink-0 mt-0.5" />
                <span className="leading-relaxed">{COMPANY_CREDENTIALS.address[language]}</span>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#009ee2] shrink-0" />
                <a
                  href={`tel:${COMPANY_CREDENTIALS.phone.replace(/\s+/g, '')}`}
                  className="hover:text-[#009ee2] font-semibold dir-ltr text-start text-slate-800"
                >
                  {COMPANY_CREDENTIALS.phone}
                </a>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#009ee2] shrink-0" />
                <a href={`mailto:${COMPANY_CREDENTIALS.email}`} className="hover:text-[#009ee2] text-slate-800">
                  {COMPANY_CREDENTIALS.email}
                </a>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-[#009ee2] shrink-0" />
                <span>{t.contact.openingHours}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="text-[11px] text-slate-500 font-medium">
                {t.credentials.cr}
              </div>
              <a
                href="https://maps.google.com/?q=King+Fahd+Road+Riyadh"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#009ee2] hover:text-[#008bc7]"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>{isAr ? 'الاتجاهات' : 'Directions'}</span>
              </a>
            </div>
          </div>

          {/* Eastern Province Branch Card */}
          <div className="bg-white border border-sky-100 rounded-3xl p-6 sm:p-8 space-y-6 text-start shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600">
                <Building className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0f243e] font-display-serif">
                  {t.contact.branch}
                </h3>
                <span className="text-xs text-amber-600 font-semibold">
                  {isAr ? 'مشاريع الخبر والدمام والجبيل' : 'Khobar, Dammam & Industrial Coast'}
                </span>
              </div>
            </div>

            <div className="space-y-4 text-xs text-slate-600">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  {COMPANY_CREDENTIALS.easternProvinceBranch[language]}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-amber-600 shrink-0" />
                <a
                  href={`tel:${COMPANY_CREDENTIALS.mobile.replace(/\s+/g, '')}`}
                  className="hover:text-amber-600 font-semibold dir-ltr text-start text-slate-800"
                >
                  {COMPANY_CREDENTIALS.mobile}
                </a>
              </div>

              <div className="flex items-center gap-3">
                <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <a
                  href={`https://wa.me/${COMPANY_CREDENTIALS.whatsapp.replace('+', '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-emerald-700 font-semibold text-emerald-600"
                >
                  {isAr ? 'محادثة واتساب الفورية' : 'Instant WhatsApp Dispatch'}
                </a>
              </div>

              <div className="flex items-center gap-3">
                <FileCheck className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{COMPANY_CREDENTIALS.momrahClassification[language]}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => openQuoteModal()}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-sky-50 text-xs font-bold text-slate-800 hover:text-[#009ee2] border border-slate-200 flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-2xs"
              >
                <span>{t.nav.requestQuote}</span>
                <ArrowIcon className="w-3.5 h-3.5 text-[#009ee2]" />
              </button>
            </div>
          </div>

          {/* Interactive Map Visual */}
          <div className="relative rounded-3xl overflow-hidden border border-sky-100 bg-slate-100 flex flex-col justify-between shadow-sm min-h-[300px]">
            <img
              src="https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80"
              alt="Riyadh Location Map"
              className="absolute inset-0 w-full h-full object-cover opacity-60 filter contrast-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f243e]/80 via-slate-900/30 to-transparent" />

            <div className="relative z-10 p-6 text-start">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 border border-sky-200 text-[#009ee2] text-[11px] font-bold shadow-sm">
                <Navigation className="w-3.5 h-3.5" />
                <span>{isAr ? 'موقعنا على الخريطة' : 'Office Coordinates'}</span>
              </div>
            </div>

            <div className="relative z-10 p-6 text-start space-y-3 bg-white/95 backdrop-blur-md border-t border-slate-100 shadow-lg">
              <div className="text-xs font-bold text-[#0f243e]">
                {COMPANY_CREDENTIALS.address[language]}
              </div>
              <div className="flex gap-2">
                <a
                  href="https://maps.google.com/?q=King+Fahd+Road+Riyadh"
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2 px-3 rounded-xl bg-[#009ee2] hover:bg-[#008bc7] text-white text-center text-xs font-bold transition-colors shadow-2xs"
                >
                  {isAr ? 'فتح الخريطة' : 'Open in Google Maps'}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
