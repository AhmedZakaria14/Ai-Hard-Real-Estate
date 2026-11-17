import { downloadCsv } from '../../lib/csv';
import SupabaseDataExport from '../catalog/SupabaseDataExport';
import SupabaseOperations from './SupabaseOperations';
import { CMSCalculatorConfig } from '../calculators/CMSCalculatorConfig';
import SupabaseSectorSections from '../catalog/SupabaseSectorSections';
import { useEffect, useState } from 'react';
import type { Language } from '../../types';

import { CMSMediaLibrary } from '../components/CMSMediaLibrary';
import SupabaseArticleEditor from '../catalog/SupabaseArticleEditor';
import { hardAdminClient as client } from '../../lib/db/hardAdminClient';

const pageSize = 25;
const statusLabels = { new: 'جديد', contacted: 'تم التواصل', closed: 'مغلق' };

type PrivateAttachment = { id: string; backend: 'supabase'; fileName: string; storagePath: string };
function attachmentsFor(payload: Record<string, unknown>): PrivateAttachment[] {
  if (!Array.isArray(payload.attachments)) return [];
  return payload.attachments.filter((item): item is PrivateAttachment =>
    item?.backend === 'supabase' && typeof item.id === 'string' &&
    typeof item.fileName === 'string' && item.storagePath === 'submissions/' + item.id
  );
}

type Submission = {
  id: string;
  tracking_code: string;
  sector: string;
  form_type: string;
  received_at: string;
  archived_at: string | null;
  status: keyof typeof statusLabels;
  status_history: { at: string; from: keyof typeof statusLabels; to: keyof typeof statusLabels }[];
  payload: Record<string, unknown>;
};

const sections = {
  requests: 'الطلبات',
  appointments: 'المواعيد والمعاينات',
  articles: 'المقالات المنشورة',
  projects: 'المشاريع العقارية',
  properties: 'العقارات',
  construction_projects: 'مشاريع الإنشاءات',
  hvac_services: 'خدمات التكييف',
  media: 'مكتبة الوسائط',
  calculators: 'حاسبات التكلفة والتقديرات',
  sector_sections: 'محتوى القطاعات',
  archive: 'أرشيف الطلبات',
  reports: 'التقارير',
  notifications: 'الإشعارات',
  backup: 'تصدير البيانات',
} as const;

export type OperationsSection = keyof typeof sections;

export function readOperationsSection(value: string | null): OperationsSection | null {
  return value && Object.hasOwn(sections, value) ? value as OperationsSection : null;
}

