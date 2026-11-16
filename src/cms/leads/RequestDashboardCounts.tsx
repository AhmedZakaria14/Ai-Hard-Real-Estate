import { useEffect, useState } from 'react';
import { hardAdminClient } from '../../lib/db/hardAdminClient';
import type { Language } from '../../types';

export function RequestDashboardCounts({ language }: { language: Language }) {
  const [result, setResult] = useState<{ open: number; fresh: number } | 'loading' | 'error'>('loading');
  const ar = language === 'ar';

  useEffect(() => {
    const controller = new AbortController();
    const query = () => hardAdminClient.from('hard_form_submissions')
      .select('id', { count: 'exact', head: true }).is('archived_at', null)
      .neq('form_type', 'newsletter_signup');
    async function load() {
      try {
        const [open, fresh] = await Promise.all([
          query().abortSignal(controller.signal),
          query().eq('status', 'new').abortSignal(controller.signal),
        ]);
        if (open.error || fresh.error || open.count == null || fresh.count == null) throw new Error('Missing request totals');
        if (!controller.signal.aborted) setResult({ open: open.count, fresh: fresh.count });
      } catch {
        if (!controller.signal.aborted) setResult('error');
      }
    }
    void load();
    return () => controller.abort();
  }, []);

  if (result === 'loading') return <p role="status">{ar ? 'جاري تحميل أعداد الطلبات…' : 'Loading request totals…'}</p>;
  if (result === 'error') return <p role="alert">{ar ? 'تعذر تحميل أعداد الطلبات.' : 'Could not load request totals.'}</p>;
  return <dl className="grid grid-cols-2 gap-3">
    <div className="rounded-xl border bg-white p-4"><dt>{ar ? 'الطلبات غير المؤرشفة' : 'Unarchived requests'}</dt><dd className="text-xl font-bold">{result.open}</dd></div>
    <div className="rounded-xl border bg-white p-4"><dt>{ar ? 'الطلبات الجديدة' : 'New requests'}</dt><dd className="text-xl font-bold">{result.fresh}</dd></div>
  </dl>;
}
