import React, { useState, useEffect } from 'react';
import {
  Menu,
  X,
  Globe,
  Phone,
  MessageSquare,
  PlusCircle,
  Building,
  Home,
  Layers,
  Megaphone,
  Info,
  BookOpen,
  Mail,
  ChevronDown,
} from 'lucide-react';
import { Language, PageId } from '../../types';
import { translations as defaultTranslations } from '../../lib/translations';
import { useTextOverride } from '../../context/TextOverrideContext';
import { Button } from '../ui/Button';
import { BrandLogo } from '../ui/BrandLogo';

interface NavbarProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onOpenListPropertyModal: () => void;
}

export function Navbar({
  currentPage,
  onNavigate,
  language,
  onLanguageChange,
  onOpenListPropertyModal,
}: NavbarProps) {
  const { translations } = useTextOverride();
  const t = translations[language] || defaultTranslations[language];
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems: { id: PageId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'home', label: t.nav.home, icon: Home },
    { id: 'about', label: t.nav.about, icon: Info },
    { id: 'properties', label: t.nav.properties, icon: Building },
    { id: 'projects', label: t.nav.projects, icon: Layers },
    { id: 'marketing', label: t.nav.marketing, icon: Megaphone },
    { id: 'blog', label: t.nav.blog, icon: BookOpen },
    { id: 'contact', label: t.nav.contact, icon: Mail },
  ];

  const handleNavClick = (pageId: PageId) => {
    onNavigate(pageId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleLanguage = () => {
    const nextLang = language === 'en' ? 'ar' : 'en';
    onLanguageChange(nextLang);
  };

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200/80 py-3'
          : 'bg-white border-b border-slate-100 py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          {/* Official HARD Brand Logo (Left) */}
          <div
            onClick={() => handleNavClick('home')}
            className="cursor-pointer group shrink-0"
            role="button"
            tabIndex={0}
            aria-label="HARD Real Estate Home"
          >
            <BrandLogo size="md" language={language} variant="dark" />
          </div>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center space-x-1 rtl:space-x-reverse">
            {navItems.map((item) => {
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'text-blue-700 bg-blue-50/80 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Actions: Language Switcher, CTA Button */}
          <div className="hidden sm:flex items-center gap-2.5">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl text-slate-700 hover:text-blue-700 hover:bg-slate-100/80 border border-slate-200 transition-colors cursor-pointer"
              title={language === 'en' ? 'Switch to Arabic' : 'التحويل للإنجليزية'}
            >
              <Globe className="w-3.5 h-3.5 text-blue-600" />
              <span>{language === 'en' ? 'العربية' : 'English'}</span>
            </button>

            {/* Primary CTA: List Your Property */}
            <Button
              variant="primary"
              size="sm"
              onClick={onOpenListPropertyModal}
              className="font-semibold shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t.nav.listProperty}</span>
            </Button>
          </div>

          {/* Mobile Right Bar: Lang toggle + Burger Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={toggleLanguage}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-lg text-slate-700 border border-slate-200"
            >
              {language === 'en' ? 'عربي' : 'EN'}
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-2 shadow-xl">
          <nav className="flex flex-col space-y-1">
            {/* Link to Group Portal */}
            <button
              type="button"
              onClick={() => {
                onNavigate('portal');
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold bg-slate-900 text-white mb-2"
            >
              <Building className="w-4 h-4 text-blue-400" />
              <span>{language === 'en' ? 'HARD Group Corporate Portal' : 'بوابة مجموعة هارد الرئيسية'}</span>
            </button>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors text-start ${
                    isActive
                      ? 'text-blue-700 bg-blue-50 font-semibold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4 text-slate-500" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <Button
              variant="primary"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenListPropertyModal();
              }}
              className="w-full justify-center"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t.nav.listProperty}</span>
            </Button>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <a
                href="tel:+966138004273"
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Phone className="w-3.5 h-3.5 text-blue-600" />
                <span>{t.nav.callUs}</span>
              </a>
              <a
                href="https://wa.me/966556125711"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t.nav.whatsapp}</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
