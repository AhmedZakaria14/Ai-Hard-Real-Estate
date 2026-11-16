import { useEffect, useState } from 'react';
import { Globe, Menu, MessageSquare, Phone, PlusCircle, X } from 'lucide-react';
import type { Language, PageId } from '../../types';
import { useTextOverride } from '../../context/TextOverrideContext';
import { Button } from '../ui/Button';
import { BrandLogo } from '../ui/BrandLogo';
import { getPageHref, handleSemanticClick, realEstateNavigationPages } from '../../lib/navigation';
import { subscribeNavigationDoc, type NavItem } from '../../lib/cmsNavigationManager';

interface NavbarProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onOpenListPropertyModal: () => void;
}

function pathOnly(href: string) {
  return href.split(/[?#]/, 1)[0].replace(/\/+$/, '');
}

export function Navbar({ currentPage, onNavigate, language, onLanguageChange, onOpenListPropertyModal }: NavbarProps) {
  const { translations } = useTextOverride();
  const nav = translations[language].nav;
  const ar = language === 'ar';
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cmsItems, setCmsItems] = useState<NavItem[]>([]);

  useEffect(() => subscribeNavigationDoc('header_realestate', (doc) => setCmsItems(doc?.items ?? [])), []);

  function changePage(page: PageId) {
    setMobileOpen(false);
    onNavigate(page);
  }

  function openPropertyModal() {
    setMobileOpen(false);
    onOpenListPropertyModal();
  }

  const links = realEstateNavigationPages.map((page) => {
    const href = getPageHref(page);
    const item = cmsItems.find((row) => row.isVisible && row.type !== 'external' && pathOnly(row.targetPath) === pathOnly(href));
    const active = currentPage === page || (page === 'properties' && currentPage === 'property-details');
    return { page, href, label: item?.label[language]?.trim() || nav[page], active };
  });

  function renderLinks() {
    return links.map(({ page, href, label, active }) => <a key={page} href={href}
      onClick={(event) => handleSemanticClick(event, () => changePage(page))}
      aria-current={active ? 'page' : undefined}
      className={`relative w-fit whitespace-nowrap px-2 py-2 text-sm hover:text-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500 ${active ? 'font-bold text-blue-700 after:absolute after:inset-x-2 after:bottom-1 after:h-0.5 after:rounded-full after:bg-blue-700' : 'font-medium text-slate-700'}`}>
      {label}
    </a>);
  }

  const languageButton = <button type="button" onClick={() => onLanguageChange(ar ? 'en' : 'ar')}
    className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 px-2.5 text-xs font-semibold text-slate-700 hover:text-blue-700"
    aria-label={ar ? 'التحويل إلى الإنجليزية' : 'Switch to Arabic'}>
    <Globe className="hidden h-3.5 w-3.5 sm:block" aria-hidden="true" />
    {ar ? 'EN' : 'العربية'}
  </button>;

  function propertyButton() {
    return <Button type="button" onClick={openPropertyModal} className="h-10 min-w-40 shrink-0 whitespace-nowrap px-3 text-xs font-semibold">
      <PlusCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
      {nav.listProperty}
    </Button>;
  }

  return <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white shadow-sm">
    <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-3 sm:gap-3 sm:px-6">
      <a href="/realestate" onClick={(event) => handleSemanticClick(event, () => changePage('home'))}
        className="group min-w-0 shrink" aria-label={ar ? 'الرئيسية - هارد للعقارات' : 'HARD Real Estate Home'}>
        <BrandLogo size="md" language={language} variant="dark" compactTagline />
      </a>
      <nav className="hidden shrink-0 items-center xl:flex" aria-label={ar ? 'القائمة الرئيسية' : 'Main navigation'}>
        {renderLinks()}
      </nav>
      <div className="flex shrink-0 items-center gap-2">
        {languageButton}
        <div className="hidden sm:block">{propertyButton()}</div>
        <button type="button" onClick={() => setMobileOpen(!mobileOpen)} aria-expanded={mobileOpen} aria-controls="realestate-mobile-menu"
          aria-label={ar ? 'فتح أو إغلاق القائمة' : 'Toggle navigation menu'}
          className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 xl:hidden">
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
    </div>
    {mobileOpen && <div id="realestate-mobile-menu" className="max-h-[80vh] space-y-3 overflow-auto border-t border-slate-200 bg-white px-4 py-4 xl:hidden">
      <nav className="flex flex-col" aria-label={ar ? 'القائمة الرئيسية' : 'Main navigation'}>{renderLinks()}</nav>
      <div className="sm:hidden">{propertyButton()}</div>
      <div className="flex flex-wrap gap-2 text-xs font-semibold">
        <a href="tel:+966556125711" className="flex items-center gap-2 rounded-xl border border-slate-200 p-2.5"><Phone className="h-3.5 w-3.5 text-blue-600" />{nav.callUs}</a>
        <a href="https://wa.me/966556125711" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-2.5 text-emerald-800"><MessageSquare className="h-3.5 w-3.5" />{nav.whatsapp}</a>
      </div>
    </div>}
  </header>;
}
