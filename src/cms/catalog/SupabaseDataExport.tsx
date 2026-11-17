import { Download, Database } from 'lucide-react';
import { useState } from 'react';
import { hardAdminClient, toHardAdmin } from '../../lib/db/hardAdminClient';

const exportTables = {
  hard_catalog: ['collection','id'],
  hard_sector_catalog: ['collection','id'],
  hard_cms_workspaces: ['entity_type','entity_id'],
  hard_cms_revisions: ['id'],
  hard_blog_categories: ['id'],
  hard_company_content: ['kind', 'id'],
  hard_web_page_sections: ['page_id'],
  hard_form_submissions: ['id'],
  hard_operation_events: ['submission_id'],
  hard_site_branding: ['sector','visibility'],
  hard_sector_sections: ['sector','section_key'],
  hard_navigation: ['id','visibility'],
  hard_redirect_rules: ['id'],
  hard_runtime_config: ['kind','key'],
  hard_media_assets: ['id'],
} as const;

async function readRows(table: keyof typeof exportTables) {
  const size = 200;
  const result: object[] = [];
  for (let start = 0; ; start += size) {
    let query = hardAdminClient.from(table).select('*');
    for (const column of exportTables[table]) query = query.order(column, { ascending: true });
    const { data, error } = await query.range(start,start+size-1);
    if (error) throw error;
    result.push(...(data ?? []));
    if ((data?.length ?? 0) < size) return result;
  }
}

export default function SupabaseDataExport() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [confirmPrivate, setConfirmPrivate] = useState(false);

  async function download() {
    if (!confirmPrivate || busy) return;
    setBusy(true);
    setMessage('');
    try {
      const { data, error } = await hardAdminClient.auth.getUser();
      if (error || !toHardAdmin(data.user)) throw new Error('Administrator access required');
      const tables = Object.keys(exportTables) as (keyof typeof exportTables)[];
      const entries = [];
      for (const table of tables) entries.push([table, await readRows(table)] as const);
      const snapshot = { createdAt: new Date().toISOString(), format: 'hard-data-v1', tables: Object.fromEntries(entries) };
      const blob = new Blob([JSON.stringify(snapshot,null,2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'hard-data-' + snapshot.createdAt.slice(0,10) + '.json';
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setMessage('اكتمل إنشاء ملف تصدير البيانات.');
    } catch {
      setMessage('تعذر إنشاء التصدير. لم يُنزّل ملف جزئي.');
    } finally {
      setBusy(false);
    }
  }

  return <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-7">
    <h2 className="text-lg font-extrabold tracking-tight text-slate-900"><Database className="me-2 inline h-5 w-5 text-blue-600" />تصدير البيانات</h2>
    <p className="max-w-3xl text-sm leading-7 text-slate-500">ينزّل ملف JSON بجداول هارد، بما فيها الطلبات والكتالوج والإعدادات ومسودات المحتوى. يشمل مراجع الملفات فقط.</p>
    <label className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/50 p-4 text-sm leading-relaxed text-slate-700"><input type="checkbox" checked={confirmPrivate} disabled={busy} onChange={(event) => setConfirmPrivate(event.target.checked)} /> سأحفظ النسخة التي تتضمن بيانات العملاء في مكان خاص.</label>
    <button type="button" disabled={busy || !confirmPrivate} onClick={() => void download()} className="rounded-xl bg-blue-600 hover:bg-blue-700 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors disabled:opacity-40 disabled:opacity-40">
      <Download className="me-2 inline h-4 w-4" />{busy ? 'جارٍ إعداد التصدير…' : 'تنزيل البيانات'}
    </button>
    {message && <p role="status">{message}</p>}
  </section>;
}
