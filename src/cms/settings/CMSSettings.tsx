import type { Language } from '../../types';
import { CMSAdminManagement } from './CMSAdminManagement';
import { CMSBrandingSettings } from './CMSBrandingSettings';
import { CMSProductionMonitoring } from './CMSProductionMonitoring';
import { hardSupabaseUrl } from '../../lib/db/hardCatalog';

interface CMSSettingsProps {
  language: Language;
  onResetToDefaults: () => Promise<void>;
  currentAdminUser?: { role: string };
}

export function CMSSettings({ language, onResetToDefaults, currentAdminUser }: CMSSettingsProps) {
  const ar = language === 'ar';
  return <div className="max-w-5xl space-y-6">
    <CMSBrandingSettings language={language} currentAdminRole={currentAdminUser?.role} />
    {currentAdminUser?.role === 'superadmin' && <CMSAdminManagement language={language} />}
    <section className="space-y-3 rounded-xl border bg-white p-5">
      <h2 className="font-bold">{ar ? 'قاعدة البيانات السحابية' : 'Cloud database'}</h2>
      <p dir="ltr">Supabase · {new URL(hardSupabaseUrl).hostname}</p>
      <a href="/admin/supabase-inbox?section=backup" className="inline-block rounded border px-3 py-2 text-blue-800">
        {ar ? 'تصدير بيانات هارد' : 'Export HARD data'}
      </a>
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
    <CMSProductionMonitoring language={language} />
  </div>;
}
