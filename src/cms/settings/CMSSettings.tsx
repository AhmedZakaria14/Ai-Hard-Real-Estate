import type { Language } from '../../types';
import { CMSAdminManagement } from './CMSAdminManagement';
import { CMSBrandingSettings } from './CMSBrandingSettings';
import { CMSProductionMonitoring } from './CMSProductionMonitoring';

interface CMSSettingsProps {
  language: Language;
  onExportData: () => void;
  onResetToDefaults: () => Promise<void>;
  currentAdminUser?: { role: string };
}

export function CMSSettings({ language, onExportData, onResetToDefaults, currentAdminUser }: CMSSettingsProps) {
  const ar = language === 'ar';
  return <div className="max-w-5xl space-y-6">
    <CMSBrandingSettings language={language} currentAdminRole={currentAdminUser?.role} />
    {currentAdminUser?.role === 'superadmin' && <CMSAdminManagement language={language} />}
    <section className="space-y-3 rounded-xl border bg-white p-5">
      <h2 className="font-bold">{ar ? 'قاعدة البيانات السحابية' : 'Cloud database'}</h2>
      <button type="button" onClick={onExportData} className="inline-block rounded border px-3 py-2 text-blue-800">
        {ar ? 'تصدير بيانات هارد' : 'Export HARD data'}
      </button>
      <button type="button" className="block rounded border px-3 py-2" onClick={async () => {
        if (!window.confirm(ar ? 'استبدال السجلات الحالية بالمحتوى الافتراضي؟' : 'Replace current records with defaults?')) return;
        try {
          await onResetToDefaults();
          window.alert(ar ? 'اكتملت إعادة الضبط.' : 'Reset complete.');
        } catch {
          window.alert(ar ? 'تعذر إكمال إعادة الضبط.' : 'Could not complete reset.');
        }
      }}>{ar ? 'إعادة ضبط البيانات الافتراضية' : 'Restore default data'}</button>
    </section>
    <details className="rounded-xl border border-slate-200 bg-white p-5 text-sm">
      <summary className="cursor-pointer font-bold text-slate-900">
        {ar ? 'خريطة قاعدة البيانات ومصادر بيانات الموقع' : 'Database map and website data sources'}
      </summary>
      <p className="mt-3 leading-6 text-slate-600">
        {ar
          ? 'هذه هي مصادر الحقيقة المستخدمة حاليًا في الموقع. الجداول القديمة الموضحة في النهاية متروكة للتوافق/الترحيل وليست المصدر الذي ينبغي تعديله يدويًا.'
          : 'These are the current sources of truth used by the website. Legacy tables listed at the end are retained for compatibility/migration and should not be edited as the live source.'}
      </p>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0 text-xs sm:text-sm">
          <thead>
            <tr className="bg-slate-50 text-slate-700">
              <th className="border-b p-2 text-start">{ar ? 'الجدول' : 'Table'}</th>
              <th className="border-b p-2 text-start">{ar ? 'المحتوى المرتبط' : 'Connected content'}</th>
            </tr>
          </thead>
          <tbody className="[&_td]:border-b [&_td]:border-slate-100 [&_td]:p-2 [&_code]:text-blue-800">
            <tr><td><code>hard_catalog</code></td><td>{ar ? 'العقارات، المشاريع العقارية، المقالات المنشورة/المسودات.' : 'Properties, real-estate projects, and blog articles.'}</td></tr>
            <tr><td><code>hard_sector_catalog</code></td><td>{ar ? 'مشاريع المقاولات وخدمات التكييف والكتالوجات الخاصة بالقطاعات.' : 'Construction projects, HVAC services, and sector catalogs.'}</td></tr>
            <tr><td><code>hard_sector_sections</code></td><td>{ar ? 'الهيرو والخدمات والمدن والمعرض والآراء ودليل الصيانة ومحتوى القطاعات المنظم.' : 'Hero, services, cities, gallery, reviews, maintenance guide, and structured sector content.'}</td></tr>
            <tr><td><code>hard_company_content</code></td><td>{ar ? 'الفريق والفروع والمؤشرات والشركاء والأسئلة والشهادات وقصص العملاء داخل الإدارة.' : 'Admin-managed team, offices, statistics, partners, FAQs, certifications, and stories.'}</td></tr>
            <tr><td><code>hard_company_public_content</code></td><td>{ar ? 'النسخة العامة المنشورة والآمنة من المحتوى المؤسسي.' : 'Published safe projection of company content.'}</td></tr>
            <tr><td><code>hard_form_submissions</code></td><td>{ar ? 'كل طلبات واستفسارات العملاء والمواعيد والاشتراكات المرسلة من الموقع.' : 'Customer requests, inquiries, appointments, and form submissions.'}</td></tr>
            <tr><td><code>hard_public_form_templates</code></td><td>{ar ? 'تعريفات وحقول نماذج الخدمة المنشورة.' : 'Published service-form schemas and fields.'}</td></tr>
            <tr><td><code>hard_media_assets</code></td><td>{ar ? 'سجل مكتبة الصور والوسائط المرفوعة.' : 'Uploaded media-library metadata.'}</td></tr>
            <tr><td><code>hard_navigation</code></td><td>{ar ? 'قوائم الهيدر والفوتر المُدارة من لوحة التحكم.' : 'Managed header/footer navigation.'}</td></tr>
            <tr><td><code>hard_blog_categories</code></td><td>{ar ? 'تصنيفات المدونة بالعربية والإنجليزية.' : 'Arabic/English blog categories.'}</td></tr>
            <tr><td><code>hard_site_branding</code></td><td>{ar ? 'الهوية والشعارات وبيانات التواصل والألوان والإعدادات المنشورة/المسودة.' : 'Branding, logos, contact data, theme tokens, draft/published settings.'}</td></tr>
            <tr><td><code>hard_runtime_config</code></td><td>{ar ? 'إعدادات التشغيل مثل معاملات الحاسبات المنشورة.' : 'Runtime settings such as published calculator coefficients.'}</td></tr>
            <tr><td><code>hard_web_page_sections</code></td><td>{ar ? 'أقسام الصفحات الإضافية والمسودات المنشورة.' : 'Managed additional page sections and drafts.'}</td></tr>
            <tr><td><code>hard_cms_revisions / hard_cms_workspaces</code></td><td>{ar ? 'سجل المراجعات ومساحات عمل المسودات داخل CMS.' : 'CMS revision history and draft workspaces.'}</td></tr>
          </tbody>
        </table>
      </div>
      <p className="mt-4 rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-900">
        {ar
          ? 'تنبيه: الجداول القديمة properties / projects / leads / subscribers / testimonials / blog_posts ليست مصدر الحقيقة الحالي للواجهات الجديدة، فلا تعتمد عليها لتعديل البيانات الحية.'
          : 'Note: legacy properties / projects / leads / subscribers / testimonials / blog_posts tables are not the source of truth for the current interfaces; do not use them to edit live data.'}
      </p>
    </details>
    <CMSProductionMonitoring language={language} />
  </div>;
}
