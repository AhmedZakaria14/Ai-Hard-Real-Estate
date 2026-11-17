import { useState } from 'react';
import type { Language } from '../../types';
import SupabaseSectorSections from '../catalog/SupabaseSectorSections';
import { CMSNavigationManager } from './CMSNavigationManager';
import { CMSPageSectionEditor } from './CMSPageSectionEditor';
import { CMSSeoLegalEditor } from '../seo/CMSSeoLegalEditor';
import { CMSSiteText } from './CMSSiteText';

export function CMSSiteContentEditor({ language }: { language: Language }) {
  const [active, setActive] = useState('sectors');
  const ar = language === 'ar';
  const tabs = [
    { id: 'sectors', ar: 'نصوص وصور القطاعات', en: 'Sector copy and images' },
    { id: 'text', ar: 'محرر نصوص الواجهة', en: 'Interface copy editor' },
    { id: 'pages', ar: 'أقسام الصفحات والمسودات', en: 'Page sections and drafts' },
    { id: 'navigation', ar: 'القوائم', en: 'Navigation' },
    { id: 'seo', ar: 'السيو والنصوص القانونية', en: 'SEO and legal' },
  ];
  return <div dir={ar ? 'rtl' : 'ltr'} className="space-y-6">
    <nav className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-xs" aria-label={ar ? 'أقسام إدارة المحتوى' : 'Content management'}>
      {tabs.map((tab) => <button key={tab.id} type="button" aria-pressed={active === tab.id} onClick={() => setActive(tab.id)}
        className="rounded-xl px-4 py-2.5 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-50 aria-pressed:bg-blue-600 aria-pressed:text-white aria-pressed:shadow-sm">{tab[language]}</button>)}
    </nav>
    {active === 'sectors' && <SupabaseSectorSections />}
    {active === 'text' && <CMSSiteText language={language} />}
    {active === 'pages' && <CMSPageSectionEditor language={language} />}
    {active === 'navigation' && <CMSNavigationManager language={language} />}
    {active === 'seo' && <CMSSeoLegalEditor language={language} />}
  </div>;
}
