import { useEffect, useState } from 'react';
import { hardAdminClient } from '../../lib/db/hardAdminClient';

type Report = { requests: number; pending: number; appointments: number; archived: number; subscribers: number };
type InboxEvent = { submission_id: string; tracking_code: string; sector: string; form_type: string; occurred_at: string; seen_at: string | null };
const labels: Record<keyof Report, string> = {
  requests: 'إجمالي الطلبات', pending: 'طلبات جديدة مفتوحة', appointments: 'طلبات المواعيد',
  archived: 'الطلبات المؤرشفة', subscribers: 'الاشتراكات',
};

export default function SupabaseOperations({ section, refresh }: { section: 'reports' | 'notifications'; refresh: number }) {
  const [days, setDays] = useState(30);
  const [report, setReport] = useState<Report | null>(null);
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
          const { data, error: queryError } = await hardAdminClient.rpc('hard_operations_report', { p_days: days }).abortSignal(controller.signal);
          if (queryError) throw queryError;
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
        if (!controller.signal.aborted) setError('تعذر تحميل البيانات من Supabase.');
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

  return <section className="space-y-4">
    <h2 className="text-xl font-bold">{section === 'reports' ? 'تقارير الطلبات' : 'إشعارات لوحة الإدارة'}</h2>
    {error && <p role="alert" className="text-red-700">{error}</p>}
    {loading && <p role="status">جارٍ التحميل…</p>}
    {section === 'reports' ? <>
      <label>الفترة <select className="rounded border p-1" value={days} onChange={(e) => setDays(Number(e.target.value))}>
        {[30, 90, 365].map((value) => <option key={value} value={value}>{value} يومًا</option>)}
      </select></label>
      {!loading && !error && report && <dl className="grid gap-3 sm:grid-cols-3">
        {(Object.keys(labels) as (keyof Report)[]).map((key) => <div key={key} className="rounded border p-4">
          <dt>{labels[key]}</dt><dd className="text-xl font-bold">{report[key]}</dd>
        </div>)}
      </dl>}
    </> : !loading && <>
      {!error && !events.length && <p>لا توجد إشعارات في هذه الصفحة.</p>}
      <ul className="space-y-3">{events.map((event) => <li className="rounded border p-3" key={event.submission_id}>
        <p><bdi>{event.tracking_code} · {event.sector} · {event.form_type}</bdi></p>
        <p>{new Date(event.occurred_at).toLocaleString('ar-SA')}</p>
        {event.seen_at ? <span>تمت القراءة</span> :
          <button type="button" disabled={saving} onClick={() => void acknowledge(event.submission_id)} className="underline">تحديد كمقروء</button>}
      </li>)}</ul>
      <nav className="flex gap-3" aria-label="صفحات الإشعارات">
        <button disabled={!page || saving} onClick={() => setPage((value) => value - 1)}>السابق</button>
        <button disabled={events.length < pageSize || saving} onClick={() => setPage((value) => value + 1)}>التالي</button>
      </nav>
    </>}
  </section>;
}
