import { useEffect, useState, type FormEvent } from 'react';
import { createClient, type Session } from '@supabase/supabase-js';

import SupabaseArticleEditor from '../catalog/SupabaseArticleEditor';
import { hardSupabaseUrl, hardPublishableKey } from '../../lib/db/hardCatalog';

const client = createClient(
  hardSupabaseUrl,
  hardPublishableKey,
  { auth: { storageKey: 'hard-admin-supabase-session' } },
);
const pageSize = 25;
const statusLabels = { new: 'جديد', contacted: 'تم التواصل', closed: 'مغلق' };

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
  const [view, setView] = useState<'requests' | 'articles'>('requests');
  const [page, setPage] = useState(0);
  const [refresh, setRefresh] = useState(0);
  const isAdmin = session?.user.app_metadata.hard_role === 'superadmin';

  useEffect(() => {
    const { data: { subscription } } = client.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      setRows([]);
      return;
    }
    const controller = new AbortController();
    setBusy(true);
    setError('');
    setRows([]);
    const load = async () => {
      try {
        const { data, error: queryError } = await client.from('hard_form_submissions')
          .select('id,tracking_code,sector,form_type,received_at,payload,status,status_history')
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
  }, [isAdmin, page, refresh]);

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
      <nav aria-label="أقسام الإدارة" className="flex gap-3">
        <button aria-pressed={view === 'requests'} onClick={() => setView('requests')} className="rounded border px-3 py-1">الطلبات</button>
        <button aria-pressed={view === 'articles'} onClick={() => setView('articles')} className="rounded border px-3 py-1">المقالات المنشورة</button>
      </nav>
      <div className="flex gap-3">
        <button onClick={() => setRefresh((value) => value + 1)} disabled={busy} className="rounded border px-3 py-1">تحديث</button>
        <button onClick={async () => {
          const { error: logoutError } = await client.auth.signOut({ scope: 'local' });
          if (logoutError) setError('تعذر تسجيل الخروج. حاول مرة أخرى.');
          else setPage(0);
        }} className="rounded border px-3 py-1">خروج</button>
      </div>
      {view === 'articles' ? <SupabaseArticleEditor client={client} /> : <>
      {busy ? <p role="status">جارٍ تحميل الطلبات…</p> : !error && rows.length === 0 && <p>لا توجد طلبات في هذه الصفحة.</p>}
      {rows.map((row) => <article key={row.id} className="space-y-2 rounded-lg border p-4">
        <h2 className="font-bold">{String(row.payload.name || row.tracking_code)}</h2>
        <p><bdi>{row.tracking_code} · {row.sector} · {row.form_type}</bdi></p>
        <p><bdi>{new Date(row.received_at).toLocaleString('ar-SA')} · {String(row.payload.email || '')} · {String(row.payload.phone || '')}</bdi></p>
        {typeof row.payload.message === 'string' && <p className="whitespace-pre-wrap">{row.payload.message}</p>}
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
