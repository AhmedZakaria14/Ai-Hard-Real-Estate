import { WhatsAppIcon } from '../ui/WhatsAppIcon';
import { ManagedButton, ManagedA } from '../ui/ManagedElements';
import { ArrowUp, MessageCircle } from 'lucide-react';
import type { Language } from '../../types';

export function ScrollToTopButton({ language }: { language: Language }) {
  const label = language === 'ar' ? 'العودة إلى أعلى الصفحة' : 'Back to top';
  return <ManagedButton copyScope="realestate.SectorQuickActions" type="button" title={label} aria-label={label}
    onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })}
    className="flex size-12 items-center justify-center rounded-full bg-[#034DA2] text-white shadow-lg hover:bg-blue-800 focus-visible:ring-2 focus-visible:ring-sky-300">
    <ArrowUp className="size-5" aria-hidden="true" />
  </ManagedButton>;
}

export function SectorQuickActions({ language, whatsappHref }: { language: Language; whatsappHref: string }) {
  return <div className="fixed bottom-5 start-4 z-40 flex flex-col items-center gap-2 sm:bottom-6 sm:start-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
    <ScrollToTopButton language={language} />
    <ManagedA copyScope="realestate.SectorQuickActions" href={whatsappHref} target="_blank" rel="noopener noreferrer"
      aria-label={language === 'ar' ? 'تواصل عبر واتساب' : 'Chat on WhatsApp'}
      title={language === 'ar' ? 'تواصل عبر واتساب' : 'Chat on WhatsApp'}
      className="flex size-12 items-center justify-center rounded-full bg-emerald-700 text-white shadow-lg hover:bg-emerald-800 focus-visible:ring-2 focus-visible:ring-emerald-300">
      <WhatsAppIcon className="size-6" aria-hidden="true" />
    </ManagedA>
  </div>;
}
