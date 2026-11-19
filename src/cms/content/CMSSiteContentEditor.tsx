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

  const help = {
    sectors: ar
      ? 'هنا تتحكم في المحتوى المنظم لكل قطاع مثل الهيرو، الخدمات، المدن، المعرض، الأسئلة والمحتوى القابل للإدارة. احفظ التغييرات ثم راجع الصفحة العامة المرتبطة بالقسم.'
      : 'Manage structured sector content such as hero copy, services, cities, galleries, FAQs, and other managed content. Save changes, then review the linked public page.',
    text: ar
      ? 'هذا المحرر مخصص للنصوص الظاهرة في الواجهة نفسها. استخدمه لتعديل العناوين والعبارات الثابتة دون تغيير بنية الصفحة أو الكود.'
      : 'Use this editor for visible interface copy such as headings and fixed labels without changing page structure or code.',
    pages: ar
      ? 'أقسام الصفحات والمسودات تتيح تجهيز أقسام إضافية أو محتوى مسودة قبل نشره. المسودة لا تظهر للزائر حتى يتم نشرها، ويمكن معاينتها ومراجعتها قبل اعتمادها.'
      : 'Page sections and drafts let you prepare additional page content before publishing. Drafts stay hidden from visitors until published and can be previewed first.',
    navigation: ar
      ? 'من هنا تتحكم في روابط الهيدر والفوتر: التسمية، الترتيب، الإظهار والإخفاء، والروابط الداخلية أو الخارجية. بعد الحفظ تنعكس القائمة المنشورة على الموقع.'
      : 'Control header and footer links here: labels, order, visibility, and internal or external destinations. Published navigation is reflected on the public site.',
    seo: ar
      ? 'هذا القسم خاص بعناوين ووصف السيو والنصوص القانونية العامة. راجع أي بيانات نظامية قبل النشر ولا تُدخل أرقامًا غير مؤكدة.'
      : 'Manage SEO titles/descriptions and public legal copy here. Verify regulatory details before publishing and avoid unconfirmed identifiers.',
  } as const;

  return <div dir={ar ? 'rtl' : 'ltr'} className="space-y-6">
    <nav className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-xs" aria-label={ar ? 'أقسام إدارة المحتوى' : 'Content management'}>
      {tabs.map((tab) => <button key={tab.id} type="button" aria-pressed={active === tab.id} onClick={() => setActive(tab.id)}
        className="rounded-xl px-4 py-2.5 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-50 aria-pressed:bg-blue-600 aria-pressed:text-white aria-pressed:shadow-sm">{tab[language]}</button>)}
    </nav>
    <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm leading-6 text-slate-700">
      <strong className="mb-1 block text-blue-900">{ar ? 'ما وظيفة هذا القسم؟' : 'What does this section do?'}</strong>
      <p>{help[active as keyof typeof help]}</p>
    </div>
    {active === 'sectors' && <SupabaseSectorSections />}
    {active === 'text' && <CMSSiteText language={language} />}
    {active === 'pages' && <CMSPageSectionEditor language={language} />}
    {active === 'navigation' && <CMSNavigationManager language={language} />}
    {active === 'seo' && <CMSSeoLegalEditor language={language} />}
  </div>;
}
