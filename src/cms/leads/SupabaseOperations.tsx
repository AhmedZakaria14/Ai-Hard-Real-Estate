import { Bell, BarChart3, CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { hardAdminClient } from '../../lib/db/hardAdminClient';

import { readRequestMetrics, type RequestMetrics } from '../../lib/db/hardRequestMetrics';
type InboxEvent = { submission_id: string; tracking_code: string; sector: string; form_type: string; occurred_at: string; seen_at: string | null };
const labels: Record<keyof RequestMetrics, string> = {
  requests: 'إجمالي الطلبات', unarchived: 'الطلبات غير المؤرشفة', pending: 'طلبات جديدة مفتوحة', appointments: 'طلبات المواعيد غير المؤرشفة',
  archived: 'الطلبات المؤرشفة', subscribers: 'الاشتراكات',
};

export default function SupabaseOperations({ section, refresh }: { section: 'reports' | 'notifications'; refresh: number }) {
  const [days, setDays] = useState(30);
  const [report, setReport] = useState<RequestMetrics | null>(null);
  const [events, setEvents] = useState<InboxEvent[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const pageSize = 25;

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    async function load() {
      try {
        if (section === 'reports') {
          const data = await readRequestMetrics(days, controller.signal);
          if (!controller.signal.aborted) setReport(data);
        } else {
          const { data, error: queryError } = await hardAdminClient.from('hard_operation_events')
            .select('submission_id,tracking_code,sector,form_type,occurred_at,seen_at')
            .order('occurred_at', { ascending: false }).order('submission_id')
            .range(page * pageSize, (page + 1) * pageSize - 1).abortSignal(controller.signal);
          if (queryError) throw queryError;
          if (!controller.signal.aborted) setEvents(data ?? []);
        }
      } catch {
        if (!controller.signal.aborted) setError('تعذر تحميل البيانات.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [section, days, page, refresh]);

  async function acknowledge(id: string) {
    setSaving(true);
    setError('');
    try {
      const { data, error: updateError } = await hardAdminClient.from('hard_operation_events')
        .update({ seen_at: new Date().toISOString() }).eq('submission_id', id).select('seen_at').single();
      if (updateError) throw updateError;
      setEvents((previous) => previous.map((event) => event.submission_id === id ? { ...event, seen_at: data.seen_at } : event));
    } catch {
      setError('تعذر تحديث الإشعار.');
    } finally {
      setSaving(false);
    }
  }

  return <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-7">
    <h2 className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-slate-900">{section === 'reports' ? <BarChart3 className="h-5 w-5 text-blue-600" /> : <Bell className="h-5 w-5 text-blue-600" />}{section === 'reports' ? 'تقارير الطلبات' : 'إشعارات لوحة الإدارة'}</h2>
    {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
    {loading && <p role="status">جارٍ التحميل…</p>}
    {section === 'reports' ? <>
      <label>الفترة <select className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 outline-none" value={days} onChange={(e) => setDays(Number(e.target.value))}>
        {[30, 90, 365].map((value) => <option key={value} value={value}>{value} يومًا</option>)}
      </select></label>
      {!loading && !error && report && <dl className="grid gap-3 sm:grid-cols-3">
        {(Object.keys(labels) as (keyof RequestMetrics)[]).map((key) => <div key={key} className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/70 to-white p-5">
          <dt className="text-xs font-semibold text-slate-500">{labels[key]}</dt><dd className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">{report[key]}</dd>
        </div>)}
      </dl>}
    </> : !loading && <>
      {!error && !events.length && <p>لا توجد إشعارات في هذه الصفحة.</p>}
      <ul className="space-y-3">{events.map((event) => <li className="space-y-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs" key={event.submission_id}>
        <p><bdi>{event.tracking_code} · {event.sector} · {event.form_type}</bdi></p>
        <p>{new Date(event.occurred_at).toLocaleString('ar-SA')}</p>
        {event.seen_at ? <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5" />تمت القراءة</span> :
          <button type="button" disabled={saving} onClick={() => void acknowledge(event.submission_id)} className="rounded-xl bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100 disabled:opacity-40">تحديد كمقروء</button>}
      </li>)}</ul>
      <nav className="flex gap-3 border-t border-slate-100 pt-4" aria-label="صفحات الإشعارات">
        <button className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold disabled:opacity-40" disabled={loading || !page || saving} onClick={() => setPage((value) => value - 1)}>السابق</button>
        <button className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold disabled:opacity-40" disabled={loading || events.length < pageSize || saving} onClick={() => setPage((value) => value + 1)}>التالي</button>
      </nav>
    </>}
  </section>;
}
