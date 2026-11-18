import { LocalizedValue } from '../ui/LocalizedValue';
import { InterfaceText } from '../ui/InterfaceText';
import { ManagedA } from '../ui/ManagedElements';
import React from 'react';
import {
  Building2,
  Home,
  HardHat,
  ThermometerSnowflake,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { Language, PageId } from '../../types';
import {
  HARD_GROUP_SECTORS,
  SectorId,
  getActiveSector,
  SectorDefinition,
} from '../../lib/sectors';
import { handleSemanticClick } from '../../lib/navigation';

interface SectorNavProps {
  currentPage?: PageId;
  currentSector?: SectorId;
  language: Language;
  onNavigate: (page: PageId) => void;
  className?: string;
  variant?: 'dark' | 'light';
}

const ICONS = {
  Building2,
  Home,
  HardHat,
  ThermometerSnowflake,
};

export function SectorNav({
  currentPage,
  currentSector: explicitSector,
  language,
  onNavigate,
  className = '',
  variant = 'dark',
}: SectorNavProps) {
  const isAr = language === 'ar';
  const activeSectorId =
    explicitSector || (currentPage ? getActiveSector(currentPage) : 'portal');

  const isDark = variant === 'dark';

  return (
    <nav
      aria-label={isAr ? 'قطاعات مجموعة هارد' : 'HARD Group Sectors'}
      className={`w-full text-xs transition-colors border-b select-none ${
        isDark
          ? 'bg-slate-950 text-slate-300 border-slate-900/90'
          : 'bg-slate-950 text-slate-200 border-blue-900'
      } ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-9 sm:h-10 gap-2 sm:gap-4">
          {/* Label / Prefix */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden md:inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-blue-100">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
              <span>{isAr ? <InterfaceText id="realestate.SectorNav.kldopoj" source="قطاعات مجموعة هارد" /> : <InterfaceText id="realestate.SectorNav.k1vok2qc" source="HARD Group Sectors" />}</span>
              <span className="text-blue-100">:</span>
            </span>
            <span className="md:hidden inline-flex items-center gap-1 text-[11px] font-bold text-white">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
              <span>{isAr ? <InterfaceText id="realestate.SectorNav.krz8cqg" source="المجموعة" /> : <InterfaceText id="realestate.SectorNav.k9gghjw" source="HARD" />}</span>
            </span>
          </div>

          {/* Sector Links Strip */}
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-1">
            {HARD_GROUP_SECTORS.map((sector: SectorDefinition) => {
              const Icon = ICONS[sector.iconName] || Building2;
              const isCurrent = sector.id === activeSectorId;
              const sectorName = sector.name[language];
              const shortName = sector.shortName[language];

              return (
                <ManagedA copyScope="realestate.SectorNav"
                  key={sector.id}
                  href={sector.href}
                  onClick={(e) =>
                    handleSemanticClick(e, () => {
                      onNavigate(sector.pageId);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    })
                  }
                  aria-current={isCurrent ? 'page' : undefined}
                  title={sectorName}
                  className={`relative shrink-0 inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg text-[11px] sm:text-xs font-semibold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-400 ${
                    isCurrent
                      ? 'bg-sky-200 text-blue-950 shadow-xs font-bold'
                      : 'text-white hover:bg-blue-900'
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 shrink-0 ${
                      isCurrent ? 'text-blue-950' : 'text-sky-100'
                    }`}
                  />
                  {/* Full name on lg+, short name on small */}
                  <span className="hidden sm:inline"><LocalizedValue value={sectorName} /></span>
                  <span className="sm:hidden"><LocalizedValue value={shortName} /></span>

                </ManagedA>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
