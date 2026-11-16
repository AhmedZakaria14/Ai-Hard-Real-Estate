import SupabaseSectorSections from '../catalog/SupabaseSectorSections';
import { useEffect, useState, type FormEvent } from 'react';
import { type Session } from '@supabase/supabase-js';

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
  status: keyof typeof statusLabels;
  status_history: { at: string; from: keyof typeof statusLabels; to: keyof typeof statusLabels }[];
  payload: Record<string, unknown>;
};

export default function SupabaseInbox() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [rows, setRows] = useState<Submission[]>([]);
  const [view, setView] = useState<'requests' | 'appointments' | 'articles' | 'projects' | 'properties' | 'construction_projects' | 'hvac_services' | 'media' | 'sector_sections'>('requests');
  const [page, setPage] = useState(0);
  const [refresh, setRefresh] = useState(0);
  const isAppointments = view === 'appointments';
  const isIntake = view === 'requests' || isAppointments;
  const isAdmin = session?.user.app_metadata.hard_role === 'superadmin';

  useEffect(() => {
    const { data: { subscription } } = client.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!isAdmin || !isIntake) {
      setRows([]);
      return;
    }
    const controller = new AbortController();
    setBusy(true);
    setError('');
    setRows([]);
    const load = async () => {
      try {
        const query = client.from('hard_form_submissions')
          .select('id,tracking_code,sector,form_type,received_at,payload,status,status_history');
        if (isAppointments) query.or('form_type.eq.book_viewing,and(form_type.eq.hvac_service,payload->details->>date.not.is.null)');
        const { data, error: queryError } = await query
          .order('received_at', { ascending: false }).order('id')
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
  }, [isAdmin, isAppointments, isIntake, page, refresh]);

  async function downloadAttachment(attachment: PrivateAttachment) {
    setError('');
    const safeName = attachment.fileName.replace(/[\/:*?"<>|]/g, '_');
    const { data, error: fileError } = await client.storage.from('hard-form-attachments')
      .createSignedUrl(attachment.storagePath, 60, { download: safeName });
    if (fileError || !data) {
      setError('تعذر فتح المرفق الخاص.');
      return;
    }
    const link = document.createElement('a');
    link.href = data.signedUrl;
    link.rel = 'noreferrer';
    link.click();
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

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    setBusy(true);
    setError('');
    try {
      const { data, error: signInError } = await client.auth.signInWithPassword({
        email: String(fields.get('email')).trim(),
        password: String(fields.get('password')),
      });
      if (signInError) throw signInError;
      if (data.user.app_metadata.hard_role !== 'superadmin') {
        await client.auth.signOut({ scope: 'local' });
        setError('هذا الحساب لا يملك صلاحية قراءة الطلبات.');
      }
    } catch {
      setError('تعذر تسجيل الدخول. تحقق من البريد وكلمة المرور.');
    } finally {
      setBusy(false);
    }
  }

  return <main dir="rtl" className="mx-auto min-h-screen max-w-5xl space-y-6 p-6 text-slate-900">
    <h1 className="text-3xl font-bold">إدارة هارد</h1>
    {error && <p role="alert" className="text-red-700">{error}</p>}
    {!ready ? <p role="status">جارٍ التحقق من الجلسة…</p> : !isAdmin ? (
      <form onSubmit={signIn} className="grid max-w-md gap-4">
        <label>البريد الإلكتروني<input dir="ltr" name="email" type="email" autoComplete="username" className="block w-full rounded border p-2" required /></label>
        <label>كلمة المرور<input dir="ltr" name="password" type="password" autoComplete="current-password" className="block w-full rounded border p-2" required /></label>
        <button disabled={busy} className="rounded bg-slate-900 px-4 py-2 text-white">دخول المسؤول</button>
      </form>
    ) : <>
      <nav aria-label="أقسام الإدارة" className="flex flex-wrap gap-3">
        <button aria-pressed={view === 'requests'} onClick={() => { setPage(0); setView('requests'); }} className="rounded border px-3 py-1">الطلبات</button>
        <button aria-pressed={isAppointments} onClick={() => { setPage(0); setView('appointments'); }} className="rounded border px-3 py-1">المواعيد والمعاينات</button>
        <button aria-pressed={view === 'articles'} onClick={() => setView('articles')} className="rounded border px-3 py-1">المقالات المنشورة</button>
        <button aria-pressed={view === 'projects'} onClick={() => setView('projects')} className="rounded border px-3 py-1">المشاريع العقارية</button>
        <button aria-pressed={view === 'properties'} onClick={() => setView('properties')} className="rounded border px-3 py-1">العقارات</button>
        <button aria-pressed={view === 'construction_projects'} onClick={() => setView('construction_projects')} className="rounded border px-3 py-1">مشاريع الإنشاءات</button>
        <button aria-pressed={view === 'hvac_services'} onClick={() => setView('hvac_services')} className="rounded border px-3 py-1">خدمات التكييف</button>
        <button aria-pressed={view === 'media'} onClick={() => setView('media')} className="rounded border px-3 py-1">مكتبة الوسائط</button>
        <button aria-pressed={view === 'sector_sections'} onClick={() => setView('sector_sections')} className="rounded border px-3 py-1">محتوى القطاعات</button>
      </nav>
      <div className="flex gap-3">
        <button onClick={() => setRefresh((value) => value + 1)} disabled={busy} className="rounded border px-3 py-1">تحديث</button>
        <button onClick={async () => {
          const { error: logoutError } = await client.auth.signOut({ scope: 'local' });
          if (logoutError) setError('تعذر تسجيل الخروج. حاول مرة أخرى.');
          else setPage(0);
        }} className="rounded border px-3 py-1">خروج</button>
      </div>
      {view === 'sector_sections' ? <SupabaseSectorSections /> : view === 'media' ? <CMSMediaLibrary language="ar" /> : view !== 'requests' && view !== 'appointments' ? <SupabaseArticleEditor key={view} client={client} collection={view === 'articles' ? 'blog_posts' : view} /> : <>
      {busy ? <p role="status">جارٍ تحميل الطلبات…</p> : !error && rows.length === 0 && <p>لا توجد طلبات في هذه الصفحة.</p>}
      {rows.map((row) => <article key={row.id} className="space-y-2 rounded-lg border p-4">
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
    </>}
  </main>;
}
