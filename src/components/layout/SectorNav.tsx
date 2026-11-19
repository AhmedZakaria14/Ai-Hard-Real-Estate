import React from 'react';
import { ArrowLeft, ArrowRight, Home } from 'lucide-react';
import { Language, PageId } from '../../types';
import { SectorId, getActiveSector } from '../../lib/sectors';
import { handleSemanticClick } from '../../lib/navigation';
import { ManagedA, ManagedButton } from '../ui/ManagedElements';

interface SectorNavProps {
  currentPage?: PageId;
  currentSector?: SectorId;
  language: Language;
  onNavigate: (page: PageId) => void;
  className?: string;
  variant?: 'dark' | 'light';
}

export function SectorNav({
  currentPage,
  currentSector: explicitSector,
  language,
  onNavigate,
  className = '',
}: SectorNavProps) {
  const isAr = language === 'ar';
  const activeSectorId = explicitSector || (currentPage ? getActiveSector(currentPage) : 'portal');

  // The group portal is already the destination of the Home action, so it needs no utility strip.
  if (activeSectorId === 'portal') return null;

  const BackIcon = isAr ? ArrowRight : ArrowLeft;

  const goBack = () => {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }
    onNavigate('portal');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav
      aria-label={isAr ? 'التنقل العام' : 'Global navigation'}
      className={`w-full border-b border-slate-200 bg-white/95 text-slate-700 backdrop-blur-md ${className}`}
    >
      <div className="mx-auto flex h-11 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <ManagedButton
          copyScope="realestate.SectorNav"
          type="button"
          onClick={goBack}
          className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
        >
          <BackIcon className="h-4 w-4" />
          <span>{isAr ? 'رجوع' : 'Back'}</span>
        </ManagedButton>

        <ManagedA
          copyScope="realestate.SectorNav"
          href="/"
          onClick={(event) =>
            handleSemanticClick(event, () => {
              onNavigate('portal');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            })
          }
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#034DA2] px-3.5 py-1.5 text-xs font-bold text-white transition-colors hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
          aria-label={isAr ? 'الرئيسية - بوابة قطاعات هارد' : 'Home - HARD sectors portal'}
        >
          <Home className="h-4 w-4" />
          <span>{isAr ? 'الرئيسية' : 'Home'}</span>
        </ManagedA>
      </div>
    </nav>
  );
}
