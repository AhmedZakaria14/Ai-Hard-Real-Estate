import { LocalizedValue } from '../../components/ui/LocalizedValue';
import { InterfaceText } from '../../components/ui/InterfaceText';
import { ManagedImg } from '../../components/ui/ManagedElements';
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
    <footer className="bg-[#034DA2] text-slate-400 border-t border-slate-800 text-xs">
      {/* Main Footer Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 text-start">
        {/* Col 1: Brand & Tagline */}
        <div className="space-y-4 lg:col-span-1">
          <div className="flex items-center gap-3">
            <ManagedImg copyScope="construction.Footer"
              src={emblem} onError={({ currentTarget }) => { if (!currentTarget.src.endsWith('/logo.svg')) currentTarget.src = '/logo.svg'; }}
              alt="HARD Group"
              className="h-10 w-auto object-contain"
            />
            <div>
              <div className="font-display-serif font-black text-base text-white">
                {isAr ? <InterfaceText id="construction.Footer.kfuun6i" source="هارد للمقاولات" /> : <InterfaceText id="construction.Footer.kzfqcle" source="HARD Contracting Co." />}
              </div>
              <div className="text-[10px] text-[#009ee2] font-bold">
                {isAr ? <InterfaceText id="construction.Footer.kdy5nk9" source="مقاولات عامة وإنشائية" /> : <InterfaceText id="construction.Footer.k1pggh98" source="General Contracting & Construction" />}
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            <LocalizedValue value={t.brand.tagline.replace('في المملكة', 'في المنطقة الشرقية')} />. <LocalizedValue value={t.brand.slogan.replace('في المملكة', 'في المنطقة الشرقية')} />.
          </p>

        </div>

        {/* Col 2: Quick Links */}
        <div className="space-y-4">

          <div className="space-y-2">
            <h4 className="text-sm font-bold text-white font-display-serif">
              {isAr ? <InterfaceText id="construction.Footer.k18u54m8" source="روابط سريعة" /> : <InterfaceText id="construction.Footer.kh8q17q" source="Quick Navigation" />}
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <a href="#home" className="hover:text-[#009ee2] transition-colors">
                  <LocalizedValue value={t.nav.home} />
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-[#009ee2] transition-colors">
                  <LocalizedValue value={t.nav.about} />
                </a>
              </li>
              <li>
                <a href="#projects" className="hover:text-[#009ee2] transition-colors">
                  <LocalizedValue value={t.nav.projects} />
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-[#009ee2] transition-colors">
                  <LocalizedValue value={t.nav.services} />
                </a>
              </li>
              <li>
                <button
                  type="button"
                  onClick={openCostEstimator}
                  className="text-amber-400 hover:text-amber-300 font-bold cursor-pointer"
                >
                  <LocalizedValue value={t.nav.calculator} />
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openQuoteModal()}
                  className="text-[#009ee2] hover:text-sky-300 font-bold cursor-pointer"
                >
                  <LocalizedValue value={t.nav.requestQuote} />
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Col 3: Accreditations */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-white font-display-serif">
            {isAr ? <InterfaceText id="construction.Footer.kdz0pb2" source="الاعتمادات والضمانات" /> : <InterfaceText id="construction.Footer.kvq1eq5" source="Credentials & Codes" />}
          </h4>
          <ul className="space-y-2 text-xs">
            <li className="flex items-center gap-2 text-slate-300">
              <Award className="w-4 h-4 text-[#009ee2] shrink-0" />
              <span>{isAr ? <InterfaceText id="construction.Footer.kpt0223" source="تصنيف معتمد" /> : <InterfaceText id="construction.Footer.kqahmhm" source="Certified classification" />}</span>
            </li>
            <li className="flex items-center gap-2 text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span><LocalizedValue value={t.credentials.sbc} /></span>
            </li>
            <li className="flex items-center gap-2 text-slate-300">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span><LocalizedValue value={t.credentials.warranty} /></span>
            </li>
          </ul>
        </div>

        {/* Col 4: Contact & Language */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-white font-display-serif">
            {isAr ? <InterfaceText id="construction.Footer.k3mfmuc" source="التواصل المباشر" /> : <InterfaceText id="construction.Footer.kd77wd7" source="Direct Support" />}
          </h4>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#009ee2] shrink-0" />
              <a
                href={`tel:${COMPANY_CREDENTIALS.phone.replace(/\s+/g, '')}`}
                className="hover:text-[#009ee2] dir-ltr text-start font-semibold text-slate-200"
              >
                <LocalizedValue value={COMPANY_CREDENTIALS.phone} />
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#009ee2] shrink-0" />
              <a href={`mailto:${COMPANY_CREDENTIALS.email}`} className="hover:text-[#009ee2] text-slate-200">
                <LocalizedValue value={COMPANY_CREDENTIALS.email} />
              </a>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#009ee2] shrink-0" />
              <span>{isAr ? <InterfaceText id="construction.Footer.k1ytjvpv" source="طريق الأمير متعب بن عبد العزيز، حي هجر، الدمام، المملكة العربية السعودية" /> : <InterfaceText id="construction.Footer.km28pyc" source="Prince Mutaib bin Abdulaziz Road, Hajar District, Dammam, Saudi Arabia" />}</span>
            </div>
          </div>

        </div>
      </div>

      {/* Sub-Footer Copyright */}
      <div className="border-t border-slate-900 py-6 bg-[#034DA2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-[11px] text-slate-400">
          <div>
            {isAr ? <InterfaceText id="construction.Footer.k1nnp6oa" source="جميع الحقوق محفوظة. هارد للمقاولات@٢٠٢٦" /> : <InterfaceText id="construction.Footer.ko2a357" source="Copyright. HARD Contracting@2026" />}
          </div>
        </div>
      </div>
    </footer>
  );
}
