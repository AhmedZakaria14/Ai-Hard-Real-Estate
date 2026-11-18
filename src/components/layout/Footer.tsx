import { LocalizedValue } from '../ui/LocalizedValue';
import { InterfaceText } from '../ui/InterfaceText';
import { ManagedA, ManagedInput } from '../ui/ManagedElements';
import { useState, type FormEvent } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  MessageSquare,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Instagram,
} from 'lucide-react';
import { Language, PageId } from '../../types';
import { translations as defaultTranslations } from '../../lib/translations';
import { useTextOverride } from '../../context/TextOverrideContext';
import { submitCustomerForm } from '../../lib/forms/formSubmissionService';
import { Button } from '../ui/Button';
import { BrandLogo } from '../ui/BrandLogo';
import { getPageHref, handleSemanticClick, realEstateNavigationPages } from '../../lib/navigation';

interface FooterProps {
  onNavigate: (page: PageId) => void;
  language: Language;
}

export function Footer({ onNavigate, language }: FooterProps) {
  const { translations } = useTextOverride();
  const t = translations[language] || defaultTranslations[language];
  const isAr = language === 'ar';
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [subError, setSubError] = useState('');
  const [loading, setLoading] = useState(false);
  const handleSubscribe = async (e: FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setLoading(true);
    setSubError('');
    try {
      await submitCustomerForm({
        formType: 'newsletter_signup',
        sector: 'group',
        name: newsletterEmail.split('@')[0],
        email: newsletterEmail.trim(),
        language,
        message: `Newsletter subscription via main website footer (${language.toUpperCase()})`,
        details: {
          source: 'Website Footer',
        },
      });
      setSubscribed(true);
      setNewsletterEmail('');
    } catch (err: any) {
      console.error('Subscription error:', err);
      setSubError(
        err?.message || (isAr
          ? 'تعذر تسليم الاشتراك حالياً. تم حفظ البريد المدخل، يرجى إعادة المحاولة.'
          : 'Subscription delivery failed. Your email is preserved. Please click retry.')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLinkClick = (pageId: PageId) => {
    onNavigate(pageId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-900 mt-20">
      {/* 4-Column Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Column 1: Brand / Bio */}
          <div className="space-y-4">
            <ManagedA copyScope="realestate.Footer"
              href="/realestate"
              onClick={(e) => handleSemanticClick(e, () => handleLinkClick('home'))}
              className="cursor-pointer group inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded-xl"
              aria-label={isAr ? 'الرئيسية - هارد للعقارات' : 'HARD Real Estate Home'}
            >
              <BrandLogo size="md" language={language} variant="light" />
            </ManagedA>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              {isAr
                ? <InterfaceText id="realestate.Footer.ko6mw4a" source="نحن في مؤسسة هارد للعقارات نرسم ملامح جديدة للتميز العقاري؛ لنكون منصتكم الأولى للوساطة والتسويق العقاري الفاخر. نلبي تطلعات كافة شرائح العملاء بأعلى معايير الاحترافية." />
                : <InterfaceText id="realestate.Footer.kvvujnq" source="At HARD Real Estate, we are shaping a new standard of excellence as your first choice for luxury real estate brokerage and marketing. We serve clients of every kind with the highest standards of professionalism." />}
            </p>

            <p className="flex items-start gap-2 pt-2 text-sm font-normal text-slate-300">
              <ShieldCheck className="size-4 shrink-0" aria-hidden="true" />
              <span>{isAr ? <InterfaceText id="realestate.Footer.knc34ga" source="مؤسسة وساطة وتسويق عقاري مرخصة رسمياً" /> : <InterfaceText id="realestate.Footer.k1nswnpv" source="Officially licensed real estate brokerage and marketing firm" />}
                <br />{isAr ? <InterfaceText id="realestate.Footer.k6pw5k1" source="(رخصة فال)" /> : <InterfaceText id="realestate.Footer.k1fl355w" source="(FAL License)" />}
              </span>
            </p>
            <div className="space-y-2 pt-2">
              <p className="text-xs font-semibold text-slate-300">{isAr ? <InterfaceText id="realestate.Footer.k1y0ocvc" source="تابعنا على:" /> : <InterfaceText id="realestate.Footer.khxrxml" source="Follow us on:" />}</p>
              <div className="flex items-center gap-2.5">
                <ManagedA copyScope="realestate.Footer"
                  href="https://www.instagram.com/hardgrp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-pink-400 hover:bg-slate-800/90 hover:border-pink-500/40 transition-all group shadow-xs"
                  aria-label="Instagram"
                  title="Instagram (@hardgrp)"
                >
                  <Instagram className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </ManagedA>
                <ManagedA copyScope="realestate.Footer"
                  href="https://x.com/HARDGRP"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800/90 hover:border-slate-600 transition-all group shadow-xs"
                  aria-label="X / Twitter"
                  title="X / Twitter (@HARDGRP)"
                >
                  <svg
                    className="w-3.5 h-3.5 fill-current group-hover:scale-110 transition-transform"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </ManagedA>
              </div>
            </div>
          </div>

          <nav aria-label={t.footer.sitemap}>
            <h4 className="mb-4 text-sm font-bold text-white"><LocalizedValue value={t.footer.sitemap} /></h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              {realEstateNavigationPages.map((page) => <li key={page}>
                <a href={getPageHref(page)} onClick={(event) => handleSemanticClick(event, () => handleLinkClick(page))}
                  className="inline-block py-0.5 text-slate-300 hover:text-blue-400 focus-visible:underline">
                  <LocalizedValue value={t.nav[page]} />
                </a>
              </li>)}
            </ul>
          </nav>

          {/* Contact information */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-2 font-ui-sans">
              <LocalizedValue value={t.footer.contactInfo} />
            </h4>

            <div className="space-y-2.5 text-xs text-slate-300 pb-2">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                <span className="leading-snug">
                  {language === 'en'
                    ? <InterfaceText id="realestate.Footer.khrej2z" source="Prince Mutaib Road, Hajr Dist., Dammam, KSA" />
                    : <InterfaceText id="realestate.Footer.k1k1pl3c" source="طريق الأمير متعب، حي هجر، الدمام، السعودية" />}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <a
                  href="tel:+966556125711"
                  dir="ltr"
                  className="hover:text-blue-400 transition-colors font-medium text-left"
                >
                  <bdi dir="ltr"><LocalizedValue value="+966 55 612 5711" /></bdi>
                </a>
              </div>

              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <a
                  href="mailto:info@hardgp.com"
                  dir="ltr"
                  className="hover:text-blue-400 transition-colors"
                >
                  info@hardgp.com
                </a>
              </div>

              <div className="flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <a
                  href="https://wa.me/966556125711"
                  target="_blank"
                  rel="noopener noreferrer"
                  dir="ltr"
                  className="text-emerald-400 hover:text-emerald-300 transition-colors font-medium text-left"
                >
                  <bdi dir="ltr"><LocalizedValue value="+966 55 612 5711" /></bdi>
                </a>
              </div>
            </div>

          </div>

          <div className="space-y-2">
              <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-1 font-ui-sans">
                <LocalizedValue value={t.footer.newsletterTitle} />
              </h5>
              <p className="text-[11px] text-slate-400 leading-relaxed mb-2">
                <LocalizedValue value={t.footer.newsletterSubtitle} />
              </p>

              {subscribed ? (
                <div className="p-3 bg-blue-950/60 border border-blue-800/80 rounded-xl text-blue-200 text-xs space-y-1 animate-in fade-in">
                  <div className="flex items-center gap-1.5 font-semibold text-white">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{language === 'en' ? <InterfaceText id="realestate.Footer.kusah51" source="Subscribed" /> : <InterfaceText id="realestate.Footer.k1qag4p3" source="تم الاشتراك" />}</span>
                  </div>
                  <p className="text-[11px]"><LocalizedValue value={t.footer.newsletterSuccess} /></p>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="space-y-2">
                  {subError && (
                    <div className="p-2.5 bg-rose-950/80 border border-rose-800 text-rose-200 rounded-xl text-[11px] leading-relaxed animate-in fade-in">
                      <p><LocalizedValue value={subError} /></p>
                    </div>
                  )}
                  <div className="relative">
                    <ManagedInput copyScope="realestate.Footer"
                      type="email"
                      required
                      placeholder={t.footer.newsletterPlaceholder}
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 hover:border-slate-600 focus:border-blue-500 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    isLoading={loading}
                    className="w-full justify-center text-xs py-2"
                  >
                    <span><LocalizedValue value={t.footer.newsletterButton} /></span>
                    <ArrowIcon className="w-3.5 h-3.5" />
                  </Button>
                </form>
              )}
          </div>
        </div>

        <p className="mt-12 border-t border-slate-800 pt-6 text-center text-xs text-slate-400"><LocalizedValue value={t.footer.copyright} /></p>
      </div>
    </footer>
  );
}
