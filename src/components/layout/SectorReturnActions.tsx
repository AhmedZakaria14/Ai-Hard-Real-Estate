import { ArrowLeft, ArrowRight, Home } from 'lucide-react';
import type { Language } from '../../types';

export function SectorReturnActions({ language }: { language: Language }) {
  const ar = language === 'ar';
  const BackIcon = ar ? ArrowRight : ArrowLeft;

  function goBack() {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }
    window.location.assign('/');
  }

  return <nav aria-label={ar ? 'الرجوع وبوابة القطاعات' : 'Back and sectors portal'}
    className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-2 sm:px-6 lg:px-8">
    <button type="button" onClick={goBack}
      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-blue-700">
      <BackIcon className="h-3.5 w-3.5" aria-hidden="true" />
      {ar ? 'رجوع' : 'Back'}
    </button>
    <a href="/" className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-100">
      <Home className="h-3.5 w-3.5" aria-hidden="true" />
      {ar ? 'بوابة القطاعات' : 'Sectors portal'}
    </a>
  </nav>;
}
