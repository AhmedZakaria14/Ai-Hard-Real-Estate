import { useEffect, useState, type FormEvent } from 'react';
import { hardAdminClient, toHardAdmin } from '../lib/db/hardAdminClient';

export default function CMSPasswordReset() {
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const invitation = new URLSearchParams(window.location.search).get('flow') === 'invite';
    const { data: { subscription } } = hardAdminClient.auth.onAuthStateChange((event, session) => {
      if (session && toHardAdmin(session.user) && (event === 'PASSWORD_RECOVERY' || (invitation && event === 'SIGNED_IN'))) setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ready || busy) return;
    const form = new FormData(event.currentTarget);
    const password = String(form.get('password'));
    if (password !== form.get('confirm')) {
      setMessage('كلمتا المرور غير متطابقتين.');
      return;
    }
    setBusy(true);
    setMessage('');
    try {
      const { error } = await hardAdminClient.auth.updateUser({ password });
      if (error) throw error;
      setReady(false);
      setDone(true);
      await hardAdminClient.auth.signOut({ scope: 'local' });
    } catch {
      setMessage('تعذر تغيير كلمة المرور. اطلب رابطًا جديدًا وحاول مرة أخرى.');
    } finally {
      setBusy(false);
    }
  }

  return <main dir="rtl" className="mx-auto max-w-lg space-y-4 p-6">
    <h1 className="text-xl font-bold">استعادة كلمة مرور إدارة هارد</h1>
    {message && <p role="alert">{message}</p>}
    {done ? <p>تم تغيير كلمة المرور.</p> : ready ? <form onSubmit={save} className="grid gap-3">
      <label>كلمة المرور الجديدة<input className="block w-full rounded border p-2" type="password" name="password" minLength={12} autoComplete="new-password" required /></label>
      <label>تأكيد كلمة المرور<input className="block w-full rounded border p-2" type="password" name="confirm" minLength={12} autoComplete="new-password" required /></label>
      <button disabled={busy} className="rounded bg-slate-900 p-2 text-white">حفظ كلمة المرور</button>
    </form> : <p>افتح الرابط الصالح من رسالة استعادة كلمة المرور.</p>}
    <a className="underline" href="/realestate/admin">العودة إلى تسجيل الدخول</a>
  </main>;
}