export default function OperationsWorkspace({ initialSection, adminEmail, language }: {
  initialSection: OperationsSection;
  adminEmail: string;
  language: Language;
}) {
  const [busy, setBusy] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');
  const [rows, setRows] = useState<Submission[]>([]);
  const [view, setView] = useState(initialSection);
  const [page, setPage] = useState(0);
  const [refresh, setRefresh] = useState(0);
  const isAppointments = view === 'appointments';
  const isArchive = view === 'archive';
  const isIntake = view === 'requests' || isAppointments || isArchive;
  function intakeQuery() {
    const query = client.from('hard_form_submissions')
      .select('id,tracking_code,sector,form_type,received_at,payload,status,status_history,archived_at')
      .neq('form_type', 'newsletter_signup');
    if (isArchive) query.not('archived_at', 'is', null);
    else query.is('archived_at', null);
    if (isAppointments) query.or('form_type.eq.book_viewing,and(form_type.eq.hvac_service,payload->details->>date.not.is.null)');
    return query.order('received_at', { ascending: false }).order('id');
  }

  useEffect(() => {
    if (!isIntake) {
      setBusy(false);
      setRows([]);
      return;
    }
    const controller = new AbortController();
    setBusy(true);
    setError('');
    setRows([]);
    const load = async () => {
      try {
        const { data, error: queryError } = await intakeQuery()
          .range(page * pageSize, (page + 1) * pageSize - 1)
          .abortSignal(controller.signal);
        if (controller.signal.aborted) return;
        if (queryError) throw queryError;
        setRows(data ?? []);
      } catch {
        if (!controller.signal.aborted) setError('تعذر تحميل الطلبات. حاول مرة أخرى.');
      } finally {
        if (!controller.signal.aborted) setBusy(false);
      }
    };
    void load();
    return () => controller.abort();
  }, [isAppointments, isArchive, isIntake, page, refresh]);

  async function exportRequests() {
    if (exporting || !isIntake) return;
    setError('');
    setExporting(true);
    try {
      const { data: identity, error: authError } = await client.auth.getUser();
      if (authError || identity.user?.app_metadata.hard_role !== 'superadmin') throw new Error('Administrator required');
      const entries: Submission[] = [];
      const limit = 100;
      for (let offset = 0; ; offset += limit) {
        const { data, error: readError } = await intakeQuery().range(offset, offset + limit - 1);
        if (readError) throw readError;
        entries.push(...(data ?? []));
        if ((data?.length ?? 0) < limit) break;
      }
      if (!entries.length) {
        setError('لا توجد طلبات في هذا القسم للتصدير.');
        return;
      }
      const headers = ['Tracking Code', 'Sector', 'Form', 'Received At', 'Status', 'Name', 'Email', 'Phone', 'Message'];
      downloadCsv('HARD_Requests_' + new Date().toISOString().slice(0, 10) + '.csv', [headers,
        ...entries.map((row) => [row.tracking_code, row.sector, row.form_type, row.received_at, row.status,
          row.payload.name ?? '', row.payload.email ?? '', row.payload.phone ?? '', row.payload.message ?? ''])]);
    } catch {
      setError('تعذّر تصدير الطلبات. حاول مرة أخرى.');
    } finally {
      setExporting(false);
    }
  }

  async function downloadAttachment(attachment: PrivateAttachment) {
    setError('');
    const safeName = attachment.fileName.replace(/[\/:*?"<>|]/g, '_');
    const { data, error: fileError } = await client.storage.from('hard-form-attachments')
      .download(attachment.storagePath);
    if (fileError || !data) {
      setError('تعذر فتح المرفق الخاص.');
      return;
    }
    const url = URL.createObjectURL(data);
    const link = document.createElement('a');
    link.href = url;
    link.download = safeName;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
  }

  async function archiveRequest(id: string, archive: boolean) {
    setBusy(true);
    setError('');
    try {
      const { error: archiveError } = await client.from('hard_form_submissions')
        .update({ archived_at: archive ? new Date().toISOString() : null })
        .eq('id', id).select('id').single();
      if (archiveError) throw archiveError;
      setRefresh((value) => value + 1);
    } catch {
      setError('تعذر تغيير حالة الأرشفة.');
    } finally {
      setBusy(false);
    }
  }

  async function updateStatus(id: string, status: Submission['status']) {
    setBusy(true);
    setError('');
    try {
      const { data, error: updateError } = await client.from('hard_form_submissions')
        .update({ status }).eq('id', id).select('id,status,status_history').single();
      if (updateError) throw updateError;
      setRows((current) => current.map((row) => row.id === id ? { ...row, ...data } : row));
    } catch {
      setError('تعذر حفظ حالة الطلب.');
    } finally {
      setBusy(false);
    }
  }

  return <section dir="rtl" className="space-y-5 text-slate-900">
    {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-red-700">{error}</p>}
    <nav aria-label="أقسام العمليات" className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-xs">
      {(Object.keys(sections) as OperationsSection[]).map((section) => (
        <button
          key={section}
          type="button"
          aria-pressed={view === section}
          onClick={() => {
            setPage(0);
            setError('');
            setView(section);
          }}
          className={`rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${view === section ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-100'}`}
        >
          {sections[section]}
        </button>
      ))}
    </nav>
    {(isIntake || view === 'reports' || view === 'notifications') && (
      <button type="button" onClick={() => setRefresh((value) => value + 1)} disabled={busy}
        className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold">تحديث</button>
    )}
      {view === 'backup' ? <SupabaseDataExport /> : view === 'reports' || view === 'notifications' ? <SupabaseOperations key={view} section={view} refresh={refresh} /> : view === 'calculators' ? <CMSCalculatorConfig language={language} adminEmail={adminEmail} /> : view === 'sector_sections' ? <SupabaseSectorSections /> : view === 'media' ? <CMSMediaLibrary language={language} /> : view !== 'requests' && view !== 'appointments' && view !== 'archive' ? <SupabaseArticleEditor key={view} client={client} collection={view === 'articles' ? 'blog_posts' : view} /> : <>
      {isAppointments && <details className="rounded-lg border p-4 text-sm">
        <summary className="cursor-pointer font-semibold">طريقة اختبار حجز المعاينة</summary>
        <ol className="mt-2 list-decimal space-y-2 ps-5">
          <li>افتح صفحة عقار منشور واختر حجز معاينة.</li>
          <li>أكمل النموذج ببيانات اختبار، وحدد الموعد وأرسل الطلب. انسخ رقم المتابعة.</li>
          <li>افتح المواعيد والمعاينات في لوحة الإدارة واضغط تحديث. طابق رقم المتابعة مع الطلب الجديد.</li>
          <li>أرشف الطلب التجريبي بعد المراجعة.</li>
        </ol>
      </details>}
      <button type="button" disabled={busy || exporting} onClick={() => void exportRequests()} className="rounded border px-3 py-1">
        {exporting ? 'جارٍ إعداد ملف الطلبات…' : 'تصدير الطلبات CSV'}
      </button>
      {busy ? <p role="status">جارٍ تحميل الطلبات…</p> : !error && rows.length === 0 && <p>لا توجد طلبات في هذه الصفحة.</p>}
      {rows.map((row) => <article key={row.id} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <h2 className="font-bold">{String(row.payload.name || row.tracking_code)}</h2>
        <p><bdi>{row.tracking_code} · {row.sector} · {row.form_type}</bdi></p>
        <p><bdi>{new Date(row.received_at).toLocaleString('ar-SA')} · {String(row.payload.email || '')} · {String(row.payload.phone || '')}</bdi></p>
        {typeof row.payload.message === 'string' && <p className="whitespace-pre-wrap">{row.payload.message}</p>}
        {attachmentsFor(row.payload).map((attachment) => (
          <button key={attachment.id} type="button" className="block text-blue-700 underline"
            onClick={() => void downloadAttachment(attachment)}>تنزيل {attachment.fileName}</button>
        ))}
        <label className="block">الحالة{' '}
          <select value={row.status} disabled={busy} onChange={(event) => void updateStatus(row.id, event.target.value as Submission['status'])} className="rounded border p-1">
            {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <button type="button" disabled={busy} className="block text-blue-700 underline"
          onClick={() => void archiveRequest(row.id, !isArchive)}>{isArchive ? 'استعادة إلى الطلبات' : 'نقل إلى الأرشيف'}</button>
        {row.status_history.length > 0 && <details>
          <summary>سجل تغييرات الحالة</summary>
          <ul>{row.status_history.map((change, index) => <li key={index}>{new Date(change.at).toLocaleString('ar-SA')} · {statusLabels[change.from]} ← {statusLabels[change.to]}</li>)}</ul>
        </details>}
      </article>)}
      <nav aria-label="صفحات الطلبات" className="flex gap-3">
        <button disabled={busy || page === 0} onClick={() => setPage((value) => value - 1)} className="rounded border px-3 py-1 disabled:opacity-40">السابق</button>
        <button disabled={busy || rows.length < pageSize} onClick={() => setPage((value) => value + 1)} className="rounded border px-3 py-1 disabled:opacity-40">التالي</button>
      </nav>
      </>}
  </section>;
}
