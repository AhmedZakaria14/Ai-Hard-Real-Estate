import { useEffect, useState } from 'react';
import { readRequestMetrics, type RequestMetrics } from '../../lib/db/hardRequestMetrics';
import type { Language } from '../../types';

const cards = [
  { key: 'unarchived', ar: 'الطلبات غير المؤرشفة', en: 'Unarchived requests' },
  { key: 'pending', ar: 'الطلبات الجديدة', en: 'New requests' },
  { key: 'appointments', ar: 'طلبات المواعيد غير المؤرشفة', en: 'Unarchived appointment requests' },
  { key: 'archived', ar: 'الطلبات المؤرشفة', en: 'Archived requests' },
] as const;

export function RequestDashboardCounts({ language }: { language: Language }) {
  const [result, setResult] = useState<RequestMetrics | 'loading' | 'error'>('loading');
  const [revision, setRevision] = useState(0);
  const ar = language === 'ar';

  useEffect(() => {
    const onFocus = () => setRevision((value) => value + 1);
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setResult('loading');
    void readRequestMetrics(0, controller.signal).then((data) => {
      if (!controller.signal.aborted) setResult(data);
    }).catch(() => {
      if (!controller.signal.aborted) setResult('error');
    });
    return () => controller.abort();
  }, [revision]);

  return <section className="space-y-2">
    <button className="rounded border bg-white px-3 py-2 text-sm" type="button" disabled={result === 'loading'}
      onClick={() => setRevision((value) => value + 1)}>{ar ? 'تحديث أعداد الطلبات' : 'Refresh request totals'}</button>
    {result === 'loading' ? <p role="status">{ar ? 'جاري تحميل أعداد الطلبات…' : 'Loading request totals…'}</p>
      : result === 'error' ? <p role="alert">{ar ? 'تعذر تحميل أعداد الطلبات.' : 'Could not load request totals.'}</p>
      : <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map((card) => <div key={card.key} className="rounded-xl border bg-white p-4">
          <dt>{card[language]}</dt><dd className="text-xl font-bold">{result[card.key]}</dd>
        </div>)}
      </dl>}
  </section>;
}
