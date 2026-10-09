import React, { useState } from 'react';
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
import { useData } from '../../context/DataContext';
import { Button } from '../ui/Button';
import { BrandLogo } from '../ui/BrandLogo';

interface FooterProps {
  onNavigate: (page: PageId) => void;
  language: Language;
}

export function Footer({ onNavigate, language }: FooterProps) {
  const { translations } = useTextOverride();
  const { addSubscriber } = useData();
  const t = translations[language] || defaultTranslations[language];
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setLoading(true);
    try {
      await addSubscriber(newsletterEmail.trim(), 'Website Footer', `Subscribed via ${language.toUpperCase()} site`);
      setSubscribed(true);
      setNewsletterEmail('');
    } catch (err) {
      console.error('Subscription error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkClick = (pageId: PageId) => {
    onNavigate(pageId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const ArrowIcon = language === 'ar' ? ArrowLeft : ArrowRight;

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-900 mt-20">
      {/* 4-Column Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Column 1: Brand / Bio */}
          <div className="space-y-4">
            <div
              onClick={() => handleLinkClick('home')}
              className="cursor-pointer group inline-block"
              role="button"
              tabIndex={0}
              aria-label="HARD Real Estate Home"
            >
              <BrandLogo size="md" language={language} variant="light" />
            </div>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              {t.brandBio}
            </p>

            <div className="pt-2 flex items-center gap-2 text-xs text-blue-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>
                {language === 'en'
                  ? 'Officially Licensed Brokerage Firm'
                  : 'مؤسسة وساطة عقارية معتمدة ومرخصة'}
              </span>
            </div>
          </div>

          {/* Column 2: Quick Links (Sitemap) */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 font-ui-sans">
              {t.footer.quickLinks}
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              {[
                { id: 'portal', label: language === 'ar' ? 'بوابة مجموعة هارد' : 'HARD Group Portal' },
                { id: 'construction', label: language === 'ar' ? 'هارد للإنشاءات' : 'HARD Construction' },
                { id: 'home', label: t.nav.home },
                { id: 'about', label: t.nav.about },
                { id: 'properties', label: t.nav.properties },
                { id: 'projects', label: t.nav.projects },
                { id: 'marketing', label: t.nav.marketing },
                { id: 'blog', label: t.nav.blog },
                { id: 'contact', label: t.nav.contact },
              ].map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => handleLinkClick(link.id as PageId)}
                    className="hover:text-blue-400 transition-colors flex items-center gap-1.5 cursor-pointer text-slate-300"
                  >
                    <span className="text-blue-500 opacity-60">›</span>
                    <span>{link.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact Info & Socials */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 font-ui-sans">
              {t.footer.contactInfo}
            </h4>

            <div className="space-y-3 text-xs sm:text-sm text-slate-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm leading-snug">
                  {language === 'en'
                    ? 'Prince Mutaib Road, Hajr Dist., Dammam, Eastern Province, Saudi Arabia'
                    : 'طريق الأمير متعب، حي هجر، الدمام، المنطقة الشرقية، المملكة العربية السعودية'}
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                <a
                  href="tel:+966556125711"
                  dir="ltr"
                  className="text-xs sm:text-sm hover:text-blue-400 transition-colors font-medium inline-block text-left"
                >
                  <bdi dir="ltr">+966 55 612 5711</bdi>
                </a>
              </div>

              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <a
                  href="mailto:info@hardgp.com"
                  dir="ltr"
                  className="hover:text-blue-400 transition-colors text-xs sm:text-sm"
                >
                  info@hardgp.com
                </a>
              </div>

              <div className="flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                <a
                  href="https://wa.me/966556125711"
                  target="_blank"
                  rel="noopener noreferrer"
                  dir="ltr"
                  className="text-emerald-400 hover:text-emerald-300 transition-colors font-medium text-xs sm:text-sm inline-block text-left"
                >
                  <bdi dir="ltr">+966 55 612 5711</bdi>
                </a>
              </div>
            </div>

            {/* Social handles */}
            <div className="pt-2 flex items-center gap-2.5">
              <a
                href="https://www.instagram.com/hardgrp"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-pink-400 hover:bg-slate-800/90 hover:border-pink-500/40 transition-all group shadow-xs"
                aria-label="Instagram"
                title="Instagram (@hardgrp)"
              >
                <Instagram className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </a>
              <a
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
              </a>
            </div>
          </div>

          {/* Column 4: Newsletter Subscription */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-2 font-ui-sans">
              {t.footer.newsletterTitle}
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t.footer.newsletterSubtitle}
            </p>

            {subscribed ? (
              <div className="p-4 bg-blue-950/60 border border-blue-800/80 rounded-2xl text-blue-200 text-xs space-y-1 animate-in fade-in">
                <div className="flex items-center gap-2 font-semibold text-white">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{language === 'en' ? 'Subscription Activated' : 'تم تفعيل الاشتراك'}</span>
                </div>
                <p>{t.footer.newsletterSuccess}</p>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2.5">
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder={t.footer.newsletterPlaceholder}
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 hover:border-slate-600 focus:border-blue-500 rounded-xl text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={loading}
                  className="w-full justify-center"
                >
                  <span>{t.footer.newsletterButton}</span>
                  <ArrowIcon className="w-3.5 h-3.5" />
                </Button>
              </form>
            )}

            <p className="text-[11px] text-slate-500 leading-tight">
              {language === 'en'
                ? 'We respect your privacy. Unsubscribe at any time with 1 click.'
                : 'نحن نحترم خصوصيتك بالكامل، يمكنك إلغاء الاشتراك في أي وقت.'}
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>{t.footer.copyright}</p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleLinkClick('contact')}
              className="hover:text-slate-300"
            >
              {t.footer.privacy}
            </button>
            <span>•</span>
            <button
              onClick={() => handleLinkClick('contact')}
              className="hover:text-slate-300"
            >
              {t.footer.terms}
            </button>
            <span>•</span>
            <button
              onClick={() => handleLinkClick('properties')}
              className="hover:text-slate-300"
            >
              {t.footer.sitemap}
            </button>
            <span>•</span>
            <button
              onClick={() => handleLinkClick('admin')}
              className="hover:text-blue-400 font-semibold inline-flex items-center gap-1 text-slate-400 transition-colors"
              title="Admin CMS Portal"
            >
              <ShieldCheck className="w-3 h-3 text-blue-400" />
              <span>{language === 'en' ? 'Admin CMS' : 'بوابة الإدارة (CMS)'}</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
